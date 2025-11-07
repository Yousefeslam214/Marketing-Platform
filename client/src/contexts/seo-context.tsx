import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { TokenManager } from "@/lib/auth";

export interface SeoRecord {
  id: string;
  title: string;
  description: string;
  tag_line: string;
}

interface GetSeoResponse {
  success?: boolean;
  data?: SeoRecord[];
}

interface SeoContextValue {
  seo: SeoRecord | null;
  override: Partial<SeoRecord> | null;
  setOverride: (o: Partial<SeoRecord> | null) => void;
}

const SeoContext = createContext<SeoContextValue | undefined>(undefined);

function ensureMetaTag(name: string): HTMLMetaElement {
  let el = document.querySelector(
    `meta[name='${name}']`
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  return el!;
}

function setOGTag(property: string, content: string) {
  let el = document.querySelector(
    `meta[property='${property}']`
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function SeoProvider({ children }: { children: React.ReactNode }) {
  const token = TokenManager.getAccessToken();
  const { data } = useQuery<GetSeoResponse>({
    queryKey: ["seo-settings"],
    queryFn: async () => {
      const res = await fetch(`${VITE_API_BASE_URL}/api/seo`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch SEO settings");
      return res.json();
    },
    staleTime: 60_000,
  });

  const seo = useMemo<SeoRecord | null>(() => {
    const arr = data?.data ?? [];
    return arr[0] ?? null;
  }, [data]);

  const [override, setOverride] = useState<Partial<SeoRecord> | null>(null);
  const originalTitle = useRef<string | null>(null);
  const originalDesc = useRef<string | null>(null);

  useEffect(() => {
    // Cache original values once
    if (originalTitle.current === null) originalTitle.current = document.title;
    if (originalDesc.current === null) {
      const meta = document.querySelector(
        "meta[name='description']"
      ) as HTMLMetaElement | null;
      originalDesc.current = meta?.getAttribute("content") || "";
    }
  }, []);

  useEffect(() => {
    const appliedTitle = (
      override?.title ??
      seo?.title ??
      originalTitle.current ??
      ""
    ).trim();
    const appliedDesc = (
      override?.description ??
      seo?.description ??
      originalDesc.current ??
      ""
    ).trim();

    if (appliedTitle) document.title = appliedTitle;
    const metaDesc = ensureMetaTag("description");
    metaDesc.setAttribute("content", appliedDesc);

    // Light OG/Twitter sync (best-effort)
    if (appliedTitle) {
      setOGTag("og:title", appliedTitle);
      setOGTag("twitter:title", appliedTitle);
    }
    if (appliedDesc) {
      setOGTag("og:description", appliedDesc);
      setOGTag("twitter:description", appliedDesc);
    }
  }, [seo, override]);

  const value = useMemo<SeoContextValue>(
    () => ({ seo, override, setOverride }),
    [seo, override]
  );

  return <SeoContext.Provider value={value}>{children}</SeoContext.Provider>;
}

export function useSeo() {
  const ctx = useContext(SeoContext);
  if (!ctx) throw new Error("useSeo must be used within a SeoProvider");
  return ctx;
}
