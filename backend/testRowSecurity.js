const pool = require('./config/db');

async function test() {
  const result = await pool.query(`SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname IN ('student_enquiries', 'users', 'student_admissions')`);
  console.log(result.rows);
  process.exit(0);
}

test();
