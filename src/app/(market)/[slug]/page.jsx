import "@/app/styles/product-pages.css";

import { notFound } from "next/navigation";

import { keys, redis } from "@/app/lib/redis";
import { STORE_NAME } from "@/app/lib/store_constants";
import { getRootByUrl, getPageData, BASE_URL } from "@/app/lib/helpers";
import { fetchCollectionsCount } from "@/app/lib/fn_server";

import NewProductGallery from "@/app/components/new-design/page/ProductGallery";
import BaseNavPage from "@/app/components/template/BaseNavItemPage";

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

  const collection_aggs = await fetchCollectionsCount(collection_ids);
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

  return <NewProductGallery slug={slug} config={{ root: rootNav, url, subs }} />;
}
