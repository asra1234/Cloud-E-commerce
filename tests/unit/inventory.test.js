const jwt = require('jsonwebtoken');

describe('Inventory handler unit tests', () => {
  test('getInventory returns list', async () => {
    jest.resetModules();
    const dbModule = require('../../services/lambda-inventory/db');
    const fakeQuery = jest.fn().mockResolvedValue([[{ id: 2, name: 'Item', stock: 3, image: null }]]);
    jest.spyOn(dbModule, 'getPool').mockResolvedValue({ query: fakeQuery });
    const handler = require('../../services/lambda-inventory/handler');
    const res = await handler.getInventory();
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(Array.isArray(body)).toBe(true);
  });

  test('createInventoryItem requires auth', async () => {
    jest.resetModules();
    const handler = require('../../services/lambda-inventory/handler');
    const event = { headers: {} };
    const res = await handler.createInventoryItem(event);
    expect(res.statusCode).toBe(401);
  });
});
