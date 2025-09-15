import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4" data-testid="page-header">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="page-title">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground" data-testid="page-description">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-4" data-testid="page-actions">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
