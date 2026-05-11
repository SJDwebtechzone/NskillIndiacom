const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

async function importSchema() {
  try {
    const schemaPath = path.join(__dirname, "../../full_schema.sql");
    // Try reading as utf16le first, then fallback to utf8 if needed
    let content = fs.readFileSync(schemaPath, "utf16le");
    
    let marker = "-- NskillIndia Modern Student Profile Schema";
    let startIndex = content.indexOf(marker);
    
    if (startIndex === -1) {
      // Fallback to utf8 if marker not found
      content = fs.readFileSync(schemaPath, "utf8");
      startIndex = content.indexOf(marker);
    }
    
    if (startIndex === -1) {
      console.error("Could not find the profile schema marker in full_schema.sql");
      process.exit(1);
    }
    
    const sql = content.substring(startIndex);
    
    console.log("🚀 Starting database schema import...");
    await pool.query(sql);
    console.log("✅ Schema imported successfully!");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error importing schema:", err);
    process.exit(1);
  }
}

importSchema();
