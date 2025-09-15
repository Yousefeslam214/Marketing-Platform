import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function LanguageToggle() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "en";
  });

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", language);
    html.setAttribute("dir", language === "ar" ? "rtl" : "ltr");
    localStorage.setItem("language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "ar" : "en");
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggleLanguage}
      className="flex-1 flex items-center justify-center gap-2"
      data-testid="language-toggle"
    >
      <i className="fas fa-globe"></i>
      <span className="text-xs">
        {language === "en" ? "العربية" : "English"}
      </span>
    </Button>
  );
}
