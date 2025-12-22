const express = require('express');
const pool = require('../db');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Create order
router.post('/', auth, async (req, res) => {
  const userId = req.user.id;
  const { items, payment } = req.body; // items: [{product_id, quantity}]
  if (!items || !items.length) return res.status(400).json({ message: 'No items provided' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // calculate total
    let total = 0;
    for (const it of items) {
      const [pRows] = await conn.query('SELECT price, stock FROM products WHERE id = ?', [it.product_id]);
      if (!pRows.length) throw new Error('Product not found');
      if (pRows[0].stock < it.quantity) throw new Error('Insufficient stock');
      total += parseFloat(pRows[0].price) * it.quantity;
    }
    // create order
    const [orderRes] = await conn.query('INSERT INTO orders (user_id, total_amount) VALUES (?, ?)', [userId, total]);
    const orderId = orderRes.insertId;
    // add items and decrement stock
    for (const it of items) {
      const [pRows] = await conn.query('SELECT price FROM products WHERE id = ?', [it.product_id]);
      await conn.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [orderId, it.product_id, it.quantity, pRows[0].price]);
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [it.quantity, it.product_id]);
    }
    // payment stub: accept any payment object as success
    await conn.commit();
    res.json({ orderId, total, status: 'confirmed' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(400).json({ message: err.message || 'Order failed' });
  } finally {
    conn.release();
  }
});

// Get user orders
router.get('/', auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const [orders] = await pool.query('SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
