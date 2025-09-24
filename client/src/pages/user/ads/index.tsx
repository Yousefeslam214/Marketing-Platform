import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TokenManager } from "@/lib/auth";

export default function AdsIndex() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();

  const { data: ads, isLoading } = useQuery({
    queryKey: ["/api/ads"],
    enabled: !!TokenManager.getAccessToken(),
  });

  // Type-safe ads array
  const safeAds = (ads as any[]) || [];

  if (!TokenManager.getAccessToken()) {
    setLocation("/login");
    return null;
  }

  const handleCreateAd = () => {
    setLocation("/campaigns/new");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700";
      case "approved":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
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

        <main className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : safeAds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Target: {ad.targetAudience}</span>
                      <span>{new Date(ad.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/campaigns/${ad.id}`)}
                        data-testid={`button-view-ad-${ad.id}`}>
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setLocation(`/campaigns/${ad.id}/analytics`)
                        }
                        data-testid={`button-analytics-${ad.id}`}>
                        Analytics
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
                No ads yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first advertising campaign to get started
              </p>
              <Button
                onClick={handleCreateAd}
                data-testid="button-create-first-ad">
                <i className="fas fa-plus mr-2"></i>
                Create Your First Ad
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
