"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, BaseTranslations } from "../lib/translations";

// Lista dostępnych języków (domyślnie: polski)
export type Language = keyof typeof translations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: ReturnType<typeof translations>;
  availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pl");

  useEffect(() => {
    // Ładuj zapisany język - obsługuj wszystkie dostępne języki
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && savedLanguage in translations) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    localStorage.setItem("language", newLang);
    setLanguageState(newLang);
  };

  // Pobierz dostępne języki
  const availableLanguages = Object.keys(translations) as Language[];

  const contextValue = {
    language,
    setLanguage,
    t: translations[language] || translations.pl,
    availableLanguages,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
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

// Funkcja pomocnicza do łatwego dodawania nowych języków
export function addTranslation(locale: string, translationsObject: BaseTranslations) {
  // Sprawdź czy język nie jest już dodany
  if (typeof window !== "undefined") {
    const existing = (window as any).__TSS_TRANSLATIONS__?.[locale];
    if (existing) {
      console.warn(`Język ${locale} jest już dodany`);
      return existing;
    }
  }

  // Dynamicznie dodaj tłumaczenia
  if (typeof window !== "undefined") {
    if (!(locale in translations)) {
      (window as any).__TSS_TRANSLATIONS__ = (window as any).__TSS_TRANSLATIONS__ || {};
      (window as any).__TSS_TRANSLATIONS__[locale] = translationsObject;

      // Opcjonalnie: dodaj do globalnych tłumaczeń (wymaga ponownego ładowania strony)
      const newTranslations = {
        ...translations,
        [locale]: translationsObject,
      };

      // Zaktualizuj globalny obiekt tłumaczeń
      Object.defineProperty(globalThis, "translations", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: newTranslations,
      });
    }
  }

  return translationsObject;
}
