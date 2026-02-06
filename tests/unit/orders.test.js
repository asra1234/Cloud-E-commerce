jest.mock('jsonwebtoken', () => ({ verify: jest.fn(() => ({ sub: 42 })), sign: jest.fn(() => 'mock-token') }));

describe('Orders handler unit tests', () => {
  beforeEach(() => jest.resetAllMocks());

  test('createOrder returns 201 on success', async () => {
    jest.resetModules();

    const orderId = 123;
    const conn = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      query: jest.fn()
        .mockResolvedValueOnce([{ insertId: orderId }]) // insert into orders
        .mockResolvedValueOnce([{}]), // insert order_items
      commit: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    };

    const pool = {
      getConnection: jest.fn().mockResolvedValue(conn),
      query: jest.fn().mockResolvedValue([[{ id: orderId, user_id: 42, total_amount: 9.99, status: 'pending', created_at: new Date().toISOString() }]]),
    };
    jest.mock('jsonwebtoken', () => ({ verify: jest.fn(() => ({ sub: 42 })), sign: jest.fn(() => 'mock-token') }));
    const dbModule = require('../../services/lambda-orders/db');
    console.log('MOCK JWT VERIFY ->', require('jsonwebtoken').verify('token'));
    jest.spyOn(dbModule, 'getPool').mockResolvedValue(pool);
    const handler = require('../../services/lambda-orders/handler');

    const event = { headers: { Authorization: 'Bearer token' }, body: JSON.stringify({ items: [{ product_id: 1, quantity: 1, price: 9.99 }] }) };
    const res = await handler.createOrder(event);
    console.log('ORDER RES', res);
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('id', orderId);
  });
});
