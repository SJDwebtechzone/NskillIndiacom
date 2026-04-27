// routes/posttest.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ─────────────────────────────────────────
// STATIC ROUTES FIRST (order matters!)
// ─────────────────────────────────────────

// GET /api/admin/posttest/trainer/courses
router.get('/trainer/courses', async (req, res) => {
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
      result = await pool.query(
        `SELECT course_name, COUNT(*) AS student_count
         FROM student_admissions
         GROUP BY course_name ORDER BY course_name`
      );
    } else {
      result = await pool.query(
        `SELECT c.title AS course_name, COUNT(sa.id) AS student_count
         FROM courses c
         LEFT JOIN student_admissions sa ON sa.course_name = c.title
         WHERE c.trainer_id = $1
         GROUP BY c.title ORDER BY c.title`,
        [trainerId]
      );
    }
    res.json({ courses: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch trainer courses' });
  }
});

// GET /api/admin/posttest/courses
router.get('/courses', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT course_name, COUNT(*) as student_count
       FROM student_admissions
       GROUP BY course_name ORDER BY course_name`
    );
    res.json({ courses: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/admin/posttest/student/course
router.get('/student/course', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');

    // ← Get email from users table using decoded.id
    const userResult = await pool.query(
      `SELECT email FROM users WHERE id = $1 LIMIT 1`,
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const email = userResult.rows[0].email;
    console.log('Email from users table:', email);

    // Now find course using that email
    const result = await pool.query(
      `SELECT course_name FROM student_admissions WHERE LOWER(email_id) = LOWER($1) LIMIT 1`,
      [email]
    );

    console.log('DB result rows:', result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ course_name: result.rows[0].course_name });
  } catch (err) {
    console.error('student/course error:', err.message);
    res.status(500).json({ error: 'Failed to fetch student course' });
  }
});
// GET /api/admin/posttest/student/attempt-status
router.get('/student/attempt-status', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');
    const { course_name } = req.query;

    // Get email from users table
    const userResult = await pool.query(
      `SELECT email FROM users WHERE id = $1 LIMIT 1`,
      [decoded.id]
    );
    const email = userResult.rows[0]?.email;

    // Get student admission id
    const studentResult = await pool.query(
      `SELECT id FROM student_admissions WHERE LOWER(email_id) = LOWER($1) LIMIT 1`,
      [email]
    );
    const studentId = studentResult.rows[0]?.id;

    if (!studentId) {
      return res.json({ attempted: false, attempt: null });
    }

    const result = await pool.query(
      `SELECT * FROM finaltest_attempts WHERE student_id = $1 AND course_name = $2 ORDER BY submitted_at DESC LIMIT 1`,
      [studentId, course_name]
    );
    res.json({ attempted: result.rows.length > 0, attempt: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check attempt status' });
  }
});

// POST /api/admin/posttest/student/submit
router.post('/student/submit', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');
    const { course_name, answers, time_taken } = req.body;

    console.log('Answers received:', answers); // ← check this

    // Get email from users table
    const userResult = await pool.query(
      `SELECT email FROM users WHERE id = $1 LIMIT 1`,
      [decoded.id]
    );
    const email = userResult.rows[0]?.email;

    // Get student admission id
    const studentResult = await pool.query(
      `SELECT id FROM student_admissions WHERE LOWER(email_id) = LOWER($1) LIMIT 1`,
      [email]
    );
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found in admissions' });
    }
    const studentId = studentResult.rows[0].id;

    const qResult = await pool.query(
      `SELECT id, correct_ans FROM finaltest_questions WHERE course_name = $1`,
      [course_name]
    );
    const questions = qResult.rows;

    console.log('Questions from DB:', questions); // ← check this

    let score = 0;
    questions.forEach((q) => {
      const studentAnswer = answers[q.id] || answers[String(q.id)]; // ← fix: check both int and string key
      console.log(`Q${q.id}: student=${studentAnswer}, correct=${q.correct_ans}`);
      if (studentAnswer && studentAnswer.toLowerCase() === q.correct_ans.toLowerCase()) {
        score++;
      }
    });

    const total = questions.length;
    const configResult = await pool.query(
      `SELECT pass_percent FROM finaltest_config WHERE course_name = $1`,
      [course_name]
    );
    const passPercent = configResult.rows[0]?.pass_percent || 50;
    const passed = total > 0 && (score / total) * 100 >= passPercent;

    console.log(`Score: ${score}/${total}, Passed: ${passed}`);

    await pool.query(
      `INSERT INTO finaltest_attempts (student_id, course_name, score, total, passed, time_taken)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [studentId, course_name, score, total, passed, time_taken || 0]
    );
    res.json({ score, total, passed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit post-test' });
  }
});

