import { useLocation, useRoute } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface DailyBreakdown {
  date: string;
  impressions: number;
  clicks: number;
}

interface SourceData {
  type: string;
  views: number;
}

interface AnalyticsData {
  totalImpressions: number;
  totalClicks: number;
  clickThroughRate: number;
  websiteClicks: number;
  likesCount: number;
  performance: {
    dailyBreakdown: DailyBreakdown[];
    growthMetrics: {
      impressionGrowth: number;
      clickGrowth: number;
      ctrGrowth: number;
    };
  };
  source: SourceData[];
  financials: {
    totalBudgetImpressions: number;
    usedImpressions: number;
    remainingImpressions: number;
    totalBudgetCost: number;
    totalCostSpent: number;
    costPerImpression: number;
    currency: string;
  };
}

interface AnalyticsResponse {
  analytics: AnalyticsData;
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
];

// Helper function to get icon for each source type
const getSourceIcon = (type: string): { icon: string; color: string } => {
  const sourceType = type.toLowerCase().replace(/[_\s]/g, "");
  switch (sourceType) {
    case "web":
    case "website":
      return { icon: "", color: "text-blue-500" };
    case "facebook":
      return { icon: "fa-facebook", color: "text-blue-600" };
    case "instagram":
      return { icon: "fa-instagram", color: "text-pink-500" };
    case "tiktok":
      return { icon: "fa-tiktok", color: "text-black dark:text-white" };
    case "snapchat":
      return { icon: "fa-snapchat", color: "text-yellow-400" };
    case "youtube":
      return { icon: "fa-youtube", color: "text-red-600" };
    case "googleads":
    case "google_ads":
      return { icon: "fa-google", color: "text-blue-500" };
    case "twitter":
    case "x":
      return { icon: "fa-x-twitter", color: "text-black dark:text-white" };
    case "linkedin":
      return { icon: "fa-linkedin", color: "text-blue-700" };
    default:
      return { icon: "fa-link", color: "text-gray-500" };
  }
};

