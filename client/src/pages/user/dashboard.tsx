import { useLocation } from "wouter";
import { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalyticsChart } from "@/components/analytics/analytics-chart";
import { useLanguage } from "@/hooks/use-language";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { TokenManager } from "@/lib/auth";
import { useApiQuery } from "@/hooks/useApiQuery";
import { VITE_API_BASE_URL } from "@/lib/utils";

export default function Dashboard() {
  // const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { isRTL, t, language } = useLanguage();

  // Define types for dashboard data
  type DashboardStats = {
    totalImpressions?: number;
    impressionGrowth?: number;
    totalClicks?: number;
    clickGrowth?: number;
    clickThroughRate?: number;
    ctrGrowth?: number;
    remainingBalance?: number;
    balanceGrowth?: number;
  };

  type TopAd = {
    id: string;
    imageUrl?: string;
    titleAr?: string;
    titleEn?: string;
    impressions: number;
    clicks: number;
    ctr: number;
  };

  type ActivityItem = {
    id: string;
    type: string;
    adTitle: string;
    createdAt: string;
    source?: string;
  };

  type DashboardData = {
    stats?: DashboardStats;
    topAds?: TopAd[];
    chartData?: [];
    activity?: ActivityItem[];
  };

  const {
    data: dashboardData,
    isLoading: metricsLoading,

    refetch,
  } = useApiQuery<{ data?: DashboardData }>({
    key: ["/api/dashboard/user"],
    url: `${VITE_API_BASE_URL}/api/dashboard/user`,
  });

  console.log("Dashboard Data:", dashboardData);
  // Check for token in URL parameters and auto-authenticate
  useEffect(() => {
    // Only run token detection logic if we're on the dashboard page
    const currentPath = window.location.pathname;
    if (!currentPath.includes("/dashboard")) {
      return;
    }

    // Handle both correct (?token=...) and incorrect (&token=...) URL formats
    let tokenFromUrl = null;

    // First, try standard URL parameters (after ?)
    const urlParams = new URLSearchParams(window.location.search);
    tokenFromUrl = urlParams.get("token");
    const roleFromUrl = urlParams.get("role");
    const usernameFromUrl = urlParams.get("username");

    // If no token found and URL contains &token=, handle the incorrect format
    if (!tokenFromUrl && window.location.href.includes("&token=")) {
      // Extract token from the malformed URL
      const urlParts = window.location.href.split("&token=");
      if (urlParts.length > 1) {
        // Get the token part and remove any additional parameters
        tokenFromUrl = urlParts[1].split("&")[0];

        // Fix the URL format and redirect to correct format
        const baseUrl = urlParts[0];
        const correctUrl = `${baseUrl}?token=${tokenFromUrl}`;

        window.location.href = correctUrl;
        return; // Exit early as we're redirecting
      }
    }

    if (tokenFromUrl) {
      // Set the token in localStorage for authentication
      TokenManager.setTokens(
        tokenFromUrl,
        usernameFromUrl || "",
        roleFromUrl || ""
      );

      // Remove token from URL for security and clean URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      // Trigger refetch of dashboard data with new token
      setTimeout(() => {
        refetch();
      }, 100);
    } else {
      // No token in URL, check if user is authenticated
      const currentToken = TokenManager.getAccessToken();
      if (!currentToken) {
        setLocation("/login");
        return;
      }
    }
  }, [refetch, setLocation]);

  // const dashboardData2 = Array.isArray(dashboardData?.data) ? (dashboardData?.data as AdData[]) : [];

  // Type-safe metrics with defaults from the new API structure
  const dashboardPayload = dashboardData?.data as DashboardData | undefined;
  const stats = dashboardPayload?.stats || {};
  const topAds = dashboardPayload?.topAds || [];
  const chartData = dashboardPayload?.chartData || [];
  const activity = dashboardPayload?.activity || [];

  const safeMetrics = {
    totalImpressions: stats.totalImpressions || 0,
    impressionGrowth: stats.impressionGrowth || 0,
    totalClicks: stats.totalClicks || 0,
    clickGrowth: stats.clickGrowth || 0,
    ctr: stats.clickThroughRate || 0,
    ctrGrowth: stats.ctrGrowth || 0,
    creditsRemaining: stats.remainingBalance || 0,
    balanceGrowth: stats.balanceGrowth || 0,
  };

  const handleCreateAd = () => {
    setLocation("/campaigns/new");
  };

  const handlePurchaseCredits = () => {
    setLocation("/billing");
  };

  return (
    <div className={`flex h-screen bg-background ${isRTL}`}>
      <div className="flex-1 overflow-auto">
        <Header
          title={t("dashboard", "title")}
          description={t("dashboard", "description")}
          actions={
            <div className="items-center gap-4 flex">
              <LanguageToggle />
              <Button onClick={handleCreateAd} data-testid="button-create-ad">
                <i className={`fas fa-plus ${isRTL ? "ml-2" : "mx-2"}`}></i>
                {t("dashboard", "createNewAd")}
              </Button>
            </div>
          }
        />

        <main className="p-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-chart-1/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-eye text-chart-1"></i>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${
                      safeMetrics.totalImpressions >= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                    {safeMetrics.impressionGrowth >= 0 ? "+" : ""}
                    {safeMetrics.impressionGrowth.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("dashboard", "totalImpressions")}
                </p>
                <p
                  className="text-2xl font-bold text-foreground"
                  data-testid="metric-impressions">
                  {metricsLoading
                    ? t("dashboard", "loading")
                    : safeMetrics.totalImpressions.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-mouse-pointer text-chart-2"></i>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${
                      safeMetrics.clickGrowth >= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                    {safeMetrics.clickGrowth >= 0 ? "+" : ""}
                    {safeMetrics.clickGrowth.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("dashboard", "totalClicks")}
                </p>
                <p
                  className="text-2xl font-bold text-foreground"
                  data-testid="metric-clicks">
                  {metricsLoading
                    ? t("dashboard", "loading")
                    : safeMetrics.totalClicks.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-percentage text-chart-3"></i>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${
                      safeMetrics.ctrGrowth >= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                    {safeMetrics.ctrGrowth >= 0 ? "+" : ""}
                    {safeMetrics.ctrGrowth.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("dashboard", "ctr")}
                </p>
                <p
                  className="text-2xl font-bold text-foreground"
                  data-testid="metric-ctr">
                  {metricsLoading
                    ? t("dashboard", "loading")
                    : `${safeMetrics.ctr.toFixed(2)}%`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center">
                    {/* <i className="fas fa-coins text-chart-4"></i> */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
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
                  </div>

                  <Badge
                    variant="secondary"
                    className={`${
                      safeMetrics.balanceGrowth >= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                    {safeMetrics.balanceGrowth >= 0 ? "+" : ""}
                    {safeMetrics.balanceGrowth.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("dashboard", "creditsRemaining")}
                </p>
                <p
                  className="text-2xl font-bold text-foreground"
                  data-testid="metric-credits">
                  {metricsLoading
                    ? t("dashboard", "loading")
                    : safeMetrics.creditsRemaining.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Performance Chart */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground">
                      {t("dashboard", "performanceOverview")}
                    </h3>
                    <select className="text-sm bg-background border border-border rounded-md px-3 py-1.5 text-foreground">
                      <option>{t("dashboard", "last7Days")}</option>
                      <option>{t("dashboard", "last30Days")}</option>
                      <option>{t("dashboard", "last90Days")}</option>
                    </select>
                  </div>
                  <AnalyticsChart data={chartData} />
                </CardContent>
              </Card>
            </div>

            {/* Top Ads */}
            <Card>
              <CardContent className="p-6 ">
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  {t("dashboard", "topPerformingAds")}
                </h3>
                <div className="space-y-4 h-[11rem]">
                  {topAds.length > 0 ? (
                    topAds.slice(0, 3).map((ad: any) => (
                      <div
                        key={ad.id}
                        className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {ad.imageUrl ? (
                            <img
                              src={ad.imageUrl[0]}
                              alt={language === "ar" ? ad.titleAr : ad.titleEn}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <i className="fas fa-ad text-muted-foreground"></i>
                          )}
                        </div>
                        <div className="flex-1  !mx-3">
                          <p className="font-medium text-sm truncate">
                            {language === "ar" ? ad.titleAr : ad.titleEn}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                            <span>
                              <i className="fas fa-eye mx-1"></i>
                              {ad.impressions.toLocaleString()}
                            </span>
                            <span>
                              <i className="fas fa-mouse-pointer mx-1"></i>
                              {ad.clicks.toLocaleString()}
                            </span>
                            <span>
                              <i className="fas fa-percentage mx-1"></i>
                              {ad.ctr.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-ad text-4xl text-muted-foreground mb-4"></i>
                      <p className="text-sm text-muted-foreground">
                        {t("dashboard", "noAdsCreated")}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={handleCreateAd}
                        data-testid="button-create-first-ad">
                        {t("dashboard", "createFirstAd")}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  {t("dashboard", "recentActivity")}
                </h3>
                {activity.length > 0 ? (
                  <div
                    className="space-y-3
                  overflow-y-auto max-h-32
                  ">
                    {activity.map((item: any) => {
                      const getActivityIcon = (type: string) => {
                        switch (type) {
                          case "click":
                            return "fas fa-mouse-pointer text-blue-500";
                          case "impression":
                            return "fas fa-eye text-green-500";
                          case "conversion":
                            return "fas fa-check-circle text-purple-500";
                          default:
                            return "fas fa-activity text-gray-500";
                        }
                      };

                      const getActivityText = (type: string) => {
                        switch (type) {
                          case "click":
                            return (
                              t("dashboard", "clickActivity") || "Ad clicked"
                            );
                          case "impression":
                            return (
                              t("dashboard", "impressionActivity") ||
                              "Ad viewed"
                            );
                          case "conversion":
                            return (
                              t("dashboard", "conversionActivity") ||
                              "Conversion"
                            );
                          default:
                            return (
                              t("dashboard", "unknownActivity") || "Activity"
                            );
                        }
                      };

                      const formatTime = (dateString: string) => {
                        const date = new Date(dateString);
                        const now = new Date();
                        const diffInMinutes = Math.floor(
                          (now.getTime() - date.getTime()) / (1000 * 60)
                        );

                        if (diffInMinutes < 1)
                          return t("dashboard", "justNow") || "Just now";
                        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
                        if (diffInMinutes < 1440)
                          return `${Math.floor(diffInMinutes / 60)}h ago`;
                        return date.toLocaleDateString();
                      };

                      return (
                        <div
                          key={item.id}
                          className={`flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
                            isRTL ? "space-x-reverse" : ""
                          }`}
                          style={{ gap: "12px" }}>
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <i
                              className={`${getActivityIcon(
                                item.type
                              )} text-xs`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {getActivityText(item.type)}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.adTitle}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(item.createdAt)}
                            </span>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                              {item.source ? (
                                <Badge
                                  variant="secondary"
                                  className="text-xs capitalize">
                                  {item.source}
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-history text-4xl text-muted-foreground mb-4"></i>
                    <p className="text-sm text-muted-foreground">
                      {t("dashboard", "noRecentActivity")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Billing Overview */}
            <Card className="h-fit">
              <CardContent className="p-6 ">
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  {t("dashboard", "billingOverview")}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t("dashboard", "currentBalance")}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {t("dashboard", "availableCredits")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="flex row self-center items-center text-lg font-bold text-foreground"
                        data-testid="billing-balance">
                        {safeMetrics.creditsRemaining.toLocaleString()}
                        <div className="mx-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
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
                        </div>
                      </p>
                      <p className="text-xs text-green-600">
                        {t("dashboard", "credits")}
                      </p>
                    </div>
                  </div>
                  {/* 
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t("dashboard", "freeViewsUsed")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("dashboard", "complimentaryImpressions")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {Math.max(
                          0,
                          10000 - safeMetrics.creditsRemaining
                        ).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{t("dashboard", "of10000")}</p>
                    </div>
                  </div> */}

                  <Button
                    className="w-full"
                    onClick={handlePurchaseCredits}
                    data-testid="button-purchase-credits">
                    <i className={`fas fa-plus ${isRTL ? "ml-2" : "mx-2"}`}></i>
                    {t("dashboard", "purchaseMoreCredits")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
