import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalyticsChart } from "@/components/analytics/analytics-chart";
import { useLanguage } from "@/hooks/use-language";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { TokenManager } from "@/lib/auth";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { language, isRTL, t } = useLanguage();

  const access_token = TokenManager.getAccessToken();
  const { data: adminMetrics, isLoading } = useQuery({
    queryKey: ["/api/admin/metrics"],
    enabled: !!access_token,
  });

  const safeMetrics = {
    totalUsers: (adminMetrics as any)?.totalUsers || 0,
    activeCampaigns: (adminMetrics as any)?.activeCampaigns || 0,
    revenue: (adminMetrics as any)?.revenue || 0,
    systemErrors: (adminMetrics as any)?.systemErrors || 0,
  };

  if (!access_token) {
    setLocation("/login");
    return null;
  }

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
                    className="bg-green-100 text-green-700">
                    +5%
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
                    className="bg-green-100 text-green-700">
                    +12%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("AdminDashboard", "activeCampaigns")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading
                    ? t("AdminDashboard", "loading")
                    : safeMetrics.activeCampaigns.toLocaleString()}
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
                    className="bg-green-100 text-green-700">
                    +20%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("AdminDashboard", "revenue")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading
                    ? t("AdminDashboard", "loading")
                    : `$${safeMetrics.revenue.toLocaleString()}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-chart-4"></i>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-700">
                    +2%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("AdminDashboard", "systemErrors")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading
                    ? t("AdminDashboard", "loading")
                    : safeMetrics.systemErrors.toLocaleString()}
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
                  <AnalyticsChart />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  {t("AdminDashboard", "recentLogs")}
                </h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>{t("AdminDashboard", "noRecentLogs")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