export default function AdAnalytics() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/campaigns/:id/analytics");
  const { t, isRTL } = useLanguage();

  const adId = params?.id;

  const {
    data: analyticsResponse,
    isLoading,
    error,
  } = useApiQuery<AnalyticsResponse>({
    key: [`/api/users/ad/${adId}/analytics-full-details`],
    url: `${VITE_API_BASE_URL}/api/users/ad/${adId}/analytics-full-details`,
    enabled: !!adId,
  });

  // Safely extract analytics data with proper null checks
  const analytics: AnalyticsData | undefined =
    (analyticsResponse as any)?.data?.analytics ||
    (analyticsResponse as any)?.analytics;

  // Filter daily breakdown to show only last 14 days with data
  const filteredDailyData =
    analytics?.performance?.dailyBreakdown
      ?.slice(-14)
      .map((item: DailyBreakdown) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString(
          isRTL ? "ar-SA" : "en-US",
          {
            month: "short",
            day: "numeric",
          }
        ),
      })) || [];

  // Filter sources with views > 0
  const activeSourcesData: SourceData[] =
    analytics?.source?.filter((s: SourceData) => s.views > 0) || [];
  const allSourcesData: SourceData[] = analytics?.source || [];

  if (!match) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
        <div className="flex-1 overflow-auto max-h-[100vh]">
          <Header
            title={t("analytics", "title") || "Ad Analytics"}
            description={
              t("analytics", "description") ||
              "View detailed analytics for your ad"
            }
          />
          <main className="p-6 mt-24">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !analytics || !analytics.financials || !analytics.performance) {
    return (
      <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
        <div className="flex-1 overflow-auto max-h-[100vh]">
          <Header
            title={t("analytics", "title") || "Ad Analytics"}
            description={
              t("analytics", "description") ||
              "View detailed analytics for your ad"
            }
          />
          <main className="p-6 mt-24">
            <div className="text-center py-12">
              <i className="fas fa-exclamation-circle text-4xl text-destructive mb-4"></i>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t("analytics", "errorLoading") || "Failed to load analytics"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("analytics", "tryAgain") || "Please try again later"}
              </p>
              <Button onClick={() => setLocation("/campaigns")}>
                <i className="fas fa-arrow-left mx-2"></i>
                {t("analytics", "backToAds") || "Back to Ads"}
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto max-h-[100vh]">
        <Header
          title={t("analytics", "title") || "Ad Analytics"}
          description={
            t("analytics", "description") ||
            "View detailed analytics for your ad"
          }
          actions={
            <Button
              variant="outline"
              onClick={() => setLocation(`/campaigns/${adId}`)}>
              <i className={`fas fa-arrow-left ${isRTL ? "ml-2" : "mr-2"}`}></i>
              {t("analytics", "backToAd") || "Back to Ad"}
            </Button>
          }
        />
        <main className="p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <i className="fas fa-eye text-primary text-2xl mb-2"></i>

                <div className="text-2xl font-bold text-primary">
                  {(analytics.totalImpressions ?? 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("analytics", "totalImpressions") || "Total Impressions"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <i className="fas fa-mouse-pointer text-green-600 text-2xl mb-2"></i>
                <div className="text-2xl font-bold text-green-600">
                  {(analytics.totalClicks ?? 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("analytics", "totalClicks") || "Total Clicks"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <i className="fas fa-percentage text-orange-600 text-2xl mb-2"></i>
                <div className="text-2xl font-bold text-orange-600">
                  {(analytics.clickThroughRate ?? 0).toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("analytics", "ctr") || "Click Through Rate"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <i className="fas fa-globe text-blue-600 text-2xl mb-2"></i>
                <div className="text-2xl font-bold text-blue-600">
                  {(analytics.websiteClicks ?? 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("analytics", "websiteClicks") || "Website Clicks"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <i className="fas fa-heart text-red-500 text-2xl mb-2"></i>
                <div className="text-2xl font-bold text-red-500">
                  {(analytics.likesCount ?? 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("analytics", "likes") || "Likes"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-wallet text-primary"></i>
                {t("analytics", "financialOverview") || "Financial Overview"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <i className="fas fa-piggy-bank text-green-600 text-2xl mb-2"></i>
                  <div className="text-3xl font-bold text-green-600">
                    {(
                      analytics.financials?.totalBudgetImpressions ?? 0
                    ).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t("analytics", "totalBudget") ||
                      "Total Budget Impressions"}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <i className="fas fa-credit-card text-orange-600 text-2xl mb-2"></i>
                  <div className="text-3xl font-bold text-orange-600">
                    {(
                      analytics.financials?.usedImpressions ?? 0
                    ).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t("analytics", "usedImpressions") || "Used Impressions"}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <i className="fas fa-wallet text-blue-600 text-2xl mb-2"></i>
                  <div className="text-3xl font-bold text-blue-600">
                    {(
                      analytics.financials?.remainingImpressions ?? 0
                    ).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t("analytics", "remainingImpressions") ||
                      "Remaining Impressions"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <i className="fas fa-money-bill-wave text-green-600 text-2xl mb-2"></i>
                  <div className="text-3xl font-bold text-green-600">
                    {(
                      analytics.financials?.totalBudgetCost ?? 0
                    ).toLocaleString()}{" "}
                    {(analytics.financials?.currency ?? "").toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t("analytics", "totalBudgetRemaining") ||
                      "Total Budget Remaining"}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <i className="fas fa-receipt text-orange-600 text-2xl mb-2"></i>
                  <div className="text-3xl font-bold text-orange-600">
                    {(
                      analytics.financials?.totalCostSpent ?? 0
                    ).toLocaleString()}{" "}
                    {(analytics.financials?.currency ?? "").toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t("analytics", "totalCostSpent") || "Total Cost Spent"}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <i className="fas fa-coins text-purple-600 text-2xl mb-2"></i>
                  <div className="text-3xl font-bold text-purple-600">
                    {(analytics.financials?.costPerImpression ?? 0).toFixed(3)}{" "}
                    {(analytics.financials?.currency ?? "").toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t("analytics", "costPerImpression") || "Cost/Impression"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-chart-line text-primary"></i>
                {t("analytics", "dailyPerformance") || "Daily Performance"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredDailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="impressions"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name={t("analytics", "impressions") || "Impressions"}
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#10B981"
                      strokeWidth={2}
                      name={t("analytics", "clicks") || "Clicks"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Growth Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-chart-bar text-primary"></i>
                {t("analytics", "growthMetrics") || "Growth Metrics"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <i className="fas fa-eye text-primary text-xl mb-2"></i>
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`text-2xl font-bold ${
                        (analytics.performance?.growthMetrics
                          ?.impressionGrowth ?? 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                      {(analytics.performance?.growthMetrics
                        ?.impressionGrowth ?? 0) >= 0
                        ? "+"
                        : ""}
                      {(
                        analytics.performance?.growthMetrics
                          ?.impressionGrowth ?? 0
                      ).toFixed(1)}
                      %
                    </span>
                    <i
                      className={`fas ${
                        (analytics.performance?.growthMetrics
                          ?.impressionGrowth ?? 0) >= 0
                          ? "fa-arrow-up text-green-600"
                          : "fa-arrow-down text-red-600"
                      }`}></i>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t("analytics", "impressionGrowth") || "Impression Growth"}
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <i className="fas fa-mouse-pointer text-primary text-xl mb-2"></i>
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`text-2xl font-bold ${
                        (analytics.performance?.growthMetrics?.clickGrowth ??
                          0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                      {(analytics.performance?.growthMetrics?.clickGrowth ??
                        0) >= 0
                        ? "+"
                        : ""}
                      {(
                        analytics.performance?.growthMetrics?.clickGrowth ?? 0
                      ).toFixed(1)}
                      %
                    </span>
                    <i
                      className={`fas ${
                        (analytics.performance?.growthMetrics?.clickGrowth ??
                          0) >= 0
                          ? "fa-arrow-up text-green-600"
                          : "fa-arrow-down text-red-600"
                      }`}></i>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t("analytics", "clickGrowth") || "Click Growth"}
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <i className="fas fa-percentage text-primary text-xl mb-2"></i>
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`text-2xl font-bold ${
                        (analytics.performance?.growthMetrics?.ctrGrowth ??
                          0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                      {(analytics.performance?.growthMetrics?.ctrGrowth ?? 0) >=
                      0
                        ? "+"
                        : ""}
                      {(
                        analytics.performance?.growthMetrics?.ctrGrowth ?? 0
                      ).toFixed(1)}
                      %
                    </span>
                    <i
                      className={`fas ${
                        (analytics.performance?.growthMetrics?.ctrGrowth ??
                          0) >= 0
                          ? "fa-arrow-up text-green-600"
                          : "fa-arrow-down text-red-600"
                      }`}></i>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t("analytics", "ctrGrowth") || "CTR Growth"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-chart-pie text-primary"></i>
                  {t("analytics", "trafficSources") || "Traffic Sources"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeSourcesData.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activeSourcesData}
                          dataKey="views"
                          nameKey="type"
                          cx="50%"
                          cy="45%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          // label={({ type, percent }) =>
                          //   `${type}: ${(percent * 100).toFixed(0)}%`
                          // }
                          labelLine={{ stroke: "#888", strokeWidth: 1 }}>
                          {activeSourcesData.map((source, index) => {
                            const { color } = getSourceIcon(source.type);
                            const fillColor = color.includes("blue-600")
                              ? "#2563EB"
                              : color.includes("pink")
                              ? "#EC4899"
                              : color.includes("red")
                              ? "#DC2626"
                              : color.includes("yellow")
                              ? "#EAB308"
                              : COLORS[index % COLORS.length];
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={fillColor}
                                // stroke="#fff"
                                strokeWidth={2}
                              />
                            );
                          })}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            `${value} ${t("analytics", "views") || "views"}`,
                            name,
                          ]}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          iconType="circle"
                          iconSize={10}
                          formatter={(value: string) => (
                            <span
                              className="text-sm
                             text-foreground capitalize
                            m-2
                            ">
                              {value.replace("_", " ")}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex flex-col items-center justify-center text-muted-foreground">
                    <i className="fas fa-chart-pie text-4xl mb-3 opacity-30"></i>
                    <p>
                      {t("analytics", "noSourceData") ||
                        "No source data available yet"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-list text-primary"></i>
                  {t("analytics", "sourceBreakdown") || "Source Breakdown"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allSourcesData.map((source, index) => {
                    const { icon, color } = getSourceIcon(source.type);
                    return (
                      <div
                        key={source.type}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <i className={`fab ${icon} ${color} text-lg`}></i>
                          <span className="font-medium capitalize">
                            {source.type.replace("_", " ")}
                          </span>
                        </div>
                        <Badge
                          variant={source.views > 0 ? "default" : "secondary"}>
                          {source.views.toLocaleString()}{" "}
                          {t("analytics", "views") || "views"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
