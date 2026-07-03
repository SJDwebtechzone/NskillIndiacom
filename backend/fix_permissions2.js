const pool = require('./config/db');

async function run() {
  try {
    await pool.query("UPDATE permissions SET module = 'advertisement' WHERE module = 'Advertisement'");
    await pool.query("UPDATE permissions SET module = 'mail-templates' WHERE module = 'Mail Templates'");
    console.log('Permissions casing fixed successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
