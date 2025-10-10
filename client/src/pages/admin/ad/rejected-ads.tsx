import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { AdCard } from "@/components/ads/ad-card";
import { AdData } from "@/lib/schema/schema-ads";
import { useAdNavigation } from "@/hooks/use-path-handlers";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { DataPagination } from "@/components/ui/data-pagination";
import { useState } from "react";
import { ErrorState } from "@/components/Error";
import Loading from "@/components/Loading";
import { useApiQuery } from "@/hooks/useApiQuery";

export default function RejectedAds() {
  const { t, isRTL } = useLanguage();
  const [page, setPage] = useState<string>("1");
  const [limit, setLimit] = useState<string>("5");

  const { handleViewAd } = useAdNavigation();

  const {
    data: ads,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    key: ["/ads/rejected", page, limit],
    url: `${VITE_API_BASE_URL}/api/advertising/list?page=${page}&limit=${limit}&status=rejected`,
  });

  if (isLoading) {
    return <Loading />;
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

  // Filter rejected ads
  const rejectedAds = Array.isArray(ads?.data) ? (ads?.data as AdData[]) : [];

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto">
        <Header
          title={t("rejectedAds", "title")}
          description={t("rejectedAds", "description")}
        />

        <main className="p-6 ">
          {isLoading ? (
            <div className="min-h-[74vh]">
              <Loading />
            </div>
          ) : rejectedAds.length > 0 ? (
            <div className="min-h-[74vh]">
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 ">
                {rejectedAds.map((ad: AdData) => (
                  <AdCard
                    key={ad.id}
                    ad={ad}
                    language={isRTL ? "ar" : "en"}
                    onView={handleViewAd}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="min-h-[74vh]">
              <div className="text-center py-12">
                <i className="fas fa-times-circle text-6xl text-red-500 mb-6"></i>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("rejectedAds", "emptyTitle")}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("rejectedAds", "emptyDescription")}
                </p>
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
