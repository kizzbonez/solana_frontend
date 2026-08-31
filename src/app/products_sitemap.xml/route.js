import {
  ES_INDEX,
  createSlug,
  stripHtmlTags,
} from "@/app/lib/helpers";
import { getCatalogExclusions } from "@/app/lib/catalog-exclusions";
import { getStoreSettings } from "@/app/lib/store-settings";

// Google Merchant Center product feed, served at /products_sitemap.xml.
//
// Despite the filename this is NOT a sitemap — Merchant Center cannot read
// sitemap.xml, which only lists URLs. This is an RSS 2.0 document in the
// http://base.google.com/ns/1.0 namespace carrying the product attributes
// Merchant Center actually ingests. Register it under Products → Feeds as a
// "scheduled fetch". app/sitemap.js stays as-is for ordinary crawl discovery.
//
// The feed runs in one of two modes.
//
// SHOPIFY MODE — set MERCHANT_FEED_SHOPIFY_DOMAIN (e.g.
// "https://www.outdoorkitchenoutlet.com"). The feed then describes that
// storefront and this app is only the generator. Used where the selling site
// cannot produce its own feed but shares the catalog.
//
// Every Merchant Center attribute is read from that store's public
// products.json, never from Elasticsearch. That is deliberate: Google requires
// the feed's price and availability to match the landing page, so the landing
// page's own data is the only safe source. Measured against the live catalogs,
// ES handles resolved on Shopify for just 87.0% of items and ES SKUs for 86.2%
// — the two catalogs differ by roughly 600 products, so any ES-to-Shopify
// mapping ships hundreds of dead landing pages.
//
// SELF MODE — the default when that variable is unset. The feed describes this
// Next app, sourced from Elasticsearch, linking at NEXT_PUBLIC_SITE_BASE_URL.
// This is correct for solanafireplaces.com and bbqgrilloutlet.com, which serve
// their own product pages.
export const revalidate = 3600;

const ESURL = process.env.NEXT_ES_URL;
const ESApiKey = `apiKey ${process.env.NEXT_ES_API_KEY}`;

// Google caps titles at 150 chars and descriptions at 5000.
const MAX_TITLE = 150;
const MAX_DESCRIPTION = 5000;
// A feed item may carry up to 10 additional images beyond image_link.
const MAX_EXTRA_IMAGES = 10;
// ES page size. Kept at 500 because body_html makes responses heavy: at 1000
// each page exceeded Next's 2MB data-cache ceiling and was discarded uncached.
const ES_PAGE_SIZE = 500;
// products.json caps out at 250 per page.
const SHOPIFY_PAGE_SIZE = 250;
// Guard against an unbounded loop if a store keeps returning products.
const SHOPIFY_MAX_PAGES = 60;
// products.json is rate limited. Walking ~18 pages back to back reliably trips
// it, which failed the whole feed with a 429 and dropped the route from static
// to on-demand. Pace the requests and retry with backoff rather than give up.
const SHOPIFY_PAGE_DELAY_MS = 600;
const SHOPIFY_RETRY_ATTEMPTS = 4;
const SHOPIFY_RETRY_BASE_MS = 1500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Drop anything outside the XML 1.0 legal character range. Product copy is
// pasted from manufacturer sources and occasionally carries stray control
// bytes; a single one makes the whole document unparseable and Merchant Center
// rejects the entire fetch rather than the offending item.
function stripIllegalXmlChars(text) {
  let out = "";
  for (const char of text) {
    const code = char.codePointAt(0);
    const legal =
      code === 0x9 ||
      code === 0xa ||
      code === 0xd ||
      (code >= 0x20 && code <= 0xd7ff) ||
      (code >= 0xe000 && code <= 0xfffd) ||
      code >= 0x10000;
    if (legal) out += char;
  }
  return out;
}

