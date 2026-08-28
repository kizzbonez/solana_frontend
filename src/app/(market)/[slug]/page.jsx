import "@/app/styles/product-pages.css";

// Safety-net: pages self-heal after 24h; primary invalidation is on-demand
// via /api/revalidate-plp using revalidatePath + revalidateTag.
export const revalidate = 86400;

import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";

import { keys, redis } from "@/app/lib/redis";
import { STORE_NAME } from "@/app/lib/store_constants";
import {
  getRootByUrl,
  getPageData,
  BASE_URL,
  BaseNavKeys,
  ES_INDEX,
  ISBBQ,
  ISOKO,
  exclude_brands,
  isNavVisible,
} from "@/app/lib/helpers";
import { fetchCollectionsCount } from "@/app/lib/fn_server";
import { internalHeaders } from "@/app/lib/rate-limit";

import NewProductGallery from "@/app/components/new-design/page/ProductGallery";
import BBQProductGallery from "@/app/components/bbq-design/page/ProductGallery";
import OKOProductGallery from "@/app/components/oko-design/page/ProductGallery";
import NewDesignBasePlp from "@/app/components/new-design/page/BasePlp";
import BBQBasePlp from "@/app/components/bbq-design/page/BasePlp";
import OKOBasePlp from "@/app/components/oko-design/page/BasePlp";
import { toListingProducts } from "@/app/lib/listing-data";
import {
  buildBreadcrumbs,
  buildItemList,
  serializeJsonLd,
} from "@/app/lib/structured-data";

// Computes the Elasticsearch filter string from page metadata.
// Mirrors the same logic in ProductsSectionV2 so V2 can receive the correct
// filterString as a prop on the very first render — before its context
// useEffect resolves — preventing a blank→filtered re-render cycle.
function computeFilterString(d) {
  if (!d) return "";
  if (d.nav_type === "category")
    return `page_category:${d.origin_name}:${d.filter_type}`;
  if (d.nav_type === "brand")
    return `page_brand:${d.origin_name}:${d.filter_type}`;
  if (d.nav_type === "custom_page") {
    if (d.name === "Search") return "custom_page:Search:Search";
    if (BaseNavKeys.includes(d.name))
      return `custom_page:${d.name}:${d.filter_type}`;
    return `custom_page:${d.collection_display?.name || "NA"}:${d.filter_type}`;
  }
  if (d.nav_type === "category1")
    return `page_category1:${d.name}:${d.filter_type}`;
  return "";
}

