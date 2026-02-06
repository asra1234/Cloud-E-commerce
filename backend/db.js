const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cloudretail',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function waitForDb({ retries = 5, delay = 3000 } = {}) {
  let attempt = 0;
  while (attempt < retries) {
    attempt += 1;
    try {
      const conn = await pool.getConnection();
      try {
        await conn.query('SELECT 1');
      } finally {
        conn.release();
      }
      console.log('Database reachable');
      return true;
    } catch (err) {
      console.warn(`Database connection attempt ${attempt} failed: ${err.code || err.message}`);
      if (attempt >= retries) {
        console.error('Database unreachable after retries');
        throw err;
      }
      // wait before retrying
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  return false;
}

// attach helper to pool so other modules can call it if needed
pool.waitForDb = waitForDb;

module.exports = pool;
