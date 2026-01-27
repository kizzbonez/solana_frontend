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

// used in ProductsSection Component
export const filters = [
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
      { type: "compact-refrigerators", order: 3, hide: false },
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
    label: "Door Type",
    attribute: "ref_door_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    collapse: false,
  },
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
    collapse: false,
  },
  {
    label: "Mount Type",
    attribute: "ref_mounting_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    collapse: false,
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
    label: "Vent",
    attribute: "ref_vent",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    collapse: false,
  },
  {
    label: "Hinge",
    attribute: "ref_hinge",
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
    label: "Width",
    attribute: "ref_width",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    transform: formatToInches,
  },
  {
    label: "Depth",
    attribute: "ref_depth",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    transform: formatToInches,
  },
  {
    label: "Height",
    attribute: "ref_height",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators", "compact-refrigerators"],
    transform: formatToInches,
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

export const getFacetAttributesByFilterType = (type) => {
  const targetFilter = filters.filter((f) =>
    f.filter_config?.some((config) => config.type === type),
  );

  return targetFilter ?? null;
};

console.log(
  "facetAttributes[compact-refrigerators]",
  getFacetAttributesByFilterType("compact-refrigerators"),
);

export const getRuntimeMappingsByFilterType = (type) => {};

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
