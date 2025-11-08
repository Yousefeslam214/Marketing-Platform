import { useMemo, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PLATFORMS = [
  "facebook",
  "instagram",
  "tiktok",
  "snapchat",
  "google_ads",
  "pinterest",
  "linkedin",
  "twitter",
  "reddit",
  "quora",
  "bing",
  "youtube",
  "shopify",
] as const;

export default function MarketingLinksPage() {
  const { t, language, isRTL } = useLanguage();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://octopusad.com";

  const items = useMemo(
    () =>
      PLATFORMS.map((p) => ({
        key: p,
        label:
          t("marketingLinks", `platforms.${p}`) ||
          p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        url: `https://octopusad.com/feed?source=${encodeURIComponent(p)}`,
      })),
    [origin, t]
  );

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (e) {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    }
  }

  return (
    <div className={`w-full ${isRTL ? "rtl" : "ltr"}`}>
      <div className="container max-w-5xl mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            {t("marketingLinks", "title") || "Marketing Source Links"}
          </h1>
          <p className="text-muted-foreground">
            {t("marketingLinks", "description") ||
              "Share these links with marketers to track the traffic source via the 'source' query parameter."}
          </p>
          <Badge variant="secondary" className="mt-2">
            {t("marketingLinks", "base") || "Base"}: {origin}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((it) => (
            <Card key={it.key} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-foreground">{it.label}</div>
                  <Badge>{t("marketingLinks", "source") || "Source"}: {it.key}</Badge>
                </div>
                <div className="flex gap-2">
                  <Input readOnly value={it.url} className="text-xs" />
                  <Button
                    onClick={() => copy(it.url, it.key)}
                    variant="default"
                    className="whitespace-nowrap"
                  >
                    {copiedKey === it.key
                      ? t("marketingLinks", "copied") || "Copied"
                      : t("marketingLinks", "copy") || "Copy"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
