import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { language, isRTL, t } = useLanguage();

  const access_token = TokenManager.getAccessToken();
  const {
    data: adminData,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    key: ["/api/dashboard/admin"],
    url: `${VITE_API_BASE_URL}/api/dashboard/admin`,
  });

  // Check for token in URL parameters and auto-authenticate
  useEffect(() => {
    // Only run token detection logic if we're on the dashboard page
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/dashboard')) {
      console.log("Admin Dashboard: Not on dashboard page, skipping token detection");
      return;
    }

    // Handle both correct (?token=...) and incorrect (&token=...) URL formats
    let tokenFromUrl = null;
    
    // First, try standard URL parameters (after ?)
    const urlParams = new URLSearchParams(window.location.search);
    tokenFromUrl = urlParams.get("token");
    const roleFromUrl = urlParams.get("role");
    const usernameFromUrl = urlParams.get("username");
    console.log("Admin Dashboard Token from URL:", tokenFromUrl);
    console.log("Admin Dashboard Role from URL:", roleFromUrl);
    console.log("Admin Dashboard Username from URL:", usernameFromUrl);
    console.log("Admin Dashboard Full URL:", window.location.href);
    console.log("Admin Dashboard urlParams", urlParams);
    
    // If no token found and URL contains &token=, handle the incorrect format
    if (!tokenFromUrl && window.location.href.includes("&token=")) {
      console.log("🔧 Admin Dashboard: Detected incorrect URL format with &token= instead of ?token=");
      
      // Extract token from the malformed URL
      const urlParts = window.location.href.split("&token=");
      if (urlParts.length > 1) {
        // Get the token part and remove any additional parameters
        tokenFromUrl = urlParts[1].split("&")[0];
        console.log("🔧 Admin Dashboard: Extracted token from malformed URL:", tokenFromUrl);
        
        // Fix the URL format and redirect to correct format
        const baseUrl = urlParts[0];
        const correctUrl = `${baseUrl}?token=${tokenFromUrl}`;
        console.log("🔧 Admin Dashboard: Redirecting to correct URL format:", correctUrl);
        window.location.href = correctUrl;
        return; // Exit early as we're redirecting
      }
    }
    
    console.log("Admin Dashboard Token from URL:", tokenFromUrl);
    
    if (tokenFromUrl) {
      // Set the token in localStorage for authentication
      TokenManager.setTokens(
        tokenFromUrl, 
        usernameFromUrl || "", 
        roleFromUrl || "admin"
      );
      
      // Remove token from URL for security and clean URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      console.log("Admin Dashboard: Token from URL detected and set:", tokenFromUrl);
      
      // Trigger refetch of dashboard data with new token
      setTimeout(() => {
        refetch();
      }, 100);
    } else {
      // No token in URL, check if user is authenticated
      const currentToken = TokenManager.getAccessToken();
      if (!currentToken) {
        console.log("Admin Dashboard: No token in URL and not authenticated, redirecting to login");
        setLocation("/login");
        return;
      }
    }
  }, [refetch, setLocation]);

  console.log(adminData);
  // Extract data from the new API structure
  const stats = (adminData as any)?.data?.stats || {};
  const chartData = (adminData as any)?.data?.chartData || [];
  const recentActivity = (adminData as any)?.data?.recentActivity || [];
  const systemOverview = (adminData as any)?.data?.systemOverview || {};

  const safeMetrics = {
    totalUsers: stats.totalUsers || 0,
    userGrowth: stats.userGrowth || 0,
    totalRevenue: stats.totalRevenue || 0,
    revenueGrowth: stats.revenueGrowth || 0,
    activeAds: stats.activeAds || 0,
    adsGrowth: stats.adsGrowth || 0,
    totalImpressions: stats.totalImpressions || 0,
    impressionGrowth: stats.impressionGrowth || 0,
  };

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto">
        <Header
          title={t("AdminDashboard", "title")}
          description={t("AdminDashboard", "description")}
          actions={
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <Button
                onClick={() => setLocation("/admin/users")}
                data-testid="button-manage-users">
                <i className={`fas fa-users ${isRTL ? "ml-2" : "mr-2"}`}></i>
                {t("AdminDashboard", "manageUsers")}
              </Button>
            </div>
          }
        />

        <main className="p-6">
          {/* Admin Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-chart-1/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user text-chart-1"></i>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${
                      safeMetrics.userGrowth >= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                    {safeMetrics.userGrowth >= 0 ? "+" : ""}
                    {safeMetrics.userGrowth.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("AdminDashboard", "totalUsers")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading
                    ? t("AdminDashboard", "loading")
                    : safeMetrics.totalUsers.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-bullhorn text-chart-2"></i>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${
                      safeMetrics.adsGrowth >= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                    {safeMetrics.adsGrowth >= 0 ? "+" : ""}
                    {safeMetrics.adsGrowth.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("AdminDashboard", "activeAds")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading
                    ? t("AdminDashboard", "loading")
                    : safeMetrics.activeAds.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-dollar-sign text-chart-3"></i>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${
                      safeMetrics.revenueGrowth >= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                    {safeMetrics.revenueGrowth >= 0 ? "+" : ""}
                    {safeMetrics.revenueGrowth.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("AdminDashboard", "totalRevenue")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading
                    ? t("AdminDashboard", "loading")
                    : `$${safeMetrics.totalRevenue.toLocaleString()}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-eye text-chart-4"></i>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${
                      safeMetrics.impressionGrowth >= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                    {safeMetrics.impressionGrowth >= 0 ? "+" : ""}
                    {safeMetrics.impressionGrowth.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("AdminDashboard", "totalImpressions")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading
                    ? t("AdminDashboard", "loading")
                    : safeMetrics.totalImpressions.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart & Recent Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground">
                      {t("AdminDashboard", "systemPerformance")}
                    </h3>
                  </div>
                  <AnalyticsChart data={chartData} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  {t("AdminDashboard", "recentActivity")}
                </h3>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((activity: any) => {
                      const getActivityIcon = (type: string) => {
                        switch (type) {
                          case "ad_approved":
                            return "fas fa-check-circle text-green-500";
                          case "ad_created":
                            return "fas fa-plus text-blue-500";
                          case "ad_rejected":
                            return "fas fa-times-circle text-red-500";
                          case "user_signup":
                            return "fas fa-user-plus text-purple-500";
                          case "purchase":
                            return "fas fa-dollar-sign text-green-600";
                          default:
                            return "fas fa-activity text-gray-500";
                        }
                      };

                      const formatTime = (dateString: string) => {
                        const date = new Date(dateString);
                        const now = new Date();
                        const diffInMinutes = Math.floor(
                          (now.getTime() - date.getTime()) / (1000 * 60)
                        );

                        if (diffInMinutes < 1) return "Just now";
                        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
                        if (diffInMinutes < 1440)
                          return `${Math.floor(diffInMinutes / 60)}h ago`;
                        return date.toLocaleDateString();
                      };

                      return (
                        <div
                          key={activity.id}
                          className={`flex items-start p-3 
                            over
                            border rounded-lg hover:bg-muted/50 transition-colors ${
                            isRTL ? "space-x-reverse" : ""
                          }`}
                          style={{ gap: "12px" }}>
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mt-0.5">
                            <i
                              className={`${getActivityIcon(
                                activity.type
                              )} text-xs`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {activity.description}
                            </p>
                            {activity.username && (
                              <p className="text-xs text-muted-foreground">
                                User: {activity.username}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatTime(activity.createdAt)}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {activity.type.replace("_", " ")}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-history text-4xl text-muted-foreground mb-4"></i>
                    <p className="text-sm text-muted-foreground">
                      {t("AdminDashboard", "noRecentActivity")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  {t("AdminDashboard", "systemStats")}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t("AdminDashboard", "totalAds")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        All advertisements in system
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {systemOverview.totalAds || 0}
                      </p>
                      <p className="text-xs text-green-600">ads</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t("AdminDashboard", "pendingReviews")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ads waiting for approval
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {systemOverview.pendingAds || 0}
                      </p>
                      <p className="text-xs text-yellow-600">pending</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Click Through Rate
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Overall system CTR
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {systemOverview.ctr ? systemOverview.ctr.toFixed(2) : 0}
                        %
                      </p>
                      <p className="text-xs text-blue-600">rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Total Clicks
                      </p>
                      <p className="text-xs text-muted-foreground">
                        All-time click count
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {systemOverview.totalClicks || 0}
                      </p>
                      <p className="text-xs text-blue-600">clicks</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Platform Revenue
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total revenue generated
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        ${systemOverview.totalRevenue || 0}
                      </p>
                      <p className="text-xs text-green-600">USD</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        System Health
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Overall platform status
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-sm font-medium text-green-600">
                          Operational
                        </p>
                      </div>
                      <p className="text-xs text-green-600">
                        All systems running
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
