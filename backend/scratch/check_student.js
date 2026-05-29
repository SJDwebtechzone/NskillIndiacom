const pool = require("../config/db");

async function check() {
    try {
        console.log("Fetching student admission records for 'Krish'...");
        const res = await pool.query("SELECT id, full_name, counsellor_name, counsellor_code, highest_qualification FROM student_admissions WHERE full_name ILIKE '%Krish%'");
        console.log("Results:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error("Error fetching student:", err.message);
    } finally {
        pool.end();
    }
}

check();
