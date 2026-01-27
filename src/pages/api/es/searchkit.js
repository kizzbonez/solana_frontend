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
  getFacetAttributesByFilterType,
  getRuntimeMappingsByFilterType,
} from "../../../app/lib/filter-helper";

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

    // setup facetAttributes and runtimeMappings dynamically
    // const facetAttributes = [
    //   {
    //     attribute: "ways_to_shop",
    //     type: "string",

    //     facetQuery: () => ({
    //       filters: {
    //         filters: {
    //           "Top Rated": {
    //             terms: { "ratings.rating_count.keyword": ["3", "4", "5"] },
    //           },
    //           "Clearance/Open Box": {
    //             bool: {
    //               should: [
    //                 {
    //                   wildcard: {
    //                     "collections.name.keyword": {
    //                       value: "*clearance*",
    //                       case_insensitive: true, // Added this
    //                     },
    //                   },
    //                 },
    //                 {
    //                   wildcard: {
    //                     "collections.name.keyword": {
    //                       value: "*open box*",
    //                       case_insensitive: true, // Added this
    //                     },
    //                   },
    //                 },
    //               ],
    //             },
    //           },
    //           "Package Deals": {
    //             wildcard: {
    //               "collections.name.keyword": {
    //                 value: "*package deal*",
    //                 case_insensitive: true, // Added this
    //               },
    //             },
    //           },
    //           Promotions: {
    //             wildcard: {
    //               "collections.name.keyword": {
    //                 value: "*promotion*",
    //                 case_insensitive: true, // Added this
    //               },
    //             },
    //           },
    //         },
    //       },
    //     }),

    //     facetResponse: (aggregation) => {
    //       const buckets = aggregation.buckets || {};
    //       // Sort logic: Ensure they always appear in a specific order
    //       const order = [
    //         "Top Rated",
    //         "Clearance/Open Box",
    //         "Package Deals",
    //         "Promotions",
    //       ];

    //       return order.reduce((acc, key) => {
    //         const count = buckets[key]?.doc_count ?? 0;
    //         if (count > 0) {
    //           acc[key] = count;
    //         }
    //         return acc;
    //       }, {});
    //     },

    //     filterQuery: (field, value) => {
    //       const queries = {
    //         "Top Rated": {
    //           terms: { "ratings.rating_count.keyword": ["3", "4", "5"] },
    //         },
    //         "Clearance/Open Box": {
    //           bool: {
    //             should: [
    //               {
    //                 wildcard: {
    //                   "collections.name.keyword": {
    //                     value: "*clearance*",
    //                     case_insensitive: true,
    //                   },
    //                 },
    //               },
    //               {
    //                 wildcard: {
    //                   "collections.name.keyword": {
    //                     value: "*open box*",
    //                     case_insensitive: true,
    //                   },
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         "Package Deals": {
    //           wildcard: {
    //             "collections.name.keyword": {
    //               value: "*package deal*",
    //               case_insensitive: true,
    //             },
    //           },
    //         },
    //         Promotions: {
    //           wildcard: {
    //             "collections.name.keyword": {
    //               value: "*promotion*",
    //               case_insensitive: true,
    //             },
    //           },
    //         },
    //       };

    //       return queries[value] || {};
    //     },
    //   },
    //   {
    //     attribute: "ratings",
    //     field: "ratings.rating_count.keyword",
    //     type: "string",

    //     facetQuery: () => ({
    //       filters: {
    //         filters: {
    //           [STAR_FILTERS[0]]: {
    //             term: { "ratings.rating_count.keyword": "0" },
    //           },
    //           [STAR_FILTERS[1]]: {
    //             term: { "ratings.rating_count.keyword": "1" },
    //           },
    //           [STAR_FILTERS[2]]: {
    //             term: { "ratings.rating_count.keyword": "2" },
    //           },
    //           [STAR_FILTERS[3]]: {
    //             term: { "ratings.rating_count.keyword": "3" },
    //           },
    //           [STAR_FILTERS[4]]: {
    //             term: { "ratings.rating_count.keyword": "4" },
    //           },
    //           [STAR_FILTERS[5]]: {
    //             term: { "ratings.rating_count.keyword": "5" },
    //           },
    //         },
    //       },
    //     }),

    //     facetResponse: (aggregation) => {
    //       const buckets = aggregation.buckets || {};
    //       return Object.keys(buckets).reduce((acc, key) => {
    //         const count = buckets[key]?.doc_count ?? 0;
    //         if (count > 0) {
    //           acc[key] = count;
    //         }
    //         return acc;
    //       }, {});
    //     },

    //     filterQuery: (field, value) => {
    //       // 'value' is the star string (e.g., "★★★★★")
    //       // We find the numeric key ("5") that matches that string
    //       const esValue = Object.keys(STAR_FILTERS).find(
    //         (key) => STAR_FILTERS[key] === value,
    //       );

    //       if (esValue !== undefined) {
    //         return {
    //           term: {
    //             [field]: esValue,
    //           },
    //         };
    //       }

    //       return {};
    //     },
    //   },
    //   {
    //     attribute: "product_category",
    //     type: "string",

    //     facetQuery: () => {
    //       const dynamicFilters = {};
    //       COLLECTIONS_BY_CATEGORY.forEach((item) => {
    //         // Build the filter object dynamically for each category
    //         dynamicFilters[item.category_name] = {
    //           terms: { "collections.name.keyword": item.collections },
    //         };
    //       });
    //       return {
    //         filters: {
    //           filters: dynamicFilters,
    //         },
    //       };
    //     },

    //     facetResponse: (aggregation) => {
    //       const buckets = aggregation.buckets || {};
    //       const navData = COLLECTIONS_BY_CATEGORY || [];

    //       // Use the order from your dynamic array
    //       return navData.reduce((acc, item) => {
    //         const key = item.category_name;
    //         const count = buckets[key]?.doc_count ?? 0;
    //         if (count > 0) acc[key] = count;
    //         return acc;
    //       }, {});
    //     },

    //     filterQuery: (field, value) => {
    //       const navData = COLLECTIONS_BY_CATEGORY || [];
    //       const selectedCategory = navData.find(
    //         (item) => item.category_name === value,
    //       );

    //       if (selectedCategory) {
    //         return {
    //           terms: {
    //             "collections.name.keyword": selectedCategory.collections,
    //           },
    //         };
    //       }
    //       return {};
    //     },
    //   },
    //   { attribute: "brand", field: "brand.keyword", type: "string" },
    //   {
    //     attribute: "configuration_type",
    //     field: "accentuate_data.bbq.configuration_type", // informational only
    //     type: "string",

    //     facetQuery: () => ({
    //       // We don’t rely on ES aggregations here
    //       filters: {
    //         filters: {
    //           "Built-In": {
    //             match_phrase: {
    //               tags: "built in",
    //             },
    //           },
    //           Freestanding: {
    //             match_phrase: {
    //               tags: "freestanding",
    //             },
    //           },
    //         },
    //       },
    //     }),

    //     facetResponse: (aggregation) => {
    //       const buckets = aggregation.buckets || {};
    //       return Object.keys(buckets).reduce((acc, key) => {
    //         const count = buckets[key]?.doc_count ?? 0;
    //         if (count > 0) {
    //           acc[key] = count; // only include non-zero
    //         }
    //         return acc;
    //       }, {});
    //     },

    //     filterQuery: (field, value) => {
    //       if (value === "Built-In") {
    //         return {
    //           match_phrase: {
    //             tags: "built in",
    //           },
    //         };
    //       }
    //       if (value === "Freestanding") {
    //         return {
    //           match_phrase: {
    //             tags: "freestanding",
    //           },
    //         };
    //       }
    //       return {};
    //     },
    //   },
    //   {
    //     attribute: "no_of_burners",
    //     field: "accentuate_data.bbq.number_of_main_burners",
    //     type: "string",

    //     // Define normalized buckets
    //     facetQuery: () => {
    //       return {
    //         filters: {
    //           filters: Object.fromEntries(
    //             Object.entries(burnerBuckets).map(([label, values]) => [
    //               label,
    //               {
    //                 terms: {
    //                   "accentuate_data.bbq.number_of_main_burners": values,
    //                 },
    //               },
    //             ]),
    //           ),
    //         },
    //       };
    //     },

    //     // Map ES response to facet values & hide zero counts
    //     facetResponse: (aggregation) => {
    //       const buckets = aggregation.buckets || {};
    //       return Object.keys(buckets).reduce((acc, key) => {
    //         const count = buckets[key]?.doc_count ?? 0;
    //         if (count > 0) {
    //           acc[key] = count; // only include non-zero
    //         }
    //         return acc;
    //       }, {});
    //     },

    //     // Build filter query when user selects a value
    //     filterQuery: (field, value) => {
    //       return {
    //         terms: {
    //           "accentuate_data.bbq.number_of_main_burners":
    //             burnerBuckets[value] || [],
    //         },
    //       };
    //     },
    //   },
    //   {
    //     attribute: "price_groups",
    //     field: "variants.price",
    //     type: "numeric",
    //     facetQuery: () => ({
    //       filters: {
    //         filters: {
    //           // Dynamically generate the range filters from your priceBuckets object
    //           ...Object.fromEntries(
    //             Object.entries(priceBuckets).map(([label, range]) => [
    //               label,
    //               { range: { "variants.price": range } },
    //             ]),
    //           ),
    //         },
    //       },
    //     }),
    //     facetResponse: (aggregation) => {
    //       const buckets = aggregation.buckets || {};
    //       // Sort logic: Ensure they always appear in a specific order
    //       const order = Object.keys(priceBuckets);
    //       return order.reduce((acc, key) => {
    //         const count = buckets[key]?.doc_count ?? 0;
    //         if (count > 0) {
    //           acc[key] = count;
    //         }
    //         return acc;
    //       }, {});
    //     },
    //     filterQuery: (field, value) => {
    //       // 1. Dynamically build the queries object from your priceBuckets
    //       const priceQueries = Object.fromEntries(
    //         Object.entries(priceBuckets).map(([label, range]) => [
    //           label,
    //           { range: { "variants.price": range } },
    //         ]),
    //       );
    //       const allQueries = { ...priceQueries };
    //       return allQueries[value] || null;
    //     },
    //   },
    //   { attribute: "price", field: "variants.price", type: "numeric" },
    //   {
    //     attribute: "ref_mounting_type",
    //     field: "ref_mounting_type",
    //     type: "string",
    //   },
    //   {
    //     attribute: "ref_ice_cube_type",
    //     field: "ref_ice_cube_type",
    //     type: "string",
    //   },
    //   {
    //     attribute: "ref_outdoor_certification",
    //     field: "ref_outdoor_certification",
    //     type: "string",
    //   },
    //   {
    //     attribute: "ref_class",
    //     field: "ref_class",
    //     type: "string",
    //   },
    //   {
    //     attribute: "ref_ice_daily_output",
    //     field: "ref_ice_daily_output",
    //     type: "string",
    //   },
    //   {
    //     attribute: "ref_config",
    //     field: "ref_config",
    //     type: "string",
    //   },
    //   {
    //     attribute: "ref_drain_type",
    //     field: "ref_drain_type",
    //     type: "string",
    //   },
    //   {
    //     attribute: "ref_no_of_zones",
    //     field: "ref_no_of_zones",
    //     type: "string",
    //   },
    //   {
    //     attribute: "grill_lights",
    //     field: "accentuate_data.bbq.grill_lights",
    //     type: "string",
    //   },
    //   {
    //     attribute: "ref_type",
    //     field: "accentuate_data.bbq.ref_specs_type",
    //     type: "string",
    //   },
    //   {
    //     attribute: "ref_door_type",
    //     field: "accentuate_data.bbq.ref_specs_door_type",
    //     type: "string",
    //   },
    //   {
    //     attribute: "capacity",
    //     field: "capacity_group",
    //     type: "string",
    //   },
    //   {
    //     attribute: "ref_vent",
    //     field: "ref_vent",
    //     type: "string",
    //   },
    //   {
    //     attribute: "ref_hinge",
    //     field: "ref_hinge",
    //     type: "string",
    //   },
    //   {
    //     attribute: "ref_storage_type",
    //     field: "accentuate_data.bbq.brand_storage_specs_type",
    //     type: "string",
    //   },
    //   {
    //     attribute: "ref_width",
    //     field: "ref_width",
    //     type: "string",
    //   },
    //   {
    //     attribute: "ref_height",
    //     field: "ref_height",
    //     type: "string",
    //   },
    //   {
    //     attribute: "ref_depth",
    //     field: "ref_depth",
    //     type: "string",
    //   },
    //   {
    //     attribute: "size",
    //     field: "size_group",
    //     type: "string",
    //   },
    //   {
    //     attribute: "width",
    //     field: "width_group",
    //     type: "string",
    //   },
    //   {
    //     attribute: "depth",
    //     field: "depth_group",
    //     type: "string",
    //   },
    //   {
    //     attribute: "height",
    //     field: "height_group",
    //     type: "string",
    //   },
    //   {
    //     attribute: "rear_infrared_burner",
    //     field: "accentuate_data.bbq.rear_infrared_burner",
    //     type: "string",
    //   },
    //   {
    //     attribute: "cut_out_width",
    //     field: "cut_out_width",
    //     type: "string",
    //   },

    //   {
    //     attribute: "cut_out_depth",
    //     field: "cut_out_depth",
    //     type: "string",
    //   },

    //   {
    //     attribute: "cut_out_height",
    //     field: "cut_out_height",
    //     type: "string",
    //   },
    //   {
    //     attribute: "storage_mounting_type",
    //     field: "accentuate_data.bbq.storage_specs_mounting_type",
    //     type: "string",
    //   },
    //   {
    //     attribute: "storage_no_of_drawers",
    //     field: "accentuate_data.bbq.storage_specs_number_of_drawers",
    //     type: "string",
    //   },
    //   {
    //     attribute: "storage_no_of_doors",
    //     field: "accentuate_data.bbq.storage_specs_number_of_doors",
    //     type: "string",
    //   },
    //   {
    //     attribute: "storage_orientation",
    //     field: "accentuate_data.bbq.storage_specs_orientation",
    //     type: "string",
    //   },
    //   {
    //     attribute: "made_in_usa",
    //     field: "accentuate_data.bbq.seo_meta_made_in_usa",
    //     type: "string",
    //   },
    //   {
    //     attribute: "material",
    //     field: "accentuate_data.bbq.seo_meta_material",
    //     type: "string",
    //   },
    //   {
    //     attribute: "thermometer",
    //     field: "accentuate_data.bbq.thermometer",
    //     type: "string",
    //   },
    //   {
    //     attribute: "rotisserie_kit",
    //     field: "accentuate_data.bbq.rotisserie_kit",
    //     type: "string",
    //   },
    //   {
    //     attribute: "gas_type",
    //     field: "accentuate_data.bbq.seo_meta_fuel_type",
    //     type: "string",
    //   },
    //   {
    //     attribute: "collections",
    //     field: "collections.name.keyword",
    //     type: "string",
    //   },
    //   {
    //     attribute: "features_mounting_type",
    //     field: "features.mounting_type.keyword",
    //     type: "string",
    //     facetResponse: (aggregation) => {
    //       const buckets = aggregation.buckets || {};
    //       const result = Object.keys(buckets).reduce((acc, key) => {
    //         const bucket = buckets[key];
    //         const count = bucket?.doc_count ?? 0;
    //         if (bucket?.key !== "" && count > 0) {
    //           acc[bucket?.key] = count;
    //         }

    //         return acc;
    //       }, {});
    //       return result;
    //     },
    //   },
    //   {
    //     attribute: "features_heating_elements",
    //     field: "features.heating_elements.keyword",
    //     type: "string",
    //   },
    //   {
    //     attribute: "features_finish",
    //     field: "features.finish.keyword",
    //     type: "string",
    //   },
    //   {
    //     attribute: "features_inches",
    //     field: "features.inches.keyword",
    //     type: "string",
    //   },
    //   {
    //     attribute: "features_width",
    //     field: "features.width.keyword",
    //     type: "string",
    //   },
    //   {
    //     attribute: "features_height",
    //     field: "features.height.keyword",
    //     type: "string",
    //   },
    //   {
    //     attribute: "features_depth",
    //     field: "features.depth.keyword",
    //     type: "string",
    //   },
    //   {
    //     attribute: "features_vent_option",
    //     field: "features.vent_option.keyword",
    //     type: "string",
    //   },
    //   {
    //     attribute: "features_recess_option",
    //     field: "features.recess_option.keyword",
    //     type: "string",
    //   },
    //   {
    //     attribute: "features_valve_line_location",
    //     field: "features.valve_line_location.keyword",
    //     type: "string",
    //   },
    //   {
    //     attribute: "features_color",
    //     field: "features.color.keyword",
    //     type: "string",
    //     // remove empty string options
    //     facetResponse: (aggregation) => {
    //       const buckets = aggregation.buckets || {};
    //       const result = Object.keys(buckets).reduce((acc, key) => {
    //         const bucket = buckets[key];
    //         const count = bucket?.doc_count ?? 0;
    //         if (bucket?.key !== "" && count > 0) {
    //           acc[bucket?.key] = count;
    //         }

    //         return acc;
    //       }, {});
    //       return result;
    //     },
    //   },
    //   {
    //     attribute: "features_model",
    //     field: "features.model.keyword",
    //     type: "string",
    //   },
    //   {
    //     attribute: "features_type",
    //     field: "features.type.keyword",
    //     type: "string",
    //   },
    //   {
    //     attribute: "features_fuel_type",
    //     field: "features.fuel_type.keyword",
    //     type: "string",
    //     // remove Gas Valves string options
    //     facetResponse: (aggregation) => {
    //       const buckets = aggregation.buckets || {};
    //       const result = Object.keys(buckets).reduce((acc, key) => {
    //         const bucket = buckets[key];
    //         const count = bucket?.doc_count ?? 0;
    //         if (bucket?.key !== "Gas Valves" && count > 0) {
    //           acc[bucket?.key] = count;
    //         }

    //         return acc;
    //       }, {});
    //       return result;
    //     },
    //   },
    // ];
    const facetAttributes = (
      getFacetAttributesByFilterType(filter_type) || []
    ).map(({ facet_attribute }) => facet_attribute);
    // const runtimeMappings = {
    //   size_group: {
    //     type: "keyword", // Changed to keyword for grouping/faceting
    //     script: {
    //       source: `
    //       def validSizes = ${JSON.stringify(
    //         sizeBucketKeys.map((k) => k.toLowerCase()),
    //       )};
    //       if (params['_source']['tags'] != null) {
    //         for (def tag : params['_source']['tags']) {
    //           if (tag == null) continue;

    //           // 3. Lowercase the tag from the document and check against the lowercase list
    //           if (validSizes.contains(tag.toLowerCase())) {
    //             // Emit the ORIGINAL tag so your UI display logic still works
    //             emit(tag);
    //             return;
    //           }
    //         }
    //       }
    //     `,
    //     },
    //   },
    //   width_group: {
    //     type: "keyword", // Changed to keyword for grouping/faceting
    //     script: {
    //       source: `
    //       def validSizes = ${JSON.stringify(
    //         widthBucketKeys.map((k) => k.toLowerCase()),
    //       )};
    //       if (params['_source']['tags'] != null) {
    //         for (def tag : params['_source']['tags']) {
    //           if (tag == null) continue;

    //           // 3. Lowercase the tag from the document and check against the lowercase list
    //           if (validSizes.contains(tag.toLowerCase())) {
    //             // Emit the ORIGINAL tag so your UI display logic still works
    //             emit(tag);
    //             return;
    //           }
    //         }
    //       }
    //     `,
    //     },
    //   },
    //   depth_group: {
    //     type: "keyword", // Changed to keyword for grouping/faceting
    //     script: {
    //       source: `
    //       def validSizes = ${JSON.stringify(
    //         depthBucketKeys.map((k) => k.toLowerCase()),
    //       )};
    //       if (params['_source']['tags'] != null) {
    //         for (def tag : params['_source']['tags']) {
    //           if (tag == null) continue;

    //           // 3. Lowercase the tag from the document and check against the lowercase list
    //           if (validSizes.contains(tag.toLowerCase())) {
    //             // Emit the ORIGINAL tag so your UI display logic still works
    //             emit(tag);
    //             return;
    //           }
    //         }
    //       }
    //     `,
    //     },
    //   },
    //   height_group: {
    //     type: "keyword", // Changed to keyword for grouping/faceting
    //     script: {
    //       source: `
    //       def validSizes = ${JSON.stringify(
    //         heightBucketKeys.map((k) => k.toLowerCase()),
    //       )};
    //       if (params['_source']['tags'] != null) {
    //         for (def tag : params['_source']['tags']) {
    //           if (tag == null) continue;

    //           // 3. Lowercase the tag from the document and check against the lowercase list
    //           if (validSizes.contains(tag.toLowerCase())) {
    //             // Emit the ORIGINAL tag so your UI display logic still works
    //             emit(tag);
    //             return;
    //           }
    //         }
    //       }
    //     `,
    //     },
    //   },
    //   capacity_group: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //       def validCapacity = ${JSON.stringify(
    //         capacityBucketKeys.map((k) => k.toLowerCase()),
    //       )};
    //       if (params['_source']['tags'] != null) {
    //         for (def tag : params['_source']['tags']) {
    //           if (tag == null) continue;

    //           if (validCapacity.contains(tag.toLowerCase())) {
    //             emit(tag);
    //             return;
    //           }
    //         }
    //       }
    //     `,
    //     },
    //   },
    //   cut_out_width: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //     if (doc['accentuate_data.bbq.storage_specs_cutout_width'].size() > 0) {
    //       def val = doc['accentuate_data.bbq.storage_specs_cutout_width'].value;
    //       // Remove quotes, 'in', and spaces, then trim
    //       emit(val.replace('"', '').replace('in', '').trim());
    //     }
    //   `,
    //     },
    //   },
    //   cut_out_depth: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //     if (doc['accentuate_data.bbq.storage_specs_cutout_depth'].size() > 0) {
    //       def val = doc['accentuate_data.bbq.storage_specs_cutout_depth'].value;
    //       // Remove quotes, 'in', and spaces, then trim
    //       emit(val.replace('"', '').replace('in', '').trim());
    //     }
    //   `,
    //     },
    //   },
    //   cut_out_height: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //     if (doc['accentuate_data.bbq.storage_specs_cutout_height'].size() > 0) {
    //       def val = doc['accentuate_data.bbq.storage_specs_cutout_height'].value;
    //       // Remove quotes, 'in', and spaces, then trim
    //       emit(val.replace('"', '').replace('in', '').trim());
    //     }
    //   `,
    //     },
    //   },
    //   ref_vent: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //       def validVent = ${JSON.stringify(
    //         refVentBucketKeys.map((k) => k.toLowerCase()),
    //       )};
    //       if (params['_source']['tags'] != null) {
    //         for (def tag : params['_source']['tags']) {
    //           if (tag == null) continue;

    //           if (validVent.contains(tag.toLowerCase())) {
    //             emit(tag);
    //             return;
    //           }
    //         }
    //       }
    //     `,
    //     },
    //   },
    //   ref_hinge: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //       def validHinge = ${JSON.stringify(
    //         refHingeBucketKeys.map((k) => k.toLowerCase()),
    //       )};
    //       if (params['_source']['tags'] != null) {
    //         for (def tag : params['_source']['tags']) {
    //           if (tag == null) continue;

    //           if (validHinge.contains(tag.toLowerCase())) {
    //             emit(tag);
    //             return;
    //           }
    //         }
    //       }
    //     `,
    //     },
    //   },
    //   rating_num: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //   // Check if field exists and is not empty
    //   if (doc['ratings.rating_count.keyword'].size() > 0 && doc['ratings.rating_count.keyword'].value != null) {

    //     String raw = doc['ratings.rating_count.keyword'].value;
    //     String clean = /[^\d]/.matcher(raw).replaceAll('');

    //     if (clean.length() > 0) {
    //       emit(clean);
    //     } else {
    //       emit("0"); // Fallback for empty strings
    //     }
    //   } else {
    //     emit("0"); // Fallback for missing fields
    //   }
    // `,
    //     },
    //   },
    //   ref_width: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //     if (doc['accentuate_data.bbq.ref_specs_cutout_width'].size() > 0) {
    //       def val = doc['accentuate_data.bbq.ref_specs_cutout_width'].value;
    //       // Remove quotes, 'in', and spaces, then trim
    //       emit(val.replace('"', '').replace('in', '').trim());
    //     }
    //   `,
    //     },
    //   },
    //   ref_depth: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //     if (doc['accentuate_data.bbq.ref_specs_cutout_depth'].size() > 0) {
    //       def val = doc['accentuate_data.bbq.ref_specs_cutout_depth'].value;
    //       // Remove quotes, 'in', and spaces, then trim
    //       emit(val.replace('"', '').replace('in', '').trim());
    //     }
    //   `,
    //     },
    //   },
    //   ref_height: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //     if (doc['accentuate_data.bbq.ref_specs_cutout_height'].size() > 0) {
    //       def val = doc['accentuate_data.bbq.ref_specs_cutout_height'].value;
    //       // Remove quotes, 'in', and spaces, then trim
    //       emit(val.replace('"', '').replace('in', '').trim());
    //     }
    //   `,
    //     },
    //   },
    //   ref_mounting_type: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //   def tagsList = params['_source']['tags'];
    //   def titleText = params['_source']['title'];

    //   def normalizedTitle = titleText != null ? titleText.toLowerCase() : "";

    //   boolean isFreestanding = false;
    //   if (tagsList != null && tagsList.contains("Freestanding")) {
    //       isFreestanding = true;
    //   } else if (normalizedTitle.contains("freestanding")) {
    //       isFreestanding = true;
    //   }

    //   if (isFreestanding) {
    //       emit("Freestanding");
    //       return;
    //   }

    //   boolean isBuiltIn = false;
    //   if (tagsList != null && tagsList.contains("Built In")) {
    //       isBuiltIn = true;
    //   } else if (normalizedTitle.contains("built-in") || normalizedTitle.contains("built in")) {
    //       isBuiltIn = true;
    //   }

    //   if (isBuiltIn) {
    //       emit("Built-In");
    //       return;
    //   }
    // `,
    //     },
    //   },
    //   ref_ice_cube_type: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //   def tagsList = params['_source']['tags'];
    //   def titleText = params['_source']['title'];

    //   def normalizedTitle = titleText != null ? titleText.toLowerCase() : "";

    //   boolean isClear = false;
    //   if (tagsList != null && tagsList.contains("Clear")) {
    //       isClear = true;
    //   } else if (normalizedTitle.contains("clear")) {
    //       isClear = true;
    //   }

    //   if (isClear) {
    //       emit("Clear");
    //       return;
    //   }

    //   boolean isCube = false;
    //   if (tagsList != null && tagsList.contains("Cube")) {
    //       isCube = true;
    //   } else if (normalizedTitle.contains("cube")) {
    //       isCube = true;
    //   }

    //   if (isCube) {
    //       emit("Cube");
    //       return;
    //   }

    //   boolean isGourmet = false;
    //   if (tagsList != null && tagsList.contains("Gourmet")) {
    //       isGourmet = true;
    //   } else if (normalizedTitle.contains("gourmet")) {
    //       isGourmet = true;
    //   }

    //   if (isGourmet) {
    //       emit("Gourmet");
    //       return;
    //   }
    // `,
    //     },
    //   },
    //   ref_outdoor_certification: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //       def validOutdoorCert = ${JSON.stringify(
    //         refOutdoorCertBucketKeys.map((k) => k.toLowerCase()),
    //       )};
    //       if (params['_source']['tags'] != null) {
    //         for (def tag : params['_source']['tags']) {
    //           if (tag == null) continue;

    //           if (validOutdoorCert.contains(tag.toLowerCase())) {
    //             emit(tag);
    //             return;
    //           }
    //         }
    //       }
    //     `,
    //     },
    //   },
    //   ref_class: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //       def validClass = ${JSON.stringify(
    //         refClassBucketKeys.map((k) => k.toLowerCase()),
    //       )};
    //       if (params['_source']['tags'] != null) {
    //         for (def tag : params['_source']['tags']) {
    //           if (tag == null) continue;

    //           if (validClass.contains(tag.toLowerCase())) {
    //             emit(tag);
    //             return;
    //           }
    //         }
    //       }
    //     `,
    //     },
    //   },
    //   ref_ice_daily_output: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //       def validDIO = ${JSON.stringify(
    //         refDailyIceBucketKeys.map((k) => k.toLowerCase()),
    //       )};
    //       if (params['_source']['tags'] != null) {
    //         for (def tag : params['_source']['tags']) {
    //           if (tag == null) continue;

    //           if (validDIO.contains(tag.toLowerCase())) {
    //             emit(tag);
    //             return;
    //           }
    //         }
    //       }
    //     `,
    //     },
    //   },
    //   ref_config: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //       def validConfig = ${JSON.stringify(
    //         refConfigBucketKeys.map((k) => k.toLowerCase()),
    //       )};
    //       if (params['_source']['tags'] != null) {
    //         for (def tag : params['_source']['tags']) {
    //           if (tag == null) continue;

    //           if (validConfig.contains(tag.toLowerCase())) {
    //             emit(tag);
    //             return;
    //           }
    //         }
    //       }
    //     `,
    //     },
    //   },
    //   ref_drain_type: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //       def validDrainType = ${JSON.stringify(
    //         refDrainTypeBucketKeys.map((k) => k.toLowerCase()),
    //       )};
    //       if (params['_source']['tags'] != null) {
    //         for (def tag : params['_source']['tags']) {
    //           if (tag == null) continue;

    //           if (validDrainType.contains(tag.toLowerCase())) {
    //             emit(tag);
    //             return;
    //           }
    //         }
    //       }
    //     `,
    //     },
    //   },
    //   ref_no_of_zones: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //       def validNoOfZones = ${JSON.stringify(
    //         refNoOfZonesBucketKeys.map((k) => k.toLowerCase()),
    //       )};
    //       if (params['_source']['tags'] != null) {
    //         for (def tag : params['_source']['tags']) {
    //           if (tag == null) continue;

    //           if (validNoOfZones.contains(tag.toLowerCase())) {
    //             emit(tag);
    //             return;
    //           }
    //         }
    //       }
    //     `,
    //     },
    //   },
    // };

    const runtimeMappings = getRuntimeMappingsByFilterType(filter_type);

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
