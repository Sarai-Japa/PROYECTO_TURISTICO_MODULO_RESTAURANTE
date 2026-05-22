/**
 * Carga usuarios de prueba con contraseñas conocidas
 * Uso: docker compose exec backend npm run seed:users
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool   = require('../src/db');

const USUARIOS = [
  { nombre: 'Admin FoodHub',  email: 'admin@foodhub.pe',    password: 'Admin123',    rol: 'admin'   },
  { nombre: 'María García',   email: 'maria@foodhub.pe',    password: 'Maria123',    rol: 'usuario' },
  { nombre: 'Carlos Pérez',   email: 'carlos@foodhub.pe',   password: 'Carlos123',   rol: 'usuario' },
  { nombre: 'Test Usuario',   email: 'test@test.com',       password: 'Test1234',    rol: 'usuario' },
];

async function main() {
  console.log('Creando usuarios de prueba...\n');

  for (const u of USUARIOS) {
    const exists = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [u.email]
    );
    if (exists.rows.length > 0) {
      console.log(`  [skip] ${u.email} — ya existe`);
      continue;
    }

    const hash = await bcrypt.hash(u.password, 12);
    await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4)`,
      [u.nombre, u.email, hash, u.rol]
    );
    console.log(`  [ok]   ${u.email}  /  ${u.password}  (rol: ${u.rol})`);
  }

  console.log('\nUsuarios listos.');
  await pool.end();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
