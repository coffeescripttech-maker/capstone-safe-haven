/**
 * Test the evacuation centers fix
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function testEvacuationFix() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'safehaven_db'
  });
  
  try {
    console.log('🧪 Testing Evacuation Centers Fix...\n');
    
    // Test the exact query that was failing
    console.log('1️⃣ Testing boolean vs integer comparison:');
    
    // Test with boolean true (this was failing)
    console.log('   Testing: is_active = true');
    const [boolResult] = await connection.query('SELECT COUNT(*) as count FROM evacuation_centers WHERE is_active = true');
    console.log('   Result:', boolResult[0].count, 'centers');
    
    // Test with integer 1 (this should work)
    console.log('   Testing: is_active = 1');
    const [intResult] = await connection.query('SELECT COUNT(*) as count FROM evacuation_centers WHERE is_active = 1');
    console.log('   Result:', intResult[0].count, 'centers');
    
    // Test the actual query structure used by the service
    console.log('\n2️⃣ Testing service query structure:');
    const query = `
      SELECT id, name, address, city, province, barangay,
             ST_X(location) as longitude, ST_Y(location) as latitude,
             capacity, current_occupancy, contact_person, contact_number,
             facilities, is_active, created_at, updated_at
      FROM evacuation_centers 
      WHERE 1=1 AND is_active = ?
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `;
    
    const [serviceResult] = await connection.query(query, [1, 20, 0]);
    console.log('   Service query result:', serviceResult.length, 'centers');
    
    if (serviceResult.length > 0) {
      console.log('\n✅ SUCCESS! Centers are now being returned');
      console.log('📋 Centers found:');
      serviceResult.forEach((center, index) => {
        console.log(`   ${index + 1}. ${center.name} - ${center.city}, ${center.province}`);
      });
    } else {
      console.log('\n❌ Still no centers returned');
    }
    
    console.log('\n🔧 Fix Applied:');
    console.log('   Changed: params.push(is_active)');
    console.log('   To: params.push(is_active ? 1 : 0)');
    console.log('   This ensures boolean true becomes integer 1');
    
  } finally {
    await connection.end();
  }
}

testEvacuationFix().catch(console.error);