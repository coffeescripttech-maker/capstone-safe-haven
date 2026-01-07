/**
 * Create Admin User Script
 * This script creates an admin user in your Cloudflare D1 database
 */

const bcrypt = require('bcryptjs');

// Configuration
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin User';

// Hash the password
const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);

console.log('========================================');
console.log('Admin User Creation Script');
console.log('========================================');
console.log('');
console.log('Email:', ADMIN_EMAIL);
console.log('Password:', ADMIN_PASSWORD);
console.log('Hashed Password:', hashedPassword);
console.log('');
console.log('========================================');
console.log('SQL Command to Execute:');
console.log('========================================');
console.log('');

const sql = `INSERT INTO users (email, password, name, role, created_at, updated_at) 
VALUES (
  '${ADMIN_EMAIL}',
  '${hashedPassword}',
  '${ADMIN_NAME}',
  'admin',
  datetime('now'),
  datetime('now')
);`;

console.log(sql);
console.log('');
console.log('========================================');
console.log('How to Execute:');
console.log('========================================');
console.log('');
console.log('Option 1: Using Wrangler CLI');
console.log('----------------------------');
console.log('wrangler d1 execute dubai-filmmaker-cms --remote --command="' + sql.replace(/\n/g, ' ').replace(/\s+/g, ' ') + '"');
console.log('');
console.log('Option 2: Using Cloudflare Dashboard');
console.log('------------------------------------');
console.log('1. Go to: https://dash.cloudflare.com/');
console.log('2. Navigate to: Workers & Pages → D1 → dubai-filmmaker-cms');
console.log('3. Click on "Console" tab');
console.log('4. Copy and paste the SQL above');
console.log('5. Click "Execute"');
console.log('');
console.log('========================================');
console.log('After Creating User:');
console.log('========================================');
console.log('');
console.log('Login at: http://localhost:3000/auth/signin');
console.log('Email:', ADMIN_EMAIL);
console.log('Password:', ADMIN_PASSWORD);
console.log('');
console.log('⚠️  IMPORTANT: Change the password after first login!');
console.log('');
