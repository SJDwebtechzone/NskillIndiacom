require('dotenv').config({ path: '../.env' });
const pool = require('../config/db');

async function createMailSystemTables() {
  const query = `
    CREATE TABLE IF NOT EXISTS mail_templates (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      enable_reminder BOOLEAN DEFAULT false,
      reminder_frequency_days INTEGER DEFAULT NULL,
      reminder_stop_condition VARCHAR(100) DEFAULT 'Stop on Event Date',
      reminder_start_delay_days INTEGER DEFAULT 0,
      attached_pdf VARCHAR(255) DEFAULT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mail_reminder_schedule (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      event_date DATE NOT NULL,
      mail_template_id INTEGER REFERENCES mail_templates(id),
      next_send_date DATE NOT NULL,
      frequency_days INTEGER NOT NULL,
      stop_date DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Completed', 'Cancelled'
      last_sent_at TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id SERIAL PRIMARY KEY,
      student_id INTEGER DEFAULT NULL,
      event_id INTEGER DEFAULT NULL,
      mail_template_id INTEGER REFERENCES mail_templates(id) ON DELETE SET NULL,
      recipient_email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      delivery_status VARCHAR(50) DEFAULT 'Sent', -- 'Sent', 'Failed'
      error_message TEXT DEFAULT NULL
    );
  `;

  try {
    await pool.query(query);
    console.log('Mail System tables (mail_templates, mail_reminder_schedule, email_logs) created successfully.');
  } catch (err) {
    console.error('Error creating mail system tables:', err);
  } finally {
    pool.end();
  }
}

createMailSystemTables();
