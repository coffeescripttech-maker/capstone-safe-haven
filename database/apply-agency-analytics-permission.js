// Apply analytics permission for agency roles migration
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function applyMigration() {
  console.log('========================================');
  console.log('Add Analytics Permission for Agency Roles');
  console.log('========================================');
  console.log('');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'safehaven_db',
    multipleStatements: true
  });

  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log('');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '012_add_analytics_permission_agency_roles.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration: 012_add_analytics_permission_agency_roles.sql');
    
    // Execute migration
    await connection.query(sql);
    
    console.log('✓ Migration applied successfully!');
    console.log('');

    // Verify permissions
    console.log('========================================');
    console.log('Verifying Permissions');
    console.log('========================================');
    console.log('');
    console.log('Analytics permissions:');
    
    const [rows] = await connection.query(
      "SELECT role, resource, action FROM role_permissions WHERE resource = 'analytics' ORDER BY role"
    );
    
    console.table(rows);

    console.log('');
    console.log('========================================');
    console.log('Migration Complete!');
    console.log('========================================');
    console.log('');
    console.log('Next steps:');
    console.log('1. Recompile backend: cd backend && npm run build');
    console.log('2. Restart backend server');
    console.log('3. Test BFP/PNP login and dashboard access');

  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

applyMigration();
