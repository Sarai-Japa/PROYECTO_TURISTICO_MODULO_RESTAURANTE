/**
 * T06 — Carga masiva de restaurantes (120 registros)
 *
 * Distribución geográfica:
 *   - 5 distritos de Lima Metropolitana  (~30 restaurantes)
 *   - 15 ciudades del interior del Perú  (~90 restaurantes)
 *   - 10% sin ciudad (ciudad = NULL, coords aleatorias en Perú)
 *
 * Variabilidad de datos:
 *   - 20% sin imagen, 15% sin calificación, 15% sin teléfono, 20% sin redes
 *   - Coordenadas reales por ciudad con ±500 m de offset aleatorio
 *
 * Uso:
 *   docker compose exec backend npm run seed:massive
 */

require('dotenv').config();
const { faker } = require('@faker-js/faker');
const pool      = require('../src/db');

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

// Ciudades reales del Perú con coordenadas del centro urbano
const CIUDADES = [
  // Lima Metropolitana (distritos)
  { nombre: 'Miraflores',        lat: -12.1219, lng: -77.0259 },
  { nombre: 'San Isidro',        lat: -12.0976, lng: -77.0365 },
  { nombre: 'Barranco',          lat: -12.1473, lng: -77.0220 },
  { nombre: 'Surco',             lat: -12.1476, lng: -76.9928 },
  { nombre: 'Lince',             lat: -12.0822, lng: -77.0340 },
  // Otras regiones del Perú
  { nombre: 'Cusco',             lat: -13.5320, lng: -71.9675 },
  { nombre: 'Arequipa',          lat: -16.4090, lng: -71.5375 },
  { nombre: 'Trujillo',          lat:  -8.1116, lng: -79.0288 },
  { nombre: 'Huánuco',           lat:  -9.9306, lng: -76.2422 },
  { nombre: 'Iquitos',           lat:  -3.7491, lng: -73.2538 },
  { nombre: 'Piura',             lat:  -5.1945, lng: -80.6328 },
  { nombre: 'Chiclayo',          lat:  -6.7714, lng: -79.8409 },
  { nombre: 'Puno',              lat: -15.8402, lng: -70.0219 },
  { nombre: 'Tacna',             lat: -18.0137, lng: -70.2503 },
  { nombre: 'Ayacucho',          lat: -13.1588, lng: -74.2236 },
  { nombre: 'Huaraz',            lat:  -9.5275, lng: -77.5278 },
  { nombre: 'Cajamarca',         lat:  -7.1638, lng: -78.5004 },
  { nombre: 'Ica',               lat: -14.0675, lng: -75.7286 },
  { nombre: 'Tumbes',            lat:  -3.5702, lng: -80.4529 },
  { nombre: 'Puerto Maldonado',  lat: -12.5933, lng: -69.1891 },
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

const HORARIOS = [
  'Lun-Dom 12:00-23:00',
  'Mar-Dom 12:00-22:00',
  'Lun-Sáb 11:00-23:00, Dom 11:00-21:00',
  'Lun-Vie 12:00-22:00, Sáb-Dom 11:00-23:00',
  'Mar-Dom 11:30-22:30',
  'Lun-Dom 08:00-22:00',
  'Lun-Sáb 12:00-23:30',
  'Mié-Dom 12:00-22:00',
  'Lun-Vie 07:00-21:00, Sáb-Dom 08:00-22:00',
  'Mar-Sáb 12:00-22:00, Dom 12:00-20:00',
];

// Offset de ~500 m para simular distintas calles dentro de la misma ciudad
const OFFSET = 0.005;

function generarRestaurante(i) {
  const tipo       = faker.helpers.arrayElement(TIPOS);
  const categoria  = faker.helpers.arrayElement(CATEGORIAS);
  const prefijo    = faker.helpers.arrayElement(PREFIJOS);
  const sufijo     = faker.word.noun();
  const handle     = sufijo.toLowerCase().replace(/[^a-z0-9]/g, '');

  const sinImagen   = faker.number.int({ min: 1, max: 100 }) <= 20;
  const sinRating   = faker.number.int({ min: 1, max: 100 }) <= 15;
  const sinCiudad   = faker.number.int({ min: 1, max: 100 }) <= 10;
  const sinTel      = faker.number.int({ min: 1, max: 100 }) <= 15;
  const sinRedes    = faker.number.int({ min: 1, max: 100 }) <= 20;
  const conFacebook = faker.number.int({ min: 1, max: 100 }) <= 60;

  const redes = sinRedes ? null : JSON.stringify({
    instagram: `@${handle}${faker.number.int({ min: 10, max: 99 })}`,
    ...(conFacebook ? { facebook: `${handle}peru` } : {}),
  });

  const ciudadObj = sinCiudad ? null : faker.helpers.arrayElement(CIUDADES);

  let latitud, longitud;
  if (ciudadObj) {
    // Coords del centro de la ciudad ± ~500 m de offset
    latitud  = parseFloat((ciudadObj.lat + faker.number.float({ min: -OFFSET, max: OFFSET, fractionDigits: 6 })).toFixed(6));
    longitud = parseFloat((ciudadObj.lng + faker.number.float({ min: -OFFSET, max: OFFSET, fractionDigits: 6 })).toFixed(6));
  } else {
    // Sin ciudad: coordenada aleatoria en el territorio peruano
    latitud  = parseFloat(faker.number.float({ min: -18.5, max: -3.0,  fractionDigits: 6 }));
    longitud = parseFloat(faker.number.float({ min: -81.5, max: -68.5, fractionDigits: 6 }));
  }

  return {
    nombre:         `${prefijo} ${sufijo.charAt(0).toUpperCase() + sufijo.slice(1)} ${i > 10 ? '' : tipo}`.trim(),
    tipo_comida:    tipo,
    categoria,
    descripcion:    faker.lorem.sentence({ min: 8, max: 15 }),
    direccion:      `${faker.location.streetAddress()}, ${faker.number.int({ min: 1, max: 500 })}`,
    ciudad:         ciudadObj ? ciudadObj.nombre : null,
    telefono:       sinTel ? null : `+51 ${faker.number.int({ min: 1, max: 99 })} ${faker.number.int({ min: 200, max: 499 })}-${faker.number.int({ min: 1000, max: 9999 })}`,
    horario:        faker.helpers.arrayElement(HORARIOS),
    latitud,
    longitud,
    redes_sociales: redes,
    imagen_url:     sinImagen ? null : faker.helpers.arrayElement(IMAGENES),
    calificacion:   sinRating ? 0 : parseFloat(faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 })),
  };
}

