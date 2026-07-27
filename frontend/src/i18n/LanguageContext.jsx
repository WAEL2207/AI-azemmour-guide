import { createContext, useContext, useEffect, useState } from "react";
import { STRINGS } from "./strings.js";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem("lang") || "fr");

  useEffect(() => {
    localStorage.setItem("lang", language);
    document.documentElement.lang = language;
  }, [language]);

  const value = { language, setLanguage, strings: STRINGS[language] };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage doit etre utilise dans un LanguageProvider");
  return ctx;
}
