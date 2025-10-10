import { useContext, useEffect } from "react";
import {
  getTranslation,
  type TranslationSection,
  type TranslationKey,
} from "@/lib/i18n";
import { LanguageContext } from "@/contexts/language-context";

export function useLanguage() {
  const ctx = useContext(LanguageContext);

  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  const { language, setLanguage, toggleLanguage, dir, isRTL } = ctx;

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", language);
    html.setAttribute("dir", dir);
  }, [language, dir]);

  // Accept string keys (including dot-paths) for flexibility across the codebase.
  const t = (section: TranslationSection, key: string): string => {
    return getTranslation(language, section, key as any);
  };

  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
    dir,
    isRTL,
  };
}
