// backend/routes/bookings.js
const express = require("express");
const router  = express.Router();
const pool    = require("../config/db");
const { sendDemoAlertToAdmin, sendWhatsApp } = require("../helpers/whatsapp");

// ── Send demo confirmation to user ────────────────────────────────────────────
async function sendDemoConfirmationToUser(phone, name, courseName, date, time) {
  const message =
    `📅 *Demo Class Confirmed!*\n\n` +
    `Hi *${name}*! 👋\n\n` +
    `Your free demo class has been booked successfully.\n\n` +
    `📚 Course: *${courseName}*\n` +
    `📆 Date: *${date}*\n` +
    `⏰ Time: *${time}*\n` +
    `📍 Location: *Kovur, Chennai, Tamil Nadu*\n\n` +
    `Please arrive 10 minutes early.\n\n` +
    `For any queries contact us:\n` +
    `📞 Call/WhatsApp: *+91 98842 09774*\n\n` +
    `— NTSC Training Institute`;
  return sendWhatsApp(`whatsapp:+91${phone}`, message);
}

// POST /api/bookings — book a free demo slot
router.post("/", async (req, res) => {
  try {
    const { name, address, email, phone, date, time, course_id } = req.body;

    if (!name || !email || !phone || !date || !time) {
      return res.status(400).json({ error: "Missing required fields: name, email, phone, date, time" });
    }

    // ── Save booking to DB (original code unchanged) ──────────────────────────
    const result = await pool.query(
      `INSERT INTO bookings (name, address, email, phone, demo_date, demo_time, course_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id`,
      [name, address || null, email, phone, date, time, course_id || null]
    );

    // ── Get course name from DB ───────────────────────────────────────────────
    let courseName = "NTSC Course";
    if (course_id) {
      try {
        const courseRes = await pool.query(
          "SELECT title FROM courses WHERE id = $1",
          [course_id]
        );
        if (courseRes.rows.length > 0) {
          courseName = courseRes.rows[0].title;
        }
      } catch (e) {
        console.error("Course fetch error:", e.message);
      }
    }

    // ── Send confirmation to user WhatsApp (non-blocking) ─────────────────────
    sendDemoConfirmationToUser(phone, name, courseName, date, time)
      .catch(err => console.error("sendDemoConfirmationToUser failed:", err.message));

    // ── Send alert to admin WhatsApp (non-blocking) ───────────────────────────
    sendDemoAlertToAdmin(name, email, phone, courseName, date, time, address)
      .catch(err => console.error("sendDemoAlertToAdmin failed:", err.message));

    // ── Respond immediately — don't wait for WhatsApp ─────────────────────────
    res.status(201).json({ success: true, booking_id: result.rows[0].id });

  } catch (err) {
    console.error("POST /api/bookings error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/bookings — list all bookings (admin use) — original code unchanged
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
