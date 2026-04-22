// routes/posttest.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ─────────────────────────────────────────
// STATIC ROUTES FIRST
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
    const result = await pool.query(
      `SELECT course_name FROM student_admissions WHERE email_id = (
        SELECT email FROM users WHERE id = $1
      ) LIMIT 1`,
      [decoded.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'No course found for this student' });
    res.json({ course_name: result.rows[0].course_name });
  } catch (err) {
    console.error(err);
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
    const studentRes = await pool.query(
      `SELECT sa.id FROM student_admissions sa
       INNER JOIN users u ON u.email = sa.email_id
       WHERE u.id = $1 LIMIT 1`,
      [decoded.id]
    );
    if (studentRes.rows.length === 0) return res.json({ attempted: false });
    const admissionId = studentRes.rows[0].id;
    const result = await pool.query(
      `SELECT score, total, passed FROM posttest_attempts
       WHERE student_id = $1 AND course_name = $2
       ORDER BY submitted_at DESC LIMIT 1`,
      [admissionId, course_name]
    );
    if (result.rows.length === 0) return res.json({ attempted: false });
    res.json({ attempted: true, ...result.rows[0] });
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
    const userId = decoded.id;
    const { course_name, answers, time_taken } = req.body;
    const studentRes = await pool.query(
      `SELECT sa.id FROM student_admissions sa
       INNER JOIN users u ON u.email = sa.email_id
       WHERE u.id = $1 LIMIT 1`,
      [userId]
    );
    if (studentRes.rows.length === 0)
      return res.status(404).json({ error: 'Student admission record not found' });
    const admissionId = studentRes.rows[0].id;
    const result = await pool.query(
      `SELECT id, correct_ans FROM posttest_questions WHERE course_name = $1`,
      [course_name]
    );
    let score = 0;
    result.rows.forEach(q => {
      if (answers[q.id]?.toLowerCase() === q.correct_ans?.toLowerCase()) score++;
    });
    const total = result.rows.length;
    const configRes = await pool.query(
      `SELECT pass_percent FROM posttest_config WHERE course_name = $1`,
      [course_name]
    );
    const passPercent = configRes.rows[0]?.pass_percent || 50;
    const passed = total > 0 ? (score / total) * 100 >= passPercent : false;
    await pool.query(
      `INSERT INTO posttest_attempts
        (student_id, course_name, score, total, passed, time_taken)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [admissionId, course_name, score, total, passed, time_taken || 0]
    );
    res.json({ score, total, passed, pass_percent: passPercent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit posttest' });
  }
});

// DELETE /api/admin/posttest/student/reset-attempt
router.delete('/student/reset-attempt', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');
    const roleName = decoded.roleName;
    if (roleName !== 'Trainer' && roleName !== 'Admin')
      return res.status(403).json({ error: 'Only trainers can reset attempts' });
    const { student_admission_id, course_name } = req.body;
    await pool.query(
      `DELETE FROM posttest_attempts WHERE student_id = $1 AND course_name = $2`,
      [student_admission_id, course_name]
    );
    res.json({ success: true, message: 'Attempt reset successfully' });
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
  const { qId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM posttest_questions WHERE id = $1`, [qId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Question not found' });
    res.json({ question: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// PUT /api/admin/posttest/questions/:qId
router.put('/questions/:qId', async (req, res) => {
  const { qId } = req.params;
  const { question, option_a, option_b, option_c, option_d, correct_ans } = req.body;
  try {
    const result = await pool.query(
      `UPDATE posttest_questions
       SET question=$1, option_a=$2, option_b=$3, option_c=$4, option_d=$5, correct_ans=$6
       WHERE id=$7 RETURNING *`,
      [question, option_a, option_b, option_c, option_d, correct_ans, qId]
    );
    res.json({ question: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// DELETE /api/admin/posttest/questions/:qId
router.delete('/questions/:qId', async (req, res) => {
  const { qId } = req.params;
  try {
    await pool.query(`DELETE FROM posttest_questions WHERE id = $1`, [qId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// ─────────────────────────────────────────
// DYNAMIC :courseName ROUTES LAST
// ─────────────────────────────────────────

// GET /api/admin/posttest/:courseName/questions
// GET /api/admin/posttest/:courseName/questions
router.get('/:courseName/questions', async (req, res) => {
  const { courseName } = req.params;
  const authHeader = req.headers.authorization;
  try {
    let trainerId = null;

    if (authHeader) {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(
        authHeader.split(' ')[1],
        process.env.JWT_SECRET || 'mysecret'
      );
      // ── Only filter by trainer_id if the user IS a trainer ──
      if (
        decoded.roleName === 'Trainer' // ← only trainers get filtered
      ) {
        trainerId = decoded.id;
      }
      // Admin, Student, and all others see ALL questions for the course
    }

    let result;
    if (trainerId) {
      result = await pool.query(
        `SELECT * FROM posttest_questions
         WHERE course_name = $1 AND trainer_id = $2 ORDER BY id`,
        [courseName, trainerId]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM posttest_questions
         WHERE course_name = $1 ORDER BY id`,
        [courseName]
      );
    }

    res.json({ questions: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// POST /api/admin/posttest/:courseName/questions
router.post('/:courseName/questions', async (req, res) => {
  const { courseName } = req.params;
  const { question, option_a, option_b, option_c, option_d, correct_ans } = req.body;
  const authHeader = req.headers.authorization;
  try {
    let trainerId = null;
    if (authHeader) {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(
        authHeader.split(' ')[1],
        process.env.JWT_SECRET || 'mysecret'
      );
      if (decoded.roleName !== 'Admin' && decoded.roleName !== 'Super Admin') {
        trainerId = decoded.id;
      }
    }
    const result = await pool.query(
      `INSERT INTO posttest_questions
        (course_name, question, option_a, option_b, option_c, option_d, correct_ans, trainer_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [courseName, question, option_a, option_b, option_c, option_d, correct_ans, trainerId]
    );
    res.json({ question: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// GET /api/admin/posttest/:courseName/attempts
router.get('/:courseName/attempts', async (req, res) => {
  const { courseName } = req.params;
  try {
    const result = await pool.query(
      `SELECT pa.id AS attempt_id, sa.id AS student_admission_id,
              sa.full_name AS student_name, u.email,
              pa.score, pa.total, pa.passed, pa.time_taken, pa.submitted_at
       FROM posttest_attempts pa
       INNER JOIN student_admissions sa ON sa.id = pa.student_id
       INNER JOIN users u ON u.email = sa.email_id
       WHERE pa.course_name = $1
       ORDER BY pa.submitted_at DESC`,
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
  const { courseName } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM posttest_config WHERE course_name = $1`, [courseName]
    );
    res.json({ config: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// POST /api/admin/posttest/:courseName/config
router.post('/:courseName/config', async (req, res) => {
  const { courseName } = req.params;
  const { total_qs, pass_percent, time_limit } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO posttest_config (course_name, total_qs, pass_percent, time_limit)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (course_name)
       DO UPDATE SET total_qs=$2, pass_percent=$3, time_limit=$4
       RETURNING *`,
      [courseName, total_qs, pass_percent, time_limit]
    );
    res.json({ config: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save config' });
  }
});

module.exports = router;