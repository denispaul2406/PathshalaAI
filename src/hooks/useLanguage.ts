import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]["code"];

export function useLanguage() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem("app_language");
    // Ensure default is always English
    return (saved && saved !== "undefined" ? saved : "en") as LanguageCode;
  });

  useEffect(() => {
    const saved = localStorage.getItem("app_language");
    if (saved) {
      i18n.changeLanguage(saved);
      setCurrentLanguage(saved as LanguageCode);
    }
  }, [i18n]);

  const changeLanguage = (lang: LanguageCode) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("app_language", lang);
    setCurrentLanguage(lang);
  };

  return {
    currentLanguage,
    changeLanguage,
    languages: SUPPORTED_LANGUAGES,
  };
}

