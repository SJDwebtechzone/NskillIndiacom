const fs = require('fs');
const pool = require('./backend/config/db');

async function pushSchema() {
    try {
        console.log('Reading full_schema_utf8.sql...');
        let sql = fs.readFileSync('full_schema_utf8.sql', 'utf8');
        
        // Strip BOM if present
        if (sql.charCodeAt(0) === 0xFEFF) {
            console.log('Stripping BOM...');
            sql = sql.slice(1);
        }
        
        console.log('Executing schema...');
        await pool.query(sql);
        
        console.log('Schema pushed successfully to nskillindia_db!');
    } catch (err) {
        console.error('Error pushing schema:', err.message);
        if (err.detail) console.error('Detail:', err.detail);
    } finally {
        process.exit();
    }
}

pushSchema();
