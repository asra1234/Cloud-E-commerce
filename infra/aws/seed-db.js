const fs = require('fs');
const path = require('path');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const mysql = require('mysql2/promise');

async function getSecret(secretArn) {
  const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });
  const cmd = new GetSecretValueCommand({ SecretId: secretArn });
  const res = await client.send(cmd);
  const s = res.SecretString || '';
  try {
    return JSON.parse(s);
  } catch (err) {
    // Handle non-JSON secret formats like {username:cloudadmin,host:...,password:...}
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

async function seed() {
  try {
    const secretArn = process.env.SECRET_ARN;
    if (!secretArn) throw new Error('SECRET_ARN env var required');

    console.log('Fetching secret...');
    const secret = await getSecret(secretArn);
    const host = secret.host || secret.HOST || process.env.DB_HOST;
    const user = secret.username || secret.user || secret.USER || process.env.DB_USER;
    const password = secret.password || secret.pass || process.env.DB_PASSWORD;
    const database = secret.dbname || secret.database || process.env.DB_NAME || 'cloudretail';

    if (!host || !user || !password) throw new Error('Secret missing host/user/password');

    console.log('Connecting to', host, 'database', database);
    const conn = await mysql.createConnection({ host, user, password, multipleStatements: true });

    const sqlPath = path.resolve(__dirname, '..', '..', 'backend', 'db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running seed SQL... (this may take a moment)');
    await conn.query(sql);
    console.log('Seed SQL executed');

    // Optionally insert an admin user with known password hash (bcrypt)
    const bcrypt = require('bcrypt');
    const adminPass = 'password123';
    const hash = await bcrypt.hash(adminPass, 10);
    const [rows] = await conn.query('SELECT id FROM users WHERE email = ?', ['admin@cloudretail.local']);
    if (!rows.length) {
      await conn.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', ['Admin', 'admin@cloudretail.local', hash, 'admin']);
      console.log('Inserted admin user: admin@cloudretail.local / password123');
    } else {
      console.log('Admin user already exists');
    }

    await conn.end();
    console.log('Done');
  } catch (err) {
    console.error('Seed failed:', err.message || err);
    process.exit(1);
  }
}

seed();
