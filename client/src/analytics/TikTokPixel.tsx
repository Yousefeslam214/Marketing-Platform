import { useEffect } from "react";
import { useLocation } from "wouter";

const TT_PIXEL_ID =
  import.meta.env.VITE_TIKTOK_PIXEL_ID || "D445ERJC77U4N81AP4M0";

let hasBootstrapped = false;

function injectTikTokSnippet(id: string) {
  // If ttq exists, do not re-bootstrap
  if ((window as any).ttq) return;

  (function (w: any, d: Document, t: string) {
    w.TiktokAnalyticsObject = t;
    const ttq = ((w as any)[t] = (w as any)[t] || []);
    ttq.methods = [
      "page",
      "track",
      "identify",
      "instances",
      "debug",
      "on",
      "off",
      "once",
      "ready",
      "alias",
      "group",
      "enableCookie",
      "disableCookie",
      "holdConsent",
      "revokeConsent",
      "grantConsent",
    ];
    ttq.setAndDefer = function (t: any, e: string) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (let i = 0; i < ttq.methods.length; i++)
      ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t: string) {
      const e = ttq._i[t] || [];
      for (let n = 0; n < ttq.methods.length; n++)
        ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    };
    ttq.load = function (e: string, n?: any) {
      const r = "https://analytics.tiktok.com/i18n/pixel/events.js";
      const o = n && n.partner;
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = r;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      const s = d.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = r + "?sdkid=" + e + "&lib=" + t;
      const scr = d.getElementsByTagName("script")[0];
      scr.parentNode?.insertBefore(s, scr);
    };
  })(window as any, document, "ttq");

  try {
    (window as any).ttq.load(id);
    (window as any).ttq.page();
  } catch (_) {}
}

export default function TikTokPixel() {
  const [location] = useLocation();

  useEffect(() => {
    if (!TT_PIXEL_ID) return;
    if (!hasBootstrapped) {
      hasBootstrapped = true;
      if (!(window as any).ttq) {
        injectTikTokSnippet(TT_PIXEL_ID);
      } else {
        try {
          (window as any).ttq.load(TT_PIXEL_ID);
          (window as any).ttq.page();
        } catch (_) {}
      }
    }
  }, []);

  useEffect(() => {
    if (!TT_PIXEL_ID) return;
    try {
      (window as any).ttq && (window as any).ttq.page();
    } catch (_) {}
  }, [location]);

  return null;
}