function escapeXml(value) {
  return stripIllegalXmlChars(String(value ?? ""))
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(text, limit) {
  const clean = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return clean.length > limit ? `${clean.slice(0, limit - 1).trimEnd()}…` : clean;
}

// Two decimals, as Google requires: "183.00 USD".
function formatFeedPrice(amount) {
  return `${Number(amount).toFixed(2)} USD`;
}

function tag(name, value) {
  return `<g:${name}>${escapeXml(value)}</g:${name}>`;
}

// Shared by both modes. `regular` and `current` are the pre-discount and
// selling prices; Google wants the regular one in g:price and the discounted
// one in g:sale_price.
function priceTags(regular, current) {
  const onSale = Number.isFinite(regular) && regular > current;
  return [
    tag("price", formatFeedPrice(onSale ? regular : current)),
    ...(onSale ? [tag("sale_price", formatFeedPrice(current))] : []),
  ];
}

function imageTags(sources) {
  return [
    tag("image_link", sources[0]),
    ...sources
      .slice(1, 1 + MAX_EXTRA_IMAGES)
      .map((src) => tag("additional_image_link", src)),
  ];
}

// ─── Shopify mode ────────────────────────────────────────────────────────────

// Retries throttling and transient server errors; anything else is a real
// failure and is surfaced immediately rather than retried pointlessly.
async function fetchShopifyPage(url) {
  let lastError;

  for (let attempt = 0; attempt < SHOPIFY_RETRY_ATTEMPTS; attempt++) {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });

    if (res.ok) return res;
    if (res.status !== 429 && res.status < 500) {
      throw new Error(`${url} responded ${res.status}`);
    }

    lastError = new Error(`${url} responded ${res.status}`);
    // Honour Retry-After when the server sends it, else exponential backoff.
    const retryAfter = Number(res.headers.get("retry-after"));
    const waitMs =
      Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : SHOPIFY_RETRY_BASE_MS * 2 ** attempt;
    console.warn(
      `products_sitemap: ${res.status} from Shopify, retrying in ${waitMs}ms ` +
        `(attempt ${attempt + 1}/${SHOPIFY_RETRY_ATTEMPTS})`,
    );
    await sleep(waitMs);
  }

  throw lastError;
}

async function fetchShopifyProducts(domain) {
  const products = [];

  for (let page = 1; page <= SHOPIFY_MAX_PAGES; page++) {
    if (page > 1) await sleep(SHOPIFY_PAGE_DELAY_MS);

    const res = await fetchShopifyPage(
      `${domain}/products.json?limit=${SHOPIFY_PAGE_SIZE}&page=${page}`,
    );

    const data = await res.json();
    const batch = data?.products || [];
    if (batch.length === 0) break;

    products.push(...batch);
    if (batch.length < SHOPIFY_PAGE_SIZE) break;
  }

  return products;
}

