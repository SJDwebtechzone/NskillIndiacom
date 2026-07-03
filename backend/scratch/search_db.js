const pool = require("../config/db");

async function run() {
  try {
    const res = await pool.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND data_type IN ('character varying', 'text', 'character')
    `);
    
    console.log(`Found ${res.rows.length} text columns to search.`);
    for (const row of res.rows) {
      const { table_name, column_name } = row;
      try {
        const searchRes = await pool.query(`
          SELECT "${column_name}" as val, id 
          FROM "${table_name}" 
          WHERE "${column_name}" ILIKE '%dominate%' 
             OR "${column_name}" ILIKE '%develop%deploy%'
        `);
        if (searchRes.rows.length > 0) {
          console.log(`MATCH in table: ${table_name}, col: ${column_name}`);
          console.log(searchRes.rows);
        }
      } catch (err) {
        // Some tables might not have an 'id' column or columns might fail
        try {
          const searchRes = await pool.query(`
            SELECT "${column_name}" as val 
            FROM "${table_name}" 
            WHERE "${column_name}" ILIKE '%dominate%'
               OR "${column_name}" ILIKE '%develop%deploy%'
          `);
          if (searchRes.rows.length > 0) {
            console.log(`MATCH in table (no id): ${table_name}, col: ${column_name}`);
            console.log(searchRes.rows);
          }
        } catch (e2) {
          // ignore
        }
      }
    }
    console.log("Search finished.");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
