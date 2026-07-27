const pool = require('./config/db');
async function run() {
    try {
        const r = await pool.query("INSERT INTO modules (name, slug) VALUES ('My Pre Test', 'my-pre-test') ON CONFLICT DO NOTHING RETURNING *");
        console.log("Inserted module:", r.rows);
    } catch(e) { console.error(e); }
    process.exit(0);
}
run();
