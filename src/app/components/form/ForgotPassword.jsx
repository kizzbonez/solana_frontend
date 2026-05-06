"use client";

import { useState, useEffect } from "react";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-charcoal dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-fire focus:ring-2 focus:ring-fire/20 transition-colors";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ status: "", message: "" });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setLoading(true);
    setNotif({ status: "", message: "" });
    setCooldown(30);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      setNotif({
        status: res.ok ? "success" : "error",
        message: res.ok
          ? data?.detail || "Check your email for reset instructions."
          : data?.detail || data?.email || "Something went wrong.",
      });
    } catch {
      setNotif({ status: "error", message: "Network error, please try again." });
    } finally {
      setLoading(false);
    }
  };

  const isBusy = loading || cooldown > 0;

  return (
    <div>
      <h2 className="text-xl font-bold text-charcoal dark:text-white tracking-tight mb-1">
        Reset Your Password
      </h2>
      <p className="text-sm text-stone-500 dark:text-stone-400 mb-7">
        Enter the email linked to your account and we'll send you reset instructions.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5"
          >
            Email address <span className="text-fire">*</span>
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={inputClass}
          />
        </div>

        {notif.message && (
          <div
            className={`flex items-start gap-2.5 px-3.5 py-3 rounded-lg border ${
              notif.status === "success"
                ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50"
                : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50"
            }`}
          >
            {notif.status === "success" ? (
              <svg className="w-4 h-4 text-green-500 shrink-0 mt-px" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-px" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            )}
            <p
              className={`text-xs font-medium ${
                notif.status === "success"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {notif.message}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isBusy}
          className="w-full py-2.5 bg-fire hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : loading ? "Sending…" : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
