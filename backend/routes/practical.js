const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware');

function decodeToken(authHeader) {
  const jwt = require('jsonwebtoken');
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, process.env.JWT_SECRET || 'mysecret');
}

// ─────────────────────────────────────────
// TRAINER ROUTES
// ─────────────────────────────────────────

// GET /api/practical/trainer/courses
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

// GET /api/practical/trainer/:courseName/tasks
router.get('/trainer/:courseName/tasks', authMiddleware, async (req, res) => {
  const { courseName } = req.params;
  try {
    const decoded = decodeToken(req.headers.authorization);
    const result = await pool.query(
      `SELECT * FROM practical_tasks
       WHERE course_name = $1 AND trainer_id = $2
       ORDER BY created_at ASC`,
      [courseName, decoded.id]
    );
    res.json({ tasks: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/practical/trainer/:courseName/tasks
router.post('/trainer/:courseName/tasks', authMiddleware, async (req, res) => {
  const { courseName } = req.params;
  const { title, description } = req.body;
  try {
    const decoded = decodeToken(req.headers.authorization);

    // Check max 4 tasks per course per trainer
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM practical_tasks
       WHERE course_name = $1 AND trainer_id = $2`,
      [courseName, decoded.id]
    );
    if (parseInt(countRes.rows[0].count) >= 4) {
      return res.status(400).json({ error: 'Maximum 4 practical tasks allowed per course' });
    }

    const result = await pool.query(
      `INSERT INTO practical_tasks (course_name, trainer_id, title, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [courseName, decoded.id, title, description]
    );
    res.json({ task: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/practical/trainer/tasks/:taskId
router.put('/trainer/tasks/:taskId', authMiddleware, async (req, res) => {
  const { taskId } = req.params;
  const { title, description } = req.body;
  try {
    const result = await pool.query(
      `UPDATE practical_tasks SET title=$1, description=$2
       WHERE id=$3 RETURNING *`,
      [title, description, taskId]
    );
    res.json({ task: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/practical/trainer/tasks/:taskId
router.delete('/trainer/tasks/:taskId', authMiddleware, async (req, res) => {
  const { taskId } = req.params;
  try {
    await pool.query(`DELETE FROM practical_tasks WHERE id=$1`, [taskId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// GET /api/practical/trainer/tasks/:taskId/submissions
router.get('/trainer/tasks/:taskId/submissions', authMiddleware, async (req, res) => {
  const { taskId } = req.params;
  try {
    const result = await pool.query(
      `SELECT
         ps.id, ps.task_id, ps.video_url, ps.status,
         ps.marks, ps.remarks, ps.submitted_at, ps.verified_at,
         sa.id AS student_admission_id,
         sa.full_name AS student_name,
         sa.admission_number,
         u.email
       FROM practical_submissions ps
       INNER JOIN student_admissions sa ON sa.id = ps.student_id
       INNER JOIN users u ON u.email = sa.email_id
       WHERE ps.task_id = $1
       ORDER BY ps.submitted_at DESC`,
      [taskId]
    );
    res.json({ submissions: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// PUT /api/practical/trainer/submissions/:submissionId/verify
router.put('/trainer/submissions/:submissionId/verify', authMiddleware, async (req, res) => {
  const { submissionId } = req.params;
  const { marks, remarks } = req.body;
  try {
    const result = await pool.query(
      `UPDATE practical_submissions
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

// GET /api/practical/student
router.get('/student', authMiddleware, async (req, res) => {
  try {
    const decoded = decodeToken(req.headers.authorization);

    // Get student course and admission id
    const courseRes = await pool.query(
      `SELECT sa.id, sa.course_name FROM student_admissions sa
       INNER JOIN users u ON u.email = sa.email_id
       WHERE u.id = $1 LIMIT 1`,
      [decoded.id]
    );
    if (courseRes.rows.length === 0)
      return res.status(404).json({ error: 'Student not found' });

    const { id: admissionId, course_name } = courseRes.rows[0];

    // Get tasks with submission status
    const result = await pool.query(
      `SELECT
         t.id, t.title, t.description, t.course_name, t.created_at,
         ps.id AS submission_id, ps.video_url, ps.status,
         ps.marks, ps.remarks, ps.submitted_at, ps.verified_at
       FROM practical_tasks t
       LEFT JOIN practical_submissions ps
         ON ps.task_id = t.id AND ps.student_id = $1
       WHERE t.course_name = $2
       ORDER BY t.created_at ASC`,
      [admissionId, course_name]
    );

    // Calculate total marks
    const totalMarks = result.rows.reduce((sum, t) => {
      return sum + (t.status === 'verified' && t.marks ? t.marks : 0);
    }, 0);

    res.json({
      tasks: result.rows,
      total_marks: totalMarks,
      max_marks: 40,
      admission_id: admissionId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch practical tasks' });
  }
});

// POST /api/practical/student/:taskId/submit
router.post('/student/:taskId/submit', authMiddleware, async (req, res) => {
  const { taskId } = req.params;
  const { video_url } = req.body;
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
      `SELECT id FROM practical_submissions
       WHERE task_id=$1 AND student_id=$2`,
      [taskId, admissionId]
    );

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        `UPDATE practical_submissions
         SET video_url=$1, status='submitted', submitted_at=NOW()
         WHERE task_id=$2 AND student_id=$3 RETURNING *`,
        [video_url, taskId, admissionId]
      );
    } else {
      result = await pool.query(
        `INSERT INTO practical_submissions
           (task_id, student_id, video_url, status, submitted_at)
         VALUES ($1, $2, $3, 'submitted', NOW()) RETURNING *`,
        [taskId, admissionId, video_url]
      );
    }
    res.json({ submission: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit practical video' });
  }
});

module.exports = router;