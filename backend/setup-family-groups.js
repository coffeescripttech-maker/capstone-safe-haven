// Setup Family Groups Tables
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupFamilyGroups() {
  console.log('=== Setting up Family Groups Tables ===\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  console.log(`Database: ${process.env.DB_NAME}@${process.env.DB_HOST}\n`);

  try {
    // Read SQL file
    const sqlFile = path.join(__dirname, '../database/family_groups.sql');
    if (!fs.existsSync(sqlFile)) {
      console.error(`✗ SQL file not found: ${sqlFile}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Executing SQL script...');

    // Execute SQL
    await connection.query(sql);

    console.log('✓ Family groups tables created successfully!\n');

    // Verify tables
    console.log('Verifying tables...');
    const [tables] = await connection.query(`
      SELECT TABLE_NAME, TABLE_ROWS
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME IN ('groups', 'group_members', 'location_shares', 'group_alerts')
      ORDER BY TABLE_NAME
    `, [process.env.DB_NAME]);

    if (tables.length > 0) {
      console.log('✓ Tables verified:');
      tables.forEach(table => {
        console.log(`  ${table.TABLE_NAME} (${table.TABLE_ROWS} rows)`);
      });
    } else {
      console.log('⚠ No tables found');
    }

    console.log('\n=== Setup Complete ===\n');
    console.log('Next steps:');
    console.log('1. Restart the backend server');
    console.log('2. Test group creation and joining');

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setupFamilyGroups();
