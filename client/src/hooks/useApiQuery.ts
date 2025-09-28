// hooks/useApiQuery.ts
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { TokenManager } from "@/lib/auth";

interface UseApiQueryOptions {
  key: (string | number)[]; // query key can be array of strings and numbers
  url: string;            // API endpoint (relative or full URL)
  enabled?: boolean;      // optional enable/disable
}

export function useApiQuery<T = any>({ key, url, enabled = true }: UseApiQueryOptions) {
  const [, setLocation] = useLocation();

  return useQuery<T>({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const token = TokenManager.getAccessToken();
      if (!token) {
        setLocation("/login");
        throw new Error("Unauthorized");
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("access_token");
        setLocation("/login");
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error(`Failed to fetch from ${url}`);
      return res.json();
    },
    enabled: enabled && !!TokenManager.getAccessToken(),
  });
}
