"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth";
import Link from "next/link";
import { BASE_URL } from "@/app/lib/helpers";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-charcoal dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-fire focus:ring-2 focus:ring-fire/20 transition-colors";

const labelClass =
  "block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5";

function LoginForm({ successLogin = null }) {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data?.error || data?.detail || "Login failed. Please try again.");
      return;
    }

    await login(data);

    if (successLogin) {
      successLogin(true);
    } else {
      router.push(`${BASE_URL}/my-account`);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-charcoal dark:text-white tracking-tight mb-1">
        Fire Up Your Account
      </h2>
      <p className="text-sm text-stone-500 dark:text-stone-400 mb-7">
        Stay fired up with quick checkout, order history, and more.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        <div>
          <label htmlFor="username" className={labelClass}>
            Username <span className="text-fire">*</span>
          </label>
          <input
            id="username"
            name="username"
            placeholder="Enter your username"
            value={form.username}
            onChange={handleChange}
            required
            autoComplete="username"
            className={inputClass}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-stone-600 dark:text-stone-400">
              Password <span className="text-fire">*</span>
            </label>
            <Link
              prefetch={false}
              href={`${BASE_URL}/forgot-password`}
              className="text-xs font-semibold text-fire hover:text-orange-600 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
            <svg className="w-4 h-4 text-red-500 shrink-0 mt-px" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-fire hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

      </form>
    </div>
  );
}

export default LoginForm;
