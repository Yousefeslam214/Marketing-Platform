import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { TokenManager } from "@/lib/auth";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

// A lightweight type to help TS without assuming exact backend shape
type AnyRecord = Record<string, any>;

export default function AdReports() {
  const { t, isRTL } = useLanguage();
  const [query, setQuery] = useState("");

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-ad-reports"],
    queryFn: async () => {
      const token = TokenManager.getAccessToken();
      const res = await fetch(`${VITE_API_BASE_URL}/api/users/ad-reports`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to load ad reports");
      }
      const json = await res.json();
      // Normalize to an array of reports
      const list = Array.isArray(json)
        ? json
        : json?.data ?? json?.reports ?? [];
      return Array.isArray(list) ? (list as AnyRecord[]) : [];
    },
    staleTime: 30_000,
  });

  const reports: AnyRecord[] = (data as AnyRecord[]) || [];
  console.log(reports);
  const filtered = useMemo(() => {
    if (!query.trim()) return reports;
    const q = query.toLowerCase();
    return reports.filter((r) => {
      // Search common fields if present
      const hay = [
        r.campaignId,
        r.adId,
        r.reportedBy,
        r.username,
        r.phoneNumber,
        r.reportDescription,
        r.email,
        r.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [reports, query]);

  // Determine columns from known preferred order; include any extra keys as tail
  const preferredCols = [
    "id",
    "adId",
    "adTitle",
    "reportedBy",
    "type",
    "reason",
    "description",
    "source",
    "status",
    "createdAt",
  ];

  const dynamicCols = useMemo(() => {
    const allKeys = new Set<string>();
    reports.forEach((r) => Object.keys(r || {}).forEach((k) => allKeys.add(k)));

    const normalizedMap: Record<string, string[]> = {
      adId: ["adId", "adID", "campaignId"],
      adTitle: ["adTitle", "title"],
      reportedBy: ["reportedBy", "user", "username"],
      createdAt: ["createdAt", "created_at", "date", "timestamp"],
    };

    const exists = (key: string) => allKeys.has(key);
    const hasAny = (candidates: string[]) => candidates.some(exists);

    const cols: string[] = [];
    for (const key of preferredCols) {
      if (normalizedMap[key as keyof typeof normalizedMap]) {
        if (hasAny(normalizedMap[key as keyof typeof normalizedMap]!)) {
          cols.push(key);
        }
      } else if (exists(key)) {
        cols.push(key);
      }
    }

    // Add remaining unknown keys at the end (excluding objects/arrays later)
    for (const k of Array.from(allKeys)) {
      if (!cols.includes(k)) cols.push(k);
    }
    return cols;
  }, [reports]);

  const getValue = (row: AnyRecord, col: string) => {
    const map: Record<string, string[]> = {
      adId: ["adId", "adID", "campaignId"],
      adTitle: ["adTitle", "title"],
      reportedBy: ["reportedBy", "user", "username"],
      createdAt: ["createdAt", "created_at", "date", "timestamp"],
    };
    const candidates = map[col] || [col];
    for (const k of candidates) {
      if (k in row) return row[k];
    }
    return undefined;
  };

  const renderCell = (row: AnyRecord, col: string) => {
    const v = getValue(row, col);
    if (v == null) return <span className="text-muted-foreground">—</span>;
    if (typeof v === "boolean") return String(v);
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      if (col === "status")
        return (
          <Badge variant="secondary" className="capitalize">
            {v}
          </Badge>
        );
      if (col === "type")
        return (
          <Badge variant="outline" className="capitalize">
            {v}
          </Badge>
        );
      if (col === "source")
        return (
          <Badge variant="default" className="capitalize">
            {v}
          </Badge>
        );
      if (col === "createdAt") {
        const d = new Date(v);
        return isNaN(d.getTime()) ? v : d.toLocaleString();
      }
      // Link to ad detail if looks like an ID
      if (col === "adId" && (row.adId || row.adID || row.campaignId)) {
        const id = row.adId || row.adID || row.campaignId;
        return (
          <a className="text-primary underline" href={`/campaigns/${id}`}>
            {String(v)}
          </a>
        );
      }
      return v;
    }
    // Objects/arrays: show trimmed JSON
    try {
      const s = JSON.stringify(v);
      return s.length > 80 ? s.slice(0, 77) + "…" : s;
    } catch {
      return String(v);
    }
  };

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto">
        <Header
          title={t("adminAdReports", "title")}
          description={t("adminAdReports", "description")}
        />

        <main className="p-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>{t("adminAdReports", "title")}</CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("adminAdReports", "searchPlaceholder")}
                  className="max-w-xs"
                />
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isFetching}>
                  {isFetching
                    ? t("adminAdReports", "refreshing")
                    : t("adminAdReports", "refresh")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {(error as Error).message || t("adminAdReports", "error")}
                </div>
              ) : null}
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-6 w-64" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-sm text-muted-foreground py-10 text-center">
                  {t("adminAdReports", "noReports")}
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        {dynamicCols.map((col) => (
                          <th
                            key={col}
                            className={`px-3 py-2 ${
                              isRTL ? "text-right" : "text-left"
                            } whitespace-nowrap`}>
                            {t("adminAdReports", `columns.${col}`) || col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/30">
                          {dynamicCols.map((col) => (
                            <td
                              key={col}
                              className="px-3 py-2 align-top max-w-[360px]">
                              {renderCell(row, col)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
