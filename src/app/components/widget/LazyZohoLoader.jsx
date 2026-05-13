"use client";
import { useEffect } from "react";

// Defers Zoho SalesIQ loading until after first user interaction (or 6s idle).
//
// Why this matters for PageSpeed:
//   - The original inline <script> in <head> was synchronous (render-blocking)
//   - The external Zoho script, even with defer, executes a long task on the
//     main thread right after HTML parsing — directly causing the 810ms TBT
//   - Moving it here pushes that work completely out of the critical path,
//     after the user's first interaction when they can already see the page
const EVENTS = ["scroll", "mousedown", "touchstart", "keydown", "mousemove"];

export default function LazyZohoLoader() {
  useEffect(() => {
    let loaded = false;

    function load() {
      if (loaded) return;
      loaded = true;

      EVENTS.forEach((e) => window.removeEventListener(e, load));
      clearTimeout(idleTimer);

      window.$zoho = window.$zoho || {};
      window.$zoho.salesiq = window.$zoho.salesiq || {
        ready() {
          window.$zoho.salesiq.floatbutton.visible("hide");
        },
      };

      const script = document.createElement("script");
      script.id = "zsiqscript";
      script.src = `https://salesiq.zohopublic.com/widget?wc=${process.env.NEXT_PUBLIC_ZOHO_SALESIQ_WIDGET_CODE}`;
      script.defer = true;
      document.body.appendChild(script);
    }

    EVENTS.forEach((e) =>
      window.addEventListener(e, load, { passive: true, once: true }),
    );

    // Fallback: load after 6s for users who never interact (bots, idle tabs)
    const idleTimer = setTimeout(load, 6000);

    return () => {
      clearTimeout(idleTimer);
      EVENTS.forEach((e) => window.removeEventListener(e, load));
    };
  }, []);

  return null;
}
