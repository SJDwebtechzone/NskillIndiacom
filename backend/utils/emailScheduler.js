const cron = require('node-cron');
const pool = require('../config/db');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Fallback to Nodemailer if Resend is not configured (requires MAIL_USER and MAIL_PASS)
const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.MAIL_USER || 'your-email@gmail.com',
    pass: process.env.MAIL_PASS || 'your-app-password'
  }
});

/**
 * Replace dynamic variables in the template text
 */
function replaceDynamicVariables(text, studentName, eventName, eventDate, daysRemaining) {
    if (!text) return '';
    return text
        .replace(/{{student_name}}/g, studentName || 'Student')
        .replace(/{{event_name}}/g, eventName || 'Mega Placement Drive')
        .replace(/{{event_date}}/g, eventDate || 'TBD')
        .replace(/{{days_remaining}}/g, daysRemaining || '0')
        .replace(/{{company_name}}/g, 'NSkill India')
        .replace(/{{job_title}}/g, 'the position')
        .replace(/{{event_time}}/g, '10:00 AM')
        .replace(/{{event_location}}/g, 'Main Campus')
        .replace(/{{reporting_time}}/g, '09:00 AM')
        .replace(/{{support_email}}/g, 'support@nskillindia.com')
        .replace(/{{support_phone}}/g, '+91-1234567890');
}

/**
 * Run the scheduler every day at 8:00 AM
 */
const startScheduler = () => {
    cron.schedule('0 8 * * *', async () => {
        console.log('Running Automatic Email Reminder Scheduler...');
        try {
            // Find all active reminder schedules where next_send_date is today or in the past
            const schedulesResult = await pool.query(`
                SELECT s.*, t.name as template_name, t.subject, t.body, t.attached_pdf,
                       u.name as student_name, u.email as student_email,
                       j.title as job_title, j.company as company_name, j.event_time, j.event_location
                FROM mail_reminder_schedule s
                JOIN mail_templates t ON s.mail_template_id = t.id
                JOIN users u ON s.student_id = u.id
                LEFT JOIN jobs j ON s.event_id = j.id
                WHERE s.status = 'Active' 
                  AND s.next_send_date <= CURRENT_DATE
                  AND u.is_deleted = false
            `);

            const schedules = schedulesResult.rows;

            for (const schedule of schedules) {
                // Calculate days remaining
                const eventDate = new Date(schedule.event_date);
                const today = new Date();
                const diffTime = eventDate - today;
                const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

                // Prepare email
                let mailSubject = replaceDynamicVariables(schedule.subject, schedule.student_name, "Job Fair", schedule.event_date, daysRemaining);
                let mailBody = replaceDynamicVariables(schedule.body, schedule.student_name, "Job Fair", schedule.event_date, daysRemaining);

                // Inject job-specific variables
                if (schedule.job_title) {
                  mailSubject = mailSubject.replace(/{{job_title}}/g, schedule.job_title).replace(/{{company_name}}/g, schedule.company_name);
                  mailBody = mailBody
                    .replace(/{{job_title}}/g, schedule.job_title)
                    .replace(/{{company_name}}/g, schedule.company_name)
                    .replace(/{{event_time}}/g, schedule.event_time || 'TBD')
                    .replace(/{{event_location}}/g, schedule.event_location || 'TBD');
                }

                let deliveryStatus = 'Sent';
                let errorMessage = null;

                try {
                    // Send Email using Resend if available, otherwise Nodemailer
                    const fromEmail = process.env.EMAIL_FROM || process.env.MAIL_USER || 'no-reply@nskillindia.com';
                    
                    if (resend) {
                        const data = await resend.emails.send({
                            from: fromEmail,
                            to: schedule.student_email,
                            subject: mailSubject,
                            text: mailBody,
                            html: mailBody.replace(/\n/g, '<br>')
                        });
                        
                        if (data.error) {
                            throw new Error(data.error.message);
                        }
                    } else if (process.env.MAIL_USER && process.env.MAIL_PASS) {
                        // Fallback to Nodemailer
                        const mailOptions = {
                            from: fromEmail,
                            to: schedule.student_email,
                            subject: mailSubject,
                            text: mailBody,
                            html: mailBody.replace(/\n/g, '<br>')
                        };
                        await transporter.sendMail(mailOptions);
                    } else {
                        console.log(`[SIMULATED EMAIL] To: ${schedule.student_email}, Subject: ${mailSubject}`);
                    }
                } catch (err) {
                    console.error('Failed to send email:', err);
                    deliveryStatus = 'Failed';
                    errorMessage = err.message;
                }

                // Log the email
                await pool.query(`
                    INSERT INTO email_logs (student_id, event_id, mail_template_id, recipient_email, subject, delivery_status, error_message)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [schedule.student_id, schedule.event_id, schedule.mail_template_id, schedule.student_email, mailSubject, deliveryStatus, errorMessage]);

                // Update schedule
                if (deliveryStatus === 'Sent') {
                    // Calculate next send date
                    const nextSendDate = new Date();
                    nextSendDate.setDate(nextSendDate.getDate() + schedule.frequency_days);

                    // Check if we need to stop
                    const stopDate = new Date(schedule.stop_date);
                    
                    if (nextSendDate >= stopDate || nextSendDate >= eventDate) {
                        // Mark as completed
                        await pool.query(`
                            UPDATE mail_reminder_schedule 
                            SET status = 'Completed', last_sent_at = NOW(), updated_at = NOW()
                            WHERE id = $1
                        `, [schedule.id]);
                    } else {
                        // Update next send date
                        await pool.query(`
                            UPDATE mail_reminder_schedule 
                            SET next_send_date = $1, last_sent_at = NOW(), updated_at = NOW()
                            WHERE id = $2
                        `, [nextSendDate, schedule.id]);
                    }
                }
            }
        } catch (err) {
            console.error('Error running email scheduler:', err);
        }
    });
    console.log('Automatic Email Reminder Scheduler initialized.');
};

module.exports = { startScheduler, replaceDynamicVariables };
