import { locationOptions } from "@/components/ads/targeting-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataPagination } from "@/components/ui/data-pagination";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
function SkeletonList({ numberOfItems }: { numberOfItems: number }) {
  const items = useMemo(
    () => Array.from({ length: numberOfItems }),
    [numberOfItems]
  );
  return (
    <div className="w-full max-w-5xl grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      {items.map((_, i) => (
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
  whatsappLink?: string | null;
  phoneNumber?: string | null;
  // promotion status
  hasPromoted?: boolean;
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
  const [targetCities, setTargetCities] = useState<string[]>([]);
  const [likedAds, setLikedAds] = useState<Set<string>>(new Set());
  const [reportOpen, setReportOpen] = useState(false);
  const [reportAdId, setReportAdId] = useState<string | null>(null);
  const [reportEmail, setReportEmail] = useState("");
  const [reportUsername, setReportUsername] = useState("");
  const [reportPhone, setReportPhone] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  // Dialog state for viewing full ad details
  const [viewAdOpen, setViewAdOpen] = useState(false);
  const [activeAd, setActiveAd] = useState<Ad | null>(null);

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
  // removed unused adRtn variable for cleanliness
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
      if (targetCities.length > 0) {
        url.searchParams.set("targetCities", JSON.stringify(targetCities));
      }
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
      return rtn;
    },
    retry: 1,
  });
  const whatsappLink = adsResponse?.phoneNumber || "";
  console.log("adsResponse", whatsappLink);
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

  const openReportDialog = (adId: string) => {
    setReportAdId(adId);
    setReportOpen(true);
  };

  const closeReportDialog = () => {
    setReportOpen(false);
    setReportAdId(null);
    setReportEmail("");
    setReportUsername("");
    setReportPhone("");
    setReportDescription("");
    setReportSubmitting(false);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportAdId) return;
    // Basic validation
    if (!reportEmail || !reportUsername || !reportDescription) {
      toast({
        title: t("publicFeed", "reportValidationTitle") || "Missing info",
        description:
          t("publicFeed", "reportValidationDesc") ||
          "Please fill required fields.",
        variant: "destructive",
      });
      return;
    }
    try {
      setReportSubmitting(true);
      const res = await fetch(`${VITE_API_BASE_URL}/api/users/ad-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: reportEmail,
          username: reportUsername,
          phoneNumber: reportPhone,
          reportDescription,
          adId: reportAdId,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit report");
      toast({
        title: t("publicFeed", "reportSuccessTitle") || "Report sent",
        description:
          t("publicFeed", "reportSuccessDesc") || "Thanks for letting us know.",
      });
      closeReportDialog();
    } catch (err) {
      toast({
        title: t("publicFeed", "reportErrorTitle") || "Submit failed",
        description:
          (err instanceof Error ? err.message : "") ||
          t("publicFeed", "reportErrorDesc") ||
          "We couldn't send your report.",
        variant: "destructive",
      });
      setReportSubmitting(false);
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
        svg: <i className="fab fa-youtube w-4 h-4" aria-hidden />,
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
        href: ad.phoneNumber
          ? `https://wa.me/${ad.phoneNumber.replace(/[^0-9]/g, "")}`
          : null,
        label: "WhatsApp",
        svg: (
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="currentColor"
            aria-hidden>
            <title>WhatsApp icon</title>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
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
        svg: <i className="fab fa-snapchat-ghost w-4 h-4" aria-hidden />,
      },
      {
        href: ad.whatsappLink,
        label: "WhatsApp",
        svg: <i className="fab fa-whatsapp w-4 h-4" aria-hidden />,
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
      // Empty array means no city filter (fetch all cities)
      setTargetCities([]);
    } else {
      setTargetCities([city]);
    }
    setPage(1); // Reset to first page when changing city
  };
  console.log("adsResponse", adsResponse?.data);
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
      <header
        className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4
      
      ">
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
                <SelectValue
                  placeholder={t("ads", "allCities") || "All Cities"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="all"
                  className="flex flex-col items-center justify-center ">
                  {t("ads", "allCities") || "All Cities"}
                </SelectItem>
                {locationOptions.map(
                  (option: { value: string; label: string }) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="flex flex-col items-center justify-center ">
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
              className="w-40 md:w-48 lg:w-56 rounded-md border px-2 py-2 text-sm bg-background"
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
              className="w-48 md:w-56 lg:w-64 rounded-md border px-2 py-2 text-sm bg-background"
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
                <SelectValue
                  placeholder={t("ads", "targetAudiencePlaceholder")}
                  className="flex flex-col items-center justify-center ">
                  {t("ads", "targetAudiencePlaceholder")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="flex flex-col items-center justify-center">
                <SelectItem
                  value="any"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "targetAudiencePlaceholder")}
                </SelectItem>
                <SelectItem
                  value="cars"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceCars")}
                </SelectItem>
                <SelectItem
                  value="realestate"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceRealestate")}
                </SelectItem>
                <SelectItem
                  value="devices"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceDevices")}
                </SelectItem>
                <SelectItem
                  value="animals"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceAnimals")}
                </SelectItem>
                <SelectItem
                  value="furniture"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceFurniture")}
                </SelectItem>
                <SelectItem
                  value="jobs"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceJobs")}
                </SelectItem>
                <SelectItem
                  value="services"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceServices")}
                </SelectItem>
                <SelectItem
                  value="fashion"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceFashion")}
                </SelectItem>
                <SelectItem
                  value="games"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceGames")}
                </SelectItem>
                <SelectItem
                  value="rarities"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceRarities")}
                </SelectItem>
                <SelectItem
                  value="art"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceArt")}
                </SelectItem>
                <SelectItem
                  value="trips"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceTrips")}
                </SelectItem>
                <SelectItem
                  value="food"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceFood")}
                </SelectItem>
                <SelectItem
                  value="gardens"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceGardens")}
                </SelectItem>
                <SelectItem
                  value="occasions"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceOccasions")}
                </SelectItem>
                <SelectItem
                  value="tourism"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceTourism")}
                </SelectItem>
                <SelectItem
                  value="lost"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceLost")}
                </SelectItem>
                <SelectItem
                  value="coach"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceCoach")}
                </SelectItem>
                <SelectItem
                  value="code"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceCode")}
                </SelectItem>
                <SelectItem
                  value="fund"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceFund")}
                </SelectItem>
                <SelectItem
                  value="more"
                  className="flex flex-col items-center justify-center">
                  {t("ads", "audienceMore")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Badge
              className="pt-1 sm:hidden md:hidden lg:flex"
              variant="secondary">
              {t("publicFeed", "title")}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="p-6 min-h-[78vh] 
      flex flex-col items-center w-full
      ">
        {isLoading ? (
          <SkeletonList numberOfItems={6} />
        ) : (
          <div className="w-full flex flex-col items-center space-y-8">
            {/* Ads List */}
            <div
              className=" w-full
            flex flex-col items-center
            ">
              <div className="w-full max-w-5xl grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                {adsResponse?.data.map((ad) => (
                  <div key={ad.id} className="w-full overflow-hidden">
                    <Card
                      className={
                        ` transition-shadow duration-300 h-full flex flex-col cursor-pointer relative group ` +
                        (ad.hasPromoted
                          ? "border-2 border-[#3B82F6] shadow-[0_0_0_3px_rgba(59,130,246,0.3)]"
                          : "hover:shadow-md")
                      }
                      onClick={() => {
                        setActiveAd(ad);
                        setViewAdOpen(true);
                      }}>
                      {/* Promoted corner ribbon - RTL on left, LTR on right */}
                      {ad.hasPromoted && (
                        <div
                          className={`absolute  ${
                            isRTL ? "left-1.5 -top-2" : "right-0 top-0"
                          } w-24 h-24 pointer-events-none`}>
                          <div
                            className={
                              `absolute bg-[#3B82F6] text-white text-xs font-semibold tracking-wide px-8 py-2 shadow-lg  ` +
                              (isRTL
                                ? "top-[10px] -left-[30px] rotate-[-45deg]"
                                : "top-3.5 -right-8 rotate-[45deg]")
                            }>
                            {t("publicFeed", "promoted") || "Promoted"}
                          </div>
                        </div>
                      )}
                      <CardContent className="p-0 flex flex-col h-full">
                        {/* Header */}
                        <div className="p-4 border-b">
                          <h2
                            className="text-lg font-semibold text-foreground"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical" as any,
                              overflow: "hidden",
                            }}>
                            {language === "en" ? ad.titleEn : ad.titleAr}
                          </h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {t("publicFeed", "sponsored")}
                          </p>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col gap-4 flex-1 justify-end">
                          <p
                            className="text-foreground leading-relaxed whitespace-pre-wrap"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical" as any,
                              overflow: "hidden",
                            }}>
                            {language === "en"
                              ? ad.descriptionEn
                              : ad.descriptionAr}
                          </p>

                          <div className="w-full rounded-lg overflow-hidden">
                            {/* <AspectRatio ratio={4 / 3}> */}
                            {Array.isArray(ad.imageUrl) &&
                            ad.imageUrl.length > 0 ? (
                              <ImageCarousel
                                images={ad.imageUrl}
                                isHovered={false}
                              />
                            ) : ad.imageUrl ? (
                              <img
                                src={ad.imageUrl as string}
                                alt={
                                  language === "en" ? ad.titleEn : ad.titleAr
                                }
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-full w-full bg-muted flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">
                                  {t("ads", "noImage") || "No image"}
                                </span>
                              </div>
                            )}
                            {/* </AspectRatio> */}
                          </div>
                        </div>

                        {/* Actions */}
                        <div
                          className={
                            `px-4 pb-4 border-t pt-3 flex items-center justify-between mt-auto flex
                            flex-col
                            ` +
                            (ad.hasPromoted ? "" : "")
                          }
                          onClick={(e) =>
                            e.stopPropagation()
                          } /* prevent card click */
                        >
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

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openReportDialog(ad.id)}
                                className="gap-2">
                                <MessageCircle className="h-4 w-4" />
                                {t("publicFeed", "report") || "Report"}
                              </Button>
                            </div>

                            {/* show social links only when present */}
                            <SocialLinks ad={ad} />
                          </div>
                          {ad.websiteUrl && (
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWebsiteClick(ad);
                              }}
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

      {/* Report Dialog */}
      <Dialog
        open={reportOpen}
        onOpenChange={(o) => (o ? setReportOpen(true) : closeReportDialog())}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {t("publicFeed", "reportThisAd") || "Report this ad"}
            </DialogTitle>
            <DialogDescription>
              {t("publicFeed", "reportDialogDesc") ||
                "Tell us what's wrong with this ad. We'll review it shortly."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="report-email">
                {t("publicFeed", "emailLabel") || "Email"}
              </Label>
              <Input
                id="report-email"
                type="email"
                value={reportEmail}
                onChange={(e) => setReportEmail(e.target.value)}
                placeholder={
                  t("publicFeed", "emailPlaceholder") || "you@example.com"
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="report-username">
                {t("publicFeed", "usernameLabel") || "Username"}
              </Label>
              <Input
                id="report-username"
                value={reportUsername}
                onChange={(e) => setReportUsername(e.target.value)}
                placeholder={
                  t("publicFeed", "usernamePlaceholder") || "JohnDoe"
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="report-phone">
                {t("publicFeed", "phoneLabel") || "Phone number"}
              </Label>
              <Input
                id="report-phone"
                value={reportPhone}
                onChange={(e) => setReportPhone(e.target.value)}
                placeholder={t("publicFeed", "phonePlaceholder") || "5XXXXXXXX"}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="report-desc">
                {t("publicFeed", "descriptionLabel") || "Description"}
              </Label>
              <Textarea
                id="report-desc"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder={
                  t("publicFeed", "descriptionPlaceholder") ||
                  "What is the issue?"
                }
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeReportDialog}>
                {t("publicFeed", "cancel") || "Cancel"}
              </Button>
              <Button type="submit" disabled={reportSubmitting}>
                {reportSubmitting
                  ? t("publicFeed", "submitting") || "Submitting..."
                  : t("publicFeed", "submitReport") || "Submit report"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* View Ad Dialog */}
      <Dialog
        open={viewAdOpen}
        onOpenChange={(o) =>
          o ? setViewAdOpen(true) : (setViewAdOpen(false), setActiveAd(null))
        }>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-auto ">
          <DialogHeader>
            <DialogTitle>
              {activeAd
                ? language === "en"
                  ? activeAd.titleEn
                  : activeAd.titleAr
                : ""}
            </DialogTitle>
            {activeAd && (
              <DialogDescription>
                {language === "en"
                  ? activeAd.descriptionEn
                  : activeAd.descriptionAr}
              </DialogDescription>
            )}
          </DialogHeader>
          {activeAd && (
            <div className="space-y-6">
              <div className="rounded-lg overflow-hidden relative">
                {Array.isArray(activeAd.imageUrl) &&
                activeAd.imageUrl.length > 0 ? (
                  <ImageCarousel images={activeAd.imageUrl} isHovered={true} />
                ) : activeAd.imageUrl ? (
                  <img
                    src={activeAd.imageUrl as string}
                    alt={
                      language === "en" ? activeAd.titleEn : activeAd.titleAr
                    }
                    className="w-full max-h-[560px] object-contain"
                  />
                ) : (
                  <div className="h-48 w-full bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      {t("ads", "noImage") || "No image"}
                    </span>
                  </div>
                )}
                {activeAd.hasPromoted && (
                  <div
                    className={` absolute top-0 ${
                      isRTL ? "left-0" : "right-0"
                    } w-24 h-24 overflow-hidden pointer-events-none`}>
                    <div
                      className={
                        `overflow-hidden absolute bg-[#3B82F6] text-white text-xs font-semibold tracking-wide px-8 py-2 shadow-lg ` +
                        (isRTL
                          ? "-top-6 -left-6 rotate-[-45deg]"
                          : "-top-6 -right-6 rotate-[45deg]")
                      }>
                      {t("publicFeed", "promoted") || "Promoted"}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Badge variant="secondary">
                  {t("publicFeed", "sponsored")}
                </Badge>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>{activeAd.likesCount}</span>
                </div>
                <SocialLinks ad={activeAd} />
                {activeAd.websiteUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleWebsiteClick(activeAd)}
                    className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    {t("publicFeed", "website")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
