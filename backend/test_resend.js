require("dotenv").config({ path: "./.env" });
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
  console.log("Testing Resend...");
  console.log("API Key present:", !!process.env.RESEND_API_KEY);
  console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
  
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "no-reply@nskillindia.com",
      to: "rxshannn20@gmail.com",
      subject: "Test Resend Integration",
      html: "<p>If you see this, Resend is working.</p>"
    });
    
    if (data.error) {
      console.error("Resend API returned an error object:", data.error);
    } else {
      console.log("Resend success:", data);
    }
  } catch (err) {
    console.error("Exception thrown by Resend:", err.message);
  }
}

testResend();