function buildShopifyItems(product, domain) {
  const images = (product.images || [])
    .map((image) => image?.src)
    .filter((src) => src && src.trim() !== "");
  const description = truncate(stripHtmlTags(product.body_html || ""), MAX_DESCRIPTION);

  if (!product.handle || !product.title || !images.length || !description) return [];

  const variants = (product.variants || []).filter((variant) => {
    const price = Number(variant?.price);
    return Number.isFinite(price) && price > 0;
  });
  if (!variants.length) return [];

  // One feed item per variant. Multi-variant products are tied together with
  // item_group_id so Google treats them as one product with variants rather
  // than as unrelated duplicates.
  const isGrouped = variants.length > 1;

  return variants.map((variant) => {
    const price = Number(variant.price);
    const compareAt = Number(variant.compare_at_price);
    // Shopify handles are stable; the variant query string is what selects the
    // right option on the landing page.
    const link = isGrouped
      ? `${domain}/products/${product.handle}?variant=${variant.id}`
      : `${domain}/products/${product.handle}`;
    const sku = variant.sku?.trim();
    const title = isGrouped && variant.title && variant.title !== "Default Title"
      ? `${product.title} - ${variant.title}`
      : product.title;

    const variantImages = variant.featured_image?.src
      ? [variant.featured_image.src, ...images.filter((s) => s !== variant.featured_image.src)]
      : images;

    return `<item>${[
      // Falls back to the variant id so an item is never dropped purely for a
      // missing SKU — 0.3% of this catalog has none.
      tag("id", sku || String(variant.id)),
      tag("title", truncate(title, MAX_TITLE)),
      tag("description", description),
      tag("link", link),
      ...imageTags(variantImages),
      // Real stock from the storefront. Merchant Center suspends items whose
      // availability disagrees with the landing page, and 10% of this catalog
      // is genuinely out of stock at any time.
      tag("availability", variant.available ? "in_stock" : "out_of_stock"),
      tag("condition", "new"),
      ...priceTags(compareAt, price),
      ...(product.vendor ? [tag("brand", product.vendor)] : []),
      // No GTIN is exposed by products.json. SKUs here are manufacturer part
      // numbers, so brand + mpn is the identifier pair Google accepts.
      ...(sku ? [tag("mpn", sku), tag("identifier_exists", "yes")] : [tag("identifier_exists", "no")]),
      ...(isGrouped ? [tag("item_group_id", String(product.id))] : []),
      ...(product.product_type?.trim() ? [tag("product_type", product.product_type.trim())] : []),
    ].join("")}</item>`;
  });
}

// ─── Self mode (Elasticsearch) ───────────────────────────────────────────────

