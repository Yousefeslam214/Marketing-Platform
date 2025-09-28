import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { AdCard } from "@/components/ads/ad-card";
import { AdData } from "@/lib/schema/schema-ads";
import { useAdNavigation } from "@/hooks/use-path-handlers";
import { VITE_API_BASE_URL } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";
import { ErrorState } from "@/components/Error";
import Loading from "@/components/Loading";
import { useApiQuery } from "@/hooks/useApiQuery";

export default function RejectedAds() {
  const { t, isRTL } = useLanguage();
  const [page, setPage] = useState(1);
  const limit = 5;

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

        <main className="p-6">
          {isLoading ? (
            <Loading />
          ) : rejectedAds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
              {rejectedAds.map((ad: AdData) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  language={isRTL ? "ar" : "en"}
                  onView={handleViewAd}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-times-circle text-6xl text-red-500 mb-6"></i>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No rejected ads yet
              </h3>
              <p className="text-muted-foreground mb-6">
                If your ads are rejected, they will appear here with rejection
                reasons.
              </p>
            </div>
          )}

          {ads?.data?.pagination && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      ads.data.pagination.hasPrevious && setPage((p) => p - 1)
                    }
                    className={
                      !ads.data.pagination.hasPrevious
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>

                {/* Page numbers */}
                {Array.from(
                  { length: ads.data.pagination.totalPages },
                  (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={ads.data.pagination.currentPage === i + 1}
                        onClick={() => setPage(i + 1)}>
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      ads.data.pagination.hasNext && setPage((p) => p + 1)
                    }
                    className={
                      !ads.data.pagination.hasNext
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </main>
      </div>
    </div>
  );
}
