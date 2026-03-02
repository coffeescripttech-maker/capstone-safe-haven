// Generate Test Users with Proper Password Hashing
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const TEST_PASSWORD = 'Test123!';
const SALT_ROUNDS = 10;

const testUsers = [
  {
    email: 'superadmin@test.safehaven.com',
    firstName: 'Super Admin',
    lastName: 'Test',
    phone: '+63-900-000-0001',
    role: 'super_admin',
    jurisdiction: null
  },
  {
    email: 'admin@test.safehaven.com',
    firstName: 'Admin',
    lastName: 'Test',
    phone: '+63-900-000-0002',
    role: 'admin',
    jurisdiction: null
  },
  {
    email: 'pnp@test.safehaven.com',
    firstName: 'PNP Officer',
    lastName: 'Test',
    phone: '+63-900-000-0003',
    role: 'pnp',
    jurisdiction: null
  },
  {
    email: 'bfp@test.safehaven.com',
    firstName: 'BFP Officer',
    lastName: 'Test',
    phone: '+63-900-000-0004',
    role: 'bfp',
    jurisdiction: null
  },
  {
    email: 'mdrrmo@test.safehaven.com',
    firstName: 'MDRRMO Officer',
    lastName: 'Test',
    phone: '+63-900-000-0005',
    role: 'mdrrmo',
    jurisdiction: null
  },
  {
    email: 'lgu@test.safehaven.com',
    firstName: 'LGU Officer',
    lastName: 'Test',
    phone: '+63-900-000-0006',
    role: 'lgu_officer',
    jurisdiction: 'Manila'
  },
  {
    email: 'citizen@test.safehaven.com',
    firstName: 'Citizen',
    lastName: 'Test',
    phone: '+63-900-000-0007',
    role: 'citizen',
    jurisdiction: null
  }
];

async function createTestUsers() {
  let connection;
  
  try {
    console.log('🔐 Generating password hash...');
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, SALT_ROUNDS);
    console.log(`✅ Password hash generated for: ${TEST_PASSWORD}`);
    console.log(`   Hash: ${hashedPassword}\n`);

    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'safehaven'
    });
    console.log('✅ Connected to database\n');

    console.log('👥 Creating test users...\n');

    for (const user of testUsers) {
      try {
        const [result] = await connection.execute(
          `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, jurisdiction, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE 
             password_hash = VALUES(password_hash),
             first_name = VALUES(first_name),
             last_name = VALUES(last_name),
             phone = VALUES(phone),
             role = VALUES(role),
             jurisdiction = VALUES(jurisdiction),
             updated_at = NOW()`,
          [
            user.email,
            hashedPassword,
            user.firstName,
            user.lastName,
            user.phone,
            user.role,
            user.jurisdiction
          ]
        );

        const action = result.affectedRows === 1 ? 'Created' : 'Updated';
        console.log(`✅ ${action}: ${user.email}`);
        console.log(`   Role: ${user.role.toUpperCase()}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        if (user.jurisdiction) {
          console.log(`   Jurisdiction: ${user.jurisdiction}`);
        }
        console.log('');
      } catch (error) {
        console.error(`❌ Error creating user ${user.email}:`, error.message);
      }
    }

    // Verify users were created
    console.log('\n📋 Verifying test users...\n');
    const [users] = await connection.execute(
      `SELECT id, email, first_name, last_name, role, jurisdiction, created_at
       FROM users 
       WHERE email LIKE '%@test.safehaven.com'
       ORDER BY FIELD(role, 'super_admin', 'admin', 'mdrrmo', 'pnp', 'bfp', 'lgu_officer', 'citizen')`
    );

    console.log('Test Users Created:');
    console.log('='.repeat(80));
    users.forEach(user => {
      console.log(`ID: ${user.id} | ${user.email}`);
      console.log(`   Role: ${user.role.toUpperCase().padEnd(15)} | Name: ${user.first_name} ${user.last_name}`);
      if (user.jurisdiction) {
        console.log(`   Jurisdiction: ${user.jurisdiction}`);
      }
      console.log('-'.repeat(80));
    });

    console.log('\n✅ All test users created successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('='.repeat(80));
    console.log(`Password for all users: ${TEST_PASSWORD}`);
    console.log('='.repeat(80));
    console.log('\nTest User Emails:');
    testUsers.forEach(user => {
      console.log(`  • ${user.role.toUpperCase().padEnd(15)}: ${user.email}`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📡 Database connection closed');
    }
  }
}

// Run the script
createTestUsers();
