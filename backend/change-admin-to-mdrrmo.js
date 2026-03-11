// Change admin user role to mdrrmo
const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

async function changeAdminToMDRRMO() {
  console.log('========================================');
  console.log('Change Admin User Role to MDRRMO');
  console.log('========================================');
  console.log('');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'safehaven_db'
  });

  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log('');

  try {
    // Check current admin user
    console.log('Current admin user:');
    const [before] = await connection.query(
      "SELECT id, email, first_name, last_name, role FROM users WHERE email = 'admin@test.safehaven.com'"
    );
    console.table(before);
    console.log('');

    if (before.length === 0) {
      console.log('❌ User admin@test.safehaven.com not found!');
      console.log('Available admin users:');
      const [admins] = await connection.query(
        "SELECT id, email, first_name, last_name, role FROM users WHERE role = 'admin'"
      );
      console.table(admins);
      process.exit(1);
    }

    // Update role to mdrrmo
    console.log('Changing role to mdrrmo...');
    await connection.query(`
      UPDATE users 
      SET role = 'mdrrmo',
          first_name = 'MDRRMO',
          last_name = 'Admin',
          updated_at = CURRENT_TIMESTAMP
      WHERE email = 'admin@test.safehaven.com'
    `);
    
    console.log('✓ Role changed successfully!');
    console.log('');

    // Verify the change
    console.log('Updated user:');
    const [after] = await connection.query(
      "SELECT id, email, first_name, last_name, role FROM users WHERE email = 'admin@test.safehaven.com'"
    );
    console.table(after);

    console.log('');
    console.log('========================================');
    console.log('Migration Complete!');
    console.log('========================================');
    console.log('');
    console.log('Next steps:');
    console.log('1. Backend already compiled');
    console.log('2. Restart backend server: npm start');
    console.log('3. Test SOS/incident assignment to MDRRMO');
    console.log('4. Login as admin@test.safehaven.com (now MDRRMO role)');

  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

changeAdminToMDRRMO();
