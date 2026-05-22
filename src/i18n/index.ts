import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const STORAGE_KEY = 'app_language';
type AppLanguage = 'en' | 'vi';

const localeLoaders: Record<AppLanguage, () => Promise<{ default: object }>> = {
  en: () => import('./locales/en.json'),
  vi: () => import('./locales/vi.json'),
};

const getInitialLanguage = (): AppLanguage => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'vi') {
    return stored;
  }
  return navigator.language.startsWith('vi') ? 'vi' : 'en';
};

const fetchLocale = async (lng: AppLanguage): Promise<object> => {
  const mod = await localeLoaders[lng]();
  return mod.default;
};

export const initI18n = async (): Promise<typeof i18n> => {
  const initialLanguage = getInitialLanguage();
  document.documentElement.lang = initialLanguage;
  const initialTranslation = await fetchLocale(initialLanguage);

  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      resources: {
        [initialLanguage]: { translation: initialTranslation },
      },
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });

    i18n.on('languageChanged', (lng) => {
      localStorage.setItem(STORAGE_KEY, lng);
      document.documentElement.lang = lng;

      const nextLanguage = lng as AppLanguage;
      if (nextLanguage !== 'en' && nextLanguage !== 'vi') {
        return;
      }

      if (i18n.hasResourceBundle(nextLanguage, 'translation')) {
        return;
      }

      void fetchLocale(nextLanguage).then((translation) => {
        i18n.addResourceBundle(nextLanguage, 'translation', translation, true, true);
      });
    });
  }

  return i18n;
};

export default i18n;
