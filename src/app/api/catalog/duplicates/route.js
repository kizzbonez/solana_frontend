import { NextResponse } from "next/server";
import { ES_INDEX } from "@/app/lib/helpers";
import { isAuthorizedAdminRequest } from "@/app/lib/admin-auth";
import { withRouteRateLimit } from "@/app/lib/rate-limit";

/**
 * GET /api/catalog/duplicates — find products sharing a value that should be unique.
 *
 *   ?field=sku            one dimension
 *   ?field=handle,sku     several
 *   (omitted)             all four
 *   ?min=3                only groups of at least three (default 2)
 *   ?limit=50             groups returned per field (default 25, max 200)
 *   ?brand=Blaze%20Grills restrict to one brand
 *   ?published=true       only products the storefront actually shows
 *   ?samples=0            counts only, no example documents
 *
 * `published=true` is usually what you want. The storefront never renders an
 * unpublished product, so a SKU on one live record and three drafts is not a
 * duplicate anyone can encounter — and counting it as one buries the handful
 * that are genuinely on sale twice. Filtering happens in the query rather than
 * afterwards, so those groups disappear entirely instead of shrinking to one.
 *
 * Answers the question "is anything duplicated in the catalogue, and which
 * records are they" in one request, so a bad import can be spotted without
 * hand-writing Elasticsearch aggregations.
 *
 * Each duplicate group carries the offending documents, not just a count —
 * a count tells you there is a problem, and the records tell you which one to
 * delete. Fields are chosen for that: handle and title identify the product,
 * status and published say whether it is live, updated_at says which copy is
 * newer.
 *
 * Authorised like the other operational endpoints: an admin session, or
 * ?secret=REVALIDATE_SECRET for a script. Signed into /admin, the plain URL
 * works in a browser.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * The dimensions worth checking, and the exact field each aggregates on.
 *
 * Only fields with a keyword mapping can be aggregated; `product_id` is a long
 * and needs no `.keyword`, which is why this is a table rather than a suffix
 * rule. Verified against the live mapping.
 */
const FIELDS = {
  handle: {
    field: "handle.keyword",
    label: "URL handle",
    note: "Two products at the same URL — one of them is unreachable.",
  },
  product_id: {
    field: "product_id",
    label: "Product ID",
    note: "The upstream identifier is not unique; usually a re-import.",
  },
  title: {
    field: "title.keyword",
    label: "Title",
    note: "Often legitimate (variants listed separately), so read before deleting.",
  },
  sku: {
    field: "variants.sku.keyword",
    label: "Variant SKU",
    note: "The same SKU on more than one product — check stock and pricing.",
  },
};

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 200;

/** Enough of a record to decide which copy to keep. */
const SAMPLE_SOURCE = [
  "handle",
  "product_id",
  "title",
  "brand",
  "status",
  "published",
  "updated_at",
  "variants.sku",
];

const bad = (message) =>
  NextResponse.json({ status: "error", error: message }, { status: 400 });

