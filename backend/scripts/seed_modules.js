const pg = require('pg');
const pool = new pg.Pool({ user: 'postgres', host: 'localhost', database: 'nskillindia_db', password: '1234', port: 5432 });

const modules = [
  "NTSC Admin", "Associate", "Students", "Staff / Trainee", "Manage Users", "Manage Roles",
  "Home", "Homepage Banner", "Feature Popup", "Latest News", "Accreditions", "Contact Info",
  "Associate Dashboard", "Enquiry Form", "Admission Form", "Referral Fee Tracking", "Referral Fee History",
  "StudentDashboard", "ID Generation", "Course and Fees Details", "Fees Receipt",

  // ── Pre-Test ──
  "Trainer Pre-Test",
  "MyPreTest",

  // ── Post-Test ──
  "Trainer Post-Test",
  "My Weekly Test",

  // ── Assessment ──
  "Assessment and Assignment",  // shared module name in sidebar
  "Trainer Assessment",         // trainer permission
  "My Assessment",              // student permission

  // ── Practical Video ──
  "Trainer Practical Video",    // ← trainer manages tasks + verifies
  "My Practical Video",         // ← student uploads videos

  "Daily Attendance", "Practical Video",
  "Final Exam", "Mark and Result", "Certification", "Placement Details Uploads",
  "Feedback & Testimonial", "Google Review & Videos", "Fee Details",

  // ── Trainer Management ──
  "TrainerDashboard", "Class Status", "Attendance Status", "Trainer Management",
  "Weekly Test",

  // ── Missing modules ──
  "Dashboard",
  "Payments",
  "Course Management",
  "Background Images",

  "NTSC Dashboard", "Download A4 Sheet", "Enquiry / Admission and Document",
  "Update Class Status", "Monitor Student Changes and Approval"
];
const slugify = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

async function seedModules() {
  try {
    console.log("Truncating modules...");
    await pool.query('TRUNCATE TABLE modules CASCADE');

    let id = 1;
    for (const name of [...new Set(modules)]) {
      await pool.query(`INSERT INTO modules (id, name, slug) VALUES ($1, $2, $3)`, [id++, name, slugify(name)]);
    }
    console.log("Modules seeded successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

seedModules();