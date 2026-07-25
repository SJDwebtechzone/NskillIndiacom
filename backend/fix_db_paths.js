const pool = require('./config/db');

async function fixPaths() {
    console.log("Fixing absolute paths in database...");
    try {
        const result = await pool.query(`
            UPDATE student_admissions 
            SET signed_admission_file = substring(signed_admission_file from position('uploads' in signed_admission_file))
            WHERE signed_admission_file LIKE '%Devspectra%';
        `);
        console.log(`Fixed ${result.rowCount} records for signed_admission_file`);

        const result2 = await pool.query(`
            UPDATE student_admissions 
            SET photo_url = substring(photo_url from position('uploads' in photo_url))
            WHERE photo_url LIKE '%Devspectra%';
        `);
        console.log(`Fixed ${result2.rowCount} records for photo_url`);

        const result3 = await pool.query(`
            UPDATE student_admissions 
            SET has_aadhaar_file = substring(has_aadhaar_file from position('uploads' in has_aadhaar_file))
            WHERE has_aadhaar_file LIKE '%Devspectra%';
        `);
        console.log(`Fixed ${result3.rowCount} records for has_aadhaar_file`);

        const result4 = await pool.query(`
            UPDATE student_admissions 
            SET has_edu_certs_file = substring(has_edu_certs_file from position('uploads' in has_edu_certs_file))
            WHERE has_edu_certs_file LIKE '%Devspectra%';
        `);
        console.log(`Fixed ${result4.rowCount} records for has_edu_certs_file`);
        
        const result5 = await pool.query(`
            UPDATE student_admissions 
            SET has_passport_file = substring(has_passport_file from position('uploads' in has_passport_file))
            WHERE has_passport_file LIKE '%Devspectra%';
        `);
        console.log(`Fixed ${result5.rowCount} records for has_passport_file`);

        const result6 = await pool.query(`
            UPDATE student_admissions 
            SET has_resume_file = substring(has_resume_file from position('uploads' in has_resume_file))
            WHERE has_resume_file LIKE '%Devspectra%';
        `);
        console.log(`Fixed ${result6.rowCount} records for has_resume_file`);

        const result7 = await pool.query(`
            UPDATE student_admissions 
            SET has_address_proof_file = substring(has_address_proof_file from position('uploads' in has_address_proof_file))
            WHERE has_address_proof_file LIKE '%Devspectra%';
        `);
        console.log(`Fixed ${result7.rowCount} records for has_address_proof_file`);

        const result8 = await pool.query(`
            UPDATE student_admissions 
            SET has_photos_file = substring(has_photos_file from position('uploads' in has_photos_file))
            WHERE has_photos_file LIKE '%Devspectra%';
        `);
        console.log(`Fixed ${result8.rowCount} records for has_photos_file`);

        const result9 = await pool.query(`
            UPDATE student_admissions 
            SET has_guardian_id_file = substring(has_guardian_id_file from position('uploads' in has_guardian_id_file))
            WHERE has_guardian_id_file LIKE '%Devspectra%';
        `);
        console.log(`Fixed ${result9.rowCount} records for has_guardian_id_file`);

        const result10 = await pool.query(`
            UPDATE student_admissions 
            SET has_weekly_test_file = substring(has_weekly_test_file from position('uploads' in has_weekly_test_file))
            WHERE has_weekly_test_file LIKE '%Devspectra%';
        `);
        console.log(`Fixed ${result10.rowCount} records for has_weekly_test_file`);

        console.log("All absolute paths have been successfully fixed!");
        process.exit(0);
    } catch (err) {
        console.error("Error fixing database:", err);
        process.exit(1);
    }
}

fixPaths();
