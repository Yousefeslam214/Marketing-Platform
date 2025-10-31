import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorState } from "@/components/Error";
import Loading from "@/components/Loading";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useEffect, useState } from "react";
import { getStatusColor, VITE_API_BASE_URL } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TokenManager } from "@/lib/auth";
import { ImageCarousel } from "@/components/ui/image-carousel";
import SocialLinks from "@/components/ad/social-links";

interface AdDetailProps {
  params: { id: string };
}

export default function AdDetail({ params }: AdDetailProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const { id } = params;
  const userRole = TokenManager.getRole();
  const [adActivationStatus, setAdActivationStatus] = useState(false);
  const [adPromoteStatus, setAdPromoteStatus] = useState(false);

  const [creditAmount, setCreditAmount] = useState<number>(1);

  const { data, isLoading, error, refetch } = useApiQuery({
    key: [`/ads/${id}`],
    url: `${VITE_API_BASE_URL}/api/advertising/${id}`,
  });

  console.log(data);
  console.log("[id].tsx");

  useEffect(() => {
    // Initialize adActivationStatus from API response when available
    if (!data?.data) return;
    const payload = data.data as any;
    if (userRole === "user") {
      setAdActivationStatus(Boolean(payload.userActivation));
    } else if (userRole === "admin") {
      setAdActivationStatus(Boolean(payload.active));
    }
    setAdPromoteStatus(data.data.hasPromoted);
  }, [data, userRole]);

  // Fetch user's payment history for this ad (or user-wide history)
  const { data: paymentHistoryResponse, isLoading: isLoadingHistory } =
    useApiQuery({
      key: ["/api/payment/history/user"],
      // enabled: !!TokenManager.getAccessToken(),
      url: `${VITE_API_BASE_URL}/api/payment/history`,
    });

  // Fetch impression ratios from API
  const { data: impressionRatiosResponse, isLoading: isLoadingRatios } =
    useApiQuery({
      key: ["/api/users/impression-ratios"],
      url: `${VITE_API_BASE_URL}/api/users/impression-ratios`,
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
      queryClient.clear();
      toast({
        title: t("adDetail", "creditAssignedSuccess"),
        description: `${data.data.credit} ${t(
          "adDetail",
          "creditsAssignedMessage"
        )}`,
      });
      refetch(); // Refresh ad data
    },
    onError: (error: any) => {
      toast({
        title: t("adDetail", "failedToAssignCredit"),
        description: error.message || t("adDetail", "pleaseRetryLater"),
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
      const body = await response.json();
      // If server returned non-2xx or explicit success:false, treat as error
      if (!response.ok || (body && body.success === false)) {
        const msg = body?.message || t("adDetail", "failedToActivateAd");
        throw new Error(msg);
      }
      queryClient.clear();
      return body;
    },

    onSuccess: (res: any) => {
      // Update UI state and cache after successful activation
      setAdActivationStatus(true);
      queryClient.invalidateQueries({ queryKey: [`/ads/${id}`] });
      toast({
        title: t("adDetail", "adActivatedSuccess"),
        description: t("adDetail", "campaignActiveMessage"),
      });
      refetch(); // Refresh ad data
    },
    onError: (error: any) => {
      toast({
        title: t("adDetail", "failedToActivateAd"),
        description:
          error.message || t("adDetail", "insufficientCreditsMessage"),
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
      queryClient.clear();
      return response.json();
    },
    onSuccess: (res: any) => {
      // Update UI state and invalidate cache after successful deactivation
      setAdActivationStatus(false);
      queryClient.invalidateQueries({ queryKey: [`/ads/${id}`] });
      toast({
        title: t("adDetail", "adDeactivatedSuccess") || "Ad Deactivated",
        description:
          t("adDetail", "campaignDeactivatedMessage") ||
          "Your ad campaign has been paused",
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

  // Promote ad mutation
  const promoteAdMutation = useMutation({
    mutationFn: async () => {
      if (adPromoteStatus) {
        toast({
          title: t("adDetail", "promoteSuccess") || "Ad Promoted",
          description:
            t("adDetail", "promoteSuccessDescription") ||
            "Your ad has been promoted successfully.",
        });
        // Prevent API call if already promoted
        return;
      }

      const response = await apiRequest(
        "PUT",
        `${VITE_API_BASE_URL}/api/advertising/${id}/promote`
      );
      const body = await response.json();

      if (!response.ok || (body && body.success === false)) {
        const msg = body?.message || t("adDetail", "failedToPromoteAd");
        throw new Error(msg);
      }

      return body;
    },

    onSuccess: (res: any) => {
      if (!res) return; // prevent success toast when already promoted
      setAdPromoteStatus(true);
      queryClient.invalidateQueries({ queryKey: [`/ads/${id}`] });
      toast({
        title: t("adDetail", "promoteSuccess") || "Ad Promoted",
        description:
          t("adDetail", "promoteSuccessDescription") ||
          "Your ad has been promoted successfully.",
      });
      refetch();
    },

    onError: (err: any) => {
      toast({
        title: t("adDetail", "failedToPromoteAd") || "Failed to Promote",
        description: err.message || t("adDetail", "pleaseRetryLater"),
        variant: "destructive",
      });
    },
  });

  // Depromote ad mutation
  const depromoteAdMutation = useMutation({
    mutationFn: async () => {
      if (!adPromoteStatus) {
        // already not promoted
        toast({
          title: t("adDetail", "alreadyDepromoted") || "Already depromoted",
        });
        return;
      }

      const response = await apiRequest(
        "PUT",
        `${VITE_API_BASE_URL}/api/advertising/${id}/depromote`
      );
      const body = await response.json();
      if (!response.ok || (body && body.success === false)) {
        const msg = body?.message || t("adDetail", "failedToDepromoteAd");
        throw new Error(msg);
      }
      return body;
    },
    onSuccess: (res: any) => {
      setAdPromoteStatus(true);
      queryClient.invalidateQueries({ queryKey: [`/ads/${id}`] });
      toast({
        title: t("adDetail", "depromoteSuccess") || "Ad Depromoted",
        description:
          t("adDetail", "depromoteSuccessDescription") ||
          "Your ad has been moved back.",
      });
      refetch();
    },
    onError: (err: any) => {
      toast({
        title: t("adDetail", "failedToDepromoteAd") || "Failed to Depromote",
        description: err.message || t("adDetail", "pleaseRetryLater"),
        variant: "destructive",
      });
    },
  });

  const handleAssignCredit = () => {
    if (creditAmount > 0) {
      assignCreditMutation.mutate(creditAmount);
    } else {
      toast({
        title: t("adDetail", "invalidCreditAmount"),
        description: t("adDetail", "enterValidCredit"),
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

  const ad: any = data?.data;
  console.log(ad);

  // Filter approved ads and type safely

  if (isLoading) {
    return <Loading />;
  }
  if (error) {
    return (
      <div className="flex flex-center justify-center h-screen bg-background">
        <ErrorState
          title={t("adDetail", "failedToLoadMetrics")}
          message={
            (error as Error)?.message || t("adDetail", "pleaseRetryLater")
          }
          onRetry={() => refetch()}
          showHomeButton
          onHome={() => (window.location.href = "/")} // or use your router
        />
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto flex flex-col">
        <div className="sticky top-0 z-10 bg-card">
          <Header
            title={
              isRTL
                ? ad?.titleAr || t("adDetail", "title")
                : ad?.titleEn || t("adDetail", "title")
            }
            description={t("adDetail", "description")}
            actions={
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getStatusColor(ad.status)}>{ad.status}</Badge>
                {ad.status === "approved" && (
                  <>
                    <Button
                      onClick={() => setLocation(handlePurchase())}
                      data-testid="button-purchase-impressions">
                      <i className="fas fa-credit-card mx-2"></i>
                      {t("adDetail", "purchaseImpressions")}
                    </Button>
                    <Button
                      onClick={() => promoteAdMutation.mutate()}
                      disabled={promoteAdMutation.isPending}
                      data-testid="button-promote-ad">
                      {promoteAdMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mx-2"></i>
                          {t("adDetail", "promoting")}
                        </>
                      ) : (
                        <>
                          <i className="fas fa-bullhorn mx-2"></i>
                          {t("adDetail", "promote")}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            }
          />
        </div>
        {isLoading ? (
          <Loading />
        ) : ad ? (
          <main className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Overview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t("adDetail", "performanceOverview")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
                      <i className="fas fa-eye text-blue-600 text-2xl mb-2"></i>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {t("adDetail", "impressionsCredit")}
                      </h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {ad.impressionsCredit?.toLocaleString() || 0}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
                      {/* Render SAR currency symbol instead of unavailable icon component */}
                      <span
                        className="inline-block text-2xl mb-2 font-bold text-green-600"
                        aria-hidden>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-saudi-riyal-icon lucide-saudi-riyal">
                          <path d="m20 19.5-5.5 1.2" />
                          <path d="M14.5 4v11.22a1 1 0 0 0 1.242.97L20 15.2" />
                          <path d="m2.978 19.351 5.549-1.363A2 2 0 0 0 10 16V2" />
                          <path d="M20 10 4 13.5" />
                        </svg>
                      </span>

                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {t("adDetail", "amountSpent")}
                      </h4>
                      <p className="text-2xl font-bold text-green-600">
                        {ad.spended?.toLocaleString() || 0}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-lg">
                      <i className="fas fa-heart text-red-600 text-2xl mb-2"></i>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {t("adDetail", "likesCount")}
                      </h4>
                      <p className="text-2xl font-bold text-red-600">
                        {ad.likesCount?.toLocaleString() || 0}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg">
                      <i
                        className={`fas ${
                          adActivationStatus
                            ? "fa-play text-green-600"
                            : "fa-pause text-gray-600"
                        } text-2xl mb-2`}></i>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {t("adDetail", "status")}
                      </h4>
                      <p
                        className={`text-lg font-bold ${
                          adActivationStatus
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}>
                        {adActivationStatus
                          ? t("adDetail", "active")
                          : t("adDetail", "inactive")}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg">
                      <i
                        className={`fas ${
                          adPromoteStatus
                            ? "fa-play text-green-600"
                            : "fa-pause text-gray-600"
                        } text-2xl mb-2`}></i>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {t("adDetail", "Promote Status")}
                      </h4>
                      <p
                        className={`text-lg font-bold ${
                          ad.hasPromoted ? "text-green-600" : "text-gray-600"
                        }`}>
                        {adPromoteStatus
                          ? t("adDetail", "active")
                          : t("adDetail", "inactive")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Credit Management */}

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t("adDetail", "campaignManagement")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="credit-amount">
                        {t("adDetail", "assignCredits")}:
                      </Label>
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
                            <i className="fas fa-spinner fa-spin mx-2"></i>
                            {t("adDetail", "assigning")}
                          </>
                        ) : (
                          <>
                            <i className="fas fa-coins mx-2"></i>
                            {t("adDetail", "assignCredit")}
                          </>
                        )}
                      </Button>
                      <div className="flex items-center gap-2 mx-5">
                        {!adPromoteStatus ? (
                          <Button
                            onClick={() => promoteAdMutation.mutate()}
                            disabled={promoteAdMutation.isPending}
                            data-testid="button-promote-ad">
                            {promoteAdMutation.isPending ? (
                              <>
                                <i className="fas fa-spinner fa-spin mx-2"></i>
                                {t("adDetail", "promoting")}
                              </>
                            ) : (
                              <>
                                <i className="fas fa-bullhorn mx-2"></i>
                                {t("adDetail", "promote")}
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => depromoteAdMutation.mutate()}
                            disabled={depromoteAdMutation.isPending}
                            data-testid="button-depromote-ad"
                            variant="outline">
                            {depromoteAdMutation.isPending ? (
                              <>
                                <i className="fas fa-spinner fa-spin mx-2"></i>
                                {t("adDetail", "depromoting")}
                              </>
                            ) : (
                              <>
                                <i className="fas fa-level-down-alt mx-2"></i>
                                {t("adDetail", "depromote")}
                              </>
                            )}
                          </Button>
                        )}

                        {!adActivationStatus ? (
                          <Button
                            onClick={handleActivateAd}
                            disabled={activateAdMutation.isPending}
                            variant="default"
                            data-testid="button-activate-ad-main">
                            {activateAdMutation.isPending ? (
                              <>
                                <i className="fas fa-spinner fa-spin mx-2"></i>
                                {t("adDetail", "activating")}
                              </>
                            ) : (
                              <>
                                <i className="fas fa-rocket mx-2"></i>
                                {t("adDetail", "activateCampaign")}
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={handleDeActivateAd}
                            disabled={deActivateAdMutation.isPending}
                            variant="default"
                            data-testid="button-activate-ad-main">
                            {deActivateAdMutation.isPending ? (
                              <>
                                <i className="fas fa-spinner fa-spin mx-2"></i>
                                {t("adDetail", "deactivating")}
                              </>
                            ) : (
                              <>
                                <i className="fas fa-ban mx-2"></i>
                                {t("adDetail", "deactivateCampaign")}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      {/* Show user's current payment balance (if available) */}
                      <div className="ml-4">
                        <div className="text-sm text-muted-foreground">
                          Balance
                        </div>
                        <div className="text-lg font-semibold">
                          {paymentHistoryResponse?.data?.balance ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Impression Ratios (show inside Campaign Management for convenience) */}
                  <div className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Impression Ratios</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoadingRatios ? (
                          <div>Loading impression ratios…</div>
                        ) : (
                          (() => {
                            const ratios =
                              (impressionRatiosResponse?.data as any[]) || [];
                            if (!ratios || ratios.length === 0) {
                              return (
                                <div className="text-sm text-muted-foreground">
                                  No impression ratios found.
                                </div>
                              );
                            }
                            return (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {ratios.map((r: any) => (
                                  <div
                                    key={r.id || r.currency}
                                    className="flex items-center justify-between gap-2 p-2 bg-muted/20 rounded">
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-medium">
                                        {(r.currency || "").toUpperCase()}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {r.impressionsPerUnit}
                                      </div>
                                    </div>
                                    <div>
                                      {r.promoted ? (
                                        <span className="inline-block text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                                          Promoted
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <i className="fas fa-info-circle mx-2"></i>
                      {t("adDetail", "creditAssignInfo")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <i className="fas fa-info-circle mx-2"></i>
                      Promoting this ad will pin it near the top of the public
                      feed to increase its visibility to viewers.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Ad Content */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("adDetail", "adContent")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ad.titleEn && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {t("adDetail", "englishTitle")}
                      </h4>
                      <p className="text-foreground" data-testid="ad-title-en">
                        {ad.titleEn}
                      </p>
                    </div>
                  )}

                  <div>
                    {ad.titleAr && (
                      <>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          {t("adDetail", "arabicTitle")}
                        </h4>
                        <p
                          className="text-foreground"
                          dir="rtl"
                          data-testid="ad-title-ar">
                          {ad.titleAr}
                        </p>
                      </>
                    )}
                  </div>
                  {ad.descriptionEn && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {t("adDetail", "englishDescription")}
                      </h4>
                      <p
                        className="text-foreground"
                        data-testid="ad-description-en">
                        {ad.descriptionEn}
                      </p>
                    </div>
                  )}
                  {ad.descriptionAr && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {t("adDetail", "arabicDescription")}
                      </h4>
                      <p
                        className="text-foreground"
                        dir="rtl"
                        data-testid="ad-description-ar">
                        {ad.descriptionAr}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ad Details */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("adDetail", "campaignDetails")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {t("adDetail", "campaignStatus")}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(ad.status)}>
                        {ad.status}
                      </Badge>
                      {adActivationStatus && (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600">
                          <i className="fas fa-play mx-1"></i>
                          {t("adDetail", "active")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {t("adDetail", "targetAudience")}
                    </h4>
                    <p
                      className="text-foreground"
                      data-testid="ad-target-audience">
                      {ad.targetAudience}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {t("adDetail", "targetCities")}
                    </h4>
                    <p
                      className="text-foreground"
                      data-testid="ad-target-cities">
                      {Array.isArray(ad.targetCities) &&
                      ad.targetCities.length > 0
                        ? ad.targetCities.join(", ")
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {t("adDetail", "budgetType")}
                    </h4>
                    <p
                      className="text-foreground capitalize"
                      data-testid="ad-budget-type">
                      {ad.budgetType}
                    </p>
                  </div>

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
              {/* Payment history and Impression Ratios */}
              {/* <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentHistoryResponse?.data?.balance}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impression Ratios</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingRatios ? (
                    <div>Loading impression ratios…</div>
                  ) : (
                    (() => {
                      const ratios = (impressionRatiosResponse?.data as any[]) || [];
                      if (!ratios || ratios.length === 0) {
                        return (
                          <div className="text-sm text-muted-foreground">
                            No impression ratios found.
                          </div>
                        );
                      }
                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {ratios.map((r: any) => (
                            <div
                              key={r.id || r.currency}
                              className="flex items-center justify-between gap-2 p-2 bg-muted/20 rounded">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium">{(r.currency || "").toUpperCase()}</div>
                                <div className="text-xs text-muted-foreground">{r.impressionsPerUnit}</div>
                              </div>
                              <div>
                                {r.promoted ? (
                                  <span className="inline-block text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Promoted</span>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </CardContent>
              </Card> */}

              <SocialLinks ad={ad} />

              {/* Ad Preview */}
              {ad.imageUrl && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>{t("adDetail", "adPreview")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-w-md mx-auto">
                      {ad.imageUrl && ad.imageUrl.length > 0 ? (
                        // Array.isArray(ad.imageUrl)
                        <ImageCarousel
                          images={ad?.imageUrl}
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
