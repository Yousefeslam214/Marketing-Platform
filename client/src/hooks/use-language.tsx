import { useState, useEffect } from "react";
import { getTranslation, type Language } from "@/lib/i18n";

export function useLanguage() {
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
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));
    window.location.reload();
  };

  const t = (section: string, key: string): string => {
    return getTranslation(language, section, key);
  };

  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
    dir: language === "ar" ? "rtl" : "ltr",
    isRTL: language === "ar",
  };
}
