import { useEffect, useRef, useState } from "react";

export type PixelPlatform = "facebook" | "tiktok" | "google_ads" | "snapchat";

export interface Pixel {
  id: string;
  name?: string;
  pixelId: string;
  platform: PixelPlatform | string;
  createdAt?: string;
  updatedAt?: string;
}

type TrackParams = Record<string, any> | undefined;

// Module-level set to avoid injecting the same platform+id twice across hook instances
const loadedPixels = new Set<string>();

function injectScript(
  src: string,
  id?: string,
  async = true
): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    // avoid duplicate by src or id
    if (id) {
      const existing = document.getElementById(id) as HTMLScriptElement | null;
      if (existing) return resolve(existing);
    }

    const existsBySrc = Array.from(
      document.getElementsByTagName("script")
    ).find((s) => s.src === src) as HTMLScriptElement | undefined;
    if (existsBySrc) return resolve(existsBySrc);

    const s = document.createElement("script");
    if (id) s.id = id;
    s.src = src;
    s.async = async;
    s.onload = () => resolve(s);
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

function loadMetaPixel(id: string) {
  if (!id) return;
  const key = `facebook:${id}`;
  if (loadedPixels.has(key)) return;
  // If fbq already exists, just init and track
  if ((window as any).fbq) {
    try {
      (window as any).fbq("init", id);
      (window as any).fbq("track", "PageView");
    } catch (e) {
      // ignore
    }
    loadedPixels.add(key);
    return;
  }

  // inject bootstrap snippet programmatically
  (function (f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js",
    undefined,
    undefined,
    undefined
  );

  try {
    (window as any).fbq("init", id);
    (window as any).fbq("track", "PageView");
  } catch (e) {}

  loadedPixels.add(key);
}

function loadTikTok(pixelId: string) {
  if (!pixelId) return;
  const key = `tiktok:${pixelId}`;
  if (loadedPixels.has(key)) return;

  // If ttq already bootstrapped by another component/env snippet, just load instance and page.
  if ((window as any).ttq && (window as any).ttq.load) {
    try {
      (window as any).ttq.load(pixelId);
      (window as any).ttq.page();
      loadedPixels.add(key);
      return;
    } catch (_) {}
  }

  // Use TikTok SDK with query string sdkid when possible
  const src = `https://analytics.tiktok.com/i18n/pixel/sdk.js?sdkid=${encodeURIComponent(
    pixelId
  )}`;
  injectScript(src)
    .catch(() => {})
    .finally(() => {
      try {
        const ttq = (window as any).ttq;
        if (ttq && ttq.load) {
          ttq.load(pixelId);
          ttq.page();
        } else if ((window as any).ttq && (window as any).ttq.track) {
          (window as any).ttq.track("PageView");
        }
      } catch (e) {}
      loadedPixels.add(key);
    });
}

function loadGtag(pixelId: string) {
  if (!pixelId) return;
  const key = `google:${pixelId}`;
  if (loadedPixels.has(key)) return;
  const src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    pixelId
  )}`;
  injectScript(src)
    .catch(() => {})
    .finally(() => {
      try {
        (window as any).dataLayer = (window as any).dataLayer || [];
        const gtag = function (...args: any[]) {
          (window as any).dataLayer.push(arguments);
        };
        (window as any).gtag = gtag;
        (window as any).gtag("js", new Date());
        (window as any).gtag("config", pixelId);
      } catch (e) {}
      loadedPixels.add(key);
    });
}

function loadSnapchat(pixelId: string) {
  if (!pixelId) return;
  const key = `snapchat:${pixelId}`;
  if (loadedPixels.has(key)) return;

  // Official snap pixel loader
  try {
    (window as any).snaptr =
      (window as any).snaptr ||
      function () {
        ((window as any).snaptr.q = (window as any).snaptr.q || []).push(
          arguments
        );
      };
    (window as any).snaptr("init", pixelId);
    (window as any).snaptr("track", "PAGE_VIEW");
  } catch (e) {}

  injectScript("https://sc-static.net/scevent.min.js").catch(() => {});
  loadedPixels.add(key);
}

/**
 * Main hook: accepts array of pixels and loads them idempotently.
 * Returns a simple API: loadedPlatforms (set) and trackEvent function for manual tracking.
 */
export default function useLoadPixels(
  pixels?: Pixel[] | null,
  opts?: { enabled?: boolean; consent?: boolean }
) {
  const hasRunRef = useRef(false);
  const [loaded, setLoaded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (opts && opts.enabled === false) return;
    if (!pixels || pixels.length === 0) return;
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const newlyLoaded = new Set<string>();

    for (const px of pixels) {
      const pid = px.pixelId;
      const platform = (px.platform || "").toLowerCase();
      try {
        switch (platform) {
          case "facebook":
          case "meta":
          case "instagram":
            loadMetaPixel(pid);
            newlyLoaded.add(`facebook:${pid}`);
            break;
          case "tiktok":
          case "tt":
            loadTikTok(pid);
            newlyLoaded.add(`tiktok:${pid}`);
            break;
          case "google_ads":
          case "google":
          case "gtag":
            loadGtag(pid);
            newlyLoaded.add(`google:${pid}`);
            break;
          case "snapchat":
            loadSnapchat(pid);
            newlyLoaded.add(`snapchat:${pid}`);
            break;

          default:
            // unknown platform: attempt best-effort mapping for common names
            if (platform.includes("facebook") || platform.includes("meta")) {
              loadMetaPixel(pid);
              newlyLoaded.add(`facebook:${pid}`);
            } else if (
              platform.includes("google") ||
              platform.includes("gtag") ||
              platform.includes("aw-")
            ) {
              loadGtag(pid);
              newlyLoaded.add(`google:${pid}`);
            } else {
              // If unknown, tag as loaded so we don't attempt repeatedly
              newlyLoaded.add(`unknown:${pid}`);
            }
        }
      } catch (e) {
        // swallow errors per-pixel to avoid breaking other pixels
        newlyLoaded.add(`error:${px.id}`);
      }
    }

    // merge into module-level set and update state
    Array.from(newlyLoaded).forEach((k) => loadedPixels.add(k));
    setLoaded(new Set(loadedPixels));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixels]);

  function trackEvent(
    platform: string | PixelPlatform,
    eventName: string,
    params?: TrackParams
  ) {
    const p = (platform || "").toLowerCase();
    try {
      if (p.includes("facebook") || p.includes("meta")) {
        (window as any).fbq &&
          (window as any).fbq("track", eventName, params || {});
      } else if (p.includes("google") || p.includes("gtag")) {
        (window as any).gtag &&
          (window as any).gtag("event", eventName, params || {});
      } else if (p.includes("tiktok")) {
        (window as any).ttq &&
          (window as any).ttq.track &&
          (window as any).ttq.track(eventName, params || {});
      } else if (p.includes("snapchat")) {
        (window as any).snaptr &&
          (window as any).snaptr("track", eventName, params || {});
      } else {
        // fallback: try gtag
        (window as any).gtag &&
          (window as any).gtag("event", eventName, params || {});
      }
    } catch (e) {
      // ignore
    }
  }

  return {
    loadedPlatforms: loaded,
    trackEvent,
  } as const;
}
