import { useState } from 'react';
import { ChefHat, Eye, EyeOff, UserPlus, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function PwdRule({ ok, text }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? 'text-green-600' : 'text-gray-400'}`}>
      {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {text}
    </div>
  );
}

// T01 HU11: formulario de registro con validación en tiempo real
export default function RegisterPage({ onSuccess, onGoLogin, onBack }) {
  const { login } = useAuth();
  const [nombre, setNombre]     = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const emailValid   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwdLength    = password.length >= 8;
  const pwdUppercase = /[A-Z]/.test(password);
  const pwdNumber    = /[0-9]/.test(password);
  const pwdValid     = pwdLength && pwdUppercase && pwdNumber;
  const canSubmit    = nombre.trim().length >= 2 && emailValid && pwdValid && !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    try {
      const res  = await fetch(`${API_URL}/api/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nombre: nombre.trim(), email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear la cuenta');
        return;
      }
      login(data.token, data.user);
      onSuccess();
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <button onClick={onBack} className="flex items-center justify-center gap-2 mx-auto mb-2 hover:opacity-80 transition cursor-pointer">
            <ChefHat className="w-10 h-10 text-orange-500" />
            <span className="text-3xl font-bold text-gray-900">FoodHub</span>
          </button>
          <p className="text-gray-500">Crea tu cuenta gratuita</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); setError(''); }}
                placeholder="Tu nombre"
                maxLength={150}
                autoComplete="name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="tu@email.com"
                autoComplete="email"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition text-base
                  ${email && !emailValid
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-200 focus:border-orange-500'}`}
              />
              {email && !emailValid && (
                <p className="text-xs text-red-500 mt-1">Ingresa un email válido</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Crea una contraseña segura"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {password && (
                <div className="mt-2 space-y-1 pl-1">
                  <PwdRule ok={pwdLength}    text="Mínimo 8 caracteres" />
                  <PwdRule ok={pwdUppercase} text="Al menos una mayúscula" />
                  <PwdRule ok={pwdNumber}    text="Al menos un número" />
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <UserPlus className="w-5 h-5" />
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={onGoLogin}
              className="text-orange-500 font-medium hover:text-orange-600 transition cursor-pointer"
            >
              Inicia sesión
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
