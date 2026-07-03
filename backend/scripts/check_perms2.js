require("dotenv").config({ path: __dirname + '/../.env' });
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "ntsc",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
});

async function run() {
  try {
    const roles = await pool.query("SELECT * FROM roles");
    const perms = await pool.query("SELECT * FROM permissions");
    
    for (let role of roles.rows) {
      console.log(`Role: ${role.name}`);
      const rolePerms = perms.rows.filter(p => p.role_id === role.id && p.can_view);
      console.log(`  Modules: ${rolePerms.map(p => p.module).join(', ')}`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
