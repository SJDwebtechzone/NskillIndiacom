const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nskillindia_db',
  password: 'root3',
  port: 5432,
});

async function alterTable() {
  try {
    await pool.query(`ALTER TABLE student_admissions ADD COLUMN other_or_miscellaneous VARCHAR(255);`);
    console.log("Successfully added other_or_miscellaneous to student_admissions.");
  } catch (error) {
    if (error.code === '42701') {
      console.log("Column already exists.");
    } else {
      console.error("Error:", error);
    }
  } finally {
    await pool.end();
  }
}

alterTable();
