"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BASE_URL } from "@/app/lib/helpers";

function SubcategoryTabsMobile({ subs }) {
  const pathname = usePathname();
  const active_url = `${BASE_URL}${pathname}`;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const active = subs?.find((s) => s?.url === active_url) ?? subs?.[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative py-2" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 transition-colors hover:border-neutral-300 dark:hover:border-neutral-600"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">
            {active?.name ?? "Select category"}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex-shrink-0">
            {active?.count}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-20 overflow-hidden">
          {subs?.map((s, i) => {
            const isActive = active_url === s?.url;
            return (
              <Link
                key={`mob-drop-${i}`}
                href={s?.url || "#"}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                } ${i > 0 ? "border-t border-neutral-100 dark:border-neutral-800" : ""}`}
              >
                <span className="truncate">{s?.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    isActive
                      ? "bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400"
                      : s?.hot
                      ? "bg-orange-100 dark:bg-orange-950 text-orange-500"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {s?.count}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SubcategoryTabsMobile;
