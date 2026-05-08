"use client";
import React, { useState } from "react";
import { subscribe } from "@/app/lib/api";


const DEFAULT_WRAPPER_CLASS = "flex flex-col sm:flex-row gap-2 w-full max-w-md";
const DEFAULT_INPUT_CLASS =
  "flex-1 text-sm py-3 px-5 rounded-full outline-none bg-stone-800 text-white placeholder-stone-500 border border-stone-700 focus:border-[#e98f3b] transition-colors duration-300";
const DEFAULT_BUTTON_CLASS =
  "py-3 px-8 text-white bg-[#e53237] rounded-full text-sm font-semibold hover:bg-[#c62b30] transition-colors duration-300 whitespace-nowrap tracking-wide";

function SubscribeWidget({
  className = DEFAULT_WRAPPER_CLASS,
  inputClass = DEFAULT_INPUT_CLASS,
  buttonClass = DEFAULT_BUTTON_CLASS,
  label = "Subscribe", // Added missing label prop
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async(e) => {
    e.preventDefault(); // Prevents page reload
    try {
      await subscribe(email);
      setEmail("");
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className={className}>
        <input
          type="email"
          required
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />

        <button type="submit" className={buttonClass}>
            {done ? "✓ Subscribed!" : label}
        </button>
      </div>
    </form>
  );
}

export default SubscribeWidget;
