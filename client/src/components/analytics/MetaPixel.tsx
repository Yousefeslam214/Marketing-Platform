import { useEffect } from "react";

interface MetaPixelProps {
  id?: string;
}

/*
  Meta Pixel snippet (reference):

  <!-- Meta Pixel Code -->
  <script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '853924177590110');
  fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=853924177590110&ev=PageView&noscript=1"
  /></noscript>
  <!-- End Meta Pixel Code -->

  The component below implements the same initialization programmatically.
*/

// Use the requested Pixel ID as the default
export default function MetaPixel({ id = "853924177590110" }: MetaPixelProps) {
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
