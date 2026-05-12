"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { BASE_URL } from "@/app/lib/helpers";
import Link from "next/link";
import Image from "next/image";
import { PHONE, PHONE_HREF } from "@/app/data/new-homepage";
import {
  PhoneIcon,
  CartIcon,
  UserIcon,
} from "@/app/components/new-design/ui/Icons";
import CartButton from "@/app/components/new-design/ui/CartButton";
import SearchBox from "@/app/components/new-design/ui/SearchBox";

import { useSolanaCategories } from "@/app/context/category";
import MyAccountButton from "@/app/components/new-design/ui/MyAccountButton";
import { STORE_NAME } from "@/app/lib/store_constants";

export default function Navbar({ logo }) {
  const { solana_categories: solana_menu_object } = useSolanaCategories();
  const [scrolled, setScrolled] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lockedMenu, setLockedMenu] = useState(null);
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

  const NAV_LINKS = useMemo(() => {
    return solana_menu_object.filter(
      ({ name }) =>
        !["Search", "Home", "Brands", "Current Deals"].includes(name),
    );
    // .filter(({}))
  }, [solana_menu_object]);
  return (
    // z-20
    <nav
      className={`
      sticky top-0
      bg-white dark:bg-charcoal md:bg-white/95 md:dark:bg-charcoal/95
      md:backdrop-blur-md
      border-b border-stone-100 dark:border-stone-800
      transition-shadow duration-300
      ${scrolled ? "shadow-md" : ""}
      ${galleryOnFullscreen ? "" : "z-20"}
    `}
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* ── Row 1: Logo + Search + Actions ── */}
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo — flex-none so it never shrinks; width set on the inner div */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-none"
          >
            {!logo && (
              <>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fire to-red-700 flex items-center justify-center text-lg flex-shrink-0">
                  🔥
                </div>
                <span className="font-serif font-bold text-xl text-charcoal dark:text-white hidden sm:block">
                  Solana Fireplaces
                </span>
              </>
            )}
            {logo && (
              <div className="relative w-[72px] sm:w-[120px] aspect-[2/1] flex-shrink-0">
                <Image
                  src={logo}
                  alt={`${STORE_NAME} logo`}
                  fill
                  sizes="(max-width: 640px) 72px, 120px"
                  className="object-contain"
                  priority={false}
                />
              </div>
            )}
          </Link>

          {/* Search — desktop only inside Row 1 */}
          <div className="hidden lg:flex flex-1 min-w-0">
            <SearchBox />
          </div>

          {/* Actions — flex-none, no fixed width; gap tightened on mobile */}
          <div className="flex items-center gap-1 sm:gap-2 flex-none">
            {/* Phone — hidden on mobile/tablet */}
            <Link
              href={PHONE_HREF}
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-charcoal dark:text-white whitespace-nowrap"
            >
              <span className="text-fire">
                <PhoneIcon />
              </span>
              {PHONE}
            </Link>
            {/* Account */}
            <MyAccountButton />
            {/* Cart */}
            <CartButton />
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex flex-col items-center justify-center gap-1.5"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <span
                className={`w-5 h-0.5 bg-charcoal dark:bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
              />
              <span
                className={`w-5 h-0.5 bg-charcoal dark:bg-white transition-all ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`w-5 h-0.5 bg-charcoal dark:bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* ── Row 1b: Search — mobile only ── */}
        <div className="lg:hidden pb-3">
          <SearchBox />
        </div>

        {/* ── Row 2: Nav Links — desktop only ── */}
        <div
          ref={navRowRef}
          className="hidden lg:flex items-center h-10 gap-0.5 border-t border-stone-100 dark:border-stone-800"
        >
          {NAV_LINKS.map(({ name, children, id, url }) => {
            const isLocked = lockedMenu === id;
            return (
              <div
                key={`desktop-nav-item-${id}`}
                className="relative group flex items-center"
              >
                <Link
                  href={`${BASE_URL}/${url}`}
                  prefetch={false}
                  onClick={(e) => {
                    e.preventDefault();
                    setLockedMenu(isLocked ? null : id);
                  }}
                  className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150 flex items-center gap-0.5
                  ${isLocked ? "bg-stone-100 dark:bg-stone-800 text-fire" : "text-charcoal dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-fire"}`}
                >
                  {name}{" "}
                  <span
                    className={`text-[10px] opacity-60 transition-transform duration-150 ${isLocked ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </Link>
                <div
                  className={`
                absolute top-[calc(100%+4px)] left-0
                bg-white dark:bg-stone-900
                border border-stone-100 dark:border-stone-700
                rounded-xl shadow-2xl min-w-[200px] overflow-hidden
                transition-all duration-200 z-30
                ${
                  isLocked
                    ? "opacity-100 pointer-events-auto translate-y-0"
                    : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto translate-y-2 group-hover:translate-y-0"
                }
              `}
                >
                  {/* Parent category link */}
                  <Link
                    href={`${BASE_URL}/${url}`}
                    onClick={() => setLockedMenu(null)}
                    className="flex items-center justify-between px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border-b border-stone-100 dark:border-stone-700 text-[13px] font-semibold text-charcoal dark:text-white hover:text-fire transition-colors group/parent"
                  >
                    <span>All {name}</span>
                    <span className="text-fire opacity-0 group-hover/parent:opacity-100 transition-opacity text-xs">
                      →
                    </span>
                  </Link>
                  {/* Children */}
                  <div className="p-2">
                    {children.map((c) => (
                      <Link
                        key={`desktop-child-nav-item-${c.id}`}
                        href={`${BASE_URL}/${c?.url}`}
                        onClick={() => setLockedMenu(null)}
                        className="block px-4 py-2 rounded-lg text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-fire transition-colors"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          {/* <Link href="#" className="px-3 py-1.5 rounded-md text-[13px] font-semibold text-fire hover:bg-stone-100 dark:hover:bg-stone-800 transition-all">Open Box</Link> */}
          <Link
            href={`${BASE_URL}/brand/eloquence`}
            className="px-3 py-1.5 rounded-md text-[13px] font-semibold text-fire hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
          >
            Current Deals 🔥
          </Link>
        </div>

      </div>

      {/* ── Mobile Menu — absolute so it overlays content below ── */}
      {menuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-charcoal border-b border-stone-100 dark:border-stone-800 shadow-lg z-30">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(({ name, url, id }) => (
              <Link
                key={`mobile-nav-item-${id}`}
                href={`${BASE_URL}/${url}`}
                prefetch={false}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-charcoal dark:text-stone-200 hover:text-fire hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-colors"
              >
                {name}
              </Link>
            ))}
            <Link
              href={`${BASE_URL}/brand/eloquence`}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 text-sm font-semibold text-fire"
            >
              Current Deals 🔥
            </Link>
            <Link
              href={PHONE_HREF}
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-charcoal dark:text-white"
            >
              <span className="text-fire"><PhoneIcon /></span>
              {PHONE}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
