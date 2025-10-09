import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/language-context";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLang();


  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggleLanguage}
      className="flex-1 flex items-center justify-center gap-2"
      data-testid="language-toggle">
      <i className="fas fa-globe"></i>
      <span className="text-xs">
        {language === "en" ? "العربية" : "English"}
      </span>
    </Button>
  );
}
