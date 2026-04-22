const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, status } = req.body;

    await pool.query(
      `INSERT INTO placement_users (name, email, password, phone, status)
       VALUES ($1,$2,$3,$4,$5)`,
      [name, email, password, phone, status]
    );

    res.json({ message: "User Registered Successfully" });

  } catch (err) {
    console.error(err);

    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;