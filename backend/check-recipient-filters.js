const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function checkRecipientFilters() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'safehaven_db'
  });

  try {
    console.log('Checking sms_blasts table for recipient_filters column...\n');
    
    // Check if column exists
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM sms_blasts LIKE 'recipient_filters'
    `);
    
    if (columns.length === 0) {
      console.log('✗ Column recipient_filters does not exist!');
      console.log('Run: node apply-recipient-filters-migration.js');
      return;
    }
    
    console.log('✓ Column recipient_filters exists\n');
    
    // Check existing blasts
    const [blasts] = await connection.query(`
      SELECT id, recipient_filters, created_at 
      FROM sms_blasts 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log(`Found ${blasts.length} recent SMS blasts:\n`);
    
    blasts.forEach((blast, index) => {
      console.log(`${index + 1}. Blast ID: ${blast.id}`);
      console.log(`   Created: ${blast.created_at}`);
      console.log(`   Filters: ${blast.recipient_filters || 'NULL (old blast)'}`);
      console.log('');
    });
    
    const nullCount = blasts.filter(b => !b.recipient_filters).length;
    if (nullCount > 0) {
      console.log(`Note: ${nullCount} blast(s) have NULL recipient_filters (created before migration)`);
      console.log('These will show "No recipient filter information available" on detail page');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkRecipientFilters().catch(console.error);
