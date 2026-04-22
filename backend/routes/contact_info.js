const express = require("express");
const router = express.Router();
const db = require("../config/db");
const nodemailer = require("nodemailer");

// ==============================
// ✅ GET contact info
// ==============================
router.get("/contact-info", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM contact_info ORDER BY id DESC LIMIT 1"
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// ==============================
// ✅ SAVE contact info
// ==============================
router.post("/contact-info", async (req, res) => {
  try {
    const data = req.body;

    await db.query("DELETE FROM contact_info");

    await db.query(
      `INSERT INTO contact_info 
      (company_name, address, primary_phone, secondary_phone, whatsapp_number, email, map_embed_url, facebook_url, twitter_url, instagram_url, linkedin_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        data.company_name,
        data.address,
        data.primary_phone,
        data.secondary_phone,
        data.whatsapp_number,
        data.email,
        data.map_embed_url,
        data.facebook_url,
        data.twitter_url,
        data.instagram_url,
        data.linkedin_url
      ]
    );

    res.json({ message: "Saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Save failed" });
  }
});

// ==============================
// 🔥 ENQUIRY + EMAIL SEND
// ==============================
router.post("/enquiry", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // ✅ Save DB
    await db.query(
      `INSERT INTO enquiry_info (name, email, phone, subject, message)
       VALUES ($1,$2,$3,$4,$5)`,
      [name, email, phone, subject, message]
    );

    // ✅ Transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mpandiyan188@gmail.com",
        pass: "lblpmojrbdjbskyg"
      }
    });

    // ✅ MAIL (FINAL FIX)
    const mailOptions = {
      from: `"Course Enquiry" <devspetra@gmail.com>`, // 🔥 UI name change
      replyTo: email, // 👈 student email (important)
      to: "mpandiyan188@gmail.com", // admin mail
      subject: `📩 Course Enquiry from ${name}`, // 🔥 subject improve

      html: `
        <div style="font-family: Arial; padding: 20px">
          <h2 style="color:#0b1f3a">📩 Course Enquiry</h2>
          <hr/>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone || "-"}</p>
          <p><b>Subject:</b> ${subject || "-"}</p>
          <p><b>Message:</b></p>
          <p>${message}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Enquiry saved + Email sent ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed ❌" });
  }
});

// ==============================
// ✅ GET ALL ENQUIRIES
// ==============================
router.get("/enquiry", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM enquiry_info ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

module.exports = router;