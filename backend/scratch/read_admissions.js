const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const pool = require("../config/db");

async function run() {
    try {
        const res = await pool.query("SELECT id, enquiry_id, admission_number, full_name, course_name, admission_date, status, created_at FROM student_admissions ORDER BY created_at DESC");
        console.log(`Total admissions found: ${res.rows.length}\n`);
        res.rows.forEach((row, i) => {
            console.log(`${i+1}. ID: ${row.id} | Enquiry ID: ${row.enquiry_id} | Admission No: ${row.admission_number} | Name: ${row.full_name} | Course: ${row.course_name} | Date: ${row.admission_date} | Status: ${row.status}`);
        });
    } catch (err) {
        console.error("Error reading admissions:", err);
    } finally {
        pool.end();
    }
}

run();
