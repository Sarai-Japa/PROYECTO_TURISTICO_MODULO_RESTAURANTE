const { Pool } = require('./backend/node_modules/pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/restaurante_db',
});

async function run() {
  try {
    await pool.query('ALTER TABLE reseñas ADD COLUMN IF NOT EXISTS usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE;');
    console.log('ALTER TABLE SUCCESS');
  } catch (e) {
    console.error('ALTER TABLE ERROR', e);
  } finally {
    await pool.end();
  }
}
run();
