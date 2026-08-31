"use server";
import {
  ES_INDEX,
  createSlug,
  mapCategoryResults,
  mapBrandResults,
  formatProduct,
} from "@/app/lib/helpers";
import { accentuateSpecLabels } from "@/app/lib/filter-helper";
import { unstable_cache } from "next/cache";
import { getCatalogExclusions } from "@/app/lib/catalog-exclusions";

// ─── Private: Elasticsearch ──────────────────────────────────────────────────

function getESCredentials() {
  const url = process.env.NEXT_ES_URL;
  const key = process.env.NEXT_ES_API_KEY;
  if (!url || !key) throw new Error("Missing Elasticsearch configuration");
  return { url, apiKey: `apiKey ${key}` };
}

async function esSearch(body, cacheOptions = {}) {
  const { url, apiKey } = getESCredentials();
  const res = await fetch(`${url}/${ES_INDEX}/_search`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    ...cacheOptions,
  });
  if (!res.ok) throw new Error(`Elasticsearch responded ${res.status}`);
  return res.json();
}

/**
 * Shared filter used by all catalogue aggregation queries.
 *
 * A function rather than the constant it used to be, because the exclusion
 * lists now come from Redis and cannot be read at import time. Every caller
 * awaits it; the read behind it is cached and tagged, so this is a map lookup
 * rather than a round trip on all but the first call after a change.
 */
async function publishedQuery() {
  const { brands, collections } = await getCatalogExclusions();
  return {
    bool: {
      must: [{ term: { published: true } }],
      must_not: [
        { terms: { "brand.keyword": brands } },
        { terms: { "collections.name.keyword": collections } },
      ],
    },
  };
}

// ─── Private: Category metadata ──────────────────────────────────────────────

const CATEGORY_SUBS = {
  "grills-and-smokers": [
    "Gas Grill",
    "Kamado Grill",
    "Charcoal Grill",
    "Flat Top Grill",
    "Pizza Oven",
    "Electric Grill",
    "Wood Grill",
    "Pellet Grill",
    "Pellet Grill/Smoker",
  ],
  "heating-and-fire": [
    "Patio Heater",
    "Fireplace",
    "Firebowl",
    "Fire Pit Table",
    "Firebox",
    "Log Sets",
    "Screens",
  ],
  "outdoor-refrigeration": [
    "Compact Refrigerator",
    "Beverage Cooler",
    "Drawer Refrigerator",
    "Ice Maker",
    "Kegerator",
    "Ice Bin Cooler",
    "Wine Cooler",
    "Freezer",
    "Beverage Center",
    "Outdoor Refrigerator",
    "Beverage Refrigerator",
    "Convertible Refrigerator",
    "Wine Cellar + Kegerator",
  ],
  "installation-and-parts": [
    "Refrigerator Door Sleeve",
    "Trim Kit",
    "Insulating Liner",
    "Insulated Sleeve",
    "Insulated Jacket",
    "Insulating Jacket",
    "Insulation Liner",
    "Zero Clearance Liner",
    "Clearance Liner",
    "Insulated Liner",
    "Liner",
    "Grill Liner",
    "Trim or Surround",
    "Kamado Sleeve",
    "Recess Kit",
    "Mounting Bracket",
    "Tube Suspension Kit",
    "Recess Kit/Replacement Part",
    "Controller/Recess Kit",
    "Vent Cap",
    "Protector Plate",
    "Conversion Kits",
  ],
  "outdoor-kitchen-components": [
    "Grill Center",
    "Modano Island",
    "Storage Drawers",
    "Propane Tank Bin",
    "Storage Drawer",
    "Trash Bin",
    "Paper Towel Dispenser",
    "Access Door",
    "Ice Bin",
    "Door & Drawer Combo",
    "Storage Pantry",
    "Ice Bin and Storage",
    "Ice Bin And Storage",
    "Spice Rack",
    "Outdoor Kitchen Cabinet & Storage",
    "Warming Drawer",
    "Cabinet",
    "Storage Package",
    "Trash Chute",
    "Tank Tables",
  ],
  accessories: [
    "Kegerator Tap Kit",
    "Adaptor",
    "Wind Guard",
    "Accessory",
    "Cart",
    "Grill Handle",
    "Steel Grid Cover",
    "Cart Bracket",
    "Bar Accessory",
    "Extension Hose",
    "GFRC Cover",
    "Fire Bowl Cover",
    "Fire Urn Cover",
  ],
  "replacement-parts": [
    "Ice Maker Water Filter",
    "Water Filtration System",
    "Drain Pump",
    "Replacement Door",
    "Replacement Part",
    "Replacement Part/Controller",
    "Replacement Part/Mesh",
    "Replacement Part/Gas Valve",
    "Replacement Part/Manifold Assembly",
    "Controller",
    "Mesh/Replacement Part",
    "Gas Valve",
    "Gas Valves",
    "Mesh",
    "Manifold Assembly",
    "Tube Element",
    "Control Valve",
    "Pilot Assembly",
  ],
  deals: ["Clearance Sale", "Package Deals", "Open Box"],
};

