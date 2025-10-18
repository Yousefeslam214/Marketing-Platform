import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { TokenManager } from "@/lib/auth";
import { PaymentService, type PaymentData } from "@/lib/payment-service";
import { getStatusColor, VITE_API_BASE_URL } from "@/lib/utils";
import { useApiQuery } from "@/hooks/useApiQuery";

export default function Billing() {
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const [selectedPackage, setSelectedPackage] = useState("basic");
  const [customAmount, setCustomAmount] = useState("");

  // Fetch payment history from API
  // const { data: paymentHistoryResponse, isLoading: isLoadingHistory } =
  useQuery({
    queryKey: ["/api/payment/history"],
    enabled: !!TokenManager.getAccessToken(),
  });

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

  // Extract payment history from API response
  const paymentHistory = paymentHistoryResponse?.data?.items || [];

  // Extract impression ratios and find SAR ratio
  const impressionRatios = impressionRatiosResponse?.data || [];
  const sarRatio = impressionRatios.find(
    (ratio: any) => ratio.currency === "sar"
  );
  const impressionsPerSAR = sarRatio?.impressionsPerUnit || 1000; // Default to 1000 if not found

  // Helper function to calculate impressions from amount using API ratio
  const calculateImpressions = (amount: string) => {
    return parseFloat(amount) * impressionsPerSAR;
  };

  const impressionPackages = [
    {
      id: "basic",
      nameKey: "basicPackage",
      impressions: 50 * impressionsPerSAR, // 50 SAR worth of impressions
      amount: 50,
      popular: false,
    },
    {
      id: "professional",
      nameKey: "professionalPackage",
      impressions: 100 * impressionsPerSAR, // 100 SAR worth of impressions
      amount: 100,
      popular: true,
    },
    {
      id: "enterprise",
      nameKey: "enterprisePackage",
      impressions: 200 * impressionsPerSAR, // 200 SAR worth of impressions
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
    onError: (error) => {
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
        amount: pkg.amount ?? 0,
        impressions: pkg.impressions,
        currency: "SAR",
      });
    }
  };

  const handleCustomPurchase = () => {
    const amount = parseFloat(customAmount);
    const minAmount = 10; // Minimum in SAR

    if (amount >= minAmount) {
      const impressions = amount * impressionsPerSAR; // Use API ratio
      purchaseMutation.mutate({
        amount: Math.round(amount),
        impressions,
        currency: "SAR",
      });
    } else {
      toast({
        title: t("billing", "invalidAmount"),
        description: `${t("billing", "minimumAmountError")} ر.س${minAmount}`,
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

        <main className="p-4 sm:p-6 space-y-6">
          {/* Current Balance */}
          <Card>
            <CardHeader>
              <CardTitle>{t("billing", "currentBalance")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p
                    className="text-3xl font-bold text-foreground"
                    data-testid="current-balance">
                    {/* {safeMetrics.creditsRemaining.toLocaleString()} */}
                    {paymentHistoryResponse?.data?.balance}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("billing", "availableCredits")}
                  </p>
                </div>
                <div className="text-right">
                  {isLoadingRatios ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {impressionsPerSAR.toLocaleString()}{" "}
                        {t("billing", "impressionsPerSAR")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("billing", "rateInfo")}
                      </p>
                    </div>
                  )}
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
              {isLoadingRatios ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-4 sm:p-6 rounded-lg border-2 animate-pulse">
                      <div className="h-6 bg-muted rounded mb-4"></div>
                      <div className="h-8 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded mb-4"></div>
                      <div className="h-3 bg-muted rounded mb-4"></div>
                      <div className="h-10 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                  {impressionPackages.map((pkg) => {
                    return (
                      <div
                        key={pkg.id}
                        className={`flex min-w-20  flex-col justify-between p-4 sm:p-6 rounded-lg border-2 transition-colors ${
                          selectedPackage === pkg.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        } ${pkg.popular ? "ring-2 ring-primary/20" : ""}`}>
                        {pkg.popular && (
                          <div
                            className={`w-full ${
                              isRTL ? "text-right " : "text-left "
                            } flex items-center mb-1`}>
                            <Badge className="py-1 px-2 bg-primary text-primary-foreground">
                              {t("billing", "mostPopular")}
                            </Badge>
                          </div>
                        )}
                        <div className="">
                          <h3
                            className={`text-lg font-semibold text-foreground mb-2 ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                            data-testid={`package-name-${pkg.id}`}>
                            {t("billing", pkg.nameKey as any)}
                          </h3>
                          <div
                            className={`mb-4 ${
                              isRTL ? "text-right" : "text-left"
                            }`}>
                            <p
                              className="text-3xl font-bold text-foreground"
                              data-testid={`package-price-${pkg.id}`}>
                              {isRTL ? `${pkg.amount} ` : `${pkg.amount}`}
                              <span className="ml-2 text-lg font-semibold flex items-center gap-1">
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
                              </span>
                            </p>
                            <p
                              className="text-sm text-muted-foreground"
                              data-testid={`package-impressions-${pkg.id}`}>
                              {pkg.impressions.toLocaleString()}{" "}
                              {t("billing", "impressions")}
                            </p>
                          </div>
                        </div>

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
                              <i
                                className={`fas fa-spinner fa-spin ${
                                  isRTL ? "ml-2" : "mr-2"
                                }`}></i>
                              {t("billing", "processing")}
                            </>
                          ) : (
                            t("billing", "selectPackage")
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Purchase Selected Package */}

              {/* Purchase Selected Package */}
              {selectedPackage && (
                <div
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg mb-6 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <p className="text-sm font-medium text-foreground">
                      {t("billing", "packageSelected")}:{" "}
                      {t(
                        "billing",
                        impressionPackages.find((p) => p.id === selectedPackage)
                          ?.nameKey as any
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
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
                      {impressionPackages.find((p) => p.id === selectedPackage)
                        ?.amount || 0}{" "}
                      -{" "}
                      {impressionPackages
                        .find((p) => p.id === selectedPackage)
                        ?.impressions.toLocaleString()}{" "}
                      {t("billing", "impressions")}
                    </p>
                  </div>
                  <Button
                    onClick={() => handlePurchase(selectedPackage)}
                    disabled={purchaseMutation.isPending}
                    className="w-full sm:w-auto mt-3 sm:mt-0 min-w-[120px]"
                    data-testid="button-purchase-selected">
                    {purchaseMutation.isPending ? (
                      <>
                        <i
                          className={`fas fa-spinner fa-spin ${
                            isRTL ? "ml-2" : "mr-2"
                          }`}></i>
                        {t("billing", "processing")}
                      </>
                    ) : (
                      t("billing", "purchase")
                    )}
                  </Button>
                </div>
              )}

              {/* Custom Amount */}
              <div className="p-6 border border-border rounded-lg">
                <h4 className="text-lg font-semibold text-foreground mb-4">
                  {t("billing", "customAmount")}
                </h4>
                <div
                  className={`flex items-center gap-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <div className="flex-1">
                    <div className="relative">
                      <span
                        className={`absolute top-1/2 transform -translate-y-1/2 text-muted-foreground ${
                          isRTL ? "right-3" : "left-3"
                        }`}>
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
                      </span>
                      <Input
                        type="number"
                        placeholder={t("billing", "enterAmount")}
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        min="10"
                        step="1"
                        className={isRTL ? "pr-12 text-right" : "pl-12"}
                        data-testid="input-custom-amount"
                        dir={isRTL ? "rtl" : "ltr"}
                      />
                    </div>
                    {customAmount && parseFloat(customAmount) >= 10 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("billing", "youllReceive")}{" "}
                        {(
                          parseFloat(customAmount) * impressionsPerSAR
                        ).toLocaleString()}{" "}
                        {t("billing", "impressions")}
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
                        <i
                          className={`fas fa-spinner fa-spin ${
                            isRTL ? "ml-2" : "mr-2"
                          }`}></i>
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
              {isLoadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    {t("billing", "loading")}
                  </p>
                </div>
              ) : paymentHistory.length > 0 ? (
                <div className="space-y-4">
                  {paymentHistory.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className="font-medium text-foreground flex items-center gap-1"
                            data-testid={`purchase-amount-${payment.id}`}>
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
                            {parseFloat(payment.amount).toFixed(2)}
                          </p>
                          <Badge className={getStatusColor(payment.status)}>
                            {getStatusText(payment.status)}
                          </Badge>
                        </div>
                        <p
                          className="text-sm text-muted-foreground"
                          data-testid={`purchase-impressions-${payment.id}`}>
                          {calculateImpressions(
                            payment.amount
                          ).toLocaleString()}{" "}
                          {t("billing", "impressions")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("billing", "method")}:{" "}
                          {payment.method.toUpperCase()}
                        </p>
                      </div>
                      <div
                        className={`${
                          isRTL ? "text-left" : "text-right"
                        } flex flex-col items-end sm:items-end gap-2`}>
                        <p
                          className="text-sm text-muted-foreground"
                          data-testid={`purchase-date-${payment.id}`}>
                          {new Date(payment.createdAt).toLocaleDateString()}
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
