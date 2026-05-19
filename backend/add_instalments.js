const pool = require('./config/db');

async function run() {
    try {
        await pool.query(`
            ALTER TABLE student_admissions 
            ADD COLUMN IF NOT EXISTS instalment_3 NUMERIC(10,2) DEFAULT 0, 
            ADD COLUMN IF NOT EXISTS instalment_3_ref VARCHAR(255), 
            ADD COLUMN IF NOT EXISTS instalment_4 NUMERIC(10,2) DEFAULT 0, 
            ADD COLUMN IF NOT EXISTS instalment_4_ref VARCHAR(255);
        `);
        console.log('Columns added successfully');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}
run();
