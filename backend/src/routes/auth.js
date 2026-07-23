const { Router }   = require('express');
const bcrypt       = require('bcrypt');
const jwt          = require('jsonwebtoken');
const pool         = require('../db');
const requireAuth  = require('../middleware/auth');

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROUNDS   = 12; // T08: factor de coste bcrypt

function jwtSecret() {
  return process.env.JWT_SECRET || 'dev_secret_change_in_prod';
}

// T08: validación de complejidad de contraseña
function validatePassword(pwd) {
  if (!pwd || pwd.length < 8)  return 'La contraseña debe tener al menos 8 caracteres';
  if (!/[A-Z]/.test(pwd))      return 'La contraseña debe contener al menos una mayúscula';
  if (!/[0-9]/.test(pwd))      return 'La contraseña debe contener al menos un número';
  return null;
}

// T05 — POST /api/auth/register
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body ?? {};

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  const pwdError = validatePassword(password);
  if (pwdError) return res.status(400).json({ error: pwdError });

  try {
    // T10: detectar duplicados antes de insertar
    const exists = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email.toLowerCase()]
    );
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'Este email ya está registrado' });
    }

    // T08: hashear con bcrypt (12 rounds)
    const hash    = await bcrypt.hash(password, ROUNDS);

    // T09: INSERT incluye rol (usa default 'usuario')
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, email, rol`,
      [nombre.trim(), email.toLowerCase(), hash]
    );

    const user  = rows[0];
    // T06: JWT incluye id, email, rol y nombre en el payload
    // (bug HU17: reseñas usa req.user.nombre para usuario_nombre — sin esto, POST /reviews fallaba con 500)
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre },
      jwtSecret(),
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la cuenta' });
  }
});

// T06 — POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    // T09: SELECT incluye rol
    const { rows } = await pool.query(
      'SELECT id, nombre, email, password_hash, rol FROM usuarios WHERE email = $1',
      [email.toLowerCase()]
    );

    // T10: mensaje genérico — no revela si el email existe o no
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const user    = rows[0];
    // T08: bcrypt.compare para verificar contraseña
    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // T06: JWT con expiración 24h, incluye rol y nombre (ver bug HU17 arriba)
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre },
      jwtSecret(),
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// T07 — GET /api/auth/me  (ruta protegida de ejemplo)
// Demuestra que requireAuth bloquea sin token y devuelve el usuario con token válido
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
