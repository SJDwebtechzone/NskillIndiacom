const pool = require('./config/db');

async function run() {
  try {
    const res = await pool.query("SELECT id, name, email, password, phone FROM placement_users WHERE name ILIKE '%praveen%' OR email ILIKE '%praveen%'");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
