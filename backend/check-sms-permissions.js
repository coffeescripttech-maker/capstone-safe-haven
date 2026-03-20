const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSMSPermissions() {
  console.log('🔍 Checking SMS Blast Permissions...\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'safehaven_db'
  });

  try {
    // Check all users and their roles
    console.log('1️⃣  All Users and Their Roles:\n');
    const [users] = await connection.query(`
      SELECT 
        id,
        email,
        CONCAT(first_name, ' ', last_name) as name,
        role,
        jurisdiction,
        is_active
      FROM users
      ORDER BY 
        CASE role
          WHEN 'super_admin' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'mdrrmo' THEN 3
          WHEN 'pnp' THEN 4
          WHEN 'bfp' THEN 5
          WHEN 'lgu_officer' THEN 6
          WHEN 'lgu' THEN 7
          WHEN 'citizen' THEN 8
          ELSE 9
        END,
        email
    `);

    console.table(users);

    // SMS Blast Access Rules
    console.log('\n2️⃣  SMS Blast Access Rules:\n');
    console.log('   ✅ super_admin     - FULL ACCESS');
    console.log('   ✅ admin           - FULL ACCESS (jurisdiction restricted)');
    console.log('   ✅ mdrrmo          - FULL ACCESS (jurisdiction restricted)');
    console.log('   ✅ pnp             - FULL ACCESS (jurisdiction restricted)');
    console.log('   ✅ bfp             - FULL ACCESS (jurisdiction restricted)');
    console.log('   ✅ lgu_officer     - FULL ACCESS (jurisdiction restricted)');
    console.log('   ✅ lgu             - FULL ACCESS (jurisdiction restricted)');
    console.log('   ❌ citizen         - NO ACCESS\n');

    // Check for citizen users
    console.log('3️⃣  Citizen Users (NO SMS Access):\n');
    const [citizens] = await connection.query(`
      SELECT 
        id,
        email,
        CONCAT(first_name, ' ', last_name) as name,
        role,
        is_active
      FROM users
      WHERE role = 'citizen'
      ORDER BY email
      LIMIT 20
    `);

    if (citizens.length > 0) {
      console.table(citizens);
    } else {
      console.log('   No citizen users found.\n');
    }

    // Check for users with SMS access
    console.log('4️⃣  Users WITH SMS Blast Access:\n');
    const [smsUsers] = await connection.query(`
      SELECT 
        id,
        email,
        CONCAT(first_name, ' ', last_name) as name,
        role,
        jurisdiction,
        is_active
      FROM users
      WHERE role IN ('super_admin', 'admin', 'mdrrmo', 'pnp', 'bfp', 'lgu_officer', 'lgu')
      ORDER BY role, email
    `);

    console.table(smsUsers);

    // Summary
    console.log('\n5️⃣  Summary:\n');
    const [summary] = await connection.query(`
      SELECT 
        role,
        COUNT(*) as count,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count
      FROM users
      GROUP BY role
      ORDER BY 
        CASE role
          WHEN 'super_admin' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'mdrrmo' THEN 3
          WHEN 'pnp' THEN 4
          WHEN 'bfp' THEN 5
          WHEN 'lgu_officer' THEN 6
          WHEN 'lgu' THEN 7
          WHEN 'citizen' THEN 8
          ELSE 9
        END
    `);

    console.table(summary);

    console.log('\n✅ SMS Blast Permission Check Complete!\n');
    console.log('📝 Troubleshooting Tips:');
    console.log('   1. If you get "Insufficient permissions" error:');
    console.log('      - Check your JWT token is valid');
    console.log('      - Verify your user role is NOT "citizen"');
    console.log('      - Make sure you\'re logged in (token not blacklisted)');
    console.log('   2. Test your token at: http://localhost:3001/api/v1/auth/me');
    console.log('   3. Get a new token by logging in again\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkSMSPermissions().catch(console.error);
