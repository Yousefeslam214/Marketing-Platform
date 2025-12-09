// language-context.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getTranslation } from "@/lib/i18n";

export type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (section: string, key: string) => string;
  dir: "ltr" | "rtl";
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem("language");
    return stored === "ar" || stored === "en" ? stored : "ar";
  });

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", language);
    html.setAttribute("dir", language === "ar" ? "rtl" : "ltr");

    localStorage.setItem("language", language);

    // Dispatch custom event for other components to listen
    window.dispatchEvent(
      new CustomEvent("languageChange", { detail: language })
    );
  }, [language]);

  const toggleLanguage = () => {
    if (language === "en") {
      setLanguage("ar");
      localStorage.setItem("language", "ar");
    } else {
      setLanguage("en");
      localStorage.setItem("language", "en");
    }
    // window.location.reload();
  };

  const t = useCallback(
    (section: string, key: string): string => {
      return getTranslation(language, section, key);
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        dir: language === "ar" ? "rtl" : "ltr",
        isRTL: language === "ar",
      }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}

export { LanguageContext };
