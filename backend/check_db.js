const pool = require('./config/db');
pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'student_admissions'")
  .then(res => { console.log(res.rows.slice(100)); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
