const pool = require("../config/db");

async function migrate() {
  try {
    console.log("Adding mobile_number column to job_applications table...");
    await pool.query("ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20)");
    console.log("Column added successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
