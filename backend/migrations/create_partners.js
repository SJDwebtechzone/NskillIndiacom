const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pg = require('pg');
const pool = new pg.Pool({
  user:     process.env.DB_USER     || 'postgres',
  host:     process.env.DB_HOST     || 'localhost',
  database: process.env.DB_NAME     || 'nskillindia_db',
  password: process.env.DB_PASSWORD || 'root3',
  port:     parseInt(process.env.DB_PORT || '5432'),
});
pool.query(`
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_logo TEXT NOT NULL,
    website_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`).then(() => console.log('Partners table created')).catch(console.error).finally(() => pool.end());
