import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { AdCard, type AdData } from "@/components/ads/ad-card";
import { TokenManager } from "@/lib/auth";
import { useAdNavigation } from "@/hooks/use-path-handlers";
import { VITE_API_BASE_URL } from "@/lib/utils";
// import { useState } from "node_modules/react-resizable-panels/dist/declarations/src/vendor/react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";

export default function ApprovedAds() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const [page, setPage] = useState(1);
  const limit = 5;

  const {
    handleCreateAd,
    handleViewAd,
    handleEditAd,
    handleAnalytics,
    handlePurchase,
  } = useAdNavigation();

  const { data: ads, isLoading } = useQuery({
    queryKey: ["/ads/approved", 1, 5],
    queryFn: async () => {
      const token = TokenManager.getAccessToken();
      const res = await fetch(
        `${VITE_API_BASE_URL}/api/advertising/list/approved?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch approved ads");
      return res.json();
    },
    enabled: !!TokenManager.getAccessToken(),
  });
  console.log("Approved ads data:", ads);
  if (!TokenManager.getAccessToken()) {
    setLocation("/login");
    return null;
  }

  // Filter approved ads and type safely
  const approvedAds = Array.isArray(ads?.data?.data)
    ? (ads?.data?.data as AdData[])
    : [];

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto">
        <Header
          title={t("approvedAds", "Approved Ads") || "Approved Ads"}
          description={
            t(
              "approvedAds",
              "Your approved advertising campaigns ready for publishing"
            ) || "Your approved advertising campaigns ready for publishing"
          }
          actions={
            <Button onClick={handleCreateAd} data-testid="button-create-ad">
              <i className={`fas fa-plus ${isRTL ? "ml-2" : "mr-2"}`}></i>
              {t("ads", "createAd") || "Create New Ad"}
            </Button>
          }
        />

        <main className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : approvedAds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-check-circle text-6xl text-blue-500 mb-6"></i>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No approved ads yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Your approved ads will appear here. They are ready for
                publishing and impression purchases.
              </p>
              <Button
                onClick={handleCreateAd}
                data-testid="button-create-first-ad">
                <i className="fas fa-plus mr-2"></i>
                Create Your First Ad
              </Button>
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
