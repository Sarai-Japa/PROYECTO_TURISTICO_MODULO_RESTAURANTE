const request = require('supertest');
const app  = require('../src/app');
const pool = require('../src/db');

jest.mock('../src/db');

// Restaurante completo con todos los campos (incluye HU07)
const mockCompleto = {
  id: 1, nombre: 'Pizzería Roma', tipo_comida: 'Italiana', categoria: 'Pizza',
  descripcion: 'Pizzas al horno', direccion: 'Jr. Coliseo 78',
  ciudad: 'Jesús María', imagen_url: 'https://example.com/pizza.jpg', calificacion: '4.1',
  telefono: '+51 1 461-5523', horario: 'Lun-Sáb 12:00-23:00',
  latitud: -12.0756, longitud: -77.0476,
  redes_sociales: { instagram: '@pizzeriaroma', facebook: 'Pizzería Roma' },
};

// Helper para mockear Promise.all (SELECT + COUNT) del listado
function mockQuery(rows, total = rows.length) {
  pool.query
    .mockResolvedValueOnce({ rows })
    .mockResolvedValueOnce({ rows: [{ total }] });
}

beforeEach(() => jest.clearAllMocks());

// ══════════════════════════════════════════════════════════════════
// T05 — Campos mínimos requeridos (listado)
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
// T07 HU06 — Datos faltantes en listado
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
// T03 + T04 HU02 — Filtrado geográfico por lat/lng/radius
// ══════════════════════════════════════════════════════════════════
describe('T03/T04 HU02 — GET /api/restaurants?lat=&lng=&radius=', () => {
  const mockConDistancia = { ...mockCompleto, distancia_km: '2.3' };

  test('retorna 200 con restaurantes y campo distancia_km cuando se proporciona lat/lng', async () => {
    mockQuery([mockConDistancia], 1);
    const res = await request(app)
      .get('/api/restaurants?lat=-12.1176&lng=-77.0282&radius=5');

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toHaveLength(1);
    expect(res.body.restaurants[0]).toHaveProperty('distancia_km');
  });

  test('retorna lista vacía y meta.total=0 cuando no hay restaurantes en el radio', async () => {
    mockQuery([], 0);
    const res = await request(app)
      .get('/api/restaurants?lat=-12.1176&lng=-77.0282&radius=5');

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  test('funciona sin radius (usa 5 km por defecto)', async () => {
    mockQuery([mockConDistancia], 1);
    const res = await request(app)
      .get('/api/restaurants?lat=-12.1176&lng=-77.0282');

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toHaveLength(1);
  });

  test('lat/lng inválidos (NaN) → responde como listado normal sin distancia_km', async () => {
    mockQuery([mockCompleto], 1);
    const res = await request(app)
      .get('/api/restaurants?lat=abc&lng=xyz');

    expect(res.status).toBe(200);
    expect(res.body.restaurants[0]).not.toHaveProperty('distancia_km');
  });

  test('la paginación funciona correctamente con filtro geográfico', async () => {
    mockQuery(Array(5).fill(mockConDistancia), 12);
    const res = await request(app)
      .get('/api/restaurants?lat=-12.1176&lng=-77.0282&radius=5&page=2&size=5');

    expect(res.status).toBe(200);
    expect(res.body.meta).toMatchObject({ total: 12, page: 2, totalPages: 3, size: 5 });
  });
});

// ══════════════════════════════════════════════════════════════════
// T03 + T04 HU05 — Filtrado por amenidades (many-to-many)
// ══════════════════════════════════════════════════════════════════
describe('T03/T04 HU05 — GET /api/restaurants?amenities[]=', () => {

  test('filtra por una amenidad y retorna restaurantes que la tienen', async () => {
    mockQuery([mockCompleto], 1);
    const res = await request(app).get('/api/restaurants?amenities[]=wifi');

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  test('filtra por múltiples amenidades (AND) — retorna solo restaurantes con todas', async () => {
    mockQuery([mockCompleto], 1);
    const res = await request(app)
      .get('/api/restaurants?amenities[]=wifi&amenities[]=terraza');

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toHaveLength(1);
  });

  test('sin resultados cuando ningún restaurante tiene todas las amenidades', async () => {
    mockQuery([], 0);
    const res = await request(app)
      .get('/api/restaurants?amenities[]=wifi&amenities[]=estacionamiento&amenities[]=terraza');

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  test('acepta formato ?amenities=wifi,terraza (coma separado)', async () => {
    mockQuery([mockCompleto], 1);
    const res = await request(app).get('/api/restaurants?amenities=wifi,terraza');

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toHaveLength(1);
  });

  test('combinación de geo + amenidades devuelve distancia_km', async () => {
    const mockConDist = { ...mockCompleto, distancia_km: '1.5' };
    mockQuery([mockConDist], 1);
    const res = await request(app)
      .get('/api/restaurants?lat=-12.11&lng=-77.03&radius=5&amenities[]=wifi');

    expect(res.status).toBe(200);
    expect(res.body.restaurants[0]).toHaveProperty('distancia_km');
  });

  test('paginación funciona con filtro de amenidades', async () => {
    mockQuery(Array(5).fill(mockCompleto), 15);
    const res = await request(app)
      .get('/api/restaurants?amenities[]=wifi&page=2&size=5');

    expect(res.status).toBe(200);
    expect(res.body.meta).toMatchObject({ total: 15, page: 2, totalPages: 3 });
  });
});

// ══════════════════════════════════════════════════════════════════
// T07 HU05 — QA: selección múltiple, combinaciones sin resultados
// ══════════════════════════════════════════════════════════════════
describe('T07 HU05 — QA amenidades: selección múltiple y casos extremos', () => {

  test('selección de 3 amenidades simultáneas → 200 sin errores', async () => {
    mockQuery([mockCompleto], 1);
    const res = await request(app)
      .get('/api/restaurants?amenities[]=wifi&amenities[]=terraza&amenities[]=reservas');

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toHaveLength(1);
  });

  test('combinación de 5 amenidades (muy restrictiva) → 0 resultados sin error', async () => {
    mockQuery([], 0);
    const res = await request(app)
      .get('/api/restaurants?amenities[]=wifi&amenities[]=terraza&amenities[]=estacionamiento&amenities[]=aire-acond&amenities[]=pet-friendly');

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  test('slug de amenidad inválido (no existe) → 0 resultados, no crashea (status 200)', async () => {
    mockQuery([], 0);
    const res = await request(app)
      .get('/api/restaurants?amenities[]=slug-que-no-existe');

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toEqual([]);
  });

  test('sin amenidades seleccionadas → regresa al listado completo sin JOIN', async () => {
    mockQuery([mockCompleto], 1);
    const res = await request(app).get('/api/restaurants');

    expect(res.status).toBe(200);
    // No campo distancia_km ni filtro activo
    expect(res.body.restaurants[0]).not.toHaveProperty('distancia_km');
  });

  test('selección de todas las amenidades → solo restaurantes con las 10 (puede ser 0)', async () => {
    mockQuery([], 0);
    const all = 'wifi,terraza,estacionamiento,aire-acond,pet-friendly,reservas,delivery,para-llevar,acceso-discap,vista-panoramica';
    const res = await request(app)
      .get(`/api/restaurants?amenities=${all}`);

    expect(res.status).toBe(200);
    expect(res.body.meta).toHaveProperty('total');
  });

  test('una sola amenidad array vacío (valor vacío ignorado) → listado normal', async () => {
    mockQuery([mockCompleto], 1);
    const res = await request(app).get('/api/restaurants?amenities[]=');

    expect(res.status).toBe(200);
  });
});

// ══════════════════════════════════════════════════════════════════
// T08 HU02 — QA: ubicaciones inválidas, sin resultados, radio variable
// ══════════════════════════════════════════════════════════════════
describe('T08 HU02 — QA geo: inválidos, sin resultados, radio variable', () => {
  const mockConDistancia = { ...mockCompleto, distancia_km: '2.3' };

  test('solo lat sin lng → trata como sin filtro geo (listado normal)', async () => {
    mockQuery([mockCompleto], 1);
    const res = await request(app).get('/api/restaurants?lat=-12.11');

    expect(res.status).toBe(200);
    expect(res.body.restaurants[0]).not.toHaveProperty('distancia_km');
  });

  test('radio=1 (muy pequeño) → devuelve 0 resultados sin error', async () => {
    mockQuery([], 0);
    const res = await request(app)
      .get('/api/restaurants?lat=-12.11&lng=-77.03&radius=1');

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  test('radio=25 (grande) → devuelve resultados y paginación correcta', async () => {
    mockQuery(Array(20).fill(mockConDistancia), 50);
    const res = await request(app)
      .get('/api/restaurants?lat=-12.11&lng=-77.03&radius=25&size=20');

    expect(res.status).toBe(200);
    expect(res.body.meta).toMatchObject({ total: 50, totalPages: 3, size: 20 });
  });

  test('radio mayor a 50 se limita a 50 km internamente (no rompe)', async () => {
    mockQuery([mockConDistancia], 1);
    const res = await request(app)
      .get('/api/restaurants?lat=-12.11&lng=-77.03&radius=999');

    expect(res.status).toBe(200);
  });

  test('resultados vienen ordenados de menor a mayor distancia', async () => {
    const cerca = { ...mockCompleto, distancia_km: '0.5', id: 1 };
    const lejos = { ...mockCompleto, distancia_km: '4.8', id: 2 };
    mockQuery([cerca, lejos], 2);
    const res = await request(app)
      .get('/api/restaurants?lat=-12.11&lng=-77.03&radius=5');

    expect(res.status).toBe(200);
    expect(parseFloat(res.body.restaurants[0].distancia_km))
      .toBeLessThan(parseFloat(res.body.restaurants[1].distancia_km));
  });

  test('ubicación inexistente (coordenadas sin restaurantes cercanos) → mensaje meta vacío', async () => {
    mockQuery([], 0);
    const res = await request(app)
      .get('/api/restaurants?lat=35.6762&lng=139.6503&radius=5'); // Tokio

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════════
// T06 HU07 — Detalle incluye campos relacionados
// ══════════════════════════════════════════════════════════════════
describe('T06 — GET /api/restaurants/:id incluye datos relacionados', () => {

  test('respuesta incluye telefono, horario, coordenadas y redes_sociales', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockCompleto] });
    const res = await request(app).get('/api/restaurants/1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('telefono', '+51 1 461-5523');
    expect(res.body).toHaveProperty('horario', 'Lun-Sáb 12:00-23:00');
    expect(res.body).toHaveProperty('latitud', -12.0756);
    expect(res.body).toHaveProperty('longitud', -77.0476);
    expect(res.body).toHaveProperty('redes_sociales');
    expect(res.body.redes_sociales).toMatchObject({ instagram: '@pizzeriaroma' });
  });

  test('respuesta incluye campos de listado base junto a los campos de detalle', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockCompleto] });
    const res = await request(app).get('/api/restaurants/1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('nombre');
    expect(res.body).toHaveProperty('calificacion');
    expect(res.body).toHaveProperty('imagen_url');
    expect(res.body).toHaveProperty('direccion');
  });
});

// ══════════════════════════════════════════════════════════════════
// T07 + T09 HU07 — 404 y datos incompletos en detalle
// ══════════════════════════════════════════════════════════════════
describe('T09 — QA detalle: existente, inexistente, datos incompletos', () => {

  test('GET /api/restaurants/:id existente → retorna 200 y los detalles', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockCompleto] });
    const res = await request(app).get('/api/restaurants/1');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, nombre: 'Pizzería Roma' });
  });

  test('GET /api/restaurants/:id inexistente → retorna 404 (T07)', async () => {
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

  test('datos incompletos: campos opcionales null → retorna 200 sin error', async () => {
    const incompleto = {
      ...mockCompleto,
      telefono: null, horario: null,
      latitud: null,  longitud: null,
      redes_sociales: null, imagen_url: null,
      descripcion: null, ciudad: null,
    };
    pool.query.mockResolvedValueOnce({ rows: [incompleto] });
    const res = await request(app).get('/api/restaurants/1');

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Pizzería Roma');
    expect(res.body.telefono).toBeNull();
    expect(res.body.horario).toBeNull();
    expect(res.body.latitud).toBeNull();
    expect(res.body.redes_sociales).toBeNull();
  });
});
