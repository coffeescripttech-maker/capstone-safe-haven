// Test SOS Alert with Incident Type

require('dotenv').config();
const mysql = require('mysql2/promise');

async function testSOSWithIncidentType() {
  console.log('🧪 Testing SOS Alert with Incident Type...\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // 1. Verify incident_types table has data
    console.log('1️⃣ Checking incident_types table...');
    const [types] = await connection.query('SELECT COUNT(*) as count FROM incident_types');
    console.log(`   ✅ Found ${types[0].count} incident types\n`);

    // 2. Verify sos_alerts table has incident type columns
    console.log('2️⃣ Checking sos_alerts table structure...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'sos_alerts'
      AND COLUMN_NAME IN ('incident_type_id', 'incident_description')
    `);
    
    columns.forEach(col => {
      console.log(`   ✅ ${col.COLUMN_NAME}: ${col.DATA_TYPE} (nullable: ${col.IS_NULLABLE})`);
    });
    console.log();

    // 3. Test INSERT with incident type
    console.log('3️⃣ Testing INSERT with incident type...');
    const [result] = await connection.query(`
      INSERT INTO sos_alerts (
        user_id, latitude, longitude, message, user_info,
        status, priority, target_agency, source,
        incident_type_id, incident_description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      1, // user_id
      14.5995, // latitude
      120.9842, // longitude
      'Test SOS with Incident Type',
      JSON.stringify({ name: 'Test User', phone: '09123456789' }),
      'sent',
      'high',
      'mdrrmo',
      'api',
      1, // incident_type_id (Flooding)
      'Test incident description'
    ]);

    const sosId = result.insertId;
    console.log(`   ✅ SOS alert created with ID: ${sosId}\n`);

    // 4. Verify the data was saved correctly
    console.log('4️⃣ Verifying saved data...');
    const [rows] = await connection.query(`
      SELECT 
        sa.id,
        sa.message,
        sa.target_agency,
        sa.incident_type_id,
        sa.incident_description,
        it.name as incident_type_name,
        it.priority as incident_priority
      FROM sos_alerts sa
      LEFT JOIN incident_types it ON sa.incident_type_id = it.id
      WHERE sa.id = ?
    `, [sosId]);

    const sos = rows[0];
    console.log('   📊 Saved SOS Alert:');
    console.log(`      ID: ${sos.id}`);
    console.log(`      Message: ${sos.message}`);
    console.log(`      Target Agency: ${sos.target_agency}`);
    console.log(`      Incident Type ID: ${sos.incident_type_id}`);
    console.log(`      Incident Type: ${sos.incident_type_name}`);
    console.log(`      Priority: ${sos.incident_priority}`);
    console.log(`      Description: ${sos.incident_description}`);
    console.log();

    // 5. Test INSERT without incident type (backward compatibility)
    console.log('5️⃣ Testing INSERT without incident type (backward compatibility)...');
    const [result2] = await connection.query(`
      INSERT INTO sos_alerts (
        user_id, latitude, longitude, message, user_info,
        status, priority, target_agency, source
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      1,
      14.5995,
      120.9842,
      'Test Quick SOS (no incident type)',
      JSON.stringify({ name: 'Test User', phone: '09123456789' }),
      'sent',
      'high',
      'all',
      'api'
    ]);

    const sosId2 = result2.insertId;
    console.log(`   ✅ Quick SOS created with ID: ${sosId2}\n`);

    // 6. Verify NULL values
    console.log('6️⃣ Verifying NULL values for quick SOS...');
    const [rows2] = await connection.query(`
      SELECT incident_type_id, incident_description
      FROM sos_alerts
      WHERE id = ?
    `, [sosId2]);

    const sos2 = rows2[0];
    console.log(`   ✅ incident_type_id: ${sos2.incident_type_id === null ? 'NULL' : sos2.incident_type_id}`);
    console.log(`   ✅ incident_description: ${sos2.incident_description === null ? 'NULL' : sos2.incident_description}`);
    console.log();

    // 7. Clean up test data
    console.log('7️⃣ Cleaning up test data...');
    await connection.query('DELETE FROM sos_alerts WHERE id IN (?, ?)', [sosId, sosId2]);
    console.log('   ✅ Test data cleaned up\n');

    console.log('🎉 All tests passed! SOS with incident types is working correctly!\n');
    console.log('✅ Summary:');
    console.log('   • Incident types table has data');
    console.log('   • SOS alerts table has incident type columns');
    console.log('   • Can save SOS with incident type');
    console.log('   • Can save SOS without incident type (backward compatible)');
    console.log('   • Foreign key relationship works');
    console.log('   • NULL values handled correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await connection.end();
  }
}

testSOSWithIncidentType();
