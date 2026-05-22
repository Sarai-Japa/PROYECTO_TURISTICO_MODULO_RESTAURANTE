# Módulo de Restaurantes — Proyecto Turístico

Plataforma web para descubrir restaurantes en el Perú. Permite buscar por nombre, filtrar por ubicación geográfica y por amenidades (Wi-Fi, terraza, estacionamiento, etc.).

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + Lucide React |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL 16 |
| Mapas | Leaflet + OpenStreetMap (sin API key) |
| Geocodificación | Nominatim via backend proxy |
| Contenedores | Docker + Docker Compose |

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Git

---

## Levantar el proyecto por primera vez

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd PROYECTO_TURISTICO_MODULO_RESTAURANTE

# 2. Construir imágenes e inicializar la base de datos
docker compose up --build -d

# 3. Esperar ~20 segundos a que PostgreSQL termine de inicializar
#    (puedes verificar con: docker compose logs db --tail=5)

# 4. Cargar 120 restaurantes de prueba distribuidos por todo el Perú
docker compose exec backend npm run seed:massive

# 5. Cargar reseñas de prueba para todos los restaurantes
docker compose exec backend npm run seed:reviews
```

La aplicación estará disponible en:

- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:4000
- **Health check** → http://localhost:4000/health

---

## Levantar a partir de la segunda vez

```bash
docker compose up -d
```

> Los datos persisten en el volumen `postgres_data`. No es necesario hacer seed nuevamente.

---

## Correr los tests

```bash
docker compose exec backend npm test
```

Resultado esperado: **65 tests pasando** en 5 suites (restaurants, reviews, search, geocode, amenidades).

---

## Resetear la base de datos

Si necesitas datos limpios o hubo cambios en el schema:

```bash
# Eliminar todos los contenedores y volúmenes (borra los datos)
docker compose down -v

# Volver a construir e inicializar
docker compose up --build -d

# Esperar ~20 segundos, luego cargar los datos
docker compose exec backend npm run seed:massive
docker compose exec backend npm run seed:reviews
```

---

## Estructura del proyecto

```
.
├── frontend/               # React + Vite
│   └── src/
│       ├── components/     # RestaurantCard, SearchBar, AmenityFilter, LocationSearch...
│       ├── hooks/          # useRestaurants, useSearch, useAmenidades, useLocationSearch...
│       └── pages/          # HomePage, RestaurantsPage, RestaurantDetailPage
│
├── backend/                # Express API
│   ├── src/
│   │   ├── routes/         # restaurants, search, geocode, amenidades
│   │   └── app.js
│   ├── scripts/
│   │   ├── seed-massive.js # 120 restaurantes distribuidos por el Perú
│   │   └── seed-reviews.js # Reseñas de prueba
│   └── tests/              # Jest + Supertest
│
├── database/
│   └── init/
│       ├── 01_schema.sql   # Tablas, índices, relaciones
│       └── 02_seed.sql     # 10 restaurantes iniciales + amenidades
│
└── docker-compose.yml
```

---

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/restaurants` | Listado paginado |
| GET | `/api/restaurants?lat=&lng=&radius=` | Filtro por ubicación (Haversine) |
| GET | `/api/restaurants?amenities[]=wifi` | Filtro por amenidades |
| GET | `/api/restaurants/:id` | Detalle de un restaurante |
| GET | `/api/restaurants/:id/reviews` | Reseñas paginadas |
| GET | `/api/search?q=` | Búsqueda full-text |
| GET | `/api/geocode?q=` | Geocodificación (Nominatim, solo Perú) |
| GET | `/api/amenidades` | Lista de amenidades disponibles |

---

## Comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f

# Ver logs solo del backend
docker compose logs backend -f

# Reiniciar solo el backend (tras cambios en código)
docker compose restart backend

# Acceder a la base de datos
docker compose exec db psql -U postgres -d restaurante_db

# Ver tablas
docker compose exec db psql -U postgres -d restaurante_db -c "\dt"
```
