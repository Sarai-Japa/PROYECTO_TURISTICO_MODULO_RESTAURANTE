require('dotenv').config();
const { faker } = require('@faker-js/faker');
const pool      = require('../src/db');

const NOMBRES = [
  'Carlos Mendoza', 'Ana Portal', 'Luis Quispe', 'María Torres', 'Roberto Gómez',
  'Sofía Delgado', 'Pedro Fuentes', 'Elena Paz', 'Jorge Vargas', 'Patricia León',
  'Miguel Ángel', 'Laura Rojas', 'Diego Flores', 'Valeria Cruz', 'Andrés Huanca',
  'Camila Salas', 'Fernando Vega', 'Natalia Paredes', 'Ricardo Espinoza', 'Lucía Ramos',
  'Sebastián Mora', 'Daniela Ríos', 'Alejandro Díaz', 'Isabel Castillo', 'Josué Herrera',
  'Mariana López', 'Gustavo Peña', 'Renata Ibáñez', 'Óscar Medina', 'Claudia Soto',
];

const COMENTARIOS = {
  5: [
    'Excelente lugar, volveré sin duda. La atención fue impecable.',
    'La mejor experiencia gastronómica que he tenido en mucho tiempo.',
    'Los sabores son increíbles, todo fresco y bien presentado.',
    'Ambiente acogedor y comida deliciosa. Totalmente recomendado.',
    'Superó todas mis expectativas. El servicio fue de primera.',
    'Porciones generosas y precios justos. ¡Volveré pronto!',
    'La atención al cliente es excelente y la comida espectacular.',
    'Un lugar que definitivamente merece sus 5 estrellas.',
    'Cada plato fue una sorpresa agradable. Calidad top.',
    'Ambiente bonito, comida rica y servicio rápido. Perfecto.',
  ],
  4: [
    'Muy buena comida, el servicio podría mejorar un poco.',
    'Rico y abundante, aunque esperé un poco más de lo normal.',
    'Buena experiencia en general. Regresaría a probar más platos.',
    'La carta tiene variedad y los precios son razonables.',
    'Buen lugar para ir en grupo. Algunos platos mejores que otros.',
    'Comida sabrosa, solo el ruido del ambiente era un poco alto.',
    'Me gustó mucho, le falta un poco más de detalle en la presentación.',
    'Buena relación calidad-precio. Lo recomendaría a amigos.',
    'Platos bien preparados. El postre estaba particularmente bueno.',
    'Atención amable y comida de calidad. Cuatro estrellas bien merecidas.',
  ],
  3: [
    'Regular, esperaba más por el precio que cobran.',
    'La comida está bien pero nada fuera de lo normal.',
    'Algunos platos buenos, otros no tanto. Experiencia mixta.',
    'El ambiente es agradable pero la comida puede mejorar.',
    'Servicio lento en hora punta, aunque la comida es aceptable.',
    'No es malo pero tampoco destacó. Probaré otro lugar la próxima.',
    'Cumple con lo básico. Esperaba algo más innovador en la carta.',
  ],
  2: [
    'La atención dejó mucho que desear, no volvería.',
    'Los platos llegaron fríos y la espera fue demasiado larga.',
    'No corresponde con la descripción. Me decepcionó bastante.',
  ],
};

function comentarioPorPuntuacion(puntuacion) {
  const opciones = COMENTARIOS[puntuacion] || COMENTARIOS[3];
  return faker.helpers.arrayElement(opciones);
}

function puntuacionRealista() {
  const rand = faker.number.int({ min: 1, max: 100 });
  if (rand <= 45) return 5;
  if (rand <= 75) return 4;
  if (rand <= 90) return 3;
  return 2;
}

function fechaAleatoria() {
  return faker.date.between({ from: '2025-01-01', to: '2026-05-19' });
}

async function main() {
  const { rows: restaurantes } = await pool.query('SELECT id FROM restaurantes ORDER BY id');

  if (restaurantes.length === 0) {
    console.error('No hay restaurantes. Ejecuta seed:massive primero.');
    process.exit(1);
  }

  console.log(`Generando reseñas para ${restaurantes.length} restaurantes...`);

  let totalInsertadas = 0;

  for (const { id } of restaurantes) {
    const cantidad = faker.number.int({ min: 3, max: 8 });
    const usados   = new Set();

    const valores = [];
    const params  = [];
    let   idx     = 1;

    for (let i = 0; i < cantidad; i++) {
      let nombre;
      do { nombre = faker.helpers.arrayElement(NOMBRES); } while (usados.has(nombre) && usados.size < NOMBRES.length);
      usados.add(nombre);

      const puntuacion = puntuacionRealista();
      const comentario = comentarioPorPuntuacion(puntuacion);
      const fecha      = fechaAleatoria();

      valores.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
      params.push(id, nombre, puntuacion, comentario, fecha);
    }

    await pool.query(
      `INSERT INTO reseñas (restaurante_id, usuario_nombre, puntuacion, comentario, fecha_creacion)
       VALUES ${valores.join(', ')}`,
      params
    );

    totalInsertadas += cantidad;
  }

  console.log(`\n✓ ${totalInsertadas} reseñas insertadas para ${restaurantes.length} restaurantes`);
  await pool.end();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
