require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT id, full_name, is_deleted, status FROM career_counsellors ORDER BY id DESC LIMIT 5")
  .then(res => {
    console.log(res.rows);
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
