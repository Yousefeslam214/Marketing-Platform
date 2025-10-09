import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "./sidebar";
import { TokenManager } from "@/lib/auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import PublicHeader from "./publicHeader";
import PublicFooter from "./publicFooter";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: AppLayoutProps) {
  const { user, isLoading } = useAuth();
  const { language, dir, toggleLanguage, isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div
        className={`min-h-screen bg-background flex items-center justify-center ${dir}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, show sidebar + content layout

  // If user is not authenticated, show content without sidebar
  return (
    // <div className={`min-h-screen bg-background ${dir}`} dir={dir}>
    <>
      <PublicHeader />
      {children}
      <PublicFooter />
    </>
    // </div>
  );
}
