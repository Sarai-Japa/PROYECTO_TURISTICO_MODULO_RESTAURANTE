import { useState } from 'react';
import { ChefHat, Eye, EyeOff, UserPlus, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { mapApiError } from '../i18n/mapApiError';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeSwitcher from '../components/ThemeSwitcher';

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
  const { t } = useTranslation('auth');
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
        setError(mapApiError(t, data.error) || t('errors.registerFailed'));
        return;
      }
      login(data.token, data.user);
      onSuccess();
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4 relative transition-colors">
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <button onClick={onBack} className="flex items-center justify-center gap-2 mx-auto mb-2 hover:opacity-80 transition cursor-pointer">
            <ChefHat className="w-10 h-10 text-orange-500" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">FoodHub</span>
          </button>
          <p className="text-gray-500 dark:text-gray-400">{t('register.title')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register.name')}</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); setError(''); }}
                placeholder={t('register.namePlaceholder')}
                maxLength={150}
                autoComplete="name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder={t('register.emailPlaceholder')}
                autoComplete="email"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition text-base
                  ${email && !emailValid
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-200 focus:border-orange-500'}`}
              />
              {email && !emailValid && (
                <p className="text-xs text-red-500 mt-1">{t('errors.invalidEmail')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register.password')}</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder={t('register.passwordPlaceholder')}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  aria-label={showPwd ? t('register.hidePassword') : t('register.showPassword')}
                >
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {password && (
                <div className="mt-2 space-y-1 pl-1">
                  <PwdRule ok={pwdLength}    text={t('register.passwordRules.length')} />
                  <PwdRule ok={pwdUppercase} text={t('register.passwordRules.uppercase')} />
                  <PwdRule ok={pwdNumber}    text={t('register.passwordRules.number')} />
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
              {loading ? t('register.buttonLoading') : t('register.button')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('register.hasAccount')}{' '}
            <button
              onClick={onGoLogin}
              className="text-orange-500 font-medium hover:text-orange-600 transition cursor-pointer"
            >
              {t('register.login')}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
