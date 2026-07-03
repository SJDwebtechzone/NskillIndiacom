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
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name != 'audit_logs'
      AND table_type = 'BASE TABLE'
    `);
    
    const tables = res.rows.map(r => r.table_name);
    
    for (const table of tables) {
      console.log(`Applying RLS to ${table}...`);
      try {
        await pool.query(`
          ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
          
          -- Drop policy if exists to recreate
          DROP POLICY IF EXISTS hide_deleted_records ON ${table};
          
          -- Policy for SELECT
          CREATE POLICY hide_deleted_records ON ${table}
          FOR SELECT
          USING (is_deleted = false OR current_setting('app.show_deleted', true) = 'true');

          -- Policy for INSERT, UPDATE, DELETE (allow all for now)
          DROP POLICY IF EXISTS allow_all_modifications ON ${table};
          CREATE POLICY allow_all_modifications ON ${table}
          FOR ALL
          USING (true)
          WITH CHECK (true);
          
          -- Ensure table owner is subject to RLS (Postgres by default ignores RLS for table owner)
          ALTER TABLE ${table} FORCE ROW LEVEL SECURITY;
        `);
      } catch (err) {
        console.error(`Error on ${table}:`, err.message);
      }
    }
    console.log("RLS applied successfully.");
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
main();
