// Apply Alert Automation Schema
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function applySchema() {
  console.log('=== SafeHaven Alert Automation Setup ===\n');
  
  try {
    // Read database config from .env
    require('dotenv').config();
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'safehaven_db',
      multipleStatements: true
    });
    
    console.log('✓ Connected to MySQL');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'alert_automation_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('✓ Schema file loaded');
    console.log('\nApplying schema...\n');
    
    // Execute schema
    await connection.query(schema);
    
    console.log('✓ Alert automation schema created successfully!\n');
    console.log('Tables created:');
    console.log('  - alert_rules (with 6 default rules)');
    console.log('  - alert_automation_logs');
    console.log('  - Updated disaster_alerts table\n');
    console.log('Default Rules Installed:');
    console.log('  1. Heavy Rain Warning (>50mm)');
    console.log('  2. Extreme Heat Advisory (>38°C)');
    console.log('  3. Strong Wind Warning (>60km/h)');
    console.log('  4. Moderate Earthquake Alert (M5.0-5.9)');
    console.log('  5. Strong Earthquake Alert (M6.0-6.9)');
    console.log('  6. Major Earthquake Alert (M7.0+)\n');
    console.log('Next steps:');
    console.log('1. Restart your backend server');
    console.log('2. Test the automation: node test-alert-automation.js');
    console.log('3. Access admin dashboard: http://localhost:3001/alert-automation\n');
    
    await connection.end();
    process.exit(0);
    
  } catch (error) {
    console.error('✗ Error setting up schema:', error.message);
    console.error('\nMake sure:');
    console.error('  - MySQL is running');
    console.error('  - Database safehaven_db exists');
    console.error('  - .env file has correct credentials');
    process.exit(1);
  }
}

applySchema();
