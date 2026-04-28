// backend/routes/classStatus.js
const express = require("express");
const router  = express.Router();
const pool    = require("../config/db");

// GET /api/class-status — get all students for trainer
router.get("/", async (req, res) => {
  try {
    const { status, includeApproved } = req.query;

    let query = `
      SELECT
        sa.id,
        sa.admission_number,
        sa.full_name,
        sa.course_name,
        sa.batch_allotted,
        sa.status,
        sa.mobile_number,
        sa.admission_date,
        sa.created_at
      FROM student_admissions sa
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      if (includeApproved === "true") {
        // Ongoing page — show Ongoing + Approved with batch assigned
        params.push(status);
        query += ` AND (
          sa.status = $1
          OR (sa.status = 'Approved' AND sa.batch_allotted IS NOT NULL AND TRIM(sa.batch_allotted) != '')
        )`;
      } else {
        params.push(status);
        query += ` AND sa.status = $${params.length}`;
      }
    }

    query += ` ORDER BY sa.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/class-status error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
// PUT /api/class-status/:id — update student status
router.put("/:id", async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const allowed = ["Ongoing", "Completed", "Discontinue", "Approved"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const result = await pool.query(
      `UPDATE student_admissions
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, full_name, status`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ success: true, student: result.rows[0] });
  } catch (err) {
    console.error("PUT /api/class-status/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/class-status/bulk — update multiple students at once
router.put("/bulk", async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids?.length || !status) {
      return res.status(400).json({ error: "ids array and status required" });
    }

    const allowed = ["Ongoing", "Completed", "Discontinue", "Approved"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    await pool.query(
      `UPDATE student_admissions
       SET status = $1
       WHERE id = ANY($2::int[])`,
      [status, ids]
    );

    res.json({ success: true, updated: ids.length });
  } catch (err) {
    console.error("PUT /api/class-status/bulk error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;