import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { TokenManager } from "@/lib/auth";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSeo } from "@/contexts/seo-context";

interface SeoRecord {
  id: string;
  title: string;
  description: string;
  tag_line: string;
}

interface GetSeoResponse {
  success?: boolean;
  data?: SeoRecord[];
}

export default function SeoSettings() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();

  const token = TokenManager.getAccessToken();

  const { data, isLoading, error } = useQuery<GetSeoResponse>({
    queryKey: ["seo-settings"],
    queryFn: async () => {
      const res = await fetch(`${VITE_API_BASE_URL}/api/seo`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok)
        throw new Error(
          t("adminSeo", "errorFetch") || "Failed to fetch SEO settings"
        );
      return res.json();
    },
    staleTime: 60_000,
  });

  const record: SeoRecord | null = useMemo(() => {
    const arr = data?.data ?? [];
    return arr[0] ?? null;
  }, [data]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagLine, setTagLine] = useState("");

  const { setOverride } = useSeo();

  useEffect(() => {
    if (record) {
      setTitle(record.title || "");
      setDescription(record.description || "");
      setTagLine(record.tag_line || "");
      // reflect via global SEO provider
      setOverride({ title: record.title, description: record.description });
    }
    return () => {
      // remove temporary override when leaving the page
      setOverride(null);
    };
  }, [record, setOverride]);

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; data: Partial<SeoRecord> }) => {
      const res = await fetch(`${VITE_API_BASE_URL}/api/seo/${payload.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload.data),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to update SEO");
      }
      return (await res.json()) as SeoRecord;
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["seo-settings"] });
      // temporary override until provider picks up fresh data
      setOverride({ title: updated.title, description: updated.description });
      toast({
        title: t("adminSeo", "savedTitle") || "Saved",
        description: t("adminSeo", "savedDesc") || "SEO settings updated.",
      });
    },
    onError: (err: any) => {
      toast({
        title: t("adminSeo", "errorUpdateTitle") || "Update failed",
        description:
          err?.message ||
          t("adminSeo", "errorUpdateDesc") ||
          "Could not update SEO.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;
    updateMutation.mutate({
      id: record.id,
      data: { title, description, tag_line: tagLine },
    });
  };

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto max-h-[100vh]">
        <Header
          title={t("adminSeo", "title") || "SEO Settings"}
          description={
            t("adminSeo", "description") || "Manage default SEO metadata."
          }
        />

        <main className="p-6 space-y-6 mt-24">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("adminSeo", "formTitle") || "SEO Metadata"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {(error as Error).message}
                </div>
              ) : null}

              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-10 w-full bg-muted animate-pulse rounded" />
                  <div className="h-24 w-full bg-muted animate-pulse rounded" />
                </div>
              ) : record ? (
                <form onSubmit={handleSubmit} className="grid gap-4 max-w-2xl">
                  <div className="grid gap-2">
                    <Label htmlFor="seo-title">
                      {t("adminSeo", "titleLabel") || "Title"}
                    </Label>
                    <Input
                      id="seo-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={80}
                      required
                    />
                    <small className="text-muted-foreground text-xs">
                      {title.length}/80
                    </small>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="seo-desc">
                      {t("adminSeo", "descriptionLabel") || "Description"}
                    </Label>
                    <Textarea
                      id="seo-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      maxLength={160}
                      required
                    />
                    <small className="text-muted-foreground text-xs">
                      {description.length}/160
                    </small>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="seo-tag">
                      {t("adminSeo", "tagLineLabel") || "Tag Line"}
                    </Label>
                    <Input
                      id="seo-tag"
                      value={tagLine}
                      onChange={(e) => setTagLine(e.target.value)}
                      maxLength={100}
                    />
                    <small className="text-muted-foreground text-xs">
                      {tagLine.length}/100
                    </small>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending
                        ? t("adminSeo", "saving") || "Saving..."
                        : t("adminSeo", "save") || "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setTitle(record.title || "");
                        setDescription(record.description || "");
                        setTagLine(record.tag_line || "");
                        setOverride({
                          title: record.title,
                          description: record.description,
                        });
                      }}>
                      {t("adminSeo", "reset") || "Reset"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {t("adminSeo", "noSettings") || "No SEO settings found."}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
