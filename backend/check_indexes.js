const pool = require('./config/db');
async function run() {
    try {
        const r = await pool.query("SELECT * FROM pg_indexes WHERE tablename = 'permissions'");
        console.log(r.rows);
    } catch(e) { console.error(e); }
    process.exit(0);
}
run();
