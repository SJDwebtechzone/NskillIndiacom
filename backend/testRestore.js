const pool = require('./config/db');

async function test() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL app.show_deleted = 'true'");
    const result = await client.query(`SELECT id, full_name as title, is_deleted, deleted_at, deleted_by FROM career_counsellors WHERE is_deleted = true`);
    console.log(result.rows);
    await client.query("COMMIT");
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    process.exit(0);
  }
}

test();
