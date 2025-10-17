import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";
import { useLanguage } from "@/hooks/use-language";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggleTheme}
      className="flex-1 flex items-center justify-center gap-2"
      data-testid="theme-toggle"
    >
      <i className={theme === "dark" ? "fas fa-sun" : "fas fa-moon"}></i>
      <span className="text-xs">
        {theme === "dark" ? t("themeToggle", "light") : t("themeToggle", "dark")}
      </span>
    </Button>
  );
}
