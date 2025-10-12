import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { AdEditor } from "@/components/ads/ad-editor";
import { TokenManager } from "@/lib/auth";
import { useLanguage } from "@/hooks/use-language";

export default function NewAd() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();

  if (!TokenManager.getAccessToken()) {
    setLocation("/login");
    return null;
  }

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      {/* <Sidebar /> */}

      <div className="flex-1 overflow-auto">
        <Header
          title={t("ads", "newAd.title")}
          description={t("ads", "newAd.description")}
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
