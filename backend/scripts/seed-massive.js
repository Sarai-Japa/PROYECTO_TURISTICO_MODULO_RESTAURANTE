/**
 * T06 — Carga masiva de restaurantes (120 registros)
 *
 * Variabilidad incluida:
 *   - 20% sin imagen (imagen_url = NULL)  → prueba T07
 *   - 15% sin calificación (calificacion = 0) → prueba T07
 *   - 10% sin ciudad (ciudad = NULL) → prueba T07
 *   - Tipos, categorías y ciudades mezclados aleatoriamente
 *
 * Uso:
 *   docker compose exec backend node scripts/seed-massive.js
 */

require('dotenv').config();
const { faker } = require('@faker-js/faker');
const pool      = require('../src/db');

// ── Listas curadas para variabilidad realista ──────────────────────
const TIPOS = [
  'Peruana', 'Italiana', 'Japonesa', 'Americana', 'Mexicana',
  'China', 'Marina', 'Cafetería', 'Francesa', 'Española',
  'Árabe', 'India', 'Griega', 'Fusión', 'Vegana',
];

const CATEGORIAS = [
  'Parrilla', 'Pasta', 'Sushi', 'Hamburguesas', 'Tacos',
  'Wok', 'Ceviche', 'Pizza', 'Desayunos', 'Mariscos',
  'Postres', 'Ensaladas', 'Ramen', 'Kebab', 'Brunch',
];

const CIUDADES = [
  'Miraflores', 'San Isidro', 'Barranco', 'Surco', 'San Borja',
  'La Victoria', 'Jesús María', 'Magdalena', 'Chorrillos', 'San Juan',
  'Lince', 'Pueblo Libre', 'San Miguel', 'Callao', 'Ate',
];

const PREFIJOS = [
  'El', 'La', 'Los', 'Las', 'Casa', 'Rincón', 'Sabor',
  'Punto', 'Lugar', 'Cocina', 'Mesa', 'Fogón',
];

const IMAGENES = [
  'https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/1833349/pexels-photo-1833349.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/3655916/pexels-photo-3655916.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/2087748/pexels-photo-2087748.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/3296279/pexels-photo-3296279.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  'https://images.pexels.com/photos/784633/pexels-photo-784633.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
];

// ── Generador de un restaurante ────────────────────────────────────
function generarRestaurante(i) {
  const tipo      = faker.helpers.arrayElement(TIPOS);
  const categoria = faker.helpers.arrayElement(CATEGORIAS);
  const prefijo   = faker.helpers.arrayElement(PREFIJOS);
  const sufijo    = faker.word.noun();

  // Variabilidad T07: 20% sin imagen, 15% sin rating, 10% sin ciudad
  const sinImagen   = faker.number.int({ min: 1, max: 100 }) <= 20;
  const sinRating   = faker.number.int({ min: 1, max: 100 }) <= 15;
  const sinCiudad   = faker.number.int({ min: 1, max: 100 }) <= 10;

  return {
    nombre:      `${prefijo} ${sufijo.charAt(0).toUpperCase() + sufijo.slice(1)} ${i > 10 ? '' : tipo}`.trim(),
    tipo_comida: tipo,
    categoria,
    descripcion: faker.lorem.sentence({ min: 8, max: 15 }),
    direccion:   `${faker.location.streetAddress()}, ${faker.number.int({ min: 1, max: 500 })}`,
    ciudad:      sinCiudad ? null : faker.helpers.arrayElement(CIUDADES),
    imagen_url:  sinImagen ? null : faker.helpers.arrayElement(IMAGENES),
    calificacion: sinRating ? 0 : parseFloat(faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 })),
  };
}

// ── Inserción por lotes ────────────────────────────────────────────
async function main() {
  const TOTAL  = 120;
  const LOTE   = 20;

  console.log(`Generando ${TOTAL} restaurantes...`);
  const registros = Array.from({ length: TOTAL }, (_, i) => generarRestaurante(i + 1));

  let insertados = 0;
  for (let i = 0; i < registros.length; i += LOTE) {
    const lote = registros.slice(i, i + LOTE);

    const valores  = [];
    const params   = [];
    let   paramIdx = 1;

    for (const r of lote) {
      valores.push(`($${paramIdx++},$${paramIdx++},$${paramIdx++},$${paramIdx++},$${paramIdx++},$${paramIdx++},$${paramIdx++},$${paramIdx++})`);
      params.push(r.nombre, r.tipo_comida, r.categoria, r.descripcion, r.direccion, r.ciudad, r.imagen_url, r.calificacion);
    }

    await pool.query(
      `INSERT INTO restaurantes (nombre, tipo_comida, categoria, descripcion, direccion, ciudad, imagen_url, calificacion)
       VALUES ${valores.join(', ')}`,
      params
    );

    insertados += lote.length;
    console.log(`  ${insertados}/${TOTAL} insertados`);
  }

  // Resumen de variabilidad generada
  const sinImg    = registros.filter(r => r.imagen_url   === null).length;
  const sinRating = registros.filter(r => r.calificacion === 0).length;
  const sinCiudad = registros.filter(r => r.ciudad       === null).length;

  console.log('\n✓ Carga completada');
  console.log(`  Sin imagen:      ${sinImg}  (${Math.round(sinImg / TOTAL * 100)}%)`);
  console.log(`  Sin calificación: ${sinRating} (${Math.round(sinRating / TOTAL * 100)}%)`);
  console.log(`  Sin ciudad:      ${sinCiudad}  (${Math.round(sinCiudad / TOTAL * 100)}%)`);
  console.log(`  Total en BD:     ~${TOTAL + 10} (incluye seed inicial)`);

  await pool.end();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
