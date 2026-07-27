const pool = require('./config/db');
async function run() {
    try {
        const r = await pool.query("SELECT * FROM modules WHERE slug LIKE '%pre%'");
        console.log("Pre modules:", r.rows);
    } catch(e) { console.error(e); }
    process.exit(0);
}
run();
