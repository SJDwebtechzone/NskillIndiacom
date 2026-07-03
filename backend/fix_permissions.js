const pool = require('./config/db');

async function run() {
  try {
    const roles = await pool.query("SELECT DISTINCT role_id FROM permissions");
    for (const r of roles.rows) {
      // There's no unique constraint on (role_id, module), so we must manually check first to avoid duplicates
      
      const resAdv = await pool.query("SELECT * FROM permissions WHERE role_id = $1 AND module = 'Advertisement'", [r.role_id]);
      if (resAdv.rows.length === 0) {
        await pool.query("INSERT INTO permissions (role_id, module, can_view, can_add, can_edit, can_delete) VALUES ($1, 'Advertisement', true, true, true, true)", [r.role_id]);
      }
      
      const resMail = await pool.query("SELECT * FROM permissions WHERE role_id = $1 AND module = 'Mail Templates'", [r.role_id]);
      if (resMail.rows.length === 0) {
        await pool.query("INSERT INTO permissions (role_id, module, can_view, can_add, can_edit, can_delete) VALUES ($1, 'Mail Templates', true, true, true, true)", [r.role_id]);
      }
    }
    console.log('Permissions updated successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
