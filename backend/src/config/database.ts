import mysql from 'mysql2/promise';
import { logger } from '../utils/logger';

console.log({db:process.env.DB_HOST});
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'database-1.cjuyw8m4ev18.ap-southeast-2.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'MirandaFam123',
  database: process.env.DB_NAME || 'safehaven_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    logger.info('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    logger.error('Database connection failed:', err);
    process.exit(1);
  });

export default pool;
