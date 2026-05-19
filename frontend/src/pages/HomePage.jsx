import { ChefHat, Search, MapPin, MessageSquare, Heart } from 'lucide-react';

const FEATURE_CARDS = [
  {
    icon: Search,
    title: 'Búsqueda Inteligente',
    desc: 'Busca por nombre, tipo de cocina o plato específico',
    img: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
  {
    icon: MapPin,
    title: 'Cerca de Ti',
    desc: 'Encuentra restaurantes por ubicación y distancia',
    img: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
  {
    icon: MessageSquare,
    title: 'Reseñas Reales',
    desc: 'Lee opiniones de comensales y comparte tu experiencia',
    img: 'https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
  {
    icon: Heart,
    title: 'Guarda Favoritos',
    desc: 'Marca los lugares que quieres volver a visitar',
    img: 'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
];

const SHOWCASE = [
  { name: 'La Brasa Criolla', type: 'Comida Criolla',  rating: 4.8, img: 'https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop' },
  { name: 'Pasta Italia',     type: 'Italiana',         rating: 4.6, img: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop' },
  { name: 'Café Aroma',       type: 'Café / Postres',   rating: 4.9, img: 'https://images.pexels.com/photos/1833349/pexels-photo-1833349.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop' },
];

export default function HomePage({ onExplore }) {
  return (
    <main className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">FoodHub</span>
          </div>
          <button
            onClick={onExplore}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition cursor-pointer"
          >
            Explorar
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-[560px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1600&h=700&fit=crop"
          alt="Restaurante"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight drop-shadow-lg">
            Descubre Restaurantes Increíbles
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-xl mx-auto drop-shadow">
            Encuentra los mejores lugares para comer, lee reseñas reales y guarda tus favoritos
          </p>
          <button
            onClick={onExplore}
            className="inline-block px-10 py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition text-lg shadow-lg cursor-pointer"
          >
            Comenzar a Explorar →
          </button>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">¿Qué puedes hacer?</h2>
          <p className="text-gray-500 text-center mb-12">Todo lo que necesitas para elegir el mejor lugar</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURE_CARDS.map(({ icon: Icon, title, desc, img }) => (
              <div key={title} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
                <div className="relative h-40 overflow-hidden">
                  <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
                  <div className="absolute bottom-3 left-3 bg-orange-500 rounded-full p-2 shadow">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">Lugares que te esperan</h2>
          <p className="text-gray-500 text-center mb-12">Una muestra de lo que puedes descubrir</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SHOWCASE.map((r) => (
              <button key={r.name} onClick={onExplore} className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer block w-full text-left">
                <div className="relative h-52 overflow-hidden">
                  <img src={r.img} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-bold text-lg leading-tight">{r.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-white/80 text-sm">{r.type}</span>
                      <span className="text-yellow-400 text-sm font-semibold">★ {r.rating}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={onExplore}
              className="inline-block px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition shadow cursor-pointer"
            >
              Ver todos los restaurantes →
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden">
            <img
              src="https://images.pexels.com/photos/784633/pexels-photo-784633.jpeg?auto=compress&cs=tinysrgb&w=1400&h=500&fit=crop"
              alt="Mesa de restaurante"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-orange-600/80" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <h2 className="text-3xl font-bold text-white mb-3">¿Listo para explorar?</h2>
              <p className="text-white/90 text-lg mb-6">Cientos de restaurantes con información detallada, reseñas y más</p>
              <button
                onClick={onExplore}
                className="px-8 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-gray-100 transition shadow cursor-pointer"
              >
                Ir a Restaurantes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ChefHat className="w-5 h-5 text-orange-500" />
            <span className="text-white font-bold">FoodHub</span>
          </div>
          <p className="text-sm">© 2025 FoodHub — Módulo de Restaurantes.</p>
          <p className="text-xs mt-1 text-gray-600">Parte de un marketplace de turismo y gastronomía</p>
        </div>
      </footer>
    </main>
  );
}
