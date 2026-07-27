const pool = require('./config/db');
async function run() {
    try {
        const r = await pool.query("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'permissions_role_id_module_key'");
        console.log(r.rows);
        const r2 = await pool.query("SELECT indexdef FROM pg_indexes WHERE indexname = 'permissions_role_id_module_key'");
        console.log(r2.rows);
    } catch(e) { console.error(e); }
    process.exit(0);
}
run();
