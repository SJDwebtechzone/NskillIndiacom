// routes/reviews.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Multer for video uploads ──────────────────────────────────────────────────
const videoDir = path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, videoDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const uploadVideo = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only MP4, MOV, AVI, WEBM, MKV files allowed'));
  },
});

// Helper to get student from token
const getStudentFromToken = async (decoded) => {
  const userResult = await pool.query(
    `SELECT email FROM users WHERE id = $1 LIMIT 1`,
    [decoded.id]
  );
  const email = userResult.rows[0]?.email;
  if (!email) return null;
  const studentResult = await pool.query(
    `SELECT id, full_name, course_name, photo_url 
     FROM student_admissions 
     WHERE LOWER(email_id) = LOWER($1) LIMIT 1`,
    [email]
  );
  return studentResult.rows[0] || null;
};

// ── GOOGLE REVIEW ROUTES ──────────────────────────────────────────────────────

// POST /api/reviews/google — student submits review
router.post('/google', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');
    const student = await getStudentFromToken(decoded);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const { rating, review_text, google_review_url } = req.body;
    if (!review_text || !rating) {
      return res.status(400).json({ error: 'Rating and review text are required' });
    }

    // Check if already submitted
    const existing = await pool.query(
      `SELECT id FROM student_google_reviews WHERE student_id = $1`,
      [student.id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE student_google_reviews 
         SET rating=$1, review_text=$2, google_review_url=$3, status='pending', submitted_at=NOW()
         WHERE student_id=$4`,
        [rating, review_text, google_review_url || null, student.id]
      );
    } else {
      await pool.query(
        `INSERT INTO student_google_reviews 
          (student_id, course_name, rating, review_text, google_review_url, photo_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [student.id, student.course_name, rating, review_text, google_review_url || null, student.photo_url]
      );
    }

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err) {
    console.error('POST /google error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/google/my — student views own review
router.get('/google/my', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');
    const student = await getStudentFromToken(decoded);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const result = await pool.query(
      `SELECT * FROM student_google_reviews WHERE student_id = $1`,
      [student.id]
    );
    res.json({ review: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// GET /api/reviews/google/all — admin views all reviews
router.get('/google/all', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, sa.full_name, sa.email_id
       FROM student_google_reviews r
       JOIN student_admissions sa ON sa.id = r.student_id
       ORDER BY r.submitted_at DESC`
    );
    res.json({ reviews: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET /api/reviews/google/approved — home page
router.get('/google/approved', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.rating, r.review_text, r.google_review_url,
              r.course_name, r.photo_url, sa.full_name
       FROM student_google_reviews r
       JOIN student_admissions sa ON sa.id = r.student_id
       WHERE r.status = 'approved'
       ORDER BY r.submitted_at DESC`
    );
    res.json({ reviews: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// PATCH /api/reviews/google/:id/status — admin approve/reject
router.patch('/google/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query(
      `UPDATE student_google_reviews SET status = $1 WHERE id = $2`,
      [status, id]
    );
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ── VIDEO ROUTES ──────────────────────────────────────────────────────────────

// POST /api/reviews/video — student uploads video
router.post('/video', uploadVideo.single('video'), async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');
    const student = await getStudentFromToken(decoded);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    if (!req.file) return res.status(400).json({ error: 'Video file is required' });

    const { description } = req.body;
    const video_url = `/uploads/videos/${req.file.filename}`;

    // Check if already submitted
    const existing = await pool.query(
      `SELECT id FROM student_videos WHERE student_id = $1`,
      [student.id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE student_videos 
         SET video_url=$1, description=$2, status='pending', submitted_at=NOW()
         WHERE student_id=$3`,
        [video_url, description || null, student.id]
      );
    } else {
      await pool.query(
        `INSERT INTO student_videos 
          (student_id, course_name, video_url, description, photo_url)
         VALUES ($1, $2, $3, $4, $5)`,
        [student.id, student.course_name, video_url, description || null, student.photo_url]
      );
    }

    res.status(201).json({ message: 'Video submitted successfully' });
  } catch (err) {
    console.error('POST /video error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/video/my — student views own video
router.get('/video/my', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');
    const student = await getStudentFromToken(decoded);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const result = await pool.query(
      `SELECT * FROM student_videos WHERE student_id = $1`,
      [student.id]
    );
    res.json({ video: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// GET /api/reviews/video/all — admin views all videos
router.get('/video/all', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, sa.full_name, sa.email_id
       FROM student_videos v
       JOIN student_admissions sa ON sa.id = v.student_id
       ORDER BY v.submitted_at DESC`
    );
    res.json({ videos: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// GET /api/reviews/video/approved — home page
router.get('/video/approved', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.id, v.video_url, v.description, v.course_name, v.photo_url, sa.full_name
       FROM student_videos v
       JOIN student_admissions sa ON sa.id = v.student_id
       WHERE v.status = 'approved'
       ORDER BY v.submitted_at DESC`
    );
    res.json({ videos: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// PATCH /api/reviews/video/:id/status — admin approve/reject
router.patch('/video/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query(
      `UPDATE student_videos SET status = $1 WHERE id = $2`,
      [status, id]
    );
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// GET /api/reviews/google-link — get google business link
router.get('/google-link', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT google_review_link FROM contact_info LIMIT 1`
    );
    res.json({ link: result.rows[0]?.google_review_link || null });
  } catch (err) {
    res.json({ link: null });
  }
});

module.exports = router;
