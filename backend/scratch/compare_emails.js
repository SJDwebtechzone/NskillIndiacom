const pool = require("../config/db");

async function check() {
    try {
        console.log("--- All Users ---");
        const users = await pool.query("SELECT id, name, email FROM users ORDER BY email ASC");
        users.rows.forEach(u => console.log(`  User: ${u.id} | ${u.name} | '${u.email}'`));

        console.log("\n--- All Student Admissions ---");
        const adms = await pool.query("SELECT id, full_name, email_id FROM student_admissions ORDER BY email_id ASC");
        adms.rows.forEach(a => console.log(`  Adm:  ${a.id} | ${a.full_name} | '${a.email_id}'`));

        console.log("\n--- Comparison (NOT IN query) ---");
        const pending = await pool.query(`
            SELECT id, full_name, email_id 
            FROM student_admissions 
            WHERE email_id NOT IN (SELECT email FROM users WHERE email IS NOT NULL)
        `);
        console.log("Pending count:", pending.rows.length);
        pending.rows.forEach(p => console.log(`  Pending: ${p.id} | ${p.full_name} | '${p.email_id}'`));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
check();
