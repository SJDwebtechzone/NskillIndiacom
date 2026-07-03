// routes/weekly-test.js
const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const jwt     = require('jsonwebtoken');

// ── helpers ──────────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'mysecret';

function decodeToken(req) {
  const auth = req.headers.authorization;
  if (!auth) throw new Error('Unauthorized');
  return jwt.verify(auth.split(' ')[1], JWT_SECRET);
}

async function getStudentAdmission(userId) {
  const r = await pool.query(
    `SELECT sa.id, sa.course_name FROM student_admissions sa
     INNER JOIN users u ON u.email = sa.email_id
     WHERE u.id = $1 AND sa.is_deleted = false LIMIT 1`,
    [userId]
  );
  return r.rows[0] || null;
}

// ── multer for weekly-test file uploads ─────────────────────────────────────
const uploadDir = path.join(__dirname, '../uploads/weekly-test');
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
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB (for videos)
  fileFilter: (req, file, cb) => {
    const allowed = [
      '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', // documents
      '.mp4', '.mov', '.avi', '.webm', '.mkv',                            // videos
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only document and video files are allowed.'));
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRAINER  — manage requests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// GET /api/weekly-test/trainer/requests — list requests created by this trainer
router.get('/trainer/requests', async (req, res) => {
  try {
    const decoded = decodeToken(req);
    const result = await pool.query(
      `SELECT wtr.*, 
              (SELECT COUNT(*) FROM weekly_test_submissions wts WHERE wts.request_id = wtr.id AND wts.is_deleted = false) AS submission_count
       FROM weekly_test_requests wtr
       WHERE wtr.trainer_id = $1 AND wtr.is_deleted = false
       ORDER BY wtr.created_at DESC`,
      [decoded.id]
    );
    res.json({ requests: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/weekly-test/trainer/requests — trainer creates a new weekly test request
router.post('/trainer/requests', async (req, res) => {
  try {
    const decoded = decodeToken(req);
    const { course_name, title, description, submission_type, due_date } = req.body;
    if (!course_name || !title || !submission_type)
      return res.status(400).json({ error: 'course_name, title, and submission_type are required.' });

    const result = await pool.query(
      `INSERT INTO weekly_test_requests
         (course_name, trainer_id, title, description, submission_type, due_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [course_name, decoded.id, title, description || null, submission_type, due_date || null]
    );
    res.status(201).json({ request: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/weekly-test/trainer/requests/:id — trainer updates (toggle active / edit)
router.patch('/trainer/requests/:id', async (req, res) => {
  try {
    const decoded = decodeToken(req);
    const { id } = req.params;
    const { title, description, submission_type, due_date, is_active } = req.body;
    await pool.query(
      `UPDATE weekly_test_requests
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           submission_type = COALESCE($3, submission_type),
           due_date = COALESCE($4, due_date),
           is_active = COALESCE($5, is_active)
       WHERE id = $6 AND trainer_id = $7`,
      [title, description, submission_type, due_date, is_active, id, decoded.id]
    );
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/weekly-test/trainer/requests/:id
router.delete('/trainer/requests/:id', async (req, res) => {
  try {
    const decoded = decodeToken(req);
    const { id } = req.params;
    await pool.query(
      `UPDATE weekly_test_requests SET is_deleted = true, deleted_at = NOW() WHERE id = $1 AND trainer_id = $2`,
      [id, decoded.id]
    );
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/weekly-test/trainer/requests/:id/submissions — view all student submissions for a request
router.get('/trainer/requests/:id/submissions', async (req, res) => {
  try {
    decodeToken(req);
    const { id } = req.params;
    const result = await pool.query(
      `SELECT wts.*, sa.full_name AS student_name, sa.email_id AS student_email
       FROM weekly_test_submissions wts
       INNER JOIN student_admissions sa ON sa.id = wts.student_id AND sa.is_deleted = false
       WHERE wts.request_id = $1 AND wts.is_deleted = false
       ORDER BY wts.submitted_at DESC`,
      [id]
    );
    res.json({ submissions: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/weekly-test/trainer/submissions/:id/review — trainer marks submission as reviewed
router.patch('/trainer/submissions/:id/review', async (req, res) => {
  try {
    decodeToken(req);
    const { id } = req.params;
    const { review_note } = req.body;
    await pool.query(
      `UPDATE weekly_test_submissions
       SET status = 'reviewed', review_note = $1, reviewed_at = NOW()
       WHERE id = $2`,
      [review_note || null, id]
    );
    res.json({ message: 'Marked as reviewed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STUDENT — view requests & upload submissions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// GET /api/weekly-test/student/requests — active requests for the student's course
router.get('/student/requests', async (req, res) => {
  try {
    const decoded = decodeToken(req);
    const student = await getStudentAdmission(decoded.id);
    if (!student) return res.status(404).json({ error: 'Student record not found' });

    const result = await pool.query(
      `SELECT wtr.*,
              wts.id          AS submission_id,
              wts.file_url    AS submitted_file_url,
              wts.file_type   AS submitted_file_type,
              wts.status      AS submission_status,
              wts.submitted_at AS submitted_at,
              wts.review_note AS review_note
       FROM weekly_test_requests wtr
       LEFT JOIN weekly_test_submissions wts
         ON wts.request_id = wtr.id AND wts.student_id = $1 AND wts.is_deleted = false
       WHERE wtr.course_name = $2 AND wtr.is_active = true AND wtr.is_deleted = false
       ORDER BY wtr.created_at DESC`,
      [student.id, student.course_name]
    );
    res.json({ requests: result.rows, student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/weekly-test/student/submit/:requestId — student uploads file
router.post('/student/submit/:requestId', upload.single('weekly_test_file'), async (req, res) => {
  try {
    const decoded = decodeToken(req);
    const student = await getStudentAdmission(decoded.id);
    if (!student) return res.status(404).json({ error: 'Student record not found' });
    if (!req.file)  return res.status(400).json({ error: 'No file uploaded' });

    const { requestId } = req.params;

    // Check request exists and is active
    const reqCheck = await pool.query(
      `SELECT * FROM weekly_test_requests WHERE id = $1 AND course_name = $2 AND is_active = true AND is_deleted = false`,
      [requestId, student.course_name]
    );
    if (reqCheck.rows.length === 0)
      return res.status(404).json({ error: 'Test request not found or no longer active' });

    const wtr = reqCheck.rows[0];
    const file_url  = `/uploads/weekly-test/${req.file.filename}`;
    const videoExts = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
    const ext       = path.extname(req.file.originalname).toLowerCase();
    const file_type = videoExts.includes(ext) ? 'video' : 'document';

    // Validate against what the trainer requested
    if (wtr.submission_type !== 'both' && wtr.submission_type !== file_type) {
      fs.unlinkSync(req.file.path); // remove uploaded file
      return res.status(400).json({
        error: `This test only accepts ${wtr.submission_type} files.`
      });
    }

    // Upsert: if already submitted, update
    const existing = await pool.query(
      `SELECT id FROM weekly_test_submissions WHERE request_id = $1 AND student_id = $2 AND is_deleted = false`,
      [requestId, student.id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE weekly_test_submissions
         SET file_url = $1, file_type = $2, status = 'pending', submitted_at = NOW(), review_note = NULL, reviewed_at = NULL
         WHERE request_id = $3 AND student_id = $4`,
        [file_url, file_type, requestId, student.id]
      );
    } else {
      await pool.query(
        `INSERT INTO weekly_test_submissions
           (request_id, student_id, course_name, file_url, file_type)
         VALUES ($1, $2, $3, $4, $5)`,
        [requestId, student.id, student.course_name, file_url, file_type]
      );
    }

    res.status(201).json({ message: 'Submitted successfully', file_url, file_type });
  } catch (err) {
    console.error(err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
