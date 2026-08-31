import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAuthorizedAdminRequest } from "@/app/lib/admin-auth";
import { redis } from "@/app/lib/redis";
import { fetchBrands } from "@/app/lib/fn_server";
import {
  CATALOG_EXCLUSIONS_TAG,
  DEFAULT_EXCLUSIONS,
  getCatalogExclusions,
  normalizeList,
  saveCatalogExclusions,
} from "@/app/lib/catalog-exclusions";

/**
 * GET  /api/catalog-exclusions  -> current lists, plus the brands to choose from
 * PUT  /api/catalog-exclusions  -> replace both lists
 *
 * Admin-only, like the rest of the admin API. The lists are global rather than
 * store-scoped, so a save from any brand's admin changes all three storefronts
 * — the screen says so, and so does lib/catalog-exclusions.js.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Tags that carry product data filtered by these lists. A change here alters
 * what every listing, search and feed is allowed to return, so leaving them
 * cached would mean an operator excludes a brand, sees it still on the
 * storefront, and reasonably concludes the setting is broken.
 */
const DEPENDENT_TAGS = [
  CATALOG_EXCLUSIONS_TAG,
  "layout-data",
  "categories",
  "home-products",
  "plp-initial-hits",
  "collections-count",
  "pdp",
  "ymal",
  "blogs",
];

/**
 * Elasticsearch responses cached in Redis by pages/api/es/searchkit.js, keyed
 * by a hash of the request body.
 *
 * Busting tags is not enough on its own, and this is the trap: the request body
 * does not change when the exclusion list does, so the same key still hits and
 * serves results computed under the previous list. Found by changing the list
 * and watching the storefront not move.
 */
const SEARCHKIT_CACHE_PATTERN = "searchkit:*";

async function purgeSearchkitCache() {
  let cursor = "0";
  let deleted = 0;
  do {
    const [next, batch] = await redis.scan(cursor, {
      match: SEARCHKIT_CACHE_PATTERN,
      count: 500,
    });
    cursor = String(next);
    if (batch?.length) {
      await redis.del(...batch);
      deleted += batch.length;
    }
  } while (cursor !== "0");
  return deleted;
}

const fail = (error, status) =>
  NextResponse.json({ status: "error", error }, { status });

async function guard(request) {
  if (await isAuthorizedAdminRequest(request)) return null;
  return fail("Unauthorized", 401);
}

export async function GET(request) {
  const denied = await guard(request);
  if (denied) return denied;

  const current = await getCatalogExclusions();

  // The catalogue's own brand list, so the screen offers real values to pick
  // from rather than a free-text box. A typo in this list does not fail loudly
  // — it silently excludes nothing — so choosing from the catalogue is worth
  // the extra request.
  //
  // Note fetchBrands already applies the exclusions, so anything currently
  // excluded is absent from it. The two are merged below, otherwise an excluded
  // brand would vanish from the very screen used to un-exclude it.
  let available = [];
  try {
    available = (await fetchBrands()).map((b) => b.name).filter(Boolean);
  } catch (error) {
    console.error("catalog-exclusions: brand list unavailable:", error?.message);
  }

  const options = [...new Set([...available, ...current.brands])].sort((a, b) =>
    a.localeCompare(b),
  );

  return NextResponse.json({
    status: "ok",
    ...current,
    options,
    defaults: DEFAULT_EXCLUSIONS,
    // Global on purpose; the UI warns with it rather than hardcoding the claim.
    shared: true,
  });
}

export async function PUT(request) {
  const denied = await guard(request);
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Body must be JSON.", 400);
  }

  // Absent means "leave this list alone"; an empty array means "exclude
  // nothing". Conflating the two would let a screen that only edits brands
  // silently wipe the collections list.
  const current = await getCatalogExclusions();
  const brands =
    body?.brands === undefined ? current.brands : normalizeList(body.brands);
  const collections =
    body?.collections === undefined
      ? current.collections
      : normalizeList(body.collections);

  if (brands === null || collections === null) {
    return fail("brands and collections must be arrays of strings.", 400);
  }

  try {
    const saved = await saveCatalogExclusions({ brands, collections });
    DEPENDENT_TAGS.forEach((tag) => revalidateTag(tag));
    const purged = await purgeSearchkitCache();

    return NextResponse.json({
      status: "ok",
      ...saved,
      revalidated: DEPENDENT_TAGS,
      searchkitKeysPurged: purged,
      // Honest about the limit of what a save can reach: Pages Router routes
      // read Redis per request and are fine, but a deployed build's static
      // pages only pick this up on their next revalidation.
      note: "Storefront pages already rendered will update on their next revalidation.",
    });
  } catch (error) {
    console.error("catalog-exclusions: save failed:", error?.message || error);
    return fail("Couldn't save. The list is unchanged.", 502);
  }
}
