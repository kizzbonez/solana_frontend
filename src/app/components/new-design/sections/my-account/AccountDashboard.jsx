"use client";
import { useState } from "react";
import { useAuth } from "@/app/context/auth";
import Link from "next/link";
import { BASE_URL } from "@/app/lib/helpers";
import { subscribe, unsubscribe } from "@/app/lib/api";

// ─── Newsletter ───────────────────────────────────────────────────────────────

function NewsletterSection({ email }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!email || loading) return;
    setLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribe(email);
        setIsSubscribed(false);
      } else {
        await subscribe(email);
        setIsSubscribed(true);
      }
    } catch (err) {
      console.warn("[NewsletterSection]", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </span>
        <h3 className="text-sm font-bold text-charcoal dark:text-white">Newsletter</h3>
      </div>

      {isSubscribed ? (
        <>
          <p className="text-sm font-semibold text-charcoal dark:text-white mb-1">
            You're subscribed!
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-5 leading-relaxed">
            You'll keep receiving product drops, seasonal discounts, and outdoor living inspiration.
          </p>
          <button
            onClick={handleToggle}
            disabled={loading}
            className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-500 dark:text-stone-400 hover:border-red-300 hover:text-red-500 dark:hover:border-red-800 dark:hover:text-red-400 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Updating…" : "Unsubscribe"}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-charcoal dark:text-white mb-1">
            Make every weekend feel like vacation.
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-5 leading-relaxed">
            Join now for bundle deals and outdoor living inspiration.
          </p>
          <button
            onClick={handleToggle}
            disabled={loading || !email}
            className="px-4 py-2 bg-fire hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Updating…" : "Subscribe"}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Quick Link Card ──────────────────────────────────────────────────────────

const quickLinks = [
  {
    label: "My Orders",
    description: "View your order history",
    href: `${BASE_URL}/my-account/orders`,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: "Profile",
    description: "Manage addresses",
    href: `${BASE_URL}/my-account/profile`,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    label: "Change Password",
    description: "Update your password",
    href: `${BASE_URL}/my-account/change-password`,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
];

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function AccountDashboard() {
  const { isLoggedIn, user, fullName } = useAuth();

  if (!isLoggedIn || !user) return null;

  const initial = (fullName || user?.username || "?").charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 select-none">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-charcoal dark:text-white">
              Hello, {fullName}!
            </p>
            {user?.email && (
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 truncate">
                {user.email}
              </p>
            )}
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
              Not {fullName}?{" "}
              <Link
                prefetch={false}
                href={`${BASE_URL}/logout`}
                className="text-fire hover:text-orange-600 font-semibold transition-colors"
              >
                Sign out
              </Link>
            </p>
          </div>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 mt-5 leading-relaxed">
          From your dashboard you can view your recent{" "}
          <Link prefetch={false} href={`${BASE_URL}/my-account/orders`} className="text-fire hover:text-orange-600 font-semibold transition-colors">
            orders
          </Link>
          , manage your{" "}
          <Link prefetch={false} href={`${BASE_URL}/my-account/profile`} className="text-fire hover:text-orange-600 font-semibold transition-colors">
            shipping and billing addresses
          </Link>
          , and update your{" "}
          <Link prefetch={false} href={`${BASE_URL}/my-account/change-password`} className="text-fire hover:text-orange-600 font-semibold transition-colors">
            password
          </Link>
          .
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickLinks.map(({ label, description, href, icon }) => (
          <Link
            key={href}
            prefetch={false}
            href={href}
            className="flex items-center gap-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-4 hover:border-orange-200 dark:hover:border-orange-800/50 hover:shadow-sm transition-all group"
          >
            <span className="w-8 h-8 rounded-xl bg-stone-50 dark:bg-stone-800 flex items-center justify-center text-stone-400 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/30 group-hover:text-fire transition-colors flex-shrink-0">
              {icon}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-charcoal dark:text-white group-hover:text-fire transition-colors truncate">
                {label}
              </p>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate">{description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Newsletter */}
      <NewsletterSection email={user?.email} />
    </div>
  );
}
