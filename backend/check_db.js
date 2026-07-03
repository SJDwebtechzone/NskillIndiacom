const pool = require('./config/db.js');
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'partners'").then(r => {
    console.log(r.rows);
    process.exit(0);
}).catch(e => {
    console.error(e.message);
    process.exit(1);
});
