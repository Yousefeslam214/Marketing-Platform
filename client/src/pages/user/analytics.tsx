import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalyticsChart } from "@/components/analytics/analytics-chart";
import { TokenManager } from "@/lib/auth";
import { getStatusColor } from "@/lib/utils";

export default function Analytics() {
  const { t, isRTL } = useLanguage();
  const [timeRange, setTimeRange] = useState("7days");
  const [selectedAd, setSelectedAd] = useState("all");

  const { data: ads } = useQuery({
    queryKey: ["/api/ads"],
    enabled: !!TokenManager.getAccessToken(),
  });

  type Metrics = {
    totalImpressions?: number;
    totalClicks?: number;
    ctr?: number;
  };

  const { data: metrics } = useQuery<Metrics>({
    queryKey: ["/api/dashboard/metrics"],
    enabled: !!TokenManager.getAccessToken(),
  });

  // Type-safe data with defaults
  const safeAds = ads || [];
  const safeMetrics = {
    totalImpressions: metrics?.totalImpressions || 0,
    totalClicks: metrics?.totalClicks || 0,
    ctr: metrics?.ctr || 0,
  };

  // Mock detailed analytics data
  const mockAnalytics = {
    topPerformingAds: [
      {
        id: "1",
        titleEn: "Tech Solutions Campaign",
        impressions: 24500,
        clicks: 1519,
        ctr: 6.2,
        status: "published",
      },
      {
        id: "2",
        titleEn: "Premium Dining Experience",
        impressions: 18300,
        clicks: 1061,
        ctr: 5.8,
        status: "published",
      },
      {
        id: "3",
        titleEn: "Fitness Revolution",
        impressions: 12700,
        clicks: 622,
        ctr: 4.9,
        status: "pending",
      },
    ],
    hourlyStats: [
      { hour: "00:00", impressions: 850, clicks: 42 },
      { hour: "01:00", impressions: 720, clicks: 36 },
      { hour: "02:00", impressions: 650, clicks: 32 },
      { hour: "03:00", impressions: 580, clicks: 29 },
      { hour: "04:00", impressions: 640, clicks: 31 },
      { hour: "05:00", impressions: 780, clicks: 39 },
      { hour: "06:00", impressions: 1200, clicks: 60 },
      { hour: "07:00", impressions: 1850, clicks: 93 },
      { hour: "08:00", impressions: 2400, clicks: 120 },
      { hour: "09:00", impressions: 2800, clicks: 140 },
      { hour: "10:00", impressions: 3200, clicks: 160 },
      { hour: "11:00", impressions: 3100, clicks: 155 },
      { hour: "12:00", impressions: 2900, clicks: 145 },
      { hour: "13:00", impressions: 2700, clicks: 135 },
      { hour: "14:00", impressions: 2600, clicks: 130 },
      { hour: "15:00", impressions: 2800, clicks: 140 },
      { hour: "16:00", impressions: 2900, clicks: 145 },
      { hour: "17:00", impressions: 2600, clicks: 130 },
      { hour: "18:00", impressions: 2200, clicks: 110 },
      { hour: "19:00", impressions: 1900, clicks: 95 },
      { hour: "20:00", impressions: 1600, clicks: 80 },
      { hour: "21:00", impressions: 1400, clicks: 70 },
      { hour: "22:00", impressions: 1200, clicks: 60 },
      { hour: "23:00", impressions: 1000, clicks: 50 },
    ],
  };

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto">
        <Header
          title={t("analytics", "title")}
          description={t("analytics", "description")}
        />

        <main className="p-6 space-y-6">
          {/* Controls */}
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-[180px]"
                data-testid="select-time-range">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24hours">{t("analytics", "last24Hours")}</SelectItem>
                <SelectItem value="7days">{t("analytics", "last7Days")}</SelectItem>
                <SelectItem value="30days">{t("analytics", "last30Days")}</SelectItem>
                <SelectItem value="90days">{t("analytics", "last90Days")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedAd} onValueChange={setSelectedAd}>
              <SelectTrigger
                className="w-[200px]"
                data-testid="select-ad-filter">
                <SelectValue placeholder="Filter by ad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("analytics", "allAds")}</SelectItem>
                {safeAds.map((ad: any) => (
                  <SelectItem key={ad.id} value={ad.id}>
                    {ad.titleEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-chart-1/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-eye text-chart-1"></i>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    +12.5%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Impressions
                </p>
                <p
                  className="text-2xl font-bold text-foreground"
                  data-testid="total-impressions">
                  {safeMetrics.totalImpressions.toLocaleString() || "2,847,293"}
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
                    className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    +8.2%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Clicks
                </p>
                <p
                  className="text-2xl font-bold text-foreground"
                  data-testid="total-clicks">
                  {safeMetrics.totalClicks.toLocaleString() || "156,847"}
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
                    className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    -0.3%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Average CTR
                </p>
                <p
                  className="text-2xl font-bold text-foreground"
                  data-testid="average-ctr">
                  {safeMetrics.ctr.toFixed(2) || "5.51"}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-sar-sign text-chart-4"></i>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    +15.7%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Cost per Click
                </p>
                <p
                  className="text-2xl font-bold text-foreground"
                  data-testid="cost-per-click">
                  $0.18
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Chart */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("analytics", "performanceTrend")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart />
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Ads */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("analytics", "topPerformingAds")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.topPerformingAds.map((ad, index) => (
                    <div
                      key={ad.id}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium text-foreground truncate"
                          data-testid={`top-ad-title-${ad.id}`}>
                          {ad.titleEn}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="text-xs text-muted-foreground"
                            data-testid={`top-ad-impressions-${ad.id}`}>
                            {(ad.impressions / 1000).toFixed(1)}K views
                          </span>
                          <span
                            className="text-xs text-green-600"
                            data-testid={`top-ad-ctr-${ad.id}`}>
                            {ad.ctr}% CTR
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(ad.status)}>
                        {ad.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hourly Performance */}
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics", "hourlyPerformance")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-2">
                {mockAnalytics.hourlyStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div
                      className="bg-primary/20 rounded-t mb-1"
                      style={{
                        height: `${Math.max(
                          10,
                          (stat.impressions / 3200) * 60
                        )}px`,
                      }}
                      title={`${stat.hour}: ${stat.impressions} impressions`}></div>
                    <p className="text-xs text-muted-foreground">
                      {stat.hour.split(":")[0]}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary/20 rounded"></div>
                  <span>{t("analytics", "impressionsByHour")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