async function fetchEsProducts() {
  const { brands: excludedBrands, collections: excludedCollections } =
    await getCatalogExclusions();
  const products = [];
  let searchAfter = null;

  // search_after instead of `size: 10000`, so the feed cannot silently
  // truncate when the catalog outgrows Elasticsearch's max_result_window.
  while (true) {
    const body = {
      size: ES_PAGE_SIZE,
      sort: [{ _doc: "asc" }],
      ...(searchAfter ? { search_after: searchAfter } : {}),
      query: {
        bool: {
          must: [{ term: { published: true } }],
          must_not: [
            { terms: { "brand.keyword": excludedBrands } },
            { terms: { "collections.name.keyword": excludedCollections } },
          ],
          filter: [
            { exists: { field: "brand.keyword" } },
            { exists: { field: "handle.keyword" } },
          ],
        },
      },
      _source: [
        "title",
        "brand",
        "handle",
        "images",
        "seo",
        "body_html",
        "product_category",
        "product_type",
        "variants",
      ],
    };

    const res = await fetch(`${ESURL}/${ES_INDEX}/_search`, {
      method: "POST",
      next: { revalidate: 3600 },
      headers: {
        Authorization: ESApiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`Elasticsearch responded ${res.status}`);

    const data = await res.json();
    const hits = data?.hits?.hits || [];
    if (hits.length === 0) break;

    products.push(...hits.map((hit) => hit._source));
    searchAfter = hits[hits.length - 1].sort;

    if (hits.length < ES_PAGE_SIZE) break;
  }

  return products;
}

// product_category is populated on ~97% of the catalog and reads as a hierarchy
// ("Home & Garden" → "Patio Heater Accessories"); product_type is set on only
// ~13%, so it is a fallback. google_product_category is deliberately not
// emitted: these names resemble Google's taxonomy but are not verified against
// it and an invalid value is an item-level error, whereas omitting it lets
// Google infer the category itself.
function buildEsProductType(product) {
  const path = (product.product_category || [])
    .map((entry) => entry?.category_name)
    .filter(Boolean);
  if (path.length > 0) return path.join(" > ");
  return product.product_type?.trim() || "";
}

function buildEsItem(product, baseUrl) {
  const variant = product.variants?.[0];
  const sku = variant?.sku?.trim();
  const price = Number(variant?.price);
  const images = (product.images || [])
    .map((image) => image?.src)
    .filter((src) => src && src.trim() !== "");

  // Items missing a required attribute are skipped rather than shipped to fail
  // validation; ~5.7% of this catalog has no image src.
  if (!sku || !product.title || !product.brand || !product.handle) return null;
  if (!images.length || !Number.isFinite(price) || price <= 0) return null;

  const seo = product.seo?.description?.trim();
  const description = seo
    ? truncate(seo, MAX_DESCRIPTION)
    : truncate(stripHtmlTags(product.body_html || ""), MAX_DESCRIPTION);
  if (!description) return null;

  const productType = buildEsProductType(product);

  return `<item>${[
    tag("id", sku),
    tag("title", truncate(product.title, MAX_TITLE)),
    tag("description", description),
    tag("link", `${baseUrl}/${createSlug(product.brand)}/product/${product.handle}`),
    ...imageTags(images),
    // Only published products are queried and the index carries no usable stock
    // level (variants.qty is null throughout), so this is a constant. Revisit
    // if real inventory lands in ES.
    tag("availability", "in_stock"),
    tag("condition", "new"),
    ...priceTags(Number(variant?.compare_at_price), price),
    tag("brand", product.brand),
    // SKUs are manufacturer part numbers (per-brand prefixes, model attributes
    // encoded, appended to titles), and the index has no GTIN field. Google
    // accepts brand + mpn when no GTIN is available.
    tag("mpn", sku),
    tag("identifier_exists", "yes"),
    ...(productType ? [tag("product_type", productType)] : []),
  ].join("")}</item>`;
}

// ─── Route ───────────────────────────────────────────────────────────────────

function xmlResponse(channelTitle, channelLink, items) {
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">` +
    `<channel>` +
    `<title>${escapeXml(channelTitle)}</title>` +
    `<link>${escapeXml(channelLink)}</link>` +
    `<description>Google Merchant Center product feed</description>` +
    items.join("") +
    `</channel>` +
    `</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

export async function GET() {
  // Mode and store name now come from this brand's Redis settings, with the
  // old env vars as fallback. Keeping the switch in env meant a stray variable
  // could silently repoint one brand's whole feed at another brand's catalog.
  const settings = await getStoreSettings();
  const shopifyDomain = settings.merchant_feed_domain?.trim().replace(/\/+$/, "");
  const storeName = settings.name || "Product feed";

  if (shopifyDomain) {
    let products;
    try {
      products = await fetchShopifyProducts(shopifyDomain);
    } catch (error) {
      console.error("products_sitemap: Shopify fetch failed:", error);
      return new Response("Failed to build product feed.", {
        status: 502,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const items = products.flatMap((product) => buildShopifyItems(product, shopifyDomain));
    console.log(
      `products_sitemap (shopify ${shopifyDomain}): ${items.length} items from ${products.length} products`,
    );
    return xmlResponse(storeName, shopifyDomain, items);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_BASE_URL;

  // Fail loudly rather than publishing a feed of placeholder URLs. Every link
  // is absolute and Merchant Center caches what it fetches, so a feed built
  // against a missing env var would register thousands of dead landing pages.
  if (!baseUrl) {
    return new Response(
      "NEXT_PUBLIC_SITE_BASE_URL is not set; refusing to build a product feed with unresolvable links.",
      { status: 500, headers: { "Content-Type": "text/plain" } },
    );
  }

  let products;
  try {
    products = await fetchEsProducts();
  } catch (error) {
    console.error("products_sitemap: Elasticsearch fetch failed:", error);
    return new Response("Failed to build product feed.", {
      status: 502,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const items = products.map((product) => buildEsItem(product, baseUrl)).filter(Boolean);
  console.log(
    `products_sitemap (self): ${items.length} of ${products.length} products included ` +
      `(${products.length - items.length} skipped for missing required attributes)`,
  );
  return xmlResponse(storeName, baseUrl, items);
}
