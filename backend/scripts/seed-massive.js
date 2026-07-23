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
  'Peruana', 'Criolla', 'Marina', 'Andina', 'Norteña',
  'Selvática', 'Fusión Peruana', 'Cafetería', 'Italiana', 'China',
  'Japonesa', 'Americana', 'Mexicana', 'Vegetariana', 'Parrillada',
];

const CATEGORIAS = [
  // Platos peruanos (99%)
  'Ceviche', 'Lomo Saltado', 'Ají de Gallina', 'Pollo a la Brasa', 'Anticuchos',
  'Causa Limeña', 'Tiradito', 'Aguadito', 'Arroz con Pollo', 'Seco de Res',
  'Chicharrón', 'Pachamanca', 'Tallarín Saltado', 'Sudado de Pescado', 'Carapulcra',
  'Olluquito con Carne', 'Rocoto Relleno', 'Papa a la Huancaína', 'Arroz con Leche',
  'Picarones', 'Leche de Tigre', 'Chupe de Camarones', 'Parihuela', 'Sopa a la Minuta',
  'Adobo', 'Estofado', 'Arroz con Mariscos', 'Jalea', 'Cau Cau', 'Tacu Tacu',
  'Juane', 'Tacacho con Cecina', 'Patarashca', 'Inchicapi', 'Mazamorra Morada',
  'Parrilla', 'Desayunos', 'Mariscos', 'Postres', 'Menú del Día',
  // Internacionales (1%)
  'Pizza', 'Sushi', 'Hamburguesas',
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
  { nombre: 'Tingo María',       lat:  -9.2974, lng: -76.0026 },
];

const PREFIJOS = [
  'El', 'La', 'Los', 'Las', 'Casa', 'Rincón', 'Sabor',
  'Fogón', 'Cocina', 'Mesa', 'Punto', 'Tradición',
];

const SUFIJOS_ES = [
  'Criollo', 'Criolla', 'Andino', 'Andina', 'Serrano', 'Serrana',
  'Norteño', 'Norteña', 'Limeño', 'Limeña', 'Huanuqueño', 'Huanuqueña',
  'Familiar', 'Casero', 'Casera', 'Tradicional', 'Regional', 'Popular',
  'del Valle', 'del Río', 'de la Sierra', 'del Sol', 'de los Andes',
  'Peruano', 'Peruana', 'Sabroso', 'Sabrosa', 'Auténtico', 'Auténtica',
];

const NOMBRES_EN = [
  'The Grill House', 'Burger Station', 'Sushi Zone', 'Pizza Corner',
  'The Steak House', 'Noodle Bar', 'Grill & Go', 'Pasta House',
  'Fast Bites', 'The Food Corner',
];

const DESCRIPCIONES = [
  'Ofrecemos los mejores platos de la cocina peruana preparados con ingredientes frescos del mercado.',
  'Un lugar acogedor donde disfrutar de sabores auténticos y recetas tradicionales de generación en generación.',
  'Especialistas en comida criolla con el sabor casero que tanto extrañas.',
  'La mejor sazón de la región, con platos elaborados con productos locales de primera calidad.',
  'Ven y disfruta de nuestra variada carta con los platos más representativos de la gastronomía peruana.',
  'Un restaurante familiar donde cada plato está hecho con el cariño y la tradición de siempre.',
  'Sabores únicos de la sierra peruana en un ambiente tranquilo y acogedor.',
  'Cocina peruana de autor con ingredientes nativos y técnicas tradicionales.',
  'El punto de encuentro para los amantes de la buena comida peruana.',
  'Atendemos con cariño y dedicación para que tu experiencia sea inigualable.',
  'Platos típicos preparados al momento con recetas originales de la abuela.',
  'La fusión perfecta entre la cocina andina y los sabores del mar peruano.',
  'Especialidades de la selva y la sierra en un solo lugar, con productos frescos y naturales.',
  'Restaurante familiar con más de 10 años brindando el auténtico sabor peruano.',
  'Disfruta de nuestra cocina tradicional en un ambiente cálido y familiar.',
];

const TIPOS_VIA = ['Jr.', 'Av.', 'Calle', 'Psje.', 'Jr.', 'Av.', 'Jr.'];

