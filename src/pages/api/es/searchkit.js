// pages/api/es/searchkit.js
import API from "@searchkit/api";

import {
  BaseNavObj,
  burnerBuckets,
  sizeBuckets,
  ES_INDEX,
  exclude_brands,
  exclude_collections,
  main_products,
  shouldApplyMainProductSort,
  STAR_FILTERS,
  sizeBucketKeys,
  widthBucketKeys,
  depthBucketKeys,
  heightBucketKeys,
  capacityBucketKeys,
  refVentBucketKeys,
  refHingeBucketKeys,
  refOutdoorCertBucketKeys,
  refClassBucketKeys,
  refDailyIceBucketKeys,
  refConfigBucketKeys,
  refDrainTypeBucketKeys,
  refNoOfZonesBucketKeys,
} from "../../../app/lib/helpers";

import COLLECTIONS_BY_CATEGORY from "../../../app/data/collections_by_category";
import {
  getActiveFacets,
  getActiveRuntimeMappings,
} from "../../../app/lib/filter-helper";
import { fixObservableSubclass } from "@apollo/client/utilities";

const priceBuckets = {
  "Under $1,000": { gte: 0, lt: 1000 },
  "$1,000 - $2,000": { gte: 1000, lt: 2000 },
  "$2,000 - $3,000": { gte: 2000, lt: 3000 },
  "Over $3,000": { gte: 3000 },
};

