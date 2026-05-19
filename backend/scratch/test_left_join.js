const pool = require("../config/db");

async function check() {
    try {
        const result = await pool.query(`
            SELECT 
                sa.id, 
                sa.full_name, 
                sa.email_id, 
                sa.mobile_number, 
                sa.course_interested,
                (u.id IS NOT NULL) AS has_credential
            FROM student_admissions sa
            LEFT JOIN users u ON LOWER(sa.email_id) = LOWER(u.email)
            ORDER BY sa.created_at DESC
        `);
        console.log("--- New Admissions Query Results ---");
        console.log(result.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
check();
