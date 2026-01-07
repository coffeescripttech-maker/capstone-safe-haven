#!/usr/bin/env node

/**
 * Setup users table in D1 database
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DATABASE_NAME = 'dubai-filmmaker-cms';
const SCHEMA_FILE = path.join(__dirname, '..', 'database', 'users-schema.sql');

console.log('\n👥 Setting up users table in D1 database...\n');

// Check if schema file exists
if (!fs.existsSync(SCHEMA_FILE)) {
  console.error('❌ Schema file not found:', SCHEMA_FILE);
  process.exit(1);
}

try {
  // Apply schema to remote database
  console.log('📊 Creating users table...');
  
  const command = `wrangler d1 execute ${DATABASE_NAME} --remote --file="${SCHEMA_FILE}"`;
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('\n✅ Users table created successfully!');
  console.log('\n👤 Default users:');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   User: user@example.com / user123');
  console.log('\n⚠️  Remember to change these passwords in production!');
  
} catch (error) {
  console.error('\n❌ Error setting up users table:', error.message);
  process.exit(1);
}
