import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useLocation } from "wouter";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  const { language, toggleLanguage, dir, isRTL } = useLanguage();

  return (
    <header
      className="bg-card border-b border-border px-6 py-4
      h-[97px]
      
      "
      data-testid="page-header">
      <div
        className={` items-center justify-between 
        flex flex-row
        `}>
        <div className={isRTL ? "text-right" : "text-left"}>
          <h2
            className="text-2xl font-bold text-foreground"
            data-testid="page-title">
            {title}
          </h2>
          {description && (
            <p
              className="text-sm text-muted-foreground"
              data-testid="page-description">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div
            className={`flex items-center gap-4 ${
              isRTL ? "flex-row-reverse" : "flex-row"
            }`}
            data-testid="page-actions">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
