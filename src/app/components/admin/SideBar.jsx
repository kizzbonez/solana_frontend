"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  Flame,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  ListTree,
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  Rss,
  Settings,
  Trash2,
  EyeOff,
  X,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", url: "/admin", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Appearance",
    items: [
      { name: "Favicon & Logo", url: "/admin/favicon-and-logo", icon: ImageIcon },
      { name: "Theme Color", url: "/admin/theme-color", icon: Palette },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "FAQs Updater", url: "/admin/faqs-updater", icon: MessagesSquare },
      { name: "Menu Builder", url: "/admin/menu-builder", icon: ListTree },
    ],
  },
  {
    label: "SEO",
    items: [
      { name: "Page SEO", url: "/admin/page-seo", icon: Globe },
      { name: "XML Feeds", url: "/admin/xml-feeds", icon: Rss },
    ],
  },
  {
    label: "Configuration",
    items: [
      { name: "Store Settings", url: "/admin/settings", icon: Settings },
      { name: "Catalogue Exclusions", url: "/admin/catalog-exclusions", icon: EyeOff },
    ],
  },
  {
    label: "Maintenance",
    items: [{ name: "Cache", url: "/admin/cache", icon: Trash2 }],
  },
];

function isActive(pathName, item) {
  if (item.exact) return pathName === item.url;
  return pathName === item.url || pathName.startsWith(`${item.url}/`);
}

/**
 * Admin sidebar.
 *
 * - mobile: off-canvas drawer driven by `open` / `onClose`
 * - lg and up: pinned rail that can be collapsed to icons via `collapsed`
 */
export default function SideBar({
  open = false,
  onClose = () => {},
  collapsed = false,
  onToggleCollapse = () => {},
}) {
  const pathName = usePathname();

  // Navigating on mobile should dismiss the drawer.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathName]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Scrim - mobile only */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-zinc-950/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <nav
        id="sidebar"
        aria-label="Admin"
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-zinc-200 bg-white transition-[transform,width,visibility] duration-300 ease-out dark:border-white/10 dark:bg-zinc-950 ${
          collapsed ? "w-[76px]" : "w-64"
        } ${
          // `invisible` keeps the closed drawer out of the tab order on mobile
          open ? "visible translate-x-0" : "invisible -translate-x-full"
        } lg:visible lg:translate-x-0`}
      >
        {/* Brand */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-zinc-200 dark:border-white/10 ${
            collapsed ? "justify-center px-2" : "justify-between pl-5 pr-3"
          }`}
        >
          <Link
            href="/admin"
            prefetch={false}
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <Flame className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            {!collapsed && (
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                  Configurator
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Admin panel
                </span>
              </span>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 lg:hidden dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          {NAV_GROUPS.map((group, groupIndex) => (
            <div key={group.label} className="mb-5 last:mb-0">
              {collapsed ? (
                groupIndex > 0 && (
                  <div className="mx-auto mb-3 h-px w-6 bg-zinc-200 dark:bg-white/10" />
                )
              ) : (
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400 dark:text-zinc-500">
                  {group.label}
                </p>
              )}

              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathName, item);
                  const Icon = item.icon;
                  return (
                    <li key={item.url}>
                      <Link
                        href={item.url}
                        prefetch={false}
                        title={collapsed ? item.name : undefined}
                        aria-current={active ? "page" : undefined}
                        className={`group relative flex items-center rounded-xl text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                          collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
                        } ${
                          active
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                        }`}
                      >
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-600 dark:bg-indigo-400"
                          />
                        )}
                        <Icon
                          className={`h-[18px] w-[18px] shrink-0 ${
                            active
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300"
                          }`}
                          aria-hidden="true"
                        />
                        {collapsed ? (
                          <span className="sr-only">{item.name}</span>
                        ) : (
                          <span className="truncate">{item.name}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="shrink-0 space-y-2 border-t border-zinc-200 p-3 dark:border-white/10">
          <ThemeToggle collapsed={collapsed} />

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            title={collapsed ? "View site" : undefined}
            className={`flex items-center rounded-xl py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white ${
              collapsed ? "justify-center px-0" : "gap-3 px-3"
            }`}
          >
            <ExternalLink className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            {collapsed ? <span className="sr-only">View site</span> : <span>View site</span>}
          </a>

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`hidden w-full items-center rounded-xl py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 lg:flex dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white ${
              collapsed ? "justify-center px-0" : "gap-3 px-3"
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
