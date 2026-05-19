const pool = require("../config/db");

async function check() {
    try {
        const roles = await pool.query("SELECT * FROM roles");
        console.log("--- Roles ---");
        console.log(roles.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
check();
