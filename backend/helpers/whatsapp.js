const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM  = process.env.TWILIO_WHATSAPP_FROM;
const ADMIN = process.env.ADMIN_WHATSAPP;

async function sendWhatsApp(to, message) {
  try {
    const toNumber   = to.startsWith("whatsapp:")   ? to   : `whatsapp:${to}`;
    const fromNumber = FROM.startsWith("whatsapp:") ? FROM : `whatsapp:${FROM}`;
    console.log("Sending FROM:", fromNumber, "TO:", toNumber);
    await client.messages.create({ from: fromNumber, to: toNumber, body: message });
    console.log(`✅ WhatsApp sent to ${toNumber}`);
    return true;
  } catch (err) {
    console.error("❌ WhatsApp send failed:", err.message);
    return false;
  }
}

async function sendOTP(phone, otp, courseName) {
  const message =
    `🔐 *NTSC Verification Code*\n\n` +
    `Your OTP for downloading the *${courseName}* brochure is:\n\n` +
    `*${otp}*\n\n` +
    `This OTP is valid for 10 minutes.\n` +
    `Do not share this with anyone.\n\n` +
    `— NTSC Training Institute`;
  return sendWhatsApp(`whatsapp:+91${phone}`, message);
}

async function sendBrochureToUser(phone, name, courseName, brochureUrl) {
  const fullUrl = brochureUrl.startsWith("http")
    ? brochureUrl
    : `${process.env.BACKEND_URL || "http://localhost:5000"}${brochureUrl}`;
  const message =
    `📄 *Your NTSC Brochure is Ready!*\n\n` +
    `Hi *${name}*! 👋\n\n` +
    `Thank you for your interest in *${courseName}*.\n\n` +
    `📥 Download your brochure here:\n${fullUrl}\n\n` +
    `Our admissions team will contact you shortly.\n\n` +
    `📞 Call/WhatsApp: *+91 98842 09774*\n\n` +
    `— NTSC Training Institute, Chennai`;
  return sendWhatsApp(`whatsapp:+91${phone}`, message);
}

async function sendLeadAlertToAdmin(name, email, phone, courseName) {
  const time = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", day: "numeric", month: "short",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const message =
    `📥 *New Brochure Lead*\n\n` +
    `👤 Name: ${name}\n` +
    `📧 Email: ${email}\n` +
    `📱 Phone: +91 ${phone}\n` +
    `📚 Course: ${courseName}\n` +
    `🕐 Time: ${time}\n\n` +
    `Reply to follow up with this lead.`;
  return sendWhatsApp(ADMIN, message);
}

async function sendDemoAlertToAdmin(name, email, phone, courseName, date, time, address) {
  const bookedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", day: "numeric", month: "short",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const message =
    `📅 *New Demo Booking*\n\n` +
    `👤 Name: ${name}\n` +
    `📧 Email: ${email}\n` +
    `📱 Phone: +91 ${phone}\n` +
    `📚 Course: ${courseName}\n` +
    `📆 Date: ${date}\n` +
    `⏰ Time: ${time}\n` +
    `📍 Area: ${address || "Not provided"}\n` +
    `🕐 Booked at: ${bookedAt}\n\n` +
    `Reply to confirm the booking.`;
  return sendWhatsApp(ADMIN, message);
}

module.exports = {
  sendWhatsApp,
  sendOTP,
  sendBrochureToUser,
  sendLeadAlertToAdmin,
  sendDemoAlertToAdmin,
};