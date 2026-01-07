#!/usr/bin/env node

/**
 * Hash existing plain text passwords in the database
 * This script updates all users with plain text passwords to use bcrypt hashing
 */

const bcrypt = require('bcrypt');
const { execSync } = require('child_process');

const DATABASE_NAME = 'dubai-filmmaker-cms';
const SALT_ROUNDS = 10;

console.log('\n🔐 Hashing user passwords...\n');

// Users to hash (current plain text passwords)
const users = [
  { email: 'admin@example.com', password: 'admin123' },
  { email: 'user@example.com', password: 'user123' }
];

async function hashPasswords() {
  try {
    for (const user of users) {
      console.log(`🔄 Hashing password for ${user.email}...`);
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
      
      // Escape single quotes in the hash for SQL
      const escapedHash = hashedPassword.replace(/'/g, "''");
      
      // Update in database
      const command = `wrangler d1 execute ${DATABASE_NAME} --remote --command="UPDATE users SET password='${escapedHash}' WHERE email='${user.email}';"`;
      
      execSync(command, { stdio: 'inherit' });
      
      console.log(`✅ Password hashed for ${user.email}`);
    }
    
    console.log('\n✅ All passwords have been hashed successfully!');
    console.log('\n🔐 Security Status:');
    console.log('   ✓ Passwords are now stored securely with bcrypt');
    console.log('   ✓ Original passwords: admin123, user123');
    console.log('   ✓ Login credentials remain the same');
    console.log('\n⚠️  Important: Keep these passwords secure!');
    
  } catch (error) {
    console.error('\n❌ Error hashing passwords:', error.message);
    process.exit(1);
  }
}

hashPasswords();
