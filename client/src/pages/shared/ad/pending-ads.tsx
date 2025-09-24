import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { AdCard, type AdData } from "@/components/ads/ad-card";
import { TokenManager } from "@/lib/auth";
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

export default function PendingAds() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const [page, setPage] = useState(1);
  const limit = 5;

  const { handleViewAd } = useAdNavigation();

  const { data: ads, isLoading } = useQuery({
    queryKey: ["/ads/pending", page, limit],
    queryFn: async () => {
      const token = TokenManager.getAccessToken();
      const res = await fetch(
        `${VITE_API_BASE_URL}/api/advertising/list/pending?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch pending ads");
      return res.json();
    },
    enabled: !!TokenManager.getAccessToken(),
  });

  if (!TokenManager.getAccessToken()) {
    setLocation("/login");
    return null;
  }

  // Filter pending ads
  const pendingAds = Array.isArray(ads?.data?.data)
    ? (ads?.data?.data as AdData[])
    : [];

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto">
        <Header
          title={t("pendingAds", "Pending Ads") || "Pending Ads"}
          description={
            t(
              "pendingAds",
              "Your ads waiting for review before approval or rejection"
            ) || "Your ads waiting for review before approval or rejection"
          }
        />

        <main className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : pendingAds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingAds.map((ad: AdData) => (
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
              <i className="fas fa-hourglass-half text-6xl text-yellow-500 mb-6"></i>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No pending ads yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Ads you submit for review will appear here until they are
                approved or rejected.
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
