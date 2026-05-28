const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    // Find placement records for the student with email 'connect@devspectra.in'
    const res = await pool.query(`
      SELECT sp.id, sp.offer_letter_url, sa.full_name, sa.email_id
      FROM student_placements sp
      JOIN student_admissions sa ON sa.id = sp.student_id
      WHERE LOWER(sa.email_id) = LOWER('connect@devspectra.in')
    `);

    if (res.rows.length === 0) {
      console.log("No placement records found for connect@devspectra.in");
      process.exit(0);
    }

    console.log(`Found ${res.rows.length} placement records. Deleting...`);

    for (const row of res.rows) {
      console.log(`Deleting placement ID: ${row.id} for ${row.full_name}`);
      const fileUrl = row.offer_letter_url;
      if (fileUrl) {
        const filePath = path.join(__dirname, "..", fileUrl);
        if (fs.existsSync(filePath)) {
          console.log(`Deleting offer letter file: ${filePath}`);
          fs.unlinkSync(filePath);
        }
      }
      await pool.query("DELETE FROM student_placements WHERE id = $1", [row.id]);
    }

    console.log("Cleanup complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error during deletion:", err);
    process.exit(1);
  }
}

main();
