// backend/routes/leads.js
const express = require("express");
const router  = require("express").Router();
const pool    = require("../config/db");
const { sendBrochureToUser, sendLeadAlertToAdmin } = require("../helpers/whatsapp");

// POST /api/leads — capture brochure download lead
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, course_id, course_title, brochure_url } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Missing required fields: name, email, phone" });
    }

    // ── Save lead to DB (your original code unchanged) ────────────────────────
    const result = await pool.query(
      `INSERT INTO leads (name, email, phone, course_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id`,
      [name, email, phone, course_id || null]
    );

    // ── Get course details from DB if not passed in request ───────────────────
    let courseName  = course_title  || null;
    let brochureURL = brochure_url  || null;

    if (course_id && (!courseName || !brochureURL)) {
      try {
        const courseRes = await pool.query(
          "SELECT title, brochure_url FROM courses WHERE id = $1",
          [course_id]
        );
        if (courseRes.rows.length > 0) {
          if (!courseName)  courseName  = courseRes.rows[0].title;
          if (!brochureURL) brochureURL = courseRes.rows[0].brochure_url;
        }
      } catch (courseErr) {
        console.error("Could not fetch course details:", courseErr.message);
      }
    }

    courseName = courseName || "NTSC Course";

    // ── Send brochure PDF link to user via WhatsApp (non-blocking) ────────────
    if (brochureURL) {
      sendBrochureToUser(phone, name, courseName, brochureURL)
        .catch(err => console.error("sendBrochureToUser failed:", err.message));
    }

    // ── Send lead alert to admin WhatsApp (non-blocking) ─────────────────────
    sendLeadAlertToAdmin(name, email, phone, courseName)
      .catch(err => console.error("sendLeadAlertToAdmin failed:", err.message));

    // ── Respond immediately — don't wait for WhatsApp ─────────────────────────
    res.status(201).json({ success: true, lead_id: result.rows[0].id });

  } catch (err) {
    console.error("POST /api/leads error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/leads — list all leads (admin use) — your original code unchanged
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
// POST /api/leads/verified — called after OTP verified successfully
router.post("/verified", async (req, res) => {
  try {
    const { name, email, phone, course_id, course_title, brochure_url } = req.body;

    // Get course brochure_url from DB if not passed
    let courseName  = course_title || "NTSC Course";
    let brochureURL = brochure_url || null;

    if (course_id && !brochureURL) {
      try {
        const courseRes = await pool.query(
          "SELECT title, brochure_url FROM courses WHERE id = $1",
          [course_id]
        );
        if (courseRes.rows.length > 0) {
          if (!courseName)  courseName  = courseRes.rows[0].title;
          if (!brochureURL) brochureURL = courseRes.rows[0].brochure_url;
        }
      } catch (e) {
        console.error("Course fetch error:", e.message);
      }
    }

    // Send brochure to user WhatsApp
    if (brochureURL) {
      sendBrochureToUser(phone, name, courseName, brochureURL)
        .catch(err => console.error("sendBrochureToUser failed:", err.message));
    }

    // Send lead alert to admin WhatsApp
    sendLeadAlertToAdmin(name, email, phone, courseName)
      .catch(err => console.error("sendLeadAlertToAdmin failed:", err.message));

    res.json({ success: true });
  } catch (err) {
    console.error("POST /api/leads/verified error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
