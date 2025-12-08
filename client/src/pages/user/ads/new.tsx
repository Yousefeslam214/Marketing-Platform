import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
// import { AdEditor } from "@/components/ads/ad-editor";
import { TokenManager } from "@/lib/auth";
import { useLanguage } from "@/hooks/use-language";
import { AdEditor } from "@/components/ads/create/ad-editor";

export default function NewAd() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  if (!TokenManager.getAccessToken()) {
    setLocation("/login");
    return null;
  }

  return (
    <>
      <Header
        title={t("ads", "newAd.title")}
        description={t("ads", "newAd.description")}
      />

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <AdEditor />
        </div>
      </div>
    </>
  );
}
