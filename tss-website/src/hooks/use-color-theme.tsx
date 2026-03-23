"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ColorTheme = "ocean" | "crimson" | "emerald" | "violet" | "amber";

interface ColorThemeContextType {
  theme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ColorTheme>("ocean");

  useEffect(() => {
    let savedTheme = localStorage.getItem("color-theme") as string;
    if (savedTheme === "default") savedTheme = "ocean";
    
    if (savedTheme && ["ocean", "crimson", "emerald", "violet", "amber"].includes(savedTheme)) {
      setThemeState(savedTheme as ColorTheme);
      applyThemeToElement(savedTheme as ColorTheme);
    } else {
      applyThemeToElement("ocean");
    }
  }, []);

  const applyThemeToElement = (newTheme: ColorTheme) => {
    const root = document.documentElement;
    // Remove all possible theme classes
    const themes: ColorTheme[] = ["ocean", "crimson", "emerald", "violet", "amber"];
    themes.forEach(t => root.classList.remove(`theme-${t}`));
    
    root.classList.add(`theme-${newTheme}`);
    
    // We no longer want useSectionTheme to override colors, so we don't need to manage --color-general-current here
    // The CSS classes in globals.css will handle --color-general-current
  };

  const setTheme = (newTheme: ColorTheme) => {
    applyThemeToElement(newTheme);
    localStorage.setItem("color-theme", newTheme);
    setThemeState(newTheme);
  };

  return (
    <ColorThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
}
