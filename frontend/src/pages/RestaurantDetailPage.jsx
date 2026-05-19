import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useReviews } from '../hooks/useReviews';

const DEFAULT_IMG = 'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function Stars({ value }) {
  const rating = parseFloat(value) || 0;
  return (
    <div className="flex items-center gap-1">
      <span className="text-2xl text-yellow-400">
        {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      </span>
      <span className="text-xl font-bold text-gray-700 ml-1">
        {rating > 0 ? `${rating.toFixed(1)}/5` : 'Sin puntuación'}
      </span>
    </div>
  );
}

function getMockMenu(tipoComida) {
  const defaultMenu = [
    { nombre: 'Plato Especial de la Casa', desc: 'Nuestra recomendación especial elaborada con los ingredientes más frescos del día.', precio: 'S/. 32.00' },
    { nombre: 'Bebida Refrescante Artesanal', desc: 'Infusión fría de frutas de la estación y hierbas aromáticas.', precio: 'S/. 8.50' },
    { nombre: 'Postre Delicia Tradicional', desc: 'Receta secreta familiar servida con una bola de helado artesanal.', precio: 'S/. 12.00' }
  ];

  const peruanoMenu = [
    { nombre: 'Ceviche Clásico Peruano', desc: 'Trozos de pescado fresco marinados en jugo de limón, ají limo, servido con camote y choclo.', precio: 'S/. 35.00' },
    { nombre: 'Lomo Saltado Criollo', desc: 'Jugosos trozos de lomo fino salteados al wok con cebolla, tomate, ají amarillo, servido con papas fritas y arroz.', precio: 'S/. 42.00' },
    { nombre: 'Chicha Morada de la Casa', desc: 'Bebida tradicional a base de maíz morado hervido con piña, manzana y especias.', precio: 'S/. 9.00' }
  ];

  const italianoMenu = [
    { nombre: 'Fettuccine Alfredo con Pollo', desc: 'Pasta fresca hecha a mano bañada en una cremosa salsa Alfredo tradicional con queso parmesano.', precio: 'S/. 36.00' },
    { nombre: 'Lasaña Boloñesa Rústica', desc: 'Capas de pasta rellenas de salsa boloñesa artesanal, bechamel y abundante queso mozzarella gratinado.', precio: 'S/. 38.00' },
    { nombre: 'Tiramisú de Especialidad', desc: 'Bizcochuelo bañado en café espresso italiano, licor de café y crema de mascarpone.', precio: 'S/. 15.00' }
  ];

  const japonesMenu = [
    { nombre: 'Maki Acevichado (10 cortes)', desc: 'Roll de langostino empanizado y palta, cubierto de láminas de atún y bañado en salsa acevichada.', precio: 'S/. 28.00' },
    { nombre: 'Ramen Tonkotsu Tradicional', desc: 'Caldo espeso de cerdo cocido por 12 horas, fideos ramen caseros, chashu, huevo marinado y cebollita china.', precio: 'S/. 34.00' },
    { nombre: 'Mochi helado de Té Verde', desc: 'Delicioso dulce japonés relleno de helado premium sabor matcha.', precio: 'S/. 10.00' }
  ];

  const tipo = (tipoComida || '').toLowerCase();
  if (tipo.includes('peruana') || tipo.includes('marina') || tipo.includes('ceviche') || tipo.includes('criolla')) {
    return peruanoMenu;
  }
  if (tipo.includes('italiana') || tipo.includes('pizza') || tipo.includes('pasta')) {
    return italianoMenu;
  }
  if (tipo.includes('japonesa') || tipo.includes('sushi') || tipo.includes('nikkei') || tipo.includes('oriental')) {
    return japonesMenu;
  }
  return defaultMenu;
}


