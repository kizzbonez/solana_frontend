"use client";
import { useState } from "react";
import { useAuth } from "@/app/context/auth";
import { unsubscribe } from "@/app/lib/api";
import SubscribeWidget from "@/app/components/new-design/ui/SubscribeWidget";

export default function NewsletterSection() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUnsubscribe = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await unsubscribe(user.email);
    } catch (err) {
      console.warn("[NewsletterSection]", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-stone-900 py-16 md:py-24">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col items-center gap-6 text-center">
        <div className="w-8 h-[2px] bg-fire mx-auto" />

        {user?.is_subscribed ? (
          <>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-green-400">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
              <span className="text-green-400 text-xs font-semibold">Subscribed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-white leading-tight">
              You&rsquo;re all caught up!
            </h2>
            <p className="text-stone-400 text-sm sm:text-base max-w-md leading-relaxed">
              You&rsquo;ll keep receiving exclusive deals, guides, and outdoor living inspiration straight to your inbox.
            </p>
            <button
              onClick={handleUnsubscribe}
              disabled={loading}
              className="text-xs text-stone-500 hover:text-stone-300 underline underline-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating…" : "Unsubscribe"}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-white leading-tight">
              Stay in the Loop
            </h2>
            <p className="text-stone-400 text-sm sm:text-base max-w-md leading-relaxed">
              Subscribe for exclusive deals, guides, and outdoor living inspiration delivered straight to your inbox.
            </p>
            <SubscribeWidget label="Subscribe →" />
            <p className="text-stone-600 text-xs">No spam. Unsubscribe at any time.</p>
          </>
        )}
      </div>
    </section>
  );
}