// DELETE /api/admin/posttest/student/reset-attempt
router.delete('/student/reset-attempt', async (req, res) => {
  try {
    const { student_id, course_name } = req.body;
    await pool.query(
      `DELETE FROM finaltest_attempts WHERE student_id = $1 AND course_name = $2`,
      [student_id, course_name]
    );
    res.json({ message: 'Attempt reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset attempt' });
  }
});

// ─────────────────────────────────────────
// questions/:qId BEFORE /:courseName routes
// ─────────────────────────────────────────

// GET /api/admin/posttest/questions/:qId
router.get('/questions/:qId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM finaltest_questions WHERE id = $1`,
      [req.params.qId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Question not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// PUT /api/admin/posttest/questions/:qId
router.put('/questions/:qId', async (req, res) => {
  try {
    const { question, option_a, option_b, option_c, option_d, correct_ans } = req.body;
    await pool.query(
      `UPDATE finaltest_questions SET question=$1, option_a=$2, option_b=$3, option_c=$4, option_d=$5, correct_ans=$6 WHERE id=$7`,
      [question, option_a, option_b, option_c, option_d, correct_ans, req.params.qId]
    );
    res.json({ message: 'Question updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// DELETE /api/admin/posttest/questions/:qId
router.delete('/questions/:qId', async (req, res) => {
  try {
    await pool.query(`DELETE FROM finaltest_questions WHERE id = $1`, [req.params.qId]);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// ─────────────────────────────────────────
// DYNAMIC :courseName ROUTES LAST
// ─────────────────────────────────────────

// GET /api/admin/posttest/:courseName/questions
router.get('/:courseName/questions', async (req, res) => {
  try {
    const courseName = decodeURIComponent(req.params.courseName);
    const result = await pool.query(
      `SELECT * FROM finaltest_questions WHERE course_name = $1 ORDER BY created_at DESC`,
      [courseName]
    );
    res.json({ questions: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// POST /api/admin/posttest/:courseName/questions
router.post('/:courseName/questions', async (req, res) => {
  try {
    const courseName = decodeURIComponent(req.params.courseName);
    const { question, option_a, option_b, option_c, option_d, correct_ans, trainer_id } = req.body;
    await pool.query(
      `INSERT INTO finaltest_questions (course_name, question, option_a, option_b, option_c, option_d, correct_ans, trainer_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [courseName, question, option_a, option_b, option_c, option_d, correct_ans, trainer_id || null]
    );
    res.status(201).json({ message: 'Question added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// GET /api/admin/posttest/:courseName/attempts
router.get('/:courseName/attempts', async (req, res) => {
  try {
    const courseName = decodeURIComponent(req.params.courseName);
    const result = await pool.query(
      `SELECT fa.id, fa.student_id, fa.score, fa.total, fa.passed, fa.time_taken, fa.submitted_at,
              sa.full_name AS student_name, sa.email_id AS email
       FROM finaltest_attempts fa
       JOIN student_admissions sa ON sa.id = fa.student_id
       WHERE fa.course_name = $1
       ORDER BY fa.submitted_at DESC`,
      [courseName]
    );
    res.json({ attempts: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

// GET /api/admin/posttest/:courseName/config
router.get('/:courseName/config', async (req, res) => {
  try {
    const courseName = decodeURIComponent(req.params.courseName);
    const result = await pool.query(
      `SELECT * FROM finaltest_config WHERE course_name = $1`,
      [courseName]
    );
    res.json(result.rows[0] || { total_qs: 10, pass_percent: 50, time_limit: 600 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// POST /api/admin/posttest/:courseName/config
router.post('/:courseName/config', async (req, res) => {
  try {
    const courseName = decodeURIComponent(req.params.courseName);
    const { total_qs, pass_percent, time_limit } = req.body;
    await pool.query(
      `INSERT INTO finaltest_config (course_name, total_qs, pass_percent, time_limit)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (course_name) DO UPDATE SET total_qs=$2, pass_percent=$3, time_limit=$4`,
      [courseName, total_qs, pass_percent, time_limit]
    );
    res.json({ message: 'Config saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save config' });
  }
});

module.exports = router;
