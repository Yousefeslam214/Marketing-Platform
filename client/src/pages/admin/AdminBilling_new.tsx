import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { getStatusColor, VITE_API_BASE_URL } from "@/lib/utils";
import { useApiQuery } from "@/hooks/useApiQuery";
import { TokenManager } from "@/lib/auth";

// TypeScript interfaces for the API response
interface PaymentItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  status: string;
  amount: string;
  currency: string;
  method: string;
  stripeSessionId: string;
  stripePaymentIntentId: string;
}

interface AdminBillingData {
  totalPaidLastMonth: number;
  totalPaidLastYear: number;
  totalUserBalance: number;
  items: PaymentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AdminBillingResponse {
  success: boolean;
  message: string;
  data: AdminBillingData;
}

export default function AdminBilling() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [selectedUser, setSelectedUser] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");

  // Fetch admin billing data from API
  const {
    data: adminBillingResponse,
    isLoading,
    error,
    refetch,
  } = useApiQuery<AdminBillingResponse>({
    key: ["admin-billing-history"],
    url: `${VITE_API_BASE_URL}/api/payment/getPurchaseHistoryForAdmin`,
    enabled: !!TokenManager.getAccessToken(),
  });

  // Extract data with defaults
  const billingData = adminBillingResponse?.data;
  const metrics = {
    totalRevenue: billingData?.totalPaidLastYear || 0,
    totalLastMonth: billingData?.totalPaidLastMonth || 0,
    totalUserBalance: billingData?.totalUserBalance || 0,
    totalTransactions: billingData?.total || 0,
  };
  const paymentItems = billingData?.items || [];

  const retryPaymentMutation = {
    mutate: (paymentId: string) => {
      toast({
        title: t("adminBilling", "paymentRetry"),
        description: `Retry triggered for ${paymentId}`,
        variant: "default",
      });
    },
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 overflow-auto max-h-[100vh]">
        <Header
          title={t("adminBilling", "title")}
          description={t("adminBilling", "description")}
        />

        <main className="p-6 space-y-6">
          {/* Dashboard Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t("adminBilling", "overview")}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}>
                  {isLoading
                    ? t("adminBilling", "loading")
                    : t("adminBilling", "refresh")}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">
                    {t("adminBilling", "errorLoading")}: {error.message}
                  </p>
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-8 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-2xl font-bold">
                      ${metrics.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("adminBilling", "totalRevenueYear")}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      ${metrics.totalLastMonth.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("adminBilling", "totalRevenueMonth")}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {metrics.totalUserBalance.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("adminBilling", "totalUserBalance")}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {metrics.totalTransactions}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("adminBilling", "totalTransactions")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("adminBilling", "adminActions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder={t("adminBilling", "userIdPlaceholder")}
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                />
                <Input
                  placeholder={t("adminBilling", "userEmailPlaceholder")}
                />
                <Input placeholder={t("adminBilling", "userNamePlaceholder")} />
                <Input
                  placeholder={t("adminBilling", "adjustBalancePlaceholder")}
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("adminBilling", "selectAction")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upgrade">
                      {t("adminBilling", "forceUpgrade")}
                    </SelectItem>
                    <SelectItem value="downgrade">
                      {t("adminBilling", "forceDowngrade")}
                    </SelectItem>
                    <SelectItem value="cancel">
                      {t("adminBilling", "cancelSubscription")}
                    </SelectItem>
                    <SelectItem value="pause">
                      {t("adminBilling", "pauseSubscription")}
                    </SelectItem>
                    <SelectItem value="adjust">
                      {t("adminBilling", "adjustBalance")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button disabled={!selectedUser}>
                  {t("adminBilling", "apply")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoices & Payments */}
          <Card>
            <CardHeader>
              <CardTitle>{t("adminBilling", "invoicesPayments")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse p-3 border rounded-lg">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : paymentItems.length > 0 ? (
                <div className="space-y-3">
                  {paymentItems.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {payment.id.substring(0, 8)}... - $
                          {parseFloat(payment.amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          User: {payment.userId.substring(0, 8)}... -{" "}
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status.charAt(0).toUpperCase() +
                              payment.status.slice(1)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {payment.method.toUpperCase()} -{" "}
                            {payment.currency.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {payment.status === "failed" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              retryPaymentMutation.mutate(payment.id)
                            }>
                            {t("adminBilling", "retry")}
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          {t("adminBilling", "download")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No payment history available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Errors & Issues */}
          <Card>
            <CardHeader>
              <CardTitle>{t("adminBilling", "errorHandling")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t("adminBilling", "errorLogsDescription")}
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
