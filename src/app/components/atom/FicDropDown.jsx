"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ICRoundPhone, MDIEmailOutline } from "@/app/components/icons/lib";
import Link from "next/link";
import { useEffect, useState } from "react";
import { STORE_CONTACT } from "@/app/lib/store_constants";

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function FicDropDown({ children, contact_number }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  if (isMobile) {
    return (
      <Link href={`tel:${STORE_CONTACT}`} prefetch={false}>
        {children}
      </Link>
    );
  }

  return (
    <Popover>
      <PopoverButton className="focus:outline-none">
        {children}
      </PopoverButton>

      <PopoverPanel
        transition
        anchor="bottom"
        className="z-50 w-56 bg-white border border-neutral-200 rounded-lg shadow-sm text-sm transition duration-150 ease-out data-[closed]:-translate-y-1 data-[closed]:opacity-0 [--anchor-gap:8px]"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Contact Us
          </p>
        </div>

        {/* Links */}
        <div className="px-2 py-2 border-b border-neutral-100">
          <Link
            href={`tel:${contact_number || STORE_CONTACT}`}
            className="flex items-center gap-3 px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <ICRoundPhone className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <span>{contact_number || STORE_CONTACT}</span>
          </Link>
          <Link
            href="mailto:info@solanafireplaces.com"
            className="flex items-center gap-3 px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <MDIEmailOutline className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <span>Email Us</span>
          </Link>
        </div>

        {/* Hours */}
        <div className="px-4 py-3 space-y-3">
          {[{ label: "Sales" }, { label: "Support" }].map(({ label }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-neutral-500 mb-1">{label}</p>
              <p className="text-xs text-neutral-400">Mon – Fri: 5:00am – 5:00pm PST</p>
              <p className="text-xs text-neutral-400">Sat – Sun: Closed</p>
            </div>
          ))}
        </div>
      </PopoverPanel>
    </Popover>
  );
}

export default FicDropDown;
