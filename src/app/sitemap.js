import { ES_INDEX, createSlug, exclude_brands, exclude_collections } from "./lib/helpers";

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_BASE_URL || "https://yourdomain.com";
const ESURL = process.env.NEXT_ES_URL;
const ESApiKey = `apiKey ${process.env.NEXT_ES_API_KEY}`;

// Fetch all products from Elasticsearch
async function fetchAllProducts() {
  try {
    const fetchConfig = {
      method: "POST",
      next: { revalidate: 3600 },
      headers: {
        Authorization: ESApiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        size: 10000, // Adjust based on your product count
        query: {
          bool: {
            must: [
              {
                term: {
                  published: true,
                },
              },
            ],
            must_not: [
              {
                terms: {
                  "brand.keyword": exclude_brands || [],
                },
              },
              {
                terms: {
                  "collections.name.keyword": exclude_collections || [],
                },
              },
            ],
            filter: [
              {
                exists: {
                  field: "brand.keyword",
                },
              },
              {
                exists: {
                  field: "handle.keyword",
                },
              },
            ],
          },
        },
        _source: ["handle", "brand", "updated_at"],
      }),
    };

    const response = await fetch(`${ESURL}/${ES_INDEX}/_search`, fetchConfig);
    const data = await response.json();

    return data?.hits?.hits?.map((hit) => hit._source) || [];
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
    return [];
  }
}

// Fetch all brands
async function fetchAllBrands() {
  try {
    const fetchConfig = {
      method: "POST",
      next: { revalidate: 3600 },
      headers: {
        Authorization: ESApiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        size: 0,
        aggs: {
          brands: {
            terms: {
              field: "brand.keyword",
              size: 1000,
            },
          },
        },
      }),
    };

    const response = await fetch(`${ESURL}/${ES_INDEX}/_search`, fetchConfig);
    const data = await response.json();

    return data?.aggregations?.brands?.buckets?.map((bucket) => bucket.key) || [];
  } catch (error) {
    console.error("Error fetching brands for sitemap:", error);
    return [];
  }
}

// Fetch all categories
async function fetchAllCategories() {
  try {
    const fetchConfig = {
      method: "POST",
      next: { revalidate: 3600 },
      headers: {
        Authorization: ESApiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        size: 0,
        aggs: {
          categories: {
            terms: {
              field: "accentuate_data.category",
              size: 1000,
            },
          },
        },
      }),
    };

    const response = await fetch(`${ESURL}/${ES_INDEX}/_search`, fetchConfig);
    const data = await response.json();

    return data?.aggregations?.categories?.buckets?.map((bucket) => bucket.key) || [];
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    return [];
  }
}

export default async function sitemap() {
  // Static routes with priorities
  const staticRoutes = [
    { url: "", priority: 1.0, changeFrequency: "daily" },
    { url: "/about", priority: 0.8, changeFrequency: "monthly" },
    { url: "/contact", priority: 0.8, changeFrequency: "monthly" },
    { url: "/blogs", priority: 0.7, changeFrequency: "weekly" },
    { url: "/search", priority: 0.6, changeFrequency: "weekly" },
    { url: "/cart", priority: 0.5, changeFrequency: "always" },
    { url: "/professional-program", priority: 0.7, changeFrequency: "monthly" },
    { url: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
    { url: "/return-policy", priority: 0.5, changeFrequency: "monthly" },
    { url: "/shipping-policy", priority: 0.5, changeFrequency: "monthly" },
  ].map((route) => ({
    url: `${BASE_URL}${route.url}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Fetch dynamic data
  const [products, brands, categories] = await Promise.all([
    fetchAllProducts(),
    fetchAllBrands(),
    fetchAllCategories(),
  ]);

  // Product URLs
  const productUrls = products.map((product) => ({
    url: `${BASE_URL}/${createSlug(product.brand)}/product/${product.handle}`,
    lastModified: product.updated_at || new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // Brand URLs
  const brandUrls = brands
    .filter((brand) => brand && !exclude_brands?.includes(brand))
    .map((brand) => ({
      url: `${BASE_URL}/${createSlug(brand)}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  // Category URLs
  const categoryUrls = categories
    .filter((category) => category)
    .map((category) => ({
      url: `${BASE_URL}/category/${createSlug(category)}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  // Combine all URLs
  return [
    ...staticRoutes,
    ...brandUrls,
    ...categoryUrls,
    ...productUrls,
  ];
}
