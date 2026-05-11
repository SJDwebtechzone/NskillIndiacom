const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "mysecret";

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Join with 'users' table to get the correct centralized user_id
    const result = await pool.query(
      `SELECT pu.*, u.id AS main_user_id 
       FROM placement_users pu
       LEFT JOIN users u ON pu.email = u.email
       WHERE pu.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.status(400).json({ error: "Wrong password" });
    }

    // ✅ Generate Token using the main_user_id (central identity)
    const token = jwt.sign(
      { id: user.main_user_id || user.id, name: user.name, role: 'Student' },
      SECRET,
      { expiresIn: "1d" }
    );

    // ✅ SUCCESS
    res.json({
      message: "Login success",
      token,
      user: {
        id: user.main_user_id || user.id,
        full_name: user.name,
        email_id: user.email,
        phone_number: user.phone
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;