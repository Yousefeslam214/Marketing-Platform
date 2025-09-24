import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "./sidebar";
import { TokenManager } from "@/lib/auth";
import { useLanguage } from "@/hooks/use-language";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isLoading } = useAuth();
  const {  language , direction ,  toggleLanguage ,  setDirection } = useLanguage();

 
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div
        className={`min-h-screen bg-background flex items-center justify-center ${
          direction
        }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, show sidebar + content layout
  if (TokenManager.getAccessToken()) {
    return (
      <div
        className={`min-h-screen bg-background flex ${
      direction
        }`}
        dir={direction}>
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className={`p-6 ${direction}`}>
            {children}
          </div>
        </main>
      </div>
    );
  }

  // If user is not authenticated, show content without sidebar
  return (
    <div
      className={`min-h-screen bg-background ${
        direction
      }`}
      dir={direction}>
      {children}
    </div>
  );
}
