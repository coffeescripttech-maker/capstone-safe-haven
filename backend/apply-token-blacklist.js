const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyMigration() {
  console.log('========================================');
  console.log('Token Blacklist Migration');
  console.log('========================================\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'safehaven_db',
    multipleStatements: true
  });

  try {
    console.log('Connected to database:', process.env.DB_NAME);
    console.log('Applying migration: 005_create_token_blacklist_table.sql\n');

    const migrationPath = path.join(__dirname, '../database/migrations/005_create_token_blacklist_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await connection.query(sql);

    console.log('✓ Migration applied successfully!\n');
    console.log('Summary of changes:');
    console.log('  • token_blacklist table created');
    console.log('  • Logout functionality enabled');
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

applyMigration();
