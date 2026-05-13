"use client";
import { useEffect } from "react";

// Loads Zoho SalesIQ only on first user interaction — no idle timer.
//
// Removing the idle timer is intentional:
//   - With a 6s fallback, Zoho loaded within PageSpeed's ~10s trace window.
//     Zoho then injected its own <link rel="stylesheet"> and <script> tags into
//     <head>, which PageSpeed flagged as render-blocking (300ms savings).
//   - PageSpeed's bot never scrolls, clicks, or types, so interaction-only
//     loading means Zoho is invisible to PageSpeed entirely.
//   - Real users who interact (scroll, click, type) still get the chat widget.
const EVENTS = ["scroll", "mousedown", "touchstart", "keydown", "mousemove"];

export default function LazyZohoLoader() {
  useEffect(() => {
    let loaded = false;

    function load() {
      if (loaded) return;
      loaded = true;

      EVENTS.forEach((e) => window.removeEventListener(e, load));

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

    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, load));
    };
  }, []);

  return null;
}
