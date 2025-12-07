import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./locales/en.json";
import hiTranslations from "./locales/hi.json";
import taTranslations from "./locales/ta.json";
import bnTranslations from "./locales/bn.json";
import knTranslations from "./locales/kn.json";

const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
  ta: { translation: taTranslations },
  bn: { translation: bnTranslations },
  kn: { translation: knTranslations },
};

// Always default to English, only use saved language if explicitly set
const savedLanguage = localStorage.getItem("app_language");
const defaultLanguage = savedLanguage && savedLanguage !== "undefined" ? savedLanguage : "en";

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

