"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/auth";
import { BASE_URL } from "@/app/lib/helpers";
import { UserIcon } from "@/app/components/new-design/ui/Icons";

export default function MyAccountButton({ className }) {
  const { isLoggedIn, logout, myAccountLinks, accountBenefits } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <Link
        prefetch={false}
        href={`${BASE_URL}/login`}
        aria-label="My account"
        onClick={(e) => { e.preventDefault(); setIsOpen((o) => !o); }}
        className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-charcoal dark:text-white hover:bg-fire hover:text-white transition-all duration-200"
      >
        <UserIcon />
      </Link>

      {isOpen && (
        <>
          {/* Backdrop — closes on outside tap/click */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-[220px] bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-700 rounded-xl shadow-2xl overflow-hidden z-50">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-stone-50 dark:bg-stone-800 border-b border-stone-100 dark:border-stone-700">
              <span className="text-[13px] font-semibold text-charcoal dark:text-white">
                My Account
              </span>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="p-1 rounded-md text-stone-400 dark:text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Logged in */}
            {isLoggedIn && (
              <div className="p-2">
                {myAccountLinks.map((item) => (
                  <Link
                    key={`my-account-link-${item?.label?.toLowerCase()}`}
                    prefetch={false}
                    href={item?.url}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-fire transition-colors"
                  >
                    {item?.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Logged out */}
            {!isLoggedIn && (
              <div className="p-3 flex flex-col gap-3">
                <Link
                  href={`${BASE_URL}/login`}
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 bg-fire hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Login / Register
                </Link>
                {accountBenefits?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-2">
                      Benefits
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {accountBenefits.map((item, i) => (
                        <li
                          key={`acc-benefit-${i}`}
                          className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400"
                        >
                          <span className="text-fire font-bold text-[10px]">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
}
