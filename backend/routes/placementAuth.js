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