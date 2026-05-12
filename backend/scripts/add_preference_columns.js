const pool = require('../config/db');

async function addPreferenceColumns() {
    try {
        await pool.query(`
            ALTER TABLE student_profiles 
            ADD COLUMN IF NOT EXISTS preferred_job_type TEXT,
            ADD COLUMN IF NOT EXISTS availability TEXT,
            ADD COLUMN IF NOT EXISTS preferred_location TEXT;
        `);
        console.log('Preference columns added successfully');
    } catch (err) {
        console.error('Error adding columns:', err);
    } finally {
        process.exit();
    }
}

addPreferenceColumns();
