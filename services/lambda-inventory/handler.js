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

exports.getInventory = async () => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, name, stock, image FROM products');
    return buildResponse(200, rows);
  } catch (err) {
    console.error(err);
    const body = { message: 'Server error' };
    if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') body.error = err.message || String(err);
    return buildResponse(500, body);
  }
};

exports.getInventoryById = async (event) => {
  const id = event.pathParameters && event.pathParameters.id;
  if (!id) return buildResponse(400, { message: 'Missing id' });

  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, name, description, price, stock, image FROM products WHERE id = ?', [id]);
    if (!rows.length) return buildResponse(404, { message: 'Item not found' });
    return buildResponse(200, rows[0]);
  } catch (err) {
    console.error(err);
    const body = { message: 'Server error' };
    if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') body.error = err.message || String(err);
    return buildResponse(500, body);
  }
};

function requireAdmin(event) {
  const headers = event.headers || {};
  const auth = headers.Authorization || headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) throw { status: 401, message: 'Unauthorized' };
  const token = auth.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'change-me');
  } catch (err) {
    throw { status: 401, message: 'Invalid token' };
  }
}

exports.createInventoryItem = async (event) => {
  try {
    requireAdmin(event);
    const body = event.body ? JSON.parse(event.body) : {};
    const { name, description, price, image, stock } = body;
    if (!name || price === undefined) return buildResponse(400, { message: 'Missing required fields: name or price' });

    const pool = await getPool();
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, image, stock) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, price, image || null, stock || 0]
    );

    const insertId = result.insertId;
    const [rows] = await pool.query('SELECT id, name, description, price, stock, image FROM products WHERE id = ?', [insertId]);
    // publish event
    publishEvent('inventory.item.created', { id: rows[0].id, name: rows[0].name, stock: rows[0].stock });
    return buildResponse(201, rows[0]);
  } catch (err) {
    if (err && err.status) return buildResponse(err.status, { message: err.message });
    console.error(err);
    const body = { message: 'Server error' };
    if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') body.error = err.message || String(err);
    return buildResponse(500, body);
  }
};

exports.updateInventoryItem = async (event) => {
  const id = event.pathParameters && event.pathParameters.id;
  if (!id) return buildResponse(400, { message: 'Missing id' });

  try {
    requireAdmin(event);
    const body = event.body ? JSON.parse(event.body) : {};
    const fields = [];
    const values = [];
    ['name', 'description', 'price', 'image', 'stock'].forEach((k) => {
      if (body[k] !== undefined) {
        fields.push(`${k} = ?`);
        values.push(body[k]);
      }
    });
    if (!fields.length) return buildResponse(400, { message: 'No fields to update' });

    values.push(id);
    const pool = await getPool();
    await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT id, name, description, price, stock, image FROM products WHERE id = ?', [id]);
    // publish update event
    publishEvent('inventory.item.updated', { id: rows[0].id, name: rows[0].name, stock: rows[0].stock });
    return buildResponse(200, rows[0]);
  } catch (err) {
    if (err && err.status) return buildResponse(err.status, { message: err.message });
    console.error(err);
    const body = { message: 'Server error' };
    if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') body.error = err.message || String(err);
    return buildResponse(500, body);
  }
};

exports.deleteInventoryItem = async (event) => {
  const id = event.pathParameters && event.pathParameters.id;
  if (!id) return buildResponse(400, { message: 'Missing id' });

  try {
    requireAdmin(event);
    const pool = await getPool();
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    publishEvent('inventory.item.deleted', { id });
    return buildResponse(204, {});
  } catch (err) {
    if (err && err.status) return buildResponse(err.status, { message: err.message });
    console.error(err);
    const body = { message: 'Server error' };
    if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') body.error = err.message || String(err);
    return buildResponse(500, body);
  }
};
