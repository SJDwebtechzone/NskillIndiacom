

const express = require("express");
const router  = express.Router();
const pool    = require("../config/db");
const { authMiddleware } = require("../middleware/authMiddleware");
const multer  = require("multer");
const crypto  = require("crypto");

// ✅ FIX 1: Only ONE multer instance — removed duplicate declaration
// Your file had TWO `const upload = multer(...)` which crashes Node.js
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/attendance/"),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

/* =====================================================
   1. GET STUDENTS WITH ATTENDANCE STATUS
===================================================== */
router.get("/students", authMiddleware, async (req, res) => {
  try {
    const { batch, date, batchAllotted, course, markedById } = req.query;

    if (!batch || !date) {
      return res.status(400).json({ success: false, message: "Batch and date are required." });
    }

    let studentsQuery = `
      SELECT id, admission_number, full_name, email_id,
             course_name, photo_url, batch_allotted
      FROM student_admissions
      WHERE status = 'Approved'
    `;
    const params = [];

if (batchAllotted) {
  params.push(batchAllotted);                                    // ← exact match, no % wrapping
  studentsQuery += ` AND batch_allotted = $${params.length}`;   // ← = instead of ILIKE
}
if (course) {
  params.push(`%${course}%`);
  studentsQuery += ` AND course_name ILIKE $${params.length}`;  // ← keep ILIKE for course
}
    studentsQuery += ` ORDER BY full_name ASC`;

    const studentsRes = await pool.query(studentsQuery, params);

    let attendQuery = `
      SELECT
        a.admission_id,
        a.status,
        a.remarks,
        a.marked_by_id,
        a.method,
        a.time_in,
        a.time_out,
        a.early_exit,
        a.session_id,
        a.qr_token,
        u.name AS marked_by_name
      FROM attendance a
      LEFT JOIN users u ON a.marked_by_id = u.id
      WHERE a.batch = $1 AND a.date = $2
    `;
    const attendParams = [batch, date];

    if (markedById) {
      attendParams.push(markedById);
      attendQuery += ` AND a.marked_by_id = $${attendParams.length}`;
    }

    const attendanceRes = await pool.query(attendQuery, attendParams);

    const attendanceMap = {};
    attendanceRes.rows.forEach(a => {
       attendanceMap[String(a.admission_id)] = { 
        status:         a.status,
        method:         a.method || "manual",
        punch_in:       a.time_in  ? new Date(a.time_in).toTimeString().slice(0, 5)  : "09:00",
        punch_out:      a.time_out ? new Date(a.time_out).toTimeString().slice(0, 5) : "18:00",
        time_in:        a.time_in,
        time_out:       a.time_out,
        early_exit:     a.early_exit,
        remarks:        a.remarks,
        marked_by_id:   a.marked_by_id,
        marked_by_name: a.marked_by_name,
      };
    });

    const data = studentsRes.rows.map(s => ({
      ...s,
     attendance: attendanceMap[String(s.id)] || { 
        status:     "Absent",
        method:     "manual",
        punch_in:   "09:00",
        punch_out:  "18:00",
        time_in:    null,
        time_out:   null,
        early_exit: false,
        remarks:    "",
      },
    }));

    res.json({ success: true, data });

  } catch (err) {
    console.error("Fetch students error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   2. MANUAL ATTENDANCE
===================================================== */
router.post("/mark", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { date, batch, records, marked_by_id } = req.body;

    if (!date || !batch || !records) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    await client.query("BEGIN");

    for (const r of records) {
      await client.query(`
        INSERT INTO attendance (
          admission_id, date, batch, status,
          remarks, marked_by_id, method
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'manual')
        ON CONFLICT (admission_id, date)
        DO UPDATE SET
          status       = EXCLUDED.status,
          remarks      = EXCLUDED.remarks,
          marked_by_id = COALESCE(EXCLUDED.marked_by_id, attendance.marked_by_id),
          -- ✅ FIX: Keep original method if already set (qr/photo)
          -- Only set to 'manual' if no method exists yet
          method       = CASE 
                           WHEN attendance.method IN ('qr', 'photo') 
                           THEN attendance.method    -- ← keep original
                           ELSE 'manual'             -- ← only for new/manual records
                         END,
          created_at   = CURRENT_TIMESTAMP
      `, [
        r.admission_id, date, batch,
        r.status, r.remarks, marked_by_id
      ]);
    }

    await client.query("COMMIT");
    res.json({ success: true, message: "Attendance saved" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Manual attendance error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
});

/* =====================================================
   3. QR ATTENDANCE — TIME-IN / TIME-OUT
===================================================== */
router.post("/qr/mark", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { admission_id, batch, session_id } = req.body;

    if (!admission_id || !batch || !session_id) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const existing = await client.query(`
      SELECT id, time_in, time_out
      FROM attendance
      WHERE admission_id = $1
        AND date = CURRENT_DATE
    `, [admission_id]);

    if (existing.rows.length === 0) {
      await client.query(`
        INSERT INTO attendance
          (admission_id, date, batch, status, method, session_id, time_in)
        VALUES
          ($1, CURRENT_DATE, $2, 'Present', 'qr', $3, NOW())
      `, [admission_id, batch, session_id]);

      return res.json({ success: true, action: "time_in", time: new Date() });

    } else {
      const record = existing.rows[0];

      if (record.time_out) {
        return res.json({ success: false, message: "Already checked out for today" });
      }

      const sessionRes = await client.query(`
        SELECT is_active FROM attendance_sessions WHERE id = $1
      `, [session_id]);

      const earlyExit = sessionRes.rows[0]?.is_active === true;

      await client.query(`
        UPDATE attendance
        SET time_out   = NOW(),
            early_exit = $1,
            created_at = CURRENT_TIMESTAMP
        WHERE admission_id = $2
          AND date = CURRENT_DATE
      `, [earlyExit, admission_id]);

      return res.json({
        success:    true,
        action:     "time_out",
        early_exit: earlyExit,
        time:       new Date()
      });
    }

  } catch (err) {
    console.error("QR error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
});

/* =====================================================
   4. START SESSION
===================================================== */
router.post("/session/start", authMiddleware, async (req, res) => {
  try {
    const { batch, course_name, method } = req.body;
    const trainer_id = req.user.id;

    if (!batch || !method) {
      return res.status(400).json({ success: false, message: "Batch and method required" });
    }

    const result = await pool.query(`
      INSERT INTO attendance_sessions (trainer_id, batch, course_name, method, start_time)
      VALUES ($1, $2, $3, $4, CURRENT_TIME)
      RETURNING *
    `, [trainer_id, batch, course_name, method]);

    const session = result.rows[0];

    let qr_token = null;
    if (method === "qr") {
      qr_token = crypto.randomUUID();
      await pool.query(`
        INSERT INTO qr_tokens (session_id, token, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '5 minutes')
      `, [session.id, qr_token]);
    }

    res.json({ success: true, session, qr_token });

  } catch (err) {
    console.error("Start session error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   5. END SESSION
===================================================== */
router.post("/session/end", authMiddleware, async (req, res) => {
  try {
    const { session_id } = req.body;

    await pool.query(`
      UPDATE attendance_sessions
      SET is_active = false, end_time = CURRENT_TIME
      WHERE id = $1 AND trainer_id = $2
    `, [session_id, req.user.id]);

    res.json({ success: true, message: "Session ended" });

  } catch (err) {
    console.error("End session error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   6. REFRESH QR TOKEN
===================================================== */
router.post("/session/refresh-qr", authMiddleware, async (req, res) => {
  try {
    const { session_id } = req.body;

    const sessionRes = await pool.query(`
      SELECT id FROM attendance_sessions
      WHERE id = $1 AND trainer_id = $2 AND is_active = true
    `, [session_id, req.user.id]);

    if (!sessionRes.rows.length) {
      return res.status(403).json({ success: false, message: "Session not found or not active" });
    }

    await pool.query(`
      UPDATE qr_tokens
      SET expires_at = NOW()
      WHERE session_id = $1 AND expires_at > NOW()
    `, [session_id]);

    const token = crypto.randomUUID();
    await pool.query(`
      INSERT INTO qr_tokens (session_id, token, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '5 minutes')
    `, [session_id, token]);

    res.json({ success: true, qr_token: token });

  } catch (err) {
    console.error("Refresh QR error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   7. VALIDATE QR TOKEN
===================================================== */
router.get("/qr/validate/:token", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        qt.session_id,
        qt.expires_at,
        s.batch,
        s.course_name,
        s.is_active,
        (qt.expires_at > NOW()) AS is_valid
      FROM qr_tokens qt
      JOIN attendance_sessions s ON qt.session_id = s.id
      WHERE qt.token = $1
    `, [req.params.token]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Invalid QR code" });
    }

    const qr = result.rows[0];

    if (!qr.is_valid) {
      return res.status(400).json({ success: false, message: "QR code has expired" });
    }

    if (!qr.is_active) {
      return res.status(400).json({ success: false, message: "Session is no longer active" });
    }

    res.json({
      success:     true,
      session_id:  qr.session_id,
      batch:       qr.batch,
      course_name: qr.course_name
    });

  } catch (err) {
    console.error("QR validate error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   8. PHOTO ATTENDANCE (file upload)
===================================================== */
router.post("/photo", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    const { admission_id, batch, session_id } = req.body;

    if (!admission_id || !batch) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    await pool.query(`
      INSERT INTO attendance (
        admission_id, date, batch, status, method, session_id, time_in
      )
      VALUES ($1, CURRENT_DATE, $2, 'Present', 'photo', $3, NOW())
      ON CONFLICT (admission_id, date)
      DO UPDATE SET
        status     = 'Present',
        method     = 'photo',
        session_id = $3,
        time_in    = NOW(),
        created_at = CURRENT_TIMESTAMP
    `, [admission_id, batch, session_id || null]);

    res.json({ success: true });

  } catch (err) {
    console.error("Photo error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   9. STUDENT REPORT
===================================================== */
router.get("/student-report", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const userRes = await pool.query(
      "SELECT email FROM users WHERE id = $1", [userId]
    );
    const email = userRes.rows[0]?.email;

    if (!email) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const admRes = await pool.query(
      "SELECT id, full_name, admission_number FROM student_admissions WHERE email_id = $1",
      [email]
    );

    if (!admRes.rows.length) {
      return res.status(404).json({ success: false, message: "No admission record found for this user" });
    }

    const { id: admissionId, full_name, admission_number } = admRes.rows[0];

    const recordsRes = await pool.query(`
      SELECT date, batch, status, method, time_in, time_out, early_exit
      FROM attendance
      WHERE admission_id = $1
      ORDER BY date DESC
    `, [admissionId]);

    const total   = recordsRes.rowCount;
    const present = recordsRes.rows.filter(r => r.status === "Present").length;
    const absent  = recordsRes.rows.filter(r => r.status === "Absent").length;
    const late    = recordsRes.rows.filter(r => r.status === "Late").length;

    res.json({
      success: true,
      data: {
        full_name,
        admission_number,
        total,
        present,
        absent,
        late,
        percent: total ? ((present / total) * 100).toFixed(2) : 0,
        records: recordsRes.rows
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   10. TODAY DASHBOARD
===================================================== */
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.admission_id, a.status, a.method,
             a.batch, a.time_in, a.time_out,
             a.early_exit, a.created_at,
             sa.full_name, sa.admission_number
      FROM attendance a
      LEFT JOIN student_admissions sa ON a.admission_id = sa.id
      WHERE a.date = CURRENT_DATE
      ORDER BY a.created_at DESC
    `);

    res.json({ success: true, data: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   11. MY ADMISSION (for QR scan page)
===================================================== */
router.get("/my-admission", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const userRes = await pool.query(
      "SELECT email, name FROM users WHERE id = $1", [userId]
    );

    if (!userRes.rows.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { email, name } = userRes.rows[0];

    const admRes = await pool.query(`
      SELECT id AS admission_id,
             admission_number,
             full_name,
             batch_allotted,
             course_name,
             photo_url
      FROM student_admissions
      WHERE email_id = $1
        AND status = 'Approved'
      LIMIT 1
    `, [email]);

    if (!admRes.rows.length) {
      return res.status(404).json({
        success: false,
        message: "No approved admission record found for this account"
      });
    }

    res.json({
      success: true,
      ...admRes.rows[0],
      user_name: name,
    });

  } catch (err) {
    console.error("My admission error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   12. FACE ENROL
===================================================== */
router.post("/face/enrol", authMiddleware, async (req, res) => {
  try {
    const { embedding } = req.body;
    const userId = req.user.id;

    if (!embedding || !Array.isArray(embedding) || embedding.length !== 128) {
      return res.status(400).json({
        success: false,
        message: "Invalid embedding. Must be 128-dimensional array."
      });
    }

    const userRes = await pool.query(
      "SELECT email FROM users WHERE id = $1", [userId]
    );
    if (!userRes.rows.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const admRes = await pool.query(
      "SELECT id FROM student_admissions WHERE email_id = $1 AND status = 'Approved' LIMIT 1",
      [userRes.rows[0].email]
    );
    if (!admRes.rows.length) {
      return res.status(404).json({ success: false, message: "Admission record not found" });
    }

    const admissionId = admRes.rows[0].id;

    await pool.query(`
      INSERT INTO face_embeddings (admission_id, embedding, created_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (admission_id)
      DO UPDATE SET embedding = $2, created_at = NOW()
    `, [admissionId, JSON.stringify(embedding)]);

    res.json({ success: true, message: "Face enrolled successfully" });

  } catch (err) {
    console.error("Face enrol error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   13. FACE CHECK
===================================================== */
router.get("/face/check", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const userRes = await pool.query(
      "SELECT email FROM users WHERE id = $1", [userId]
    );
    if (!userRes.rows.length) {
      return res.json({ success: true, has_embedding: false });
    }

    const admRes = await pool.query(
      "SELECT id FROM student_admissions WHERE email_id = $1 LIMIT 1",
      [userRes.rows[0].email]
    );
    if (!admRes.rows.length) {
      return res.json({ success: true, has_embedding: false });
    }

    const embRes = await pool.query(
      "SELECT id FROM face_embeddings WHERE admission_id = $1",
      [admRes.rows[0].id]
    );

    res.json({ success: true, has_embedding: embRes.rows.length > 0 });

  } catch (err) {
    console.error("Face check error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   14. FACE EMBEDDINGS (for matching)
===================================================== */
router.get("/face/embeddings", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        fe.admission_id,
        fe.embedding,
        sa.full_name,
        sa.batch_allotted,
        sa.course_name,
        sa.admission_number
      FROM face_embeddings fe
      JOIN student_admissions sa ON fe.admission_id = sa.id
      WHERE sa.status = 'Approved'
      ORDER BY sa.full_name ASC
    `);

    const embeddings = result.rows.map(r => ({
      ...r,
      embedding: typeof r.embedding === "string"
        ? JSON.parse(r.embedding)
        : r.embedding,
    }));

    res.json({ success: true, embeddings });

  } catch (err) {
    console.error("Face embeddings error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   15. PHOTO MARK (face-api.js attendance)
===================================================== */
router.post("/photo/mark", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { admission_id, batch, session_id } = req.body;

    if (!admission_id || !batch) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const existing = await client.query(`
      SELECT id, time_in, time_out
      FROM attendance
      WHERE admission_id = $1
        AND date = CURRENT_DATE
    `, [admission_id]);

    if (existing.rows.length === 0) {
      await client.query(`
        INSERT INTO attendance
          (admission_id, date, batch, status, method, session_id, time_in)
        VALUES
          ($1, CURRENT_DATE, $2, 'Present', 'photo', $3, NOW())
      `, [admission_id, batch, session_id || null]);

      return res.json({ success: true, action: "time_in", time: new Date() });

    } else {
      const record = existing.rows[0];

      if (record.time_out) {
        return res.json({ success: false, message: "Already checked out for today" });
      }

      const sessionRes = session_id
        ? await client.query(
            "SELECT is_active FROM attendance_sessions WHERE id = $1",
            [session_id]
          )
        : { rows: [{ is_active: false }] };

      const earlyExit = sessionRes.rows[0]?.is_active === true;

      await client.query(`
        UPDATE attendance
        SET time_out   = NOW(),
            early_exit = $1,
            method     = 'photo',
            created_at = CURRENT_TIMESTAMP
        WHERE admission_id = $2
          AND date = CURRENT_DATE
      `, [earlyExit, admission_id]);

      return res.json({
        success:    true,
        action:     "time_out",
        early_exit: earlyExit,
        time:       new Date()
      });
    }

  } catch (err) {
    console.error("Photo mark error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
});

module.exports = router;
