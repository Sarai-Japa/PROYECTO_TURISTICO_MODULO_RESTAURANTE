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
// GET /api/favorites — T05 HU10 (datos completos con JOIN + paginación)
// ══════════════════════════════════════════════════════════════════
describe('T05 HU10 — GET /api/favorites', () => {

  const mockRestaurante = {
    id: 1, nombre: 'Pizzería Roma', tipo_comida: 'Italiana', categoria: 'Pizza',
    imagen_url: 'https://example.com/pizza.jpg', calificacion: '4.1', ciudad: 'Jesús María',
  };

  function mockFavQuery(rows, total = rows.length) {
    pool.query
      .mockResolvedValueOnce({ rows })                        // SELECT con JOIN
      .mockResolvedValueOnce({ rows: [{ total }] });          // COUNT
  }

  test('usuario con favoritos → 200 con datos completos del restaurante', async () => {
    mockFavQuery([mockRestaurante]);

    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toHaveLength(1);
    const r = res.body.restaurants[0];
    expect(r).toHaveProperty('id', 1);
    expect(r).toHaveProperty('nombre', 'Pizzería Roma');
    expect(r).toHaveProperty('imagen_url');
    expect(r).toHaveProperty('calificacion');
    expect(r).toHaveProperty('ciudad');
  });

  test('respuesta incluye metadatos de paginación', async () => {
    mockFavQuery([mockRestaurante], 1);

    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toMatchObject({ total: 1, page: 1, totalPages: 1 });
  });

  test('usuario sin favoritos → 200 con array vacío y meta.total = 0', async () => {
    mockFavQuery([], 0);

    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  test('paginación: page=2 size=5 → meta correcto', async () => {
    mockFavQuery(Array(5).fill(mockRestaurante), 12);

    const res = await request(app)
      .get('/api/favorites?page=2&size=5')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.meta).toMatchObject({ total: 12, page: 2, totalPages: 3, size: 5 });
  });

  test('size máximo es 200 (protección contra size=999)', async () => {
    mockFavQuery(Array(10).fill(mockRestaurante), 10);

    const res = await request(app)
      .get('/api/favorites?size=999')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.meta.size).toBeLessThanOrEqual(200);
  });

  test('los resultados vienen ordenados por fecha de guardado (más reciente primero)', async () => {
    const primero  = { ...mockRestaurante, id: 5, nombre: 'Más reciente' };
    const segundo  = { ...mockRestaurante, id: 2, nombre: 'Más antiguo' };
    mockFavQuery([primero, segundo], 2);

    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', AUTH_HEADER);

    expect(res.body.restaurants[0].nombre).toBe('Más reciente');
  });

  test('sin token → 401', async () => {
    const res = await request(app).get('/api/favorites');

    expect(res.status).toBe(401);
  });

  test('la query filtra por user_id del token (no devuelve favoritos de otros)', async () => {
    mockFavQuery([]);

    await request(app)
      .get('/api/favorites')
      .set('Authorization', AUTH_HEADER);

    const [, params] = pool.query.mock.calls[0];
    expect(params).toContain(mockUser.id);
  });

  test('error en base de datos → 500', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
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
