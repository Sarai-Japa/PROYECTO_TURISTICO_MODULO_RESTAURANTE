import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Phone, Clock, Globe, Heart } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import { useReviews } from '../hooks/useReviews';
import { formatReviewDate } from '../i18n/formatLocaleDate';

// Fix Leaflet default marker icons with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DEFAULT_IMG = 'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function Stars({ value, t }) {
  const rating = parseFloat(value) || 0;
  return (
    <div className="flex items-center gap-1">
      <span className="text-xl text-yellow-400">
        {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      </span>
      <span className="text-lg font-bold text-gray-700 dark:text-gray-300 ml-1">
        {rating > 0 ? `${rating.toFixed(1)}/5` : t('card.noRating')}
      </span>
    </div>
  );
}

const MENU = {
  peruana: [
    { nombre: 'Ceviche Clásico Peruano', desc: 'Pescado fresco marinado en jugo de limón, ají limo, camote y choclo.', precio: 'S/. 35.00' },
    { nombre: 'Lomo Saltado Criollo', desc: 'Lomo fino salteado al wok con cebolla, tomate, ají amarillo, papas fritas y arroz.', precio: 'S/. 42.00' },
    { nombre: 'Ají de Gallina', desc: 'Pechuga de gallina en salsa cremosa de ají amarillo, nueces y queso parmesano.', precio: 'S/. 32.00' },
    { nombre: 'Chicha Morada de la Casa', desc: 'Bebida tradicional a base de maíz morado hervido con piña y especias.', precio: 'S/. 9.00' },
  ],
  italiana: [
    { nombre: 'Fettuccine Alfredo con Pollo', desc: 'Pasta fresca en salsa Alfredo tradicional con queso parmesano.', precio: 'S/. 36.00' },
    { nombre: 'Lasaña Boloñesa Rústica', desc: 'Capas de pasta rellenas de salsa boloñesa artesanal y mozzarella gratinada.', precio: 'S/. 38.00' },
    { nombre: 'Pizza Margherita', desc: 'Tomate San Marzano, mozzarella fresca y albahaca sobre masa artesanal.', precio: 'S/. 34.00' },
    { nombre: 'Tiramisú de Especialidad', desc: 'Bizcochuelo en café espresso italiano con crema de mascarpone.', precio: 'S/. 15.00' },
  ],
  japonesa: [
    { nombre: 'Maki Acevichado (10 cortes)', desc: 'Roll de langostino empanizado y palta cubierto de atún y salsa acevichada.', precio: 'S/. 28.00' },
    { nombre: 'Ramen Tonkotsu', desc: 'Caldo espeso de cerdo 12 horas, fideos caseros, chashu, huevo marinado.', precio: 'S/. 34.00' },
    { nombre: 'Sashimi Mixto', desc: 'Selección del día de atún, salmón y pez blanco cortados al instante.', precio: 'S/. 45.00' },
    { nombre: 'Mochi de Té Verde', desc: 'Dulce japonés relleno de helado premium sabor matcha.', precio: 'S/. 10.00' },
  ],
  default: [
    { nombre: 'Plato Especial de la Casa', desc: 'Nuestra recomendación elaborada con los ingredientes más frescos del día.', precio: 'S/. 32.00' },
    { nombre: 'Entrada de Temporada', desc: 'Selección de entradas preparadas con productos locales de estación.', precio: 'S/. 18.00' },
    { nombre: 'Bebida Artesanal', desc: 'Infusión fría de frutas de la estación y hierbas aromáticas.', precio: 'S/. 8.50' },
    { nombre: 'Postre Tradicional', desc: 'Receta secreta familiar servida con helado artesanal.', precio: 'S/. 12.00' },
  ],
};

function getMenu(tipoComida) {
  const t = (tipoComida || '').toLowerCase();
  if (t.includes('peruana') || t.includes('marina') || t.includes('criolla') || t.includes('ceviche')) return MENU.peruana;
  if (t.includes('italiana') || t.includes('pizza') || t.includes('pasta')) return MENU.italiana;
  if (t.includes('japonesa') || t.includes('sushi') || t.includes('nikkei')) return MENU.japonesa;
  return MENU.default;
}

