const pool = require("../config/db");

async function migrate() {
  try {
    console.log("Adding resume_url column to student_profiles...");
    await pool.query("ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS resume_url TEXT;");
    console.log("Success!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