const CATEGORY_DESCRIPTIONS = {
  "grills-and-smokers":
    "Premium gas, charcoal, and wood-pellet grills designed for professional-grade backyard searing and smoking.",
  "heating-and-fire":
    "Enhance your outdoor ambiance with high-efficiency fireplaces, fire pits, and patio heaters for year-round warmth.",
  "outdoor-refrigeration":
    "Keep beverages chilled and ingredients fresh with weather-resistant outdoor refrigerators, kegerators, and wine coolers.",
  "installation-and-parts":
    "Essential mounting kits, gas lines, and structural components to ensure a safe and seamless outdoor kitchen setup.",
  "outdoor-kitchen-components":
    "Durable stainless steel storage drawers, access doors, and built-in islands to complete your custom outdoor space.",
  accessories:
    "Must-have BBQ tools, protective covers, and specialized cookware to maximize your outdoor cooking experience.",
  "replacement-parts":
    "OEM burners, igniters, and grates to maintain your equipment and extend the lifespan of your favorite outdoor appliances.",
  deals:
    "Exclusive savings on top-tier outdoor appliances and essential gear to help you build your dream kitchen for less.",
};

function getCategoryType(category = "") {
  switch (category) {
    case "Grills & Smokers":
    case "Heating & Fire":
    case "Outdoor Kitchen Components":
    case "Outdoor Refrigeration":
      return "outdoor";
    case "Installation & Parts":
    case "Replacement Parts":
      return "technical";
    default:
      return "general";
  }
}

function getCategorySubs(category = "") {
  const raw = CATEGORY_SUBS[createSlug(category)];
  if (!raw) return [];
  return [
    ...new Set(raw.flatMap((item) => item.split("/").map((s) => s.trim()))),
  ];
}

function getCategoryDescription(category = "") {
  return CATEGORY_DESCRIPTIONS[createSlug(category)] || "";
}

// ─── Exported server actions ──────────────────────────────────────────────────

export async function fetchUniqueCategories() {
  try {
    const data = await esSearch(
      {
        size: 0,
        query: await publishedQuery(),
        aggs: {
          unique_categories: {
            terms: { field: "accentuate_data.category", size: 15 },
          },
        },
      },
      // See fetchBrands: no-store conflicts with route-level revalidate and the
      // catch below hides the resulting bailout. Tagged revalidate instead.
      { next: { revalidate: 86400, tags: ["layout-data"] } },
    );
    return (
      data?.aggregations?.unique_categories?.buckets?.map(mapCategoryResults) ||
      []
    );
  } catch (error) {
    console.error("fetchUniqueCategories:", error);
    return [];
  }
}

export async function fetchBrands() {
  try {
    const data = await esSearch(
      {
        size: 0,
        query: await publishedQuery(),
        aggs: {
          unique_brands: {
            terms: {
              field: "brand.keyword",
              size: 100,
              order: { _key: "asc" },
            },
          },
        },
      },
      // Was `cache: "no-store"`, which is incompatible with any route that
      // sets `revalidate`. During a build Next throws DYNAMIC_SERVER_USAGE to
      // bail such a route out to dynamic rendering — but the catch below
      // swallows that signal and returns [], so /categories shipped
      // statically with an empty brand list while the build log filled with
      // "couldn't be rendered statically" noise. Same failure that emptied
      // llms.txt. A tagged revalidate keeps the data fresh, keeps the route
      // statically renderable, and the tag lets the admin cache control and
      // /api/revalidate-all bust it on demand.
      { next: { revalidate: 86400, tags: ["layout-data"] } },
    );
    return (
      data?.aggregations?.unique_brands?.buckets?.map((b) => ({
        name: b.key,
        count: b.doc_count,
        slug: createSlug(b.key),
      })) || []
    );
  } catch (error) {
    console.error("fetchBrands:", error);
    return [];
  }
}

