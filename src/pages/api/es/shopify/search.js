import { ES_INDEX, formatProduct } from "../../../../app/lib/helpers";

// Module-level cache — survives across requests, resets on server restart.
// Keyed by the serialised query body so every unique ES query gets its own entry.
// Cap at 200 entries to prevent unbounded growth on a long-running server.
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map(); // bodyKey → { data, ts }

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const ESURL = process.env.NEXT_ES_URL;
  const ESShard = ES_INDEX;
  const ESApiKey = `apiKey ${process.env.NEXT_ES_API_KEY}`;
  const queryBody = req.body;

  // ── Server cache check ──────────────────────────────────────────────────────
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
