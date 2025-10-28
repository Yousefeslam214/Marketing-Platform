import { useLanguage } from "@/hooks/use-language";
import { ReactNode } from "react";
import MetaPixel from "@/components/analytics/MetaPixel";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  const {  isRTL } = useLanguage();

  return (
    <>
      <MetaPixel />
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
    </>
  );
}
