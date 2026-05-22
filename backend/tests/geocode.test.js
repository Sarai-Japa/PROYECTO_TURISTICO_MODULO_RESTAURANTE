const request = require('supertest');
const app     = require('../src/app');

beforeEach(() => jest.clearAllMocks());

describe('T05 HU02 — GET /api/geocode?q=', () => {

  test('retorna resultados con label, lat y lng cuando la consulta es válida', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => [
        { display_name: 'Miraflores, Lima, Perú', lat: '-12.1219', lon: '-77.0299' },
        { display_name: 'Miraflores, Arequipa, Perú', lat: '-16.3988', lon: '-71.5350' },
      ],
    });

    const res = await request(app).get('/api/geocode?q=Miraflores');

    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(2);
    expect(res.body.results[0]).toMatchObject({
      label: 'Miraflores, Lima, Perú',
      lat:   -12.1219,
      lng:   -77.0299,
    });
  });

  test('retorna array vacío cuando la consulta tiene menos de 3 caracteres', async () => {
    const res = await request(app).get('/api/geocode?q=Mi');

    expect(res.status).toBe(200);
    expect(res.body.results).toEqual([]);
  });

  test('retorna array vacío cuando no se envía parámetro q', async () => {
    const res = await request(app).get('/api/geocode');

    expect(res.status).toBe(200);
    expect(res.body.results).toEqual([]);
  });

  test('retorna 502 cuando el servicio externo falla', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const res = await request(app).get('/api/geocode?q=Lima');

    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty('error');
  });

  test('retorna array vacío cuando el servicio externo no encuentra resultados', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => [],
    });

    const res = await request(app).get('/api/geocode?q=xyzlugarnulo');

    expect(res.status).toBe(200);
    expect(res.body.results).toEqual([]);
  });
});
