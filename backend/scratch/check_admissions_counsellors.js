require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function main() {
  try {
    const res = await pool.query("SELECT DISTINCT counsellor_name, counsellor_code FROM student_admissions");
    console.log("Admissions Counsellors:", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
main();
