import { useEffect } from "react";

interface MetaPixelProps {
  id?: string;
}

// export default function MetaPixel({ id = "1743635966210784" }: MetaPixelProps) {
export default function MetaPixel({ id = "800700262549089" }: MetaPixelProps) {
  useEffect(() => {
    // If fbq already exists, don't re-initialize
    if ((window as any).fbq) {
      try {
        (window as any).fbq("init", id);
        (window as any).fbq("track", "PageView");
      } catch (e) {
        // ignore
      }
      return;
    }

    // Inject the pixel bootstrapper (same logic as official snippet)
    (function (f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
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
    } catch (e) {
      // ignore
    }
  }, [id]);

  // Render noscript fallback (img) so analytics still record when JS is disabled.
  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
        alt="facebook-pixel"
      />
    </noscript>
  );
}
