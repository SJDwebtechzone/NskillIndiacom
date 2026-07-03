const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'nskill',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function main() {
  try {
    // 1. Create audit_logs table
    console.log("Creating audit_logs table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NULL,
        action VARCHAR(50) NOT NULL,
        module VARCHAR(100) NOT NULL,
        record_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 2. Fetch all tables
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name != 'audit_logs'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const tables = res.rows.map(r => r.table_name);
    
    // 3. Add soft delete columns to every table
    for (const table of tables) {
      console.log(`Adding soft delete columns to ${table}...`);
      try {
        await pool.query(`
          ALTER TABLE ${table}
          ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
          ADD COLUMN IF NOT EXISTS deleted_by INTEGER NULL;
        `);
      } catch (err) {
        console.error(`Error adding columns to ${table}:`, err.message);
      }
    }
    
    console.log("Migration completed successfully.");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    await pool.end();
  }
}
main();
