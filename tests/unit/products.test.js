const handler = require('../../services/lambda-products/handler');

jest.mock('../../services/lambda-products/db', () => ({
  getPool: jest.fn(),
}));

const { getPool } = require('../../services/lambda-products/db');

describe('Products handler unit tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('getProducts returns 200 and product list', async () => {
    const fakeQuery = jest.fn().mockResolvedValue([[{ id: 1, name: 'Test', description: 'x', price: 9.99, image: null, stock: 5 }]]);
    getPool.mockResolvedValue({ query: fakeQuery });

    const res = await handler.getProducts();
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].id).toBe(1);
  });

  test('getProductById returns 404 when not found', async () => {
    const fakeQuery = jest.fn().mockResolvedValue([[]]);
    getPool.mockResolvedValue({ query: fakeQuery });

    const res = await handler.getProductById({ pathParameters: { id: '999' } });
    expect(res.statusCode).toBe(404);
  });

  test('createProduct returns 401 when no Authorization header', async () => {
    const res = await handler.createProduct({ headers: {} });
    expect(res.statusCode).toBe(401);
  });
});
