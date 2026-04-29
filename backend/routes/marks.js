// routes/marks.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ── GET students list for trainer ─────────────────────────────────────────────
router.get('/trainer/students', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');
    const trainerId = decoded.id;
    const roleName = decoded.roleName;

  

    let result;
    if (roleName === 'Admin' || roleName === 'Super Admin') {
      // Admin sees all students
      result = await pool.query(
        `SELECT id, full_name, email_id, course_name 
         FROM student_admissions ORDER BY full_name`
      );
    } else {
      // Trainer sees only their course students
      const coursesResult = await pool.query(
        `SELECT title FROM courses WHERE trainer_id = $1`,
        [trainerId]
      );


      if (coursesResult.rows.length === 0) {
        return res.json({ students: [] });
      }

      const courses = coursesResult.rows.map(r => r.title);
      result = await pool.query(
        `SELECT id, full_name, email_id, course_name 
         FROM student_admissions 
         WHERE course_name = ANY($1)
         ORDER BY full_name`,
        [courses]
      );
    }

    res.json({ students: result.rows });
  } catch (err) {
    console.error('trainer/students error:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// ── GET marks for a specific student ─────────────────────────────────────────
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1. Get student info
    const studentResult = await pool.query(
      `SELECT id, full_name, email_id, course_name FROM student_admissions WHERE id = $1`,
      [studentId]
    );
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const student = studentResult.rows[0];
    const courseName = student.course_name;

    // 2. Pre-test marks (out of 10)
    const pretestResult = await pool.query(
      `SELECT score, total FROM pretest_attempts 
       WHERE student_id = $1 AND course_name = $2 
       ORDER BY submitted_at DESC LIMIT 1`,
      [studentId, courseName]
    );
    let pretestMarks = 0;
    if (pretestResult.rows.length > 0) {
      const { score, total } = pretestResult.rows[0];
      pretestMarks = total > 0 ? Math.round((score / total) * 10) : 0;
    }

    // 3. Post-test marks (out of 15)
    const posttestResult = await pool.query(
      `SELECT score, total FROM finaltest_attempts 
       WHERE student_id = $1 AND course_name = $2 
       ORDER BY submitted_at DESC LIMIT 1`,
      [studentId, courseName]
    );
    let posttestMarks = 0;
    if (posttestResult.rows.length > 0) {
      const { score, total } = posttestResult.rows[0];
      posttestMarks = total > 0 ? Math.round((score / total) * 15) : 0;
    }

    // 4. Weekly test marks (out of 20)
    const weeklyResult = await pool.query(
      `SELECT score, total FROM posttest_attempts 
       WHERE student_id = $1 AND course_name = $2 
       ORDER BY submitted_at DESC LIMIT 1`,
      [studentId, courseName]
    );
    let weeklyMarks = 0;
    if (weeklyResult.rows.length > 0) {
      const { score, total } = weeklyResult.rows[0];
      weeklyMarks = total > 0 ? Math.round((score / total) * 20) : 0;
    }

    // 5. Attendance marks (out of 5)
    const attendanceResult = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE status = 'Present') as present_count,
         COUNT(*) FILTER (WHERE status IS NOT NULL AND status != '') as total_count
       FROM attendance WHERE admission_id = $1`,
      [studentId]
    );
    let attendanceMarks = 0;
    if (attendanceResult.rows.length > 0) {
      const { present_count, total_count } = attendanceResult.rows[0];
      const percent = total_count > 0 ? (present_count / total_count) * 100 : 0;
      attendanceMarks = Math.round((percent / 100) * 5);
    }

    // 6. Practical marks (out of 40)
    const practicalResult = await pool.query(
      `SELECT COALESCE(SUM(marks), 0) as total_marks
       FROM practical_submissions 
       WHERE student_id = $1 AND status = 'verified'`,
      [studentId]
    );
    const rawPractical = parseFloat(practicalResult.rows[0]?.total_marks || 0);
    const practicalMarks = Math.min(rawPractical, 40);

    // 7. Assessment marks (out of 10)
    const assessmentResult = await pool.query(
      `SELECT COALESCE(SUM(marks), 0) as total_marks
       FROM assessment_submissions 
       WHERE student_id = $1 AND status = 'verified'`,
      [studentId]
    );
    const rawAssessment = parseFloat(assessmentResult.rows[0]?.total_marks || 0);
    const assessmentMarks = Math.min(rawAssessment, 10);

    // 8. Total and grade
    const total = pretestMarks + posttestMarks + weeklyMarks + attendanceMarks + practicalMarks + assessmentMarks;
    let grade = 'F';
    if (total >= 90) grade = 'A+';
    else if (total >= 80) grade = 'A';
    else if (total >= 70) grade = 'B';
    else if (total >= 60) grade = 'C';
    else if (total >= 50) grade = 'D';

    // 9. Save/update marks in student_marks table
    await pool.query(
      `INSERT INTO student_marks 
        (student_id, course_name, pretest_marks, posttest_marks, weekly_test_marks, 
         attendance_marks, practical_marks, assessment_marks, total_marks, grade)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (student_id, course_name) DO UPDATE SET
         pretest_marks=$3, posttest_marks=$4, weekly_test_marks=$5,
         attendance_marks=$6, practical_marks=$7, assessment_marks=$8,
         total_marks=$9, grade=$10, updated_at=NOW()`,
      [studentId, courseName, pretestMarks, posttestMarks, weeklyMarks,
       attendanceMarks, practicalMarks, assessmentMarks, total, grade]
    );

    res.json({
      student,
      marks: {
        pretest: { marks: pretestMarks, max: 10 },
        posttest: { marks: posttestMarks, max: 15 },
        weekly_test: { marks: weeklyMarks, max: 20 },
        attendance: { marks: attendanceMarks, max: 5 },
        practical: { marks: practicalMarks, max: 40 },
        assessment: { marks: assessmentMarks, max: 10 },
        total: { marks: total, max: 100 },
        grade,
        passed: total >= 50,
      }
    });
  } catch (err) {
    console.error('GET /marks/student/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET marks for logged in student ──────────────────────────────────────────
router.get('/my-marks', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');

    const userResult = await pool.query(
      `SELECT email FROM users WHERE id = $1 LIMIT 1`,
      [decoded.id]
    );
    const email = userResult.rows[0]?.email;

    const studentResult = await pool.query(
      `SELECT id FROM student_admissions WHERE LOWER(email_id) = LOWER($1) LIMIT 1`,
      [email]
    );
    const studentId = studentResult.rows[0]?.id;
    if (!studentId) return res.status(404).json({ error: 'Student not found' });

    const marksResult = await pool.query(
      `SELECT * FROM student_marks WHERE student_id = $1`,
      [studentId]
    );

    if (marksResult.rows.length === 0) {
      return res.json({ marks: null, message: 'Marks not published yet' });
    }

    res.json({ marks: marksResult.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch marks' });
  }
});

module.exports = router;
