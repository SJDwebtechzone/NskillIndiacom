const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nskillindia_db',
  password: 'root3',
  port: 5432,
});

async function getSchema() {
  try {
    let schemaStr = "";

    const res1 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'student_admissions'
      ORDER BY ordinal_position;
    `);
    schemaStr += "CREATE TABLE student_admissions (\n";
    res1.rows.forEach(r => {
      schemaStr += `    ${r.column_name} ${r.data_type},\n`;
    });
    schemaStr += ");\n\n";

    const res2 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'student_enquiries'
      ORDER BY ordinal_position;
    `);
    schemaStr += "CREATE TABLE student_enquiries (\n";
    res2.rows.forEach(r => {
      schemaStr += `    ${r.column_name} ${r.data_type},\n`;
    });
    schemaStr += ");\n";

    fs.writeFileSync('schema_dump.txt', schemaStr);
    console.log("Schema dumped.");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

getSchema();
