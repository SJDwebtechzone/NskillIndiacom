const pool = require('./config/db');

async function fixPaths() {
    console.log("Fixing absolute paths in database...");
    
    // We match any path that contains 'uploads' and is longer than a relative path,
    // but the easiest is to just extract everything after '/uploads/' or '\uploads\'
    
    const columns = [
        'signed_admission_file',
        'photo_url',
        'has_aadhaar_file',
        'has_edu_certs_file',
        'has_passport_file',
        'has_resume_file',
        'has_address_proof_file',
        'has_photos_file',
        'has_guardian_id_file',
        'has_weekly_test_file'
    ];

    try {
        for (const col of columns) {
            // Postgres query to extract the relative path starting from 'uploads/'
            const result = await pool.query(`
                UPDATE student_admissions 
                SET ${col} = substring(${col} from position('uploads' in ${col}))
                WHERE ${col} LIKE '/%' OR ${col} LIKE 'C:%' OR ${col} LIKE 'D:%' OR ${col} LIKE 'c:%' OR ${col} LIKE 'd:%';
            `);
            console.log(`Fixed ${result.rowCount} records for ${col}`);
        }

        console.log("All absolute paths have been successfully fixed!");
        process.exit(0);
    } catch (err) {
        console.error("Error fixing database:", err);
        process.exit(1);
    }
}

fixPaths();
