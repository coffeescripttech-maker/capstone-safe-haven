/**
 * Assign Pangasinan jurisdiction to all admin users for environmental monitoring
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function assignPangasinanJurisdiction() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'safehaven_db'
  });

  try {
    console.log('🌍 Assigning Pangasinan jurisdiction to admin users for environmental monitoring...\n');

    // Get all admin users (admin, super_admin, mdrrmo)
    const [adminUsers] = await connection.query(
      'SELECT id, email, role, jurisdiction FROM users WHERE role IN (?, ?, ?)',
      ['admin', 'super_admin', 'mdrrmo']
    );

    console.log('📋 Current admin users:');
    console.table(adminUsers);

    // Update jurisdiction for admin and mdrrmo users (super_admin keeps null for global access)
    const [updateResult] = await connection.query(
      `UPDATE users 
       SET jurisdiction = 'Pangasinan' 
       WHERE role IN ('admin', 'mdrrmo') 
       AND (jurisdiction IS NULL OR jurisdiction = '')`,
      []
    );

    console.log(`\n✅ Updated ${updateResult.affectedRows} admin users with Pangasinan jurisdiction`);

    // Show updated users
    const [updatedUsers] = await connection.query(
      'SELECT id, email, role, jurisdiction FROM users WHERE role IN (?, ?, ?) ORDER BY role, id',
      ['admin', 'super_admin', 'mdrrmo']
    );

    console.log('\n📋 Updated admin users:');
    console.table(updatedUsers);

    console.log('\n🌦️ Environmental monitoring now includes Pangasinan cities:');
    console.log('- Dagupan City');
    console.log('- San Carlos City');
    console.log('- Urdaneta City');
    console.log('- Alaminos City');
    console.log('- Lingayen');

    console.log('\n✅ Pangasinan environmental monitoring setup complete!');
    console.log('📝 Admin users can now receive weather alerts for Pangasinan locations');

  } catch (error) {
    console.error('❌ Error assigning Pangasinan jurisdiction:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the script
assignPangasinanJurisdiction().catch(console.error);