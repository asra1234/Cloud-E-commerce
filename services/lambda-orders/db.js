const mysql = require('mysql2/promise');
const path = require('path');

function loadGetSecret() {
  const candidates = [
    '../shared/secrets',
    './services/shared/secrets',
    './shared/secrets',
    'services/shared/secrets',
    path.join(__dirname, '..', 'shared', 'secrets'),
    path.join(__dirname, 'services', 'shared', 'secrets'),
  ];
  for (const c of candidates) {
    try {
      const mod = require(c);
      if (mod && mod.getSecret) return mod.getSecret;
    } catch (e) {
      try {
        const abs = path.resolve(__dirname, c);
        const mod2 = require(abs);
        if (mod2 && mod2.getSecret) return mod2.getSecret;
      } catch (e2) {}
    }
  }
  return async () => null;
}

const getSecret = loadGetSecret();

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
