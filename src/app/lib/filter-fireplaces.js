import { decimalToFraction } from "@/app/lib/helpers";

const yesNo = ["Yes", "No"]; // used for transform sort

const formatSimpleSize = (value) => {
  return decimalToFraction(value) + " Inches";
};

function formatSimpleSizeFilter(items) {
  return items.map((item) => ({
    ...item,
    label: decimalToFraction(item.value) + " Inches",
  }));
}

function formatHeatingAreaFilter(items) {
  return items.map((item) => ({
    ...item,
    label: decimalToFraction(item.value) + " Sq. Ft.",
  }));
}

export const fireplacesFilters = [
  {
    label: "Installation Type",
    attribute: "frplc_mount_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      frplc_mount_type: {
        type: "keyword",
        script: {
          source: `
            def data = params['_source']['accentuate_data'];
            if (data != null && data['bbq.frplc_spec_mount_type'] != null) {
              def val = data['bbq.frplc_spec_mount_type'];
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
    facet_attribute: {
      attribute: "frplc_mount_type",
      field: "frplc_mount_type",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_mount_type",
    cluster: "fireplaces",
  },
  {
    label: "Fuel Type",
    attribute: "frplc_fuel_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
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
    facet_attribute: {
      attribute: "frplc_fuel_type",
      field: "fuel_type_split",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_fuel_type",
    cluster: "fireplaces",
  },
  {
    label: "Vent Type",
    attribute: "frplc_vent_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "frplc_vent_type",
      field: "accentuate_data.bbq.frplc_spec_vent_type",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_vent_type",
    cluster: "fireplaces",
  },
  {
    label: "Fireplace Type",
    attribute: "frplc_view_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      frplc_view_type: {
        type: "keyword",
        script: {
          source: `
            def data = params['_source']['accentuate_data'];
            if (data != null && data['bbq.frplc_spec_view_type'] != null) {
              def val = data['bbq.frplc_spec_view_type'];
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
    facet_attribute: {
      attribute: "frplc_view_type",
      field: "frplc_view_type",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_view_type",
    cluster: "fireplaces",
  },
  {
    label: "Firebox Width",
    attribute: "frplc_firebox_width",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    transformSpecs: formatSimpleSize,
    transform: formatSimpleSizeFilter,
    facet_attribute: {
      attribute: "frplc_firebox_width",
      field: "accentuate_data.bbq.frplc_spec_firebox_width",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_firebox_width",
    cluster: "fireplaces",
  },
  {
    label: "Adjustable Thermostat",
    attribute: "frplc_adj_thermostat",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "frplc_adj_thermostat",
      field: "accentuate_data.bbq.frplc_spec_adj_thermostat",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_adj_thermostat",
    cluster: "fireplaces",
  },
  {
    label: "Fireplace Style",
    attribute: "frplc_style",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "frplc_style",
      field: "accentuate_data.bbq.frplc_spec_style",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_style",
    cluster: "fireplaces",
  },
  {
    label: "Finish",
    attribute: "frplc_color",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "frplc_color",
      field: "accentuate_data.bbq.frplc_spec_color",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_color",
    cluster: "fireplaces",
  },
  {
    label: "Viewing Area",
    attribute: "frplc_view_area",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "frplc_view_area",
      field: "accentuate_data.bbq.frplc_spec_view_area",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_view_area",
    cluster: "fireplaces",
  },
  {
    label: "Ember Bed Depth",
    attribute: "frplc_ember_bed_depth",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    transformSpecs: formatSimpleSize,
    transform: formatSimpleSizeFilter,
    facet_attribute: {
      attribute: "frplc_ember_bed_depth",
      field: "accentuate_data.bbq.frplc_spec_ember_bed_depth",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_ember_bed_depth",
    cluster: "fireplaces",
  },
  {
    label: "Framing Dimension",
    attribute: "frplc_frame_dimension",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "frplc_frame_dimension",
      field: "accentuate_data.bbq.frplc_spec_frame_dimension",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_frame_dimension",
    cluster: "fireplaces",
  },
  {
    label: "Surround Dimension",
    attribute: "frplc_sur_dimension",
    searchable: false,
    type: "RefinementList",
    transformSpecs: formatSimpleSize,
    transform: formatSimpleSizeFilter,
    runtime_mapping: null,
    facet_attribute: {
      attribute: "frplc_sur_dimension",
      field: "accentuate_data.bbq.frplc_spec_sur_dimension",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_sur_dimension",
    cluster: "fireplaces",
  },
  {
    label: "Surround Width Range",
    attribute: "frplc_sur_width_range",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      frplc_sur_width_range: {
        type: "keyword",
        script: {
          source: `
        def data = params['_source']['accentuate_data'];
        if (data == null) return;
        
        // Use .get() to handle keys with dots safely
        def rawValue = data.get('bbq.frplc_spec_sur_dimension');
        if (rawValue == null) return;

        try {
          // Ensure we are working with a string
          String strValue = rawValue.toString();
          String cleanValue = /[^0-9.]/.matcher(strValue).replaceAll("");
          
          if (cleanValue.length() == 0) return;

          double sur_width = Double.parseDouble(cleanValue);

          if (sur_width <= 30) {
            emit("0 - 30 Inches");
          } else if (sur_width <= 40) {
            emit("30 - 40 Inches");
          } else if (sur_width < 50) {
            emit("40 - 50 Inches");
          } else if (sur_width < 60) {
            emit("50 - 60 Inches");
          } else if (sur_width < 70) {
            emit("60 - 70 Inches");
          } else if (sur_width < 80) {
            emit("70 - 80 Inches");
          } else {
            emit("80 Inches And Up");
          }
        } catch (Exception e) {
          // Optional: emit("DEBUG: " + e.getMessage()); 
          return;
        }
      `,
        },
      },
    },
    facet_attribute: {
      attribute: "frplc_sur_width_range",
      field: "frplc_sur_width_range",
      type: "string",
    },
    collapse: false,
    // accentuate_prop: "bbq.frplc_spec_sur_wid_range",
    cluster: "fireplaces",
  },
  {
    label: "Size",
    attribute: "frplc_size",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    transformSpecs: formatSimpleSize,
    facet_attribute: {
      attribute: "frplc_size",
      field: "accentuate_data.bbq.frplc_spec_size",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_size",
    cluster: "fireplaces",
  },
  {
    label: "Size Range",
    attribute: "frplc_size_range",
    searchable: false,
    type: "RefinementList",
    transform: function(items){
      const sortKeys = [
        "0 - 30 Inches",
        "30 - 40 Inches",
        "40 - 50 Inches",
        "50 - 60 Inches",
        "60 - 70 Inches",
        "70 - 80 Inches",
        "80 Inches And Up",
      ];
      return items
        .sort((a, b) => {
          return (
            sortKeys.indexOf(a.value) - sortKeys.indexOf(b.value)
          );
        });
    },
    runtime_mapping: {
      frplc_size_range: {
        type: "keyword",
        script: {
          source: `
            // 1. Safely grab the data. Using _source is okay for nested Accentuate data, 
            // but we must check every level.
            def data = params['_source']['accentuate_data'];
            if (data == null || !(data instanceof Map)) return;
            
            def rawValue = data.get('bbq.frplc_spec_size');
            if (rawValue == null) return;
            
            double width = 0;
            try {
              // 2. Force to string first to handle both Numbers and Strings safely
              String strValue = rawValue.toString().toLowerCase();
              String cleanValue = strValue.replace('"', "").replace("inches", "").trim();
              width = Double.parseDouble(cleanValue);
            } catch (Exception e) {
              return; // Skip documents with unparseable values
            }
      
            // 3. Logic mapping (ensure no gaps)
            if (width <= 30) {
              emit("0 - 30 Inches");
            } else if (width <= 40) {
              emit("30 - 40 Inches");
            } else if (width <= 50) {
              emit("40 - 50 Inches");
            } else if (width <= 60) {
              emit("50 - 60 Inches");
            } else if (width <= 70) {
              emit("60 - 70 Inches");
            } else if (width <= 80) {
              emit("70 - 80 Inches");
            } else {
              emit("80 Inches And Up");
            }
          `,
        },
      },
    },
    facet_attribute: {
      attribute: "frplc_size_range",
      field: "frplc_size_range",
      type: "string",
    },
    collapse: false,
    // accentuate_prop:"bbq.frplc_spec_size",
    cluster: "fireplaces",
  },
  {
    label: "BTUs",
    attribute: "frplc_btus",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    transform: function (items) {
      return items.map((item) => {
        return {
          ...item,
          label: Number(item.value),
        };
      });
    },
    runtime_mapping: {
      frplc_btus: {
        type: "keyword",
        script: {
          source: `
            def data = params['_source']['accentuate_data'];
            if (data != null && data['bbq.frplc_spec_btus'] != null) {
              def val = data['bbq.frplc_spec_btus'];
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
    facet_attribute: {
      attribute: "frplc_btus",
      field: "frplc_btus",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_btus",
    cluster: "fireplaces",
  },
  {
    label: "BTU Range",
    attribute: "frplc_btu_range",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      frplc_btu_range: {
        type: "keyword",
        script: {
          source: `
        def data = params['_source']['accentuate_data'];
        if (data == null) return;
        
        // Use .get() to handle keys with dots safely
        def rawValue = data.get('bbq.frplc_spec_btus');
        if (rawValue == null) return;

        try {
          // Ensure we are working with a string
          String strValue = rawValue.toString();
          String cleanValue = /[^0-9.]/.matcher(strValue).replaceAll("");
          
          if (cleanValue.length() == 0) return;

          double btus = Double.parseDouble(cleanValue);

          if (btus < 40000) {
            emit("30,000 - 40,000");
          } else if (btus < 60000) {
            emit("50,000 - 60,000");
          } else if (btus < 80000) {
            emit("70,000 - 80,000");
          } else {
            emit("80,000 And Up");
          }
        } catch (Exception e) {
          // Optional: emit("DEBUG: " + e.getMessage()); 
          return;
        }
      `,
        },
      },
    },
    facet_attribute: {
      attribute: "frplc_btu_range",
      field: "frplc_btu_range",
      type: "string",
    },
    collapse: false,
    // accentuate_prop:"bbq.frplc_spec_btus",
    cluster: "fireplaces",
  },
  {
    label: "Heating Area",
    attribute: "frplc_heating_area",
    searchable: false,
    type: "RefinementList",
    transformSpecs: function (value) {
      return value + " Sq. Ft.";
    },
    transform: formatHeatingAreaFilter,
    runtime_mapping: null,
    facet_attribute: {
      attribute: "frplc_heating_area",
      field: "accentuate_data.bbq.frplc_spec_heat_area",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_heat_area",
    cluster: "fireplaces",
  },
  {
    label: "Item Type",
    attribute: "frplc_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "frplc_type",
      field: "accentuate_data.bbq.frplc_spec_type",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_type",
    cluster: "fireplaces",
  },
  {
    label: "Color",
    attribute: "frplc_color",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "frplc_color",
      field: "accentuate_data.bbq.frplc_spec_color",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_color",
    cluster: "fireplaces",
  },
  {
    label: "Material",
    attribute: "frplc_material",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "frplc_material",
      field: "accentuate_data.bbq.frplc_spec_material",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_material",
    cluster: "fireplaces",
  },
  {
    label: "Line Location",
    attribute: "frplc_line_loc",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "frplc_line_loc",
      field: "accentuate_data.bbq.frplc_spec_line_loc",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_line_loc",
    cluster: "fireplaces",
  },
  {
    label: "Recess Option",
    attribute: "frplc_recess_option",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "frplc_recess_option",
      field: "accentuate_data.bbq.frplc_spec_recess_option",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_recess_option",
    cluster: "fireplaces",
  },
  // bbq.frplc_spec_model
  {
    label: "Collection",
    attribute: "frplc_model",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "frplc_model",
      field: "accentuate_data.bbq.frplc_spec_model",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_model",
    cluster: "fireplaces",
  },
  {
    label: "Voltage",
    attribute: "frplc_voltage",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      frplc_voltage: {
        type: "keyword",
        script: {
          source: `
            def data = params['_source']['accentuate_data'];
            if (data != null && data['bbq.frplc_spec_voltage'] != null) {
              def val = data['bbq.frplc_spec_voltage'];
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
    facet_attribute: {
      attribute: "frplc_voltage",
      field: "frplc_voltage",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.frplc_spec_voltage",
    cluster: "fireplaces",
  },
];


const commonFilters = [
    "ways_to_shop",
    "frplc_type",
    "frplc_mount_type",
    "frplc_fuel_type",
    "frplc_vent_type",
    "frplc_view_type",
    "frplc_firebox_width",
    "price_groups",
    "price",
    "frplc_adj_thermostat",
    "brands",
    "frplc_style",
    "frplc_color",
    "frplc_view_area",
    "frplc_ember_bed_depth",
    "frplc_frame_dimension",
    "frplc_sur_dimension",
    "frplc_sur_width_range",
    // "frplc_sur_wid_range",
    // "frplc_line_loc",
    // "frplc_recess_option",
    // "frplc_model",
    // "frplc_material",
  ];

export const fireplacesFilterTypes = {
  fireplaces: commonFilters,
  "gas-fireplaces": [
    "ways_to_shop",
    "frplc_type",
    "frplc_view_type",
    "frplc_mount_type",
    "brands",
    "price_groups",
    "price",
    "frplc_firebox_width",
    "frplc_model",
    "frplc_btu_range",
    "frplc_btus",
    "frplc_style",
    "frplc_color",
    // surround range
    "frplc_sur_width_range",
    "frplc_vent_type",
  ],
  "electric-fireplaces": [
    "ways_to_shop",
    "frplc_mount_type",
    "frplc_size_range",
    "frplc_heating_area",
    // "frplc_type",
    // "frplc_btus",
    "frplc_voltage",
    "brands",
    "price_groups",
    "price",
  ],
  "shop-all-fireplaces": commonFilters
};

// console.log("fireplacesFilters", fireplacesFilters.map(item=> ({label: item.label, attribute: item.attribute, property: item.facet_attribute.field})))
