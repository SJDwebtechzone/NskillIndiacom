const pool = require("./config/db");

async function migrate() {
  try {
    console.log("Starting profile table migration...");
    
    const queries = [
      "ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS degree TEXT",
      "ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS college_name TEXT",
      "ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS academic_achievements JSONB DEFAULT '[]'",
      "ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE",
      "ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS phone_number CHARACTER VARYING(20)",
      "ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'",
      // Ensure existing columns are the correct type if needed
      "ALTER TABLE student_profiles ALTER COLUMN education_history TYPE JSONB USING education_history::JSONB",
      "ALTER TABLE student_profiles ALTER COLUMN skills TYPE JSONB USING skills::JSONB",
      "ALTER TABLE student_profiles ALTER COLUMN languages TYPE JSONB USING languages::JSONB",
      "ALTER TABLE student_profiles ALTER COLUMN internships TYPE JSONB USING internships::JSONB",
      "ALTER TABLE student_profiles ALTER COLUMN projects TYPE JSONB USING projects::JSONB",
      "ALTER TABLE student_profiles ALTER COLUMN employment_history TYPE JSONB USING employment_history::JSONB",
      "ALTER TABLE student_profiles ALTER COLUMN certifications TYPE JSONB USING certifications::JSONB"
    ];

    for (const query of queries) {
      try {
        await pool.query(query);
        console.log(`✅ Success: ${query.slice(0, 50)}...`);
      } catch (err) {
        console.warn(`⚠️ Note: ${err.message}`);
      }
    }

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();
