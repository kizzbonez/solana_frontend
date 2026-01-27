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
  refDrainTypeBucketKeys,
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
  refDrainTypeBuckets,
  refHingeBuckets,
  refNoOfZonesBuckets,
  refOutdoorCertBuckets,
  refVentBuckets,
  sizeBuckets,
  widthBuckets,
} from "@/app/lib/helpers";
import COLLECTIONS_BY_CATEGORY from "@/app/data/collections_by_category";

const priceBuckets = {
  "Under $500": { gte: 0, lt: 500 },
  "$500 - $1,000": { gte: 500, lt: 1000 },
  "$1,0000 - $1,500": { gte: 1000, lt: 1500 },
  "$1,500 - $2,500": { gte: 1500, lt: 2500 },
  "Over $2,500": { gte: 2500 },
};

// used in ProductsSection Component
export const filters = [
  // GENERAL FILTERS
  {
    label: "Ways to Shop",
    attribute: "ways_to_shop",
    searchable: false,
    type: "RefinementList",
    filter_type: [
      "Search",
      "refrigerators",
      "storage",
      "compact-refrigerators",
    ],
    filter_config: [
      { type: "Search", order: 1, hide: false },
      { type: "refrigerators", order: 1, hide: false },
      { type: "storage", order: 1, hide: false },
      { type: "compact-refrigerators", order: 1, hide: false },
    ],
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
    collapse: false,
  },
  {
    label: "Ratings",
    attribute: "ratings",
    searchable: false,
    type: "RefinementList",
    filter_type: ["Search", "refrigerators", "storage"],
    filter_config: [
      { type: "Search", order: 2, hide: false },
      { type: "refrigerators", order: 2, hide: false },
      { type: "storage", order: 2, hide: false },
    ],
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
    attribute: "brand",
    searchable: false,
    type: "RefinementList",
    filter_type: [
      "Search",
      "grills",
      "fireplaces",
      "firepits",
      "patio-heaters",
      "open-box",
      "refrigerators",
      "compact-refrigerators",
      "storage",
    ],
    filter_config: [
      { type: "Search", order: 3, hide: false },
      { type: "grills", order: 3, hide: false },
      { type: "fireplaces", order: 3, hide: false },
      { type: "firepits", order: 3, hide: false },
      { type: "patio-heaters", order: 3, hide: false },
      { type: "open-box", order: 3, hide: false },
      { type: "refrigerators", order: 3, hide: false },
      { type: "compact-refrigerators", order: 2, hide: false },
      { type: "storage", order: 3, hide: false },
    ],
    runtime_mapping: null,
    facet_attribute: {
      attribute: "brand",
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
    filter_type: ["Search", "refrigerators", "storage"],
    filter_config: [
      { type: "Search", order: 3, hide: false },
      { type: "refrigerators", order: 3, hide: false },
      { type: "storage", order: 3, hide: false },
      // { type: "grills", order: 3, hide: false },
      // { type: "fireplaces", order: 3, hide: false },
      // { type: "firepits", order: 3, hide: false },
      // { type: "patio-heaters", order: 3, hide: false },
      // { type: "open-box", order: 3, hide: false },
      // { type: "compact-refrigerators", order: 2, hide: false },
    ],
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
    filter_type: ["compact-refrigerators"],
    filter_config: [
      {
        type: "compact-refrigerators",
        order: 6,
        hide: false,
      },
    ],
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
        return order.reduce((acc, key) => {
          const count = buckets[key]?.doc_count ?? 0;
          if (count > 0) {
            acc[key] = count;
          }
          return acc;
        }, {});
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
    filter_type: [
      "grills",
      "fireplaces",
      "firepits",
      "refrigerators",
      "compact-refrigerators",
      "patio-heaters",
      "storage",
      "open-box",
      "Search",
    ],
    filter_config: [
      {
        type: "compact-refrigerators",
        order: 7,
        hide: false,
      },
    ],
    runtime_mapping: null,
    facet_attribute: {
      attribute: "price",
      field: "variants.price",
      type: "numeric",
    },
    collapse: false,
  },
  // REFRIGERATOR RELATED FILTERS
  {
    label: "Capacity",
    attribute: "capacity",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    transform: function (items) {
      return items.map((item) => ({
        ...item,
        label: capacityBuckets[item.value],
      }));
    },
    filter_config: [
      { type: "refrigerators", order: 1, hide: false },
      { type: "compact-refrigerators", order: 3, hide: false },
    ],
    runtime_mapping: {
      capacity_group: {
        type: "keyword",
        script: {
          source: `
                def validCapacity = ${JSON.stringify(
                  capacityBucketKeys.map((k) => k.toLowerCase()),
                )};
                if (params['_source']['tags'] != null) {
                  for (def tag : params['_source']['tags']) {
                    if (tag == null) continue;
                    
                    if (validCapacity.contains(tag.toLowerCase())) {
                      emit(tag);
                      return; 
                    }
                  }
                }
              `,
        },
      },
    },
    facet_attribute: {
      attribute: "capacity",
      field: "capacity_group",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Door Type",
    attribute: "ref_door_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    filter_config: [
      { type: "refrigerators", order: 1, hide: false },
      { type: "compact-refrigerators", order: 4, hide: false },
    ],
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_door_type",
      field: "accentuate_data.bbq.ref_specs_door_type",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Venting",
    attribute: "ref_vent",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    filter_config: [
      { type: "refrigerators", order: 1, hide: false },
      { type: "compact-refrigerators", order: 5, hide: false },
    ],
    runtime_mapping: {
      ref_vent: {
        type: "keyword",
        script: {
          source: `
          def validVent = ${JSON.stringify(
            refVentBucketKeys.map((k) => k.toLowerCase()),
          )};
          if (params['_source']['tags'] != null) {
            for (def tag : params['_source']['tags']) {
              if (tag == null) continue;

              if (validVent.contains(tag.toLowerCase())) {
                emit(tag);
                return;
              }
            }
          }
        `,
        },
      },
    },
    facet_attribute: {
      attribute: "ref_vent",
      field: "ref_vent",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Cutout Width",
    attribute: "ref_width",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    transform: formatToInches,
    filter_config: [
      { type: "refrigerators", order: 1, hide: false },
      { type: "compact-refrigerators", order: 8, hide: false },
    ],
    runtime_mapping: {
      ref_width: {
        type: "keyword",
        script: {
          source: `
        if (doc['accentuate_data.bbq.ref_specs_cutout_width'].size() > 0) {
          def val = doc['accentuate_data.bbq.ref_specs_cutout_width'].value;
          // Remove quotes, 'in', and spaces, then trim
          emit(val.replace('"', '').replace('in', '').trim());
        }
      `,
        },
      },
    },
    facet_attribute: {
      attribute: "ref_width",
      field: "ref_width",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Cutout Height",
    attribute: "ref_height",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    transform: formatToInches,
    filter_config: [
      { type: "refrigerators", order: 1, hide: false },
      { type: "compact-refrigerators", order: 9, hide: false },
    ],
    runtime_mapping: {
      ref_height: {
        type: "keyword",
        script: {
          source: `
        if (doc['accentuate_data.bbq.ref_specs_cutout_height'].size() > 0) {
          def val = doc['accentuate_data.bbq.ref_specs_cutout_height'].value;
          // Remove quotes, 'in', and spaces, then trim
          emit(val.replace('"', '').replace('in', '').trim());
        }
      `,
        },
      },
    },
    facet_attribute: {
      attribute: "ref_height",
      field: "ref_height",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "External Material",
    attribute: "material",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    filter_config: [
      { type: "refrigerators", order: 1, hide: false },
      { type: "compact-refrigerators", order: 10, hide: false },
    ],
    runtime_mapping: null,
    facet_attribute: {
      attribute: "material",
      field: "accentuate_data.bbq.seo_meta_material",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Configuration",
    attribute: "ref_mounting_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    filter_config: [
      { type: "refrigerators", order: 1, hide: false },
      { type: "compact-refrigerators", order: 10, hide: false },
    ],
    runtime_mapping: {
      ref_mounting_type: {
        type: "keyword",
        script: {
          source: `
      def tagsList = params['_source']['tags'];
      def titleText = params['_source']['title'];

      def normalizedTitle = titleText != null ? titleText.toLowerCase() : "";

      boolean isFreestanding = false;
      if (tagsList != null && tagsList.contains("Freestanding")) {
          isFreestanding = true;
      } else if (normalizedTitle.contains("freestanding")) {
          isFreestanding = true;
      }

      if (isFreestanding) {
          emit("Freestanding");
          return;
      }

      boolean isBuiltIn = false;
      if (tagsList != null && tagsList.contains("Built In")) {
          isBuiltIn = true;
      } else if (normalizedTitle.contains("built-in") || normalizedTitle.contains("built in")) {
          isBuiltIn = true;
      }

      if (isBuiltIn) {
          emit("Built-In");
          return;
      }
    `,
        },
      },
    },
    facet_attribute: {
      attribute: "ref_mounting_type",
      field: "ref_mounting_type",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Outdoor Certification",
    attribute: "ref_outdoor_certification",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    transform: function (items) {
      return items.map((item) => ({
        ...item,
        label: refOutdoorCertBuckets[item.value],
      }));
    },
    filter_config: [
      { type: "refrigerators", order: 1, hide: false },
      { type: "compact-refrigerators", order: 11, hide: false },
    ],
    runtime_mapping: {
      ref_outdoor_certification: {
        type: "keyword",
        script: {
          source: `
          def validOutdoorCert = ${JSON.stringify(
            refOutdoorCertBucketKeys.map((k) => k.toLowerCase()),
          )};
          if (params['_source']['tags'] != null) {
            for (def tag : params['_source']['tags']) {
              if (tag == null) continue;

              if (validOutdoorCert.contains(tag.toLowerCase())) {
                emit(tag);
                return;
              }
            }
          }
        `,
        },
      },
    },
    facet_attribute: {
      attribute: "ref_outdoor_certification",
      field: "ref_outdoor_certification",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Hinge Type",
    attribute: "ref_hinge",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    filter_config: [
      { type: "refrigerators", order: 1, hide: false },
      { type: "compact-refrigerators", order: 12, hide: false },
    ],
    runtime_mapping: {
      ref_hinge: {
        type: "keyword",
        script: {
          source: `
          def validHinge = ${JSON.stringify(
            refHingeBucketKeys.map((k) => k.toLowerCase()),
          )};
          if (params['_source']['tags'] != null) {
            for (def tag : params['_source']['tags']) {
              if (tag == null) continue;

              if (validHinge.contains(tag.toLowerCase())) {
                emit(tag);
                return;
              }
            }
          }
        `,
        },
      },
    },
    facet_attribute: {
      attribute: "ref_hinge",
      field: "ref_hinge",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Cutout Depth",
    attribute: "ref_depth",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    transform: formatToInches,
    filter_config: [
      { type: "refrigerators", order: 1, hide: false },
      { type: "compact-refrigerators", order: 13, hide: false },
    ],
    runtime_mapping: {
      ref_depth: {
        type: "keyword",
        script: {
          source: `
        if (doc['accentuate_data.bbq.ref_specs_cutout_depth'].size() > 0) {
          def val = doc['accentuate_data.bbq.ref_specs_cutout_depth'].value;
          // Remove quotes, 'in', and spaces, then trim
          emit(val.replace('"', '').replace('in', '').trim());
        }
      `,
        },
      },
    },
    facet_attribute: {
      attribute: "ref_depth",
      field: "ref_depth",
      type: "string",
    },
  },

  {
    label: "Ice Cube Type",
    attribute: "ref_ice_cube_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    collapse: false,
  },
  {
    label: "Refrigerator Class",
    attribute: "ref_class",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    collapse: false,
  },
  {
    label: "Daily Ice Output", // #
    attribute: "ref_ice_daily_output",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    collapse: false,
  },
  {
    label: "Ref Configuration", // #
    attribute: "ref_config",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    collapse: false,
  },
  {
    label: "Drain Type", // #
    attribute: "ref_drain_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    collapse: false,
  },
  {
    label: "No. Of Zones", // #
    attribute: "ref_no_of_zones",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    collapse: false,
  },
  {
    label: "Storage Type",
    attribute: "ref_storage_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    collapse: false,
  },
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
    label: "Price Groups",
    attribute: "price_groups",
    searchable: false,
    type: "RefinementList",
    filter_type: ["compact-refrigerators"],
    collapse: false,
  },
  {
    label: "Price",
    attribute: "price",
    searchable: false,
    type: "RangeInput",
    filter_type: [
      "grills",
      "fireplaces",
      "firepits",
      "refrigerators",
      "compact-refrigerators",
      "patio-heaters",
      "storage",
      "open-box",
      "Search",
    ],
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
  {
    label: "Material",
    attribute: "material",
    searchable: false,
    type: "RefinementList",
    filter_type: [
      "grills",
      "refrigerators",
      "storage",
      "compact-refrigerators",
    ],
    collapse: false,
  },
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

// export const getFacetAttributesByFilterType = (type) => {
//   const targetFilter = filters.filter((f) =>
//     f.filter_config?.some((config) => config.type === type),
//   );

//   return targetFilter ?? null;
// };

export const getFacetAttributesByFilterType = (type) => {
  return filters
    .filter((f) => {
      // Find the specific config entry for this type
      const config = f.filter_config?.find((c) => c.type === type);

      // Only include if the config exists AND hide is not true
      return config && config.hide !== true;
    })
    .sort((a, b) => {
      // Extract order values (default to 99 if not provided)
      const orderA = a.filter_config?.find((c) => c.type === type)?.order ?? 99;
      const orderB = b.filter_config?.find((c) => c.type === type)?.order ?? 99;

      return orderA - orderB;
    });
};

console.log(
  "facetAttributes[compact-refrigerators]",
  (getFacetAttributesByFilterType("compact-refrigerators") || []).map(
    ({ facet_attribute }) => facet_attribute,
  ),
);

export const getRuntimeMappingsByFilterType = (type) => {
  return filters.reduce((acc, filter) => {
    // Check if this filter is active for the requested type
    const isActive = filter.filter_config?.some(
      (config) => config.type === type && !config.hide,
    );

    // If active and has a runtime_mapping, merge it into the accumulator
    if (isActive && filter.runtime_mapping) {
      Object.assign(acc, filter.runtime_mapping);
    }

    return acc;
  }, {});
};

console.log(
  "RuntimeMappings[compact-refrigerators]",
  getRuntimeMappingsByFilterType("compact-refrigerators"),
);

// generate refinementlist html for url-based filters
// console.log(
//   filters
//     .filter(({ attribute }) => attribute !== "price")
//     .map(
//       ({ attribute }) =>
//         `<RefinementList attribute="${attribute}" className="hidden" />`,
//     )
//     .join("\n"),
// );

// console.log(
//   filters
//     .filter(({ filter_type }) => filter_type.includes("refrigerators"))
//     .map(({ label }) => `- ${label}`)
//     .join("\n"),
// );

// console.log(
//   filters
//     .filter(({ filter_type }) => filter_type.includes("storage"))
//     .map(({ label }) => `- ${label}`)
//     .join("\n"),
// );
