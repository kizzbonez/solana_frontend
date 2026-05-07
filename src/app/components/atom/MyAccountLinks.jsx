"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/context/auth";

function MyAccountLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const { myAccountLinks } = useAuth();
  const logoutItem = myAccountLinks.find(({ label }) => label === "Logout");
  const [showModal, setShowModal] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmLogout = () => {
    setShowModal(false);
    router.push(logoutItem?.url);
  };

  return (
    <>
      <nav className="flex gap-2 md:flex-col overflow-x-auto md:overflow-visible pb-1 md:pb-0 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
        {myAccountLinks
          .filter(({ label }) => label !== "Logout")
          .map(({ label, url, icon }) => {
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

        <button
          onClick={handleLogout}
          className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors bg-white dark:bg-stone-900 text-fire dark:text-orange-400 border border-stone-200 dark:border-stone-700 hover:border-orange-200 dark:hover:border-orange-800/50"
        >
          {logoutItem?.icon && (
            <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
              {logoutItem.icon}
            </span>
          )}
          <span className="whitespace-nowrap">{logoutItem?.label}</span>
        </button>
      </nav>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 w-full max-w-sm mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-fire mx-auto mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </div>

            <h3 className="text-sm font-bold text-charcoal dark:text-white text-center mb-1">
              Sign out?
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 text-center mb-6 leading-relaxed">
              You'll need to sign back in to access your account.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-500 dark:text-stone-400 rounded-xl hover:border-stone-300 dark:hover:border-stone-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2.5 bg-fire hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MyAccountLinks;
