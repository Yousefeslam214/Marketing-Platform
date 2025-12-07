import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { TokenManager } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";

// Dynamic schema that takes the max balance
const createCreditSchema = (maxBalance: number) =>
  z.object({
    credit: z
      .number()
      .min(1, "Credit must be at least 1")
      .max(
        maxBalance,
        `Credit cannot exceed your available balance (${maxBalance})`
      ),
  });

type CreditFormData = z.infer<ReturnType<typeof createCreditSchema>>;

export default function AssignCredit() {
  const [match, params] = useRoute("/ads/:adId/assign-credit");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  if (!TokenManager.getAccessToken()) {
    setLocation("/login");
    return null;
  }

  if (!match || !params?.adId) {
    setLocation("/ads");
    return null;
  }

  // Fetch user balance from payment history
  const { data: balanceData, isLoading: isLoadingBalance } = useQuery({
    queryKey: ["/api/payment/history"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `${VITE_API_BASE_URL}/api/payment/history`
      );
      return response.json();
    },
  });

  const userBalance = balanceData?.data?.balance || 0;

  // Redirect to billing if balance is zero
  useEffect(() => {
    if (!isLoadingBalance && userBalance === 0) {
      toast({
        title: t("userAds", "noCreditsAvailable"),
        description: t("userAds", "needCreditsToAssign"),
        variant: "destructive",
      });
      setLocation("/billing");
    }
  }, [userBalance, isLoadingBalance, setLocation, toast]);

  const form = useForm<CreditFormData>({
    resolver: zodResolver(createCreditSchema(userBalance)),
    defaultValues: {
      credit: Math.min(100, userBalance),
    },
  });

  // Update form validation when balance changes
  useEffect(() => {
    if (userBalance > 0) {
      form.reset({
        credit: Math.min(100, userBalance),
      });
    }
  }, [userBalance, form]);

  const assignCreditMutation = useMutation({
    mutationFn: async (data: CreditFormData) => {
      const response = await apiRequest(
        "POST",
        `${VITE_API_BASE_URL}/api/advertising/${params.adId}/assign-credit`,
        data
      );
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate advertising queries
      queryClient.invalidateQueries({ queryKey: ["/api/advertising"] });
      queryClient.invalidateQueries({
        queryKey: [`/api/advertising/${params.adId}`],
      });

      // Clear billing cache for user and admin
      queryClient.invalidateQueries({ queryKey: ["/api/payment/history"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/payment/getPurchaseHistoryForAdmin"],
      });

      // Clear any other related billing/payment queries
      queryClient.invalidateQueries({ queryKey: ["/api/payment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/billing"] });

      toast({
        title: t("userAds", "creditAssignedSuccessfully"),
        description: `${data.data?.credit} ${t(
          "userAds",
          "creditsAssignedToAd"
        )}`,
      });
      setLocation(`/campaigns/${params.adId}`);
    },
    onError: (error) => {
      toast({
        title: t("userAds", "failedToAssignCredit"),
        description: error.message || t("userAds", "pleaseTryAgain"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CreditFormData) => {
    setIsLoading(true);
    try {
      await assignCreditMutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setLocation(`/campaigns/${params.adId}`);
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 overflow-auto max-h-[100vh]">
        <Header
          title={t("userAds", "assignCredit")}
          description={t("userAds", "assignCreditDescription")}
        />

        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            {isLoadingBalance ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-coins text-yellow-600"></i>
                    {t("userAds", "assignAdvertisingCredits")}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {t("userAds", "adCreatedSuccessfully")}
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Balance Display */}
                  <Alert className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <i className="fas fa-wallet text-blue-600"></i>
                    <AlertDescription className="ml-2">
                      <div className="flex items-center justify-between">
                        <span>{t("userAds", "availableBalance")}:</span>
                        <span className="text-xl font-bold text-blue-600">
                          {userBalance.toLocaleString()}{" "}
                          {t("userAds", "credits")}
                        </span>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6">
                      <FormField
                        control={form.control}
                        name="credit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("userAds", "creditAmount")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter credit amount"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                                className="text-lg"
                                max={userBalance}
                              />
                            </FormControl>
                            <FormMessage />
                            <div className="text-sm text-muted-foreground mt-2">
                              <div className="flex items-center gap-2 mb-1">
                                <i className="fas fa-info-circle text-blue-500"></i>
                                {t("userAds", "creditsDetermineImpressions")}
                              </div>
                              <div className="flex items-center gap-2">
                                <i className="fas fa-lightbulb text-yellow-500"></i>
                                {t("userAds", "maximumAvailable")}:
                                {userBalance.toLocaleString()}{" "}
                                {t("userAds", "credits")}
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">
                          {t("userAds", "suggestedCreditAmounts")}:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                          {userBalance >= 100 && (
                            <button
                              type="button"
                              onClick={() => form.setValue("credit", 100)}
                              className="text-center p-3 bg-white dark:bg-gray-800 rounded border hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors">
                              <div className="font-bold text-green-600">
                                {t("userAds", "100Credits")}
                              </div>
                              <div className="text-muted-foreground">
                                {t("userAds", "smallTestCampaign")}
                              </div>
                            </button>
                          )}
                          {userBalance >= 250 && (
                            <button
                              type="button"
                              onClick={() => form.setValue("credit", 250)}
                              className="text-center p-3 bg-white dark:bg-gray-800 rounded border hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                              <div className="font-bold text-blue-600">
                                {t("userAds", "250Credits")}
                              </div>
                              <div className="text-muted-foreground">
                                {t("userAds", "mediumCampaign")}
                              </div>
                            </button>
                          )}
                          {userBalance >= 500 && (
                            <button
                              type="button"
                              onClick={() =>
                                form.setValue(
                                  "credit",
                                  Math.min(500, userBalance)
                                )
                              }
                              className="text-center p-3 bg-white dark:bg-gray-800 rounded border hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors">
                              <div className="font-bold text-purple-600">
                                {Math.min(500, userBalance)}{" "}
                                {t("userAds", "credits")}
                              </div>
                              <div className="text-muted-foreground">
                                {t("userAds", "largeCampaign")}
                              </div>
                            </button>
                          )}
                          {userBalance < 100 && userBalance > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                form.setValue("credit", userBalance)
                              }
                              className="col-span-3 text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-950/30 transition-colors">
                              <div className="font-bold text-yellow-600">
                                {t("userAds", "all")} {userBalance}{" "}
                                {t("userAds", "credits")}
                              </div>
                              <div className="text-muted-foreground">
                                {t("userAds", "useAllAvailableCredits")}
                              </div>
                            </button>
                          )}
                        </div>
                        <div className="text-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation("/billing")}
                            className="text-xs">
                            <i className="fas fa-plus mx-2"></i>
                            {t("userAds", "addMoreCredits")}
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          disabled={isLoading || assignCreditMutation.isPending}
                          className="flex-1">
                          {isLoading || assignCreditMutation.isPending ? (
                            <>
                              <i className="fas fa-spinner fa-spin mx-2"></i>
                              {t("userAds", "assigningCredit")}
                            </>
                          ) : (
                            <>
                              <i className="fas fa-credit-card mx-2"></i>
                              {t("userAds", "assignCredit")}
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSkip}
                          disabled={
                            isLoading || assignCreditMutation.isPending
                          }>
                          {t("userAds", "skipForNow")}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
