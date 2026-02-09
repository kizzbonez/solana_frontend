import {
  // etc
  BaseNavObj,
  ES_INDEX,
  STAR_FILTERS,
  exclude_brands,
  exclude_collections,
  main_products,
  shouldApplyMainProductSort,
  formatToInches,
  // Bucket keys
  capacityBucketKeys,
  depthBucketKeys,
  heightBucketKeys,
  refClassBucketKeys,
  refConfigBucketKeys,
  refDailyIceBucketKeys,
  refDimensionGroupBucketKeys,
  refDrainTypeBucketKeys,
  refGlassDoorBucketKeys,
  refHingeBucketKeys,
  refNoOfZonesBucketKeys,
  refOutdoorCertBucketKeys,
  refVentBucketKeys,
  sizeBucketKeys,
  widthBucketKeys,
  // Buckets
  capacityBuckets,
  depthBuckets,
  heightBuckets,
  refClassBuckets,
  refConfigBuckets,
  refDailyIceBuckets,
  refDimensionGroupBuckets,
  refDrainTypeBuckets,
  refHingeBuckets,
  refGlassDoorBuckets,
  refNoOfZonesBuckets,
  refOutdoorCertBuckets,
  refVentBuckets,
  sizeBuckets,
  widthBuckets,
} from "@/app/lib/helpers";
import COLLECTIONS_BY_CATEGORY from "@/app/data/collections_by_category";
import { refFilters, refFilterTypes } from "./filter-refrigerators";


export const priceBuckets = {
  "Under $500": { gte: 0, lt: 500 },
  "$500 - $1,000": { gte: 500, lt: 1000 },
  "$1,000 - $1,500": { gte: 1000, lt: 1500 },
  "$1,500 - $2,500": { gte: 1500, lt: 2500 },
  "Over $2,500": { gte: 2500 },
};

