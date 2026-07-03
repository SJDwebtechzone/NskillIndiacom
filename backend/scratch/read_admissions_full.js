const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const pool = require("../config/db");

async function run() {
    try {
        const res = await pool.query("SELECT * FROM student_admissions ORDER BY created_at DESC");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error("Error reading admissions:", err);
    } finally {
        pool.end();
    }
}

run();
