import { ES_INDEX } from "@/app/lib/helpers";
import { getCatalogExclusions } from "@/app/lib/catalog-exclusions";
import { STORE_NAME } from "@/app/lib/store_constants";
import { STORE_ID } from "@/app/lib/store";
import { productPath } from "@/app/lib/listing-data";
import { withRouteRateLimit } from "@/app/lib/rate-limit";

/**
 * GET /api/catalog/search — public catalogue search for AI agents.
 *
 * Requirement 3 of the client brief: "expose public, rate-limited read
 * endpoints for product catalogs, search, and inventory checks", so agents can
 * ask a question instead of scraping rendered pages.
 *
 * Design notes that matter:
 *
 * - The query is BUILT here from validated scalars. The caller never supplies
 *   Elasticsearch syntax. Proxying a raw query would hand anonymous callers the
 *   whole cluster, and this endpoint is deliberately unauthenticated.
 * - Only the fields an agent needs come back. An endpoint that returns whole
 *   product documents is both enormous and a gift to competitors.
 * - Scoped by STORE_ID, so each brand's deployment answers only for its own
 *   catalogue.
 * - Rate limited on the same buckets as the rest of the search surface.
 */
export const dynamic = "force-dynamic";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;

/** Clamps to an integer inside [min, max], falling back for junk input. */
const clampInt = (raw, fallback, min, max) => {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

const clampFloat = (raw) => {
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const bad = (message, detail) =>
  Response.json(
    { error: "Bad Request", message, ...(detail ? { detail } : {}) },
    { status: 400 },
  );

async function handler(req) {
  const sp = req.nextUrl?.searchParams ?? new URL(req.url).searchParams;

  const q = (sp.get("q") || "").trim();
  const brand = (sp.get("brand") || "").trim();
  const category = (sp.get("category") || "").trim();
  const minPrice = clampFloat(sp.get("min_price"));
  const maxPrice = clampFloat(sp.get("max_price"));
  const limit = clampInt(sp.get("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT);
  const offset = clampInt(sp.get("offset"), 0, 0, 1000);

  if (q.length > 200) return bad("q must be 200 characters or fewer");
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    return bad("min_price cannot be greater than max_price");
  }

  const { brands: excludedBrands, collections: excludedCollections } =
    await getCatalogExclusions();
  const filter = [{ term: { published: true } }];
  if (brand) filter.push({ term: { "brand.keyword": brand } });
  if (category) filter.push({ term: { "accentuate_data.category": category } });
  if (minPrice !== null || maxPrice !== null) {
    filter.push({
      range: {
        "variants.price": {
          ...(minPrice !== null ? { gte: minPrice } : {}),
          ...(maxPrice !== null ? { lte: maxPrice } : {}),
        },
      },
    });
  }

  const body = {
    from: offset,
    size: limit,
    _source: [
      "title", "handle", "brand", "variants", "images",
      "accentuate_data.category", "published", "product_type",
    ],
    query: {
      bool: {
        filter,
        must_not: [
          { terms: { "brand.keyword": excludedBrands } },
          { terms: { "collections.name.keyword": excludedCollections } },
        ],
        ...(q
          ? {
              must: {
                multi_match: {
                  query: q,
                  fields: ["title^3", "brand^2", "variants.sku^4", "product_type"],
                  fuzziness: "AUTO",
                },
              },
            }
          : {}),
      },
    },
  };

  const url = process.env.NEXT_ES_URL;
  const key = process.env.NEXT_ES_API_KEY;
  if (!url || !key) {
    return Response.json(
      { error: "Service Unavailable", message: "Catalogue search is not configured." },
      { status: 503 },
    );
  }

  let data;
  try {
    const res = await fetch(`${url}/${ES_INDEX}/_search`, {
      method: "POST",
      headers: {
        Authorization: `apiKey ${key}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      // Agents ask this endpoint precisely when they need current data, so it
      // reads through rather than serving a cached page's view of the catalogue.
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Elasticsearch responded ${res.status}`);
    data = await res.json();
  } catch {
    return Response.json(
      { error: "Bad Gateway", message: "Catalogue search is temporarily unavailable." },
      { status: 502 },
    );
  }

  const base = process.env.NEXT_PUBLIC_SITE_BASE_URL || "";
  const hits = (data?.hits?.hits || [])
    .map((h) => h?._source)
    .filter(Boolean)
    .map((p) => {
      const variant = p?.variants?.[0];
      const path = productPath(p);
      return {
        title: p.title,
        handle: p.handle,
        brand: p.brand || null,
        category: p?.accentuate_data?.category || null,
        type: p.product_type || null,
        sku: variant?.sku || null,
        price: variant?.price ?? null,
        currency: "USD",
        availability: p?.published === false ? "OutOfStock" : "InStock",
        image: p?.images?.find((i) => i?.position === 1)?.src || p?.images?.[0]?.src || null,
        url: path ? `${base}${path}` : null,
      };
    });

  return Response.json({
    store: { id: STORE_ID, name: STORE_NAME },
    query: { q: q || null, brand: brand || null, category: category || null,
             min_price: minPrice, max_price: maxPrice, limit, offset },
    total: data?.hits?.total?.value ?? hits.length,
    count: hits.length,
    results: hits,
  });
}

export const GET = withRouteRateLimit(handler, "search");