// ── Sección de Información ─────────────────────────────────────────
function InfoTab({ restaurantData, t }) {
  const { nombre, descripcion, direccion, ciudad, telefono, horario, latitud, longitud, redes_sociales } = restaurantData;
  const hasCoords = latitud != null && longitud != null;

  return (
    <div className="space-y-5">
      {descripcion && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm dark:shadow-gray-900/50 transition-colors">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">{t('tabs.about')}</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{descripcion}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm dark:shadow-gray-900/50 transition-colors">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">{t('tabs.contact')}</h2>
        <div className="space-y-3">
          {(direccion || ciudad) && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-orange-500 dark:text-orange-400 mt-0.5 shrink-0" />
              <div>
                {direccion && <p className="text-gray-700 dark:text-gray-300 text-sm">{direccion}</p>}
                {ciudad && <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{ciudad}</p>}
              </div>
            </div>
          )}
          {telefono && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-orange-500 dark:text-orange-400 shrink-0" />
              <a href={`tel:${telefono}`} className="text-gray-700 dark:text-gray-300 text-sm hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer">
                {telefono}
              </a>
            </div>
          )}
          {horario && (
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-500 dark:text-orange-400 mt-0.5 shrink-0" />
              <p className="text-gray-700 dark:text-gray-300 text-sm">{horario}</p>
            </div>
          )}
          {redes_sociales && (
            <div className="flex flex-wrap gap-2 pt-1">
              {redes_sociales.instagram && (
                <a
                  href={`https://instagram.com/${redes_sociales.instagram.replace('@', '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 px-3 py-1.5 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/40 transition cursor-pointer"
                >
                  📸 {redes_sociales.instagram}
                </a>
              )}
              {redes_sociales.facebook && (
                <a
                  href={`https://facebook.com/${redes_sociales.facebook}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition cursor-pointer"
                >
                  📘 {redes_sociales.facebook}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm dark:shadow-gray-900/50 transition-colors">
        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('tabs.location')}</h2>
        </div>
        {hasCoords ? (
          <div style={{ height: '260px' }}>
            <MapContainer
              center={[latitud, longitud]}
              zoom={16}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[latitud, longitud]}>
                <Popup>{nombre}{ciudad ? `, ${ciudad}` : ''}</Popup>
              </Marker>
            </MapContainer>
          </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-700/50 transition-colors">
            <MapPin className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nombre} ${direccion || ''} ${ciudad || ''}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="text-orange-600 dark:text-orange-400 hover:underline text-sm cursor-pointer"
            >
              {t('buttons.googleMaps')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sección de Menú ────────────────────────────────────────────────
function MenuTab({ tipoComida }) {
  const platos = getMenu(tipoComida);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {platos.map((plato, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm dark:shadow-gray-900/50 border border-gray-50 dark:border-gray-700 hover:border-orange-100 dark:hover:border-orange-800 transition">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{plato.nombre}</h3>
            <span className="text-orange-600 dark:text-orange-400 font-bold text-sm shrink-0">{plato.precio}</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{plato.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ── Sección de Reseñas ─────────────────────────────────────────────
function ReviewForm({ restaurantId, isAuthenticated, onGoLogin, onReviewAdded, t }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-5 mb-6 flex flex-col items-center justify-center text-center transition-colors">
        <p className="text-gray-700 dark:text-gray-300 font-medium mb-3">{t('reviews.loginToReview')}</p>
        <button
          onClick={onGoLogin}
          className="px-5 py-2 bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-600 text-white font-bold rounded-lg transition cursor-pointer"
        >
          {t('common:nav.login')}
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (rating === 0) {
      setErrorMsg(t('reviews.selectRating'));
      return;
    }
    if (comment.trim().length < 5) {
      setErrorMsg(t('reviews.minCommentLength'));
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('fh_token');

    try {
      const res = await fetch(`${API_URL}/api/restaurants/${restaurantId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('reviews.submitError'));
      }

      setSuccessMsg(t('reviews.thankYou'));
      setRating(0);
      setComment('');
      onReviewAdded(data);

      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 mb-6 transition-colors">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('reviews.writeReview')}</h3>
      {errorMsg && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg p-3 text-sm mb-4">{errorMsg}</div>}
      {successMsg && <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg p-3 text-sm mb-4">{successMsg}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('reviews.rating')}</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-3xl focus:outline-none transition-colors cursor-pointer ${
                  star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                }`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('reviews.comment')}</label>
          <textarea
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
            rows="4"
            placeholder={t('reviews.commentPlaceholder')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className={`px-5 py-2.5 font-bold rounded-lg transition cursor-pointer ${
            submitting
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-600 text-white'
          }`}
        >
          {submitting ? t('reviews.sending') : t('reviews.submit')}
        </button>
      </form>
    </div>
  );
}

function ReviewsTab({ restaurantId, isAuthenticated, onGoLogin, t, i18n }) {
  const { reviews, avgRating, meta, loading, error, sort, handleSortChange, loadMore, addReview } = useReviews(restaurantId);

  return (
    <div>
      <ReviewForm
        restaurantId={restaurantId}
        isAuthenticated={isAuthenticated}
        onGoLogin={onGoLogin}
        onReviewAdded={addReview}
        t={t}
      />
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <div>
          {avgRating > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-lg">
                {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
              </span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{avgRating.toFixed(1)}/5</span>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                {t('reviews.basedOn', { count: meta.total })}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-sm text-gray-500 dark:text-gray-400">{t('reviews.sort')}:</label>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-orange-500 transition"
          >
            <option value="date">{t('reviews.sortDate')}</option>
            <option value="rating">{t('reviews.sortRating')}</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl p-4 text-sm text-center mb-4">{error}</div>
      )}

      {reviews.length === 0 && !loading && !error && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-10 text-center border border-dashed border-gray-200 dark:border-gray-700 transition-colors">
          <span className="text-4xl block mb-3">💬</span>
          <p className="text-lg font-bold text-gray-800 dark:text-white">{t('reviews.firstOpinion')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('reviews.shareExperience')}</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-base shrink-0 select-none">
                {r.usuario_nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white">{r.usuario_nombre}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-yellow-400 text-sm">
                    {'★'.repeat(r.puntuacion)}{'☆'.repeat(5 - r.puntuacion)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatReviewDate(r.fecha_creacion, i18n.language)}
                  </span>
                </div>
                {r.comentario && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mt-2">{r.comentario}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="space-y-4 mt-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            </div>
          ))}
        </div>
      )}

      {meta.page < meta.totalPages && !loading && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            className="px-6 py-2.5 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 font-bold rounded-xl border border-orange-100 dark:border-orange-800 text-sm cursor-pointer transition"
          >
            {t('reviews.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────
export default function RestaurantDetailPage({ restaurant, onBack, isFavorite = false, onToggleFavorite, isAuthenticated = false, onGoLogin }) {
  const { t, i18n } = useTranslation('restaurantDetail');
  const { id } = restaurant;
  const [activeTab, setActiveTab]           = useState('info');
  const [loaded, setLoaded]                 = useState(false);
  const [restaurantData, setRestaurantData] = useState(restaurant);
  const [loadingPage, setLoadingPage]       = useState(false);
  const [pageError, setPageError]           = useState(null);
  const [heartAnim, setHeartAnim]           = useState(false);

  function handleHeartClick() {
    if (!isAuthenticated) { onGoLogin?.(); return; }
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 300);
    onToggleFavorite?.(id);
  }

  useEffect(() => {
    if (!id) return;
    setLoadingPage(true);
    setPageError(null);

    fetch(`${API_URL}/api/restaurants/${id}`)
      .then((res) => {
        if (res.status === 404) throw new Error('404');
        if (!res.ok) throw new Error('error');
        return res.json();
      })
      .then((data) => setRestaurantData(data))
      .catch((err) => setPageError(err.message === '404' ? '404' : 'error'))
      .finally(() => setLoadingPage(false));
  }, [id]);

  if (pageError === '404') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6 transition-colors">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:shadow-gray-900/50 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">404</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('error.notFound')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t('error.notFoundDesc')}</p>
          <button onClick={onBack} className="w-full py-3 bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700 text-white font-bold rounded-xl transition cursor-pointer">
            {t('buttons.back')}
          </button>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6 transition-colors">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:shadow-gray-900/50 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('error.connectionError')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t('error.connectionErrorDesc')}</p>
          <button onClick={onBack} className="w-full py-3 bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700 text-white font-bold rounded-xl transition cursor-pointer">
            {t('buttons.back')}
          </button>
        </div>
      </div>
    );
  }

  const { nombre, imagen_url, calificacion, tipo_comida, categoria } = restaurantData;

  const TABS = [
    { key: 'info',    label: t('tabs.info') },
    { key: 'menu',    label: t('tabs.menu') },
    { key: 'reviews', label: t('tabs.reviews') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">

      {/* Hero */}
      <div className="relative h-72 md:h-96 bg-gray-200 dark:bg-gray-700">
        <img
          src={imagen_url || DEFAULT_IMG}
          alt={nombre}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={(e) => { e.currentTarget.src = DEFAULT_IMG; setLoaded(true); }}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <button
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg shadow transition font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('buttons.back')}
        </button>

        {/* Botón corazón — HU10-T01/T02 */}
        <button
          onClick={handleHeartClick}
          title={isFavorite ? t('card.removeFavorite') : t('card.addFavorite')}
          aria-label={isFavorite ? t('card.removeFavorite') : t('card.addFavorite')}
          className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full shadow-md
            transition-all duration-200 cursor-pointer
            ${isFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-white/90 hover:bg-white'}
            ${heartAnim ? 'scale-125' : 'scale-100'}`}
        >
          <Heart
            fill={isFavorite ? 'currentColor' : 'none'}
            className={`w-5 h-5 transition-colors duration-200 ${isFavorite ? 'text-white' : 'text-gray-600'}`}
          />
        </button>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
          <h1 className="text-white text-3xl md:text-4xl font-bold drop-shadow-lg">{nombre}</h1>
          {tipo_comida && <p className="text-white/80 text-sm mt-1">{tipo_comida}</p>}
        </div>
      </div>

      {/* Rating + Tabs sticky */}
      <div className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
            <Stars value={calificacion} t={t} />
            {categoria && (
              <span className="text-orange-600 dark:text-orange-400 text-xs bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full font-medium">
                {categoria}
              </span>
            )}
          </div>
          <div className="flex">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
                  activeTab === key
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'info'    && <InfoTab    restaurantData={restaurantData} t={t} />}
        {activeTab === 'menu'    && <MenuTab    tipoComida={tipo_comida} />}
        {activeTab === 'reviews' && <ReviewsTab restaurantId={id} isAuthenticated={isAuthenticated} onGoLogin={onGoLogin} t={t} i18n={i18n} />}
      </div>
    </div>
  );
}
