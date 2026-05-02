const express = require("express");
const router = express.Router();
const db = require("../config/db");
const nodemailer = require("nodemailer");

// ==============================
// 🚀 AUTO-CREATE TABLE ON STARTUP
// ==============================
const initTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS contact_locations (
        id SERIAL PRIMARY KEY,
        location_name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        primary_phone VARCHAR(50),
        secondary_phone VARCHAR(50),
        whatsapp_number VARCHAR(50),
        email VARCHAR(255),
        map_embed_url TEXT,
        facebook_url TEXT,
        twitter_url TEXT,
        instagram_url TEXT,
        linkedin_url TEXT,
        is_primary BOOLEAN DEFAULT false,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add social columns if table already exists without them
    const alterCols = [
      "ALTER TABLE contact_locations ADD COLUMN IF NOT EXISTS facebook_url TEXT",
      "ALTER TABLE contact_locations ADD COLUMN IF NOT EXISTS twitter_url TEXT",
      "ALTER TABLE contact_locations ADD COLUMN IF NOT EXISTS instagram_url TEXT",
      "ALTER TABLE contact_locations ADD COLUMN IF NOT EXISTS linkedin_url TEXT",
    ];
    for (const sql of alterCols) {
      await db.query(sql);
    }

    console.log("✅ contact_locations table ready");
  } catch (err) {
    console.error("❌ Table init error:", err.message);
  }
};

initTable();

// ==============================
// ✅ GET contact info (legacy)
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
// ✅ SAVE contact info (legacy)
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
        data.company_name, data.address, data.primary_phone,
        data.secondary_phone, data.whatsapp_number, data.email,
        data.map_embed_url, data.facebook_url, data.twitter_url,
        data.instagram_url, data.linkedin_url
      ]
    );
    res.json({ message: "Saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Save failed" });
  }
});

// ==============================
// 🏢 GET ALL LOCATIONS
// ==============================
router.get("/locations", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM contact_locations ORDER BY sort_order ASC, id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch locations error:", err);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// ==============================
// 🏢 GET SINGLE LOCATION
// ==============================
router.get("/locations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT * FROM contact_locations WHERE id = $1", [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch location" });
  }
});

// ==============================
// 🏢 ADD NEW LOCATION ✅ FIXED — includes social fields
// ==============================
router.post("/locations", async (req, res) => {
  try {
    const {
      location_name, address, primary_phone, secondary_phone,
      whatsapp_number, email, map_embed_url,
      facebook_url, twitter_url, instagram_url, linkedin_url,
      is_primary, sort_order
    } = req.body;

    if (is_primary) {
      await db.query("UPDATE contact_locations SET is_primary = false");
    }

    const result = await db.query(
      `INSERT INTO contact_locations 
        (location_name, address, primary_phone, secondary_phone, whatsapp_number,
         email, map_embed_url, facebook_url, twitter_url, instagram_url, linkedin_url,
         is_primary, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        location_name, address,
        primary_phone   || null, secondary_phone || null,
        whatsapp_number || null, email           || null,
        map_embed_url   || null,
        facebook_url    || null, twitter_url     || null,
        instagram_url   || null, linkedin_url    || null,
        is_primary || false, sort_order || 0
      ]
    );
    res.json({ message: "Location added successfully", data: result.rows[0] });
  } catch (err) {
    console.error("Add location error:", err);
    res.status(500).json({ error: "Failed to add location" });
  }
});

// ==============================
// 🏢 UPDATE LOCATION ✅ FIXED — includes social fields
// ==============================
router.put("/locations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      location_name, address, primary_phone, secondary_phone,
      whatsapp_number, email, map_embed_url,
      facebook_url, twitter_url, instagram_url, linkedin_url,
      is_primary, sort_order
    } = req.body;

    if (is_primary) {
      await db.query(
        "UPDATE contact_locations SET is_primary = false WHERE id != $1", [id]
      );
    }

    const result = await db.query(
      `UPDATE contact_locations SET
        location_name   = $1,
        address         = $2,
        primary_phone   = $3,
        secondary_phone = $4,
        whatsapp_number = $5,
        email           = $6,
        map_embed_url   = $7,
        facebook_url    = $8,
        twitter_url     = $9,
        instagram_url   = $10,
        linkedin_url    = $11,
        is_primary      = $12,
        sort_order      = $13,
        updated_at      = NOW()
       WHERE id = $14
       RETURNING *`,
      [
        location_name, address,
        primary_phone   || null, secondary_phone || null,
        whatsapp_number || null, email           || null,
        map_embed_url   || null,
        facebook_url    || null, twitter_url     || null,
        instagram_url   || null, linkedin_url    || null,
        is_primary || false, sort_order || 0, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }
    res.json({ message: "Location updated successfully", data: result.rows[0] });
  } catch (err) {
    console.error("Update location error:", err);
    res.status(500).json({ error: "Failed to update location" });
  }
});

// ==============================
// 🏢 DELETE LOCATION
// ==============================
router.delete("/locations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM contact_locations WHERE id = $1 RETURNING *", [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }
    res.json({ message: "Location deleted successfully" });
  } catch (err) {
    console.error("Delete location error:", err);
    res.status(500).json({ error: "Failed to delete location" });
  }
});

// ==============================
// 🔥 ENQUIRY + EMAIL SEND
// ==============================
router.post("/enquiry", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    await db.query(
      `INSERT INTO enquiry_info (name, email, phone, subject, message) VALUES ($1,$2,$3,$4,$5)`,
      [name, email, phone, subject, message]
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions = {
      from: `"N-Skill Training Enquiry" <${process.env.MAIL_USER}>`,
      replyTo: email,
      to: process.env.ADMIN_EMAIL,
      subject: `New Enquiry - ${subject || "Course Info"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="background-color: #0b1f3a; padding: 20px; border-radius: 6px 6px 0 0; text-align: center;">
            <h2 style="color: #ffffff; margin: 0;">📩 New Course Enquiry</h2>
            <p style="color: #a0b4cc; margin: 5px 0 0;">N-Skill Training - Contact Form</p>
          </div>
          <div style="padding: 24px; background-color: #f9f9f9;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px; font-weight: bold; color: #0b1f3a; width: 140px;">👤 Name</td>
                <td style="padding: 10px; color: #333;">${name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px; font-weight: bold; color: #0b1f3a;">📧 Email</td>
                <td style="padding: 10px; color: #333;">${email}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px; font-weight: bold; color: #0b1f3a;">📞 Phone</td>
                <td style="padding: 10px; color: #333;">${phone || "-"}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px; font-weight: bold; color: #0b1f3a;">📌 Subject</td>
                <td style="padding: 10px; color: #333;">${subject || "-"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #0b1f3a; vertical-align: top;">💬 Message</td>
                <td style="padding: 10px; color: #333;">${message}</td>
              </tr>
            </table>
          </div>
          <div style="background-color: #0b1f3a; padding: 14px; border-radius: 0 0 6px 6px; text-align: center;">
            <p style="color: #a0b4cc; margin: 0; font-size: 13px;">This email was sent from the N-Skill Training website contact form.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Enquiry saved + Email sent ✅" });
  } catch (err) {
    console.error("Enquiry email error:", err);
    res.status(500).json({ error: "Failed ❌" });
  }
});

// ==============================
// ✅ GET ALL ENQUIRIES
// ==============================
router.get("/enquiry", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM enquiry_info ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

module.exports = router;
