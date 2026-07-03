const pg = require('pg');
const pool = new pg.Pool({
  user:     process.env.DB_USER     || 'postgres',
  host:     process.env.DB_HOST     || 'localhost',
  database: process.env.DB_NAME     || 'nskillindia_db',
  password: process.env.DB_PASSWORD || 'root3',
  port:     parseInt(process.env.DB_PORT || '5432'),
});

async function updateAdminPerms() {
  try {
    const rolesRes = await pool.query("SELECT id FROM roles WHERE name IN ('Admin', 'Admin1', 'Super Admin')");
    const roleIds = rolesRes.rows.map(r => r.id);

    const modsRes = await pool.query("SELECT slug FROM modules");
    for (const row of modsRes.rows) {
      for (const roleId of roleIds) {
        await pool.query(`
          INSERT INTO permissions (role_id, module, can_view, can_add, can_edit, can_delete)
          VALUES ($1, $2, true, true, true, true)
          ON CONFLICT (role_id, module) DO UPDATE SET
            can_view = true, can_add = true, can_edit = true, can_delete = true, is_deleted = false
        `, [roleId, row.slug]);
      }
    }
    console.log('Granted all permissions to Admin roles');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
updateAdminPerms();
