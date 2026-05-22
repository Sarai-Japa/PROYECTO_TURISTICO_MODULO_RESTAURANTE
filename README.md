# Módulo de Restaurantes — Proyecto Turístico

Plataforma web para descubrir restaurantes en el Perú. Permite buscar por nombre, filtrar por ubicación, amenidades y día de apertura, con sistema de autenticación de usuarios.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + Lucide React |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT + bcrypt |
| Mapas | Leaflet + OpenStreetMap (sin API key) |
| Geocodificación | Nominatim via backend proxy |
| Contenedores | Docker + Docker Compose |

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

# 4. Cargar datos de prueba
docker compose exec backend npm run seed:massive   # 120 restaurantes
docker compose exec backend npm run seed:reviews   # reseñas
docker compose exec backend npm run seed:users     # usuarios de prueba
```

La aplicación estará disponible en:

- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:4000
- **Health check** → http://localhost:4000/health

---

## Usuarios de prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `admin@foodhub.pe` | `Admin123` | admin |
| `maria@foodhub.pe` | `Maria123` | usuario |
| `test@test.com` | `Test1234` | usuario |

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

Resultado esperado: **~95 tests pasando** en 6 suites (restaurants, reviews, search, geocode, amenidades, auth).

---

## Resetear la base de datos

```bash
docker compose down -v
docker compose up --build -d
# esperar ~20 segundos, luego:
docker compose exec backend npm run seed:massive
docker compose exec backend npm run seed:reviews
docker compose exec backend npm run seed:users
```

---

## Estructura del proyecto

```
.
├── frontend/
│   └── src/
│       ├── components/   # RestaurantCard, SearchBar, AmenityFilter,
│       │                 # LocationSearch, DateFilter...
│       ├── context/      # AuthContext (JWT en localStorage)
│       ├── hooks/        # useRestaurants, useSearch, useAmenidades...
│       └── pages/        # HomePage, RestaurantsPage, RestaurantDetailPage,
│                         # LoginPage, RegisterPage, FavoritesPage
│
├── backend/
│   ├── src/
│   │   ├── middleware/   # requireAuth (JWT)
│   │   ├── routes/       # restaurants, search, geocode, amenidades, auth
│   │   └── app.js
│   ├── scripts/
│   │   ├── seed-massive.js
│   │   ├── seed-reviews.js
│   │   └── seed-users.js
│   └── tests/
│
├── database/
│   └── init/
│       ├── 01_schema.sql  # Tablas: restaurantes, reseñas, amenidades,
│       │                  # restaurant_schedules, usuarios
│       └── 02_seed.sql
│
└── docker-compose.yml
```

---

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login → devuelve JWT |
| GET | `/api/auth/me` | Perfil del usuario autenticado |
| GET | `/api/restaurants` | Listado paginado |
| GET | `/api/restaurants?lat=&lng=&radius=` | Filtro por ubicación (Haversine) |
| GET | `/api/restaurants?amenities[]=wifi` | Filtro por amenidades |
| GET | `/api/restaurants?date=YYYY-MM-DD` | Filtro por día de apertura |
| GET | `/api/restaurants/:id` | Detalle de un restaurante |
| GET | `/api/restaurants/:id/reviews` | Reseñas paginadas |
| GET | `/api/search?q=` | Búsqueda full-text |
| GET | `/api/geocode?q=` | Geocodificación (solo Perú) |
| GET | `/api/amenidades` | Lista de amenidades disponibles |

---

## Comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f

# Reiniciar solo el backend (tras cambios en código)
docker compose restart backend

# Acceder a la base de datos
docker compose exec db psql -U postgres -d restaurante_db
```
