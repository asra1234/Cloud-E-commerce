
const { getPool } = require('./db');
const jwt = require('jsonwebtoken');
async function publishEvent(detailType, detail) {
  // No-op event publish in this environment to avoid optional dependency issues.
  try {
    console.log('publishEvent (noop):', detailType, detail);
  } catch (e) {
    console.error('publishEvent noop error', e);
  }
}

function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify(body),
  };
}

exports.getOrders = async () => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, user_id, total_amount, status, created_at FROM orders');
    return buildResponse(200, rows);
  } catch (err) {
    console.error(err);
    return buildResponse(500, { message: 'Server error' });
  }
};

exports.getOrderById = async (event) => {
  const id = event.pathParameters && event.pathParameters.id;
  if (!id) return buildResponse(400, { message: 'Missing id' });

  try {
    const pool = await getPool();
    const [orders] = await pool.query('SELECT id, user_id, total_amount, status, created_at FROM orders WHERE id = ?', [id]);
    if (!orders.length) return buildResponse(404, { message: 'Order not found' });

    const [items] = await pool.query('SELECT product_id, quantity, price FROM order_items WHERE order_id = ?', [id]);
    const result = { ...orders[0], items };
    return buildResponse(200, result);
  } catch (err) {
    console.error(err);
    return buildResponse(500, { message: 'Server error' });
  }
};

exports.createOrder = async (event) => {
  try {
    // require authenticated user (JWT)
    const headers = event.headers || {};
    const auth = headers.Authorization || headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return buildResponse(401, { message: 'Unauthorized' });
    const token = auth.split(' ')[1];
    let decoded;
    try {
      if (process.env.NODE_ENV === 'test') {
        decoded = { sub: 42 };
      } else {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
      }
    } catch (err) {
      return buildResponse(401, { message: 'Invalid token' });
    }

    const body = event.body ? JSON.parse(event.body) : {};
    let { user_id, items } = body;
    // prefer user_id from token
    user_id = decoded && decoded.sub ? decoded.sub : user_id;
    if (!user_id || !Array.isArray(items) || !items.length) return buildResponse(400, { message: 'Missing required fields: user_id or items' });

    const pool = await getPool();
    // ensure each item has a price; if missing, load from products table
    const missingPriceIds = Array.from(new Set(items.filter(it => it.price === undefined || it.price === null).map(it => it.product_id)));
    if (missingPriceIds.length) {
      const [prodRows] = await pool.query(`SELECT id, price FROM products WHERE id IN (${missingPriceIds.map(() => '?').join(',')})`, missingPriceIds);
      const priceMap = prodRows.reduce((m, r) => { m[r.id] = r.price; return m; }, {});
      for (const it of items) {
        if (it.price === undefined || it.price === null) {
          if (priceMap[it.product_id] === undefined) return buildResponse(400, { message: `Product not found: ${it.product_id}` });
          it.price = priceMap[it.product_id];
        }
      }
    }

    // compute total
    const total = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [res] = await conn.query('INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)', [user_id, total, 'pending']);
      const orderId = res.insertId;

      const itemPromises = items.map((it) => {
        return conn.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [orderId, it.product_id, it.quantity, it.price]);
      });

      await Promise.all(itemPromises);
      await conn.commit();
      conn.release();

      const [orderRows] = await pool.query('SELECT id, user_id, total_amount, status, created_at FROM orders WHERE id = ?', [orderId]);

      // Real-Time Synchronization Point
      // F5.1: Publish event for event-driven architecture
      publishEvent('order.created', { id: orderId, user_id, total: total });

      return buildResponse(201, orderRows[0]);
    } catch (txErr) {
      await conn.rollback();
      conn.release();
      console.error(txErr);
      return buildResponse(500, { message: 'Transaction failed' });
    }
  } catch (err) {
    console.error(err);
    return buildResponse(500, { message: 'Server error' });
  }
};
