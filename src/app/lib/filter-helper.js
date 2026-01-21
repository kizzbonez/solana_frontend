import {
  depthBuckets,
  heightBuckets,
  sizeBuckets,
  widthBuckets,
  capacityBuckets,
  formatToInches,
} from "@/app/lib/helpers";

// used in ProductsSection Component
export const filters = [
  {
    label: "Ways to Shop",
    attribute: "ways_to_shop",
    searchable: false,
    type: "RefinementList",
    filter_type: ["Search", "refrigerators", "storage"],
  },
  {
    label: "Ratings",
    attribute: "ratings",
    searchable: false,
    type: "RefinementList",
    filter_type: ["Search", "refrigerators", "storage"],
  },
  {
    label: "brand",
    attribute: "brand",
    searchable: false,
    type: "RefinementList",
    filter_type: [
      "grills",
      "fireplaces",
      "firepits",
      "refrigerators",
      "patio-heaters",
      "storage",
      "open-box",
      "Search",
    ],
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
    label: "collections",
    attribute: "collections",
    searchable: false,
    type: "RefinementList",
    filter_type: ["open-box", "Search"],
  },
  {
    label: "configuration",
    attribute: "configuration_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills"],
  },
  {
    label: "number of burners",
    attribute: "no_of_burners",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills"],
  },
  {
    label: "price",
    attribute: "price",
    searchable: false,
    type: "RangeInput",
    filter_type: [
      "grills",
      "fireplaces",
      "firepits",
      "refrigerators",
      "patio-heaters",
      "storage",
      "open-box",
      "Search",
    ],
  },
  {
    label: "lights",
    attribute: "grill_lights",
    searchable: false,
    type: "RefinementList",
    filter_type: ["grills"],
  },
  //   { // used Category Instead
  //     label: "Type",
  //     attribute: "ref_type",
  //     searchable: false,
  //     type: "RefinementList",
  //     filter_type: ["refrigerators"],
  //   },
  {
    label: "Door Type",
    attribute: "ref_door_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators"],
  },
  {
    label: "capacity",
    attribute: "capacity",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators"],
    transform: function (items) {
      return items.map((item) => ({
        ...item,
        label: capacityBuckets[item.value],
      }));
    },
  },
  {
    label: "Vent",
    attribute: "ref_vent",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators"],
  },
  {
    label: "Hinge",
    attribute: "ref_hinge",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators"],
  },
  {
    label: "Storage Type",
    attribute: "ref_storage_type",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators"],
  },
  {
    label: "Width",
    attribute: "ref_width",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators"],
    transform: formatToInches,
  },
  {
    label: "Depth",
    attribute: "ref_depth",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators"],
    transform: formatToInches,
  },
  {
    label: "Height",
    attribute: "ref_height",
    searchable: false,
    type: "RefinementList",
    filter_type: ["refrigerators"],
    transform: formatToInches,
  },
  {
    label: "size",
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
    label: "width",
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
    label: "depth",
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
    label: "height",
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
    filter_type: ["grills", "refrigerators", "storage"],
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
