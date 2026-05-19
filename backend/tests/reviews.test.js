const request = require('supertest');
const app     = require('../src/app');
const pool    = require('../src/db');

jest.mock('../src/db');

const mockReview = {
  id: 10,
  usuario_nombre: 'Carlos Mendoza',
  puntuacion: 5,
  comentario: 'Excelente ceviche, super recomendado.',
  fecha_creacion: '2026-05-18T10:00:00.000Z',
};

// Helper para mockear la consulta:
// 1. SELECT id FROM restaurantes (Verifica existencia)
// 2. SELECT reseñas (Promise.all[0])
// 3. SELECT COUNT(*) (Promise.all[1])
// 4. SELECT AVG(puntuacion) (Promise.all[2]) — agregado en T02 HU08
function mockReviewsQuery(restaurantExists, reviewsRows = [], total = reviewsRows.length, avgRating = 4.5) {
  jest.clearAllMocks();

  if (!restaurantExists) {
    pool.query.mockResolvedValueOnce({ rows: [] });
  } else {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })              // 1. Check existencia
      .mockResolvedValueOnce({ rows: reviewsRows })              // 2. SELECT reseñas
      .mockResolvedValueOnce({ rows: [{ total }] })              // 3. COUNT(*)
      .mockResolvedValueOnce({ rows: [{ avg_rating: avgRating }] }); // 4. AVG(puntuacion)
  }
}

beforeEach(() => jest.clearAllMocks());

describe('PTMA-117 (T04) — GET /api/restaurants/:id/reviews', () => {

  test('debe retornar 404 si el restaurante no existe', async () => {
    mockReviewsQuery(false);

    const res = await request(app).get('/api/restaurants/999/reviews');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Restaurante no encontrado');
  });

  test('debe retornar 200 y un array vacío si el restaurante existe pero no tiene reseñas', async () => {
    mockReviewsQuery(true, [], 0);

    const res = await request(app).get('/api/restaurants/1/reviews');

    expect(res.status).toBe(200);
    expect(res.body.reviews).toEqual([]);
    expect(res.body.meta).toMatchObject({
      total: 0,
      page: 1,
      totalPages: 0,
      size: 5,
    });
  });

  test('debe devolver todos los campos requeridos por el Jira', async () => {
    mockReviewsQuery(true, [mockReview], 1);

    const res = await request(app).get('/api/restaurants/1/reviews');

    expect(res.status).toBe(200);
    expect(res.body.reviews).toHaveLength(1);
    
    const r = res.body.reviews[0];
    expect(r).toHaveProperty('id', 10);
    expect(r).toHaveProperty('usuario_nombre', 'Carlos Mendoza');
    expect(r).toHaveProperty('puntuacion', 5);
    expect(r).toHaveProperty('comentario', 'Excelente ceviche, super recomendado.');
    expect(r).toHaveProperty('fecha_creacion', '2026-05-18T10:00:00.000Z');
  });

  test('debe calcular correctamente los metadatos de paginación', async () => {
    mockReviewsQuery(true, Array(5).fill(mockReview), 12);

    const res = await request(app).get('/api/restaurants/1/reviews?page=2&size=5');

    expect(res.status).toBe(200);
    expect(res.body.meta).toMatchObject({
      total: 12,
      page: 2,
      totalPages: 3,
      size: 5,
    });
  });

  test('debe limitar el tamaño de página máximo a 50', async () => {
    mockReviewsQuery(true, Array(50).fill(mockReview), 100);

    const res = await request(app).get('/api/restaurants/1/reviews?size=200');

    expect(res.status).toBe(200);
    expect(res.body.meta.size).toBe(50);
  });

  test('debe ordenar dinámicamente con sort=rating o sort=date', async () => {
    mockReviewsQuery(true, [mockReview], 1);

    const resDate = await request(app).get('/api/restaurants/1/reviews?sort=date');
    expect(resDate.status).toBe(200);
    
    mockReviewsQuery(true, [mockReview], 1);
    const resRating = await request(app).get('/api/restaurants/1/reviews?sort=rating');
    expect(resRating.status).toBe(200);
  });

  test('debe manejar IDs de restaurantes inválidos', async () => {
    const res = await request(app).get('/api/restaurants/abc/reviews');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'ID de restaurante inválido');
  });

  test('PTMA-119 / PTMA-120: debe filtrar reseñas que contengan palabras prohibidas', async () => {
    const offensiveReview = {
      id: 11,
      usuario_nombre: 'Hater',
      puntuacion: 1,
      comentario: 'Esta comida es una absoluta basura y una mierda',
      fecha_creacion: '2026-05-18T10:00:00.000Z',
    };

    mockReviewsQuery(true, [mockReview, offensiveReview], 2);

    const res = await request(app).get('/api/restaurants/1/reviews');

    expect(res.status).toBe(200);
    // Debe haber excluido la reseña ofensiva, dejando solo la reseña limpia
    expect(res.body.reviews).toHaveLength(1);
    expect(res.body.reviews[0].id).toBe(10);
    expect(res.body.meta.total).toBe(1);
  });
});
