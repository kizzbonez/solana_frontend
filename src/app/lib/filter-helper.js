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

const yesNo = ["Yes", "No"]; // used for transform sort

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
        console.log("a", a);
        console.log("b", b);
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
  // REFRIGERATOR RELATED FILTERS
  {
    label: "Capacity",
    attribute: "capacity",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
      return items
        .map((item) => ({
          ...item,
          label: capacityBuckets[item.value],
        }))
        .sort((a, b) => {
          // 2. Sort based on the index in our desiredOrder array
          return (
            capacityBucketKeys.indexOf(a.value) -
            capacityBucketKeys.indexOf(b.value)
          );
        });
    },
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
    label: "Glass Door",
    attribute: "ref_glass_door",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
      return items.sort((a, b) => {
        return yesNo.indexOf(a.value) - yesNo.indexOf(b.value);
      });
    },
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_glass_door",
      field: "accentuate_data.bbq.ref_specs_is_glass_door",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Door Type",
    attribute: "ref_door_type",
    searchable: false,
    type: "RefinementList",
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
    transform: function (items) {
      return items
        .map((item) => ({
          ...item,
          label: refDimensionGroupBuckets[item.value],
        }))
        .sort((a, b) => {
          // 2. Sort based on the index in our desiredOrder array
          return (
            refDimensionGroupBucketKeys.indexOf(a.value) -
            refDimensionGroupBucketKeys.indexOf(b.value)
          );
        });
    },
    runtime_mapping: {
      ref_width: {
        type: "keyword",
        script: {
          source: `
      if (params['_source']['accentuate_data'] == null || 
          params['_source']['accentuate_data']['bbq.ref_specs_cutout_width'] == null) {
        return;
      }

      String rawValue = params['_source']['accentuate_data']['bbq.ref_specs_cutout_width'];
      
      double width = 0;
      try {
        // Remove "Inches" and whitespace to parse the number
        String cleanValue = rawValue.toLowerCase().replace('"',"").replace("inches", "").trim();
        width = Double.parseDouble(cleanValue);
      } catch (Exception e) {
        return; 
      }

      // Logic mapping to refDimensionGroupBuckets
      if (width < 14) {
        emit("Under 14");
      } else if (width >= 14 && width <= 22) {
        emit("14-22 Inches");
      } else if (width > 22 && width <= 24) {
        emit("22-24 Inches");
      } else if (width > 24) {
        emit("24 and up");
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
    transform: function (items) {
      return items
        .map((item) => ({
          ...item,
          label: refDimensionGroupBuckets[item.value],
        }))
        .sort((a, b) => {
          // 2. Sort based on the index in our desiredOrder array
          return (
            refDimensionGroupBucketKeys.indexOf(a.value) -
            refDimensionGroupBucketKeys.indexOf(b.value)
          );
        });
    },
    runtime_mapping: {
      ref_height: {
        type: "keyword",
        script: {
          source: `
      if (params['_source']['accentuate_data'] == null || 
          params['_source']['accentuate_data']['bbq.ref_specs_cutout_height'] == null) {
        return;
      }

      String rawValue = params['_source']['accentuate_data']['bbq.ref_specs_cutout_height'];
      
      double height = 0;
      try {
        // Remove "Inches" and whitespace to parse the number
        String cleanValue = rawValue.toLowerCase().replace('"',"").replace("inches", "").trim();
        height = Double.parseDouble(cleanValue);
      } catch (Exception e) {
        return; 
      }

      // Logic mapping to refDimensionGroupBuckets
      if (height < 14) {
        emit("Under 14");
      } else if (height >= 14 && height <= 22) {
        emit("14-22 Inches");
      } else if (height > 22 && height <= 24) {
        emit("22-24 Inches");
      } else if (height > 24) {
        emit("24 and up");
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
    label: "Lock",
    attribute: "ref_with_lock",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
      return items.sort((a, b) => {
        return yesNo.indexOf(a.value) - yesNo.indexOf(b.value);
      });
    },
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_with_lock",
      field: "accentuate_data.bbq.ref_specs_with_lock",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Outdoor Certification",
    attribute: "ref_outdoor_certification",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
      return items.map((item) => ({
        ...item,
        label: refOutdoorCertBuckets[item.value],
      }));
    },
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
    transform: function (items) {
      return items
        .map((item) => ({
          ...item,
          label: refDimensionGroupBuckets[item.value],
        }))
        .sort((a, b) => {
          // 2. Sort based on the index in our desiredOrder array
          return (
            refDimensionGroupBucketKeys.indexOf(a.value) -
            refDimensionGroupBucketKeys.indexOf(b.value)
          );
        });
    },
    runtime_mapping: {
      ref_depth: {
        type: "keyword",
        script: {
          source: `
      if (params['_source']['accentuate_data'] == null || 
          params['_source']['accentuate_data']['bbq.ref_specs_cutout_depth'] == null) {
        return;
      }

      String rawValue = params['_source']['accentuate_data']['bbq.ref_specs_cutout_depth'];
      
      double depth = 0;
      try {
        // Remove "Inches" and whitespace to parse the number
        String cleanValue = rawValue.toLowerCase().replace('"',"").replace("inches", "").trim();
        depth = Double.parseDouble(cleanValue);
      } catch (Exception e) {
        return; 
      }

      // Logic mapping to refDimensionGroupBuckets
      if (depth < 14) {
        emit("Under 14");
      } else if (depth >= 14 && depth <= 22) {
        emit("14-22 Inches");
      } else if (depth > 22 && depth <= 24) {
        emit("22-24 Inches");
      } else if (depth > 24) {
        emit("24 and up");
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
    label: "Ice Storage Capacity",
    attribute: "ref_ice_storage_capacity",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
      return items.map((item) => {
        return {
          ...item,
          label: `${item.value} lbs`,
        };
      });
    },
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_ice_storage_capacity",
      field: "accentuate_data.bbq.ref_specs_ice_storage_capacity",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Ice Cube Type",
    attribute: "ref_ice_cube_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      ref_ice_cube_type: {
        type: "keyword",
        script: {
          source: `
      def tagsList = params['_source']['tags'];
      def titleText = params['_source']['title'];

      def normalizedTitle = titleText != null ? titleText.toLowerCase() : "";

      boolean isClear = false;
      if (tagsList != null && tagsList.contains("Clear")) {
          isClear = true;
      } else if (normalizedTitle.contains("clear")) {
          isClear = true;
      }

      if (isClear) {
          emit("Clear");
          return;
      }

      boolean isCube = false;
      if (tagsList != null && tagsList.contains("Cube")) {
          isCube = true;
      } else if (normalizedTitle.contains("cube")) {
          isCube = true;
      }

      if (isCube) {
          emit("Cube");
          return;
      }

      boolean isGourmet = false;
      if (tagsList != null && tagsList.contains("Gourmet")) {
          isGourmet = true;
      } else if (normalizedTitle.contains("gourmet")) {
          isGourmet = true;
      }

      if (isGourmet) {
          emit("Gourmet");
          return;
      }
    `,
        },
      },
    },
    facet_attribute: {
      attribute: "ref_ice_cube_type",
      field: "ref_ice_cube_type",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Refrigerator Class",
    attribute: "ref_class",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      ref_class: {
        type: "keyword",
        script: {
          source: `
          def validClass = ${JSON.stringify(
            refClassBucketKeys.map((k) => k.toLowerCase()),
          )};
          if (params['_source']['tags'] != null) {
            for (def tag : params['_source']['tags']) {
              if (tag == null) continue;

              if (validClass.contains(tag.toLowerCase())) {
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
      attribute: "ref_class",
      field: "ref_class",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Ice Produced Daily", // #
    attribute: "ref_ice_daily_output",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      ref_ice_daily_output: {
        type: "keyword",
        script: {
          source: `
          def validDIO = ${JSON.stringify(
            refDailyIceBucketKeys.map((k) => k.toLowerCase()),
          )};
          if (params['_source']['tags'] != null) {
            for (def tag : params['_source']['tags']) {
              if (tag == null) continue;

              if (validDIO.contains(tag.toLowerCase())) {
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
      attribute: "ref_ice_daily_output",
      field: "ref_ice_daily_output",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Wine Bottle Capacity",
    attribute: "ref_wine_bottle_capacity",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      ref_wine_bottle_capacity: {
        type: "keyword",
        script: {
          source: `
      if (params['_source']['accentuate_data'] == null || 
          params['_source']['accentuate_data']['bbq.ref_specs_wine_bottle_capacity'] == null) {
        return;
      }

      String rawValue = params['_source']['accentuate_data']['bbq.ref_specs_wine_bottle_capacity'];
      
      double bottles = 0;
      try {
        String cleanValue = rawValue.toLowerCase().trim();
        bottles = Double.parseDouble(cleanValue);
      } catch (Exception e) {
        return; 
      }

      if (bottles >= 14 && bottles <= 23) {
        emit("14 - 23 Bottles");
      } else if (bottles > 23 && bottles <= 40) {
        emit("24 - 40 Bottles");
      } else if (bottles > 40 && bottles <= 54) {
        emit("41 - 54 Bottles");
      } else if (bottles >=55) {
        emit("55 Bottles And Up");
      }
    `,
        },
      },
    },
    facet_attribute: {
      attribute: "ref_wine_bottle_capacity",
      field: "ref_wine_bottle_capacity",
      type: "string",
    },
    collapse: false,
  },

  {
    label: "Ref Configuration", // #
    attribute: "ref_config",
    searchable: false,
    type: "RefinementList",
    collapse: false,
  },
  {
    label: "Drain Type", // #
    attribute: "ref_drain_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      ref_drain_type: {
        type: "keyword",
        script: {
          source: `
          def validDrainType = ${JSON.stringify(
            refDrainTypeBucketKeys.map((k) => k.toLowerCase()),
          )};
          if (params['_source']['tags'] != null) {
            for (def tag : params['_source']['tags']) {
              if (tag == null) continue;

              if (validDrainType.contains(tag.toLowerCase())) {
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
      attribute: "ref_drain_type",
      field: "ref_drain_type",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Number Of Zones", // #
    attribute: "ref_no_of_zones",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      ref_no_of_zones: {
        type: "keyword",
        script: {
          source: `
          def validNoOfZones = ${JSON.stringify(
            refNoOfZonesBucketKeys.map((k) => k.toLowerCase()),
          )};
          if (params['_source']['tags'] != null) {
            for (def tag : params['_source']['tags']) {
              if (tag == null) continue;

              if (validNoOfZones.contains(tag.toLowerCase())) {
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
      attribute: "ref_no_of_zones",
      field: "ref_no_of_zones",
      type: "string",
    },
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

/**
 * filter_types
 * Defines the inclusion and display order of filter facets.
 * NOTE: The array order is strictly preserved; facets will appear on
 * the UI in the exact sequence defined below.
 */
export const filter_types = {
  "compact-refrigerators": [
    "ways_to_shop",
    "brands",
    "capacity",
    "ref_glass_door",
    "ref_door_type",
    "ref_vent",
    "price_groups",
    "price",
    "ref_width",
    "ref_height",
    "material",
    "ref_mounting_type",
    "ref_with_lock",
    "ref_outdoor_certification",
    "ref_hinge",
    "ref_depth",
  ],
  "outdoor-beverage-refrigerators": [
    "ways_to_shop",
    "brands",
    "ref_glass_door",
    "capacity",
    "ref_class",
    "ref_with_lock",
    "price_groups",
    "price",
    "ref_width",
    "ref_height",
    "ref_depth",
    "ref_hinge",
    "ref_outdoor_certification",
    "ref_vent",
  ],
  "outdoor-ice-makers": [
    "ways_to_shop",
    "brands",
    "ref_ice_cube_type",
    "ref_drain_type",
    "ref_ice_storage_capacity",
    "ref_ice_daily_output",
    "ref_mounting_type",
    "price_groups",
    "price",
    "ref_width",
    "ref_height",
    "ref_outdoor_certification",
    "ref_hinge",
    "ref_depth",
  ],
  "outdoor-wine-coolers": [
    "ref_mounting_type",
    "brands",
    "ref_wine_bottle_capacity",
    "ref_no_of_zones",
    "ref_glass_door",
    "ref_class",
    "price_groups",
    "price",
    "ref_with_lock",
    "ref_width",
    "ref_depth",
    "ref_height",
  ],
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

// NOTE: FOR THIS TO WORK PROPERLY MAKE SURE PROPERY AND VALUE ARE ADDED PROPERLY BASED ON THE OPTIONS SET BELOW AND IS CASE SENSITIVE
// A. added accentuate properties:
// 1. bbq.ref_specs_is_glass_door [Yes|No]
// -> assigned this props to 2 products only. might need reindexing after product update
// 2. bbq.ref_specs_with_lock [Yes|No]
// 3. bbq.ref_specs_ice_storage_capacity [Number] in lbs ex. 22
// 4. bbq.ref_specs_ice_produced_daily [Number] in lbs ex. 22
// 5. bbq.ref_specs_ice_type [Clear|Cresent|Cube|Gourmet|Nugget/Sonic] in lbs
// 6. bbq.ref_specs_door_type [Door|Door & Drawer|Drawer]
// 7. bbq.ref_specs_wine_bottle_capacity [Number] in bottles ex. 18
// 8. bbq.ref_specs_class [Luxury|Premium|Standard]

// B. Added tags for filtering results
// 1. "New Arrivals" => add "New Arrival" tag for a product you want to be filtered under "Ways to shop - New Arrivals".
// 2. "Free Shipping" => add "Free Shipping" tag for a product you want to be filtered under "Ways to shop - Free Shipping".
