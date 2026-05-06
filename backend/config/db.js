// const { Pool } = require('pg');
// const dotenv = require('dotenv');

// dotenv.config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// module.exports = pool;

// db.js
// const { Pool } = require("pg");

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "nskillindia_db",
//   password: "1234",
//   port: 5432,
// });

// module.exports = pool;
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user:     process.env.DB_USER     || "postgres",
  host:     process.env.DB_HOST     || "localhost",
  database: process.env.DB_NAME     || "nskillindia_db",
  password: process.env.DB_PASSWORD || "root3",
  port:     parseInt(process.env.DB_PORT || "5432"),
});

module.exports = pool;