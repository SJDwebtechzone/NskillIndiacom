const pool = require("../config/db");

async function check() {
    try {
        const adms = await pool.query("SELECT COUNT(*) FROM student_admissions");
        console.log("Total Student Admissions count:", adms.rows[0].count);

        const columns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'student_admissions'
        `);
        console.log("--- student_admissions columns ---");
        columns.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
check();
