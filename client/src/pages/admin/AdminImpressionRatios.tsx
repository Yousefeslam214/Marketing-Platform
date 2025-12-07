import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { TokenManager } from "@/lib/auth";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// TypeScript interfaces for the API response
interface ImpressionRatio {
  id: string;
  currency: string;
  impressionsPerUnit: number;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  promoted?: boolean;
}

interface ImpressionRatiosResponse {
  success: boolean;
  message: string;
  data: ImpressionRatio[];
}

interface UpdateRatioRequest {
  impressionsPerUnit: number;
  currency: string;
}

export default function AdminImpressionRatios() {
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [editingRatio, setEditingRatio] = useState<ImpressionRatio | null>(
    null
  );
  const [editForm, setEditForm] = useState({
    impressionsPerUnit: 0,
    currency: "",
  });

  // Fetch impression ratios data from API
  const {
    data: ratiosResponse,
    isLoading,
    error,
    refetch,
  } = useApiQuery<ImpressionRatiosResponse>({
    key: ["impression-ratios"],
    url: `${VITE_API_BASE_URL}/api/users/impression-ratios`,
    enabled: !!TokenManager.getAccessToken(),
  });
  console.log(ratiosResponse);
  // Extract data with defaults
  const impressionRatios = ratiosResponse?.data || [];

  // Calculate metrics
  const metrics = {
    totalCurrencies: impressionRatios.length,
    averageRatio:
      impressionRatios.length > 0
        ? Math.round(
            impressionRatios.reduce(
              (sum, ratio) => sum + ratio.impressionsPerUnit,
              0
            ) / impressionRatios.length
          )
        : 0,
    lastModified:
      impressionRatios.length > 0
        ? new Date(
            Math.max(
              ...impressionRatios.map((r) => new Date(r.updatedAt).getTime())
            )
          )
        : null,
  };

  // Update impression ratio mutation
  const updateRatioMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRatioRequest;
    }) => {
      const response = await apiRequest(
        "PUT",
        `${VITE_API_BASE_URL}/api/users/impression-ratios/${id}`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("impressionRatios", "updateSuccess"),
        description: "",
      });
      setEditingRatio(null);
      setEditForm({ impressionsPerUnit: 0, currency: "" });
      queryClient.invalidateQueries({ queryKey: ["impression-ratios"] });
      refetch();
    },
    onError: (error) => {
      toast({
        title: t("impressionRatios", "updateError"),
        description: error.message || t("impressionRatios", "invalidData"),
        variant: "destructive",
      });
    },
  });

  const handleEdit = (ratio: ImpressionRatio) => {
    setEditingRatio(ratio);
    setEditForm({
      impressionsPerUnit: ratio.impressionsPerUnit,
      currency: ratio.currency,
    });
  };

  const handleCancelEdit = () => {
    setEditingRatio(null);
    setEditForm({ impressionsPerUnit: 0, currency: "" });
  };

  const handleSave = () => {
    if (!editingRatio) return;

    if (editForm.impressionsPerUnit <= 0) {
      toast({
        title: t("impressionRatios", "invalidData"),
        description: t("impressionRatios", "enterValidNumber"),
        variant: "destructive",
      });
      return;
    }

    updateRatioMutation.mutate({
      id: editingRatio.id,
      data: {
        impressionsPerUnit: editForm.impressionsPerUnit,
        currency: editForm.currency,
      },
    });
  };

  const getCurrencyLabel = (currency: string) => {
    const currencyMap: { [key: string]: string } = {
      usd: t("impressionRatios", "usd"),
      sar: t("impressionRatios", "sar"),
      eur: t("impressionRatios", "eur"),
    };
    return currencyMap[currency.toLowerCase()] || currency.toUpperCase();
  };

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto max-h-[100vh]">
        <Header
          title={t("impressionRatios", "title")}
          description={t("impressionRatios", "description")}
        />

        <main className="p-6 space-y-6 mt-24">
          {/* Dashboard Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t("impressionRatios", "overview")}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}>
                  {isLoading
                    ? t("impressionRatios", "loading")
                    : t("impressionRatios", "refresh")}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">
                    {t("impressionRatios", "errorLoading")}: {error.message}
                  </p>
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-8 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold">
                      {metrics.totalCurrencies}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("impressionRatios", "totalCurrencies")}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metrics.averageRatio}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("impressionRatios", "averageRatio")}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {metrics.lastModified
                        ? metrics.lastModified.toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("impressionRatios", "lastModified")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Impression Ratios */}
          <Card>
            <CardHeader>
              <CardTitle>{t("impressionRatios", "currentRatios")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse p-4 border rounded-lg">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : impressionRatios.length > 0 ? (
                <div className="space-y-4">
                  {impressionRatios.map((ratio) => (
                    <div
                      key={ratio.id}
                      className="p-4 border rounded-lg space-y-4">
                      {editingRatio?.id === ratio.id ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="currency">
                                {t("impressionRatios", "currency")}
                              </Label>
                              <Input
                                id="currency"
                                value={editForm.currency}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    currency: e.target.value,
                                  })
                                }
                                placeholder="USD, SAR, EUR..."
                              />
                            </div>
                            <div>
                              <Label htmlFor="impressionsPerUnit">
                                {t("impressionRatios", "impressionsPerUnit")}
                              </Label>
                              <Input
                                id="impressionsPerUnit"
                                type="number"
                                min="1"
                                value={editForm.impressionsPerUnit}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    impressionsPerUnit:
                                      parseInt(e.target.value) || 0,
                                  })
                                }
                                placeholder="10"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSave}
                              disabled={updateRatioMutation.isPending}
                              size="sm">
                              {updateRatioMutation.isPending
                                ? t("impressionRatios", "saving")
                                : t("impressionRatios", "save")}
                            </Button>
                            <Button
                              onClick={handleCancelEdit}
                              variant="outline"
                              size="sm">
                              {t("impressionRatios", "cancel")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className="text-lg px-3 py-1">
                                {getCurrencyLabel(ratio.currency)}
                              </Badge>
                              {ratio.promoted ? (
                                <Badge className="ml-2 bg-emerald-100 text-emerald-800">
                                  Promoted
                                </Badge>
                              ) : null}
                              <p className="text-2xl font-bold">
                                {ratio.impressionsPerUnit}{" "}
                                {t(
                                  "impressionRatios",
                                  "impressionsPerUnit"
                                ).toLowerCase()}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>
                                <strong>
                                  {t("impressionRatios", "lastUpdated")}:
                                </strong>{" "}
                                {new Date(ratio.updatedAt).toLocaleString()}
                              </p>
                              <p>
                                <strong>
                                  {t("impressionRatios", "updatedBy")}:
                                </strong>{" "}
                                {ratio.updatedBy.substring(0, 8)}...
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEdit(ratio)}
                              size="sm"
                              variant="outline">
                              <i className="fas fa-edit mx-2"></i>
                              {t("impressionRatios", "edit")}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-chart-bar text-2xl text-muted-foreground"></i>
                  </div>
                  <p className="text-muted-foreground">
                    {t("impressionRatios", "noRatiosFound")}
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
