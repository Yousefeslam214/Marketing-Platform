import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TokenManager } from "@/lib/auth";
import { getStatusColor, VITE_API_BASE_URL } from "@/lib/utils";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useState } from "react";
import { analyticsCampaignPath, editAdPath } from "@/lib/paths";
import DataPagination from "@/components/ui/data-pagination";

export default function AdsIndex() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();

  const [page, setPage] = useState<string>("1");
  const [limit, setLimit] = useState<string>("5");

  const {
    data: ads,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    key: ["/api/ads/user", page, limit],
    url: `${VITE_API_BASE_URL}/api/advertising/list?page=${page}&limit=${limit}`,
  });

  // Type-safe ads array
  const safeAds = (ads?.data as any[]) || [];

  const handleCreateAd = () => {
    setLocation("/campaigns/new");
  };

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto">
        <Header
          title={t("ads", "title")}
          description={t("ads", "description")}
          actions={
            <Button onClick={handleCreateAd} data-testid="button-create-ad">
              <i className={`fas fa-plus ${isRTL ? "ml-2" : "mr-2"}`}></i>
              {t("ads", "createAd")}
            </Button>
          }
        />

        <main className="p-6 min-h-[78vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : safeAds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
              {safeAds.map((ad: any) => (
                <Card
                  key={ad.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3
                          className="font-semibold text-foreground truncate"
                          data-testid={`ad-title-${ad.id}`}>
                          {ad.titleEn}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {ad.descriptionEn}
                        </p>
                      </div>
                      <Badge className={getStatusColor(ad.status)}>
                        {ad.status}
                      </Badge>
                    </div>

                    {ad.imageUrl && (
                      <div className="w-full h-32 bg-muted rounded-lg mb-4 overflow-hidden">
                        <img
                          src={ad.imageUrl}
                          alt={ad.titleEn}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div
                      className="flex items-center justify-between text-sm text-muted-foreground
                    flex flex-col overflow-hidden
                    ">
                      <span>
                        {t("ads", "target")}: {ad.targetAudience}
                      </span>
                      <span>{new Date(ad.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/campaigns/${ad.id}`)}
                        data-testid={`button-view-ad-${ad.id}`}>
                        {t("ads", "view")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(editAdPath(ad.id))}
                        data-testid={`button-edit-${ad.id}`}>
                        {t("ads", "edit")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setLocation(analyticsCampaignPath(ad.id))
                        }
                        data-testid={`button-analytics-${ad.id}`}>
                        {t("ads", "analytics")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                <i className={`fas fa-plus ${isRTL ? "ml-2" : "mr-2"}`}></i>
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
      </div>
    </div>
  );
}
