const pool = require("../config/db");

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("🔍 Fetching placement users...");
    const pUsers = await client.query("SELECT * FROM placement_users");
    console.log(`Found ${pUsers.rows.length} users.`);

    await client.query("BEGIN");

    for (const pu of pUsers.rows) {
      // Check if user exists in 'users' table by email
      const uCheck = await client.query("SELECT id FROM users WHERE email = $1", [pu.email]);
      
      let userId;
      if (uCheck.rows.length === 0) {
        console.log(`  ➕ Migrating ${pu.email}...`);
        const insertUser = await client.query(
          "INSERT INTO users (name, email, password, phone_number, role_id, status) VALUES ($1, $2, $3, $4, 6, 'Active') RETURNING id",
          [pu.name, pu.email, pu.password, pu.phone]
        );
        userId = insertUser.rows[0].id;
        
        // Update placement_users ID if it changed (to keep them in sync for future joins)
        if (userId !== pu.id) {
           // We might need to handle this carefully if pu.id is used elsewhere
           // For now, let's just make sure they exist in student_profiles
        }
      } else {
        userId = uCheck.rows[0].id;
      }
      
      // Ensure they have a record in student_profiles
      await client.query(
        "INSERT INTO student_profiles (user_id, gender, phone_number) VALUES ($1, 'Male', $2) ON CONFLICT (user_id) DO NOTHING",
        [userId, pu.phone]
      );
    }

    await client.query("COMMIT");
    console.log("✅ Migration complete!");
    process.exit(0);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrate();
