import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { AdCard } from "@/components/ads/ad-card";
import { AdData } from "@/lib/schema/schema-ads";
import { TokenManager } from "@/lib/auth";
import { useAdNavigation } from "@/hooks/use-path-handlers";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { DataPagination } from "@/components/ui/data-pagination";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { ErrorState } from "@/components/Error";
import { useApiQuery } from "@/hooks/useApiQuery";
import { toast } from "@/hooks/use-toast";
import { handleApprove, handleReject } from "@/lib/helper-ad";

export default function PendingAds() {
  const { t, isRTL } = useLanguage();
  const [page, setPage] = useState<string>("1");
  const [limit, setLimit] = useState<string>("5");
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());

  const { handleViewAd } = useAdNavigation();

  const {
    data: ads,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    key: ["/ads/pending", page, limit],
    url: `${VITE_API_BASE_URL}/api/advertising/list?page=${page}&limit=${limit}&status=pending`,
  });

  const pendingAds = Array.isArray(ads?.data) ? (ads?.data as AdData[]) : [];

  const token = TokenManager.getAccessToken();

  // Enhanced approve handler with loading state
  const handleApproveWithLoading = async (adId: string) => {
    setLoadingActions((prev) => new Set(prev).add(`approve-${adId}`));
    try {
      await handleApprove(adId, isRTL, refetch);
    } finally {
      setLoadingActions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(`approve-${adId}`);
        return newSet;
      });
    }
  };

  // Enhanced reject handler with loading state
  const handleRejectWithLoading = async (adId: string) => {
    setLoadingActions((prev) => new Set(prev).add(`reject-${adId}`));
    try {
      await handleReject(adId, isRTL, refetch);
    } finally {
      setLoadingActions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(`reject-${adId}`);
        return newSet;
      });
    }
  };

  if (isLoading) {
    <Loading />;
  }
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
      <div className="flex-1 overflow-auto">
        <Header
          title={t("pendingAds", "title")}
          description={t("pendingAds", "description")}
          //   actions={
          //   <div className="flex items-center gap-2">
          //     <Button onClick={handleCreateAd}>
          //       <i className="fas fa-plus mr-2"></i>
          //       {t("ads", "createAd")}
          //     </Button>
          //   </div>
          // }
        />

        <main className="p-6">
          {isLoading ? (
            <div className="min-h-[74vh]">
              <Loading />
            </div>
          ) : pendingAds.length > 0 ? (
            <div className="min-h-[74vh]">
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingAds.map((ad: AdData) => (
                  <AdCard
                    key={ad.id}
                    ad={ad}
                    language={isRTL ? "ar" : "en"}
                    onView={handleViewAd}
                    onApprove={() => handleApproveWithLoading(ad.id)}
                    onReject={() => handleRejectWithLoading(ad.id)}
                    isLoading={
                      loadingActions.has(`approve-${ad.id}`) ||
                      loadingActions.has(`reject-${ad.id}`)
                    }
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="min-h-[74vh]">
              <div className="text-center py-12">
                <i className="fas fa-hourglass-half text-6xl text-yellow-500 mb-6"></i>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("pendingAds", "emptyTitle")}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("pendingAds", "emptyDescription")}
                </p>
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
