const fs = require('fs');
const path = require('path');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function getSecret(secretArn) {
  const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });
  const cmd = new GetSecretValueCommand({ SecretId: secretArn });
  const res = await client.send(cmd);
  const s = res.SecretString || '';
  try { return JSON.parse(s); } catch (err) {
    const cleaned = s.trim();
    if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
      const inner = cleaned.slice(1, -1);
      const parts = inner.split(',').map(p => p.trim()).filter(Boolean);
      const obj = {};
      for (const part of parts) {
        const idx = part.indexOf(':');
        if (idx > -1) {
          const key = part.slice(0, idx).trim();
          const val = part.slice(idx + 1).trim();
          obj[key] = val;
        }
      }
      return obj;
    }
    return {};
  }
}

async function runSeedLogic() {
  const secretArn = process.env.SECRET_ARN;
  if (!secretArn) throw new Error('SECRET_ARN env var required');

  const secret = await getSecret(secretArn);
  const host = secret.host || secret.HOST || process.env.DB_HOST;
  const user = secret.username || secret.user || process.env.DB_USER;
  const password = secret.password || secret.pass || process.env.DB_PASSWORD;
  const database = secret.dbname || secret.database || process.env.DB_NAME || 'cloudretail';

  if (!host || !user || !password) throw new Error('Secret missing host/user/password');

  const conn = await mysql.createConnection({ host, user, password, multipleStatements: true });
  const candidates = [
    path.resolve(__dirname, 'backend', 'db.sql'),
    path.resolve(__dirname, '..', 'backend', 'db.sql'),
    path.resolve(__dirname, '..', '..', 'backend', 'db.sql'),
  ];
  let realPath = null;
  for (const c of candidates) if (fs.existsSync(c)) { realPath = c; break }
  if (!realPath) throw new Error('Could not find backend/db.sql in package');
  const sql = fs.readFileSync(realPath, 'utf8');
  await conn.query(sql);

  const adminPass = 'password123';
  const hash = bcrypt.hashSync(adminPass, 10);
  const [rows] = await conn.query('SELECT id FROM users WHERE email = ?', ['admin@cloudretail.local']);
  if (!rows.length) {
    await conn.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', ['Admin', 'admin@cloudretail.local', hash, 'admin']);
    console.log('Inserted admin user');
  } else {
    console.log('Admin already exists');
  }

  await conn.end();
}

exports.seed = async function (event, context) {
  console.log('Seed function started');
  try {
    await runSeedLogic();
    console.log('Seed completed');
    return { statusCode: 200, body: 'Seed completed' };
  } catch (err) {
    console.error('Seed error', err);
    return { statusCode: 500, body: String(err) };
  }
};
