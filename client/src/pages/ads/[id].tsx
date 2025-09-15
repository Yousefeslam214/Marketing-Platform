import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdDetailProps {
  params: { id: string };
}

export default function AdDetail({ params }: AdDetailProps) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { id } = params;

  const { data: ad, isLoading } = useQuery({
    queryKey: ["/api/ads", id],
    enabled: isAuthenticated && !!id,
  });

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Ad not found</h2>
            <Button onClick={() => setLocation("/ads")}>
              Back to Ads
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <Header
          title={ad.titleEn}
          description="Ad campaign details and performance"
          actions={
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(ad.status)}>
                {ad.status}
              </Badge>
              <Button 
                variant="outline"
                onClick={() => setLocation(`/ads/${id}/analytics`)}
                data-testid="button-view-analytics"
              >
                <i className="fas fa-chart-bar mr-2"></i>
                View Analytics
              </Button>
              {ad.status === "approved" && (
                <Button 
                  onClick={() => setLocation(`/ads/${id}/purchase`)}
                  data-testid="button-purchase-impressions"
                >
                  <i className="fas fa-credit-card mr-2"></i>
                  Purchase Impressions
                </Button>
              )}
            </div>
          }
        />

        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ad Content */}
            <Card>
              <CardHeader>
                <CardTitle>Ad Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">English Title</h4>
                  <p className="text-foreground" data-testid="ad-title-en">{ad.titleEn}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Arabic Title</h4>
                  <p className="text-foreground" dir="rtl" data-testid="ad-title-ar">{ad.titleAr}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">English Description</h4>
                  <p className="text-foreground" data-testid="ad-description-en">{ad.descriptionEn}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Arabic Description</h4>
                  <p className="text-foreground" dir="rtl" data-testid="ad-description-ar">{ad.descriptionAr}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Target URL</h4>
                  <a 
                    href={ad.targetUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    data-testid="ad-target-url"
                  >
                    {ad.targetUrl}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Ad Details */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Target Audience</h4>
                  <p className="text-foreground capitalize" data-testid="ad-target-audience">
                    {ad.targetAudience}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Budget Type</h4>
                  <p className="text-foreground capitalize" data-testid="ad-budget-type">
                    {ad.budgetType}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Created</h4>
                  <p className="text-foreground" data-testid="ad-created-date">
                    {new Date(ad.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h4>
                  <p className="text-foreground" data-testid="ad-updated-date">
                    {new Date(ad.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                {ad.rejectionReason && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Rejection Reason</h4>
                    <p className="text-destructive" data-testid="ad-rejection-reason">
                      {ad.rejectionReason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ad Preview */}
            {ad.imageUrl && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Ad Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-w-md mx-auto">
                    <img 
                      src={ad.imageUrl} 
                      alt={ad.titleEn}
                      className="w-full rounded-lg"
                      data-testid="ad-image-preview"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
