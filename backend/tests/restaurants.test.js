const request = require('supertest');
const app  = require('../src/app');
const pool = require('../src/db');

jest.mock('../src/db');

// Restaurante completo (caso base)
const mockCompleto = {
  id: 1, nombre: 'Pizzería Roma', tipo_comida: 'Italiana', categoria: 'Pizza',
  descripcion: 'Pizzas al horno', direccion: 'Jr. Coliseo 78',
  ciudad: 'Jesús María', imagen_url: 'https://example.com/pizza.jpg', calificacion: '4.1',
};

// Helpers para mockear el Promise.all (SELECT + COUNT)
function mockQuery(rows, total = rows.length) {
  pool.query
    .mockResolvedValueOnce({ rows })                        // SELECT datos
    .mockResolvedValueOnce({ rows: [{ total }] });          // COUNT(*)
}

beforeEach(() => jest.clearAllMocks());

// ══════════════════════════════════════════════════════════════════
// T05 — Campos mínimos requeridos
// ══════════════════════════════════════════════════════════════════
describe('T05 — API devuelve campos mínimos', () => {

  test('respuesta incluye los 4 campos requeridos por tarjeta', async () => {
    mockQuery([mockCompleto]);
    const res = await request(app).get('/api/restaurants');

    expect(res.status).toBe(200);
    const r = res.body.restaurants[0];
    expect(r).toHaveProperty('nombre');
    expect(r).toHaveProperty('imagen_url');
    expect(r).toHaveProperty('calificacion');
    expect(r).toHaveProperty('ciudad');
  });

  test('respuesta incluye metadatos de paginación', async () => {
    mockQuery([mockCompleto], 1);
    const res = await request(app).get('/api/restaurants?page=1&size=20');

    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toMatchObject({
      total: 1, page: 1, totalPages: 1, size: 20,
    });
  });

  test('totalPages se calcula correctamente con 100 registros y size=20', async () => {
    mockQuery(Array(20).fill(mockCompleto), 100);
    const res = await request(app).get('/api/restaurants?page=1&size=20');

    expect(res.body.meta.totalPages).toBe(5);
    expect(res.body.meta.total).toBe(100);
  });

  test('page y size custom se reflejan en meta', async () => {
    mockQuery([mockCompleto], 50);
    const res = await request(app).get('/api/restaurants?page=3&size=10');

    expect(res.body.meta.page).toBe(3);
    expect(res.body.meta.size).toBe(10);
    expect(res.body.meta.totalPages).toBe(5);
  });

  test('size máximo permitido es 200 (no acepta size=500)', async () => {
    mockQuery(Array(200).fill(mockCompleto), 500);
    const res = await request(app).get('/api/restaurants?size=500');

    expect(res.body.meta.size).toBe(200);
  });
});

// ══════════════════════════════════════════════════════════════════
// T07 — Datos faltantes
// ══════════════════════════════════════════════════════════════════
describe('T07 — Comportamiento con datos faltantes', () => {

  test('imagen_url null → la API devuelve null sin error (frontend usa imagen por defecto)', async () => {
    mockQuery([{ ...mockCompleto, imagen_url: null }]);
    const res = await request(app).get('/api/restaurants');

    expect(res.status).toBe(200);
    expect(res.body.restaurants[0].imagen_url).toBeNull();
  });

  test('calificacion 0 → la API lo devuelve sin error (frontend muestra "Sin puntuación")', async () => {
    mockQuery([{ ...mockCompleto, calificacion: '0.0' }]);
    const res = await request(app).get('/api/restaurants');

    expect(res.status).toBe(200);
    expect(parseFloat(res.body.restaurants[0].calificacion)).toBe(0);
  });

  test('ciudad null → la API lo devuelve sin error (frontend muestra "Ubicación no disponible")', async () => {
    mockQuery([{ ...mockCompleto, ciudad: null }]);
    const res = await request(app).get('/api/restaurants');

    expect(res.status).toBe(200);
    expect(res.body.restaurants[0].ciudad).toBeNull();
  });

  test('todos los campos opcionales null simultáneamente → no rompe la respuesta', async () => {
    const sinDatos = { ...mockCompleto, imagen_url: null, calificacion: '0.0', ciudad: null, descripcion: null };
    mockQuery([sinDatos]);
    const res = await request(app).get('/api/restaurants');

    expect(res.status).toBe(200);
    expect(res.body.restaurants[0].nombre).toBe('Pizzería Roma');
  });

  test('lista vacía → responde 200 con array vacío (no un 404)', async () => {
    mockQuery([]);
    const res = await request(app).get('/api/restaurants');

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════════
// QA — Detalle de restaurante (PTMA-113)
// ══════════════════════════════════════════════════════════════════
describe('QA — Detalle de restaurante (existente, inexistente, inválido)', () => {

  test('GET /api/restaurants/:id existente → retorna 200 y los detalles', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockCompleto] });
    const res = await request(app).get('/api/restaurants/1');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      nombre: 'Pizzería Roma',
    });
  });

  test('GET /api/restaurants/:id inexistente → retorna 404', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/restaurants/999');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Restaurante no encontrado');
  });

  test('GET /api/restaurants/:id inválido → retorna 400', async () => {
    const res = await request(app).get('/api/restaurants/abc');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'ID de restaurante inválido');
  });
});

