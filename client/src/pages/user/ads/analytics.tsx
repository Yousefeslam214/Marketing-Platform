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
    totalBudgetCredits: number;
    spentAmount: number;
    remainingCredits: number;
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

  const analytics: AnalyticsData | undefined =
    analyticsResponse?.data?.analytics;

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
        <div className="flex-1 overflow-auto">
          <Header
            title={t("analytics", "title") || "Ad Analytics"}
            description={
              t("analytics", "description") ||
              "View detailed analytics for your ad"
            }
          />
          <main className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
        <div className="flex-1 overflow-auto">
          <Header
            title={t("analytics", "title") || "Ad Analytics"}
            description={
              t("analytics", "description") ||
              "View detailed analytics for your ad"
            }
          />
          <main className="p-6">
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
      <div className="flex-1 overflow-auto">
        <Header
          title={t("analytics", "title") || "Ad Analytics"}
          description={
            t("analytics", "description") ||
            "View detailed analytics for your ad"
          }
          actions={
            <Button variant="outline" onClick={() => setLocation("/campaigns")}>
              <i className={`fas fa-arrow-left ${isRTL ? "ml-2" : "mr-2"}`}></i>
              {t("analytics", "backToAds") || "Back to Ads"}
            </Button>
          }
        />
        <main className="p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {analytics.totalImpressions.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("analytics", "totalImpressions") || "Total Impressions"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.totalClicks.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("analytics", "totalClicks") || "Total Clicks"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {analytics.clickThroughRate.toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("analytics", "ctr") || "Click Through Rate"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.websiteClicks.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("analytics", "websiteClicks") || "Website Clicks"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-500">
                  {analytics.likesCount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("analytics", "likes") || "Likes"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.financials.costPerImpression.toFixed(3)}{" "}
                  {analytics.financials.currency.toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("analytics", "costPerImpression") || "Cost/Impression"}
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
                  <div className="text-3xl font-bold text-green-600">
                    {analytics.financials.totalBudgetCredits.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t("analytics", "totalBudget") || "Total Budget Credits"}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {analytics.financials.spentAmount.toLocaleString()}{" "}
                    {analytics.financials.currency.toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t("analytics", "spentAmount") || "Spent Amount"}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {analytics.financials.remainingCredits.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t("analytics", "remainingCredits") || "Remaining Credits"}
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
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`text-2xl font-bold ${
                        analytics.performance.growthMetrics.impressionGrowth >=
                        0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                      {analytics.performance.growthMetrics.impressionGrowth >= 0
                        ? "+"
                        : ""}
                      {analytics.performance.growthMetrics.impressionGrowth.toFixed(
                        1
                      )}
                      %
                    </span>
                    <i
                      className={`fas ${
                        analytics.performance.growthMetrics.impressionGrowth >=
                        0
                          ? "fa-arrow-up text-green-600"
                          : "fa-arrow-down text-red-600"
                      }`}></i>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t("analytics", "impressionGrowth") || "Impression Growth"}
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`text-2xl font-bold ${
                        analytics.performance.growthMetrics.clickGrowth >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                      {analytics.performance.growthMetrics.clickGrowth >= 0
                        ? "+"
                        : ""}
                      {analytics.performance.growthMetrics.clickGrowth.toFixed(
                        1
                      )}
                      %
                    </span>
                    <i
                      className={`fas ${
                        analytics.performance.growthMetrics.clickGrowth >= 0
                          ? "fa-arrow-up text-green-600"
                          : "fa-arrow-down text-red-600"
                      }`}></i>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t("analytics", "clickGrowth") || "Click Growth"}
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`text-2xl font-bold ${
                        analytics.performance.growthMetrics.ctrGrowth >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                      {analytics.performance.growthMetrics.ctrGrowth >= 0
                        ? "+"
                        : ""}
                      {analytics.performance.growthMetrics.ctrGrowth.toFixed(1)}
                      %
                    </span>
                    <i
                      className={`fas ${
                        analytics.performance.growthMetrics.ctrGrowth >= 0
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
                  <i className="fas fa-globe text-primary"></i>
                  {t("analytics", "trafficSources") || "Traffic Sources"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeSourcesData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activeSourcesData}
                          dataKey="views"
                          nameKey="type"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ type, views }) => `${type}: ${views}`}>
                          {activeSourcesData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    {t("analytics", "noSourceData") ||
                      "No source data available yet"}
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
                  {allSourcesData.map((source, index) => (
                    <div
                      key={source.type}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}></div>
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
