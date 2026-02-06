const { getPool } = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

exports.register = async (event) => {
  try {
    let body = {};
    if (event.body) {
      if (typeof event.body === 'object') body = event.body;
      else {
        try { body = JSON.parse(event.body); }
        catch (e) { body = Object.fromEntries(new URLSearchParams(event.body)); }
      }
    }
    const { name, email, password } = body;
    if (!name || !email || !password) return buildResponse(400, { message: 'Missing fields' });

    const pool = await getPool();
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return buildResponse(400, { message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const [res] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed]);
    const userId = res.insertId;

    return buildResponse(201, { id: userId, name, email });
  } catch (err) {
    console.error(err);
    return buildResponse(500, { message: 'Server error' });
  }
};

exports.login = async (event) => {
  try {
    console.log('login: event.body type', typeof event.body, 'body sample', (event.body || '').slice ? (event.body || '').slice(0,200) : event.body);
    let body = {};
    if (event.body) {
      if (typeof event.body === 'object') body = event.body;
      else {
        try { body = JSON.parse(event.body); }
        catch (e) { body = Object.fromEntries(new URLSearchParams(event.body)); }
      }
    }
    const { email, password } = body;
    if (!email || !password) return buildResponse(400, { message: 'Missing fields' });

    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, name, email, password, role FROM users WHERE email = ?', [email]);
    if (!rows.length) return buildResponse(401, { message: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return buildResponse(401, { message: 'Invalid credentials' });

    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'change-me', { expiresIn: '8h' });
    return buildResponse(200, { token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    return buildResponse(500, { message: 'Server error' });
  }
};