const mainItemsScriptSort = {
  _script: {
    type: "number",
    script: {
      source: `
                // Access the main products list passed via params
                def main_collections = params.main_products;
                // Access the product's collections. IMPORTANT: Use the correct keyword field
                def product_collections = doc['collections.name.keyword'];

                // If the product document has any of the main collections, return 0
                for (collection in product_collections) {
                    if (main_collections.contains(collection)) {
                        return 0; // Top Priority
                    }
                }
                return 1; // Lower Priority
            `,
      params: {
        main_products: main_products, // Pass the JS array here
      },
    },
    order: "asc", // Sort ascending so 0 (main items) comes first
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const check_filter = req.body?.[0]?.params?.filter;
    let filter_key = null;
    let filter_value = null;
    let filter_option = null;
    let filter_type = null;
    // filter out Bull Outdoor Products
    let filter_query = [
      {
        bool: {
          must_not: [
            {
              terms: {
                "brand.keyword": exclude_brands,
              },
            },
            {
              terms: {
                "collections.name.keyword": exclude_collections,
              },
            },
          ],
        },
      },
      {
        exists: {
          field: "brand.keyword",
        },
      },
      {
        term: {
          published: true,
        },
      },
    ];

    if (check_filter) {
      filter_key = check_filter.split(":")[0];
      filter_value = check_filter.split(":")[1];
      filter_type = check_filter.split(":")[2];
    }

    if (filter_key === "page_category") {
      filter_query.push({
        term: {
          "product_category.category_name.keyword": filter_value,
        },
      });
    }

    if (filter_key === "page_brand") {
      filter_query.push({
        term: {
          "brand.keyword": filter_value,
        },
      });
    }

    if (filter_key === "custom_page" && filter_value === "New Arrivals") {
      filter_query.push({
        range: {
          created_at: {
            gte: "now-30d/d", // You can customize this value as needed
          },
        },
      });
    }

    if (filter_key === "custom_page" && filter_value === "On Sale") {
      const tmp_query = [
        {
          exists: {
            field: "variants.compare_at_price",
          },
        },
        {
          range: {
            "variants.compare_at_price": {
              gt: 0,
            },
          },
        },
        {
          script: {
            script: {
              source:
                "doc['variants.compare_at_price'].size() > 0 && doc['variants.price'].size() > 0 && doc['variants.compare_at_price'].value > doc['variants.price'].value",
              lang: "painless",
            },
          },
        },
      ];

      filter_query.push(...tmp_query);
    }
    // This will display no products for category links that are not known.
    if (
      filter_key === "custom_page" &&
      !["On Sale", "New Arrivals", "undefined", "Search"].includes(filter_value)
    ) {
      const value_array = BaseNavObj?.[filter_value] || null;

      if (value_array) {
        filter_query.push({
          terms: {
            "collections.name.keyword": value_array,
          },
        });
      } else {
        filter_query.push({
          term: {
            "collections.name.keyword": filter_value,
          },
        });
      }
    }

    const data = req.body;
    let results = null;

    const facetAttributes = (getActiveFacets(filter_type) || []).map(
      ({ facet_attribute }) => facet_attribute,
    );

    const runtimeMappings = getActiveRuntimeMappings(filter_type);

    const apiClient = API({
      connection: {
        host: process.env.NEXT_ES_URL,
        apiKey: process.env.NEXT_ES_API_KEY,
        index: ES_INDEX,
      },
      search_settings: {
        hitsPerPage: 30,
        search_attributes: ["title"],
        result_attributes: [
          "product_id",
          "handle",
          "title",
          "body_html",
          "brand",
          "product_category",
          "product_type",
          "tags",
          "published",
          "options",
          "variants",
          "images",
          "seo",
          "google_shopping",
          "custom_metafields",
          "ratings",
          "features",
          "recommendations",
          "region_pricing",
          "accentuate_data",
          "status",
          "collections",
          "uploaded_at",
          "created_at",
          "updated_at",
        ],
        runtime_mappings: runtimeMappings,
        facet_attributes: facetAttributes,
        filter_attributes: [
          {
            attribute: "page_category",
            field: "product_category.category_name.keyword",
            type: "string",
          },
        ],
        sorting: {
          _popular: {
            field: "_score",
            order: "asc",
          },
          _newest: {
            field: "created_at",
            order: "desc",
          },
          _price_desc: {
            field: "variants.price",
            order: "desc",
          },
          _price_asc: {
            field: "variants.price",
            order: "asc",
          },
        },
        defaultSorting: "popular", // 👈 applies default sorting
      },
    });

    if (filter_query.length > 0) {
      // create the filter option
      filter_option = {
        hooks: {
          beforeSearch: async (searchRequests) => {
            return searchRequests.map((sr) => {
              const sort = sr.body.sort;
              const isPopular = !!sort?.["_score"];
              const query = sr.body.query;

              // Extract search query from Searchkit's structure
              let searchQuery = "";

              // Helper function to recursively search for query in nested structures
              const extractQuery = (obj) => {
                if (!obj || typeof obj !== "object") return null;

                // Check if current object has multi_match.query
                if (obj.multi_match?.query) {
                  return obj.multi_match.query;
                }

                // Recursively search in arrays
                if (Array.isArray(obj)) {
                  for (const item of obj) {
                    const found = extractQuery(item);
                    if (found) return found;
                  }
                }

                // Recursively search in objects
                for (const key in obj) {
                  if (obj.hasOwnProperty(key)) {
                    const found = extractQuery(obj[key]);
                    if (found) return found;
                  }
                }

                return null;
              };

              searchQuery = extractQuery(sr.body.query) || "";

              // Also check for query string in the params
              if (!searchQuery && sr.params?.query) {
                searchQuery = sr.params.query;
              }

              // Check if main product sorting should be applied
              const applyMainProductSort =
                shouldApplyMainProductSort(searchQuery);

              // Replace the default query with our custom search logic to match context/search.js
              let customQuery = query;
              if (searchQuery) {
                customQuery = {
                  bool: {
                    ...query.bool,
                    must: {
                      bool: {
                        should: [
                          {
                            multi_match: {
                              query: searchQuery,
                              fields: ["variants.sku^10"],
                              type: "phrase",
                            },
                          },
                          {
                            bool: {
                              should: [
                                {
                                  multi_match: {
                                    query: searchQuery,
                                    fields: ["title"],
                                    fuzziness: "AUTO:4,8",
                                  },
                                },
                                {
                                  multi_match: {
                                    query: searchQuery,
                                    fields: ["title"],
                                    type: "bool_prefix",
                                  },
                                },
                              ],
                            },
                          },
                          {
                            multi_match: {
                              query: searchQuery,
                              type: "phrase",
                              fields: ["title"],
                            },
                          },
                        ],
                      },
                    },
                  },
                };
              }

              return {
                ...sr,
                body: {
                  ...sr.body,
                  query: customQuery,
                  sort: isPopular
                    ? applyMainProductSort
                      ? [
                          // Apply main product priority when keyword matches
                          mainItemsScriptSort,
                          { updated_at: "desc" },
                          "_score",
                        ]
                      : [
                          // Regular relevance sorting for other searches
                          "_score",
                          { updated_at: "desc" },
                        ]
                    : sort,
                },
              };
            });
          },
        },
        getBaseFilters: () => filter_query,
      };
      // 💡 Pass the transformer function in the options object
      results = await apiClient.handleRequest(data, filter_option);
    } else {
      results = await apiClient.handleRequest(data);
    }

    res.status(200).json(results);
  } catch (err) {
    console.error("Searchkit Error:", err);
    res.status(500).json({ error: "Searchkit failed", details: err.message });
  }
}
