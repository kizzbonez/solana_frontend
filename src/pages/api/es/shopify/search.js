import { ES_INDEX, formatProduct } from "../../../../app/lib/helpers";
import { withRateLimit } from "@/app/lib/rate-limit";
import { getCatalogExclusions } from "@/app/lib/catalog-exclusions";

/**
 * Applies the catalogue exclusions to whatever the caller asked for.
 *
 * The callers here are browser components that build their own Elasticsearch
 * query and post it — autocomplete, "you may also like", the open-box strip.
 * They used to carry the exclusion list themselves, which made it advisory:
 * a client that omitted it, or one running a cached bundle with last week's
 * list, saw suppressed brands anyway.
 *
 * Wrapping rather than merging. The incoming query keeps its own shape as a
 * `must`, and the exclusions sit beside it as a `must_not` that cannot be
 * overridden by anything the caller sent — so this is enforcement, not a
 * suggestion, and it holds however the client query is structured.
 */
async function withExclusions(queryBody) {
  const { brands, collections } = await getCatalogExclusions();
  if (!brands.length && !collections.length) return queryBody;

  const inner = queryBody?.query;
  return {
    ...queryBody,
    query: {
      bool: {
        ...(inner ? { must: [inner] } : {}),
        must_not: [
          { terms: { "brand.keyword": brands } },
          { terms: { "collections.name.keyword": collections } },
        ],
      },
    },
  };
}

// Module-level cache — survives across requests, resets on server restart.
// Keyed by the serialised query body so every unique ES query gets its own entry.
// Cap at 200 entries to prevent unbounded growth on a long-running server.
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map(); // bodyKey → { data, ts }

async function autocompleteSearch(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const ESURL = process.env.NEXT_ES_URL;
  const ESShard = ES_INDEX;
  const ESApiKey = `apiKey ${process.env.NEXT_ES_API_KEY}`;
  const queryBody = await withExclusions(req.body);

  // ── Server cache check ──────────────────────────────────────────────────────
  // Keyed on the query *after* exclusions are applied, so a change to the list
  // cannot be served from an entry built under the previous one.
  const cacheKey = JSON.stringify(queryBody);
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.ts < CACHE_TTL) {
    res.setHeader("X-Cache", "HIT");
    return res.status(200).json(hit.data);
  }

  // ── Live Elasticsearch fetch ─────────────────────────────────────────────────
  try {
    const response = await fetch(`${ESURL}/${ESShard}/_search`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: ESApiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(queryBody),
    });

    const data = await response.json();

    const mapped_data = {
      ...data,
      hits: {
        ...data?.hits,
        hits: (data?.hits?.hits || []).filter(Boolean).map(({ _source }) => ({
          _source: formatProduct(_source, "card"),
        })),
      },
    };

    // Store in cache — evict all entries when cap is reached (simple but effective)
    if (cache.size >= 200) cache.clear();
    cache.set(cacheKey, { data: mapped_data, ts: Date.now() });

    res.setHeader("X-Cache", "MISS");
    res.status(200).json(mapped_data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
}

// Public read endpoint: throttled with 429 + Retry-After so agents can
// back off gracefully. See lib/rate-limit.js.
export default withRateLimit(autocompleteSearch, "search");
