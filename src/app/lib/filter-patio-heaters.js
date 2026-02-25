const yesNo = ["Yes", "No"]; // used for transform sort

const formatSimpleSize = (value) => {
  return value ? decimalToFraction(value) + " Inches": "";
};

function formatValueToNumber(items) {
  return items.map((item) => ({
    ...item,
    label: Number(item.value),
  }));
}


export const patioHeaterFilters = [
  {
    label: "Fuel Type",
    attribute: "heater_fuel_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      heater_fuel_type: {
        type: "keyword",
        script: {
          source: `
            def data = params['_source']['accentuate_data'];
            if (data != null && data['bbq.heater_specs_fuel_type'] != null) {
              def val = data['bbq.heater_specs_fuel_type'];
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
      attribute: "heater_fuel_type",
      field: "heater_fuel_type",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.heater_specs_fuel_type",
    cluster: "patio heaters",
  },
  {
    label: "Style",
    attribute: "heater_mount_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      heater_mount_type: {
        type: "keyword",
        script: {
          source: `
            def data = params['_source']['accentuate_data'];
            if (data != null && data['bbq.heater_specs_mount_type'] != null) {
              def val = data['bbq.heater_specs_mount_type'];
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
      attribute: "heater_mount_type",
      field: "heater_mount_type",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.heater_specs_mount_type",
    cluster: "patio heaters",
  },
  {
    label: "Series",
    attribute: "heater_series",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "heater_series",
      field: "accentuate_data.bbq.heater_specs_series",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.heater_specs_series",
    cluster: "patio heaters",
  },
  {
    label: "Decor",
    attribute: "heater_decor",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "heater_decor",
      field: "accentuate_data.bbq.heater_specs_plate_style",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.heater_specs_plate_style",
    cluster: "patio heaters",
  },
  {
    label: "Finish",
    attribute: "heater_finish",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "heater_finish",
      field: "accentuate_data.bbq.heater_specs_finish",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.heater_specs_finish",
    cluster: "patio heaters",
  },
  {
    label: "Watts",
    attribute: "heater_watts",
    searchable: false,
    type: "RefinementList",
    transform:formatValueToNumber,
    runtime_mapping: null,
    facet_attribute: {
      attribute: "heater_watts",
      field: "accentuate_data.bbq.heater_specs_watts",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.heater_specs_watts",
    cluster: "patio heaters",
  },
  {
    label: "Grade",
    attribute: "heater_grade",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      heater_grade: {
        type: "keyword",
        script: {
          source: `
            def data = params['_source']['accentuate_data'];
            if (data != null && data['bbq.heater_specs_grade'] != null) {
              def val = data['bbq.heater_specs_grade'];
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
      attribute: "heater_grade",
      field: "heater_grade",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.heater_specs_grade",
    cluster: "patio heaters",
  },
  {
    label: "Marine Grade",
    attribute: "heater_marine_grade",
    searchable: false,
    type: "RefinementList",
    transform: function (items){
      const sortKeys = ["Yes", "No"];
      return items
        .sort((a, b) => {
          return (
            sortKeys.indexOf(a.value) - sortKeys.indexOf(b.value)
          );
        });
    },
    runtime_mapping: null,
    facet_attribute: {
      attribute: "heater_marine_grade",
      field: "accentuate_data.bbq.heater_specs_marine_grade",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.heater_specs_marine_grade",
    cluster: "patio heaters",
  },
  {
    label: "Features",
    attribute: "heater_features",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      heater_features: {
        type: "keyword",
        script: {
          source: `
            def data = params['_source']['accentuate_data'];
            if (data != null && data['bbq.heater_specs_features'] != null) {
              def val = data['bbq.heater_specs_features'];
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
      attribute: "heater_features",
      field: "heater_features",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.heater_specs_features",
    cluster: "patio heaters",
  },
  {
    label: "BTU",
    attribute: "heater_btu",
    searchable: false,
    type: "RefinementList",
    transform:function (items){
      return items.map(function(item){
        return {
          ...item,
          label: Number(item.value),
        }
      })
    },
    // transform:function (items){
    //   return items.map(function(item){
    //     return {
    //       ...item,
    //       label: Math.round(item.value).toLocaleString('en-US')
    //     }
    //   })
    // },
    runtime_mapping: null,
    facet_attribute: {
      attribute: "heater_btu",
      field: "accentuate_data.bbq.heater_specs_btu",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.heater_specs_btu",
    cluster: "patio heaters",
  },
  {
    label: "Heat Area",
    attribute: "heater_heat_area",
    searchable: false,
    type: "RefinementList",
    transform:function (items){
      return items.map(function(item){
        return {
          ...item,
          label: Math.round(item.value).toLocaleString('en-US') + " Sq. Ft."
        }
      })
    },
    runtime_mapping: null,
    facet_attribute: {
      attribute: "heater_heat_area",
      field: "accentuate_data.bbq.heater_specs_btu",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.heater_specs_btu",
    cluster: "patio heaters",
  },
  {
    label: "Voltage",
    attribute: "heater_voltage",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "heater_voltage",
      field: "accentuate_data.bbq.heater_specs_volts",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.heater_specs_volts",
    cluster: "patio heaters",
  },
  {
    label: "Size",
    attribute: "heater_size",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "heater_size",
      field: "accentuate_data.bbq.heater_specs_size",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.heater_specs_size",
    cluster: "patio heaters",
  },
  {
    label: "Type",
    attribute: "heater_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "heater_type",
      field: "accentuate_data.bbq.heater_specs_type",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.heater_specs_type",
    cluster: "patio heaters",
  },
  {
    label: "Elements",
    attribute: "heater_elements",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "heater_elements",
      field: "accentuate_data.bbq.heater_specs_elements",
      type: "string",
    },
    collapse: false,
    accentuate_prop: "bbq.heater_specs_elements",
    cluster: "patio heaters",
  },
  
];


export const patioHeatersFilterTypes = {
  "patio-heaters": [
    "ways_to_shop",
    "heater_fuel_type",
    "heater_mount_type",
    "heater_series",
    "heater_decor",
    "heater_finish",
    "heater_watts",
    "heater_grade",
    "heater_marine_grade",
    "heater_features",
    "heater_btu",
    "heater_heat_area",
    "heater_voltage",
    "heater_size",
    "heater_type",
    "heater_elements",
    "brands",
    "price_groups",
    "price",
  ],
};

// console.log("patioHeaterFilters", patioHeaterFilters.map(item=> ({label: item.label, attribute: item.attribute, property: item.facet_attribute.field})))