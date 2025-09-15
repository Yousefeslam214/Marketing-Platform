import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

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
        {theme === "dark" ? "Light" : "Dark"}
      </span>
    </Button>
  );
}
