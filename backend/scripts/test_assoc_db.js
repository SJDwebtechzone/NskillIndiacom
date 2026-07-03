require("dotenv").config({ path: __dirname + '/../.env' });
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "ntsc",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
});

async function run() {
  try {
    const assocs = await pool.query(`
      SELECT id, full_name, email, status, created_at, is_deleted, (password_hash IS NOT NULL) AS has_pwd
      FROM career_counsellors
      ORDER BY id DESC
      LIMIT 10
    `);
    console.log("CAREER COUNSELLORS:", assocs.rows);
    
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