export default function RestaurantDetailPage({ restaurant, onBack }) {
  const { id } = restaurant;
  const [loaded, setLoaded] = useState(false);
  const [restaurantData, setRestaurantData] = useState(restaurant);
  const [loadingRestaurant, setLoadingRestaurant] = useState(false);
  const [restaurantError, setRestaurantError] = useState(null);
  
  const { reviews, meta, loading, error, sort, handleSortChange, loadMore } = useReviews(id);

  useEffect(() => {
    if (!id) return;
    setLoadingRestaurant(true);
    setRestaurantError(null);

    fetch(`${API_URL}/api/restaurants/${id}`)
      .then((res) => {
        if (res.status === 404) {
          throw new Error('404');
        }
        if (!res.ok) {
          throw new Error('Error al cargar detalles');
        }
        return res.json();
      })
      .then((data) => {
        setRestaurantData(data);
      })
      .catch((err) => {
        if (err.message === '404') {
          setRestaurantError('404');
        } else {
          setRestaurantError('No se pudo verificar el restaurante.');
        }
      })
      .finally(() => {
        setLoadingRestaurant(false);
      });
  }, [id]);

  if (restaurantError === '404') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            404
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurante no encontrado</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Lo sentimos, el restaurante que estás buscando no existe o no se encuentra disponible en este momento.
          </p>
          <button
            onClick={onBack}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition duration-200 shadow-md text-sm cursor-pointer"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  if (restaurantError && restaurantError !== '404') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error de conexión</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">{restaurantError}</p>
          <button
            onClick={onBack}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition duration-200 shadow-md text-sm cursor-pointer"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  const { nombre, imagen_url, calificacion, ciudad, direccion, tipo_comida, categoria, descripcion } = restaurantData;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative h-80 md:h-96 bg-gray-100">
        <img
          src={imagen_url || DEFAULT_IMG}
          alt={nombre}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onError={(e) => { 
            e.currentTarget.src = DEFAULT_IMG;
            setLoaded(true); 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg shadow transition font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{nombre}</h1>
        {tipo_comida && <p className="text-lg text-gray-500 mb-3">{tipo_comida}</p>}

        <Stars value={calificacion} />

        {/* Info */}
        <div className="mt-6 bg-gray-50 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {direccion && (
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Dirección</p>
                <p className="text-gray-700">{direccion}</p>
                {ciudad && <p className="text-gray-500 text-sm">{ciudad}</p>}
              </div>
            </div>
          )}
          {categoria && (
            <div className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">🍽️</span>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Categoría</p>
                <p className="text-gray-700">{categoria}</p>
              </div>
            </div>
          )}
        </div>

        {descripcion && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Acerca de</h2>
            <p className="text-gray-700 leading-relaxed">{descripcion}</p>
          </div>
        )}

        {/* Mapa */}
        <div className="mt-8 border-t border-gray-100 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📍 Ubicación y Mapa</span>
          </h2>
          <div className="relative h-64 w-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-inner group">
            {/* Visual Mock Map Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50 flex items-center justify-center">
              <div className="text-center px-4 max-w-sm">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
                  📍
                </div>
                <p className="font-semibold text-gray-800 text-sm truncate">{nombre}</p>
                <p className="text-xs text-gray-500 mt-1">{direccion || 'Dirección no especificada'}</p>
                {ciudad && <p className="text-xs text-gray-400">{ciudad}</p>}
              </div>
            </div>
            <div className="absolute bottom-4 right-4">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nombre} ${direccion} ${ciudad}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-xl shadow-md text-xs border border-gray-200 flex items-center gap-1.5 transition cursor-pointer"
              >
                🌐 Abrir en Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Menú */}
        <div className="mt-8 border-t border-gray-100 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📖 Menú Destacado</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getMockMenu(tipo_comida).map((plato, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col justify-between hover:border-orange-200 transition">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm md:text-base">{plato.nombre}</h3>
                    <span className="text-orange-600 font-bold text-sm shrink-0">{plato.precio}</span>
                  </div>
                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{plato.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sección de Reseñas */}
        <div className="mt-12 border-t border-gray-100 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>Opiniones de comensales</span>
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  {meta.total}
                </span>
              </h2>
            </div>

            {/* T03 Selector Dropdown */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <label htmlFor="sort-reviews" className="text-sm font-medium text-gray-500">
                Ordenar por:
              </label>
              <select
                id="sort-reviews"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white font-medium text-gray-700 focus:outline-none focus:border-orange-500 cursor-pointer shadow-sm"
              >
                <option value="date">Más recientes</option>
                <option value="rating">Mejor puntuadas</option>
              </select>
            </div>
          </div>

          {/* Lista de reseñas */}
          {error && (
            <div className="bg-red-50 text-red-600 rounded-xl p-4 text-center text-sm font-medium mb-6">
              {error}
            </div>
          )}

          {reviews.length === 0 && !loading && !error && (
            <div className="bg-gray-50 rounded-2xl p-10 text-center text-gray-500 border border-dashed border-gray-200 mb-6 animate-in fade-in duration-300">
              <span className="text-4xl block mb-2">💬</span>
              <p className="text-lg font-bold text-gray-800">Sé el primero en opinar</p>
              <p className="text-sm text-gray-400 mt-1">Comparte tu experiencia con otros turistas y ayúdalos a elegir el mejor local.</p>
            </div>
          )}

          <div className="space-y-4">
            {reviews.map((r) => {
              const inicial = r.usuario_nombre ? r.usuario_nombre.charAt(0).toUpperCase() : '?';
              return (
                <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow transition duration-200">
                  <div className="flex items-start gap-4">
                    {/* Avatar circular con inicial */}
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-base shrink-0 select-none shadow-inner">
                      {inicial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-gray-900 text-base">{r.usuario_nombre}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-yellow-400 text-sm">
                              {'★'.repeat(r.puntuacion)}{'☆'.repeat(5 - r.puntuacion)}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">•</span>
                            <span className="text-xs text-gray-400 font-medium">
                              {new Date(r.fecha_creacion).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {r.comentario && (
                        <p className="text-gray-600 text-sm leading-relaxed mt-2">{r.comentario}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Skeletons de Carga */}
          {loading && (
            <div className="space-y-4 mt-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse bg-gray-50 border border-gray-100 rounded-xl p-5">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón Cargar Más */}
          {meta.page < meta.totalPages && !loading && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="px-6 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-xl transition duration-200 shadow-sm border border-orange-100 text-sm cursor-pointer"
              >
                Cargar más opiniones
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

