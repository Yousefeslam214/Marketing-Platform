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
import { Label } from "@/components/ui/label";
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
        title: "No credits available",
        description:
          "You need to add credits to your account before assigning them to an ad",
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
        title: "Credit assigned successfully",
        description: `${data.data?.credit} credits have been assigned to your ad`,
      });
      setLocation(`/campaigns/${params.adId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to assign credit",
        description: error.message || "Please try again",
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
      <div className="flex-1 overflow-auto">
        <Header
          title="Assign Credit"
          description="Assign advertising credits to your new campaign"
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
                    Assign Advertising Credits
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Your ad has been created successfully! Now assign credits to
                    start your campaign.
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Balance Display */}
                  <Alert className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <i className="fas fa-wallet text-blue-600"></i>
                    <AlertDescription className="ml-2">
                      <div className="flex items-center justify-between">
                        <span>Available Balance:</span>
                        <span className="text-xl font-bold text-blue-600">
                          {userBalance.toLocaleString()} Credits
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
                            <FormLabel>Credit Amount</FormLabel>
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
                                Credits determine how many impressions your ad
                                will receive
                              </div>
                              <div className="flex items-center gap-2">
                                <i className="fas fa-lightbulb text-yellow-500"></i>
                                Maximum available:{" "}
                                {userBalance.toLocaleString()} credits
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">
                          Suggested Credit Amounts:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                          {userBalance >= 100 && (
                            <button
                              type="button"
                              onClick={() => form.setValue("credit", 100)}
                              className="text-center p-3 bg-white dark:bg-gray-800 rounded border hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors">
                              <div className="font-bold text-green-600">
                                100 Credits
                              </div>
                              <div className="text-muted-foreground">
                                Small test campaign
                              </div>
                            </button>
                          )}
                          {userBalance >= 250 && (
                            <button
                              type="button"
                              onClick={() => form.setValue("credit", 250)}
                              className="text-center p-3 bg-white dark:bg-gray-800 rounded border hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                              <div className="font-bold text-blue-600">
                                250 Credits
                              </div>
                              <div className="text-muted-foreground">
                                Medium campaign
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
                                {Math.min(500, userBalance)} Credits
                              </div>
                              <div className="text-muted-foreground">
                                Large campaign
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
                                All {userBalance} Credits
                              </div>
                              <div className="text-muted-foreground">
                                Use all available credits
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
                            <i className="fas fa-plus mr-2"></i>
                            Add More Credits
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
                              <i className="fas fa-spinner fa-spin mr-2"></i>
                              Assigning Credit...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-credit-card mr-2"></i>
                              Assign Credit
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
                          Skip for Now
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
