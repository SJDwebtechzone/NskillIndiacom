const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const multer = require("multer");
const path = require("path");
const { Resend } = require("resend");

const { handleSingleUpload } = require("../utils/fileUpload");

// ✅ GET ALL JOBS
router.get("/jobs", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM jobs WHERE is_deleted = false ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching jobs" });
  }
});

// ✅ ADD JOB
router.post("/add-job", async (req, res) => {
  const { 
    title, company, location, salary, job_type, skills, experience, description,
    use_default_email, thank_you_template_id, reminder_template_id, enable_reminder,
    event_date, event_time, event_location
  } = req.body;
  try {
    await pool.query(
      `INSERT INTO jobs (
        title, company, location, salary, job_type, skills, experience, description,
        use_default_email, thank_you_template_id, reminder_template_id, enable_reminder,
        event_date, event_time, event_location
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        title, company, location, salary, job_type, skills, experience, description,
        use_default_email !== undefined ? use_default_email : true,
        thank_you_template_id || null,
        reminder_template_id || null,
        enable_reminder || false,
        event_date || null,
        event_time || null,
        event_location || null
      ]
    );
    res.json({ message: "Job added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert failed" });
  }
});

// ✅ UPDATE JOB
router.put("/update-job/:id", async (req, res) => {
  const { id } = req.params;
  const { 
    title, company, location, salary, job_type, skills, experience, description,
    use_default_email, thank_you_template_id, reminder_template_id, enable_reminder,
    event_date, event_time, event_location
  } = req.body;
  try {
    await pool.query(
      `UPDATE jobs SET
        title = $1, company = $2, location = $3, salary = $4, job_type = $5, 
        skills = $6, experience = $7, description = $8,
        use_default_email = $9, thank_you_template_id = $10, reminder_template_id = $11, 
        enable_reminder = $12, event_date = $13, event_time = $14, event_location = $15
       WHERE id = $16`,
      [
        title, company, location, salary, job_type, skills, experience, description,
        use_default_email !== undefined ? use_default_email : true,
        thank_you_template_id || null,
        reminder_template_id || null,
        enable_reminder || false,
        event_date || null,
        event_time || null,
        event_location || null,
        id
      ]
    );
    res.json({ message: "Job updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

// ✅ DELETE JOB
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE jobs SET is_deleted = true, deleted_at = NOW() WHERE id = $1", [id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// ✅ APPLY FOR JOB
router.post("/apply", handleSingleUpload("resume", true), async (req, res) => {
  try {
    const { job_id, name, email, mobile_number, location, qualification, skills, experience } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Resume file is required" });
    }

    await pool.query(
      `INSERT INTO job_applications 
        (job_id, name, email, mobile_number, location, qualification, skills, experience, resume_filename, resume_data, resume_mimetype)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        job_id, name, email, mobile_number, location, qualification, skills, experience,
        req.file.originalname,
        req.file.buffer,
        req.file.mimetype,
      ]
    );

    // ✅ SEND CONFIRMATION EMAIL OR CUSTOM EMAIL
    try {
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const jobResult = await pool.query(
          `SELECT title, company, use_default_email, thank_you_template_id, 
                  reminder_template_id, enable_reminder, event_date, event_time, event_location 
           FROM jobs WHERE id = $1`, 
          [job_id]
        );
        
        if (jobResult.rows.length > 0) {
          const jobData = jobResult.rows[0];
          const jobTitle = jobData.title || "the position";
          const company = jobData.company || "our company";
          
          if (jobData.use_default_email) {
            // BUILT-IN EMAIL
            await resend.emails.send({
              from: process.env.EMAIL_FROM || "no-reply@nskillindia.com",
              to: email,
              subject: `Application Received: ${jobTitle}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h2 style="color: #2f55e4;">Application Received</h2>
                  <p>Dear <strong>${name}</strong>,</p>
                  <p>Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>${company}</strong> through NSkill India.</p>
                  <p>Your application and resume have been successfully submitted and are currently under review by our placement team.</p>
                  <p>We will contact you if your profile matches our requirements.</p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                  <p style="font-size: 12px; color: #7c829c; text-align: center;">© NSkill Training Institute</p>
                </div>
              `
            });
          } else if (jobData.thank_you_template_id) {
            // CUSTOM EMAIL
            const tplResult = await pool.query("SELECT * FROM mail_templates WHERE id = $1", [jobData.thank_you_template_id]);
            if (tplResult.rows.length > 0) {
              const tpl = tplResult.rows[0];
              
              // Import dynamic replacement function
              const { replaceDynamicVariables } = require('../utils/emailScheduler');
              
              const mailSubject = replaceDynamicVariables(tpl.subject, name, jobTitle, jobData.event_date, 0);
              let mailBody = replaceDynamicVariables(tpl.body, name, jobTitle, jobData.event_date, 0);
              
              // Also replace additional variables specific to this context
              mailBody = mailBody
                .replace(/{{job_title}}/g, jobTitle)
                .replace(/{{company_name}}/g, company)
                .replace(/{{event_time}}/g, jobData.event_time || 'TBD')
                .replace(/{{event_location}}/g, jobData.event_location || 'TBD');
              
              const mailOptions = {
                from: process.env.EMAIL_FROM || "no-reply@nskillindia.com",
                to: email,
                subject: mailSubject,
                html: mailBody.replace(/\n/g, '<br>')
              };
              
              // Attach PDF if exists
              if (tpl.attached_pdf) {
                const fs = require('fs');
                const filePath = path.join(__dirname, '..', 'uploads', tpl.attached_pdf);
                if (fs.existsSync(filePath)) {
                  const fileContent = fs.readFileSync(filePath);
                  mailOptions.attachments = [
                    {
                      filename: tpl.attached_pdf,
                      content: fileContent
                    }
                  ];
                }
              }
              
              await resend.emails.send(mailOptions);
              
              // SCHEDULE REMINDER
              if (jobData.enable_reminder && jobData.reminder_template_id) {
                const rTplResult = await pool.query("SELECT * FROM mail_templates WHERE id = $1", [jobData.reminder_template_id]);
                if (rTplResult.rows.length > 0) {
                  const rTpl = rTplResult.rows[0];
                  
                  // Check if student exists in main users table, fallback to 0 or placement_users logic
                  const uRes = await pool.query("SELECT id FROM users WHERE email = $1 AND is_deleted = false LIMIT 1", [email]);
                  const studentId = uRes.rows.length > 0 ? uRes.rows[0].id : null;
                  
                  if (studentId) {
                    const eDate = jobData.event_date ? new Date(jobData.event_date) : new Date();
                    
                    const nextSendDate = new Date();
                    nextSendDate.setDate(nextSendDate.getDate() + (rTpl.reminder_start_delay_days || 0));

                    const stopDate = new Date(eDate);
                    if (rTpl.reminder_stop_condition === 'Stop 1 Day Before') {
                      stopDate.setDate(stopDate.getDate() - 1);
                    } else if (rTpl.reminder_stop_condition === 'Stop 2 Days Before') {
                      stopDate.setDate(stopDate.getDate() - 2);
                    }
                    
                    await pool.query(
                      `INSERT INTO mail_reminder_schedule 
                        (student_id, event_id, event_date, mail_template_id, next_send_date, frequency_days, stop_date, status)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Active')`,
                      [studentId, job_id, eDate, rTpl.id, nextSendDate, rTpl.reminder_frequency_days || 1, stopDate]
                    );
                  }
                }
              }
            }
          }
        }
      }
    } catch (emailErr) {
      console.error("Job Application Email failed to send:", emailErr.message);
    }

    res.status(201).json({ message: "Application submitted successfully" });
  } catch (err) {
    console.error("POST /apply error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ALL APPLICATIONS (admin)
router.get("/applications", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ja.id, ja.job_id, ja.name, ja.email, ja.mobile_number, ja.location, ja.qualification, ja.skills, ja.experience, 
              ja.resume_filename, ja.resume_mimetype, ja.applied_at, j.title as job_title
       FROM job_applications ja
       LEFT JOIN jobs j ON ja.job_id = j.id
       WHERE ja.is_deleted = false
       ORDER BY ja.applied_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /applications error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DOWNLOAD RESUME
router.get("/resume/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT resume_filename, resume_data, resume_mimetype FROM job_applications WHERE id = $1 AND is_deleted = false",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const { resume_filename, resume_data, resume_mimetype } = result.rows[0];
    res.setHeader("Content-Type", resume_mimetype || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${resume_filename}"`);
    res.send(resume_data);
  } catch (err) {
    console.error("GET /resume/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE APPLICATION
router.delete("/application/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE job_applications SET is_deleted = true, deleted_at = NOW() WHERE id = $1", [id]);
    res.json({ message: "Application deleted" });
  } catch (err) {
    console.error("DELETE /application/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
