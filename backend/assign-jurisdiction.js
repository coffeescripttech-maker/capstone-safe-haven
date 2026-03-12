/**
 * Assign Jurisdiction to Admin/MDRRMO Users
 * 
 * This script assigns jurisdiction to admin or MDRRMO users so they can use SMS Blast.
 * Jurisdiction format: "Province:City:Barangay" or "Province:City" or "Province"
 * 
 * Examples:
 * - Province level: "Pangasinan"
 * - City level: "Pangasinan:Dagupan"
 * - Barangay level: "Pangasinan:Dagupan:Poblacion"
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function assignJurisdiction() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'safehaven_db'
  });

  try {
    console.log('🔍 Finding admin/MDRRMO users without jurisdiction...\n');

    // Find admin/MDRRMO users without jurisdiction
    const [users] = await connection.execute(
      `SELECT id, email, role, jurisdiction 
       FROM users 
       WHERE role IN ('admin', 'mdrrmo') 
       ORDER BY id`
    );

    if (users.length === 0) {
      console.log('❌ No admin/MDRRMO users found');
      return;
    }

    console.log('📋 Admin/MDRRMO Users:');
    console.log('─'.repeat(80));
    users.forEach(user => {
      console.log(`ID: ${user.id} | Email: ${user.email} | Role: ${user.role}`);
      console.log(`Jurisdiction: ${user.jurisdiction || '❌ NOT SET'}`);
      console.log('─'.repeat(80));
    });

    // Example: Assign Pangasinan jurisdiction to all admin/MDRRMO users
    console.log('\n🔧 Assigning jurisdiction to users...\n');

    for (const user of users) {
      if (!user.jurisdiction) {
        // Assign Pangasinan province-level jurisdiction
        await connection.execute(
          'UPDATE users SET jurisdiction = ? WHERE id = ?',
          ['Pangasinan', user.id]
        );
        console.log(`✅ Assigned "Pangasinan" to ${user.email} (ID: ${user.id})`);
      } else {
        console.log(`ℹ️  ${user.email} already has jurisdiction: ${user.jurisdiction}`);
      }
    }

    console.log('\n✅ Jurisdiction assignment complete!');
    console.log('\n📝 Jurisdiction Levels:');
    console.log('  - Province level: "Pangasinan" (can access all cities/barangays in province)');
    console.log('  - City level: "Pangasinan:Dagupan" (can access all barangays in city)');
    console.log('  - Barangay level: "Pangasinan:Dagupan:Poblacion" (can access only this barangay)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

// Run the script
assignJurisdiction();
