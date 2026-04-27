// routes/placement-feedback.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Multer for offer letter uploads ──────────────────────────────────────────
const uploadDir = path.join(__dirname, '../uploads/offer-letters');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, JPG, PNG files allowed'));
  },
});

// Helper to get student admission id from token
const getStudentFromToken = async (decoded) => {
  const userResult = await pool.query(
    `SELECT email FROM users WHERE id = $1 LIMIT 1`,
    [decoded.id]
  );
  const email = userResult.rows[0]?.email;
  if (!email) return null;
  const studentResult = await pool.query(
    `SELECT id, full_name, course_name, photo_url FROM student_admissions 
     WHERE LOWER(email_id) = LOWER($1) LIMIT 1`,
    [email]
  );
  return studentResult.rows[0] || null;
};

// ── PLACEMENT ROUTES ──────────────────────────────────────────────────────────

// POST /api/placement-feedback/placement — student submits placement
router.post('/placement', upload.single('offer_letter'), async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');
    const student = await getStudentFromToken(decoded);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const { company_name, position, salary, job_location } = req.body;
    const offer_letter_url = req.file
      ? `/uploads/offer-letters/${req.file.filename}`
      : null;

    await pool.query(
      `INSERT INTO student_placements 
        (student_id, course_name, company_name, position, salary, job_location, offer_letter_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [student.id, student.course_name, company_name, position, salary, job_location, offer_letter_url]
    );

    res.status(201).json({ message: 'Placement details submitted successfully' });
  } catch (err) {
    console.error('POST /placement error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/placement-feedback/placement/my — student views own placement
router.get('/placement/my', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');
    const student = await getStudentFromToken(decoded);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const result = await pool.query(
      `SELECT * FROM student_placements WHERE student_id = $1 ORDER BY submitted_at DESC`,
      [student.id]
    );
    res.json({ placements: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch placements' });
  }
});

// GET /api/placement-feedback/placement/all — admin views all placements
router.get('/placement/all', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sp.*, sa.full_name, sa.email_id, sa.photo_url
       FROM student_placements sp
       JOIN student_admissions sa ON sa.id = sp.student_id
       ORDER BY sp.submitted_at DESC`
    );
    res.json({ placements: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch placements' });
  }
});

// PATCH /api/placement-feedback/placement/:id/status — admin updates status
router.patch('/placement/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query(
      `UPDATE student_placements SET status = $1 WHERE id = $2`,
      [status, id]
    );
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ── FEEDBACK & TESTIMONIAL ROUTES ─────────────────────────────────────────────

// POST /api/placement-feedback/feedback — student submits feedback
router.post('/feedback', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');
    const student = await getStudentFromToken(decoded);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const { rating, feedback_text, testimonial } = req.body;

    // Check if already submitted
    const existing = await pool.query(
      `SELECT id FROM student_feedback WHERE student_id = $1`,
      [student.id]
    );
    if (existing.rows.length > 0) {
      // Update existing
      await pool.query(
        `UPDATE student_feedback SET rating=$1, feedback_text=$2, testimonial=$3, 
         status='pending', submitted_at=NOW() WHERE student_id=$4`,
        [rating, feedback_text, testimonial, student.id]
      );
    } else {
      // Insert new
      await pool.query(
        `INSERT INTO student_feedback 
          (student_id, course_name, rating, feedback_text, testimonial, photo_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [student.id, student.course_name, rating, feedback_text, testimonial, student.photo_url]
      );
    }

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error('POST /feedback error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/placement-feedback/feedback/my — student views own feedback
router.get('/feedback/my', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');
    const student = await getStudentFromToken(decoded);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const result = await pool.query(
      `SELECT * FROM student_feedback WHERE student_id = $1`,
      [student.id]
    );
    res.json({ feedback: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// GET /api/placement-feedback/feedback/all — admin views all feedback
router.get('/feedback/all', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sf.*, sa.full_name, sa.email_id
       FROM student_feedback sf
       JOIN student_admissions sa ON sa.id = sf.student_id
       ORDER BY sf.submitted_at DESC`
    );
    res.json({ feedback: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// GET /api/placement-feedback/testimonials/approved — home screen
router.get('/testimonials/approved', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sf.id, sf.rating, sf.testimonial, sf.photo_url, 
              sf.course_name, sa.full_name
       FROM student_feedback sf
       JOIN student_admissions sa ON sa.id = sf.student_id
       WHERE sf.status = 'approved'
       ORDER BY sf.submitted_at DESC`
    );
    res.json({ testimonials: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// PATCH /api/placement-feedback/feedback/:id/status — admin approve/reject
router.patch('/feedback/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query(
      `UPDATE student_feedback SET status = $1 WHERE id = $2`,
      [status, id]
    );
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