const NOMBRES_VIA = [
  'Huánuco', 'Lima', 'San Martín', 'Bolívar', 'Grau', 'Pizarro', 'Amazonas',
  'Junín', 'Libertad', 'Independencia', 'Dos de Mayo', 'Raymondi', 'Constitución',
  'Leoncio Prado', 'Túpac Amaru', 'San Juan', 'Los Olivos', 'Las Flores',
  'Los Andes', 'El Sol', 'La Paz', 'Progreso', 'Unión', 'Comercio', 'Central',
  'Manco Inca', 'Cáceres', 'Castilla', 'Ugarte', 'Villarreal',
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

const IMAGENES_POR_TIPO = {
  'Peruana': [
    'https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/3655916/pexels-photo-3655916.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
  ],
  'Criolla': [
    'https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/233305/pexels-photo-233305.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
  ],
  'Marina': [
    'https://images.pexels.com/photos/3655916/pexels-photo-3655916.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/3296279/pexels-photo-3296279.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/248444/pexels-photo-248444.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
  ],
  'Andina': [
    'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
  ],
  'Norteña': [
    'https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
  ],
  'Selvática': [
    'https://images.pexels.com/photos/5792329/pexels-photo-5792329.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/5638525/pexels-photo-5638525.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/2289409/pexels-photo-2289409.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
  ],
  'Fusión Peruana': [
    'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/110472/pexels-photo-110472.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
  ],
  'Cafetería': [
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/1833349/pexels-photo-1833349.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/1352243/pexels-photo-1352243.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/1362534/pexels-photo-1362534.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/5060281/pexels-photo-5060281.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
  ],
  'Italiana': [
    'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
  ],
  'China': [
    'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
  ],
  'Japonesa': [
    'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/3296279/pexels-photo-3296279.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
  ],
  'Americana': [
    'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/784633/pexels-photo-784633.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
  ],
  'Mexicana': [
    'https://images.pexels.com/photos/2087748/pexels-photo-2087748.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
  ],
  'Vegetariana': [
    'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
  ],
  'Parrillada': [
    'https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/1482803/pexels-photo-1482803.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
  ],
};

// DOW: 0=domingo, 1=lunes, 2=martes, 3=miércoles, 4=jueves, 5=viernes, 6=sábado
const HORARIOS = [
  {
    texto: 'Lun-Dom 12:00-23:00',
    schedules: [0,1,2,3,4,5,6].map(d => ({ dia: d, apertura: '12:00', cierre: '23:00' })),
  },
  {
    texto: 'Mar-Dom 12:00-22:00',
    schedules: [0,2,3,4,5,6].map(d => ({ dia: d, apertura: '12:00', cierre: '22:00' })),
  },
  {
    texto: 'Lun-Sáb 11:00-23:00, Dom 11:00-21:00',
    schedules: [
      ...[1,2,3,4,5,6].map(d => ({ dia: d, apertura: '11:00', cierre: '23:00' })),
      { dia: 0, apertura: '11:00', cierre: '21:00' },
    ],
  },
  {
    texto: 'Lun-Vie 12:00-22:00, Sáb-Dom 11:00-23:00',
    schedules: [
      ...[1,2,3,4,5].map(d => ({ dia: d, apertura: '12:00', cierre: '22:00' })),
      ...[0,6].map(d => ({ dia: d, apertura: '11:00', cierre: '23:00' })),
    ],
  },
  {
    texto: 'Mar-Dom 11:30-22:30',
    schedules: [0,2,3,4,5,6].map(d => ({ dia: d, apertura: '11:30', cierre: '22:30' })),
  },
  {
    texto: 'Lun-Dom 08:00-22:00',
    schedules: [0,1,2,3,4,5,6].map(d => ({ dia: d, apertura: '08:00', cierre: '22:00' })),
  },
  {
    texto: 'Lun-Sáb 12:00-23:30',
    schedules: [1,2,3,4,5,6].map(d => ({ dia: d, apertura: '12:00', cierre: '23:30' })),
  },
  {
    texto: 'Mié-Dom 12:00-22:00',
    schedules: [0,3,4,5,6].map(d => ({ dia: d, apertura: '12:00', cierre: '22:00' })),
  },
  {
    texto: 'Lun-Vie 07:00-21:00, Sáb-Dom 08:00-22:00',
    schedules: [
      ...[1,2,3,4,5].map(d => ({ dia: d, apertura: '07:00', cierre: '21:00' })),
      ...[0,6].map(d => ({ dia: d, apertura: '08:00', cierre: '22:00' })),
    ],
  },
  {
    texto: 'Mar-Sáb 12:00-22:00, Dom 12:00-20:00',
    schedules: [
      ...[2,3,4,5,6].map(d => ({ dia: d, apertura: '12:00', cierre: '22:00' })),
      { dia: 0, apertura: '12:00', cierre: '20:00' },
    ],
  },
];

// Offset de ~500 m para simular distintas calles dentro de la misma ciudad
const OFFSET = 0.005;

function generarRestaurante(i) {
  const tipo      = faker.helpers.arrayElement(TIPOS);
  const categoria = faker.helpers.arrayElement(CATEGORIAS);

  const esIngles  = faker.number.int({ min: 1, max: 100 }) <= 5;
  let nombre;
  if (esIngles) {
    nombre = faker.helpers.arrayElement(NOMBRES_EN);
  } else {
    const prefijo = faker.helpers.arrayElement(PREFIJOS);
    const sufijo  = faker.helpers.arrayElement(SUFIJOS_ES);
    nombre = `${prefijo} ${sufijo}`;
  }

  const handle = nombre
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

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

  const horarioObj = faker.helpers.arrayElement(HORARIOS);

  const tipoVia   = faker.helpers.arrayElement(TIPOS_VIA);
  const nombreVia = faker.helpers.arrayElement(NOMBRES_VIA);
  const numero    = faker.number.int({ min: 100, max: 1999 });

  const listaImagenes = IMAGENES_POR_TIPO[tipo] || IMAGENES;
  return {
    nombre,
    tipo_comida:    tipo,
    categoria,
    descripcion:    faker.helpers.arrayElement(DESCRIPCIONES),
    direccion:      `${tipoVia} ${nombreVia} ${numero}`,
    ciudad:         ciudadObj ? ciudadObj.nombre : null,
    telefono:       sinTel ? null : `+51 ${faker.number.int({ min: 1, max: 99 })} ${faker.number.int({ min: 200, max: 499 })}-${faker.number.int({ min: 1000, max: 9999 })}`,
    horario:        horarioObj.texto,
    latitud,
    longitud,
    redes_sociales: redes,
    imagen_url:     sinImagen ? null : faker.helpers.arrayElement(listaImagenes),
    calificacion:   sinRating ? 0 : parseFloat(faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 })),
    schedules:      horarioObj.schedules,
  };
}

