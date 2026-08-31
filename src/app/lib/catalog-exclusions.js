import { unstable_cache } from "next/cache";
import { redis } from "@/app/lib/redis";
import { exclude_brands, exclude_collections } from "@/app/lib/helpers";

/**
 * Brands and collections suppressed across the whole catalogue.
 *
 * These were static arrays in helpers.js, so hiding a brand meant editing code
 * and shipping a deploy — and, because the value is inlined at build time, a
 * half-updated dev server could serve one list from the App Router and another
 * from Pages. They now live in Redis and are editable at
 * /admin/catalog-exclusions.
 *
 * DELIBERATELY GLOBAL, not store-scoped. Every other Redis key in this app goes
 * through storeKey() so brands cannot read each other's data; this one does the
 * opposite on purpose, because the exclusion list describes the shared
 * catalogue rather than a brand's presentation of it. One list, three
 * storefronts — which also means an edit here changes all three, and the admin
 * screen says so.
 *
 * The static arrays remain in helpers.js as the fallback beneath this. If Redis
 * is empty or unreachable the old list still applies, so the failure mode is a
 * stale exclusion list rather than every suppressed brand reappearing on
 * production at once.
 */

/** Shared by all brands — no storeKey(). See the note above. */
export const CATALOG_EXCLUSIONS_KEY = "catalog_exclusions";

/** Cache tag, so a save busts every read immediately. */
export const CATALOG_EXCLUSIONS_TAG = "catalog-exclusions";

/** The pre-Redis lists, still the fallback and the seed for a first save. */
export const DEFAULT_EXCLUSIONS = Object.freeze({
  brands: exclude_brands,
  collections: exclude_collections,
});

/** Trimmed, de-duplicated, empties dropped. Order is preserved for the UI. */
export function normalizeList(value) {
  if (!Array.isArray(value)) return null;
  return [...new Set(value.map((v) => String(v ?? "").trim()).filter(Boolean))];
}

/**
 * The live exclusion lists.
 *
 * A stored array wins even when it is empty — that is the admin saying "exclude
 * nothing", and it must not be mistaken for "nothing saved yet". Only a missing
 * record or an unusable one falls back to the defaults, which is why the check
 * is Array.isArray rather than a truthiness test on length.
 */
export const getCatalogExclusions = unstable_cache(
  async () => {
    try {
      const stored = await redis.get(CATALOG_EXCLUSIONS_KEY);
      if (!stored || typeof stored !== "object") return { ...DEFAULT_EXCLUSIONS };

      return {
        brands: normalizeList(stored.brands) ?? DEFAULT_EXCLUSIONS.brands,
        collections:
          normalizeList(stored.collections) ?? DEFAULT_EXCLUSIONS.collections,
      };
    } catch (error) {
      // Fail safe, not open. Returning empty lists here would republish every
      // suppressed brand across all three storefronts the moment Redis blinked.
      console.error("getCatalogExclusions failed:", error?.message || error);
      return { ...DEFAULT_EXCLUSIONS };
    }
  },
  // No STORE_ID in the cache key, unlike store-settings: one list serves every
  // brand, so one cache entry should too.
  ["catalog-exclusions"],
  { revalidate: 86400, tags: [CATALOG_EXCLUSIONS_TAG] },
);

/** Writes both lists. Callers are responsible for busting the cache tag. */
export async function saveCatalogExclusions({ brands, collections } = {}) {
  const record = {
    brands: normalizeList(brands) ?? [],
    collections: normalizeList(collections) ?? [],
    updatedAt: new Date().toISOString(),
  };
  await redis.set(CATALOG_EXCLUSIONS_KEY, record);
  return record;
}
