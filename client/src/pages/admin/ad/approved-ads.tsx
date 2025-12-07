import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { AdCard, type AdData } from "@/components/ads/ad-card";
import { useAdNavigation } from "@/hooks/use-path-handlers";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { DataPagination } from "@/components/ui/data-pagination";
import { useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import Loading from "@/components/Loading";
import { ErrorState } from "@/components/Error";

export default function ApprovedAds() {
  const { t, isRTL } = useLanguage();
  const [page, setPage] = useState<string>("1");
  const [limit, setLimit] = useState<string>("5");

  const {
    handleCreateAd,
    handleViewAd,
    handleEditAd,
    handleAnalytics,
    handlePurchase,
  } = useAdNavigation();

  const {
    data: ads,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    key: ["/ads/approved", page, limit],
    url: `${VITE_API_BASE_URL}/api/advertising/list?page=${page}&limit=${limit}&status=approved`,
  });

  // Filter approved ads and type safely
  const approvedAds = Array.isArray(ads?.data) ? (ads?.data as AdData[]) : [];

  if (error) {
    return (
      <div className="flex flex-center justify-center h-screen bg-background">
        <ErrorState
          title="Failed to load metrics"
          message={(error as Error)?.message || "Please try again later."}
          onRetry={() => refetch()}
          showHomeButton
          onHome={() => (window.location.href = "/")} // or use your router
        />
      </div>
    );
  }
  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto max-h-[100vh]">
        <Header
          title={t("approvedAds", "title")}
          description={t("approvedAds", "description")}
          actions={
            <Button onClick={handleCreateAd} data-testid="button-create-ad">
              <i className={`fas fa-plus ${isRTL ? "ml-2" : "mx-2"}`}></i>
              {t("ads", "createAd")}
            </Button>
          }
        />

        <main className="p-6 mt-24">
          {isLoading ? (
            <div className="min-h-[74vh] ">
              <Loading />
            </div>
          ) : approvedAds.length > 0 ? (
            <div className="min-h-[74vh] ">
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                {approvedAds.map((ad: AdData) => (
                  <AdCard
                    key={ad.id}
                    ad={ad}
                    language={isRTL ? "ar" : "en"}
                    onView={handleViewAd}
                    onEdit={handleEditAd}
                    onAnalytics={handleAnalytics}
                    onPurchase={handlePurchase}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="min-h-[74vh] mt-24">
              <div className="text-center py-12">
                <i className="fas fa-check-circle text-6xl text-blue-500 mb-6"></i>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("approvedAds", "emptyTitle")}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("approvedAds", "emptyDescription")}
                </p>
                <Button
                  onClick={handleCreateAd}
                  data-testid="button-create-first-ad">
                  <i className="fas fa-plus mx-2"></i>
                  {t("ads", "createFirstAd")}
                </Button>
              </div>
            </div>
          )}

          {ads?.pagination && (
            <DataPagination
              pagination={ads?.pagination}
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
