"use client";
import { useState, useEffect } from "react";
import { PhoneIcon } from "@/app/components/new-design/ui/Icons";
import { STORE_CONTACT } from "@/app/lib/store_constants";

function isZohoWindowOpen() {
  const candidates = [
    ...document.querySelectorAll('div[id*="zsiq"]'),
    ...document.querySelectorAll('div[class*="zsiq"]'),
    ...document.querySelectorAll('iframe[src*="zohopublic"]'),
    ...document.querySelectorAll('iframe[src*="salesiq"]'),
  ];

  return candidates.some((el) => {
    if (el.tagName === "SCRIPT") return false;
    const style = window.getComputedStyle(el);
    // height > 100 distinguishes the chat panel from the hidden float button
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      el.offsetHeight > 100
    );
  });
}

export default function ZohoSalesIQButton() {
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!chatOpen) return;

    let pollId;

    // Give Zoho time to open the window before we start checking
    const delayId = setTimeout(() => {
      pollId = setInterval(() => {
        if (!isZohoWindowOpen()) {
          setChatOpen(false);
        }
      }, 500);
    }, 1500);

    return () => {
      clearTimeout(delayId);
      clearInterval(pollId);
    };
  }, [chatOpen]);

  const handleClick = () => {
    setChatOpen(true);
    window.$zoho?.salesiq?.floatwindow?.visible("show");
  };

  if (chatOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 flex flex-col items-end gap-1" style={{ zIndex: 999999 }}>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 bg-white text-green-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow-md cursor-pointer hover:bg-green-50 hover:shadow-lg transition-all duration-200 group"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        We are online — chat now
        <span className="group-hover:translate-x-0.5 transition-transform duration-200">›</span>
      </button>
      <button
        onClick={handleClick}
        aria-label="Open live chat"
        className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white
          bg-fire hover:bg-fire-light transition-all duration-300 hover:-translate-y-0.5
          shadow-[0_4px_20px_rgba(232,93,38,0.4)]
          animate-[pulse_2.5s_ease-in-out_infinite]"
      >
        <PhoneIcon size={15} />
        Call {STORE_CONTACT}
      </button>
    </div>
  );
}
