import { useState } from 'react';
import { ChefHat, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { mapApiError } from '../i18n/mapApiError';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeSwitcher from '../components/ThemeSwitcher';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// T02 HU11: formulario de inicio de sesión
export default function LoginPage({ onSuccess, onGoRegister, onBack }) {
  const { login } = useAuth();
  const { t } = useTranslation('auth');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit  = emailValid && password.length > 0 && !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    try {
      const res  = await fetch(`${API_URL}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(mapApiError(t, data.error) || t('errors.loginFailed'));
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
          <p className="text-gray-500 dark:text-gray-400">{t('login.title')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder={t('login.emailPlaceholder')}
                autoComplete="email"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition text-base bg-white dark:bg-gray-700 dark:text-white
                  ${email && !emailValid
                    ? 'border-red-300 dark:border-red-500 focus:border-red-500'
                    : 'border-gray-200 dark:border-gray-600 focus:border-orange-500'}`}
              />
              {email && !emailValid && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{t('errors.invalidEmail')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login.password')}</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder={t('login.passwordPlaceholder')}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-orange-500 transition text-base bg-white dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition cursor-pointer"
                  aria-label={showPwd ? t('login.hidePassword') : t('login.showPassword')}
                >
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <LogIn className="w-5 h-5" />
              {loading ? t('login.buttonLoading') : t('login.button')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('login.noAccount')}{' '}
            <button
              onClick={onGoRegister}
              className="text-orange-500 font-medium hover:text-orange-600 transition cursor-pointer"
            >
              {t('login.register')}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