async function main() {
  const TOTAL = 120;
  const LOTE  = 20;

  console.log(`Generando ${TOTAL} restaurantes distribuidos por el Perú...`);
  const registros = Array.from({ length: TOTAL }, (_, i) => generarRestaurante(i + 1));

  let insertados = 0;
  for (let i = 0; i < registros.length; i += LOTE) {
    const lote = registros.slice(i, i + LOTE);

    const valores  = [];
    const params   = [];
    let   paramIdx = 1;

    for (const r of lote) {
      valores.push(
        `($${paramIdx++},$${paramIdx++},$${paramIdx++},$${paramIdx++},$${paramIdx++},$${paramIdx++},$${paramIdx++},$${paramIdx++},$${paramIdx++},$${paramIdx++},$${paramIdx++},$${paramIdx++},$${paramIdx++})`
      );
      params.push(
        r.nombre, r.tipo_comida, r.categoria, r.descripcion,
        r.direccion, r.ciudad, r.telefono, r.horario,
        r.latitud, r.longitud, r.redes_sociales,
        r.imagen_url, r.calificacion
      );
    }

    await pool.query(
      `INSERT INTO restaurantes
         (nombre, tipo_comida, categoria, descripcion, direccion, ciudad,
          telefono, horario, latitud, longitud, redes_sociales, imagen_url, calificacion)
       VALUES ${valores.join(', ')}`,
      params
    );

    insertados += lote.length;
    console.log(`  ${insertados}/${TOTAL} insertados`);
  }

  // Asignar amenidades aleatorias a todos los restaurantes
  console.log('\nAsignando amenidades...');
  const amenResult = await pool.query('SELECT id FROM amenidades ORDER BY id');
  const amenIds    = amenResult.rows.map(r => r.id);
  const allRest    = await pool.query('SELECT id FROM restaurantes');
  const allIds     = allRest.rows.map(r => r.id);

  const amenValues = [];
  const amenParams = [];
  let   amenIdx    = 1;

  for (const rid of allIds) {
    const qty      = faker.number.int({ min: 1, max: 5 });
    const elegidas = faker.helpers.shuffle([...amenIds]).slice(0, qty);
    for (const aid of elegidas) {
      amenValues.push(`($${amenIdx++}, $${amenIdx++})`);
      amenParams.push(rid, aid);
    }
  }

  if (amenValues.length > 0) {
    await pool.query(
      `INSERT INTO restaurante_amenidades (restaurante_id, amenidad_id)
       VALUES ${amenValues.join(', ')}
       ON CONFLICT DO NOTHING`,
      amenParams
    );
    console.log(`  ${amenValues.length} asignaciones insertadas`);
  }

  // Resumen por ciudad
  const porCiudad = {};
  registros.forEach(r => {
    const c = r.ciudad || '(sin ciudad)';
    porCiudad[c] = (porCiudad[c] || 0) + 1;
  });

  const sinImg    = registros.filter(r => r.imagen_url     === null).length;
  const sinRating = registros.filter(r => r.calificacion   === 0).length;
  const sinCiudad = registros.filter(r => r.ciudad         === null).length;
  const sinTel    = registros.filter(r => r.telefono       === null).length;
  const sinRedes  = registros.filter(r => r.redes_sociales === null).length;

  console.log('\n✓ Carga completada');
  console.log(`  Sin imagen:         ${sinImg}  (${Math.round(sinImg / TOTAL * 100)}%)`);
  console.log(`  Sin calificación:   ${sinRating} (${Math.round(sinRating / TOTAL * 100)}%)`);
  console.log(`  Sin ciudad:         ${sinCiudad}  (${Math.round(sinCiudad / TOTAL * 100)}%)`);
  console.log(`  Sin teléfono:       ${sinTel}  (${Math.round(sinTel / TOTAL * 100)}%)`);
  console.log(`  Sin redes sociales: ${sinRedes}  (${Math.round(sinRedes / TOTAL * 100)}%)`);
  console.log(`\n  Distribución por ciudad:`);
  Object.entries(porCiudad).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => {
    console.log(`    ${c.padEnd(22)} ${n} restaurantes`);
  });
  console.log(`\n  Total en BD: ~${TOTAL + 10} (incluye seed inicial)`);

  await pool.end();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
