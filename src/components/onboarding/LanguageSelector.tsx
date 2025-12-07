import { motion } from "framer-motion";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/hooks/useLanguage";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export function LanguageSelector() {
  const { changeLanguage, currentLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          {t("onboarding.language.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("onboarding.language.subtitle")}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {SUPPORTED_LANGUAGES.map((lang, index) => {
          const isSelected = currentLanguage === lang.code;
          return (
            <motion.div
              key={lang.code}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                variant={isSelected ? "gradient" : "default"}
                className={`cursor-pointer transition-all h-full ${
                  isSelected
                    ? "border-primary border-2 shadow-lg"
                    : "hover:border-primary/50"
                }`}
                onClick={() => changeLanguage(lang.code)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">
                    {lang.code === "en" && "🇬🇧"}
                    {lang.code === "hi" && "🇮🇳"}
                    {lang.code === "ta" && "🇮🇳"}
                    {lang.code === "bn" && "🇧🇩"}
                    {lang.code === "kn" && "🇮🇳"}
                  </div>
                  <div className="font-bold text-lg text-foreground mb-1">
                    {lang.nativeName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {lang.name}
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary-foreground mx-auto flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

