import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Share2, MessageCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { DataPagination } from "@/components/ui/data-pagination";
import { locationOptions } from "@/components/ads/targeting-form";

interface Ad {
  id: string;
  imageUrl: string | null;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  likesCount: number;
  websiteUrl?: string | null;
}

interface AdsFeedResponse {
  success: boolean;
  message: string;
  data: Ad[];
  pagination: {
    currentPage: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export default function AdsFeed() {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [targetCities, setTargetCities] = useState<string[]>(["riyadh"]);
  const [likedAds, setLikedAds] = useState<Set<string>>(new Set());
  // if (TokenManager.getAccessToken()) {
  //     window.location.href = "/ads/feed";
  //     return null;
  //   }
  const {
    data: adsResponse,
    isLoading,
    error,
  } = useQuery<AdsFeedResponse>({
    queryKey: [
      "/api/advertising/listApprovedAdsForUser",
      page,
      limit,
      targetCities,
    ],
    queryFn: async () => {
      const targetCitiesParam = JSON.stringify(targetCities);
      const response = await fetch(
        `${VITE_API_BASE_URL}/api/advertising/listApprovedAdsForUser?page=${page}&limit=${limit}&targetCities=${encodeURIComponent(
          targetCitiesParam
        )}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch ads");
      }
      const rtn = await response.json();

      return rtn;
    },
    retry: 1,
  });
  const handleLike = async (adId: string) => {
    try {
      const response = await fetch(
        `${VITE_API_BASE_URL}/api/users/ad/${adId}/click`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setLikedAds((prev) => {
          const newSet = new Set(prev);
          newSet.add(adId);
          return newSet;
        });
        toast({
          title: t("publicFeed", "interactionRecorded"),
          description: t("publicFeed", "interactionRecordedDesc"),
        });
      }
    } catch (error) {
      console.error("Failed to record interaction:", error);
    }
  };

  const handleShare = (ad: Ad) => {
    const title = language === "en" ? ad.titleEn : ad.titleAr;
    const description = language === "en" ? ad.descriptionEn : ad.descriptionAr;
    const id = ad.id;

    if (navigator.share) {
      navigator.share({
        url: window.location.href,
        title,
        text: description,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.href}/${id}`);
      toast({
        title: t("publicFeed", "copiedToClipboard"),
        description: t("publicFeed", "adContentCopied"),
      });
    }
  };

  const handlePageChange = (newPage: string) => {
    setPage(parseInt(newPage));
  };

  const handlePageSizeChange = (newLimit: string) => {
    setLimit(parseInt(newLimit));
    setPage(1); // Reset to first page when changing page size
  };

  const handleCityChange = (city: string) => {
    setTargetCities([city]);
    setPage(1); // Reset to first page when changing city
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t("publicFeed", "errorLoading")}
          </h2>
          <p className="text-muted-foreground">
            {t("publicFeed", "unableToLoad")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-bolt text-primary-foreground text-lg"></i>
            </div>
            <h1 className="text-xl font-bold text-foreground">
              {" "}
              {t("sidebar", "appName")}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={locationOptions[0].value}
              onValueChange={handleCityChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">{t("publicFeed", "title")}</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 min-h-[78vh]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-48 bg-muted rounded mb-4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center space-y-8">
            {/* Ads List */}
            <div className="min-h-[80vh]">
              <div
                className="w-full max-w-5xl grid  gap-6
             grid-cols-1 md:grid-cols-1 lg:grid-cols-2 
            ">
                {adsResponse?.data.map((ad) => (
                  <Card
                    key={ad.id}
                    className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-0">
                      {/* Header */}
                      <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold text-foreground">
                          {language === "en" ? ad.titleEn : ad.titleAr}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t("publicFeed", "sponsored")}
                        </p>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-4">
                        <p className="text-foreground leading-relaxed">
                          {language === "en"
                            ? ad.descriptionEn
                            : ad.descriptionAr}
                        </p>

                        {ad.imageUrl && (
                          <img
                            src={ad.imageUrl}
                            alt={language === "en" ? ad.titleEn : ad.titleAr}
                            className="w-full h-64 object-cover rounded-lg"
                            loading="lazy"
                          />
                        )}
                      </div>

                      {/* Actions */}
                      <div className="px-4 pb-4 border-t pt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(ad.id)}
                            disabled={likedAds.has(ad.id)}
                            className={`gap-2 ${
                              likedAds.has(ad.id) ? "text-red-500" : ""
                            }`}>
                            <Heart
                              className={`h-4 w-4 ${
                                likedAds.has(ad.id) ? "fill-current" : ""
                              }`}
                            />
                            {ad.likesCount + (likedAds.has(ad.id) ? 1 : 0)}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(ad)}
                            className="gap-2">
                            <Share2 className="h-4 w-4" />
                            {t("publicFeed", "share")}
                          </Button>

                          <Button variant="ghost" size="sm" className="gap-2">
                            <MessageCircle className="h-4 w-4" />
                            {t("publicFeed", "comment")}
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => {
                            if (ad.websiteUrl) {
                              window.open(
                                ad.websiteUrl,
                                "_blank",
                                "noopener,noreferrer"
                              );
                            }
                          }}
                          className="gap-2">
                          <ExternalLink className="h-4 w-4" />
                          {(t as any)("publicFeed", "website")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            {/* Empty State */}
            {adsResponse?.data.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-ad text-2xl text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t("publicFeed", "noAdsAvailable")}
                </h3>
                <p className="text-muted-foreground">
                  {t("publicFeed", "checkBackLater")}
                </p>
              </div>
            ) : (
              <>
                {/* Pagination */}
                {adsResponse?.pagination && (
                  <DataPagination
                    pagination={{
                      ...adsResponse.pagination,
                      itemsPerPage: limit,
                      totalItems: adsResponse.pagination.totalCount,
                    }}
                    currentPage={page.toString()}
                    onPageChange={handlePageChange}
                    pageSize={limit.toString()}
                    onPageSizeChange={handlePageSizeChange}
                    showPageSizeSelector
                    pageSizeOptions={[6, 12, 18, 24]}
                    showInfo
                    className="mt-4"
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
