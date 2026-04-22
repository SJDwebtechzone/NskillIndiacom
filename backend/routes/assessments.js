const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────
// HELPER — decode token
// ─────────────────────────────────────────
function decodeToken(authHeader) {
  const jwt = require('jsonwebtoken');
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, process.env.JWT_SECRET || 'mysecret');
}

// ─────────────────────────────────────────
// TRAINER ROUTES
// ─────────────────────────────────────────

// GET /api/assessments/trainer/courses
router.get('/trainer/courses', authMiddleware, async (req, res) => {
  try {
    const decoded = decodeToken(req.headers.authorization);
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
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/assessments/trainer/:courseName
router.get('/trainer/:courseName', authMiddleware, async (req, res) => {
  const { courseName } = req.params;
  try {
    const decoded = decodeToken(req.headers.authorization);
    const result = await pool.query(
      `SELECT * FROM assessments
       WHERE course_name = $1 AND trainer_id = $2
       ORDER BY due_date ASC`,
      [courseName, decoded.id]
    );
    res.json({ assessments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// POST /api/assessments/trainer/:courseName
router.post('/trainer/:courseName', authMiddleware, async (req, res) => {
  const { courseName } = req.params;
  const { title, description, due_date } = req.body;
  try {
    const decoded = decodeToken(req.headers.authorization);
    const result = await pool.query(
      `INSERT INTO assessments (course_name, trainer_id, title, description, due_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [courseName, decoded.id, title, description, due_date]
    );
    res.json({ assessment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// PUT /api/assessments/trainer/:assessmentId
router.put('/trainer/:assessmentId', authMiddleware, async (req, res) => {
  const { assessmentId } = req.params;
  const { title, description, due_date } = req.body;
  try {
    const result = await pool.query(
      `UPDATE assessments SET title=$1, description=$2, due_date=$3
       WHERE id=$4 RETURNING *`,
      [title, description, due_date, assessmentId]
    );
    res.json({ assessment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update assessment' });
  }
});

// DELETE /api/assessments/trainer/:assessmentId
router.delete('/trainer/:assessmentId', authMiddleware, async (req, res) => {
  const { assessmentId } = req.params;
  try {
    await pool.query(`DELETE FROM assessments WHERE id=$1`, [assessmentId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
});

// GET /api/assessments/trainer/:assessmentId/submissions
router.get('/trainer/:assessmentId/submissions', authMiddleware, async (req, res) => {
  const { assessmentId } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
         s.id, s.assessment_id, s.file_url, s.status,
         s.marks, s.remarks, s.submitted_at, s.verified_at,
         sa.id AS student_admission_id,
         sa.full_name AS student_name,
         sa.admission_number,
         u.email
       FROM assessment_submissions s
       INNER JOIN student_admissions sa ON sa.id = s.student_id
       INNER JOIN users u ON u.email = sa.email_id
       WHERE s.assessment_id = $1
       ORDER BY s.submitted_at DESC`,
      [assessmentId]
    );
    res.json({ submissions: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// PUT /api/assessments/trainer/submissions/:submissionId/verify
router.put('/trainer/submissions/:submissionId/verify', authMiddleware, async (req, res) => {
  const { submissionId } = req.params;
  const { marks, remarks } = req.body;
  try {
    const result = await pool.query(
      `UPDATE assessment_submissions
       SET marks=$1, remarks=$2, status='verified', verified_at=NOW()
       WHERE id=$3 RETURNING *`,
      [marks, remarks, submissionId]
    );
    res.json({ submission: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify submission' });
  }
});

// ─────────────────────────────────────────
// STUDENT ROUTES
// ─────────────────────────────────────────

// GET /api/assessments/student
router.get('/student', authMiddleware, async (req, res) => {
  try {
    const decoded = decodeToken(req.headers.authorization);

    // Get student course
    const courseRes = await pool.query(
      `SELECT sa.id, sa.course_name FROM student_admissions sa
       INNER JOIN users u ON u.email = sa.email_id
       WHERE u.id = $1 LIMIT 1`,
      [decoded.id]
    );
    if (courseRes.rows.length === 0)
      return res.status(404).json({ error: 'Student not found' });

    const { id: admissionId, course_name } = courseRes.rows[0];

    // Get assessments for their course with submission status
    const result = await pool.query(
      `SELECT 
         a.id, a.title, a.description, a.due_date, a.course_name,
         s.id AS submission_id, s.file_url, s.status,
         s.marks, s.remarks, s.submitted_at, s.verified_at
       FROM assessments a
       LEFT JOIN assessment_submissions s 
         ON s.assessment_id = a.id AND s.student_id = $1
       WHERE a.course_name = $2
       ORDER BY a.due_date ASC`,
      [admissionId, course_name]
    );
    res.json({ assessments: result.rows, admission_id: admissionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// POST /api/assessments/student/:assessmentId/submit
router.post('/student/:assessmentId/submit', authMiddleware, async (req, res) => {
  const { assessmentId } = req.params;
  const { file_url } = req.body;
  try {
    const decoded = decodeToken(req.headers.authorization);

    // Get admission id
    const studentRes = await pool.query(
      `SELECT sa.id FROM student_admissions sa
       INNER JOIN users u ON u.email = sa.email_id
       WHERE u.id = $1 LIMIT 1`,
      [decoded.id]
    );
    if (studentRes.rows.length === 0)
      return res.status(404).json({ error: 'Student not found' });

    const admissionId = studentRes.rows[0].id;

    // Check if already submitted
    const existing = await pool.query(
      `SELECT id FROM assessment_submissions
       WHERE assessment_id=$1 AND student_id=$2`,
      [assessmentId, admissionId]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing submission
      result = await pool.query(
        `UPDATE assessment_submissions
         SET file_url=$1, status='submitted', submitted_at=NOW()
         WHERE assessment_id=$2 AND student_id=$3 RETURNING *`,
        [file_url, assessmentId, admissionId]
      );
    } else {
      // New submission
      result = await pool.query(
        `INSERT INTO assessment_submissions
           (assessment_id, student_id, file_url, status, submitted_at)
         VALUES ($1, $2, $3, 'submitted', NOW()) RETURNING *`,
        [assessmentId, admissionId, file_url]
      );
    }
    res.json({ submission: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit assessment' });
  }
});

module.exports = router;