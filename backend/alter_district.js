const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nskillindia_db',
  password: 'root3',
  port: 5432,
});

async function alterTables() {
  try {
    await pool.query(`ALTER TABLE student_admissions ADD COLUMN district VARCHAR(255);`);
    console.log("Added district to student_admissions.");
  } catch(e) {
    console.log("student_admissions:", e.message);
  }
  
  try {
    await pool.query(`ALTER TABLE student_enquiries ADD COLUMN district VARCHAR(255);`);
    console.log("Added district to student_enquiries.");
  } catch(e) {
    console.log("student_enquiries:", e.message);
  }
  
  await pool.end();
}

alterTables();
