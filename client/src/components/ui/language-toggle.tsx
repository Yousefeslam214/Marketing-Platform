import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

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
