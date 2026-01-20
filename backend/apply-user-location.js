// Apply User Location Schema
const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function applySchema() {
  console.log('Applying user location schema...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'safehaven_db',
    multipleStatements: true
  });

  try {
    console.log('Connected to database');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '../database/add_user_location.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute SQL
    await connection.query(sql);
    
    console.log('✓ User location schema applied successfully!');
    console.log('✓ Users table now has: city, latitude, longitude columns');
    console.log('✓ Sample location data added for testing');
  } catch (error) {
    console.error('✗ Error applying schema:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

applySchema();
