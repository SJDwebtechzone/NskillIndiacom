const pool = require("../config/db");

async function run() {
    try {
        console.log("Altering table student_admissions to add emergency_contact_relationship...");
        await pool.query("ALTER TABLE student_admissions ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100);");
        console.log("Column added successfully!");
    } catch (err) {
        console.error("Error altering table:", err.message);
    } finally {
        pool.end();
    }
}

run();
