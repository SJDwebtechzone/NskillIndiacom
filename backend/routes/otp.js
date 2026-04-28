// backend/routes/otp.js
const express = require("express");
const router  = express.Router();
const { sendOTP } = require("../helpers/whatsapp");

// Store OTPs in memory (fine for small scale)
// Key: phone number, Value: { otp, expiresAt }
const otpStore = new Map();

// POST /api/otp/send
router.post("/send", async (req, res) => {
  try {
    const { phone, name, course_title } = req.body;

    if (!phone || phone.length !== 10) {
      return res.status(400).json({ error: "Valid 10-digit phone required" });
    }

    // Generate 6-digit OTP
    const otp       = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(phone, { otp, expiresAt });

    // Send via WhatsApp
    const sent = await sendOTP(phone, otp, course_title ?? "the course");

    if (!sent) {
      return res.status(500).json({ error: "Failed to send OTP. Please try again." });
    }

    res.json({ success: true, message: "OTP sent to your WhatsApp" });
  } catch (err) {
    console.error("POST /api/otp/send error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/otp/verify
router.post("/verify", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone and OTP required" });
    }

    // Master OTP for local testing
    if (otp === "000000") {
      return res.json({ success: true, verified: true });
    }

    const stored = otpStore.get(phone);

    if (!stored) {
      return res.status(400).json({ error: "OTP expired or not found. Please resend." });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ error: "OTP has expired. Please resend." });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ error: "Incorrect OTP. Please try again." });
    }

    // OTP verified — remove from store
    otpStore.delete(phone);
    res.json({ success: true, verified: true });
  } catch (err) {
    console.error("POST /api/otp/verify error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;