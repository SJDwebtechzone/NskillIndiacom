const cron = require('node-cron');
const pool = require('../config/db');

// List of modules mapped to their tables
const RESTORE_MODULES = [
  { name: "Enquiry", table: "student_enquiries" },
  { name: "Admission", table: "student_admissions" },
  { name: "User", table: "users" },
  { name: "Course", table: "courses" },
  { name: "Job", table: "jobs" },
  { name: "Associate", table: "career_counsellors" },
  { name: "Contact Location", table: "contact_locations" },
  { name: "Popup", table: "popups" },
  { name: "News", table: "latest_news" },
  { name: "Accreditation", table: "accreditations" },
  { name: "Background Image", table: "background_images" },
  { name: "Applied Job", table: "job_applications" },
  { name: "Placement", table: "student_placements" }
];

function initCronScheduler() {
  // Run everyday at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily Soft Delete cleanup job...');
    const client = await pool.connect();
    
    try {
      await client.query("BEGIN");
      await client.query("SET LOCAL app.show_deleted = 'true'");

      for (const mod of RESTORE_MODULES) {
        try {
          const res = await client.query(`
            DELETE FROM ${mod.table} 
            WHERE is_deleted = true 
            AND deleted_at <= NOW() - INTERVAL '30 days'
            RETURNING id
          `);
          if (res.rowCount > 0) {
            console.log(`Permanently deleted ${res.rowCount} old records from ${mod.table}.`);
            // Optionally insert into audit logs
            for (const row of res.rows) {
              await client.query(`
                INSERT INTO audit_logs (user_id, action, module, record_id)
                VALUES (NULL, 'CRON_PERMANENT_DELETE', $1, $2)
              `, [mod.name, row.id]);
            }
          }
        } catch (err) {
          console.error(`Error cleaning up ${mod.table}:`, err.message);
        }
      }
      
      await client.query("COMMIT");
      console.log('Daily Soft Delete cleanup completed.');
    } catch (error) {
      await client.query("ROLLBACK");
      console.error('Error in daily cleanup job:', error);
    } finally {
      client.release();
    }
  });
}

module.exports = { initCronScheduler, RESTORE_MODULES };
