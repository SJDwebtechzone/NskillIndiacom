const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const pool = require("../config/db");

async function run() {
    try {
        console.log("Checking and adding has_guardian_id_file and has_weekly_test_file columns...");
        
        await pool.query("ALTER TABLE student_admissions ADD COLUMN IF NOT EXISTS has_guardian_id_file TEXT");
        console.log("Added column has_guardian_id_file successfully.");
        
        await pool.query("ALTER TABLE student_admissions ADD COLUMN IF NOT EXISTS has_weekly_test_file TEXT");
        console.log("Added column has_weekly_test_file successfully.");
        
        console.log("Done!");
    } catch (err) {
        console.error("Migration error:", err.message);
    } finally {
        pool.end();
    }
}

run();
