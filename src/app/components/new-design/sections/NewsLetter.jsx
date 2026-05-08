"use client"
import React, { useState } from "react";
import { subscribe, unsubscribe } from "@/app/lib/api";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done,  setDone]  = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await subscribe(email);
      setDone(true);
      setEmail("");
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <section className="py-12 bg-stone-100 dark:bg-stone-900 border-y border-stone-200 dark:border-stone-800">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="
          flex flex-col sm:flex-row
          items-start sm:items-center
          justify-between gap-6
        ">
          <div>
            <h3 className="font-serif text-2xl text-charcoal dark:text-white mb-1">Stay in the Loop</h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm">Exclusive sales, guides, tips & seasonal inspiration — straight to your inbox.</p>
          </div>
          <div className="flex gap-2.5 w-full sm:w-auto sm:min-w-[380px]">
            <input
              type="email"
              placeholder="Enter your email address"
              aria-label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              className="
                flex-1 px-4 py-3 rounded-lg text-sm
                border-2 border-stone-200 dark:border-stone-700
                focus:border-fire outline-none
                bg-white dark:bg-stone-800
                text-charcoal dark:text-white
                placeholder-stone-400 transition-colors
              "
            />
            <button
              onClick={submit}
              className={`
                px-6 py-3 rounded-lg font-semibold text-sm text-white flex-shrink-0 transition-all duration-300
                ${done ? "bg-green-600" : "bg-fire hover:bg-fire-light hover:-translate-y-0.5"}
              `}
            >
              {done ? "✓ Subscribed!" : "Subscribe"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
