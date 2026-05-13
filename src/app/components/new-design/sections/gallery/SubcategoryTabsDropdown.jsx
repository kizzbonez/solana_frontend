"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BASE_URL } from "@/app/lib/helpers";
import SubcategoryTabsMobile from "./SubcategoryTabsMobile";

const VISIBLE_COUNT = 3;

function SubcategoryTabsDropdown({ subs }) {
  const pathname = usePathname();
  const active_url = `${BASE_URL}${pathname}`;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const visible = subs?.slice(0, VISIBLE_COUNT) ?? [];
  const overflow = subs?.slice(VISIBLE_COUNT) ?? [];
  const activeInOverflow = overflow.some((s) => s?.url === active_url);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabClass = (url) =>
    `flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
      active_url === url
        ? "border-orange-500 text-orange-600 dark:text-orange-400"
        : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600"
    }`;

  const badgeClass = (url, hot) =>
    `text-xs px-2 py-0.5 rounded-full font-medium ${
      active_url === url
        ? "bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400"
        : hot
        ? "bg-orange-100 dark:bg-orange-950 text-orange-500"
        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
    }`;

  return (
    <>
      {/* Mobile / Tablet — custom select dropdown */}
      <div className="block lg:hidden">
        <SubcategoryTabsMobile subs={subs} />
      </div>

      {/* Desktop — first N tabs + dropdown for overflow */}
      <div className="hidden lg:flex items-center gap-0 -mb-px">
        {visible.map((s, i) => (
          <Link
            key={`desk-tab-${i}`}
            href={s?.url || "#"}
            className={tabClass(s?.url)}
          >
            {s?.name}
            <span className={badgeClass(s?.url, s?.hot)}>{s?.count}</span>
          </Link>
        ))}

        {overflow.length > 0 && (
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeInOverflow
                  ? "border-orange-500 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-300"
              }`}
            >
              {activeInOverflow ? "More •" : `More (${overflow.length})`}
              <span className="text-[10px]">{open ? "▲" : "▾"}</span>
            </button>

            {open && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-20 min-w-[200px] py-1">
                {overflow.map((s, i) => (
                  <Link
                    key={`desk-overflow-${i}`}
                    href={s?.url || "#"}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                      active_url === s?.url
                        ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                    }`}
                  >
                    {s?.name}
                    <span className={badgeClass(s?.url, s?.hot)}>{s?.count}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default SubcategoryTabsDropdown;
