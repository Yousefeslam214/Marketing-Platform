import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "./sidebar";
import { TokenManager } from "@/lib/auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isLoading, user } = useAuth();
  const { isRTL, t } = useLanguage();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Debug authentication in AppLayout
  console.log("AppLayout - Token:", TokenManager.getAccessToken());
  console.log("AppLayout - User:", user);
  console.log("AppLayout - Is loading:", isLoading);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div
        className={`min-h-screen bg-background flex items-center justify-center ${isRTL}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, show sidebar + content layout
  if (TokenManager.getAccessToken()) {
    return (
      <div className={`min-h-screen bg-background flex ${isRTL}`}>
        {/* Desktop sidebar - always visible */}
        {!isMobile && <Sidebar isOpen={true} onClose={() => {}} />}

        {/* Mobile sidebar - overlay when open */}
        {isMobile && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1">
          {/* Mobile menu toggle */}
          {isMobile && (
            <div
              className={`sticky top-0 z-30 bg-background  border-b px-4 py-3 
               
                ${isRTL ? "text-right" : "text-left"}`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSidebarOpen(true);
                }}
                className="md:hidden">
                <i className={`fas fa-bars ${isRTL ? "ml-2" : "mx-2"}`}></i>
                {t("layout", "menu")}
              </Button>
              {/* <span className="text-xs text-muted-foreground ml-2">
                Mobile: {isMobile ? "Yes" : "No"} | Sidebar:{" "}
                {sidebarOpen ? "Open" : "Closed"}
              </span> */}
            </div>
          )}
          <div className={`px-6 ${isRTL}`}>{children}</div>
        </main>
      </div>
    );
  }

  // If user is not authenticated, show content without sidebar
  return (
    <div className={`min-h-screen bg-background ${isRTL}`}>{children}</div>
  );
}
