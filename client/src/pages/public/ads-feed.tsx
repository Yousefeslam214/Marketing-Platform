import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, MessageCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { TokenManager } from "@/lib/auth";
import PublicFooter from "@/components/layout/publicFooter";

interface Ad {
  id: string;
  imageUrl: string | null;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  likesCount: number;
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
    queryKey: ["/api/advertising/listApprovedAdsForUser", page],
    queryFn: async () => {
      const response = await fetch(
        `${VITE_API_BASE_URL}/api/advertising/listApprovedAdsForUser?page=${page}&limit=6`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch ads");
      }
      const rtn = await response.json();
      console.log(rtn?.data);
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

  const loadMore = () => {
    if (adsResponse?.pagination.hasNext) {
      setPage((prev) => prev + 1);
    }
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          <Badge variant="secondary">{t("publicFeed", "title")}</Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {isLoading && page === 1 ? (
          <div className="space-y-6">
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
          <div className="space-y-6">
            {adsResponse?.data.map((ad) => (
              <Card
                key={ad.id}
                className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Ad Header */}
                  <div className="p-4 border-b">
                    <h2 className="font-semibold text-lg text-foreground">
                      {language === "en" ? ad.titleEn : ad.titleAr}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("publicFeed", "sponsored")}
                    </p>
                  </div>

                  {/* Ad Content */}
                  <div className="p-4">
                    <p className="text-foreground mb-4 leading-relaxed">
                      {language === "en" ? ad.descriptionEn : ad.descriptionAr}
                    </p>

                    {ad.imageUrl && (
                      <div className="mb-4">
                        <img
                          src={ad.imageUrl}
                          alt={language === "en" ? ad.titleEn : ad.titleAr}
                          className="w-full h-64 object-cover rounded-lg"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>

                  {/* Ad Actions */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between pt-3 border-t">
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

                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLike(ad.id)}
                        className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        {t("publicFeed", "learnMore")}
                      </Button> */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load More Button */}
            {adsResponse?.pagination.hasNext && (
              <div className="flex justify-center py-6">
                <Button
                  onClick={loadMore}
                  disabled={isLoading}
                  variant="outline"
                  className="min-w-32">
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      {t("publicFeed", "loading")}
                    </>
                  ) : (
                    t("publicFeed", "loadMore")
                  )}
                </Button>
              </div>
            )}

            {/* Empty State */}
            {adsResponse?.data.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-ad text-2xl text-muted-foreground"></i>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t("publicFeed", "noAdsAvailable")}
                </h3>
                <p className="text-muted-foreground">
                  {t("publicFeed", "checkBackLater")}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
      <PublicFooter />  
    </div>
  );
}
