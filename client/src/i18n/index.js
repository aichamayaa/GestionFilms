import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { z } from 'zod';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

export const CLE_LANGUE = 'gestion-films-langue';

export function langueCourante() {
  return i18n.language?.startsWith('fr') ? 'fr' : 'en';
}

function appliquerLangue() {
  const code = langueCourante();
  document.documentElement.lang = code;
  document.title = i18n.t('common.appName');
  z.config(code === 'fr' ? z.locales.fr() : z.locales.en());
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, fr: { translation: fr } },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    detection: { order: ['localStorage', 'navigator'], lookupLocalStorage: CLE_LANGUE, caches: ['localStorage'] },
  });

i18n.on('initialized', appliquerLangue);
i18n.on('languageChanged', appliquerLangue);
appliquerLangue();

export default i18n;
