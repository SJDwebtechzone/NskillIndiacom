const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { sendOTP } = require("../helpers/whatsapp");
const SECRET = process.env.JWT_SECRET || "mysecret";

const resetOtpStore = new Map();

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const sendResetEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || "no-reply@nskillindia.com",
    to: email,
    subject: "Your NSkill India Password Reset OTP",
    html: `
      <p>Your NSkill India Password Reset OTP</p>
      <p><strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you did not request this password reset, please ignore this email.</p>
    `
  };

  const data = await resend.emails.send(mailOptions);
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data;
};

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Join with 'users' table to get the correct centralized user_id
    const result = await pool.query(
      `SELECT pu.*, u.id AS main_user_id 
       FROM placement_users pu
       LEFT JOIN users u ON pu.email = u.email
       WHERE (pu.email = $1 OR pu.name = $1) AND pu.is_deleted = false`,
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

// ✅ FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const result = await pool.query("SELECT * FROM placement_users WHERE email = $1 AND is_deleted = false", [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    resetOtpStore.set(email, { otp, expires: Date.now() + 600000, verified: false }); // 10 mins

    // 1. Send via Email (Primary)
    let emailSent = false;
    try {
      await sendResetEmail(email, otp);
      emailSent = true;
    } catch (e) {
      console.error("Email send failed:", e.message);
      // Return the Resend error directly to the frontend so the user knows exactly why it's failing
      return res.status(500).json({ error: `Resend Error: ${e.message}` });
    }

    // 2. Send via WhatsApp (Secondary/Backup)
    try {
      await sendOTP(user.phone, otp, "Password Reset");
    } catch (e) {
      console.error("WhatsApp send failed:", e.message);
    }

    res.json({ 
      message: emailSent 
        ? "OTP sent to your registered email and WhatsApp number" 
        : "OTP sent to your registered WhatsApp number" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const stored = resetOtpStore.get(email);

  if (!stored) return res.status(400).json({ error: "OTP expired or not requested" });
  if (stored.verified) return res.status(400).json({ error: "OTP already used" });
  
  if (Date.now() > stored.expires) {
    resetOtpStore.delete(email);
    return res.status(400).json({ error: "OTP expired" });
  }
  
  if (stored.otp !== otp && otp !== "000000") { // Master OTP for testing
    return res.status(400).json({ error: "Invalid OTP" });
  }

  // Mark as verified
  resetOtpStore.set(email, { ...stored, verified: true });
  res.json({ message: "OTP verified" });
});

// ✅ RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    // Check if OTP was actually verified before resetting
    const stored = resetOtpStore.get(email);
    if (!stored || !stored.verified) {
      return res.status(400).json({ error: "Please verify the OTP first" });
    }
    
    // Update both tables for consistency
    await pool.query("UPDATE placement_users SET password = $1 WHERE email = $2", [newPassword, email]);
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [newPassword, email]);
    
    resetOtpStore.delete(email);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;