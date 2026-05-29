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
// T07 HU10 — QA: agregar/eliminar, lista, duplicados, aislamiento
// ══════════════════════════════════════════════════════════════════
describe('T07 HU10 — QA: agregar/eliminar, lista, duplicados', () => {

  const restaurantA = {
    id: 10, nombre: 'La Mar', tipo_comida: 'Marina', categoria: 'Cevichería',
    imagen_url: 'https://example.com/lamar.jpg', calificacion: '4.8', ciudad: 'Miraflores',
  };
  const restaurantB = {
    id: 20, nombre: 'Central', tipo_comida: 'Peruana', categoria: 'Alta cocina',
    imagen_url: 'https://example.com/central.jpg', calificacion: '5.0', ciudad: 'Barranco',
  };
  const restaurantC = {
    id: 30, nombre: 'Maido', tipo_comida: 'Nikkei', categoria: 'Fusión',
    imagen_url: 'https://example.com/maido.jpg', calificacion: '4.9', ciudad: 'Miraflores',
  };

  // ── Flujo completo ────────────────────────────────────────────────

  test('flujo: agregar favorito → aparece en la lista', async () => {
    // POST
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 10 }] })   // SELECT EXISTS restaurante
      .mockResolvedValueOnce({ rows: [] });              // INSERT
    const postRes = await request(app)
      .post('/api/favorites/10')
      .set('Authorization', AUTH_HEADER);
    expect(postRes.status).toBe(201);

    // GET → debe incluir el restaurante recién agregado
    pool.query
      .mockResolvedValueOnce({ rows: [restaurantA] })   // SELECT JOIN
      .mockResolvedValueOnce({ rows: [{ total: 1 }] }); // COUNT
    const getRes = await request(app)
      .get('/api/favorites')
      .set('Authorization', AUTH_HEADER);
    expect(getRes.status).toBe(200);
    expect(getRes.body.restaurants.some((r) => r.id === 10)).toBe(true);
  });

  test('flujo: eliminar favorito → desaparece de la lista', async () => {
    // DELETE
    pool.query.mockResolvedValueOnce({ rows: [] }); // DELETE
    const delRes = await request(app)
      .delete('/api/favorites/10')
      .set('Authorization', AUTH_HEADER);
    expect(delRes.status).toBe(200);

    // GET → lista vacía
    pool.query
      .mockResolvedValueOnce({ rows: [] })              // SELECT JOIN
      .mockResolvedValueOnce({ rows: [{ total: 0 }] }); // COUNT
    const getRes = await request(app)
      .get('/api/favorites')
      .set('Authorization', AUTH_HEADER);
    expect(getRes.status).toBe(200);
    expect(getRes.body.restaurants).toEqual([]);
    expect(getRes.body.meta.total).toBe(0);
  });

  test('flujo: agregar 3 restaurantes → lista devuelve los 3', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [restaurantA, restaurantB, restaurantC] })
      .mockResolvedValueOnce({ rows: [{ total: 3 }] });

    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toHaveLength(3);
    expect(res.body.meta).toMatchObject({ total: 3, totalPages: 1 });
  });

  // ── Duplicados ─────────────────────────────────────────────────────

  test('duplicado: POST dos veces el mismo restaurante → ambas llamadas devuelven 201', async () => {
    // Primera llamada
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 10 }] })
      .mockResolvedValueOnce({ rows: [] });
    const first = await request(app)
      .post('/api/favorites/10')
      .set('Authorization', AUTH_HEADER);

    // Segunda llamada (mismo restaurante, mismo usuario)
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 10 }] })
      .mockResolvedValueOnce({ rows: [] });
    const second = await request(app)
      .post('/api/favorites/10')
      .set('Authorization', AUTH_HEADER);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
  });

  test('duplicado: el INSERT usa ON CONFLICT (solo 2 queries por POST, no 3)', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 10 }] })
      .mockResolvedValueOnce({ rows: [] });

    await request(app)
      .post('/api/favorites/10')
      .set('Authorization', AUTH_HEADER);

    // Exactamente 2 queries: SELECT EXISTS + INSERT ON CONFLICT DO NOTHING
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test('duplicado: POST con restaurante ya favorito no lanza error 409 (idempotente)', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 10 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/favorites/10')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).not.toBe(409);
    expect(res.status).toBe(201);
  });

  // ── Aislamiento entre usuarios ────────────────────────────────────

  test('aislamiento: el GET de usuario A no devuelve favoritos de usuario B', async () => {
    const userB = { id: 99, nombre: 'Otro Usuario', email: 'otro@test.com' };
    jwt.verify.mockReturnValue(userB);

    pool.query
      .mockResolvedValueOnce({ rows: [] })              // usuario B no tiene favoritos
      .mockResolvedValueOnce({ rows: [{ total: 0 }] });

    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', 'Bearer token_user_b');

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toEqual([]);

    // La query recibió el user_id de B (99), no el de A (42)
    const [, params] = pool.query.mock.calls[0];
    expect(params).toContain(userB.id);
    expect(params).not.toContain(mockUser.id);
  });

  test('aislamiento: DELETE de usuario B no borra favoritos de usuario A', async () => {
    const userB = { id: 99, nombre: 'Otro Usuario', email: 'otro@test.com' };
    jwt.verify.mockReturnValue(userB);

    pool.query.mockResolvedValueOnce({ rows: [] });

    await request(app)
      .delete('/api/favorites/10')
      .set('Authorization', 'Bearer token_user_b');

    const [, params] = pool.query.mock.calls[0];
    expect(params).toContain(userB.id);   // borró el del usuario B
    expect(params).not.toContain(mockUser.id); // no tocó al usuario A
  });

  // ── Edge cases ────────────────────────────────────────────────────

  test('restaurantId = 0 → no existe en DB → 404', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // SELECT devuelve vacío

    const res = await request(app)
      .post('/api/favorites/0')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(404);
  });

  test('restaurantId negativo → no existe en DB → 404', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/favorites/-1')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(404);
  });

  test('GET página más allá del total → array vacío, meta.total correcto', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 8 }] });

    const res = await request(app)
      .get('/api/favorites?page=999&size=20')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toEqual([]);
    expect(res.body.meta.total).toBe(8);
    expect(res.body.meta.totalPages).toBe(1);
  });

  test('DELETE idempotente: eliminar dos veces el mismo favorito → ambas son 200', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const first = await request(app)
      .delete('/api/favorites/10')
      .set('Authorization', AUTH_HEADER);

    pool.query.mockResolvedValueOnce({ rows: [] });
    const second = await request(app)
      .delete('/api/favorites/10')
      .set('Authorization', AUTH_HEADER);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
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
