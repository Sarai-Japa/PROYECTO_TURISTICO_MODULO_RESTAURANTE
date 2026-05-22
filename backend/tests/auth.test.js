const request = require('supertest');
const app     = require('../src/app');
const pool    = require('../src/db');

jest.mock('../src/db');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');

// T09: mockUser incluye rol
const mockUser = {
  id: 1, nombre: 'Juan Test', email: 'juan@test.com',
  password_hash: '$2b$12$hashedpassword', rol: 'usuario',
};

beforeEach(() => jest.clearAllMocks());

// ══════════════════════════════════════════════════════════════════
// T05 — POST /api/auth/register
// ══════════════════════════════════════════════════════════════════
describe('T05 — POST /api/auth/register', () => {

  test('registro exitoso → 201 con token y user.rol (sin password_hash)', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Juan Test', email: 'juan@test.com', rol: 'usuario' }] });
    bcrypt.hash.mockResolvedValue('hashed_pwd');
    jwt.sign.mockReturnValue('mock_token');

    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Juan Test', email: 'juan@test.com', password: 'Password1',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token', 'mock_token');
    expect(res.body.user).toMatchObject({ id: 1, email: 'juan@test.com', rol: 'usuario' });
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  test('contraseña sin mayúscula → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Juan', email: 'juan@test.com', password: 'password1',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/mayúscula/i);
  });

  test('contraseña sin número → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Juan', email: 'juan@test.com', password: 'Password',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/número/i);
  });

  test('contraseña menor a 8 caracteres → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Juan', email: 'juan@test.com', password: 'P1',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/8 caracteres/i);
  });

  test('email con formato inválido → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Juan', email: 'no-es-email', password: 'Password1',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  test('nombre de 1 carácter → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'J', email: 'juan@test.com', password: 'Password1',
    });
    expect(res.status).toBe(400);
  });

  test('body vacío → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });

  test('T08: bcrypt recibe texto plano y ROUNDS=12', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Juan', email: 'juan@test.com', rol: 'usuario' }] });
    bcrypt.hash.mockResolvedValue('hashed');
    jwt.sign.mockReturnValue('tok');

    await request(app).post('/api/auth/register').send({
      nombre: 'Juan', email: 'juan@test.com', password: 'Password1',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('Password1', 12);
  });
});

// ══════════════════════════════════════════════════════════════════
// T06 — POST /api/auth/login  (devuelve JWT)
// ══════════════════════════════════════════════════════════════════
describe('T06 — POST /api/auth/login devuelve JWT', () => {

  test('login exitoso → 200 con token y user.rol (sin password_hash)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockUser] });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock_token');

    const res = await request(app).post('/api/auth/login').send({
      email: 'juan@test.com', password: 'Password1',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token', 'mock_token');
    expect(res.body.user).toMatchObject({ id: 1, nombre: 'Juan Test', rol: 'usuario' });
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  test('T06: JWT firmado incluye id, email y rol en el payload', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockUser] });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('tok');

    await request(app).post('/api/auth/login').send({
      email: 'juan@test.com', password: 'Password1',
    });

    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, email: 'juan@test.com', rol: 'usuario' }),
      expect.any(String),
      expect.objectContaining({ expiresIn: '24h' })
    );
  });

  test('contraseña incorrecta → 401 con mensaje genérico', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockUser] });
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app).post('/api/auth/login').send({
      email: 'juan@test.com', password: 'wrong',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Email o contraseña incorrectos');
  });

  test('email no registrado → 401 con mensaje genérico (no revela ausencia)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post('/api/auth/login').send({
      email: 'noexiste@test.com', password: 'Password1',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Email o contraseña incorrectos');
  });

  test('body vacío → 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  test('email normalizado a lowercase antes de buscar en BD', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockUser] });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('tok');

    await request(app).post('/api/auth/login').send({
      email: 'JUAN@TEST.COM', password: 'Password1',
    });

    expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['juan@test.com']);
  });

  test('T08: bcrypt.compare se llama con texto plano vs hash guardado', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockUser] });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('tok');

    await request(app).post('/api/auth/login').send({
      email: 'juan@test.com', password: 'Password1',
    });

    expect(bcrypt.compare).toHaveBeenCalledWith('Password1', mockUser.password_hash);
  });
});

// ══════════════════════════════════════════════════════════════════
// T07 — Middleware requireAuth + GET /api/auth/me
// ══════════════════════════════════════════════════════════════════
describe('T07 — Middleware requireAuth', () => {
  const requireAuth = require('../src/middleware/auth');

  test('sin header Authorization → 401', () => {
    const req  = { headers: {} };
    const res  = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('header con esquema Basic (no Bearer) → 401', () => {
    const req  = { headers: { authorization: 'Basic abc123' } };
    const res  = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('token válido → llama next() y adjunta req.user con id y rol', () => {
    jwt.verify.mockReturnValue({ id: 1, email: 'test@test.com', rol: 'usuario' });
    const req  = { headers: { authorization: 'Bearer valid_token' } };
    const res  = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ id: 1, email: 'test@test.com', rol: 'usuario' });
  });

  test('token expirado → 401 con mensaje claro', () => {
    jwt.verify.mockImplementation(() => { throw new Error('jwt expired'); });
    const req  = { headers: { authorization: 'Bearer expired_token' } };
    const res  = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    expect(next).not.toHaveBeenCalled();
  });

  test('GET /api/auth/me sin token → 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me con token válido → 200 con payload del usuario', async () => {
    jwt.verify.mockReturnValue({ id: 1, email: 'juan@test.com', rol: 'usuario' });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid_token');

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: 1, email: 'juan@test.com', rol: 'usuario' });
  });

  test('GET /api/auth/me con token malformado (no JWT) → 401', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('invalid token'); });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer esto-no-es-un-jwt');

    expect(res.status).toBe(401);
  });
});

