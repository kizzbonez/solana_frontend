"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, Plus, Save, X } from "lucide-react";

/**
 * Editor for the catalogue-wide exclusion lists.
 *
 * Brands are picked from the catalogue rather than typed, because a typo here
 * fails silently: an entry that matches no brand simply excludes nothing, and
 * the operator is left believing a brand is hidden when it is not. Free text is
 * still allowed for values not yet in the index, but the list comes first.
 */

function Chips({ items, onRemove, empty }) {
  if (!items.length) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{empty}</p>
    );
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white py-1 pl-2.5 pr-1 text-sm text-zinc-800 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
        >
          <span className="max-w-[22rem] truncate">{item}</span>
          <button
            type="button"
            onClick={() => onRemove(item)}
            aria-label={`Stop excluding ${item}`}
            className="rounded-md p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function ListSection({ title, description, items, options, onAdd, onRemove, empty }) {
  const [draft, setDraft] = useState("");

  const available = useMemo(
    () => (options || []).filter((o) => !items.includes(o)),
    [options, items],
  );

  const add = () => {
    const value = draft.trim();
    if (!value || items.includes(value)) return;
    onAdd(value);
    setDraft("");
  };

  return (
    <section className="rounded-xl border border-zinc-200 p-4 sm:p-5 dark:border-white/10">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Add
          </span>
          <input
            list={`${title}-options`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="Start typing, or pick from the catalogue…"
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <datalist id={`${title}-options`}>
            {available.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </label>
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </button>
      </div>

      <div className="mt-4">
        <Chips items={items} onRemove={onRemove} empty={empty} />
      </div>
    </section>
  );
}

export default function CatalogExclusionsEditor() {
  const [brands, setBrands] = useState([]);
  const [collections, setCollections] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/catalog-exclusions", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load (${res.status}).`);
      const data = await res.json();
      setBrands(data.brands || []);
      setCollections(data.collections || []);
      setOptions(data.options || []);
      setDirty(false);
    } catch (e) {
      setError(e?.message || "Couldn't load the exclusion lists.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mutate = (setter) => (value) => {
    setter(value);
    setDirty(true);
    setSaved(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(null);
    try {
      const res = await fetch("/api/catalog-exclusions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brands, collections }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.status === "error") {
        setError(data?.error || `Save failed (${res.status}).`);
        return;
      }
      setSaved(data);
      setDirty(false);
    } catch (e) {
      setError(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Catalogue exclusions
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Brands and collections hidden from the entire storefront — search,
          listings, recommendations, sitemaps and the public catalogue API.
          Products are not deleted; they stop being offered.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          <strong>Affects all three brands.</strong> This list is stored under a
          single shared key, so a change here applies to Solana, BBQ Grill Outlet
          and Outdoor Kitchen Outlet at once. That is deliberate — it describes
          the shared catalogue rather than one storefront&apos;s presentation of
          it.
        </span>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">{error}</span>
        </div>
      )}

      {saved && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Saved. {saved.brands?.length ?? 0} brand
            {saved.brands?.length === 1 ? "" : "s"} and{" "}
            {saved.collections?.length ?? 0} collection
            {saved.collections?.length === 1 ? "" : "s"} excluded. Caches were
            cleared — pages already rendered update on their next revalidation.
          </span>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
      ) : (
        <>
          <ListSection
            title="Brands"
            description="Suppressed everywhere a product is listed. The picker offers brands found in the catalogue; anything already excluded stays listed so it can be removed."
            items={brands}
            options={options}
            onAdd={(v) => mutate(setBrands)([...brands, v])}
            onRemove={(v) => mutate(setBrands)(brands.filter((b) => b !== v))}
            empty="No brands excluded — every brand in the catalogue is on sale."
          />

          <ListSection
            title="Collections"
            description="Suppressed by collection name, for groups of products that should not appear even when their brand is fine."
            items={collections}
            options={[]}
            onAdd={(v) => mutate(setCollections)([...collections, v])}
            onRemove={(v) =>
              mutate(setCollections)(collections.filter((c) => c !== v))
            }
            empty="No collections excluded."
          />

          <div className="flex items-center justify-between gap-3">
            <p className="flex items-start gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
              <span>
                Saving clears the affected caches automatically. A deployed site
                also needs its own cache cleared — see Cache.
              </span>
            </p>
            <button
              type="button"
              onClick={save}
              disabled={saving || !dirty}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
