// backend/routes/bookings.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// POST /api/bookings — book a free demo slot
router.post("/", async (req, res) => {
  try {
    const { name, address, email, phone, date, time, course_id } = req.body;

    if (!name || !email || !phone || !date || !time) {
      return res.status(400).json({ error: "Missing required fields: name, email, phone, date, time" });
    }

    const result = await pool.query(
      `INSERT INTO bookings (name, address, email, phone, demo_date, demo_time, course_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id`,
      [name, address || null, email, phone, date, time, course_id || null]
    );

    res.status(201).json({ success: true, booking_id: result.rows[0].id });
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/bookings — list all bookings (admin use)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, c.title AS course_title
       FROM bookings b
       LEFT JOIN courses c ON b.course_id = c.id
       ORDER BY b.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/bookings error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
