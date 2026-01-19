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
import { DeleteAdDialog } from "@/components/ads/delete-ad-dialog";
import { Input } from "@/components/ui/input";

export default function ApprovedAds() {
  const { t, isRTL } = useLanguage();
  const [page, setPage] = useState<string>("1");
  const [limit, setLimit] = useState<string>("5");
  const [titleFilter, setTitleFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<string | null>(null);

  const {
    handleCreateAd,
    handleViewAd,
    handleEditAd,
    handleAnalytics,
    handlePurchase,
  } = useAdNavigation();

  const handleDeleteAd = (adId: string) => {
    setAdToDelete(adId);
    setDeleteDialogOpen(true);
  };

  const handleTitleChange = (value: string) => {
    setTitleFilter(value);
    setPage("1");
  };

  const handleEmailChange = (value: string) => {
    setEmailFilter(value);
    setPage("1");
  };

  const queryParams = new URLSearchParams({
    page,
    limit,
    status: "approved",
  });

  if (titleFilter.trim()) {
    queryParams.set("title", titleFilter.trim());
  }

  if (emailFilter.trim()) {
    queryParams.set("email", emailFilter.trim());
  }

  const {
    data: ads,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    key: ["/ads/approved", page, limit, titleFilter, emailFilter],
    url: `${VITE_API_BASE_URL}/api/advertising/list?${queryParams.toString()}`,
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
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="w-full md:max-w-sm">
              <Input
                type="search"
                placeholder={
                  isRTL ? "ابحث بالعنوان التجاري" : "Search by title"
                }
                value={titleFilter}
                onChange={(event) => handleTitleChange(event.target.value)}
              />
            </div>
            <div className="w-full md:max-w-sm">
              <Input
                type="search"
                placeholder={
                  isRTL ? "ابحث بالبريد الإلكتروني" : "Search by email"
                }
                value={emailFilter}
                onChange={(event) => handleEmailChange(event.target.value)}
              />
            </div>
          </div>
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
                    onDelete={handleDeleteAd}
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

        <DeleteAdDialog
          adId={adToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      </div>
    </div>
  );
}