export async function getCollectionProducts(id) {
  try {
    // 1. Fetch collection handles from backend
    const response = await fetch(
      `${process.env.NEXT_SOLANA_BACKEND_URL}/api/collections/collection-products/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Store-Domain": process.env.NEXT_PUBLIC_STORE_DOMAIN,
          Authorization: `Api-Key ${process.env.NEXT_SOLANA_COLLECTIONS_KEY}`,
        },
        next: { revalidate: 86400, tags: ["home-products"] },
      },
    );
    if (!response.ok) throw new Error("Backend failed to respond");
    const raw_collection = await response.json();

    // 2. Enrich with full product data from Elasticsearch
    const data = await esSearch(
      {
        query: {
          bool: {
            filter: [
              {
                terms: {
                  "handle.keyword": raw_collection.map((item) => item?.handle),
                },
              },
              { term: { published: true } },
            ],
          },
        },
      },
      // See fetchBrands: no-store conflicts with route-level revalidate and the
      // catch below hides the resulting bailout. Tagged revalidate instead.
      { next: { revalidate: 86400, tags: ["home-products"] } },
    );
    return data?.hits?.hits?.map((item) => item?._source) || [];
  } catch (error) {
    console.error("getCollectionProducts:", error);
    return [];
  }
}

// export async function fetchProduct(product_path) {
//   try {
//     const data = await esSearch(
//       {
//         size: 1,
//         query: { term: { "handle.keyword": { value: product_path } } },
//       },
//       { cache: "no-store" },
//     );
//     const product = formatProduct(data?.hits?.hits?.map((i) => i._source)?.[0]);

//     return  product;
//   } catch (error) {
//     console.error("fetchProduct:", error);
//     return null;
//   }
// }
/**
 * Refactored fetchProduct
 */
async function _fetchProduct(product_path) {
  try {
    // 1. Initial Search
    const searchResponse = await esSearch(
      {
        size: 1,
        query: { term: { "handle.keyword": { value: product_path } } },
      },
      { cache: "no-store" },
    );

    const rawProduct = searchResponse?.hits?.hits?.[0]?._source;
    if (!rawProduct) return null;

    const product = rawProduct;
    const accentuateData = rawProduct.accentuate_data || {};

    // 2. Resolve Related Products (FBW, Open Box, etc.)
    const { productOptions, fbwProducts, obProducts, newProducts } =
      await fetchRelatedProductData(accentuateData);

    // 3. Map Specifications
    const specs = accentuateSpecLabels.map((item) => {
      let val = accentuateData[item.key] || "";
      if (item.transform) val = item.transform(val);
      return { label: item.label, value: val };
    });

    const specsIsEmpty = specs.every((item) => !item.value);

    // 4. Map Manuals
    const manualLabels = accentuateData["bbq.file_name"] || [];
    const manualLinks = accentuateData["bbq.upload_file"] || [];
    const manuals = Array.isArray(manualLinks)
      ? manualLinks.map((link, i) => ({
          label: manualLabels[i] || "",
          value: link,
        }))
      : null;

    // 5. Map Shipping Info
    const shippingInfo = [
      {
        key: "weight",
        label: "Shipping Weight",
        value: accentuateData["bbq.shipping_weight"],
      },
      {
        key: "dims",
        label: "Shipping Dimensions (WxDxH)",
        value: accentuateData["bbq.shipping_dimensions"],
      },
    ].filter((info) => !!info.value);

    // 6. Inject Properties into Result
    return formatProduct({
      ...product,
      sp_product_options: productOptions,
      fbt_bundle: (rawProduct.frequently_bought_together || []).map((i) => ({
        ...i,
        product_id: i.id,
      })),
      fbt_carousel: fbwProducts,
      open_box: obProducts,
      new_items: newProducts,
      product_specs: specsIsEmpty ? null : specs,
      product_manuals: manuals?.length ? manuals : null,
      product_shipping_info: shippingInfo.length ? shippingInfo : null,
    });
  } catch (error) {
    console.error("fetchProduct Error:", error);
    return null;
  }
}

/**
 * Public export — wraps _fetchProduct in unstable_cache so the result is
 * stored per product handle and can be invalidated in two ways:
 *   revalidateTag("product-{handle}") → busts one product
 *   revalidateTag("pdp")              → busts all product data at once
 * The 86400s revalidate is a safety-net fallback in case a manual trigger
 * is missed; it does not replace the on-demand invalidation.
 */
export async function fetchProduct(product_path) {
  const decoded = decodeURIComponent(product_path);
  return unstable_cache(
    () => _fetchProduct(decoded),
    [`product-${decoded}`],
    { tags: ["pdp", `product-${decoded}`], revalidate: 86400 },
  )();
}

/**
 * Helper to handle the secondary fetch for related product handles
 */
async function fetchRelatedProductData(accentuateData) {
  const relatedKeys = [
    "bbq.related_product",
    "bbq.configuration_product",
    "bbq.hinge_related_product",
    "bbq.option_related_product",
    "bbq.openbox_related_product",
    "bbq.shopnew_related_product",
    "bbq.selection_related_product",
    "bbq.product_option_related_product",
    "frequently.fbi_related_product",
  ];

  const mergedHandles = [
    ...new Set(mergeRelatedProducts(accentuateData, relatedKeys)),
  ];
  if (!mergedHandles.length) {
    return {
      productOptions: null,
      fbwProducts: null,
      obProducts: null,
      newProducts: null,
    };
  }

  // Note: Ensure API_URL and fetchConfig are accessible in this scope

  const response = await esSearch(
    {
      size: 100,
      query: {
        bool: {
          filter: [{ terms: { "handle.keyword": mergedHandles } }],
        },
      },
    },
    { cache: "no-store" },
  );

  // console.log("response",response)
  // const json = await response;
  const relatives = (response?.hits?.hits || []).map((h) => h._source);

  const fbwHandles = accentuateData["frequently.fbi_related_product"] || [];
  const obHandles = accentuateData["bbq.openbox_related_product"] || [];
  const newHandles = accentuateData["bbq.shopnew_related_product"] || [];

  return {
    fbwProducts: relatives.filter((p) => fbwHandles.includes(p.handle)),
    obProducts: relatives.filter((p) => obHandles.includes(p.handle)),
    newProducts: relatives.filter((p) => newHandles.includes(p.handle)),
    productOptions: relatives.filter(
      (p) => ![...fbwHandles, ...obHandles, ...newHandles].includes(p.handle),
    ),
  };
}

async function _getReviewsByProductId(product_id) {
  try {
    // 1. Guard clause for missing ID
    if (!product_id) return [];

    const url = `${process.env.NEXT_SOLANA_BACKEND_URL}/api/reviews/list?product_id=${product_id}`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-Store-Domain": process.env.NEXT_PUBLIC_STORE_DOMAIN || "",
      },
    });

    // 2. Check for HTTP errors (404, 500, etc.)
    if (!response.ok) {
      console.error(`Fetch error: ${response.status} ${response.statusText}`);
      return [];
    }

    // 3. Safe JSON parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return [];
    }

    const data = await response.json();

    // 4. Return the data directly (assuming the API returns { reviews: [] } or just [])
    return data?.reviews || data || [];
  } catch (error) {
    console.error("Proxy Error:", error);
    return [];
  }
}

/**
 * Public export — wraps _getReviewsByProductId in unstable_cache.
 * Reviews are kept on a separate tag from product data so they can be
 * invalidated independently (e.g. when a new review is submitted).
 *   revalidateTag("product-reviews-{id}") → busts one product's reviews
 *   revalidateTag("pdp-reviews")          → busts all product reviews
 */
export async function getReviewsByProductId(product_id) {
  return unstable_cache(
    () => _getReviewsByProductId(product_id),
    [`product-reviews-${product_id}`],
    { tags: ["pdp-reviews", `product-reviews-${product_id}`], revalidate: 3600 },
  )();
}

function mergeRelatedProducts(data, keys) {
  const merged = [];

  keys.forEach((key) => {
    // 1. Get the value for the current key
    const rawValue = data[key];
    let value = [];

    // 2. Check the raw value's type before proceeding
    if (rawValue === null || rawValue === undefined) {
      // If null or undefined, skip or set to empty array
      value = [];
    } else if (Array.isArray(rawValue)) {
      // If it's already an array, use it directly
      value = rawValue;
    } else if (typeof rawValue === "string") {
      // If it's a string, attempt to parse it
      try {
        value = JSON.parse(rawValue);
      } catch (e) {
        console.error(`Error parsing JSON for key "${key}":`, e);
        // On error, treat as empty or handle as required
        value = [];
      }
    } else {
      // For any other non-string, non-null, non-array value (e.g., number or object)
      // This is defensive coding; assuming related products should be an array.
      value = [];
    }

    // 3. Ensure the final result is an array before spreading
    if (Array.isArray(value)) {
      merged.push(...value);
    }
  });

  // 4. Optionally, you might want to deduplicate the results
  return [...new Set(merged)];
}

export async function fetchSearchResults(searchTerm) {
  try {
    if (!searchTerm) return null;
    const { brands: excludedBrands, collections: excludedCollections } =
      await getCatalogExclusions();
    const query = {
      query: {
        bool: {
          must: [
            { term: { published: true } },
            {
              bool: {
                should: [
                  {
                    // Fuzzy search is fine for these standard fields
                    multi_match: {
                      query: searchTerm,
                      fields: ["title^3", "product_category"],
                      fuzziness: "AUTO",
                    },
                  },
                  {
                    // Exact/Partial match for the flattened field (No Fuzziness)
                    match: {
                      "accentuate_data.category": searchTerm,
                    },
                  },
                ],
              },
            },
          ],
          must_not: [
            { terms: { "brand.keyword": excludedBrands } },
            { terms: { "collections.name.keyword": excludedCollections } },
          ],
        },
      },
      aggs: {
        unique_categories: {
          terms: {
            field: "accentuate_data.category",
            size: 15,
          },
        },
        unique_brands: {
          terms: {
            field: "brand.keyword",
            size: 100,
          },
        },
        // unique_collections: {
        //   terms: {
        //     field: "collections.name.keyword",
        //     size: 200
        //   }
        // }
      },
    };

    const res = await esSearch(query, { cache: "no-store" });

    // 2. Handle potential fetch errors if esSearch returns a Response object
    // If esSearch already returns the parsed JSON, you can skip res.json()
    const data = typeof res.json === "function" ? await res.json() : res;

    // 3. Map the aggregations
    const categoryBuckets =
      data?.aggregations?.unique_categories?.buckets || [];
    const brandBuckets = data?.aggregations?.unique_brands?.buckets || [];

    // Assuming mapCategoryResults is a helper function you have elsewhere
    const categories = categoryBuckets.map((bucket) => ({
      ...mapCategoryResults(bucket),
    }));

    const brands = brandBuckets.map((bucket) => ({
      ...mapBrandResults(bucket),
    }));

    return {
      brands,
      categories,
      products:
        data?.hits?.hits?.map((hit) => ({ id: hit._id, ...hit._source })) || [],
      total_products: data?.hits?.total?.value || 0,
    };
  } catch (error) {
    console.error("Proxy Error:", error);
    return [];
  }
}

async function _fetchCollectionsCount(collection_ids) {
  const query = {
    size: 0,
    query: await publishedQuery(),
    aggs: {
      counts_per_collection: {
        terms: {
          field: "collections.id",
          include: Array.isArray(collection_ids) ? collection_ids : [collection_ids],
          size: Array.isArray(collection_ids) ? collection_ids.length : 10,
        },
      },
    },
  };
  return await esSearch(query);
}

export async function fetchCollectionsCount(collection_ids) {
  if (!collection_ids) return null;
  try {
    const key = Array.isArray(collection_ids)
      ? collection_ids.join(",")
      : String(collection_ids);
    return unstable_cache(
      () => _fetchCollectionsCount(collection_ids),
      [`collections-count-${key}`],
      { tags: ["collections-count"], revalidate: 86400 },
    )();
  } catch (err) {
    console.error("ES Search Error:", err);
    return null;
  }
}

async function _getYMALProducts(seed) {
  try {
    const { brands: excludedBrands, collections: excludedCollections } =
      await getCatalogExclusions();
    const query = {
      size: 4,
      query: {
        function_score: {
          query: {
            bool: {
              must: [
                {
                  match_all: {},
                },
                {
                  term: {
                    published: true,
                  },
                },
              ],
              must_not: [
                {
                  terms: {
                    "brand.keyword": excludedBrands,
                  },
                },
                {
                  terms: {
                    "collections.name.keyword": excludedCollections,
                  },
                },
              ],
            },
          },
          random_score: {
            seed: seed,
            field: "title.keyword",
          },
        },
      },
    };

    const data = await esSearch(query);
    return data?.hits?.hits?.map((item) => formatProduct(item?._source,"card")) || [];
  } catch (error) {
    console.error("getYMALProducts:", error);
    return [];
  }
}

/**
 * Public export — "You May Also Like" products, randomised per hour.
 *
 * The seed is bucketed to the hour rather than Date.now() so the ES query is
 * cacheable. Previously this ran an uncached `no-store` fetch on every request,
 * which marked the whole PDP route dynamic and silently defeated its
 * `export const revalidate = 86400` — every product page hit the origin and
 * re-ran Elasticsearch instead of being served from the CDN edge.
 *
 * The selection still rotates; it just rotates on an hourly boundary shared by
 * all visitors, which is what makes it cacheable.
 */
export async function getYMALProducts() {
  const seed = Math.floor(Date.now() / 3_600_000); // hourly bucket
  return unstable_cache(
    () => _getYMALProducts(seed),
    [`ymal-${seed}`],
    { tags: ["ymal"], revalidate: 3600 },
  )();
}
