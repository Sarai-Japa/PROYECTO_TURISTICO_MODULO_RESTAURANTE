import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'fh_lang';

export function useLanguage() {
  const { i18n } = useTranslation();

  function changeLanguage(lang) {
    i18n.changeLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  return { language: i18n.language, changeLanguage };
}
