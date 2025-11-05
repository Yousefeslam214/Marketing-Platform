import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { AdCard } from "@/components/ads/ad-card";
import { AdData } from "@/lib/schema/schema-ads";
import { TokenManager } from "@/lib/auth";
import { useAdNavigation } from "@/hooks/use-path-handlers";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { DataPagination } from "@/components/ui/data-pagination";
import { useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import Loading from "@/components/Loading";
import { ErrorState } from "@/components/Error";

export default function AllAds() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const [page, setPage] = useState<string>("1");
  const [limit, setLimit] = useState<string>("5");

  const { handleCreateAd, handleViewAd, handleEditAd } = useAdNavigation();

  const {
    data: ads,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    key: ["/ads/all", page, limit],
    url: `${VITE_API_BASE_URL}/api/advertising/list?page=${page}&limit=${limit}`,
  });

  if (!TokenManager.getAccessToken()) {
    setLocation("/login");
    return null;
  }

  // Get all ads from response
  const allAds = Array.isArray(ads?.data) ? (ads?.data as AdData[]) : [];

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto">
        <Header
          title={t("allAds", "title")}
          description={t("allAds", "description")}
          actions={
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateAd}>
                <i className="fas fa-plus mx-2"></i>
                {t("ads", "createAd")}
              </Button>
            </div>
          }
        />
        <main className="p-6">
          {isLoading ? (
            <div className="min-h-[74vh]">
              <Loading />
            </div>
          ) : error ? (
            <div className="min-h-[74vh]">
              <ErrorState
                title="Failed to load metrics"
                message={(error as Error)?.message || "Please try again later."}
                onRetry={() => refetch()}
                showHomeButton
                onHome={() => (window.location.href = "/")}
              />
            </div>
          ) : allAds.length > 0 ? (
            <div className="min-h-[74vh]">
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                {allAds.map((ad: AdData) => (
                  <div key={ad.id} className="relative">
                    <AdCard
                      ad={ad}
                      language={isRTL ? "ar" : "en"}
                      onView={handleViewAd}
                      onEdit={handleEditAd}
                      showActions={true}
                    />
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="min-h-[74vh]">
              <div className="text-center py-12">
                <i className="fas fa-ad text-6xl text-muted-foreground mb-6"></i>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {isRTL ? "لا توجد إعلانات بعد" : "No ads created yet"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {isRTL
                    ? "ابدأ بإنشاء أول إعلان لك لتبدأ حملاتك التسويقية"
                    : "Start by creating your first ad to begin your marketing campaigns"}
                </p>
                <Button onClick={handleCreateAd}>
                  <i className="fas fa-plus mx-2"></i>
                  {isRTL ? "إنشاء إعلان جديد" : "Create New Ad"}
                </Button>
              </div>
            </div>
          )}
          {ads?.pagination && (
            <DataPagination
              pagination={ads.pagination}
              currentPage={page}
              onPageChange={setPage}
              pageSize={limit}
              onPageSizeChange={setLimit}
              showPageSizeSelector={true}
              pageSizeOptions={[5, 10, 20, 50]}
              showInfo={true}
              className="mt-6"
            />
          )}
        </main>
      </div>
    </div>
  );
}
