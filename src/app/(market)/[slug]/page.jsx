import "@/app/styles/product-pages.css";

import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";

import { keys, redis } from "@/app/lib/redis";
import { STORE_NAME } from "@/app/lib/store_constants";
import { getRootByUrl, getPageData, BASE_URL, BaseNavKeys, ES_INDEX } from "@/app/lib/helpers";
import { fetchCollectionsCount } from "@/app/lib/fn_server";

import NewProductGallery from "@/app/components/new-design/page/ProductGallery";
import BaseNavPage from "@/app/components/template/BaseNavItemPage";

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) throw new Error(`Searchkit prefetch failed: ${res.status}`);
    const data = await res.json();
    const hits = data?.[0]?.hits;
    if (!hits?.length) throw new Error("No hits returned");
    return hits;
  },
  ["plp-initial-hits"],
  { revalidate: 86400, tags: ["plp-initial-hits"] },
);

const defaultMenuKey = keys.dev_shopify_menu.value;

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

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const menuData = await redis.get(defaultMenuKey);
  const flatData = flattenNav(menuData);
  const pageData = getPageData(slug, flatData);

  if (!pageData) return {};

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
  const menuData = await redis.get(defaultMenuKey);
  const flatData = flattenNav(
    menuData.map((i) => ({
      ...i,
      is_base_nav: !["On Sale", "New Arrivals"].includes(i?.name),
    })),
  );
  const pageData = getPageData(slug, flatData);
  const url = pageData?.url;

  if (!pageData || !url) return notFound();
  if (pageData.is_base_nav) return <BaseNavPage page_details={pageData} />;

  const rootNav = getRootByUrl(menuData, url);
  if (!rootNav) return notFound();

  const children = rootNav?.children || [];
  const collection_ids = children
    .map((item) => item?.collection_display?.id)
    .filter(Boolean);

  const filterString = computeFilterString(pageData);

  const [collection_aggs, initialHits] = await Promise.all([
    fetchCollectionsCount(collection_ids),
    getInitialHits(filterString).catch(() => null),
  ]);

  const buckets =
    collection_aggs?.aggregations?.counts_per_collection?.buckets || [];

  const countMap = new Map(buckets.map((b) => [String(b.key), b.doc_count]));

  const subs = children.map((item) => {
    const col_id = item?.collection_display?.id;
    return {
      id: col_id,
      name: item?.name,
      count: countMap.get(String(col_id)) || 0,
      url: `${BASE_URL}/${item?.url}`,
    };
  });

  return (
    <NewProductGallery
      slug={slug}
      config={{ root: rootNav, url, subs }}
      filterType={pageData?.filter_type ?? null}
      initialFilterString={filterString}
      initialHits={initialHits}
    />
  );
}
