"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BASE_URL } from "@/app/lib/helpers";

const VISIBLE_COUNT = 6;

function SubcategoryTabsExpand({ subs }) {
  const pathname = usePathname();
  const active_url = `${BASE_URL}${pathname}`;

  const visible = subs?.slice(0, VISIBLE_COUNT) ?? [];
  const overflow = subs?.slice(VISIBLE_COUNT) ?? [];
  const activeInOverflow = overflow.some((s) => s?.url === active_url);

  // Auto-expand when the active tab is in the overflow set
  const [expanded, setExpanded] = useState(activeInOverflow);

  useEffect(() => {
    if (activeInOverflow) setExpanded(true);
  }, [activeInOverflow]);

  const displayed = expanded ? (subs ?? []) : visible;

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
    <div className="flex flex-wrap gap-0 -mb-px items-center">
      {displayed.map((s, i) => (
        <Link
          key={`exp-tab-${i}`}
          href={s?.url || "#"}
          className={tabClass(s?.url)}
        >
          {s?.name}
          <span className={badgeClass(s?.url, s?.hot)}>{s?.count}</span>
        </Link>
      ))}

      {overflow.length > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-300 transition-colors flex-shrink-0"
        >
          {expanded ? (
            <>Show less <span className="text-[10px]">▲</span></>
          ) : (
            <>Show {overflow.length} more <span className="text-[10px]">▾</span></>
          )}
        </button>
      )}
    </div>
  );
}

export default SubcategoryTabsExpand;
