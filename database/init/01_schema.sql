CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

