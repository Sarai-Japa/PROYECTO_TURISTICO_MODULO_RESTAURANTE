const jwt = require('jsonwebtoken');

function jwtSecret() {
  return process.env.JWT_SECRET || 'dev_secret_change_in_prod';
}

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }
  try {
    req.user = jwt.verify(header.slice(7), jwtSecret());
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
