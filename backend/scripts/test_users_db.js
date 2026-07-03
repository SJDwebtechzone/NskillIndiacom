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
    console.log("ROLES:", roles.rows);
    
    const users = await pool.query(`
      SELECT u.id, u.name, u.email, u.status, u.created_at, u.phone_number, u.dob,
             r.name as role_name, r.id as role_id, u.is_deleted
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id DESC
      LIMIT 10
    `);
    console.log("USERS (latest 10):", users.rows);
    
    // Also test the query from GET /api/users
    let query = `
      SELECT u.id, u.name, u.email, u.status, u.created_at, u.phone_number, u.dob,
              r.name as role_name, r.id as role_id
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id AND r.is_deleted = false
       WHERE (u.status IS NULL OR u.status <> 'Deleted') AND u.is_deleted = false
    `;
    const apiUsers = await pool.query(query);
    console.log(`API USERS QUERY RESULT COUNT: ${apiUsers.rowCount}`);
    
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
