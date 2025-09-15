import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AdEditor } from "@/components/ads/ad-editor";

export default function NewAd() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <Header
          title="Create New Ad"
          description="Design and configure your advertising campaign"
        />

        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <AdEditor />
          </div>
        </main>
      </div>
    </div>
  );
}
