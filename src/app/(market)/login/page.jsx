"use client";

import { useState } from "react";
import LoginForm from "@/app/components/form/Login";
import RegisterForm from "@/app/components/form/Register";

export default function LoginPage() {
  const [tab, setTab] = useState("login");
  const isLogin = tab === "login";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50 dark:bg-stone-950 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal dark:text-white tracking-tight">
            Your Account
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Sign in or create an account to get started
          </p>
        </div>

        {/* Mobile tab switcher */}
        <div className="flex md:hidden p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 mb-6">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              isLogin
                ? "bg-white dark:bg-stone-900 text-charcoal dark:text-white shadow-sm"
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              !isLogin
                ? "bg-white dark:bg-stone-900 text-charcoal dark:text-white shadow-sm"
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            Register
          </button>
        </div>

        {/* Two-panel card */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
          <div className="flex">

            {/* Login panel */}
            <div className={`flex-1 p-8 lg:p-10 ${isLogin ? "block" : "hidden"} md:block`}>
              <LoginForm />
            </div>

            {/* Divider — desktop only */}
            <div className="hidden md:block w-px bg-stone-100 dark:bg-stone-800 my-8" />

            {/* Register panel */}
            <div className={`flex-1 p-8 lg:p-10 ${!isLogin ? "block" : "hidden"} md:block`}>
              <RegisterForm />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