const TINGO_MARIA_RESTAURANTES = [
  {
    nombre: 'El Encanto de la Selva',
    tipo_comida: 'Selvática',
    categoria: 'Tacacho con Cecina',
    descripcion: 'El auténtico sabor de la selva peruana. Disfruta de nuestro famoso tacacho con cecina, juane y refrescos de frutas nativas.',
    direccion: 'Av. Alameda Perú 280',
    ciudad: 'Tingo María',
    telefono: '+51 62 562014',
    horario: 'Lun-Dom 12:00-22:00',
    latitud: -9.2974,
    longitud: -76.0026,
    redes_sociales: JSON.stringify({ instagram: '@elencantodelaselva', facebook: 'elencantodelaselva' }),
    imagen_url: 'https://images.pexels.com/photos/5792329/pexels-photo-5792329.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.8,
    schedules: [0,1,2,3,4,5,6].map(d => ({ dia: d, apertura: '12:00', cierre: '22:00' }))
  },
  {
    nombre: 'El Carbón Restobar',
    tipo_comida: 'Parrillada',
    categoria: 'Parrilla',
    descripcion: 'Carnes y parrillas con el toque amazónico tradicional. Deliciosa cecina a la parrilla, chorizos regionales y tragos exóticos.',
    direccion: 'Av. Raymondi 435',
    ciudad: 'Tingo María',
    telefono: '+51 62 561234',
    horario: 'Mar-Dom 12:00-23:00',
    latitud: -9.2995,
    longitud: -76.0051,
    redes_sociales: JSON.stringify({ instagram: '@elcarbon.restobar', facebook: 'elcarbonrestobarperu' }),
    imagen_url: 'https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.5,
    schedules: [0,2,3,4,5,6].map(d => ({ dia: d, apertura: '12:00', cierre: '23:00' }))
  },
  {
    nombre: 'El Jefe Fusión Amazónica',
    tipo_comida: 'Fusión Peruana',
    categoria: 'Juane',
    descripcion: 'Fusión de comida tradicional amazónica e internacional en un ambiente moderno y agradable. Excelente barra de tragos exóticos.',
    direccion: 'Calle San Martín 310',
    ciudad: 'Tingo María',
    telefono: '+51 62 568910',
    horario: 'Lun-Sáb 12:00-23:30',
    latitud: -9.2941,
    longitud: -76.0012,
    redes_sociales: JSON.stringify({ instagram: '@eljeferestaurant', facebook: 'eljeferestaurant' }),
    imagen_url: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.6,
    schedules: [1,2,3,4,5,6].map(d => ({ dia: d, apertura: '12:00', cierre: '23:30' }))
  },
  {
    nombre: 'La Tía Julia',
    tipo_comida: 'Selvática',
    categoria: 'Juane',
    descripcion: 'Famoso huarique tradicional conocido por sus juanes de gallina de chacra preparados con recetas ancestrales y tacacho de primera.',
    direccion: 'Jr. Callao 240',
    ciudad: 'Tingo María',
    telefono: '+51 62 562189',
    horario: 'Lun-Dom 08:00-18:00',
    latitud: -9.2965,
    longitud: -76.0033,
    redes_sociales: JSON.stringify({ facebook: 'lajuliajuane' }),
    imagen_url: 'https://images.pexels.com/photos/5792329/pexels-photo-5792329.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.7,
    schedules: [0,1,2,3,4,5,6].map(d => ({ dia: d, apertura: '08:00', cierre: '18:00' }))
  },
  {
    nombre: 'Recreo Campestre Cueva de las Pavas',
    tipo_comida: 'Selvática',
    categoria: 'Patarashca',
    descripcion: 'Restaurante campestre rústico al aire libre al costado del río. Especialidad en patarashca y picuro frito en un ambiente natural.',
    direccion: 'Carretera Tingo María - Monzón Km 8',
    ciudad: 'Tingo María',
    telefono: null,
    horario: 'Lun-Dom 09:00-17:00',
    latitud: -9.3250,
    longitud: -76.0350,
    redes_sociales: null,
    imagen_url: 'https://images.pexels.com/photos/2289409/pexels-photo-2289409.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.4,
    schedules: [0,1,2,3,4,5,6].map(d => ({ dia: d, apertura: '09:00', cierre: '17:00' }))
  },
  {
    nombre: 'Trapiche Bar Ecológico',
    tipo_comida: 'Fusión Peruana',
    categoria: 'Parrilla',
    descripcion: 'Bar y restaurante ecológico decorado con madera rústica. Amplia carta de macerados exóticos y piqueos selváticos.',
    direccion: 'Jr. Lamas 145',
    ciudad: 'Tingo María',
    telefono: '+51 62 564567',
    horario: 'Lun-Sáb 18:00-02:00',
    latitud: -9.2982,
    longitud: -76.0040,
    redes_sociales: JSON.stringify({ instagram: '@trapichebarecologico' }),
    imagen_url: 'https://images.pexels.com/photos/110472/pexels-photo-110472.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.5,
    schedules: [1,2,3,4,5,6].map(d => ({ dia: d, apertura: '18:00', cierre: '02:00' }))
  },
  {
    nombre: 'Arábica Coffee',
    tipo_comida: 'Cafetería',
    categoria: 'Desayunos',
    descripcion: 'Café de especialidad con granos de la selva huanuqueña. Deliciosos postres, sándwiches calientes y ambiente acogedor.',
    direccion: 'Av. Alameda Perú 510',
    ciudad: 'Tingo María',
    telefono: '+51 62 569090',
    horario: 'Lun-Dom 08:00-22:00',
    latitud: -9.2979,
    longitud: -76.0028,
    redes_sociales: JSON.stringify({ instagram: '@arabicacoffee.tm' }),
    imagen_url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.6,
    schedules: [0,1,2,3,4,5,6].map(d => ({ dia: d, apertura: '08:00', cierre: '22:00' }))
  },
  {
    nombre: 'Puro Aroma',
    tipo_comida: 'Cafetería',
    categoria: 'Postres',
    descripcion: 'Tu rincón favorito para disfrutar de repostería fina, jugos naturales y el mejor café expreso de la ciudad.',
    direccion: 'Jr. Ucayali 350',
    ciudad: 'Tingo María',
    telefono: '+51 62 563412',
    horario: 'Lun-Sáb 08:30-21:30',
    latitud: -9.2955,
    longitud: -76.0020,
    redes_sociales: JSON.stringify({ facebook: 'puroaromacafe' }),
    imagen_url: 'https://images.pexels.com/photos/1833349/pexels-photo-1833349.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.3,
    schedules: [1,2,3,4,5,6].map(d => ({ dia: d, apertura: '08:30', cierre: '21:30' }))
  },
  {
    nombre: 'Quispi Helados',
    tipo_comida: 'Cafetería',
    categoria: 'Postres',
    descripcion: 'Helados artesanales preparados con puras frutas de la selva como camu camu, guanábana, copoazú y aguaje.',
    direccion: 'Jr. Callao 160',
    ciudad: 'Tingo María',
    telefono: null,
    horario: 'Lun-Dom 10:00-22:00',
    latitud: -9.2961,
    longitud: -76.0030,
    redes_sociales: JSON.stringify({ instagram: '@quispihelados' }),
    imagen_url: 'https://images.pexels.com/photos/1352243/pexels-photo-1352243.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.7,
    schedules: [0,1,2,3,4,5,6].map(d => ({ dia: d, apertura: '10:00', cierre: '22:00' }))
  },
  {
    nombre: 'La Yapa',
    tipo_comida: 'Cafetería',
    categoria: 'Postres',
    descripcion: 'Heladería y cafetería clásica. Copas de helados gigantes, malteadas selváticas y deliciosos crepes dulces.',
    direccion: 'Av. Tito Jaime 340',
    ciudad: 'Tingo María',
    telefono: '+51 62 561122',
    horario: 'Lun-Dom 11:00-23:00',
    latitud: -9.2970,
    longitud: -76.0039,
    redes_sociales: JSON.stringify({ instagram: '@layapa.helados' }),
    imagen_url: 'https://images.pexels.com/photos/1362534/pexels-photo-1362534.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.2,
    schedules: [0,1,2,3,4,5,6].map(d => ({ dia: d, apertura: '11:00', cierre: '23:00' }))
  },
  {
    nombre: 'Vaili Ice Cream',
    tipo_comida: 'Cafetería',
    categoria: 'Postres',
    descripcion: 'Helados de crema artesanales y paletas rellenas con frutos exóticos. Negocio tradicional de Tingo María.',
    direccion: 'Jr. Lamas 220',
    ciudad: 'Tingo María',
    telefono: null,
    horario: 'Lun-Dom 10:00-21:00',
    latitud: -9.2980,
    longitud: -76.0045,
    redes_sociales: null,
    imagen_url: 'https://images.pexels.com/photos/5060281/pexels-photo-5060281.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.1,
    schedules: [0,1,2,3,4,5,6].map(d => ({ dia: d, apertura: '10:00', cierre: '21:00' }))
  },
  {
    nombre: 'Chifa De Zhi Wang',
    tipo_comida: 'China',
    categoria: 'Tallarín Saltado',
    descripcion: 'Auténtico sabor oriental fusionado con insumos selváticos. Prueba nuestro chaufa amazónico con abundante cecina.',
    direccion: 'Jr. Tito Jaime 570',
    ciudad: 'Tingo María',
    telefono: '+51 62 568899',
    horario: 'Lun-Dom 12:00-22:30',
    latitud: -9.2968,
    longitud: -76.0037,
    redes_sociales: JSON.stringify({ facebook: 'chifadezhiwang' }),
    imagen_url: 'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.4,
    schedules: [0,1,2,3,4,5,6].map(d => ({ dia: d, apertura: '12:00', cierre: '22:30' }))
  },
  {
    nombre: 'Oriental Mi Favorito',
    tipo_comida: 'China',
    categoria: 'Arroz con Pollo',
    descripcion: 'Excelente comida china con un ambiente familiar. Gran variedad de platos tradicionales preparados al wok.',
    direccion: 'Jr. José Prato 251',
    ciudad: 'Tingo María',
    telefono: '+51 62 563456',
    horario: 'Mar-Dom 12:00-22:00',
    latitud: -9.2952,
    longitud: -76.0019,
    redes_sociales: JSON.stringify({ instagram: '@orientalmifavorito' }),
    imagen_url: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.5,
    schedules: [0,2,3,4,5,6].map(d => ({ dia: d, apertura: '12:00', cierre: '22:00' }))
  },
  {
    nombre: 'Marbella Cebichería Nikkei',
    tipo_comida: 'Marina',
    categoria: 'Ceviche',
    descripcion: 'El encuentro perfecto entre el mar y el sabor selvático-nikkei. Exquisitos ceviches, tiraditos y makis de la casa.',
    direccion: 'Av. Alameda Perú 850',
    ciudad: 'Tingo María',
    telefono: '+51 62 569876',
    horario: 'Mar-Dom 11:30-17:00',
    latitud: -9.2990,
    longitud: -76.0048,
    redes_sociales: JSON.stringify({ instagram: '@marbellacebicherianikkei' }),
    imagen_url: 'https://images.pexels.com/photos/3655916/pexels-photo-3655916.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.6,
    schedules: [0,2,3,4,5,6].map(d => ({ dia: d, apertura: '11:30', cierre: '17:00' }))
  },
  {
    nombre: 'Cevichería Chiwan',
    tipo_comida: 'Marina',
    categoria: 'Ceviche',
    descripcion: 'Especialistas en platos marinos y de río. Delicioso ceviche de doncella y chicharrón crujiente de pescado.',
    direccion: 'Esq. Jr. Piura con Jr. Julio Burga',
    ciudad: 'Tingo María',
    telefono: '+51 62 562323',
    horario: 'Lun-Dom 11:00-16:30',
    latitud: -9.2935,
    longitud: -76.0010,
    redes_sociales: null,
    imagen_url: 'https://images.pexels.com/photos/248444/pexels-photo-248444.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.4,
    schedules: [0,1,2,3,4,5,6].map(d => ({ dia: d, apertura: '11:00', cierre: '16:30' }))
  },
  {
    nombre: 'Mamarosa',
    tipo_comida: 'Selvática',
    categoria: 'Tacacho con Cecina',
    descripcion: 'Disfruta de la mejor cocina tradicional amazónica en un hermoso entorno natural al lado del río Jacintillo.',
    direccion: 'Sector Jacintillo Km 1.2 (Camino a la Cueva de las Lechuzas)',
    ciudad: 'Tingo María',
    telefono: '+51 62 567788',
    horario: 'Lun-Dom 10:00-18:30',
    latitud: -9.3120,
    longitud: -76.0180,
    redes_sociales: JSON.stringify({ facebook: 'mamarosajacintillo' }),
    imagen_url: 'https://images.pexels.com/photos/5792329/pexels-photo-5792329.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.8,
    schedules: [0,1,2,3,4,5,6].map(d => ({ dia: d, apertura: '10:00', cierre: '18:30' }))
  },
  {
    nombre: 'Recreo Lorenita',
    tipo_comida: 'Selvática',
    categoria: 'Patarashca',
    descripcion: 'Restaurante campestre familiar con amplias áreas verdes. Sabor inigualable en carnes a la parrilla y platos selváticos.',
    direccion: 'Av. Afilador Km 5',
    ciudad: 'Tingo María',
    telefono: null,
    horario: 'Mar-Dom 10:00-17:30',
    latitud: -9.3100,
    longitud: -76.0250,
    redes_sociales: null,
    imagen_url: 'https://images.pexels.com/photos/5638525/pexels-photo-5638525.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.3,
    schedules: [0,2,3,4,5,6].map(d => ({ dia: d, apertura: '10:00', cierre: '17:30' }))
  },
  {
    nombre: 'D’Tinto & Madero',
    tipo_comida: 'Parrillada',
    categoria: 'Parrilla',
    descripcion: 'Cortes selectos, pastas frescas y una de las cavas de vinos más selectas de la ciudad en un ambiente sumamente elegante.',
    direccion: 'Av. Alameda Perú 640',
    ciudad: 'Tingo María',
    telefono: '+51 62 561289',
    horario: 'Lun-Sáb 12:00-23:00',
    latitud: -9.2981,
    longitud: -76.0029,
    redes_sociales: JSON.stringify({ instagram: '@dtintoymadero' }),
    imagen_url: 'https://images.pexels.com/photos/1482803/pexels-photo-1482803.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.7,
    schedules: [1,2,3,4,5,6].map(d => ({ dia: d, apertura: '12:00', cierre: '23:00' }))
  },
  {
    nombre: 'El Nativo del Milagro',
    tipo_comida: 'Selvática',
    categoria: 'Tacacho con Cecina',
    descripcion: 'Sazón auténtica a orillas del balneario Laguna El Milagro. Juane y refrescante chicha de jora selvática.',
    direccion: 'Carretera al Milagro Km 3',
    ciudad: 'Tingo María',
    telefono: null,
    horario: 'Lun-Dom 10:00-18:00',
    latitud: -9.2700,
    longitud: -75.9800,
    redes_sociales: null,
    imagen_url: 'https://images.pexels.com/photos/5792329/pexels-photo-5792329.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.5,
    schedules: [0,1,2,3,4,5,6].map(d => ({ dia: d, apertura: '10:00', cierre: '18:00' }))
  },
  {
    nombre: 'Asheti Drinks & Foods',
    tipo_comida: 'Fusión Peruana',
    categoria: 'Parrilla',
    descripcion: 'Las mejores alitas con salsa de cocona y tragos macerados de la selva. El ambiente perfecto para compartir con amigos.',
    direccion: 'Av. Alameda Perú 620',
    ciudad: 'Tingo María',
    telefono: '+51 62 561212',
    horario: 'Mié-Dom 17:00-01:00',
    latitud: -9.2983,
    longitud: -76.0031,
    redes_sociales: JSON.stringify({ instagram: '@ashetidrinks' }),
    imagen_url: 'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.6,
    schedules: [0,3,4,5,6].map(d => ({ dia: d, apertura: '17:00', cierre: '01:00' }))
  },
  {
    nombre: 'Plaza Tingo',
    tipo_comida: 'Criolla',
    categoria: 'Pollo a la Brasa',
    descripcion: 'Restaurante y pollería familiar frente a la Plaza de Armas. Ofrecemos pollos a la brasa muy jugosos y platos criollos.',
    direccion: 'Av. Alameda Perú 305',
    ciudad: 'Tingo María',
    telefono: '+51 62 560909',
    horario: 'Lun-Dom 12:00-23:00',
    latitud: -9.2975,
    longitud: -76.0024,
    redes_sociales: null,
    imagen_url: 'https://images.pexels.com/photos/233305/pexels-photo-233305.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    calificacion: 4.2,
    schedules: [0,1,2,3,4,5,6].map(d => ({ dia: d, apertura: '12:00', cierre: '23:00' }))
  }
];

