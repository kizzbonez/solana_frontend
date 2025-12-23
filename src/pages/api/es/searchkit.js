// pages/api/es/searchkit.js
import API from "@searchkit/api";

import {
  BaseNavObj,
  burnerBuckets,
  ES_INDEX,
  exclude_brands,
  exclude_collections,
  main_products,
  shouldApplyMainProductSort,
  STAR_FILTERS,
} from "../../../app/lib/helpers";

import COLLECTIONS_BY_CATEGORY from "../../../app/data/collections_by_category";

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

const apiClient = API({
  connection: {
    host: process.env.NEXT_ES_URL,
    apiKey: process.env.NEXT_ES_API_KEY,
    index: ES_INDEX,
  },
  search_settings: {
    hitsPerPage: 30,
    // highlight_attributes: ["title"],
    // snippet_attributes: ["description:200"],
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
    facet_attributes: [
      {
        attribute: "ways_to_shop",
        type: "string",

        facetQuery: () => ({
          filters: {
            filters: {
              "Top Rated": {
                terms: { "ratings.rating_count.keyword": ["3", "4", "5"] },
              },
              "Clearance/Open Box": {
                bool: {
                  should: [
                    {
                      wildcard: {
                        "collections.name.keyword": {
                          value: "*clearance*",
                          case_insensitive: true, // Added this
                        },
                      },
                    },
                    {
                      wildcard: {
                        "collections.name.keyword": {
                          value: "*open box*",
                          case_insensitive: true, // Added this
                        },
                      },
                    },
                  ],
                },
              },
              "Package Deals": {
                wildcard: {
                  "collections.name.keyword": {
                    value: "*package deal*",
                    case_insensitive: true, // Added this
                  },
                },
              },
              Promotions: {
                wildcard: {
                  "collections.name.keyword": {
                    value: "*promotion*",
                    case_insensitive: true, // Added this
                  },
                },
              },
            },
          },
        }),

        facetResponse: (aggregation) => {
          const buckets = aggregation.buckets || {};
          // Sort logic: Ensure they always appear in a specific order
          const order = [
            "Top Rated",
            "Clearance/Open Box",
            "Package Deals",
            "Promotions",
          ];

          return order.reduce((acc, key) => {
            const count = buckets[key]?.doc_count ?? 0;
            if (count > 0) {
              acc[key] = count;
            }
            return acc;
          }, {});
        },

        filterQuery: (field, value) => {
          const queries = {
            "Top Rated": {
              terms: { "ratings.rating_count.keyword": ["3", "4", "5"] },
            },
            "Clearance/Open Box": {
              bool: {
                should: [
                  {
                    wildcard: {
                      "collections.name.keyword": {
                        value: "*clearance*",
                        case_insensitive: true,
                      },
                    },
                  },
                  {
                    wildcard: {
                      "collections.name.keyword": {
                        value: "*open box*",
                        case_insensitive: true,
                      },
                    },
                  },
                ],
              },
            },
            "Package Deals": {
              wildcard: {
                "collections.name.keyword": {
                  value: "*package deal*",
                  case_insensitive: true,
                },
              },
            },
            Promotions: {
              wildcard: {
                "collections.name.keyword": {
                  value: "*promotion*",
                  case_insensitive: true,
                },
              },
            },
          };

          return queries[value] || {};
        },
      },
      {
        attribute: "ratings",
        field: "ratings.rating_count.keyword",
        type: "string",

        facetQuery: () => ({
          filters: {
            filters: {
              [STAR_FILTERS[0]]: {
                term: { "ratings.rating_count.keyword": "0" },
              },
              [STAR_FILTERS[1]]: {
                term: { "ratings.rating_count.keyword": "1" },
              },
              [STAR_FILTERS[2]]: {
                term: { "ratings.rating_count.keyword": "2" },
              },
              [STAR_FILTERS[3]]: {
                term: { "ratings.rating_count.keyword": "3" },
              },
              [STAR_FILTERS[4]]: {
                term: { "ratings.rating_count.keyword": "4" },
              },
              [STAR_FILTERS[5]]: {
                term: { "ratings.rating_count.keyword": "5" },
              },
            },
          },
        }),

        facetResponse: (aggregation) => {
          const buckets = aggregation.buckets || {};
          return Object.keys(buckets).reduce((acc, key) => {
            const count = buckets[key]?.doc_count ?? 0;
            if (count > 0) {
              acc[key] = count;
            }
            return acc;
          }, {});
        },

        filterQuery: (field, value) => {
          // 'value' is the star string (e.g., "★★★★★")
          // We find the numeric key ("5") that matches that string
          const esValue = Object.keys(STAR_FILTERS).find(
            (key) => STAR_FILTERS[key] === value
          );

          if (esValue !== undefined) {
            return {
              term: {
                [field]: esValue,
              },
            };
          }

          return {};
        },
      },
      {
        attribute: "product_category",
        type: "string",

        facetQuery: () => {
          const dynamicFilters = {};
          COLLECTIONS_BY_CATEGORY.forEach((item) => {
            // Build the filter object dynamically for each category
            dynamicFilters[item.category_name] = {
              terms: { "collections.name.keyword": item.collections },
            };
          });
          return {
            filters: {
              filters: dynamicFilters,
            },
          };
        },

        facetResponse: (aggregation) => {
          const buckets = aggregation.buckets || {};
          const navData = COLLECTIONS_BY_CATEGORY || [];

          // Use the order from your dynamic array
          return navData.reduce((acc, item) => {
            const key = item.category_name;
            const count = buckets[key]?.doc_count ?? 0;
            if (count > 0) acc[key] = count;
            return acc;
          }, {});
        },

        filterQuery: (field, value) => {
          const navData = COLLECTIONS_BY_CATEGORY || [];
          const selectedCategory = navData.find(
            (item) => item.category_name === value
          );

          if (selectedCategory) {
            return {
              terms: {
                "collections.name.keyword": selectedCategory.collections,
              },
            };
          }
          return {};
        },
      },
      { attribute: "brand", field: "brand.keyword", type: "string" },
      {
        attribute: "configuration_type",
        field: "accentuate_data.bbq.configuration_type", // informational only
        type: "string",

        facetQuery: () => ({
          // We don’t rely on ES aggregations here
          filters: {
            filters: {
              "Built-In": {
                match_phrase: {
                  tags: "built in",
                },
              },
              Freestanding: {
                match_phrase: {
                  tags: "freestanding",
                },
              },
            },
          },
        }),

        facetResponse: (aggregation) => {
          const buckets = aggregation.buckets || {};
          return Object.keys(buckets).reduce((acc, key) => {
            const count = buckets[key]?.doc_count ?? 0;
            if (count > 0) {
              acc[key] = count; // only include non-zero
            }
            return acc;
          }, {});
        },

        filterQuery: (field, value) => {
          if (value === "Built-In") {
            return {
              match_phrase: {
                tags: "built in",
              },
            };
          }
          if (value === "Freestanding") {
            return {
              match_phrase: {
                tags: "freestanding",
              },
            };
          }
          return {};
        },
      },
      {
        attribute: "no_of_burners",
        field: "accentuate_data.bbq.number_of_main_burners",
        type: "string",

        // Define normalized buckets
        facetQuery: () => {
          return {
            filters: {
              filters: Object.fromEntries(
                Object.entries(burnerBuckets).map(([label, values]) => [
                  label,
                  {
                    terms: {
                      "accentuate_data.bbq.number_of_main_burners": values,
                    },
                  },
                ])
              ),
            },
          };
        },

        // Map ES response to facet values & hide zero counts
        facetResponse: (aggregation) => {
          const buckets = aggregation.buckets || {};
          return Object.keys(buckets).reduce((acc, key) => {
            const count = buckets[key]?.doc_count ?? 0;
            if (count > 0) {
              acc[key] = count; // only include non-zero
            }
            return acc;
          }, {});
        },

        // Build filter query when user selects a value
        filterQuery: (field, value) => {
          return {
            terms: {
              "accentuate_data.bbq.number_of_main_burners":
                burnerBuckets[value] || [],
            },
          };
        },
      },

      { attribute: "price", field: "variants.price", type: "numeric" },
      {
        attribute: "grill_lights",
        field: "accentuate_data.bbq.grill_lights",
        type: "string",
      },
      {
        attribute: "size",
        field: "accentuate_data.bbq.seo_meta_cooking_grid_dimensions",
        type: "string",
      },

      {
        attribute: "rear_infrared_burner",
        field: "accentuate_data.bbq.rear_infrared_burner",
        type: "string",
      },

      {
        attribute: "cut_out_width",
        field: "accentuate_data.bbq.storage_specs_cutout_width",
        type: "string",
      },

      {
        attribute: "cut_out_depth",
        field: "accentuate_data.bbq.storage_specs_cutout_depth",
        type: "string",
      },

      {
        attribute: "cut_out_height",
        field: "accentuate_data.bbq.storage_specs_cutout_height",
        type: "string",
      },

      {
        attribute: "made_in_usa",
        field: "accentuate_data.bbq.seo_meta_made_in_usa",
        type: "string",
      },
      {
        attribute: "material",
        field: "accentuate_data.bbq.seo_meta_material",
        type: "string",
      },
      {
        attribute: "thermometer",
        field: "accentuate_data.bbq.thermometer",
        type: "string",
      },
      {
        attribute: "rotisserie_kit",
        field: "accentuate_data.bbq.rotisserie_kit",
        type: "string",
      },
      {
        attribute: "gas_type",
        field: "accentuate_data.bbq.seo_meta_fuel_type",
        type: "string",
      },
      {
        attribute: "collections",
        field: "collections.name.keyword",
        type: "string",
      },
      {
        attribute: "features_mounting_type",
        field: "features.mounting_type.keyword",
        type: "string",
        facetResponse: (aggregation) => {
          const buckets = aggregation.buckets || {};
          const result = Object.keys(buckets).reduce((acc, key) => {
            const bucket = buckets[key];
            const count = bucket?.doc_count ?? 0;
            if (bucket?.key !== "" && count > 0) {
              acc[bucket?.key] = count;
            }

            return acc;
          }, {});
          return result;
        },
      },
      {
        attribute: "features_heating_elements",
        field: "features.heating_elements.keyword",
        type: "string",
      },
      {
        attribute: "features_finish",
        field: "features.finish.keyword",
        type: "string",
      },
      // additional Fireplaces Filters
      {
        attribute: "features_inches",
        field: "features.inches.keyword",
        type: "string",
      },
      {
        attribute: "features_width",
        field: "features.width.keyword",
        type: "string",
      },
      {
        attribute: "features_height",
        field: "features.height.keyword",
        type: "string",
      },
      {
        attribute: "features_depth",
        field: "features.depth.keyword",
        type: "string",
      },
      {
        attribute: "features_vent_option",
        field: "features.vent_option.keyword",
        type: "string",
      },
      {
        attribute: "features_recess_option",
        field: "features.recess_option.keyword",
        type: "string",
      },
      {
        attribute: "features_valve_line_location",
        field: "features.valve_line_location.keyword",
        type: "string",
      },
      {
        attribute: "features_color",
        field: "features.color.keyword",
        type: "string",
        // remove empty string options
        facetResponse: (aggregation) => {
          const buckets = aggregation.buckets || {};
          const result = Object.keys(buckets).reduce((acc, key) => {
            const bucket = buckets[key];
            const count = bucket?.doc_count ?? 0;
            if (bucket?.key !== "" && count > 0) {
              acc[bucket?.key] = count;
            }

            return acc;
          }, {});
          return result;
        },
      },
      {
        attribute: "features_model",
        field: "features.model.keyword",
        type: "string",
      },
      {
        attribute: "features_type",
        field: "features.type.keyword",
        type: "string",
      },
      {
        attribute: "features_fuel_type",
        field: "features.fuel_type.keyword",
        type: "string",
        // remove Gas Valves string options
        facetResponse: (aggregation) => {
          const buckets = aggregation.buckets || {};
          const result = Object.keys(buckets).reduce((acc, key) => {
            const bucket = buckets[key];
            const count = bucket?.doc_count ?? 0;
            if (bucket?.key !== "Gas Valves" && count > 0) {
              acc[bucket?.key] = count;
            }

            return acc;
          }, {});
          return result;
        },
      },
    ],
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

    if (filter_query.length > 0) {
      // create the filter option
      filter_option = {
        hooks: {
          beforeSearch: async (searchRequests) => {
            // console.log("=== [Full Request Debug] ===");
            // console.log("Number of search requests:", searchRequests.length);
            // searchRequests.forEach((req, idx) => {
            //   console.log(`\nRequest ${idx}:`);
            //   console.log("- Params:", JSON.stringify(req.params, null, 2));
            //   console.log("- Body keys:", Object.keys(req.body));
            //   console.log(
            //     "- Query keys:",
            //     req.body.query ? Object.keys(req.body.query) : "no query"
            //   );
            // });
            // console.log("============================\n");

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

              // console.log("=== [Searchkit API Debug] ===");
              // console.log("Search Query:", searchQuery);
              // console.log("Request Params:", sr.params);
              // console.log(
              //   "Query structure:",
              //   JSON.stringify(sr.body.query, null, 2)
              // );
              // console.log("Apply Main Product Sort:", applyMainProductSort);
              // console.log("isPopular:", isPopular);
              // console.log(
              //   "Sort being applied:",
              //   isPopular ? "Popular sort (with custom logic)" : "Other sort"
              // );
              // console.log("============================");

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
