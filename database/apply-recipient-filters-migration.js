const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

async function applyMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'safehaven_db'
  });

  try {
    console.log('Applying migration: Add recipient_filters to sms_blasts...');
    
    await connection.query(`
      ALTER TABLE sms_blasts 
      ADD COLUMN recipient_filters JSON AFTER language
    `);
    
    console.log('✓ Migration applied successfully!');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✓ Column already exists, skipping...');
    } else {
      console.error('✗ Error applying migration:', error.message);
      throw error;
    }
  } finally {
    await connection.end();
  }
}

applyMigration().catch(console.error);
