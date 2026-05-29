CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- HU11: autenticación de usuarios
-- T09: estructura completa: id, email, password_hash, nombre, rol
CREATE TABLE usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(150) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol           VARCHAR(20)  NOT NULL DEFAULT 'usuario'
                             CHECK (rol IN ('usuario', 'admin')),
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);

CREATE TABLE restaurantes (
  id             SERIAL PRIMARY KEY,
  nombre         VARCHAR(200) NOT NULL,
  tipo_comida    VARCHAR(100),
  categoria      VARCHAR(100),
  descripcion    TEXT,
  direccion      VARCHAR(300),
  ciudad         VARCHAR(100),
  telefono       VARCHAR(20),
  horario        VARCHAR(200),
  latitud        DECIMAL(10,7),
  longitud       DECIMAL(10,7),
  redes_sociales JSONB,
  imagen_url     TEXT,
  calificacion   DECIMAL(3,1) DEFAULT 0
                 CONSTRAINT chk_calificacion CHECK (calificacion >= 0 AND calificacion <= 5),
  created_at     TIMESTAMP DEFAULT NOW()
);

-- T07 (HU01): índice GIN combinado para búsqueda full-text
CREATE INDEX idx_restaurantes_fts ON restaurantes
  USING gin(
    to_tsvector('spanish',
      nombre || ' ' ||
      COALESCE(tipo_comida, '') || ' ' ||
      COALESCE(categoria, '')
    )
  );

CREATE TABLE reseñas (
  id             SERIAL PRIMARY KEY,
  restaurante_id INT NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
  usuario_nombre VARCHAR(150) NOT NULL,
  puntuacion     INT NOT NULL CONSTRAINT chk_puntuacion CHECK (puntuacion >= 1 AND puntuacion <= 5),
  comentario     TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reseñas_restaurante_id ON reseñas(restaurante_id);

-- HU02: índice parcial en coordenadas para filtrado geográfico (Haversine)
CREATE INDEX idx_restaurantes_geo ON restaurantes (latitud, longitud)
  WHERE latitud IS NOT NULL AND longitud IS NOT NULL;

-- HU04-T05: covering index geográfico — elimina heap fetches en el Index Only Scan
-- al incluir todas las columnas del SELECT en el índice.
-- Convierte "Index Scan" → "Index Only Scan" para queries geo-filtradas.
CREATE INDEX idx_restaurantes_geo_covering ON restaurantes (latitud, longitud)
  INCLUDE (id, nombre, tipo_comida, categoria, descripcion, direccion, ciudad, imagen_url, calificacion)
  WHERE latitud IS NOT NULL AND longitud IS NOT NULL;

-- HU05: amenidades y relación many-to-many con restaurantes
CREATE TABLE amenidades (
  id     SERIAL PRIMARY KEY,
  slug   VARCHAR(50)  UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  icono  VARCHAR(50)
);

CREATE TABLE restaurante_amenidades (
  restaurante_id INT NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
  amenidad_id    INT NOT NULL REFERENCES amenidades(id)   ON DELETE CASCADE,
  PRIMARY KEY (restaurante_id, amenidad_id)
);

CREATE INDEX idx_rest_amen_restaurante ON restaurante_amenidades(restaurante_id);
CREATE INDEX idx_rest_amen_amenidad    ON restaurante_amenidades(amenidad_id);

-- HU03: horarios estructurados por día de la semana (DOW: 0=domingo … 6=sábado)
CREATE TABLE restaurant_schedules (
  id             SERIAL PRIMARY KEY,
  restaurante_id INT      NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
  dia_semana     SMALLINT NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  hora_apertura  TIME     NOT NULL,
  hora_cierre    TIME     NOT NULL,
  UNIQUE (restaurante_id, dia_semana)
);

CREATE INDEX idx_schedules_restaurante  ON restaurant_schedules(restaurante_id);
-- HU04-T04: índice compuesto para el filtrado combinado (ubicación + fecha).
-- Permite resolver "restaurantes abiertos el día N" usando idx_schedules_dia antes de
-- hacer el JOIN con el resultado geo-filtrado. Orden: dia_semana primero porque es
-- la columna de filtrado; restaurante_id segundo para el nested-loop JOIN.
CREATE INDEX idx_schedules_dia_restaurante ON restaurant_schedules(dia_semana, restaurante_id);

-- HU10: favoritos — tabla pivote usuario ↔ restaurante
CREATE TABLE user_favorites (
  user_id        INT NOT NULL REFERENCES usuarios(id)     ON DELETE CASCADE,
  restaurant_id  INT NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, restaurant_id)
);

-- HU10-T06: cubre WHERE user_id = $1 ORDER BY created_at DESC del GET /api/favorites.
-- Reemplaza idx_favorites_user (redundante con la PK) y elimina el sort en memoria.
CREATE INDEX idx_favorites_user_date ON user_favorites(user_id, created_at DESC);

