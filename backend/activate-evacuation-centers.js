/**
 * Activate all evacuation centers so they appear in the mobile app
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function activateEvacuationCenters() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'safehaven_db'
  });

  try {
    console.log('🏢 Activating evacuation centers for mobile app visibility...\n');

    // Check current status
    const [beforeCount] = await connection.query(
      'SELECT COUNT(*) as total, SUM(is_active) as active, COUNT(*) - SUM(is_active) as inactive FROM evacuation_centers'
    );
    
    console.log('📊 Current Status:');
    console.log(`   Total Centers: ${beforeCount[0].total}`);
    console.log(`   Active: ${beforeCount[0].active}`);
    console.log(`   Inactive: ${beforeCount[0].inactive}\n`);

    if (beforeCount[0].total === 0) {
      console.log('❌ No evacuation centers found in database');
      console.log('💡 Create evacuation centers in the admin panel first');
      return;
    }

    // Show current centers
    console.log('📋 Current Evacuation Centers:');
    const [centers] = await connection.query(`
      SELECT id, name, city, province, 
             ST_X(location) as longitude, ST_Y(location) as latitude,
             capacity, is_active
      FROM evacuation_centers 
      ORDER BY created_at DESC
    `);
    console.table(centers);

    // Activate all inactive centers
    const [updateResult] = await connection.query(
      'UPDATE evacuation_centers SET is_active = 1, updated_at = NOW() WHERE is_active = 0'
    );

    console.log(`\n✅ Activated ${updateResult.affectedRows} evacuation centers`);

    // Show updated status
    const [afterCount] = await connection.query(
      'SELECT COUNT(*) as total, SUM(is_active) as active, COUNT(*) - SUM(is_active) as inactive FROM evacuation_centers'
    );
    
    console.log('\n📊 Updated Status:');
    console.log(`   Total Centers: ${afterCount[0].total}`);
    console.log(`   Active: ${afterCount[0].active}`);
    console.log(`   Inactive: ${afterCount[0].inactive}`);

    console.log('\n🎉 All evacuation centers are now ACTIVE and visible in mobile app!');
    console.log('📱 Users can now see evacuation centers in the mobile app');
    console.log('🗺️ Centers will appear in both list view and map view');

    // Show distance info
    console.log('\n📍 Distance/Radius Information:');
    console.log('   • Mobile app shows nearby centers within 50km radius by default');
    console.log('   • If user has no location, all active centers are shown');
    console.log('   • Users can search centers by name or location');
    console.log('   • Centers are sorted by distance when location is available');

  } catch (error) {
    console.error('❌ Error activating evacuation centers:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the script
activateEvacuationCenters().catch(console.error);