describe('Auth handler unit tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  test('register creates a user and returns 201', async () => {
    const dbModule = require('../../services/lambda-auth/db');
    const bcrypt = require('bcryptjs');

    // First query: check existing -> []
    // Second query: insert -> returns insertId
    const fakeQuery = jest.fn()
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 7 }]);
    jest.spyOn(dbModule, 'getPool').mockResolvedValue({ query: fakeQuery });
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpw');

    const handler = require('../../services/lambda-auth/handler');
    const event = { body: JSON.stringify({ name: 'A', email: 'a@x.com', password: 'pass' }) };
    const res = await handler.register(event);
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('id', 7);
  });

  test('login returns token on valid credentials', async () => {
    const dbModule = require('../../services/lambda-auth/db');
    const bcrypt = require('bcryptjs');
    jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'jwt-token'), verify: jest.fn(() => ({ sub: 11 })) }));
    const jwt = require('jsonwebtoken');

    const userRow = [{ id: 11, name: 'Bob', email: 'b@x.com', password: 'hashed', role: 'user' }];
    const fakeQuery = jest.fn().mockResolvedValue([userRow]);
    jest.spyOn(dbModule, 'getPool').mockResolvedValue({ query: fakeQuery });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const handler = require('../../services/lambda-auth/handler');
    const event = { body: JSON.stringify({ email: 'b@x.com', password: 'pass' }) };
    // debug: confirm mocks
    const pool = await dbModule.getPool();
    console.log('DB QUERY RESULT DIRECT ->', JSON.stringify(await pool.query('')));
    console.log('BCRYPT COMPARE DIRECT ->', await bcrypt.compare('pass', 'hashed'));
    console.log('JWT SIGN EXISTS ->', typeof jwt.sign);
    const res = await handler.login(event);
    console.log('LOGIN RES', res);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('token', 'jwt-token');
  });
});
