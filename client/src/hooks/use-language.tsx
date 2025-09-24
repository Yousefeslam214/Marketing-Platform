import { useState, useEffect } from "react";
import {
  Language,
  getTranslation,
  TranslationSection,
  TranslationKey,
  translations,
} from "@/lib/translations";

// export function useLanguage() {
//   const [language, setLanguage] = useState<Language>(() => {
//     const stored = localStorage.getItem("language");
//     return stored === "ar" || stored === "en" ? stored : "en";
//   });

//   useEffect(() => {
//     const html = document.documentElement;
//     html.setAttribute("lang", language);
//     html.setAttribute("dir", language === "ar" ? "rtl" : "ltr");
//     localStorage.setItem("language", language);

//     // Dispatch custom event for other components to listen
//     window.dispatchEvent(
//       new CustomEvent("languageChange", { detail: language })
//     );
//   }, [language]);

//   const toggleLanguage = () => {
//     setLanguage((prev) => (prev === "en" ? "ar" : "en"));
//   };

//   const t = <T extends TranslationSection>(
//     section: T,
//     key: TranslationKey<T>
//   ) => {
//     return getTranslation(language, section, key);
//   };

//   return {
//     language,
//     setLanguage,
//     toggleLanguage,
//     t,
//     isRTL: language ,
//   };
// }

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem("language");
    return stored === "ar" || stored === "en" ? stored : "en";
  });
  
  const [direction, setDirection] = useState(() => {
    const storedLang = localStorage.getItem("language");
    return storedLang === "ar" ? "rtl" : "ltr";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    localStorage.setItem("direction", direction);
  }, [language, direction]);

  const toggleLanguage = () => {
    if (language === "en") {
      setLanguage("ar");
      setDirection("rtl");
    } else {
      setLanguage("en");
      setDirection("ltr");
    }
    window.location.reload();
  };

  const t = <T extends TranslationSection>(
    section: T,
    key: TranslationKey<T>
  ) => {
    return getTranslation(language, section, key);
  };

  return { 
    language, 
    toggleLanguage, 
    direction, 
    setDirection, 
    t,
    isRTL: direction === 'rtl'
  };
}
