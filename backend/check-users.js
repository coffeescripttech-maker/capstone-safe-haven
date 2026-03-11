// Check all users in database
const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'safehaven_db'
  });

  try {
    console.log('All users in database:');
    const [users] = await connection.query(
      "SELECT id, email, first_name, last_name, role FROM users ORDER BY role, id"
    );
    console.table(users);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkUsers();
