import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalyticsChart } from "@/components/analytics/analytics-chart";

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    enabled: isAuthenticated,
  });

  // Type-safe metrics with defaults
  const safeMetrics = {
    totalImpressions: (metrics as any)?.totalImpressions || 0,
    totalClicks: (metrics as any)?.totalClicks || 0,
    ctr: (metrics as any)?.ctr || 0,
    creditsRemaining: (metrics as any)?.creditsRemaining || 0,
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const handleCreateAd = () => {
    setLocation("/ads/new");
  };

  const handlePurchaseCredits = () => {
    setLocation("/billing");
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <Header
          title="Dashboard"
          description="Monitor your advertising performance and manage campaigns"
          actions={
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleCreateAd}
                data-testid="button-create-ad"
              >
                <i className="fas fa-plus mr-2"></i>
                Create New Ad
              </Button>
              <div className="relative">
                <Button variant="ghost" size="icon" data-testid="button-notifications">
                  <i className="fas fa-bell text-lg"></i>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
                </Button>
              </div>
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
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    +12.5%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Impressions</p>
                <p className="text-2xl font-bold text-foreground" data-testid="metric-impressions">
                  {metricsLoading ? "Loading..." : safeMetrics.totalImpressions.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-mouse-pointer text-chart-2"></i>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    +8.2%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Clicks</p>
                <p className="text-2xl font-bold text-foreground" data-testid="metric-clicks">
                  {metricsLoading ? "Loading..." : safeMetrics.totalClicks.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-percentage text-chart-3"></i>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    -0.3%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">CTR</p>
                <p className="text-2xl font-bold text-foreground" data-testid="metric-ctr">
                  {metricsLoading ? "Loading..." : `${safeMetrics.ctr.toFixed(2)}%`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-coins text-chart-4"></i>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    +15.7%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Credits Remaining</p>
                <p className="text-2xl font-bold text-foreground" data-testid="metric-credits">
                  {metricsLoading ? "Loading..." : safeMetrics.creditsRemaining.toLocaleString()}
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
                    <h3 className="text-lg font-semibold text-foreground">Performance Overview</h3>
                    <select className="text-sm bg-background border border-border rounded-md px-3 py-1.5 text-foreground">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                  </div>
                  <AnalyticsChart />
                </CardContent>
              </Card>
            </div>

            {/* Top Ads */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Top Performing Ads</h3>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <i className="fas fa-ad text-4xl text-muted-foreground mb-4"></i>
                    <p className="text-sm text-muted-foreground">No ads created yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={handleCreateAd}
                      data-testid="button-create-first-ad"
                    >
                      Create Your First Ad
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h3>
                <div className="text-center py-8">
                  <i className="fas fa-history text-4xl text-muted-foreground mb-4"></i>
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              </CardContent>
            </Card>

            {/* Billing Overview */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Billing Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">Current Balance</p>
                      <p className="text-xs text-muted-foreground">Available impression credits</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground" data-testid="billing-balance">
                        {safeMetrics.creditsRemaining.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600">credits</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">Free Views Used</p>
                      <p className="text-xs text-muted-foreground">Complimentary impressions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {10000 - safeMetrics.creditsRemaining}
                      </p>
                      <p className="text-xs text-green-600">of 10,000</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handlePurchaseCredits}
                    data-testid="button-purchase-credits"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Purchase More Credits
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
