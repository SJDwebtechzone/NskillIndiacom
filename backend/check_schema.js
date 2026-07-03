const pool = require('./config/db');
async function run() {
  const tables = ['jobs', 'mail_templates', 'mail_reminder_schedule'];
  for (const table of tables) {
    const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`, [table]);
    console.log(`--- ${table.toUpperCase()} ---`);
    console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
  }
  pool.end();
}
run();
