import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import PublicHeader from "./publicHeader";
import PublicFooter from "./publicFooter";
import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: AppLayoutProps) {
  const {  isLoading } = useAuth();
  const { isRTL } = useLanguage();

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

  // If user is not authenticated, show content without sidebar
  return (
    // <div className={`min-h-screen bg-background ${isRTL}`} isRTL={isRTL}>
    <>
      <PublicHeader />
      {children}
      <PublicFooter />
    </>
    // </div>
  );
}
