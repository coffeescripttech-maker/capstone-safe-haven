const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function applyReservationMigration() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'safehaven_db',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '013_add_center_reservations.sql');
    console.log(`📄 Reading migration: ${migrationPath}`);
    
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔄 Applying migration...');
    await connection.query(sql);

    console.log('✅ Migration applied successfully!');
    console.log('');
    console.log('📊 Verifying schema...');

    // Verify table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'center_reservations'"
    );

    if (tables.length > 0) {
      console.log('✅ center_reservations table created');
      
      // Show table structure
      const [columns] = await connection.query(
        "DESCRIBE center_reservations"
      );
      console.log('📋 Table structure:');
      columns.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
      });
    }

    // Verify view exists
    const [views] = await connection.query(
      "SHOW FULL TABLES WHERE Table_type = 'VIEW' AND Tables_in_safehaven_db = 'center_availability'"
    );

    if (views.length > 0) {
      console.log('✅ center_availability view created');
    }

    // Verify evacuation_centers columns
    const [centerCols] = await connection.query(
      "DESCRIBE evacuation_centers"
    );
    
    const hasReservedSlots = centerCols.some(col => col.Field === 'reserved_slots');
    const hasConfirmedSlots = centerCols.some(col => col.Field === 'confirmed_slots');
    
    if (hasReservedSlots && hasConfirmedSlots) {
      console.log('✅ evacuation_centers table updated with new columns');
    }

    console.log('');
    console.log('🎉 Reservation system migration complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Restart backend server: cd MOBILE_APP/backend && npm run dev');
    console.log('2. Test reservation endpoints');
    console.log('3. Implement mobile UI (Phase 2)');

  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run migration
applyReservationMigration();
