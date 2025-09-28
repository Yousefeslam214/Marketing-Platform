import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { TokenManager } from "@/lib/auth";
import { PaymentService, type PaymentData } from "@/lib/payment-service";
import { getStatusColor } from "@/lib/utils";

export default function Billing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const [selectedPackage, setSelectedPackage] = useState("basic");
  const [customAmount, setCustomAmount] = useState("");

  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    enabled: !!TokenManager.getAccessToken(),
  });

  // Type-safe metrics with defaults
  const safeMetrics = {
    creditsRemaining: (metrics as any)?.creditsRemaining || 0,
  };

  // Mock purchase history - in real app this would come from API
  const mockPurchases = [
    {
      id: "1",
      amount: 50,
      impressions: 50000,
      status: "completed",
      createdAt: "2024-01-20T10:00:00Z",
    },
    {
      id: "2",
      amount: 100,
      impressions: 125000,
      status: "completed",
      createdAt: "2024-01-15T14:30:00Z",
    },
  ];

  const impressionPackages = [
    {
      id: "basic",
      nameKey: "basicPackage",
      impressions: 50000,
      amount: 50,
      popular: false,
    },
    {
      id: "professional",
      nameKey: "professionalPackage",
      impressions: 125000,
      amount: 100,
      popular: true,
    },
    {
      id: "enterprise",
      nameKey: "enterprisePackage",
      impressions: 300000,
      amount: 200,
      popular: false,
    },
  ];

  const purchaseMutation = useMutation({
    mutationFn: async (paymentData: PaymentData) => {
      // Use the PaymentService to handle the checkout
      await PaymentService.redirectToCheckout(paymentData);
      return { success: true };
    },
    onError: (error: any) => {
      toast({
        title: t("billing", "purchaseFailed"),
        description: error.message || t("billing", "paymentSessionError"),
        variant: "destructive",
      });
    },
  });

  const handlePurchase = (packageId: string) => {
    const pkg = impressionPackages.find((p) => p.id === packageId);
    if (pkg) {
      purchaseMutation.mutate({
        amount: pkg.amount * 100, // Convert to cents for Stripe
        impressions: pkg.impressions,
        currency: "USD",
      });
    }
  };

  const handleCustomPurchase = () => {
    const amount = parseFloat(customAmount);
    if (amount >= 10) {
      const impressions = amount * 1000; // 1000 impressions per dollar
      purchaseMutation.mutate({
        amount: amount * 100, // Convert to cents for Stripe
        impressions,
        currency: "USD",
      });
    } else {
      toast({
        title: t("billing", "invalidAmount"),
        description: t("billing", "minimumAmountError"),
        variant: "destructive",
      });
    }
  };



  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return t("billing", "completed");
      case "pending":
        return t("billing", "pending");
      case "failed":
        return t("billing", "failed");
      default:
        return status;
    }
  };

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto">
        <Header
          title={t("billing", "title")}
          description={t("billing", "description")}
        />

        <main className="p-6 space-y-6">
          {/* Current Balance */}
          <Card>
            <CardHeader>
              <CardTitle>Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-3xl font-bold text-foreground"
                    data-testid="current-balance">
                    {safeMetrics.creditsRemaining.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("billing", "availableCredits")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {t("billing", "freeViewsUsed")}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {(10000 - safeMetrics.creditsRemaining).toLocaleString()} /
                    10,000
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impression Packages */}
          <Card>
            <CardHeader>
              <CardTitle>{t("billing", "impressionPackages")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {impressionPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`p-6 rounded-lg border-2 transition-colors ${
                      selectedPackage === pkg.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    } ${pkg.popular ? "ring-2 ring-primary/20" : ""}`}>
                    {pkg.popular && (
                      <Badge className="mb-3 bg-primary text-primary-foreground">
                        {t("billing", "mostPopular")}
                      </Badge>
                    )}
                    <h3
                      className="text-lg font-semibold text-foreground mb-2"
                      data-testid={`package-name-${pkg.id}`}>
                      {t("billing", pkg.nameKey as any)}
                    </h3>
                    <div className="mb-4">
                      <p
                        className="text-3xl font-bold text-foreground"
                        data-testid={`package-price-${pkg.id}`}>
                        ${pkg.amount}
                      </p>
                      <p
                        className="text-sm text-muted-foreground"
                        data-testid={`package-impressions-${pkg.id}`}>
                        {pkg.impressions.toLocaleString()} impressions
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      ${(pkg.amount / (pkg.impressions / 1000)).toFixed(3)} per
                      1K impressions
                    </p>
                    <Button
                      className="w-full"
                      variant={
                        selectedPackage === pkg.id ? "default" : "outline"
                      }
                      onClick={() => {
                        setSelectedPackage(pkg.id);
                        handlePurchase(pkg.id);
                      }}
                      disabled={purchaseMutation.isPending}
                      data-testid={`button-select-package-${pkg.id}`}>
                      {purchaseMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          {t("billing", "processing")}
                        </>
                      ) : (
                        t("billing", "selectPackage")
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="p-6 border border-border rounded-lg">
                <h4 className="text-lg font-semibold text-foreground mb-4">
                  Custom Amount
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder={t("billing", "enterAmount")}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      min="10"
                      step="1"
                      data-testid="input-custom-amount"
                    />
                    {customAmount && parseFloat(customAmount) >= 10 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("billing", "youllReceive")}{" "}
                        {(parseFloat(customAmount) * 1000).toLocaleString()}{" "}
                        impressions
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleCustomPurchase}
                    disabled={
                      !customAmount ||
                      parseFloat(customAmount) < 10 ||
                      purchaseMutation.isPending
                    }
                    data-testid="button-custom-purchase">
                    {purchaseMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        {t("billing", "processing")}
                      </>
                    ) : (
                      t("billing", "purchase")
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase History */}
          <Card>
            <CardHeader>
              <CardTitle>{t("billing", "purchaseHistory")}</CardTitle>
            </CardHeader>
            <CardContent>
              {mockPurchases.length > 0 ? (
                <div className="space-y-4">
                  {mockPurchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className="font-medium text-foreground"
                            data-testid={`purchase-amount-${purchase.id}`}>
                            ${purchase.amount}
                          </p>
                          <Badge className={getStatusColor(purchase.status)}>
                            {getStatusText(purchase.status)}
                          </Badge>
                        </div>
                        <p
                          className="text-sm text-muted-foreground"
                          data-testid={`purchase-impressions-${purchase.id}`}>
                          {purchase.impressions.toLocaleString()}{" "}
                          {t("billing", "impressions")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-sm text-muted-foreground"
                          data-testid={`purchase-date-${purchase.id}`}>
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </p>
                        <Button variant="ghost" size="sm">
                          <i className="fas fa-download mr-1"></i>
                          {t("billing", "receipt")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-credit-card text-4xl text-muted-foreground mb-4"></i>
                  <p className="text-muted-foreground">
                    {t("billing", "noPurchasesYet")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
