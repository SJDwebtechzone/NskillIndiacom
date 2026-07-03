const pool = require("../config/db");

async function run() {
  try {
    const res = await pool.query("SELECT * FROM banners");
    console.log("BANNERS:");
    console.log(JSON.stringify(res.rows, null, 2));
    
    const resPopups = await pool.query("SELECT * FROM popups");
    console.log("POPUPS:");
    console.log(JSON.stringify(resPopups.rows, null, 2));
    
    const resSettings = await pool.query("SELECT * FROM contact_info");
    console.log("CONTACT INFO:");
    console.log(JSON.stringify(resSettings.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
