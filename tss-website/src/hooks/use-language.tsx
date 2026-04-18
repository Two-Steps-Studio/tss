"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { translations, BaseTranslations } from "../lib/translations";

// Lista dostępnych języków (domyślnie: polski)
export type Language = keyof typeof translations;

// Lista domyślnych języków dla dropdown menu
export const defaultLanguages = ["pl", "en", "de", "ru", "es", "fr", "it"] as const;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: ReturnType<typeof translations>;
  availableLanguages: Language[];
  importTranslations: (data: string) => Promise<void>;
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
    }
  }

  return translationsObject;
}

// Importuj tłumaczenia z JSON
export async function importTranslations(data: string): Promise<void> {
  try {
    // Parse JSON
    const translationsObject = JSON.parse(data) as BaseTranslations;

    // Sprawdź czy zawiera wymagane pola
    if (!translationsObject.settings?.title || !translationsObject.nav?.home) {
      console.warn("Importowane tłumaczenia są niekompletne");
      console.log("Importowane tłumaczenia:", translationsObject);
      throw new Error("Brak wymaganych pól w tłumaczeniach");
    }

    // Dodaj nowy język do tłumaczeń (nie usuwamy istniejących)
    const newLocale = Object.keys(translationsObject)[0] as Language;
    if (newLocale && !(newLocale in translations)) {
      (translations as any)[newLocale] = translationsObject[newLocale] || translationsObject;
      console.log(`Tłumaczenie dla języka ${newLocale} zostało dodane`);
    } else if (newLocale in translations) {
      console.warn(`Język ${newLocale} już istnieje, nie jest dodawany`);
    }

    // Przeładuj stronę
    window.location.reload();
  } catch (error) {
    console.error("Błąd podczas importu tłumaczeń:", error);
    throw new Error(`Import nie powiódł się: ${error}`);
  }
}
