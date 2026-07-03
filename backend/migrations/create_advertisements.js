require('dotenv').config({ path: '../.env' });
const pool = require('../config/db');

async function createAdvertisementsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS advertisements (
      id SERIAL PRIMARY KEY,
      image VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('Advertisements table created successfully.');
  } catch (err) {
    console.error('Error creating advertisements table:', err);
  } finally {
    pool.end();
  }
}

createAdvertisementsTable();
