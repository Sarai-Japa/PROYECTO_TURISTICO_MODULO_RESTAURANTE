INSERT INTO restaurantes (nombre, tipo_comida, categoria, descripcion, direccion, ciudad, imagen_url, calificacion) VALUES
  ('La Brasa Criolla',    'Peruana',    'Parrilla',     'La mejor comida criolla de la ciudad',        'Av. Principal 123',    'Miraflores',    'https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.8),
  ('Pasta Italia',        'Italiana',   'Pasta',        'Pastas frescas y risottos artesanales',       'Jr. Venecia 88',       'San Isidro',    'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.6),
  ('Café Aroma',          'Cafetería',  'Desayunos',    'Café de especialidad y postres caseros',      'Pasaje Flores 9',      'Barranco',      'https://images.pexels.com/photos/1833349/pexels-photo-1833349.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.9),
  ('Sushi Nikkei',        'Japonesa',   'Sushi',        'Fusión nikkei y japonesa auténtica',          'Calle Sakura 45',      'San Borja',     'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.7),
  ('Burger Palace',       'Americana',  'Hamburguesas', 'Smash burgers y papas crujientes',            'Av. Central 300',      'Surco',         'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.3),
  ('El Cevichero',        'Marina',     'Ceviche',      'Ceviche fresco y tiraditos del día',          'Malecón del Puerto 10','Chorrillos',    'https://images.pexels.com/photos/3655916/pexels-photo-3655916.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.5),
  ('Tacos y Más',         'Mexicana',   'Tacos',        'Tacos al pastor y quesadillas',               'Pasaje México 22',     'La Victoria',   'https://images.pexels.com/photos/2087748/pexels-photo-2087748.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.2),
  ('Wok Garden',          'China',      'Wok',          'Salteados y dim sum tradicional',             'Jr. Dragón 55',        'San Juan',      'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.4),
  ('Pizzería Roma',       'Italiana',   'Pizza',        'Pizzas artesanales al horno de leña',         'Jr. Coliseo 78',       'Jesús María',   'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',   4.1),
  ('Mariscos del Puerto', 'Marina',     'Mariscos',     'Mariscos frescos y ceviches del mar',         'Av. Costanera 5',      'Magdalena',     'https://images.pexels.com/photos/3296279/pexels-photo-3296279.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.6);

INSERT INTO reseñas (restaurante_id, usuario_nombre, puntuacion, comentario, fecha_creacion) VALUES
  (1, 'Carlos Mendoza', 5, 'Excelente ceviche, super recomendado.', '2026-05-18 10:00:00'),
  (1, 'Ana Portal', 4, 'Muy rico pero demoró un poco en llegar.', '2026-05-19 11:00:00'),
  (1, 'Roberto Gómez', 5, 'El mejor pollo a la brasa que he probado en años.', '2026-05-15 15:30:00'),
  (2, 'Laura Rojas', 5, 'La pasta carbonara es espectacular. Gran servicio.', '2026-05-19 09:00:00'),
  (2, 'Miguel Ángel', 3, 'El ambiente es lindo pero la lasaña estaba un poco fría.', '2026-05-17 12:00:00'),
  (2, 'Sofía Delgado', 4, 'Buena carta de vinos y pastas hechas a mano.', '2026-05-18 20:45:00'),
  (3, 'Pedro Fuentes', 5, 'El café Aroma de especialidad es el mejor de la zona.', '2026-05-19 07:30:00'),
  (3, 'Elena Paz', 5, 'Los postres caseros son deliciosos. Volveré.', '2026-05-16 16:00:00');

