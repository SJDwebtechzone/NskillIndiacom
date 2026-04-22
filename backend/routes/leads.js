// backend/routes/leads.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// POST /api/leads — capture brochure download lead
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, course_id } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Missing required fields: name, email, phone" });
    }

    const result = await pool.query(
      `INSERT INTO leads (name, email, phone, course_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id`,
      [name, email, phone, course_id || null]
    );

    res.status(201).json({ success: true, lead_id: result.rows[0].id });
  } catch (err) {
    console.error("POST /api/leads error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/leads — list all leads (admin use)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, c.title AS course_title
       FROM leads l
       LEFT JOIN courses c ON l.course_id = c.id
       ORDER BY l.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/leads error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