const clampInt = (value, fallback, min, max) => {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

async function esSearch(body) {
  const url = process.env.NEXT_ES_URL;
  const key = process.env.NEXT_ES_API_KEY;
  if (!url || !key) throw new Error("Elasticsearch is not configured");

  const res = await fetch(`${url}/${ES_INDEX}/_search`, {
    method: "POST",
    headers: {
      Authorization: `apiKey ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Elasticsearch responded ${res.status}`);
  return res.json();
}

async function handler(request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json(
      { status: "error", error: "Unauthorized" },
      { status: 401 },
    );
  }

  const sp = request.nextUrl.searchParams;

  const requested = (sp.get("field") || sp.get("fields") || "")
    .split(",")
    .map((f) => f.trim().toLowerCase())
    .filter(Boolean);

  const unknown = requested.filter((f) => !FIELDS[f]);
  if (unknown.length) {
    return bad(
      `Unknown field(s): ${unknown.join(", ")}. Valid: ${Object.keys(FIELDS).join(", ")}.`,
    );
  }

  const fields = requested.length ? requested : Object.keys(FIELDS);
  const limit = clampInt(sp.get("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT);
  const min = clampInt(sp.get("min"), 2, 2, 1000);
  const brand = (sp.get("brand") || "").trim();
  const withSamples = sp.get("samples") !== "0";

  // Tri-state: true, false, or unset for everything. `false` is genuinely
  // useful too — it finds duplicates among drafts before they are published.
  const publishedParam = (sp.get("published") || "").trim().toLowerCase();
  const publishedFilter = ["true", "1", "yes"].includes(publishedParam)
    ? true
    : ["false", "0", "no"].includes(publishedParam)
      ? false
      : null;

  const filters = [
    ...(brand ? [{ term: { "brand.keyword": brand } }] : []),
    ...(publishedFilter === null ? [] : [{ term: { published: publishedFilter } }]),
  ];
  const query = filters.length ? { bool: { filter: filters } } : { match_all: {} };

  try {
    const results = {};
    let grandTotalGroups = 0;
    let grandTotalDocuments = 0;
    let totalDocuments = 0;

    // One request per dimension rather than one combined body: the aggregations
    // are independent, and separating them keeps a single unmapped field from
    // failing the whole report.
    for (const name of fields) {
      const spec = FIELDS[name];
      const body = {
        size: 0,
        query,
        aggs: {
          duplicates: {
            terms: {
              field: spec.field,
              size: limit,
              min_doc_count: min,
              order: { _count: "desc" },
              // Terms aggregations are approximate across shards by default.
              // A generous shard_size makes the counts reliable here, which
              // matters because this report exists to be acted on.
              shard_size: Math.max(limit * 10, 1000),
            },
            ...(withSamples
              ? {
                  aggs: {
                    examples: {
                      top_hits: {
                        size: Math.min(min + 3, 10),
                        _source: SAMPLE_SOURCE,
                        sort: [{ updated_at: { order: "desc", unmapped_type: "date" } }],
                      },
                    },
                  },
                }
              : {}),
          },
          // Exact count of how many groups exist, not just the ones returned —
          // otherwise `limit` silently doubles as "how many duplicates there
          // are", and a clean-looking report would just be a small limit.
          total_groups: {
            cardinality: { field: spec.field },
          },
        },
      };

      const data = await esSearch(body);
      totalDocuments = data?.hits?.total?.value ?? totalDocuments;

      const buckets = data?.aggregations?.duplicates?.buckets || [];
      const groups = buckets.map((b) => ({
        value: b.key,
        count: b.doc_count,
        ...(withSamples
          ? {
              products: (b.examples?.hits?.hits || []).map((h) => ({
                id: h._id,
                ...h._source,
              })),
            }
          : {}),
      }));

      const duplicateDocuments = groups.reduce((sum, g) => sum + g.count, 0);
      grandTotalGroups += groups.length;
      grandTotalDocuments += duplicateDocuments;

      results[name] = {
        label: spec.label,
        field: spec.field,
        note: spec.note,
        groups: groups.length,
        duplicateDocuments,
        // True when the report was cut short, so a caller knows to raise limit
        // rather than concluding it has seen everything.
        truncated: groups.length === limit,
        items: groups,
      };
    }

    return NextResponse.json({
      status: "ok",
      index: ES_INDEX,
      totalDocuments,
      scope: brand || "all brands",
      published:
        publishedFilter === null ? "all" : publishedFilter ? "live only" : "unpublished only",
      minGroupSize: min,
      summary: {
        fieldsChecked: fields,
        duplicateGroups: grandTotalGroups,
        affectedDocuments: grandTotalDocuments,
        clean: grandTotalGroups === 0,
      },
      results,
    });
  } catch (error) {
    console.error("catalog/duplicates:", error?.message || error);
    return NextResponse.json(
      { status: "error", error: "Couldn't query the catalogue." },
      { status: 502 },
    );
  }
}

export const GET = withRouteRateLimit(handler, "light");
