"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/auth";

function MyAccountLinks() {
  const pathname = usePathname();
  const { myAccountLinks } = useAuth();

  return (
    <nav className="flex gap-2 md:flex-col overflow-x-auto md:overflow-visible pb-1 md:pb-0 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
      {myAccountLinks.map(({ label, url, icon }) => {
        const isActive = pathname === new URL(url).pathname;
        return (
          <Link
            prefetch={false}
            key={url}
            href={url}
            className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              isActive
                ? "bg-fire text-white shadow-sm"
                : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:border-orange-200 dark:hover:border-orange-800/50 hover:text-fire dark:hover:text-orange-400"
            }`}
          >
            {icon && (
              <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                {icon}
              </span>
            )}
            <span className="whitespace-nowrap">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default MyAccountLinks;
