import { useEffect } from "react";
import { useLocation } from "wouter";

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-HNFNRWC5E4";

/**
 * GoogleAnalytics SPA tracker
 * - Assumes gtag base snippet is present in index.html
 * - Sends a config call on route changes to record page views in GA4
 */
export default function GoogleAnalytics() {
  const [location] = useLocation();

  useEffect(() => {
    if (!GA_ID) return;
    const gtag = (window as any).gtag as ((...args: any[]) => void) | undefined;
    if (!gtag) return;

    // Send a page_view by updating page_path
    try {
      const params: Record<string, any> = { page_path: location };
      if (!import.meta.env.PROD) params.debug_mode = true;
      gtag("config", GA_ID, params);
    } catch (_) {
      // noop
    }
  }, [location]);

  return null;
}