// ══════════════════════════════════════════════════════════════════
// T10 — QA: registro, login, token inválido, duplicados
// ══════════════════════════════════════════════════════════════════
describe('T10 — QA: duplicados, tokens inválidos y escenarios extremos', () => {

  // --- Duplicados ---

  test('registro con email duplicado → 409, no crea segundo usuario', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // email ya existe

    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Otro Usuario', email: 'juan@test.com', password: 'Password1',
    });

    expect(res.status).toBe(409);
    expect(bcrypt.hash).not.toHaveBeenCalled(); // nunca llega a hashear
  });

  test('email duplicado en distintas variantes de mayúsculas → 409', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Juan', email: 'JUAN@TEST.COM', password: 'Password1',
    });

    // La query se ejecuta con lowercase
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['juan@test.com']);
    expect(res.status).toBe(409);
  });

  test('dos registros consecutivos con mismo email: el segundo retorna 409', async () => {
    // Primera llamada: email libre
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Juan', email: 'juan@test.com', rol: 'usuario' }] });
    bcrypt.hash.mockResolvedValue('hashed');
    jwt.sign.mockReturnValue('tok1');

    const res1 = await request(app).post('/api/auth/register').send({
      nombre: 'Juan', email: 'juan@test.com', password: 'Password1',
    });
    expect(res1.status).toBe(201);

    // Segunda llamada: email ya existe
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const res2 = await request(app).post('/api/auth/register').send({
      nombre: 'Juan Bis', email: 'juan@test.com', password: 'Password2',
    });
    expect(res2.status).toBe(409);
  });

  // --- Tokens inválidos ---

  test('token con firma incorrecta → 401', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('invalid signature'); });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token.con.firma.incorrecta');

    expect(res.status).toBe(401);
  });

  test('token vacío ("Bearer ") → 401', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('jwt must be provided'); });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer ');

    expect(res.status).toBe(401);
  });

  test('header Authorization presente pero sin token alguno → 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'soloestosinbearer');

    expect(res.status).toBe(401);
  });

  // --- Seguridad: no filtrar información ---

  test('login con email inexistente y login con contraseña incorrecta → mismo mensaje 401', async () => {
    // Email inexistente
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res1 = await request(app).post('/api/auth/login').send({
      email: 'noexiste@test.com', password: 'Password1',
    });

    // Contraseña incorrecta
    pool.query.mockResolvedValueOnce({ rows: [mockUser] });
    bcrypt.compare.mockResolvedValue(false);
    const res2 = await request(app).post('/api/auth/login').send({
      email: 'juan@test.com', password: 'WrongPass1',
    });

    // Mismo error — no revela cuál falló
    expect(res1.body.error).toBe(res2.body.error);
    expect(res1.status).toBe(401);
    expect(res2.status).toBe(401);
  });

  // --- Validaciones extremas ---

  test('nombre solo con espacios → 400 (trim lo deja vacío)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: '   ', email: 'juan@test.com', password: 'Password1',
    });
    expect(res.status).toBe(400);
  });

  test('email con espacios embebidos → 400 (formato inválido)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Juan', email: 'ju an@test.com', password: 'Password1',
    });
    expect(res.status).toBe(400);
  });

  test('contraseña exactamente de 8 caracteres con mayúscula y número → 201', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 2, nombre: 'Ana', email: 'ana@test.com', rol: 'usuario' }] });
    bcrypt.hash.mockResolvedValue('hashed');
    jwt.sign.mockReturnValue('tok');

    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Ana', email: 'ana@test.com', password: 'Secure1!',
    });

    expect(res.status).toBe(201);
  });

  // --- T09: verificar que rol está presente en respuestas ---

  test('T09: register devuelve user.rol = "usuario" por defecto', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 3, nombre: 'Ana', email: 'ana@test.com', rol: 'usuario' }] });
    bcrypt.hash.mockResolvedValue('hashed');
    jwt.sign.mockReturnValue('tok');

    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Ana', email: 'ana@test.com', password: 'Password1',
    });

    expect(res.body.user).toHaveProperty('rol', 'usuario');
  });

  test('T09: login devuelve user.rol en la respuesta', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockUser] });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('tok');

    const res = await request(app).post('/api/auth/login').send({
      email: 'juan@test.com', password: 'Password1',
    });

    expect(res.body.user).toHaveProperty('rol', 'usuario');
  });
});