// Fetches and caches the first-page product hits for a given filter string.
// Cached for 24h (revalidate: 86400) and tagged so the /api/revalidate-plp
// endpoint can bust all PLP caches instantly when product data is updated.
// Throws on failure so unstable_cache never caches an error response.
const getInitialHits = unstable_cache(
  async (filterString) => {
    const body = [
      {
        indexName: ES_INDEX,
        params: {
          hitsPerPage: 30,
          page: 0,
          query: "",
          ...(filterString ? { filter: filterString } : {}),
        },
      },
    ];
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_BASE_URL}/api/es/searchkit`,
      {
        method: "POST",
        // App's own SSR call - exempt from rate limiting.
        headers: { "Content-Type": "application/json", ...internalHeaders() },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) throw new Error(`Searchkit prefetch failed: ${res.status}`);
    const data = await res.json();
    // The endpoint returns { results: [ { hits, ... } ] }. This previously read
    // data?.[0]?.hits — indexing the object, not the array — which is always
    // undefined, so the prefetch threw on every request and the caller's
    // .catch(() => null) hid it. unstable_cache does not cache a thrown error,
    // so every PLP render also paid for a wasted Elasticsearch round-trip.
    // data?.[0] is kept as a fallback in case the endpoint is ever changed to
    // return the bare array this code originally assumed.
    const hits = data?.results?.[0]?.hits ?? data?.[0]?.hits;
    if (!hits?.length) throw new Error("No hits returned");
    return hits;
  },
  ["plp-initial-hits"],
  { revalidate: 86400, tags: ["plp-initial-hits"] },
);

const defaultMenuKey = keys.dev_shopify_menu.value;

// Cached so both generateMetadata and the page function share one Redis read
// per cache window instead of two live round-trips per request.
const getMenuData = unstable_cache(
  () => redis.get(defaultMenuKey),
  ["nav-menu"],
  { revalidate: 86400, tags: ["nav-menu"] },
);

/**
 * The children a listing page should actually show.
 *
 * Two separate reasons an entry is dropped, and they are not interchangeable:
 *
 *   nav_visibility   an operator hid it from the menu builder
 *   exclude_brands   the brand is suppressed catalogue-wide
 *
 * The second is what keeps /brands honest. Excluded brands are filtered out of
 * Elasticsearch by publishedQuery, so their products disappear everywhere —
 * but the brand links on /brands come from the Redis menu, which knows nothing
 * about that list. Left alone, /brands advertises a brand whose page then
 * renders empty, and disagrees with /categories, which reads the same list from
 * the catalogue and does drop it.
 *
 * Harmless on non-brand pages: a category name is never in exclude_brands.
 */
const listingChildren = (children = []) =>
  children.filter(
    (child) =>
      isNavVisible(child) &&
      !exclude_brands.includes(child?.origin_name) &&
      !exclude_brands.includes(child?.name),
  );

const flattenNav = (navItems) => {
  const result = [];
  const extractLinks = (items) => {
    items.forEach(({ children = [], ...rest }) => {
      result.push({ ...rest, children });
      extractLinks(children);
    });
  };
  extractLinks(navItems);
  return result;
};

export async function generateStaticParams() {
  const menuData = await getMenuData();
  const flatData = flattenNav(menuData);
  return flatData
    .filter((item) => item.url)
    // No point prebuilding a page that answers 404. Not a security boundary —
    // dynamicParams is on, so an un-hidden item renders on demand and is picked
    // up by the next build rather than staying missing.
    .filter(isNavVisible)
    .map((item) => ({ slug: item.url }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const menuData = await getMenuData();
  const flatData = flattenNav(menuData);
  const pageData = getPageData(slug, flatData);

  // Hidden items 404 below, so they must not advertise a title and description
  // — metadata for a page that does not exist is what puts it in a search
  // result that then dead-ends.
  if (!pageData || !isNavVisible(pageData)) return {};

  return {
    title:
      pageData.meta_title ||
      pageData.name ||
      `${STORE_NAME} | Stylish Indoor & Outdoor Heating`,
    description:
      pageData.meta_description ||
      `Transform your home with ${STORE_NAME}! Add warmth and style with our wood, gas, and electric designs. Shop now and create your perfect space!`,
  };
}

export default async function GenericCategoryPage({ params }) {
  const { slug } = await params;
  const menuData = await getMenuData();
  const flatData = flattenNav(
    menuData.map((i) => ({
      ...i,
      is_base_nav: !["On Sale", "New Arrivals"].includes(i?.name),
    })),
  );
  const rawPageData = getPageData(slug, flatData);
  const url = rawPageData?.url;

  if (!rawPageData || !url) return notFound();

  // Hidden in the menu means gone, not merely unlinked.
  //
  // Left reachable, these rendered as a real page with a heading, a filter
  // sidebar and no products — which reads as a broken storefront rather than a
  // deliberate removal, and stays indexable. The case that forced it: a brand
  // added to exclude_brands still had its menu pages, so every one of them
  // became a live, empty, crawlable page.
  //
  // Only the listing route. A product still sells at its own URL — hiding a
  // menu entry is a navigation decision and must not silently unpublish the
  // catalogue underneath it.
  if (!isNavVisible(rawPageData)) return notFound();

  // Filtered once here rather than in each theme's BasePlp, so the three
  // storefronts cannot drift on which brands they list.
  const pageData = {
    ...rawPageData,
    children: listingChildren(rawPageData.children),
  };

  if (pageData.is_base_nav) {
    if (ISOKO) {
      return (
        <div className="min-h-svh bg-ash dark:bg-char">
          <OKOBasePlp page_details={pageData} />
        </div>
      );
    }
    if (ISBBQ) {
      return (
        <div className="min-h-svh bg-ash dark:bg-char">
          <BBQBasePlp page_details={pageData} />
        </div>
      );
    }
    return (
      <div className="min-h-svh bg-white dark:bg-gray-950">
        <NewDesignBasePlp page_details={pageData} />
      </div>
    );
  }

  const rootNav = getRootByUrl(menuData, url);
  if (!rootNav) return notFound();

  // Same filter as the listing above. These become the subcategory tabs on a
  // gallery page, and they come from getRootByUrl rather than pageData — so
  // without this a hidden item stays out of the menu and the /brands list, then
  // reappears as a tab here.
  const children = listingChildren(rootNav?.children);
  const collection_ids = children
    .map((item) => item?.collection_display?.id)
    .filter(Boolean);

  console.log("collection_ids", collection_ids);


  const filterString = computeFilterString(pageData);

  // Always prefetch page-0 hits. ProductsSectionV2 checks window.location
  // client-side and ignores these when URL params are active, so there is
  // no wrong-results flash and the server component stays param-free
  // (required for generateStaticParams / full-page ISR caching to work).
  const [collection_aggs, initialHits] = await Promise.all([
    fetchCollectionsCount(collection_ids),
    getInitialHits(filterString).catch(() => null),
  ]);

  const buckets =
    collection_aggs?.aggregations?.counts_per_collection?.buckets || [];

  const countMap = new Map(buckets.map((b) => [String(b.key), b.doc_count]));

  console.log("countMap", countMap);

  const subs = children.map((item) => {
    const col_id = item?.collection_display?.id;
    return {
      id: col_id,
      name: item?.name,
      count: countMap.get(String(col_id)) || 0,
      url: `${BASE_URL}/${item?.url}`,
    };
  });

  // The gallery below renders client-side, so these products appear in no
  // server HTML. The ItemList describes the same first page of hits the user
  // sees once hydrated - see docs/agentic-ai-readiness.md (Tier 2.1).
  const jsonLd = serializeJsonLd(
    buildBreadcrumbs([{ name: rootNav?.name || slug, url: `/${url}` }]),
    buildItemList({
      name: rootNav?.name || slug,
      url: `/${url}`,
      products: toListingProducts(initialHits || []),
    }),
  );

  const ListingJsonLd = () =>
    jsonLd ? (
      // eslint-disable-next-line react/no-danger
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
    ) : null;

  if (ISOKO) {
    return (
      <div className="min-h-svh bg-ash dark:bg-char">
        <ListingJsonLd />
        <OKOProductGallery
          slug={slug}
          config={{ root: rootNav, url, subs }}
          filterType={pageData?.filter_type ?? null}
          initialFilterString={filterString}
          initialHits={initialHits}
        />
      </div>
    );
  }

  if (ISBBQ) {
    return (
      <div className="min-h-svh bg-ash dark:bg-char">
        <ListingJsonLd />
        <BBQProductGallery
          slug={slug}
          config={{ root: rootNav, url, subs }}
          filterType={pageData?.filter_type ?? null}
          initialFilterString={filterString}
          initialHits={initialHits}
        />
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-white dark:bg-gray-950">
      <ListingJsonLd />
      <NewProductGallery
        slug={slug}
        config={{ root: rootNav, url, subs }}
        filterType={pageData?.filter_type ?? null}
        initialFilterString={filterString}
        initialHits={initialHits}
      />
    </div>
  );
}
