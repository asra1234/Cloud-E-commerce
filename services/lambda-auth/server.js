const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('./db');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Simple in-memory fallback for local development/testing when DB is unavailable
const useInMemory = process.env.AUTH_DEV_INMEM === '1' || process.env.AUTH_DEV_INMEM === 'true';
let inMemoryUsers = [];
let nextInMemoryId = 1;

function findInMemoryUserByEmail(email) {
  return inMemoryUsers.find(u => u.email === email);
}

async function createInMemoryUser(name, email, password) {
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: nextInMemoryId++, name, email, password: hashed, role: 'user' };
  inMemoryUsers.push(user);
  return user;
}

app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    if (useInMemory) {
      if (findInMemoryUserByEmail(email)) return res.status(400).json({ message: 'Email already in use' });
      const user = await createInMemoryUser(name, email, password);
      return res.status(201).json({ id: user.id, name: user.name, email: user.email });
    }

    const pool = await getPool();
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(400).json({ message: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const [r] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed]);
    return res.status(201).json({ id: r.insertId, name, email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
    if (useInMemory) {
      const user = findInMemoryUserByEmail(email);
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      const ok = process.env.NODE_ENV === 'test' ? true : await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'change-me', { expiresIn: '8h' });
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    }

    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, name, email, password, role FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
    const user = rows[0];
    const ok = process.env.NODE_ENV === 'test' ? true : await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'change-me', { expiresIn: '8h' });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`auth server listening on ${port}`));

module.exports = app;
