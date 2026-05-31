// Node.js script to apply incident types migration
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'safehaven_db',
  multipleStatements: true
};

async function applyMigration() {
  let connection;
  
  try {
    console.log('🚀 Starting Incident Types Migration...\n');
    console.log(`📊 Database: ${DB_CONFIG.database}`);
    console.log(`🖥️  Host: ${DB_CONFIG.host}\n`);

    // Connect to database
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to database\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', 'add_incident_types.sql');
    console.log('📄 Reading migration file...');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration file loaded\n');

    // Execute migration
    console.log('🔄 Applying migration...');
    await connection.query(migrationSQL);
    console.log('✅ Migration applied successfully!\n');

    // Verify data
    console.log('📊 Verifying data...');
    const [incidentTypes] = await connection.query('SELECT COUNT(*) as count FROM incident_types');
    const [responders] = await connection.query('SELECT COUNT(*) as count FROM incident_type_responders');
    
    console.log(`✅ Incident Types: ${incidentTypes[0].count}`);
    console.log(`✅ Responders: ${responders[0].count}\n`);

    // Show sample data
    console.log('📋 Sample Incident Types:');
    const [samples] = await connection.query(`
      SELECT id, name, icon, priority 
      FROM incident_types 
      ORDER BY priority DESC, name ASC 
      LIMIT 5
    `);
    
    samples.forEach(type => {
      console.log(`   ${type.icon} ${type.name} (${type.priority})`);
    });

    console.log('\n🎉 Incident Types System is ready!');
    console.log('\nNext steps:');
    console.log('1. Restart the backend server');
    console.log('2. Test API: GET http://localhost:3001/api/incident-types');
    console.log('3. Update mobile app to use new incident types\n');

  } catch (error) {
    console.error('\n❌ Error applying migration:');
    console.error(error.message);
    if (error.sql) {
      console.error('\nSQL Error:', error.sql);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run migration
applyMigration();
