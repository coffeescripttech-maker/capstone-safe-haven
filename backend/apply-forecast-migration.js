// Apply Weather Forecast Migration
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  console.log('🔄 Applying Weather Forecast Migration...');
  
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Empty password
      database: 'safehaven_db',
      multipleStatements: true
    });
    
    console.log('✅ Connected to database');
    
    // Read migration file
    const migrationPath = path.join(__dirname, '../database/migrations/014_add_advance_notice_hours.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded');
    console.log('📊 Executing SQL...');
    
    // Execute migration
    await connection.query(sql);
    
    console.log('✅ Migration applied successfully!');
    console.log('');
    console.log('Added columns:');
    console.log('  • advance_notice_hours (INT)');
    console.log('  • forecast_data (JSON)');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Update alertAutomation.service.ts with forecast monitoring');
    console.log('  2. Restart backend server');
    console.log('  3. Check logs for predictive alerts');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    process.exit(1);
  }
}

applyMigration();
