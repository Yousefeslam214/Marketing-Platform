import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TokenManager } from "@/lib/auth";
import { ErrorState } from "@/components/Error";
import Loading from "@/components/Loading";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useState } from "react";
import { getStatusColor, VITE_API_BASE_URL } from "@/lib/utils";
import { analyticsCampaignPath } from "@/lib/paths";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdDetailProps {
  params: { id: string };
}

export default function AdDetail({ params }: AdDetailProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { id } = params;
  const limit = 5;
  const [page, setPage] = useState(1);
  const [creditAmount, setCreditAmount] = useState<number>(1);

  const { data, isLoading, error, refetch } = useApiQuery({
    key: [`/ads/${id}`, page, limit],
    url: `${VITE_API_BASE_URL}/api/advertising/${id}?page=${page}&limit=${limit}&status=approved`,
  });

  // Assign credit mutation
  const assignCreditMutation = useMutation({
    mutationFn: async (credit: number) => {
      const response = await apiRequest(
        "POST",
        `${VITE_API_BASE_URL}/api/advertising/${id}/assign-credit`,
        { credit }
      );
      return response.json();
    },
    onSuccess: (data) => {
      // Clear billing cache for user and admin
      queryClient.invalidateQueries({ queryKey: ["/api/payment/history"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/payment/getPurchaseHistoryForAdmin"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/payment/history/user"],
      });

      // // Clear any other related billing/payment queries
      // queryClient.invalidateQueries({ queryKey: ["/api/payment"] });
      // queryClient.invalidateQueries({ queryKey: ["/api/billing"] });

      // // Clear advertising queries
      // queryClient.invalidateQueries({ queryKey: ["/api/advertising"] });
      // queryClient.invalidateQueries({ queryKey: [`/api/advertising/${id}`] });

      toast({
        title: "Credit Assigned Successfully",
        description: `${data.data.credit} credit(s) assigned to ad campaign`,
      });
      refetch(); // Refresh ad data
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Assign Credit",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Activate ad mutation
  const activateAdMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "PUT",
        `${VITE_API_BASE_URL}/api/advertising/${id}/avctivate`
      );
      refetch(); // Refresh ad data
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ad Activated Successfully",
        description: "Your ad campaign is now active and running",
      });
      refetch(); // Refresh ad data
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Activate Ad",
        description:
          error.message ||
          "Cannot activate ad: insufficient impression credits",
        variant: "destructive",
      });
    },
  });
  // de Activate ad mutation
  const deActivateAdMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "PUT",
        `${VITE_API_BASE_URL}/api/advertising/${id}/deactivate`
      );
      refetch(); // Refresh ad data
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ad Activated Successfully",
        description: "Your ad campaign is now active and running",
      });
      refetch(); // Refresh ad data
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Activate Ad",
        description:
          error.message ||
          "Cannot activate ad: insufficient impression credits",
        variant: "destructive",
      });
    },
  });

  const handleAssignCredit = () => {
    if (creditAmount > 0) {
      assignCreditMutation.mutate(creditAmount);
    } else {
      toast({
        title: "Invalid Credit Amount",
        description: "Please enter a valid credit amount",
        variant: "destructive",
      });
    }
  };

  const handleActivateAd = () => {
    activateAdMutation.mutate();
  };
  const handleDeActivateAd = () => {
    deActivateAdMutation.mutate();
  };

  const ad = data?.data;
  console.log(ad);
  // Filter approved ads and type safely

  if (isLoading) {
    return <Loading />;
  }
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
    <div className="flex h-screen bg-background">
      <div className="flex-1 overflow-auto">
        <Header
          title={ad.titleEn}
          description="Ad campaign details and performance"
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getStatusColor(ad.status)}>{ad.status}</Badge>
              <Button
                variant="outline"
                onClick={() => setLocation(analyticsCampaignPath(id))}
                data-testid="button-view-analytics">
                <i className="fas fa-chart-bar mr-2"></i>
                View Analytics
              </Button>
              {ad.status === "approved" && (
                <>
                  <Button
                    onClick={() => setLocation(`/ads/${id}/purchase`)}
                    data-testid="button-purchase-impressions">
                    <i className="fas fa-credit-card mr-2"></i>
                    Purchase Impressions
                  </Button>
                </>
              )}
            </div>
          }
        />
        {isLoading ? (
          <Loading />
        ) : ad ? (
          <main className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Overview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
                      <i className="fas fa-eye text-blue-600 text-2xl mb-2"></i>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Impressions Credit
                      </h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {ad.impressionsCredit?.toLocaleString() || 0}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
                      <i className="fas fa-dollar-sign text-green-600 text-2xl mb-2"></i>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Amount Spent
                      </h4>
                      <p className="text-2xl font-bold text-green-600">
                        ${ad.spended?.toLocaleString() || 0}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-lg">
                      <i className="fas fa-heart text-red-600 text-2xl mb-2"></i>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Likes Count
                      </h4>
                      <p className="text-2xl font-bold text-red-600">
                        {ad.likesCount?.toLocaleString() || 0}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg">
                      <i
                        className={`fas ${
                          ad.active
                            ? "fa-play text-green-600"
                            : "fa-pause text-gray-600"
                        } text-2xl mb-2`}></i>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Status
                      </h4>
                      <p
                        className={`text-lg font-bold ${
                          ad.active ? "text-green-600" : "text-gray-600"
                        }`}>
                        {ad.active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Credit Management */}

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Campaign Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="credit-amount">Assign Credits:</Label>
                      <Input
                        id="credit-amount"
                        type="number"
                        min="1"
                        value={creditAmount}
                        onChange={(e) =>
                          setCreditAmount(Number(e.target.value))
                        }
                        className="w-24"
                        placeholder="1"
                      />
                      <Button
                        onClick={handleAssignCredit}
                        disabled={
                          assignCreditMutation.isPending || creditAmount <= 0
                        }
                        data-testid="button-assign-credit">
                        {assignCreditMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Assigning...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-coins mr-2"></i>
                            Assign Credit
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        onClick={handleActivateAd}
                        disabled={activateAdMutation.isPending}
                        variant="default"
                        data-testid="button-activate-ad-main">
                        {activateAdMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Activating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-rocket mr-2"></i>
                            Activate Campaign
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        onClick={handleDeActivateAd}
                        disabled={deActivateAdMutation.isPending}
                        variant="default"
                        data-testid="button-activate-ad-main">
                        {deActivateAdMutation.isPending ? (
                            <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            DeActivating...
                            </>
                          ) : (
                            <>
                            <i className="fas fa-ban mr-2"></i>
                            DeActivate Campaign
                            </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <i className="fas fa-info-circle mr-2"></i>
                      Assign credits to this campaign before activation. Each
                      credit represents impression capacity for your ads.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Ad Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Ad Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      English Title
                    </h4>
                    <p className="text-foreground" data-testid="ad-title-en">
                      {ad.titleEn}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Arabic Title
                    </h4>
                    <p
                      className="text-foreground"
                      dir="rtl"
                      data-testid="ad-title-ar">
                      {ad.titleAr}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      English Description
                    </h4>
                    <p
                      className="text-foreground"
                      data-testid="ad-description-en">
                      {ad.descriptionEn}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Arabic Description
                    </h4>
                    <p
                      className="text-foreground"
                      dir="rtl"
                      data-testid="ad-description-ar">
                      {ad.descriptionAr}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Target URL
                    </h4>
                    <a
                      href={ad.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      data-testid="ad-target-url">
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
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Campaign Status
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(ad.status)}>
                        {ad.status}
                      </Badge>
                      {ad.active && (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600">
                          <i className="fas fa-play mr-1"></i>
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Target Audience
                    </h4>
                    <p
                      className="text-foreground"
                      data-testid="ad-target-audience">
                      {ad.targetAudience}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Budget Type
                    </h4>
                    <p
                      className="text-foreground capitalize"
                      data-testid="ad-budget-type">
                      {ad.budgetType}
                    </p>
                  </div>

                  {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Impressions Credit
                      </h4>
                      <p className="text-2xl font-bold text-foreground" data-testid="ad-impressions-credit">
                        {ad.impressionsCredit?.toLocaleString() || 0}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Amount Spent
                      </h4>
                      <p className="text-2xl font-bold text-foreground" data-testid="ad-spent">
                        ${ad.spended?.toLocaleString() || 0}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Likes Count
                      </h4>
                      <p className="text-2xl font-bold text-foreground" data-testid="ad-likes-count">
                        {ad.likesCount?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div> */}

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Created
                    </h4>
                    <p
                      className="text-foreground"
                      data-testid="ad-created-date">
                      {new Date(ad.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Last Updated
                    </h4>
                    <p
                      className="text-foreground"
                      data-testid="ad-updated-date">
                      {new Date(ad.updatedAt).toLocaleString()}
                    </p>
                  </div>

                  {ad.approvedBy && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Approved By
                      </h4>
                      <p
                        className="text-foreground"
                        data-testid="ad-approved-by">
                        {ad.approvedBy}
                      </p>
                    </div>
                  )}

                  {ad.publishToken && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Publish Token
                      </h4>
                      <p
                        className="text-foreground font-mono text-sm bg-muted p-2 rounded"
                        data-testid="ad-publish-token">
                        {ad.publishToken}
                      </p>
                    </div>
                  )}

                  {ad.pageId && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Page ID
                      </h4>
                      <p className="text-foreground" data-testid="ad-page-id">
                        {ad.pageId}
                      </p>
                    </div>
                  )}

                  {ad.postIdOnPlatform && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Post ID on Platform
                      </h4>
                      <p className="text-foreground" data-testid="ad-post-id">
                        {ad.postIdOnPlatform}
                      </p>
                    </div>
                  )}

                  {/* <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      User ID
                    </h4>
                    <p
                      className="text-foreground font-mono text-sm"
                      data-testid="ad-user-id">
                      {ad.userId}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Ad ID
                    </h4>
                    <p
                      className="text-foreground font-mono text-sm"
                      data-testid="ad-id">
                      {ad.id}
                    </p>
                  </div> */}

                  {ad.rejectionReason && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Rejection Reason
                      </h4>
                      <p
                        className="text-destructive"
                        data-testid="ad-rejection-reason">
                        {ad.rejectionReason}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Media Links */}
              {(ad.facebookLink ||
                ad.instagramLink ||
                ad.tiktokLink ||
                ad.youtubeLink ||
                ad.snapchatLink ||
                ad.googleAdsLink) && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Social Media Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {ad.facebookLink && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <i className="fab fa-facebook text-blue-600 text-lg"></i>
                          <a
                            href={ad.facebookLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm truncate"
                            data-testid="ad-facebook-link">
                            Facebook
                          </a>
                        </div>
                      )}

                      {ad.instagramLink && (
                        <div className="flex items-center gap-2 p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
                          <i className="fab fa-instagram text-pink-600 text-lg"></i>
                          <a
                            href={ad.instagramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:underline text-sm truncate"
                            data-testid="ad-instagram-link">
                            Instagram
                          </a>
                        </div>
                      )}

                      {ad.tiktokLink && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                          <i className="fab fa-tiktok text-gray-800 dark:text-gray-200 text-lg"></i>
                          <a
                            href={ad.tiktokLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-800 dark:text-gray-200 hover:underline text-sm truncate"
                            data-testid="ad-tiktok-link">
                            TikTok
                          </a>
                        </div>
                      )}

                      {ad.youtubeLink && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                          <i className="fab fa-youtube text-red-600 text-lg"></i>
                          <a
                            href={ad.youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:underline text-sm truncate"
                            data-testid="ad-youtube-link">
                            YouTube
                          </a>
                        </div>
                      )}

                      {ad.snapchatLink && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                          <i className="fab fa-snapchat text-yellow-500 text-lg"></i>
                          <a
                            href={ad.snapchatLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yellow-600 hover:underline text-sm truncate"
                            data-testid="ad-snapchat-link">
                            Snapchat
                          </a>
                        </div>
                      )}

                      {ad.googleAdsLink && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <i className="fab fa-google text-green-600 text-lg"></i>
                          <a
                            href={ad.googleAdsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline text-sm truncate"
                            data-testid="ad-google-ads-link">
                            Google Ads
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

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
        ) : (
          <div className="flex h-screen bg-background">
            {/* <Sidebar /> */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Ad not found
                </h2>
                <Button onClick={() => setLocation("/campaigns")}>
                  Back to Campaigns
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
