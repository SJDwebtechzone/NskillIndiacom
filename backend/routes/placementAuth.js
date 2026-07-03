const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "mysecret";

// ✅ REGISTER
router.post("/register", async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, email, password, phone, status } = req.body;

    await client.query("BEGIN");

    // 1. Insert into main 'users' table first to get a valid user_id
    // role_id 6 is 'Student'
    const userResult = await client.query(
      `INSERT INTO users (name, email, password, phone_number, role_id, status)
       VALUES ($1, $2, $3, $4, 6, 'Active') RETURNING id`,
      [name, email, password, phone]
    );

    const userId = userResult.rows[0].id;

    // 2. Insert into 'placement_users' table (using the same ID or just for legacy compatibility)
    await client.query(
      `INSERT INTO placement_users (id, name, email, password, phone, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, name, email, password, phone, status]
    );

    // 3. AUTOMATIC REMINDER SYSTEM
    // Find if there's an active mail template that has reminders enabled
    const templateResult = await client.query(
      `SELECT * FROM mail_templates WHERE is_active = true AND enable_reminder = true LIMIT 1`
    );

    if (templateResult.rows.length > 0) {
      const template = templateResult.rows[0];
      
      // Default Job Fair date to 30 days from now since we don't have a specific event selected
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 30);
      
      // Calculate next send date based on start delay
      const nextSendDate = new Date();
      nextSendDate.setDate(nextSendDate.getDate() + (template.reminder_start_delay_days || 0));

      // Calculate stop date based on condition
      const stopDate = new Date(eventDate);
      if (template.reminder_stop_condition === 'Stop 1 Day Before') {
        stopDate.setDate(stopDate.getDate() - 1);
      } else if (template.reminder_stop_condition === 'Stop 2 Days Before') {
        stopDate.setDate(stopDate.getDate() - 2);
      }

      await client.query(
        `INSERT INTO mail_reminder_schedule 
          (student_id, event_id, event_date, mail_template_id, next_send_date, frequency_days, stop_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, 0, eventDate, template.id, nextSendDate, template.reminder_frequency_days || 1, stopDate]
      );
    }

    await client.query("COMMIT");

    // ✅ Generate Token using the main users.id
    const token = jwt.sign(
      { id: userId, name: name, role: 'Student' },
      SECRET,
      { expiresIn: "1d" }
    );

    res.json({ 
      message: "User Registered Successfully",
      token,
      user: {
        id: userId,
        full_name: name,
        email_id: email,
        phone_number: phone,
        status: status
      }
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);

    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

module.exports = router;