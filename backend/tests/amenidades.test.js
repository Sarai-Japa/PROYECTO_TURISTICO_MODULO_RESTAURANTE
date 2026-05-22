const request = require('supertest');
const app  = require('../src/app');
const pool = require('../src/db');

jest.mock('../src/db');
beforeEach(() => jest.clearAllMocks());

const mockAmenidades = [
  { id: 1, slug: 'wifi',            nombre: 'Wi-Fi',           icono: 'Wifi' },
  { id: 2, slug: 'terraza',         nombre: 'Terraza',         icono: 'Sun' },
  { id: 3, slug: 'estacionamiento', nombre: 'Estacionamiento', icono: 'ParkingCircle' },
];

describe('T01 HU05 — GET /api/amenidades', () => {

  test('retorna 200 con array de amenidades', async () => {
    pool.query.mockResolvedValueOnce({ rows: mockAmenidades });

    const res = await request(app).get('/api/amenidades');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(3);
  });

  test('cada amenidad tiene id, slug, nombre e icono', async () => {
    pool.query.mockResolvedValueOnce({ rows: mockAmenidades });

    const res = await request(app).get('/api/amenidades');

    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('slug');
    expect(res.body[0]).toHaveProperty('nombre');
    expect(res.body[0]).toHaveProperty('icono');
  });

  test('retorna array vacío si no hay amenidades en la BD', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/amenidades');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
