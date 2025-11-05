import { locationOptions } from "@/components/ads/targeting-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataPagination } from "@/components/ui/data-pagination";
import { ImageCarousel } from "@/components/ui/image-carousel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import useLoadPixels, { Pixel } from "@/hooks/useLoadPixels";
import { TokenManager } from "@/lib/auth";

// Memoized skeleton list component to avoid recreating placeholders on each render
function SkeletonList() {
  const items = useMemo(() => [0, 1, 2], []);
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {items.map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-48 bg-muted rounded mb-4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface Ad {
  id: string;
  // imageUrl can be a single string, an array of strings, or null
  imageUrl: string | string[] | null;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  likesCount: number;
  websiteUrl?: string | null;
  // optional social links
  tiktokLink?: string | null;
  youtubeLink?: string | null;
  instagramLink?: string | null;
  facebookLink?: string | null;
  snapchatLink?: string | null;
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

  // Optional filters: read from URL query params so links can control filtering
  // Initialize filters from URL params once
  const initialFilters = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        title: params.get("title") || "",
        description: params.get("description") || "",
        source: params.get("source") || "",
        audience: params.get("targetAudience") || "",
      };
    } catch {
      return { title: "", description: "", source: "", audience: "" };
    }
  }, []);

  const [titleFilter, setTitleFilter] = useState<string>(initialFilters.title);
  const [descriptionFilter, setDescriptionFilter] = useState<string>(
    initialFilters.description
  );
  const [sourceFilter] = useState<string>(initialFilters.source);
  const [audienceFilter, setAudienceFilter] = useState<string>(
    initialFilters.audience
  );
  // if (TokenManager.getAccessToken()) {
  //     window.location.href = "/ads/feed";
  //     return null;
  //   }
  let adRtn
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
      titleFilter,
      descriptionFilter,
      sourceFilter,
      audienceFilter,
    ],
    queryFn: async () => {
      const url = new URL(
        `${VITE_API_BASE_URL}/api/advertising/listApprovedAdsForUser`
      );
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("targetCities", JSON.stringify(targetCities));
      if (titleFilter) url.searchParams.set("title", titleFilter);
      if (descriptionFilter)
        url.searchParams.set("description", descriptionFilter);
      if (sourceFilter) url.searchParams.set("source", sourceFilter);
      if (audienceFilter)
        url.searchParams.set("targetAudience", audienceFilter);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch ads");
      }
      const rtn = await response.json();
      console.log(rtn);
      adRtn = rtn;
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
      toast({
        title: t("publicFeed", "error"),
        description:
          (error instanceof Error ? error.message : "") ||
          t("publicFeed", "likeErrorDesc"),
        variant: "destructive",
      });
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

  const handleWebsiteClick = async (ad: Ad) => {
    // Open the website immediately for best UX, then fire-and-forget the click API
    if (ad.websiteUrl) {
      // open in new tab
      window.open(ad.websiteUrl, "_blank", "noopener,noreferrer");
    }

    try {
      // Fire the click endpoint with forWebsite=true
      await fetch(
        `${VITE_API_BASE_URL}/api/users/ad/${ad.id}/click?forWebsite=true`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // Optionally update local liked state or analytics if needed
    } catch (err) {
      // swallow errors but optionally show toast
      // console.debug("website click tracking failed", err);
    }
  };

  // Social icons rendered only when the corresponding link exists on the ad
  function SocialLinks({ ad }: { ad: Ad }) {
    const items: { href?: string | null; label: string; svg: JSX.Element }[] = [
      {
        href: ad.youtubeLink,
        label: "YouTube",
        svg: (
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="currentColor"
            aria-hidden>
            <path d="M10 15l5-3-5-3v6z" />
            <path d="M21 8s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C15.7 4.8 12 4.8 12 4.8s-3.7 0-6.1.3c-.4.1-1.3.1-2.1.9C3.2 6.6 3 8 3 8S2.8 9.6 3 11.1c.2 1.5.8 2.9.8 2.9s.2 1.4.8 2c.8.8 1.8.8 2.3.9 1.7.2 7 .3 7 .3s3.7 0 6.1-.3c.4-.1 1.3-.1 2.1-.9.6-.6.8-2 .8-2s.2-1.5 0-3c-.2-1.5-.8-2.9-.8-2.9z" />
          </svg>
        ),
      },
      {
        href: ad.tiktokLink,
        label: "TikTok",
        svg: (
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="currentColor"
            aria-hidden>
            <path d="M12 2v10.5A3.5 3.5 0 1 0 15.5 16V7h3.5V4h-6z" />
          </svg>
        ),
      },
      {
        href: ad.instagramLink,
        label: "Instagram",
        svg: (
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="currentColor"
            aria-hidden>
            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zM12 7.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm5.5-2a1 1 0 1 0 1 1 1 1 0 0 0-1-1z" />
          </svg>
        ),
      },
      {
        href: ad.facebookLink,
        label: "Facebook",
        svg: (
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="currentColor"
            aria-hidden>
            <path d="M13 3h2v3h-2c-1.1 0-1 1-1 1v2h3l-.5 3H12v7h-3v-7H6v-3h3V7a4 4 0 0 1 4-4z" />
          </svg>
        ),
      },
      {
        href: ad.snapchatLink,
        label: "Snapchat",
        svg: (
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="currentColor"
            aria-hidden>
            <path d="M12 2a5 5 0 0 0-5 5 7 7 0 0 0-2 5v2a2 2 0 0 0 2 2c1 0 1 1 1 1s1 .5 3 .5 3-.5 3-.5 0-1 1-1a2 2 0 0 0 2-2v-2a7 7 0 0 0-2-5 5 5 0 0 0-5-5z" />
          </svg>
        ),
      },
    ];

    return (
      <div className="flex items-center gap-2">
        {items.map((it) =>
          it.href ? (
            <a
              key={it.label}
              href={it.href || undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={it.label}
              className="text-muted-foreground hover:text-foreground">
              {it.svg}
            </a>
          ) : null
        )}
      </div>
    );
  }

  const handlePageChange = (newPage: string) => {
    setPage(parseInt(newPage));
  };

  const handlePageSizeChange = (newLimit: string) => {
    setLimit(parseInt(newLimit));
    setPage(1); // Reset to first page when changing page size
  };

  const handleCityChange = (city: string) => {
    if (city === "all") {
      // Expand 'all' to the list of available location values (exclude the 'all' token itself)
      const allLocations = locationOptions
        .map((o) => o.value)
        .filter((v) => v && v !== "all");
      setTargetCities(allLocations);
    } else {
      setTargetCities([city]);
    }
    setPage(1); // Reset to first page when changing city
  };
  console.log("adsResponse", adsResponse?.data, adRtn);
  const {
    data: pixelsData,
    isLoading: pixelsLoading,
    isError: pixelsIsError,
    error: pixelsError,
  } = useQuery<{ success: boolean; message?: string; data: Pixel[] }, Error>({
    queryKey: ["pixels"],
    queryFn: async () => {
      const token = TokenManager.getAccessToken();
      const res = await fetch(`${VITE_API_BASE_URL}/api/pixels`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch pixels");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const pixels: Pixel[] = pixelsData?.data ?? [];

  const { loadedPlatforms, trackEvent } = useLoadPixels(pixels);

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
            <h1 className="text-xl font-bold text-foreground">
              {/* {" "} */}
              {/* {t("sidebar", "appName")} */}
            </h1>
            {/* <img src="/logo.webp" alt="Logo" className="w-20 h-8" /> */}
          </div>
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto px-2">
            <Select
              value={targetCities[0] || undefined}
              onValueChange={handleCityChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map(
                  (option: { value: string; label: string }) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            {/* Title filter */}
            <input
              type="text"
              value={titleFilter}
              onChange={(e) => {
                setTitleFilter(e.target.value);
                setPage(1);
              }}
              className="w-40 md:w-48 lg:w-56 rounded-md border px-2 py-1 text-sm bg-background"
              placeholder={t("publicFeed", "Search title")}
            />

            {/* Description filter */}
            <input
              type="text"
              value={descriptionFilter}
              onChange={(e) => {
                setDescriptionFilter(e.target.value);
                setPage(1);
              }}
              className="w-48 md:w-56 lg:w-64 rounded-md border px-2 py-1 text-sm bg-background"
              placeholder={t("publicFeed", "Search description")}
            />

            {/* Audience filter (same values as ad-editor) */}
            <Select
              value={audienceFilter || undefined}
              onValueChange={(v) => {
                const mapped = v === "any" ? "" : v;
                setAudienceFilter(mapped);
                setPage(1);
              }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t("ads", "targetAudienceLabel")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">
                  {t("ads", "targetAudiencePlaceholder")}
                </SelectItem>
                <SelectItem value="cars">{t("ads", "audienceCars")}</SelectItem>
                <SelectItem value="realestate">
                  {t("ads", "audienceRealestate")}
                </SelectItem>
                <SelectItem value="devices">
                  {t("ads", "audienceDevices")}
                </SelectItem>
                <SelectItem value="animals">
                  {t("ads", "audienceAnimals")}
                </SelectItem>
                <SelectItem value="furniture">
                  {t("ads", "audienceFurniture")}
                </SelectItem>
                <SelectItem value="jobs">{t("ads", "audienceJobs")}</SelectItem>
                <SelectItem value="services">
                  {t("ads", "audienceServices")}
                </SelectItem>
                <SelectItem value="fashion">
                  {t("ads", "audienceFashion")}
                </SelectItem>
                <SelectItem value="games">
                  {t("ads", "audienceGames")}
                </SelectItem>
                <SelectItem value="rarities">
                  {t("ads", "audienceRarities")}
                </SelectItem>
                <SelectItem value="art">{t("ads", "audienceArt")}</SelectItem>
                <SelectItem value="trips">
                  {t("ads", "audienceTrips")}
                </SelectItem>
                <SelectItem value="food">{t("ads", "audienceFood")}</SelectItem>
                <SelectItem value="gardens">
                  {t("ads", "audienceGardens")}
                </SelectItem>
                <SelectItem value="occasions">
                  {t("ads", "audienceOccasions")}
                </SelectItem>
                <SelectItem value="tourism">
                  {t("ads", "audienceTourism")}
                </SelectItem>
                <SelectItem value="lost">{t("ads", "audienceLost")}</SelectItem>
                <SelectItem value="coach">
                  {t("ads", "audienceCoach")}
                </SelectItem>
                <SelectItem value="code">{t("ads", "audienceCode")}</SelectItem>
                <SelectItem value="fund">{t("ads", "audienceFund")}</SelectItem>
                <SelectItem value="more">{t("ads", "audienceMore")}</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">{t("publicFeed", "title")}</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="p-6 min-h-[78vh] 
      flex flex-col items-center w-full
      ">
        {isLoading ? (
          <SkeletonList />
        ) : (
          <div className="w-full flex flex-col items-center space-y-8">
            {/* Ads List */}
            <div
              className=" w-full
            flex flex-col items-center
            ">
              <div
                className="w-full max-w-5xl grid  gap-6
           
             grid-cols-1 md:grid-cols-1 lg:grid-cols-2 
            ">
                {adsResponse?.data.map((ad) => (
                  <div key={ad.id} className="w-full">
                    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-fit">
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
                          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                            {language === "en"
                              ? ad.descriptionEn
                              : ad.descriptionAr}
                          </p>

                          {Array.isArray(ad.imageUrl) &&
                          ad.imageUrl.length > 0 ? (
                            <ImageCarousel images={ad.imageUrl} />
                          ) : ad.imageUrl ? (
                            <img
                              src={ad.imageUrl as string}
                              alt={language === "en" ? ad.titleEn : ad.titleAr}
                              className="w-full object-cover rounded-lg h-48 sm:h-56 md:h-64 lg:h-48 xl:h-64"
                              loading="lazy"
                            />
                          ) : null}
                        </div>

                        {/* Actions */}
                        <div
                          className="px-4 pb-4 border-t pt-3 flex items-center justify-between
                        overflow-x-auto
                        ">
                          <div className="flex items-center gap-4">
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
                            </div>

                            {/* show social links only when present */}
                            <SocialLinks ad={ad} />
                          </div>
                          {ad.websiteUrl && (
                            <Button
                              variant="outline"
                              onClick={() => handleWebsiteClick(ad)}
                              className="gap-2">
                              <ExternalLink className="h-4 w-4" />
                              {t("publicFeed", "website")}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
