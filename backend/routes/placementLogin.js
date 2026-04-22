const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM placement_users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.status(400).json({ error: "Wrong password" });
    }

    // ✅ SUCCESS
    res.json({
      message: "Login success",
      user,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;