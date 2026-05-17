const request = require('supertest');
const app     = require('../src/app');
const pool    = require('../src/db');

jest.mock('../src/db');

const mockRestaurant = {
  id: 1,
  nombre: 'Pizzería Roma',
  tipo_comida: 'Italiana',
  categoria: 'Pizza',
  descripcion: 'Pizzas al horno de leña',
  imagen_url: null,
  rank: 0.1,
};

beforeEach(() => jest.clearAllMocks());

describe('T08 — GET /api/search', () => {

  // ── Búsqueda vacía ────────────────────────────────────────────────
  test('sin parámetro q → 400', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Ingrese un término');
  });

  test('q vacío → 400', async () => {
    const res = await request(app).get('/api/search?q=');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Ingrese un término');
  });

  test('q con solo espacios → 400', async () => {
    const res = await request(app).get('/api/search?q=   ');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Ingrese un término');
  });

  test('menos de 3 chars → 400', async () => {
    const res = await request(app).get('/api/search?q=pi');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Ingrese al menos 3 caracteres');
  });

  // ── Búsqueda con resultados ───────────────────────────────────────
  test('búsqueda válida con resultados → 200', async () => {
    pool.query.mockResolvedValue({ rows: [mockRestaurant] });
    const res = await request(app).get('/api/search?q=pizza');
    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(1);
    expect(res.body.results[0].nombre).toBe('Pizzería Roma');
    expect(res.body.query).toBe('pizza');
  });

  // ── Sin resultados ────────────────────────────────────────────────
  test('sin resultados → array vacío + 200', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const res = await request(app).get('/api/search?q=zzznoencontrado');
    expect(res.status).toBe(200);
    expect(res.body.results).toEqual([]);
  });

  // ── Caracteres especiales / inyecciones ───────────────────────────
  test('intento SQL injection → no falla (query parametrizada)', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const res = await request(app).get("/api/search?q=' OR 1=1 --");
    expect(res.status).toBe(200);
    expect(res.body.results).toEqual([]);
  });

  test('intento XSS con etiquetas HTML → etiquetas eliminadas', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    // <script>xss</script> → sanitizado a "xss" (3 chars válidos)
    const res = await request(app).get('/api/search?q=<script>xss</script>');
    expect(res.status).toBe(200);
    expect(res.body.query).toBe('xss');
  });

  test('etiqueta HTML pura → menos de 3 chars tras limpiar → 400', async () => {
    // "<b></b>" → sanitizado a "" → vacío → 400
    const res = await request(app).get('/api/search?q=<b></b>');
    expect(res.status).toBe(400);
  });

  // ── Límite de longitud ────────────────────────────────────────────
  test('input de 150 chars → truncado a 100 en la respuesta', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const longQ = 'a'.repeat(150);
    const res = await request(app).get(`/api/search?q=${longQ}`);
    expect(res.status).toBe(200);
    expect(res.body.query.length).toBeLessThanOrEqual(100);
  });
});
