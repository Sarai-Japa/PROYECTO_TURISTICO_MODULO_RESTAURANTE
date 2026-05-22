INSERT INTO restaurantes (nombre, tipo_comida, categoria, descripcion, direccion, ciudad, telefono, horario, latitud, longitud, redes_sociales, imagen_url, calificacion) VALUES
  ('La Brasa Criolla',    'Peruana',    'Parrilla',     'La mejor comida criolla de la ciudad con recetas de generaciones',    'Av. Principal 123',     'Miraflores',  '+51 1 445-2312', 'Lun-Dom 12:00-23:00',               -12.1191, -77.0370, '{"instagram":"@labrasacriolla","facebook":"labrasacriolla"}',        'https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.8),
  ('Pasta Italia',        'Italiana',   'Pasta',        'Pastas frescas y risottos artesanales de receta italiana auténtica', 'Jr. Venecia 88',         'San Isidro',  '+51 1 221-8845', 'Mar-Dom 12:30-23:30',               -12.0969, -77.0352, '{"instagram":"@pastaitalia.lima","facebook":"Pasta Italia Lima"}',   'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.6),
  ('Café Aroma',          'Cafetería',  'Desayunos',    'Café de especialidad y postres caseros en el corazón de Barranco',   'Pasaje Flores 9',        'Barranco',    '+51 1 477-5621', 'Lun-Dom 07:00-22:00',               -12.1526, -77.0217, '{"instagram":"@cafearoma.barranco"}',                               'https://images.pexels.com/photos/1833349/pexels-photo-1833349.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.9),
  ('Sushi Nikkei',        'Japonesa',   'Sushi',        'Fusión nikkei y japonesa auténtica con ingredientes frescos',        'Calle Sakura 45',        'San Borja',   '+51 1 476-9823', 'Lun-Sáb 12:00-23:00, Dom 12:00-21:00', -12.1017, -77.0007, '{"instagram":"@sushinikkei","facebook":"Sushi Nikkei"}',            'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.7),
  ('Burger Palace',       'Americana',  'Hamburguesas', 'Smash burgers y papas crujientes de primera calidad',               'Av. Central 300',        'Surco',       '+51 1 349-7654', 'Lun-Dom 11:00-23:00',               -12.1484, -76.9923, '{"instagram":"@burgerpalace.pe"}',                                  'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.3),
  ('El Cevichero',        'Marina',     'Ceviche',      'Ceviche fresco y tiraditos del día preparados al momento',          'Malecón del Puerto 10',  'Chorrillos',  '+51 1 251-4478', 'Mar-Dom 10:00-21:00',               -12.1713, -77.0174, '{"instagram":"@elcevichero","facebook":"El Cevichero Chorrillos"}', 'https://images.pexels.com/photos/3655916/pexels-photo-3655916.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.5),
  ('Tacos y Más',         'Mexicana',   'Tacos',        'Tacos al pastor y quesadillas con recetas originales de México',    'Pasaje México 22',       'La Victoria', '+51 1 323-9841', 'Lun-Sáb 11:30-22:30',              -12.0686, -77.0244, '{"instagram":"@tacosymas.pe"}',                                     'https://images.pexels.com/photos/2087748/pexels-photo-2087748.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.2),
  ('Wok Garden',          'China',      'Wok',          'Salteados y dim sum tradicional elaborados con técnica china',       'Jr. Dragón 55',          'San Juan',    '+51 1 386-2254', 'Mar-Dom 12:00-23:00',               -12.1613, -76.9836, '{"instagram":"@wokgarden.pe","facebook":"Wok Garden Lima"}',        'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.4),
  ('Pizzería Roma',       'Italiana',   'Pizza',        'Pizzas artesanales al horno de leña con ingredientes importados',   'Jr. Coliseo 78',         'Jesús María', '+51 1 461-5523', 'Lun-Sáb 12:00-23:00',              -12.0756, -77.0476, '{"instagram":"@pizzeriaroma","facebook":"Pizzería Roma"}',          'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',   4.1),
  ('Mariscos del Puerto', 'Marina',     'Mariscos',     'Mariscos frescos y ceviches del mar con vista al malecón',          'Av. Costanera 5',        'Magdalena',   '+51 1 263-8891', 'Mar-Dom 11:00-22:00',               -12.0904, -77.0738, '{"instagram":"@mariscosdelpuerto","facebook":"Mariscos del Puerto"}','https://images.pexels.com/photos/3296279/pexels-photo-3296279.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',  4.6);

INSERT INTO amenidades (slug, nombre, icono) VALUES
  ('wifi',             'Wi-Fi',                  'Wifi'),
  ('terraza',          'Terraza',                'Sun'),
  ('estacionamiento',  'Estacionamiento',        'ParkingCircle'),
  ('aire-acond',       'Aire acondicionado',     'Wind'),
  ('pet-friendly',     'Pet-friendly',           'PawPrint'),
  ('reservas',         'Reservas',               'CalendarCheck'),
  ('delivery',         'Delivery',               'Bike'),
  ('para-llevar',      'Para llevar',            'ShoppingBag'),
  ('acceso-discap',    'Acceso a discapacitados','Accessibility'),
  ('vista-panoramica', 'Vista panorámica',       'Mountain');

-- Amenidades para los 10 restaurantes iniciales
INSERT INTO restaurante_amenidades (restaurante_id, amenidad_id) VALUES
  (1, 1),(1, 3),(1, 6),        -- La Brasa Criolla: wifi, estacionamiento, reservas
  (2, 1),(2, 4),(2, 6),        -- Pasta Italia: wifi, aire acond, reservas
  (3, 1),(3, 2),(3, 5),        -- Café Aroma: wifi, terraza, pet-friendly
  (4, 1),(4, 4),(4, 6),        -- Sushi Nikkei: wifi, aire acond, reservas
  (5, 1),(5, 3),(5, 7),(5, 8), -- Burger Palace: wifi, estacionamiento, delivery, para llevar
  (6, 2),(6, 9),(6, 10),       -- El Cevichero: terraza, acceso discap, vista panorámica
  (7, 1),(7, 7),(7, 8),        -- Tacos y Más: wifi, delivery, para llevar
  (8, 1),(8, 4),(8, 2),        -- Wok Garden: wifi, aire acond, terraza
  (9, 1),(9, 3),(9, 6),        -- Pizzería Roma: wifi, estacionamiento, reservas
  (10,2),(10,5),(10,10);       -- Mariscos del Puerto: terraza, pet-friendly, vista panorámica

-- HU03: horarios por día de la semana para los 10 restaurantes iniciales
-- DOW: 0=domingo, 1=lunes, 2=martes, 3=miércoles, 4=jueves, 5=viernes, 6=sábado
INSERT INTO restaurant_schedules (restaurante_id, dia_semana, hora_apertura, hora_cierre) VALUES
  -- 1. La Brasa Criolla: Lun-Dom 12:00-23:00
  (1,0,'12:00','23:00'),(1,1,'12:00','23:00'),(1,2,'12:00','23:00'),(1,3,'12:00','23:00'),
  (1,4,'12:00','23:00'),(1,5,'12:00','23:00'),(1,6,'12:00','23:00'),
  -- 2. Pasta Italia: Mar-Dom 12:30-23:30 (cerrado lunes)
  (2,0,'12:30','23:30'),(2,2,'12:30','23:30'),(2,3,'12:30','23:30'),(2,4,'12:30','23:30'),
  (2,5,'12:30','23:30'),(2,6,'12:30','23:30'),
  -- 3. Café Aroma: Lun-Dom 07:00-22:00
  (3,0,'07:00','22:00'),(3,1,'07:00','22:00'),(3,2,'07:00','22:00'),(3,3,'07:00','22:00'),
  (3,4,'07:00','22:00'),(3,5,'07:00','22:00'),(3,6,'07:00','22:00'),
  -- 4. Sushi Nikkei: Lun-Sáb 12:00-23:00, Dom 12:00-21:00
  (4,0,'12:00','21:00'),(4,1,'12:00','23:00'),(4,2,'12:00','23:00'),(4,3,'12:00','23:00'),
  (4,4,'12:00','23:00'),(4,5,'12:00','23:00'),(4,6,'12:00','23:00'),
  -- 5. Burger Palace: Lun-Dom 11:00-23:00
  (5,0,'11:00','23:00'),(5,1,'11:00','23:00'),(5,2,'11:00','23:00'),(5,3,'11:00','23:00'),
  (5,4,'11:00','23:00'),(5,5,'11:00','23:00'),(5,6,'11:00','23:00'),
  -- 6. El Cevichero: Mar-Dom 10:00-21:00 (cerrado lunes)
  (6,0,'10:00','21:00'),(6,2,'10:00','21:00'),(6,3,'10:00','21:00'),(6,4,'10:00','21:00'),
  (6,5,'10:00','21:00'),(6,6,'10:00','21:00'),
  -- 7. Tacos y Más: Lun-Sáb 11:30-22:30 (cerrado domingo)
  (7,1,'11:30','22:30'),(7,2,'11:30','22:30'),(7,3,'11:30','22:30'),(7,4,'11:30','22:30'),
  (7,5,'11:30','22:30'),(7,6,'11:30','22:30'),
  -- 8. Wok Garden: Mar-Dom 12:00-23:00 (cerrado lunes)
  (8,0,'12:00','23:00'),(8,2,'12:00','23:00'),(8,3,'12:00','23:00'),(8,4,'12:00','23:00'),
  (8,5,'12:00','23:00'),(8,6,'12:00','23:00'),
  -- 9. Pizzería Roma: Lun-Sáb 12:00-23:00 (cerrado domingo)
  (9,1,'12:00','23:00'),(9,2,'12:00','23:00'),(9,3,'12:00','23:00'),(9,4,'12:00','23:00'),
  (9,5,'12:00','23:00'),(9,6,'12:00','23:00'),
  -- 10. Mariscos del Puerto: Mar-Dom 11:00-22:00 (cerrado lunes)
  (10,0,'11:00','22:00'),(10,2,'11:00','22:00'),(10,3,'11:00','22:00'),(10,4,'11:00','22:00'),
  (10,5,'11:00','22:00'),(10,6,'11:00','22:00');

INSERT INTO reseñas (restaurante_id, usuario_nombre, puntuacion, comentario, fecha_creacion) VALUES
  (1, 'Carlos Mendoza', 5, 'Excelente ceviche, super recomendado.', '2026-05-18 10:00:00'),
  (1, 'Ana Portal', 4, 'Muy rico pero demoró un poco en llegar.', '2026-05-19 11:00:00'),
  (1, 'Roberto Gómez', 5, 'El mejor pollo a la brasa que he probado en años.', '2026-05-15 15:30:00'),
  (2, 'Laura Rojas', 5, 'La pasta carbonara es espectacular. Gran servicio.', '2026-05-19 09:00:00'),
  (2, 'Miguel Ángel', 3, 'El ambiente es lindo pero la lasaña estaba un poco fría.', '2026-05-17 12:00:00'),
  (2, 'Sofía Delgado', 4, 'Buena carta de vinos y pastas hechas a mano.', '2026-05-18 20:45:00'),
  (3, 'Pedro Fuentes', 5, 'El café Aroma de especialidad es el mejor de la zona.', '2026-05-19 07:30:00'),
  (3, 'Elena Paz', 5, 'Los postres caseros son deliciosos. Volveré.', '2026-05-16 16:00:00');
