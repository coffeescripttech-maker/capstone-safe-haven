// Apply SMS source migration to database
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const connection = await mysql.createConnection({
    host: 'database-1.cjuyw8m4ev18.ap-southeast-2.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    password: 'MirandaFam123',
    database: 'safehaven_db',
    multipleStatements: true
  });

  try {
    console.log('📦 Applying SMS source migration...');

    const sql = fs.readFileSync(
      path.join(__dirname, '../database/migrations/013_add_sos_source.sql'),
      'utf8'
    );

    await connection.query(sql);

    console.log('✅ Migration applied successfully!');
    console.log('✅ Added source column to sos_alerts table');

  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ Column already exists, skipping...');
    } else if (error.code === 'ER_DUP_KEYNAME') {
      console.log('ℹ️ Index already exists, skipping...');
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  } finally {
    await connection.end();
  }
}

applyMigration()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
