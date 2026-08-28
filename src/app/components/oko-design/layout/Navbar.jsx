"use client";
import React, { useState, useEffect, useMemo } from "react";
import { BASE_URL, isNavVisible } from "@/app/lib/helpers";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartButton from "@/app/components/oko-design/ui/CartButton";
import SearchBox from "@/app/components/oko-design/ui/SearchBox";
import MyAccountButton from "@/app/components/oko-design/ui/MyAccountButton";
import { useSolanaCategories } from "@/app/context/category";
import { STORE_CONTACT } from "@/app/lib/store_constants";

function SearchGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function Navbar({ logo }) {
  const { solana_categories: solana_menu_object } = useSolanaCategories();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close the mobile menu / search on navigation.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Lock body scroll while the full-screen mobile menu is open.
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [menuOpen]);

  const NAV_LINKS = useMemo(() => {
    return solana_menu_object
      .filter(
        ({ name }) =>
          !["Search", "Home", "Brands", "Current Deals"].includes(name),
      )
      // The menu builder's "Show in navigation" toggle. Applied to children as
      // well, so hiding a single brand or sub-category takes it out of the
      // dropdown without removing the whole parent.
      .filter(isNavVisible)
      .map((item) => ({
        ...item,
        children: (item.children || []).filter(isNavVisible),
      }));
  }, [solana_menu_object]);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white dark:bg-oko-night border-b border-oko-stone-line dark:border-oko-line-dark">
        <div className="max-w-[1260px] mx-auto px-5 sm:px-8">
          {/* ── Header row (96px desktop / 64px mobile) ── */}
          <div className="flex items-center gap-4 lg:gap-7 h-16 lg:h-24">
            {/* Logo lockup — bordered box, 1.5px barn */}
            <Link
              href="/"
              aria-label="Outdoor Kitchen Outlet home"
              className="flex flex-col items-center leading-none border-[1.5px] border-oko-barn rounded-[2px] px-3.5 py-2 sm:px-5 sm:py-2.5 shrink-0"
            >
              <span className="font-oko-display font-semibold text-[15px] sm:text-[19px] tracking-[0.04em] text-oko-char dark:text-oko-cream whitespace-nowrap">
                OUTDOOR <span className="text-oko-barn dark:text-oko-barn-light">⌂</span> KITCHEN
              </span>
              <span className="font-inter text-[8px] sm:text-[10px] tracking-[0.32em] text-oko-stone dark:text-oko-ondark-faint mt-0.5">
                OUTLET
              </span>
            </Link>

            {/* Search pill — inline on desktop */}
            <div className="hidden lg:flex flex-1 min-w-0 max-w-[460px]">
              <SearchBox />
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-3 sm:gap-6 ml-auto">
              {/* Phone block */}
              <Link
                href={`tel:${STORE_CONTACT}`}
                className="hidden lg:block text-right group"
              >
                <span className="block font-oko-display font-bold text-[12px] leading-[1.15] text-oko-char dark:text-oko-cream">
                  Best prices<br />by phone
                </span>
                <span className="block font-inter font-semibold text-[16px] text-oko-barn dark:text-oko-barn-light group-hover:text-oko-barn-dark transition-colors">
                  {STORE_CONTACT}
                </span>
              </Link>

              {/* Account + Cart */}
              <MyAccountButton />
              <CartButton />

              {/* Mobile: search toggle */}
              <button
                type="button"
                onClick={() => setSearchOpen((o) => !o)}
                aria-label="Search"
                aria-expanded={searchOpen}
                className="lg:hidden flex items-center justify-center w-10 h-10 text-oko-char dark:text-oko-cream hover:text-oko-barn dark:hover:text-oko-barn-light transition-colors"
              >
                <SearchGlyph />
              </button>

              {/* Mobile: hamburger */}
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                className="lg:hidden flex flex-col items-center justify-center gap-[5px] w-10 h-10 text-oko-char dark:text-oko-cream"
              >
                <span className={`block w-5 h-[1.6px] bg-current transition-all ${menuOpen ? "translate-y-[6.6px] rotate-45" : ""}`} />
                <span className={`block w-5 h-[1.6px] bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-[1.6px] bg-current transition-all ${menuOpen ? "-translate-y-[6.6px] -rotate-45" : ""}`} />
              </button>
            </div>
          </div>

          {/* Mobile: expandable search row */}
          {searchOpen && (
            <div className="lg:hidden pb-3">
              <SearchBox />
            </div>
          )}
        </div>

        {/* ── Primary nav row (52px) — desktop only ── */}
        <div className="hidden lg:block border-t border-oko-stone-line dark:border-oko-line-dark">
          <div className="max-w-[1260px] mx-auto px-5 sm:px-8">
            <nav className="flex items-center gap-[34px] h-[52px]">
              {NAV_LINKS.map(({ name, url, id }) => (
                <Link
                  key={`oko-nav-${id}`}
                  href={`${BASE_URL}/${url}`}
                  prefetch={false}
                  className="font-inter text-[12.5px] font-semibold uppercase tracking-[0.05em] text-oko-char dark:text-oko-ondark border-b-2 border-transparent py-[6px] hover:text-oko-barn dark:hover:text-oko-barn-light hover:border-oko-barn dark:hover:border-oko-barn-light transition-colors"
                >
                  {name}
                </Link>
              ))}
              {/* Sale — permanently barn */}
              <Link
                href={`${BASE_URL}/open-box`}
                prefetch={false}
                className="font-inter text-[12.5px] font-semibold uppercase tracking-[0.05em] text-oko-barn dark:text-oko-barn-light border-b-2 border-transparent py-[6px] hover:border-oko-barn dark:hover:border-oko-barn-light transition-colors"
              >
                Sale
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ── Mobile full-screen menu panel ── */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-oko-cream dark:bg-oko-night flex flex-col">
          <div className="flex items-center justify-between h-16 px-5 border-b border-oko-stone-line dark:border-oko-line-dark shrink-0">
            <span className="font-oko-display font-semibold text-[16px] uppercase tracking-[0.04em] text-oko-char dark:text-oko-cream">
              Menu
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex items-center justify-center w-10 h-10 text-oko-char dark:text-oko-cream hover:text-oko-barn dark:hover:text-oko-barn-light transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="flex flex-col">
              {NAV_LINKS.map(({ name, url, id }) => (
                <Link
                  key={`oko-mnav-${id}`}
                  href={`${BASE_URL}/${url}`}
                  prefetch={false}
                  onClick={() => setMenuOpen(false)}
                  className="px-5 py-4 font-inter text-[15px] font-semibold uppercase tracking-[0.04em] text-oko-char dark:text-oko-cream border-b border-oko-stone-line dark:border-oko-line-dark hover:text-oko-barn dark:hover:text-oko-barn-light transition-colors"
                >
                  {name}
                </Link>
              ))}
              <Link
                href={`${BASE_URL}/open-box`}
                prefetch={false}
                onClick={() => setMenuOpen(false)}
                className="px-5 py-4 font-inter text-[15px] font-semibold uppercase tracking-[0.04em] text-oko-barn dark:text-oko-barn-light border-b border-oko-stone-line dark:border-oko-line-dark"
              >
                Sale
              </Link>
            </nav>

            <div className="px-5 py-5">
              <span className="block font-oko-mono text-[11px] uppercase tracking-[0.14em] text-oko-barn dark:text-oko-barn-light mb-1">
                Best prices by phone
              </span>
              <Link
                href={`tel:${STORE_CONTACT}`}
                className="font-oko-display font-bold text-[22px] text-oko-char dark:text-oko-cream"
              >
                {STORE_CONTACT}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky bottom call bar — mobile only ── */}
      <Link
        href={`tel:${STORE_CONTACT}`}
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-[52px] flex items-center justify-center gap-2 bg-oko-barn text-white font-inter font-semibold text-[14px] tracking-[0.02em] hover:bg-oko-barn-dark transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        Call {STORE_CONTACT}
      </Link>
    </>
  );
}
