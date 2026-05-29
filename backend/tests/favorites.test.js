const request = require('supertest');
const app  = require('../src/app');
const pool = require('../src/db');
const jwt  = require('jsonwebtoken');

jest.mock('../src/db');
jest.mock('jsonwebtoken');

const AUTH_HEADER = 'Bearer mock_token';
const mockUser    = { id: 42, nombre: 'Ana Test', email: 'ana@test.com' };

beforeEach(() => {
  jest.clearAllMocks();
  // Por defecto el token es válido en todos los tests
  jwt.verify.mockReturnValue(mockUser);
});

// ══════════════════════════════════════════════════════════════════
// POST /api/favorites/:restaurantId — T03 HU10
// ══════════════════════════════════════════════════════════════════
describe('T03 HU10 — POST /api/favorites/:restaurantId', () => {

  test('restaurante existente → 201 con mensaje de confirmación', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })   // SELECT 1 FROM restaurantes
      .mockResolvedValueOnce({ rows: [] });             // INSERT ... ON CONFLICT DO NOTHING

    const res = await request(app)
      .post('/api/favorites/1')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  test('agregar el mismo favorito dos veces → 201 idempotente (ON CONFLICT DO NOTHING)', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/favorites/1')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(201);
  });

  test('restaurante inexistente → 404', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // SELECT devuelve vacío

    const res = await request(app)
      .post('/api/favorites/9999')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('restaurantId no numérico → 400', async () => {
    const res = await request(app)
      .post('/api/favorites/abc')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('sin token de autenticación → 401', async () => {
    const res = await request(app).post('/api/favorites/1');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('token inválido → 401', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('invalid signature'); });

    const res = await request(app)
      .post('/api/favorites/1')
      .set('Authorization', 'Bearer token_invalido');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('la query INSERT recibe el user_id correcto del token', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 5 }] })
      .mockResolvedValueOnce({ rows: [] });

    await request(app)
      .post('/api/favorites/5')
      .set('Authorization', AUTH_HEADER);

    const insertCall = pool.query.mock.calls[1];
    expect(insertCall[1]).toContain(mockUser.id);   // user_id = 42
    expect(insertCall[1]).toContain(5);              // restaurant_id = 5
  });

  test('error en base de datos → 500', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/api/favorites/1')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

// ══════════════════════════════════════════════════════════════════
// GET /api/favorites — T03 HU10 (carga inicial de IDs)
// ══════════════════════════════════════════════════════════════════
describe('T03 HU10 — GET /api/favorites', () => {

  test('usuario con favoritos → 200 con array de IDs numéricos', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ restaurant_id: 1 }, { restaurant_id: 7 }, { restaurant_id: 23 }],
    });

    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.favorites).toEqual([1, 7, 23]);
  });

  test('usuario sin favoritos → 200 con array vacío', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.favorites).toEqual([]);
  });

  test('sin token → 401', async () => {
    const res = await request(app).get('/api/favorites');

    expect(res.status).toBe(401);
  });

  test('la query filtra por el user_id del token (no devuelve favoritos de otros)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await request(app)
      .get('/api/favorites')
      .set('Authorization', AUTH_HEADER);

    const [, params] = pool.query.mock.calls[0];
    expect(params).toContain(mockUser.id);
  });
});

// ══════════════════════════════════════════════════════════════════
// DELETE /api/favorites/:restaurantId — T04 HU10
// ══════════════════════════════════════════════════════════════════
describe('T04 HU10 — DELETE /api/favorites/:restaurantId', () => {

  test('favorito existente → 200 con mensaje de confirmación', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/api/favorites/1')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('eliminar favorito que no existe → 200 idempotente (DELETE es seguro)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/api/favorites/9999')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
  });

  test('restaurantId no numérico → 400', async () => {
    const res = await request(app)
      .delete('/api/favorites/abc')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('sin token → 401', async () => {
    const res = await request(app).delete('/api/favorites/1');

    expect(res.status).toBe(401);
  });

  test('la query DELETE usa el user_id del token (no borra favoritos de otros)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await request(app)
      .delete('/api/favorites/3')
      .set('Authorization', AUTH_HEADER);

    const [, params] = pool.query.mock.calls[0];
    expect(params).toContain(mockUser.id);
    expect(params).toContain(3);
  });

  test('error en base de datos → 500', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .delete('/api/favorites/1')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
