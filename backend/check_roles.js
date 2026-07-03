const pg = require('pg');
const pool = new pg.Pool({
  user:     process.env.DB_USER     || 'postgres',
  host:     process.env.DB_HOST     || 'localhost',
  database: process.env.DB_NAME     || 'nskillindia_db',
  password: process.env.DB_PASSWORD || 'root3',
  port:     parseInt(process.env.DB_PORT || '5432'),
});
async function check() {
  try {
    const res = await pool.query('SELECT * FROM roles');
    console.log('Roles:', res.rows);
  } finally { pool.end(); }
}
check();
