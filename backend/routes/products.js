const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, description, price, image, stock FROM products');
    res.json(rows);
  } catch (err) {
    console.error(err);
    if (err && err.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'Database connection refused' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query('SELECT id, name, description, price, image, stock FROM products WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err && err.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'Database connection refused' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new product (admin)
router.post('/', async (req, res) => {
  const { name, description, price, image, stock } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ message: 'Missing required fields: name or price' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, image, stock) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, price, image || null, stock || 0]
    );

    const insertId = result.insertId;
    const [rows] = await pool.query('SELECT id, name, description, price, image, stock FROM products WHERE id = ?', [insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err && err.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'Database connection refused' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
