require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/ntsc" });
pool.query("SELECT DISTINCT module FROM permissions").then(res => {
  console.log(res.rows.map(r => r.module));
  process.exit(0);
}).catch(console.error);
