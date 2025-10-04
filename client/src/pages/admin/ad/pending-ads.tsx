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

export default function PendingAds() {
  const [, setLocation] = useLocation();
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
    key: ["/ads/pending", page, limit],
    url: `${VITE_API_BASE_URL}/api/advertising/list?page=${page}&limit=${limit}&status=pending`,
  });

  const pendingAds = Array.isArray(ads?.data) ? (ads?.data as AdData[]) : [];

  console.log(pendingAds);
  const token = TokenManager.getAccessToken();
  const handleApprove = async (id: string) => {
    const res = await fetch(
      `${VITE_API_BASE_URL}/api/advertising/${id}/approve`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (res.ok) {
      toast({ title: isRTL ? "تمت الموافقة على الإعلان" : "Ad approved" });
      refetch();
    } else {
      toast({
        title: isRTL ? "فشل في الموافقة على الإعلان" : "Failed to approve ad",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    const res = await fetch(
      `${VITE_API_BASE_URL}/api/advertising/${id}/reject`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (res.ok) {
      toast({ title: isRTL ? "تم رفض الإعلان" : "Ad rejected" });
      refetch();
    } else {
      toast({
        title: isRTL ? "فشل في رفض الإعلان" : "Failed to reject ad",
        variant: "destructive",
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
                <>
                  <AdCard
                    key={ad.id}
                    ad={ad}
                    language={isRTL ? "ar" : "en"}
                    onView={handleViewAd}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                </>
              ))}
            </div>
            </div>
          ) : (
                 <div className="min-h-[74vh]">
          
            <div className="text-center py-12">
              <i className="fas fa-hourglass-half text-6xl text-yellow-500 mb-6"></i>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isRTL ? "لا توجد إعلانات معلقة بعد" : "No pending ads yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {isRTL
                  ? "ستظهر الإعلانات التي ترسلها للمراجعة هنا حتى يتم الموافقة عليها أو رفضها."
                  : "Ads you submit for review will appear here until they are approved or rejected."}
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
