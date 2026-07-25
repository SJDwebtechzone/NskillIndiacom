// routes/student-pretest.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// ─────────────────────────────────────────
// GET /api/student/pretest/:courseName/config
// ─────────────────────────────────────────
router.get('/:courseName/config', async (req, res) => {
  const { courseName } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM pretest_config WHERE TRIM(LOWER(course_name)) = $1 AND is_deleted = false`,
      [courseName.trim().toLowerCase()]
    );
    let config = result.rows[0];
    if (!config) {
      // Fallback config if trainer hasn't explicitly set one
      config = {
        total_qs: 20,
        pass_percent: 60,
        time_limit: 1200 // 20 minutes in seconds
      };
    }
    res.json({ config });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// ─────────────────────────────────────────
// GET /api/student/pretest/:courseName/status
// Check if student already attempted
// ─────────────────────────────────────────
router.get('/:courseName/status', async (req, res) => {
  const { courseName } = req.params;
  const studentId = req.user?.id; // from your auth middleware
  try {
    // Get admission ID
    const userResult = await pool.query(`SELECT email FROM users WHERE id = $1`, [studentId]);
    if (userResult.rows.length === 0) return res.json({ has_attempted: false });
    const email = userResult.rows[0].email;
    const admissionResult = await pool.query(
      `SELECT id FROM student_admissions WHERE LOWER(email_id) = LOWER($1) AND is_deleted = false LIMIT 1`,
      [email]
    );
    if (admissionResult.rows.length === 0) return res.json({ has_attempted: false });
    const admissionId = admissionResult.rows[0].id;

    const result = await pool.query(
      `SELECT score, total, passed
       FROM pretest_attempts
       WHERE student_id = $1 AND TRIM(LOWER(course_name)) = $2 AND is_deleted = false
       ORDER BY submitted_at DESC
       LIMIT 1`,
      [admissionId, courseName.trim().toLowerCase()]
    );
    if (result.rows.length === 0) {
      return res.json({ has_attempted: false });
    }
    const { score, total, passed } = result.rows[0];
    res.json({ has_attempted: true, score, total, passed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// ─────────────────────────────────────────
// GET /api/student/pretest/:courseName/questions
// Returns randomized questions (no correct_ans)
// ─────────────────────────────────────────
router.get('/:courseName/questions', async (req, res) => {
  const { courseName } = req.params;
  try {
    // Get config for total_qs and time_limit
    const configResult = await pool.query(
      `SELECT total_qs, time_limit FROM pretest_config WHERE TRIM(LOWER(course_name)) = $1 AND is_deleted = false`,
      [courseName.trim().toLowerCase()]
    );
    const config = configResult.rows[0] || { total_qs: 20, time_limit: 1200 };

    // Fetch randomized questions — never expose correct_ans
    const result = await pool.query(
      `SELECT id, question, option_a, option_b, option_c, option_d
       FROM pretest_questions
       WHERE TRIM(LOWER(course_name)) = $1 AND is_deleted = false
       ORDER BY RANDOM()`,
      [courseName.trim().toLowerCase()]
    );
    console.log('[DEBUG] /questions fetch for', courseName, '-> rows:', result.rows.length);
    res.json({
      questions: result.rows,
      time_limit: config.time_limit,
    });
  } catch (err) {
    console.error('[DEBUG] /questions Error:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// ─────────────────────────────────────────
// POST /api/student/pretest/:courseName/submit
// Submit answers, calculate score, save attempt
// ─────────────────────────────────────────
router.post('/:courseName/submit', async (req, res) => {
  const { courseName } = req.params;
  const studentId = req.user?.id;
  const { answers, time_taken } = req.body;

  const client = await pool.connect();
  try {
    // Look up admission ID for the student
    const userResult = await client.query(`SELECT email FROM users WHERE id = $1`, [studentId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const email = userResult.rows[0].email;
    const admissionResult = await client.query(
      `SELECT id FROM student_admissions WHERE LOWER(email_id) = LOWER($1) AND is_deleted = false LIMIT 1`,
      [email]
    );
    if (admissionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student admission not found' });
    }
    const admissionId = admissionResult.rows[0].id;

    await client.query('BEGIN');

    const qIds = answers.map((a) => a.question_id);
    const correctResult = await client.query(
      `SELECT id, correct_ans FROM pretest_questions WHERE id = ANY($1::int[]) AND is_deleted = false`,
      [qIds]
    );

    const correctMap = {};  // ✅ removed : Record<number, string>
    correctResult.rows.forEach((r) => {  // ✅ removed : any
      correctMap[r.id] = r.correct_ans;
    });

    const configResult = await client.query(
      `SELECT total_qs, pass_percent FROM pretest_config WHERE TRIM(LOWER(course_name)) = $1 AND is_deleted = false`,
      [courseName.trim().toLowerCase()]
    );
    const config = configResult.rows[0] || { total_qs: answers.length, pass_percent: 60 };

    let score = 0;
    const evaluated = answers.map((a) => {  // ✅ removed : any
      const is_correct = correctMap[a.question_id] === a.selected_ans;
      if (is_correct) score++;
      return { ...a, is_correct };
    });

    const total = config.total_qs;
    const passed = (score / total) * 100 >= config.pass_percent;

    const attemptResult = await client.query(
      `INSERT INTO pretest_attempts (student_id, course_name, score, total, passed, time_taken)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [admissionId, courseName, score, total, passed, time_taken]
    );
    const attemptId = attemptResult.rows[0].id;

    for (const a of evaluated) {
      await client.query(
        `INSERT INTO pretest_answers (attempt_id, question_id, selected_ans, is_correct)
         VALUES ($1, $2, $3, $4)`,
        [attemptId, a.question_id, a.selected_ans, a.is_correct]
      );
    }

    await client.query('COMMIT');
    res.json({ attempt_id: attemptId, score, total, passed });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('SUBMIT ERROR:', err);
    res.status(500).json({ error: 'Failed to submit test', detail: err.message });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────
// GET /api/student/pretest/result/:attemptId
// Fetch result with answer review
// ─────────────────────────────────────────
router.get('/result/:attemptId', async (req, res) => {
  const { attemptId } = req.params;
  try {
    // Get attempt summary
    const attemptResult = await pool.query(
       `SELECT pa.score, pa.total, pa.passed, pa.time_taken, pc.pass_percent
        FROM pretest_attempts pa
        LEFT JOIN pretest_config pc ON TRIM(LOWER(pa.course_name)) = TRIM(LOWER(pc.course_name)) AND pc.is_deleted = false
        WHERE pa.id = $1 AND pa.is_deleted = false`,
      [attemptId]
    );
    if (attemptResult.rows.length === 0)
      return res.status(404).json({ error: 'Attempt not found' });

    const attempt = attemptResult.rows[0];

    // Get answer review
    const answersResult = await pool.query(
      `SELECT
         pq.question,
         pan.selected_ans,
         pq.correct_ans,
         pan.is_correct
       FROM pretest_answers pan
       JOIN pretest_questions pq ON pan.question_id = pq.id AND pq.is_deleted = false
       WHERE pan.attempt_id = $1
       ORDER BY pan.id`,
      [attemptId]
    );

    res.json({
      score: attempt.score,
      total: attempt.total,
      passed: attempt.passed,
      pass_percent: attempt.pass_percent,
      time_taken: attempt.time_taken,
      answers: answersResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
});
// GET /api/student/pretest/my-courses
router.get('/my-courses', async (req, res) => {
  const studentId = req.user?.id;

  try {
    // Step 1: Find student's email from users table
    const userResult = await pool.query(
      `SELECT email FROM users WHERE id = $1 AND is_deleted = false LIMIT 1`,
      [studentId]
    );
    if (userResult.rows.length === 0) {
      return res.json({ courses: [] });
    }
    const email = userResult.rows[0].email;

    // Step 2: Find student's enrolled course from student_admissions table
    const admissionResult = await pool.query(
      `SELECT course_name FROM student_admissions WHERE LOWER(email_id) = LOWER($1) AND is_deleted = false LIMIT 1`,
      [email]
    );

    if (admissionResult.rows.length === 0) {
      return res.json({ courses: [] }); // No admission found
    }

    const courseName = admissionResult.rows[0].course_name;

    // Step 2: Check if pretest config exists for that course
    const configResult = await pool.query(
      `SELECT pc.course_name,
              pa.score,
              pa.total,
              pa.passed,
              CASE WHEN pa.id IS NOT NULL THEN true ELSE false END AS has_attempted
       FROM pretest_config pc
       LEFT JOIN LATERAL (
         SELECT * FROM pretest_attempts
         WHERE student_id = $1 AND TRIM(LOWER(course_name)) = TRIM(LOWER(pc.course_name)) AND is_deleted = false
         ORDER BY submitted_at DESC
         LIMIT 1
       ) pa ON true
       WHERE TRIM(LOWER(pc.course_name)) = $2 AND pc.is_deleted = false`,
      [studentId, courseName.trim().toLowerCase()]
    );

    res.json({ courses: configResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

module.exports = router;