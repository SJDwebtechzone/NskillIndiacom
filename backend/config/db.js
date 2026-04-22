// const { Pool } = require('pg');
// const dotenv = require('dotenv');

// dotenv.config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// module.exports = pool;

// db.js
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "nskillindia_db",
  password: "1234",
  port: 5432,
});

module.exports = pool;