export const priceBucketKeys = Object.keys(priceBuckets);
// used in ProductsSection Component
export const filters = [
  // GENERAL FILTERS
  {
    label: "Ways to Shop",
    attribute: "ways_to_shop",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
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
            "New Arrivals": {
              terms: {
                tags: ["New Arrivals"],
              },
            },
            "Free Shipping": {
              terms: {
                tags: ["Free Shipping"],
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
          "New Arrivals",
          "Free Shipping",
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
          "New Arrivals": {
            terms: {
              tags: ["New Arrivals"],
            },
          },
          "Free Shipping": {
            terms: {
              tags: ["Free Shipping"],
            },
          },
        };

        return queries[value] || {};
      },
    },
    collapse: false,
  },
  {
    label: "Ratings",
    attribute: "ratings",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
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
          (key) => STAR_FILTERS[key] === value,
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
    collapse: false,
  },
  {
    label: "Brand",
    attribute: "brands",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "brands",
      field: "brand.keyword",
      type: "string",
    },
    collapse: true,
  },
  {
    label: "Category",
    attribute: "product_category",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
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
          (item) => item.category_name === value,
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
    collapse: true,
  },
  {
    label: "Price Groups",
    attribute: "price_groups",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
      return [...items].sort((a, b) => {
        const indexA = priceBucketKeys.indexOf(a.value);
        const indexB = priceBucketKeys.indexOf(b.value);

        return indexA - indexB;
      });
    },
    runtime_mapping: null,
    facet_attribute: {
      attribute: "price_groups",
      field: "variants.price",
      type: "numeric",
      facetQuery: () => ({
        filters: {
          filters: {
            // Dynamically generate the range filters from your priceBuckets object
            ...Object.fromEntries(
              Object.entries(priceBuckets).map(([label, range]) => [
                label,
                { range: { "variants.price": range } },
              ]),
            ),
          },
        },
      }),
      facetResponse: (aggregation) => {
        const buckets = aggregation.buckets || {};
        // Sort logic: Ensure they always appear in a specific order
        const order = Object.keys(priceBuckets);
        const result = order.reduce((acc, key) => {
          const count = buckets[key]?.doc_count ?? 0;
          if (count > 0) {
            acc[key] = count;
          }
          return acc;
        }, {});
        return result;
      },
      filterQuery: (field, value) => {
        // 1. Dynamically build the queries object from your priceBuckets
        const priceQueries = Object.fromEntries(
          Object.entries(priceBuckets).map(([label, range]) => [
            label,
            { range: { "variants.price": range } },
          ]),
        );
        const allQueries = { ...priceQueries };
        return allQueries[value] || null;
      },
    },
    collapse: false,
  },
  {
    label: "Price",
    attribute: "price",
    searchable: false,
    type: "RangeInput",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "price",
      field: "variants.price",
      type: "numeric",
    },
    collapse: false,
  },
  {
    label: "External Material",
    attribute: "material",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "material",
      field: "accentuate_data.bbq.seo_meta_material",
      type: "string",
    },
    collapse: false,
  },
  // REFRIGERATOR RELATED FILTERS
  ...refFilters,
  // ######
  
  
  
  
  {
    label: "Power Source",
    attribute: "features_fuel_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["fireplaces"],
  },
  {
    label: "Type",
    attribute: "features_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["fireplaces"],
  },
  {
    label: "Inches",
    attribute: "features_inches",
    searchable: false,
    type: "RefinementList",
    filter_type: ["fireplaces"],
  },
  {
    label: "Mounting Type",
    attribute: "features_mounting_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["fireplaces"],
  },
  {
    label: "Vent Option",
    attribute: "features_vent_option",
    searchable: false,
    type: "RefinementList",
    filter_type: ["fireplaces"],
  },
  {
    label: "Color",
    attribute: "features_color",
    searchable: false,
    type: "RefinementList",
    filter_type: ["fireplaces"],
  },
  {
    label: "Recess Option",
    attribute: "features_recess_option",
    searchable: false,
    type: "RefinementList",
    filter_type: ["fireplaces"],
  },
  {
    label: "Model",
    attribute: "features_model",
    searchable: false,
    type: "RefinementList",
    filter_type: ["fireplaces"],
  },
  {
    label: "Line Location",
    attribute: "features_valve_line_location",
    searchable: false,
    type: "RefinementList",
    filter_type: ["fireplaces"],
  },
  {
    label: "Fuel Type",
    attribute: "features_fuel_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["patio-heaters"],
  },
  {
    label: "Style",
    attribute: "features_mounting_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["patio-heaters"],
  },
  {
    label: "Heating Elements",
    attribute: "features_heating_elements",
    searchable: false,
    type: "RefinementList",
    filter_type: ["patio-heaters"],
  },
  {
    label: "Finish",
    attribute: "features_finish",
    searchable: false,
    type: "RefinementList",
    filter_type: ["patio-heaters"],
  },
  {
    label: "Collections",
    attribute: "collections",
    searchable: false,
    type: "RefinementList",
    filter_type: ["open-box", "Search"],
  },
  {
    label: "Configuration",
    attribute: "configuration_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills"],
  },
  {
    label: "Number of burners",
    attribute: "no_of_burners",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills"],
  },
  {
    label: "Lights",
    attribute: "grill_lights",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills"],
  },
  {
    label: "Size",
    attribute: "size",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills"],
    transform: function (items) {
      return items.map((item) => ({
        ...item,
        label: sizeBuckets[item.value],
      }));
    },
  },
  {
    label: "Width",
    attribute: "width",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills"],
    transform: function (items) {
      return items.map((item) => ({
        ...item,
        label: widthBuckets[item.value],
      }));
    },
  },
  {
    label: "Depth",
    attribute: "depth",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills"],
    transform: function (items) {
      return items.map((item) => ({
        ...item,
        label: depthBuckets[item.value],
      }));
    },
  },
  {
    label: "Height",
    attribute: "height",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills"],
    transform: function (items) {
      return items.map((item) => ({
        ...item,
        label: heightBuckets[item.value],
      }));
    },
  },
  {
    label: "Rear Infrared Burner",
    attribute: "rear_infrared_burner",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills"],
  },
  {
    label: "Cut-Out Width",
    attribute: "cut_out_width",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills", "storage"],
    transform: formatToInches,
  },
  {
    label: "Cut-Out Depth",
    attribute: "cut_out_depth",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills", "storage"],
    transform: formatToInches,
  },
  {
    label: "Cut-Out Height",
    attribute: "cut_out_height",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills", "storage"],
    transform: formatToInches,
  },
  {
    label: "Made In USA",
    attribute: "made_in_usa",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills", "fireplaces", "firepits"],
  },
  {
    label: "Mounting Type",
    attribute: "storage_mounting_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["storage"],
  },
  {
    label: "No. of Drawers",
    attribute: "storage_no_of_drawers",
    searchable: false,
    type: "RefinementList",
    filter_type: ["storage"],
    transform: function (items) {
      return items.map((item) => ({
        ...item,
        label: `${parseInt(item.value)} Drawers`,
      }));
    },
  },
  {
    label: "No. of Doors",
    attribute: "storage_no_of_doors",
    searchable: false,
    type: "RefinementList",
    filter_type: ["storage"],
    transform: function (items) {
      return items.map((item) => ({
        ...item,
        label: `${parseInt(item.value)} Doors`,
      }));
    },
  },
  {
    label: "Orientation",
    attribute: "storage_orientation",
    searchable: false,
    type: "RefinementList",
    filter_type: ["storage"],
  },
  // {
  //   label: "Material",
  //   attribute: "material",
  //   searchable: false,
  //   type: "RefinementList",
  //   filter_type: [
  //     "grills",
  //     "refrigerators",
  //     "storage",
  //     "compact-refrigerators",
  //   ],
  //   collapse: false,
  // },
  {
    label: "Thermometer",
    attribute: "thermometer",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills"],
  },
  {
    label: "Rotisserie Kit",
    attribute: "rotisserie_kit",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills"],
  },
  {
    label: "Gas Type",
    attribute: "gas_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills"],
  },
];

/**
 * filter_types
 * Defines the inclusion and display order of filter facets.
 * NOTE: The array order is strictly preserved; facets will appear on
 * the UI in the exact sequence defined below.
 */
export const filter_types = {
  ...refFilterTypes,
  default: [
    "ways_to_shop",
    "brands",
    "product_category",
    "price_groups",
    "price",
  ],
};

export const getActiveFacets = (type) => {
  const useType = Object.keys(filter_types).includes(type) ? type : "default";
  const typeFacets = filter_types[useType];
  const finalFacets = typeFacets
    .map((attr) => filters.find((item) => item.attribute === attr))
    .filter(Boolean);
  console.log("--------------------------------")
  console.log(type.toUpperCase());
  console.log("facets", finalFacets);
  return finalFacets;
};

export const getActiveRuntimeMappings = (type) => {
  const facets = getActiveFacets(type);
  const runtimeMappings = facets
    .map(({ runtime_mapping }) => runtime_mapping)
    .filter(Boolean)
    .reduce((acc, current) => {
      // Merge the current object (e.g., { ref_width: {...} }) into the accumulator
      return { ...acc, ...current };
    }, {});
    
  return runtimeMappings;
};