async function main() {
  const TOTAL = 120;
  const LOTE  = 20;

  console.log(`Generando ${TOTAL} restaurantes distribuidos por el Perú...`);
  const registros = [
    ...TINGO_MARIA_RESTAURANTES,
    ...Array.from({ length: TOTAL - TINGO_MARIA_RESTAURANTES.length }, (_, i) => generarRestaurante(i + 1))
  ];

  const insertedWithSchedules = []; // [{id, schedules}]
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

    const result = await pool.query(
      `INSERT INTO restaurantes
         (nombre, tipo_comida, categoria, descripcion, direccion, ciudad,
          telefono, horario, latitud, longitud, redes_sociales, imagen_url, calificacion)
       VALUES ${valores.join(', ')}
       RETURNING id`,
      params
    );

    result.rows.forEach((row, idx) => {
      insertedWithSchedules.push({ id: row.id, schedules: lote[idx].schedules });
    });

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

  // Insertar horarios estructurados
  console.log('\nAsignando horarios...');
  let scheduleCount = 0;

  for (const { id, schedules } of insertedWithSchedules) {
    if (!schedules || schedules.length === 0) continue;
    const vals = [];
    const prms = [];
    let   pi   = 1;
    for (const s of schedules) {
      vals.push(`($${pi++},$${pi++},$${pi++},$${pi++})`);
      prms.push(id, s.dia, s.apertura, s.cierre);
    }
    await pool.query(
      `INSERT INTO restaurant_schedules (restaurante_id, dia_semana, hora_apertura, hora_cierre)
       VALUES ${vals.join(', ')} ON CONFLICT DO NOTHING`,
      prms
    );
    scheduleCount += schedules.length;
  }

  console.log(`  ${scheduleCount} filas de horario insertadas`);

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
