import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
// import { AdEditor } from "@/components/ads/ad-editor";
import { TokenManager } from "@/lib/auth";
import { useLanguage } from "@/hooks/use-language";
import { AdEditor } from "@/components/ads/create/ad-editor";

export default function NewAd() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();

  if (!TokenManager.getAccessToken()) {
    setLocation("/login");
    return null;
  }

  return (
    <div className={`min-h-screen flex bg-background ${isRTL ? "rtl" : "ltr"}`}>
      {/* content column */}
      <div className="flex-1 flex flex-col">
        <Header
          title={t("ads", "newAd.title")}
          description={t("ads", "newAd.description")}
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto h-full">
            <AdEditor />
          </div>
        </main>
      </div>
    </div>
  );
}
