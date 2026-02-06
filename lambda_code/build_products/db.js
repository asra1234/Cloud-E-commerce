const mysql = require('mysql2/promise');
const { getSecret } = require('../shared/secrets');

let pool;

async function getPool() {
  if (pool) return pool;

  let host = process.env.DB_HOST || 'localhost';
  let user = process.env.DB_USER || 'root';
  let password = process.env.DB_PASSWORD || '';
  let database = process.env.DB_NAME || 'cloudretail';

  if (process.env.SECRET_ARN) {
    try {
      const secret = await getSecret(process.env.SECRET_ARN);
      if (secret) {
        host = secret.host || host;
        user = secret.username || secret.user || user;
        password = secret.password || secret.pass || password;
        database = secret.dbname || secret.database || database;
      }
    } catch (err) {
      console.warn('Failed to load secret, falling back to env vars', err.message || err);
    }
  }

  pool = mysql.createPool({
    host,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });

  return pool;
}

module.exports = { getPool };