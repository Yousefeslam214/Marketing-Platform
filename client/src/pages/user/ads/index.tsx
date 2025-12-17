import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, VITE_API_BASE_URL } from "@/lib/utils";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useState } from "react";
import { editAdPath } from "@/lib/paths";
import DataPagination from "@/components/ui/data-pagination";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { DeleteAdDialog } from "@/components/ads/delete-ad-dialog";

export default function AdsIndex() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();

  const [page, setPage] = useState<string>("1");
  const [limit, setLimit] = useState<string>("20");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<string | null>(null);

  const { data: ads, isLoading } = useApiQuery({
    key: ["/api/ads/user", page, limit],
    url: `${VITE_API_BASE_URL}/api/advertising/list?page=${page}&limit=${limit}`,
  });
  // Type-safe ads array
  const safeAds = (ads?.data as any[]) || [];

  const handleDeleteAd = (adId: string) => {
    setAdToDelete(adId);
    setDeleteDialogOpen(true);
  };

  console.log(safeAds);
  console.log("index.tsx");

  const handleCreateAd = () => {
    setLocation("/campaigns/new");
  };

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto max-h-[100vh]">
        <Header
          title={t("ads", "title")}
          description={t("ads", "description")}
          actions={
            <Button onClick={handleCreateAd} data-testid="button-create-ad">
              <i className={`fas fa-plus ${isRTL ? "ml-2" : "mx-2"}`}></i>
              {t("ads", "createAd")}
            </Button>
          }
        />
        <main className="p-6 min-h-[78vh] mt-24">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : safeAds.length > 0 ? (
            // grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6
            <div
              className="  flex flex-col w-[80%] justify-center 
            items-center mx-auto
            
            gap-6
              ">
              <div
                className="
                  w-full
                  columns-1 md:columns-2
                  space-y-4">
                {safeAds.map((ad: any) => (
                  <Card
                    key={ad.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-semibold text-foreground truncate"
                            data-testid={`ad-title-${ad.id}`}>
                            {ad.titleEn || ad.titleAr || t("ads", "title")}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {ad.descriptionEn || ad.descriptionAr || "-"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(ad.status)}>
                            {ad.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="min-h-38">
                        {(ad.imageUrl && ad.imageUrl.length > 0) ||
                        ad.youtubeVideo ? (
                          // Array.isArray(ad.imageUrl)
                          <ImageCarousel
                            images={
                              Array.isArray(ad.imageUrl)
                                ? ad.imageUrl
                                : ad.imageUrl
                                ? [ad.imageUrl]
                                : []
                            }
                            videoUrl={ad.youtubeVideo}
                            alt={ad.titleEn || ad.titleAr}
                            dataTestId={`ad-image-${ad.id}`}
                          />
                        ) : (
                          <div className="w-full h-40 bg-slate-50 dark:bg-slate-800 rounded-lg mb-4 flex items-center justify-center border border-border">
                            <div className="text-center text-muted-foreground">
                              <i className="fas fa-image text-2xl mb-2 block"></i>
                              <div className="text-sm">
                                {t("ads", "noImage") || "No image"}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div
                        className="grid grid-cols-4 gap-4 text-sm text-muted-foreground
                    mx-2 my-4 
                    ">
                        <div className="!flex !flex-col !items-center">
                          <div className="text-xs">
                            {t("ads", "impressions") || "Impressions"}
                          </div>
                          <div className="font-medium">
                            {ad.impressionsCredit?.toLocaleString?.() ??
                              ad.totalImpressions ??
                              0}
                          </div>
                        </div>
                        <div className="!flex !flex-col !items-center">
                          <div className="text-xs">
                            {t("ads", "spent") || "Spent"} SAR
                          </div>
                          <div className="font-medium">
                            {/* {t("ads", "riyal") || "riyal"}{" "} */}
                            {ad.spended?.toLocaleString?.() ?? 0}
                          </div>
                        </div>
                        <div className="!flex !flex-col !items-center">
                          <div className="text-xs">
                            {t("ads", "likes") || "Likes"}
                          </div>
                          <div className="font-medium">
                            {ad.likesCount ?? 0}
                          </div>
                        </div>
                        <div className="!flex !flex-col !items-center">
                          <div className="text-xs">
                            {t("ads", "websiteClicks") || "Website Clicks"}
                          </div>
                          <div className="font-medium">
                            {Array.isArray(ad.websiteClicks)
                              ? ad.websiteClicks.join(", ")
                              : ad.websiteClicks || "0"}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-4">
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/campaigns/${ad.id}`)}
                            data-testid={`button-view-ad-${ad.id}`}>
                            <i
                              className={`fas fa-eye ${
                                isRTL ? "ml-2" : "mr-2"
                              }`}></i>
                            {t("ads", "view")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(editAdPath(ad.id))}
                            data-testid={`button-edit-${ad.id}`}>
                            <i
                              className={`fas fa-edit ${
                                isRTL ? "ml-2" : "mr-2"
                              }`}></i>
                            {t("ads", "edit")}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteAd(ad.id)}
                            data-testid={`button-delete-${ad.id}`}>
                            <i
                              className={`fas fa-trash ${
                                isRTL ? "ml-2" : "mr-2"
                              }`}></i>
                            {t("ads", "delete")}
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() =>
                            setLocation(`/campaigns/${ad.id}/analytics`)
                          }
                          data-testid={`button-analytics-${ad.id}`}>
                          <i
                            className={`fas fa-chart-line ${
                              isRTL ? "ml-2" : "mr-2"
                            }`}></i>
                          {t("ads", "analytics")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-ad text-6xl text-muted-foreground mb-6"></i>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t("ads", "noAdsYet")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("ads", "createFirstAdMessage")}
              </p>
              <Button
                onClick={handleCreateAd}
                data-testid="button-create-first-ad">
                <i className={`fas fa-plus ${isRTL ? "ml-2" : "mx-2"}`}></i>
                {t("ads", "createFirstAd")}
              </Button>
            </div>
          )}
        </main>
        {ads?.pagination && (
          <DataPagination
            pagination={ads.pagination}
            currentPage={Number(page)}
            onPageChange={(p) => setPage(String(p))}
            pageSize={Number(limit)}
            onPageSizeChange={(l) => setLimit(String(l))}
            showPageSizeSelector
            pageSizeOptions={[5, 10, 20, 50]}
            showInfo
            className="mt-6"
            isLoading={isLoading}
          />
        )}

        <DeleteAdDialog
          adId={adToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      </div>
    </div>
  );
}
