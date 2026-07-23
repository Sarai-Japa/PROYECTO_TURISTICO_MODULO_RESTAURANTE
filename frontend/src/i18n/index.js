import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEs from './locales/es/common.json';
import homeEs from './locales/es/home.json';
import authEs from './locales/es/auth.json';
import restaurantsEs from './locales/es/restaurants.json';
import restaurantDetailEs from './locales/es/restaurantDetail.json';
import favoritesEs from './locales/es/favorites.json';

import commonEn from './locales/en/common.json';
import homeEn from './locales/en/home.json';
import authEn from './locales/en/auth.json';
import restaurantsEn from './locales/en/restaurants.json';
import restaurantDetailEn from './locales/en/restaurantDetail.json';
import favoritesEn from './locales/en/favorites.json';

const STORAGE_KEY = 'fh_lang';

function getInitialLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'en' || stored === 'es' ? stored : 'es';
}

i18n.use(initReactI18next).init({
  resources: {
    es: {
      common: commonEs,
      home: homeEs,
      auth: authEs,
      restaurants: restaurantsEs,
      restaurantDetail: restaurantDetailEs,
      favorites: favoritesEs,
    },
    en: {
      common: commonEn,
      home: homeEn,
      auth: authEn,
      restaurants: restaurantsEn,
      restaurantDetail: restaurantDetailEn,
      favorites: favoritesEn,
    },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'es',
  ns: ['common', 'home', 'auth', 'restaurants', 'restaurantDetail', 'favorites'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});
document.documentElement.lang = i18n.language;

export default i18n;
