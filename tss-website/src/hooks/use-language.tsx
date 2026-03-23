"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, TranslationKey } from "../lib/translations";

export type Language = "pl" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKey;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pl");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && (savedLanguage === "pl" || savedLanguage === "en")) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    localStorage.setItem("language", newLang);
    setLanguageState(newLang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
