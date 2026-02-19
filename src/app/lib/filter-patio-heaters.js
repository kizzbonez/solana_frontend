import {
  // Bucket keys
  capacityBucketKeys,
  refDailyIceBucketKeys,
  refDimensionGroupBucketKeys,
  // Buckets
  capacityBuckets,
  refDimensionGroupBuckets,
  refOutdoorCertBuckets,
} from "@/app/lib/helpers";


const yesNo = ["Yes", "No"]; // used for transform sort

export const patioHeaterFilters = [
  {
    label:"Installation Type",
    attribute: "frplc_mount_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_mount_type",
      field: "accentuate_data.bbq.frplc_spec_mount_type",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Fuel Type",
    attribute: "frplc_fuel_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:{
      fuel_type_split: {
        type: "keyword",
        script: {
          source: `
            def data = params['_source']['accentuate_data'];
            if (data != null && data['bbq.frplc_spec_fuel_type'] != null) {
              def val = data['bbq.frplc_spec_fuel_type'];
              if (val != null) {
                if (val instanceof String && val.contains('/')) {
                  // Split the string and emit each piece as an individual token
                  String[] parts = /\\//.split(val);
                  for (String part : parts) {
                    emit(part.trim());
                  }
                } else {
                  // It's already a single value or an array, just emit it
                  emit(val.toString());
                }
              }
            }
          `,
        },
      },
    },
    facet_attribute:{
      attribute:"frplc_fuel_type",
      field: "fuel_type_split",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Vent Type",
    attribute: "frplc_vent_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_vent_type",
      field: "accentuate_data.bbq.frplc_spec_vent_type",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Fireplace Type",
    attribute: "frplc_view_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_view_type",
      field: "accentuate_data.bbq.frplc_spec_view_type",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Firebox Width",
    attribute: "frplc_firebox_width",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_firebox_width",
      field: "accentuate_data.bbq.frplc_spec_firebox_width",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Adjustable Thermostat",
    attribute: "frplc_adj_thermostat",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_adj_thermostat",
      field: "accentuate_data.bbq.frplc_spec_adj_thermostat",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Fireplace Style",
    attribute: "frplc_style",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_style",
      field: "accentuate_data.bbq.frplc_spec_style",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Finish",
    attribute: "frplc_finish",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_finish",
      field: "accentuate_data.bbq.frplc_spec_finish",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Viewing Area",
    attribute: "frplc_view_area",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_view_area",
      field: "accentuate_data.bbq.frplc_spec_view_area",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Ember Bed Depth",
    attribute: "frplc_ember_bed_depth",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_ember_bed_depth",
      field: "accentuate_data.bbq.frplc_spec_ember_bed_depth",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Framing Dimension",
    attribute: "frplc_frame_dimension",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_frame_dimension",
      field: "accentuate_data.bbq.frplc_spec_frame_dimension",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Surround Dimension",
    attribute: "frplc_sur_dimension",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_sur_dimension",
      field: "accentuate_data.bbq.frplc_spec_sur_dimension",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Surround Width Range",
    attribute: "frplc_style",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_style",
      field: "accentuate_data.bbq.frplc_spec_sur_wid_range",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Size Range",
    attribute: "frplc_size_range",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:{
      frplc_size_range: {
        type: "keyword",
        script: {
          source: `
          if (params['_source']['accentuate_data'] == null || 
              params['_source']['accentuate_data']['bbq.frplc_spec_size'] == null) {
            return;
          }
    
          String rawValue = params['_source']['accentuate_data']['bbq.frplc_spec_size'];
          
          double width = 0;
          try {
            // Remove "Inches" and whitespace to parse the number
            String cleanValue = rawValue.toLowerCase().replace('"',"").replace("inches", "").trim();
            width = Double.parseDouble(cleanValue);
          } catch (Exception e) {
            return; 
          }
    
          // Logic mapping to refDimensionGroupBuckets
          if (width < 30) {
            emit("0 - 29 Inches");
          } else if (width >= 30 && width <= 39) {
            emit("30 - 39 Inches");
          } else if (width >= 40 && width <= 49) {
            emit("40 - 49 Inches");
          } else if (width >= 50 && width <= 59) {
            emit("50 - 59 Inches");
          } else if (width >= 60 && width <= 69) {
            emit("60 - 69 Inches");
          } else if (width >= 70 && width <= 79) {
            emit("70 - 79 Inches");
          } else if (width > 80) {
            emit("80 Inches And Up");
          }
        `,
        },
      },
    },
    facet_attribute:{
      attribute:"frplc_size_range",
      field: "frplc_size_range",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Heating Area",
    attribute: "frplc_style",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_style",
      field: "accentuate_data.bbq.frplc_spec_heat_area",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Item Type",
    attribute: "frplc_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_type",
      field: "accentuate_data.bbq.frplc_spec_type",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Color",
    attribute: "frplc_color",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_color",
      field: "accentuate_data.bbq.frplc_spec_color",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Material",
    attribute: "frplc_material",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_material",
      field: "accentuate_data.bbq.frplc_spec_material",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Line Location",
    attribute: "frplc_line_loc",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_line_loc",
      field: "accentuate_data.bbq.frplc_spec_line_loc",
      type: "string"
    },
    collapse: false,
  },
  {
    label:"Recess Option",
    attribute: "frplc_recess_option",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_recess_option",
      field: "accentuate_data.bbq.frplc_spec_recess_option",
      type: "string"
    },
    collapse: false,
  },
  // bbq.frplc_spec_model
  {
    label:"Collection",
    attribute: "frplc_model",
    searchable: false,
    type: "RefinementList",
    runtime_mapping:null,
    facet_attribute:{
      attribute:"frplc_model",
      field: "accentuate_data.bbq.frplc_spec_model",
      type: "string"
    },
    collapse: false,
  }
];


export const patioHeatersFilterTypes = {
  "patio-heaters": [
    "ways_to_shop",
    "brands",
    "price_groups",
    "price",
  ],
};

console.log("patioHeaterFilters", patioHeaterFilters.map(item=> ({label: item.label, attribute: item.attribute, property: item.facet_attribute.field})))