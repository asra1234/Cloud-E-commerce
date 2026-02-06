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

exports.getProducts = async () => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, name, description, price, image, stock FROM products');
    return buildResponse(200, rows);
  } catch (err) {
    console.error(err);
    if (process.env.DEBUG === 'true') {
      return buildResponse(500, { message: 'Server error', error: err.message, stack: err.stack });
    }
    return buildResponse(500, { message: 'Server error' });
  }
};

exports.getProductById = async (event) => {
  const id = event.pathParameters && event.pathParameters.id;
  if (!id) return buildResponse(400, { message: 'Missing id' });

  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, name, description, price, image, stock FROM products WHERE id = ?', [id]);
    if (!rows.length) return buildResponse(404, { message: 'Product not found' });
    return buildResponse(200, rows[0]);
  } catch (err) {
    console.error(err);
    if (process.env.DEBUG === 'true') {
      return buildResponse(500, { message: 'Server error', error: err.message, stack: err.stack });
    }
    return buildResponse(500, { message: 'Server error' });
  }
};

exports.createProduct = async (event) => {
  try {
    // require admin JWT
    const headers = event.headers || {};
    const auth = headers.Authorization || headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return buildResponse(401, { message: 'Unauthorized' });
    }
    const token = auth.split(' ')[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'change-me');
    } catch (err) {
      return buildResponse(401, { message: 'Invalid token' });
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { name, description, price, image, stock } = body;
    if (!name || price === undefined) return buildResponse(400, { message: 'Missing required fields: name or price' });

    const pool = await getPool();
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, image, stock) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, price, image || null, stock || 0]
    );

    const insertId = result.insertId;
    const [rows] = await pool.query('SELECT id, name, description, price, image, stock FROM products WHERE id = ?', [insertId]);
    // publish event
    publishEvent('product.created', { id: rows[0].id, name: rows[0].name });
    return buildResponse(201, rows[0]);
  } catch (err) {
    console.error(err);
    if (process.env.DEBUG === 'true') {
      return buildResponse(500, { message: 'Server error', error: err.message, stack: err.stack });
    }
    return buildResponse(500, { message: 'Server error' });
  }
};

exports.updateProduct = async (event) => {
  const id = event.pathParameters && event.pathParameters.id;
  if (!id) return buildResponse(400, { message: 'Missing id' });

  try {
    // require admin JWT
    const headers = event.headers || {};
    const auth = headers.Authorization || headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return buildResponse(401, { message: 'Unauthorized' });
    }
    const token = auth.split(' ')[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'change-me');
    } catch (err) {
      return buildResponse(401, { message: 'Invalid token' });
    }

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
    const [rows] = await pool.query('SELECT id, name, description, price, image, stock FROM products WHERE id = ?', [id]);
    if (!rows.length) return buildResponse(404, { message: 'Product not found' });
    publishEvent('product.updated', { id: rows[0].id, name: rows[0].name });
    return buildResponse(200, rows[0]);
  } catch (err) {
    console.error(err);
    if (process.env.DEBUG === 'true') {
      return buildResponse(500, { message: 'Server error', error: err.message, stack: err.stack });
    }
    return buildResponse(500, { message: 'Server error' });
  }
};

exports.deleteProduct = async (event) => {
  const id = event.pathParameters && event.pathParameters.id;
  if (!id) return buildResponse(400, { message: 'Missing id' });

  try {
    const headers = event.headers || {};
    const auth = headers.Authorization || headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return buildResponse(401, { message: 'Unauthorized' });
    }
    const token = auth.split(' ')[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'change-me');
    } catch (err) {
      return buildResponse(401, { message: 'Invalid token' });
    }

    const pool = await getPool();
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    // publish deletion event
    publishEvent('product.deleted', { id });
    return buildResponse(204, {});
  } catch (err) {
    console.error(err);
    return buildResponse(500, { message: 'Server error' });
  }
};
