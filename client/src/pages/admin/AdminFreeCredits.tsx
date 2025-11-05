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

export default function AdminFreeCredits() {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current free credits setting
  const { data, isLoading, error } = useQuery({
    queryKey: ["free-credits-setting"],
    queryFn: async () => {
      const token = TokenManager.getAccessToken();
      const res = await fetch(`${VITE_API_BASE_URL}/api/users/get-free-credits`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch free credits setting");
      return res.json();
    },
    staleTime: 60_000,
  });

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

  // Initialize local input when data loads
  const init = useMemo(() => {
    if (!isLoading) setValue(Number(currentAmount) || 0);
    return true;
  }, [isLoading, currentAmount]);

  const updateMutation = useMutation({
    mutationFn: async (amount: number) => {
      const token = TokenManager.getAccessToken();
      const res = await fetch(`${VITE_API_BASE_URL}/api/users/update-free-credits`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ freeCredits: amount }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to update free credits setting");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Free credits updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["free-credits-setting"] });
    },
    onError: (err: any) => {
      toast({
        title: "Update failed",
        description: err?.message || "Unable to update free credits.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto">
        <Header title="Free Credits" description="Control the automatic credits granted to a user after sign-in." />

        <main className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Setting</CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {(error as Error).message}
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="col-span-1">
                  <Label htmlFor="freeCredits">Free credits amount</Label>
                  <Input
                    id="freeCredits"
                    type="number"
                    min={0}
                    step={1}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value) || 0)}
                    placeholder="e.g. 1000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: <strong>{isLoading ? "..." : currentAmount}</strong>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => updateMutation.mutate(value)}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setValue(Number(currentAmount) || 0)}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
