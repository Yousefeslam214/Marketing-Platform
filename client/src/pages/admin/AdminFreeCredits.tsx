import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { TokenManager } from "@/lib/auth";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminFreeCredits() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current free credits setting
  const { data, isLoading, error } = useQuery({
    queryKey: ["free-credits-setting"],
    queryFn: async () => {
      const token = TokenManager.getAccessToken();
      const res = await fetch(
        `${VITE_API_BASE_URL}/api/users/get-free-credits`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      console.log("Fetched free credits setting:", res);
      if (!res.ok)
        throw new Error(
          t("adminFreeCredits", "errorFetch") ||
            "Failed to fetch free credits setting"
        );
      return res.json();
    },
    staleTime: 60_000,
  });
  console.log("Free credits setting data:", data);

  const currentAmount = useMemo(() => {
    const payload = data as any;
    // Try a few common shapes
    // { success, data: { freeCredits: number } }
    // { success, data: number }
    // { freeCredits: number }
    // or fallback to 0
    const d = payload?.data ?? payload;
    return (
      (typeof d === "number" ? d : d?.freeCredits ?? d?.amount ?? d?.value) ?? 0
    );
  }, [data]);

  const [value, setValue] = useState<number>(0);
  const [inputError, setInputError] = useState<string>("");

  // Initialize local input when data loads
  const init = useMemo(() => {
    if (!isLoading) setValue(Number(currentAmount) || 0);
    return true;
  }, [isLoading, currentAmount]);

  const updateMutation = useMutation({
    mutationFn: async (amount: number) => {
      const token = TokenManager.getAccessToken();
      const res = await fetch(
        `${VITE_API_BASE_URL}/api/users/update-free-credits`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ credits: amount }),
        }
      );
      console.log("Update free credits response:", res);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to update free credits setting");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("adminFreeCredits", "toastSavedTitle"),
        description: t("adminFreeCredits", "toastSavedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["free-credits-setting"] });
    },
    onError: (err: any) => {
      toast({
        title: t("adminFreeCredits", "toastUpdateFailedTitle"),
        description:
          err?.message || t("adminFreeCredits", "toastUpdateFailedDesc"),
        variant: "destructive",
      });
    },
  });

  const sliderMax = useMemo(() => {
    const base = Number(currentAmount) || 0;
    // give some headroom; minimum 22
    return Math.max(base * 2, 100);
  }, [currentAmount]);

  const presets = [5, 10];

  const handleSet = (n: number) => {
    const next = Math.max(0, n);
    setValue(next);
    setInputError("");
  };

  const handleChange = (n: number) => {
    if (Number.isNaN(n)) return;
    if (n < 0) {
      setInputError(t("adminFreeCredits", "validationNegative"));
    } else if (!Number.isInteger(n)) {
      setInputError(t("adminFreeCredits", "validationInteger"));
    } else {
      setInputError("");
    }
    setValue(n < 0 ? 0 : Math.floor(n));
  };

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto">
        <Header
          title={t("adminFreeCredits", "title")}
          description={t("adminFreeCredits", "description")}
        />

        <main className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("adminFreeCredits", "currentSetting")}</CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {(error as Error).message}
                </div>
              ) : null}

              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-6 w-64" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Controls */}
                  <div className="lg:col-span-3 space-y-4">
                    <div>
                      <Label htmlFor="freeCredits">
                        {t("adminFreeCredits", "amountLabel")}
                      </Label>
                      <Input
                        id="freeCredits"
                        type="number"
                        min={0}
                        step={1}
                        value={value}
                        onChange={(e) => handleChange(Number(e.target.value))}
                        placeholder={t("adminFreeCredits", "placeholderAmount")}
                      />
                      {inputError ? (
                        <p className="text-xs text-destructive mt-1">
                          {inputError}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("adminFreeCredits", "currentServer")}{" "}
                          <strong>{currentAmount}</strong>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>{t("adminFreeCredits", "adjustWithSlider")}</Label>
                      <Slider
                        value={[Math.min(value, sliderMax)]}
                        max={sliderMax}
                        step={50}
                        onValueChange={([v]) => handleChange(v)}
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {presets.map((p) => (
                          <Button
                            key={p}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSet(value + p)}>
                            +{p.toLocaleString()}
                          </Button>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSet(Math.max(0, value - 10))}>
                          - 10
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSet(Math.max(0, value - 5))}>
                          - 5
                        </Button>
                        {/* <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSet(Number(currentAmount) || 0)}>
                          Use current
                        </Button> */}
                        {/* <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSet(0)}>
                          Set 0
                        </Button> */}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => updateMutation.mutate(value)}
                        disabled={!!inputError || updateMutation.isPending}>
                        {updateMutation.isPending
                          ? t("adminFreeCredits", "saving")
                          : t("adminFreeCredits", "save")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSet(Number(currentAmount) || 0)}>
                        {t("adminFreeCredits", "reset")}
                      </Button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="lg:col-span-2 p-4 border rounded-lg bg-muted/30 space-y-3 h-fit">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("adminFreeCredits", "serverValue")}
                      </span>
                      <span className="font-semibold">
                        {currentAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("adminFreeCredits", "proposed")}
                      </span>
                      <span className="font-semibold">
                        {value.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("adminFreeCredits", "delta")}
                      </span>
                      <span
                        className={`font-semibold ${
                          value - Number(currentAmount) >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}>
                        {(value - Number(currentAmount) || 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                      {t("adminFreeCredits", "deltaNote")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
