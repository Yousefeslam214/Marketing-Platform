import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from "uuid";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { useApiQuery } from "@/hooks/useApiQuery";

interface PublicAdProps {
  params: { id: string };
}

export default function PublicAd({ params }: PublicAdProps) {
  const [, setLocation] = useLocation();
  const { id } = params;
  const [eventId] = useState(() => uuidv4());
  const [hasRecordedImpression, setHasRecordedImpression] = useState(false);
  const [language, setLanguage] = useState("en");

const limit = 5;
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useApiQuery({
     key: ["/ads/id", page, limit],
     url: `${VITE_API_BASE_URL}/api/advertising/${id}?page=${page}&limit=${limit}&status=approved`,
   });
 
   const ad = data?.data;

  const recordImpressionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/events/impression", data);
      return response.json();
    },
  });

  const recordClickMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/events/click", data);
      return response.json();
    },
  });

  // Record impression when component mounts
  useEffect(() => {
    if (ad && !hasRecordedImpression && ad.status === "published") {
      recordImpressionMutation.mutate({
        eventId,
        adId: id,
        source: "web",
        viewerHash: null,
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          timestamp: new Date().toISOString(),
        },
      });
      setHasRecordedImpression(true);
    }
  }, [ad, hasRecordedImpression, eventId, id]);

  // Set language based on URL or browser preference
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get("lang");
    const detectedLang = langParam || (navigator.language.startsWith("ar") ? "ar" : "en");
    setLanguage(detectedLang);
    
    // Set document direction
    document.documentElement.setAttribute("lang", detectedLang);
    document.documentElement.setAttribute("dir", detectedLang === "ar" ? "rtl" : "ltr");
  }, []);

  const handleClick = async () => {
    if (ad) {
      // Record click event
      await recordClickMutation.mutateAsync({
        eventId,
        adId: id,
        source: "web",
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      });

      // Redirect to target URL
      window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const toggleLanguage = () => {
    const newLang = language === "en" ? "ar" : "en";
    setLanguage(newLang);
    document.documentElement.setAttribute("lang", newLang);
    document.documentElement.setAttribute("dir", newLang === "ar" ? "rtl" : "ltr");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <i className="fas fa-exclamation-triangle text-6xl text-muted-foreground mb-4"></i>
            <h1 className="text-2xl font-bold text-foreground mb-2">Ad Not Found</h1>
            <p className="text-muted-foreground mb-4">
              This advertisement is no longer available or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (ad.status !== "published" && ad.status !== "approved") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <i className="fas fa-clock text-6xl text-muted-foreground mb-4"></i>
            <h1 className="text-2xl font-bold text-foreground mb-2">Ad Not Available</h1>
            <p className="text-muted-foreground mb-4">
              This advertisement is currently under review and not yet available for viewing.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const title = language === "ar" ? ad.titleAr : ad.titleEn;
  const description = language === "ar" ? ad.descriptionAr : ad.descriptionEn;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <i className="fas fa-bolt text-primary-foreground text-sm"></i>
            </div>
            <span className="font-semibold text-foreground">octopusad</span>
          </div>
          <Button variant="outline" size="sm" onClick={toggleLanguage} data-testid="button-toggle-language">
            <i className="fas fa-globe mr-2"></i>
            {language === "en" ? "العربية" : "English"}
          </Button>
        </div>
      </header>

      {/* Ad Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Ad Image */}
          {ad.imageUrl && (
            <div className="order-2 lg:order-1">
              <img 
                src={ad.imageUrl} 
                alt={title}
                className="w-full rounded-lg shadow-lg"
                data-testid="ad-image"
              />
            </div>
          )}

          {/* Ad Content */}
          <div className={`order-1 lg:order-2 ${language === "ar" ? "text-right" : "text-left"}`}>
            <Badge className="mb-4 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              <i className="fas fa-check-circle mr-1"></i>
              Verified Ad
            </Badge>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="ad-title">
              {title}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed" data-testid="ad-description">
              {description}
            </p>

            <Button 
              size="lg" 
              onClick={handleClick}
              disabled={recordClickMutation.isPending}
              className="w-full sm:w-auto"
              data-testid="button-visit-site"
            >
              {recordClickMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  {language === "ar" ? "جاري التحميل..." : "Loading..."}
                </>
              ) : (
                <>
                  <i className="fas fa-external-link-alt mr-2"></i>
                  {language === "ar" ? "زيارة الموقع" : "Visit Website"}
                </>
              )}
            </Button>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {language === "ar" 
                  ? "إعلان مدفوع • مقدم من منصة بولت للتسويق" 
                  : "Sponsored • Powered by Bolt Marketing Platform"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <i className="fas fa-shield-alt"></i>
            <span className="text-sm">
              {language === "ar"
                ? "هذا الإعلان تم مراجعته والموافقة عليه من قبل فريقنا"
                : "This advertisement has been reviewed and approved by our team"
              }
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-card border-t border-border py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-bolt text-primary-foreground"></i>
            </div>
            <span className="text-xl font-bold text-foreground">octopusad/</span>
          </div>
          <p className="text-muted-foreground text-sm">
            {language === "ar"
              ? "منصة التسويق والإعلان للشركات الصغيرة والمتوسطة"
              : "Marketing & Advertising Platform for SMBs"
            }
          </p>
        </div>
      </footer>
    </div>
  );
}
