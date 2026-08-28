"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { BASE_URL, isNavVisible } from "@/app/lib/helpers";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  PhoneIcon,
  CartIcon,
  UserIcon,
} from "@/app/components/bbq-design/ui/Icons";
import CartButton from "@/app/components/bbq-design/ui/CartButton";
import SearchBox from "@/app/components/bbq-design/ui/SearchBox";

import { useSolanaCategories } from "@/app/context/category";
import MyAccountButton from "@/app/components/bbq-design/ui/MyAccountButton";
import { STORE_NAME, STORE_CONTACT } from "@/app/lib/store_constants";

function NavSpinner({ className = "" }) {
  return (
    <svg
      className={`animate-spin w-3 h-3 text-theme-500 flex-shrink-0 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function Navbar({ logo }) {
  const { solana_categories: solana_menu_object } = useSolanaCategories();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lockedMenu, setLockedMenu] = useState(null);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [loadingHref, setLoadingHref] = useState(null);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState(null);
  const [galleryOnFullscreen, setGalleryOnFullscreen] = useState(false);
  const searchRef = useRef(null);
  const navRowRef = useRef(null);

  useEffect(() => {
    const handleGallery = (e) => {
      setGalleryOnFullscreen(e.detail.isFullscreen);
    };

    window.addEventListener("galleryStatus", handleGallery);
    return () => window.removeEventListener("galleryStatus", handleGallery);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (!searchRef.current?.contains(e.target)) setShowDrop(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (!navRowRef.current?.contains(e.target)) setLockedMenu(null);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    setLoadingHref(null);
    setLockedMenu(null);
    setHoveredMenu(null);
  }, [pathname]);

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
    <nav
      className={`
      sticky top-0
      bg-paper dark:bg-char md:bg-paper/95 md:dark:bg-char/95
      md:backdrop-blur-md
      border-b border-grate dark:border-white/10
      transition-shadow duration-300
      ${scrolled ? "shadow-md shadow-char/10 dark:shadow-black/30" : ""}
      ${galleryOnFullscreen ? "" : "z-20"}
    `}
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* ── Row 1: Logo + Search + Actions ── */}
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          <Link
            href="/"
            className="font-bold text-2xl tracking-wide shrink-0 font-oswald text-char dark:text-ash"
          >
            BBQGrill<span className="text-theme-600 font-oswald">Outlet</span>
            <small className="block font-sora font-normal text-[9px] tracking-[.35em] text-char/40 dark:text-ash/30 uppercase">
              Outdoor Kitchen Experts
            </small>
          </Link>

          {/* Search — desktop only inside Row 1 */}
          <div className="hidden lg:flex flex-1 min-w-0">
            <SearchBox />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-none">
            {/* Phone — hidden on mobile/tablet */}
            <Link
              href={`tel:${STORE_CONTACT}`}
              className="hidden lg:flex items-center gap-1.5 font-oswald text-xs uppercase tracking-wide text-char dark:text-ash hover:text-theme-600 dark:hover:text-theme-500 transition-colors whitespace-nowrap"
            >
              <span className="text-theme-600">
                <PhoneIcon />
              </span>
              {STORE_CONTACT}
            </Link>
            {/* Account */}
            <MyAccountButton />
            {/* Cart */}
            <CartButton />
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden w-10 h-10 bg-ash dark:bg-white/10 flex flex-col items-center justify-center gap-1.5"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span
                className={`w-5 h-0.5 bg-char dark:bg-ash transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
              />
              <span
                className={`w-5 h-0.5 bg-char dark:bg-ash transition-all ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`w-5 h-0.5 bg-char dark:bg-ash transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* ── Row 1b: Search — mobile only ── */}
        <div className="lg:hidden pb-3">
          <SearchBox />
        </div>
      </div>

      {/* ── Row 2: Nav Links — desktop only ── */}
      <div className="border-y border-grate dark:border-white/10">
        <div
          ref={navRowRef}
          className="max-w-[1240px] mx-auto sm:px-6 hidden lg:flex items-center gap-0.5"
        >
          {NAV_LINKS.map(({ name, children, id, url }) => {
            const isLocked = lockedMenu === id;
            const isOpen = isLocked || hoveredMenu === id;
            const cols = children.length > 16 ? 3 : children.length > 8 ? 2 : 1;
            const colClass = cols === 3 ? "columns-3" : cols === 2 ? "columns-2" : "columns-1";
            const minWClass = cols === 3 ? "min-w-[540px]" : cols === 2 ? "min-w-[380px]" : "min-w-[200px]";
            return (
              <div
                key={`desktop-nav-item-${id}`}
                className="relative flex items-center"
                onMouseEnter={() => setHoveredMenu(id)}
                onMouseLeave={() => setHoveredMenu(null)}
              >
                <Link
                  href={`${BASE_URL}/${url}`}
                  prefetch={false}
                  onClick={(e) => {
                    e.preventDefault();
                    setLockedMenu(isLocked ? null : id);
                  }}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  className={`px-3 py-3 text-[12px] font-medium transition-all duration-150 flex items-center gap-0.5 font-oswald uppercase border-b-2
                  ${isOpen
                    ? "bg-theme-600/5 dark:bg-theme-600/10 text-theme-600 dark:text-theme-500 border-theme-600"
                    : "text-char/70 dark:text-ash/60 hover:bg-ash dark:hover:bg-white/5 hover:text-theme-600 dark:hover:text-theme-500 border-transparent"
                  }`}
                >
                  {name}{" "}
                  <span
                    className={`text-[10px] opacity-60 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </Link>
                <div
                  className={`
                absolute top-[calc(100%+4px)] left-0
                bg-paper dark:bg-smoke
                border border-grate dark:border-white/10
                shadow-xl shadow-char/15 dark:shadow-black/40
                rounded-sm overflow-hidden ${minWClass}
                transition-all duration-200 z-30
                ${
                  isOpen
                    ? "opacity-100 pointer-events-auto translate-y-0"
                    : "opacity-0 pointer-events-none translate-y-2"
                }
              `}
                >
                  {/* Parent category link */}
                  <Link
                    href={`${BASE_URL}/${url}`}
                    onClick={() => {
                      if (`/${url}` === pathname) {
                        setLockedMenu(null);
                        setHoveredMenu(null);
                        return;
                      }
                      setLoadingHref(`${BASE_URL}/${url}`);
                    }}
                    className="flex items-center justify-between px-4 py-2.5 bg-ash dark:bg-char/60 border-b border-grate dark:border-white/10 font-oswald text-xs font-semibold uppercase tracking-wide text-char dark:text-ash hover:text-theme-600 dark:hover:text-theme-500 transition-colors group/parent"
                  >
                    <span>All {name}</span>
                    <span className="relative w-3 h-3 flex-shrink-0 flex items-center justify-center">
                      <span
                        className={`absolute text-theme-600 text-xs transition-opacity ${loadingHref === `${BASE_URL}/${url}` ? "invisible" : "opacity-0 group-hover/parent:opacity-100"}`}
                      >
                        →
                      </span>
                      <NavSpinner
                        className={
                          loadingHref === `${BASE_URL}/${url}`
                            ? "visible"
                            : "invisible"
                        }
                      />
                    </span>
                  </Link>
                  {/* Children */}
                  <div className={`p-2 ${colClass}`}>
                    {children.map((c) => (
                      <Link
                        key={`desktop-child-nav-item-${c.id}`}
                        href={`${BASE_URL}/${c?.url}`}
                        onClick={() => {
                          if (`/${c?.url}` === pathname) {
                            setLockedMenu(null);
                            setHoveredMenu(null);
                            return;
                          }
                          setLoadingHref(`${BASE_URL}/${c?.url}`);
                        }}
                        className="break-inside-avoid flex items-center justify-between px-4 py-2 text-[12px] text-char/70 dark:text-ash/60 hover:bg-ash dark:hover:bg-white/5 hover:text-theme-600 dark:hover:text-theme-500 transition-colors"
                      >
                        <span>{c.name}</span>
                        <NavSpinner
                          className={
                            loadingHref === `${BASE_URL}/${c?.url}`
                              ? "visible"
                              : "invisible"
                          }
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          <Link
            href={`${BASE_URL}/brand/eloquence`}
            className="px-3 py-3 text-[12px] font-medium transition-all duration-150 flex items-center gap-0.5 font-oswald uppercase border-b-2 border-transparent text-theme-600 dark:text-theme-500 hover:bg-ash dark:hover:bg-white/5"
          >
            Current Deals 🔥
          </Link>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-paper dark:bg-smoke border-b border-grate dark:border-white/10 shadow-lg shadow-char/10 dark:shadow-black/30 z-30 max-h-[75vh] overflow-y-auto">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3 flex flex-col gap-0.5">
            {NAV_LINKS.map(({ name, url, id, children }) => {
              const isExpanded = expandedMobileMenu === id;
              return (
                <div key={`mobile-nav-item-${id}`}>
                  <button
                    onClick={() =>
                      setExpandedMobileMenu(isExpanded ? null : id)
                    }
                    aria-expanded={isExpanded}
                    className="w-full flex items-center justify-between px-3 py-2.5 font-oswald text-xs font-semibold uppercase tracking-wide text-char dark:text-ash hover:text-theme-600 dark:hover:text-theme-500 hover:bg-ash dark:hover:bg-white/5 transition-colors"
                  >
                    <span>{name}</span>
                    <span
                      className={`text-[11px] opacity-50 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-200 ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-3 mt-0.5 mb-1 flex flex-col gap-0.5 border-l-2 border-theme-600/20 dark:border-theme-600/20 pl-3">
                        <Link
                          href={`${BASE_URL}/${url}`}
                          prefetch={false}
                          onClick={() => setMenuOpen(false)}
                          className="px-3 py-2 font-oswald text-xs font-semibold uppercase tracking-wide text-theme-600 dark:text-theme-500 hover:bg-theme-600/10 dark:hover:bg-theme-600/10 transition-colors"
                        >
                          All {name}
                        </Link>
                        {children?.map((c) => (
                          <Link
                            key={`mobile-child-nav-item-${c.id}`}
                            href={`${BASE_URL}/${c?.url}`}
                            prefetch={false}
                            onClick={() => setMenuOpen(false)}
                            className="px-3 py-2 text-xs text-char/60 dark:text-ash/50 hover:text-theme-600 dark:hover:text-theme-500 hover:bg-ash dark:hover:bg-white/5 transition-colors"
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <Link
              href={`${BASE_URL}/brand/eloquence`}
              onClick={() => setMenuOpen(false)}
              className="font-oswald uppercase px-3 py-2.5 text-sm font-semibold text-theme-600 dark:text-theme-500"
            >
              Current Deals 🔥
            </Link>
            <Link
              href={`tel:${STORE_CONTACT}`}
              onClick={() => setMenuOpen(false)}
              className="mt-1 flex items-center gap-2 px-3 py-2.5 font-oswald text-xs uppercase tracking-wide font-semibold text-char dark:text-ash border-t border-grate dark:border-white/10"
            >
              <span className="text-theme-600">
                <PhoneIcon />
              </span>
              {STORE_CONTACT}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
