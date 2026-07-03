const pool = require('../config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Starting jobs table migration...");
    await client.query("BEGIN");

    await client.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS use_default_email BOOLEAN DEFAULT TRUE`);
    await client.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS thank_you_template_id INTEGER`);
    await client.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS reminder_template_id INTEGER`);
    await client.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS enable_reminder BOOLEAN DEFAULT FALSE`);
    await client.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS event_date DATE`);
    await client.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS event_time VARCHAR(50)`);
    await client.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS event_location VARCHAR(255)`);

    await client.query("COMMIT");
    console.log("Jobs table migration successful.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
