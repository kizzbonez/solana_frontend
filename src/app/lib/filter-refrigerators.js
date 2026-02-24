import {
  // Bucket keys
  capacityBucketKeys,
  refDailyIceBucketKeys,
  refDimensionGroupBucketKeys,
  // Buckets
  capacityBuckets,
  refDimensionGroupBuckets,
  refOutdoorCertBuckets,
  decimalToFraction
} from "@/app/lib/helpers";


const yesNo = ["Yes", "No"]; // used for transform sort
export const tmpBuckets = {
  "Under $500": { gte: 0, lt: 500 },
  "$500 - $1,000": { gte: 500, lt: 1000 },
  "$1,000 - $1,500": { gte: 1000, lt: 1500 },
  "$1,500 - $2,000": { gte: 1500, lt: 2000 },
  "$2,000 - $2,500": { gte: 2000, lt: 2500 },
  "$2,500 - $5,000": { gte: 2500, lt: 5000 },
  "5000 And Up": { gte: 5000 },
};

export const refFilters = [
  {
    label: "Commercial",
    attribute: "ref_is_commercial",
    accentuate_prop :"bbq.ref_specs_is_commercial",
    searchable: false,
    type: "RefinementList",
    transform: null,
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_is_commercial",
      field: "accentuate_data.bbq.ref_specs_is_commercial",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Color",
    attribute: "ref_color",
    accentuate_prop :"bbq.ref_specs_color",
    searchable: false,
    type: "RefinementList",
    transform: null,
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_color",
      field: "accentuate_data.bbq.ref_specs_color",
      type: "string",
    },
    collapse: true,
    cluster:"refrigerators"
  },
  {
    label: "Refrigerator Class",
    attribute: "ref_class",
    accentuate_prop: "bbq.ref_specs_class",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_class",
      field: "accentuate_data.bbq.ref_specs_class",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Cutout Depth",
    attribute: "ref_depth",
    accentuate_prop: "bbq.ref_specs_cutout_depth",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
      return items
        .map((item) => {
          const match = item.value.match(/[0-9]*\.?[0-9]+/);
          const decimal = match ? parseFloat(match[0]) : "";
          const fraction = decimalToFraction(decimal);
            return{
              ...item,
              label: `${fraction} Inches`,
            }
        })
    },
    runtime_mapping:null,
    facet_attribute: {
      attribute: "ref_depth",
      field: "accentuate_data.bbq.ref_specs_cutout_depth",
      type: "string",
    },
    cluster:"refrigerators"
  },
  {
    label: "Cutout Depth",
    attribute: "ref_depth_group_1",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
        const sortKeys = [
          "Under 14 Inches",
          "14 Inches - 22 Inches",
          "22 Inches - 24 Inches",
          "24 Inches And Up"
        ]     
      return items
        .sort((a, b) => {
          // 2. Sort based on the index in our desiredOrder array
          return (
            sortKeys.indexOf(a.value) -
            sortKeys.indexOf(b.value)
          );
        });
    },
    runtime_mapping: {
      ref_depth_group_1: {
        type: "keyword",
        script: {
          source: `
          // 1. Check for null at the top level
if (params['_source']['accentuate_data'] == null) return;

def rawValue = params['_source']['accentuate_data']['bbq.ref_specs_cutout_depth'];

// 2. Check for null or empty string
if (rawValue == null || rawValue.toString().trim().isEmpty()) return;

double depth;
try {
    // 3. Manual cleaning (No Regex)
    String str = rawValue.toString().toLowerCase()
                 .replace('"', '')
                 .replace('inches', '')
                 .replace('in', '')
                 .trim();
    
    // 4. Final check: if after cleaning it's empty, stop
    if (str.isEmpty()) return;
    
    depth = Double.parseDouble(str);
} catch (Exception e) {
    // This catches cases like "N/A" or "TBD"
    return; 
}

// 5. Logic mapping (Clean Waterfall)
if (depth < 14) {
    emit("Under 14 Inches");
} else if (depth <= 22) {
    emit("14 Inches - 22 Inches");
} else if (depth <= 24) {
    emit("22 Inches - 24 Inches");
} else {
    emit("24 Inches And Up");
}
        `,
        },
      },
    },
    facet_attribute: {
      attribute: "ref_depth_group_1",
      field: "ref_depth_group_1",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Cutout Height",
    attribute: "ref_height",
    accentuate_prop: "bbq.ref_specs_cutout_height",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
      return items
        .map((item) => {
          const match = item.value.match(/[0-9]*\.?[0-9]+/);
          const decimal = match ? parseFloat(match[0]) : "";
          const fraction = decimalToFraction(decimal);
            return{
              ...item,
              label: `${fraction} Inches`,
            }
        })
    },
    runtime_mapping:null,
    facet_attribute: {
      attribute: "ref_height",
      field: "accentuate_data.bbq.ref_specs_cutout_height",
      type: "string",
    },
    collapse: true,
    cluster:"refrigerators"
  },
  {
    label: "Cutout Height",
    attribute: "ref_height_group_1",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
      const sortedLabels = {
        "Under 34": "Under 34", 
        "34-36 Inches": "34 - 36 Inches",
        "36 And Up": "36 And Up",
      };
      const sortLabelKeys = Object.keys(sortedLabels);
      return items
        .map((item) => ({
          ...item,
          label: sortedLabels[item.value],
        }))
        .sort((a, b) => {
          // 2. Sort based on the index in our desiredOrder array
          return (
            sortLabelKeys.indexOf(a.value) -
            sortLabelKeys.indexOf(b.value)
          );
        });
    },
    runtime_mapping: {
      ref_height_group_1: {
        type: "keyword",
        script: {
          source: `
          // 1. Check for null at the top level
if (params['_source']['accentuate_data'] == null) return;

def rawValue = params['_source']['accentuate_data']['bbq.ref_specs_cutout_height'];

// 2. Check for null or empty string
if (rawValue == null || rawValue.toString().trim().isEmpty()) return;

double height;
try {
    // 3. Manual cleaning (No Regex)
    String str = rawValue.toString().toLowerCase()
                 .replace('"', '')
                 .replace('inches', '')
                 .replace('in', '')
                 .trim();
    
    // 4. Final check: if after cleaning it's empty, stop
    if (str.isEmpty()) return;
    
    height = Double.parseDouble(str);
} catch (Exception e) {
    // This catches cases like "N/A" or "TBD"
    return; 
}

// 5. Logic mapping (Clean Waterfall)
if (height < 34) {
    emit("Under 34");
} else if (height <= 36) {
    emit("34-36 Inches");
}  else {
    emit("36 And Up");
}
        `,
        },
      },
    },
    facet_attribute: {
      attribute: "ref_height_group_1",
      field: "ref_height_group_1",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Cutout Height",
    attribute: "ref_height_group_2",
    searchable: false,
    type: "RefinementList",
    // transform: function (items) {
    //   const sortedLabels = {
    //     "Under 34": "Under 34", 
    //     "34-36 Inches": "34 - 36 Inches",
    //     "36 And Up": "36 And Up",
    //   };
    //   const sortLabelKeys = Object.keys(sortedLabels);
    //   return items
    //     .map((item) => ({
    //       ...item,
    //       label: sortedLabels[item.value],
    //     }))
    //     .sort((a, b) => {
    //       // 2. Sort based on the index in our desiredOrder array
    //       return (
    //         sortLabelKeys.indexOf(a.value) -
    //         sortLabelKeys.indexOf(b.value)
    //       );
    //     });
    // },
    runtime_mapping: {
      ref_height_group_2: {
        type: "keyword",
        script: {
          source: `
          // 1. Check for null at the top level
if (params['_source']['accentuate_data'] == null) return;

def rawValue = params['_source']['accentuate_data']['bbq.ref_specs_cutout_height'];

// 2. Check for null or empty string
if (rawValue == null || rawValue.toString().trim().isEmpty()) return;

double height;
try {
    // 3. Manual cleaning (No Regex)
    String str = rawValue.toString().toLowerCase()
                 .replace('"', '')
                 .replace('inches', '')
                 .replace('in', '')
                 .trim();
    
    // 4. Final check: if after cleaning it's empty, stop
    if (str.isEmpty()) return;
    
    height = Double.parseDouble(str);
} catch (Exception e) {
    // This catches cases like "N/A" or "TBD"
    return; 
}

// 5. Logic mapping (Clean Waterfall)
if (height < 10) {
    emit("Under 10");
} else if (height <= 12) {
    emit("10 Inches - 12 Inches");
} else if (height <= 15) {
    emit("12 Inches - 15 Inches");
} else if (height <= 20) {
    emit("15 Inches - 20 Inches");
}  else {
    emit("20 Inches And Up");
}
        `,
        },
      },
    },
    facet_attribute: {
      attribute: "ref_height_group_2",
      field: "ref_height_group_2",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Cutout Width",
    attribute: "ref_width_tmp",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
      return items
        .map((item) => {
          const match = item.value.match(/[0-9]*\.?[0-9]+/);
          const decimal = match ? parseFloat(match[0]) : "";
          const fraction = decimalToFraction(decimal);
          return {
          ...item,
          label: `${fraction}"`,
        }
        })
    },
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_width_tmp",
      field: "accentuate_data.bbq.ref_specs_cutout_width",
      type: "string",
    },
    collapse: true,
    cluster:"refrigerators"
  },
  {
    label: "Cutout Width",
    attribute: "ref_width",
    accentuate_prop: "bbq.ref_specs_cutout_width",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
      return items
        .map((item) => {
          const match = item.value.match(/[0-9]*\.?[0-9]+/);
          const decimal = match ? parseFloat(match[0]) : "";
          const fraction = decimalToFraction(decimal);
          return {
          ...item,
          label: `${fraction} Inches`,
        }
        })
    },
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_width",
      field: "accentuate_data.bbq.ref_specs_cutout_width",
      type: "string",
    },
    collapse: true,
    cluster:"refrigerators"
  },
  {
    label: "Cutout Width",
    attribute: "ref_width_group_1",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
        const sortKeys = [
          "Under 14 Inches",
          "14 Inches - 22 Inches",
          "22 Inches - 24 Inches",
          "24 Inches And Up"
        ]     
      return items
        .sort((a, b) => {
          // 2. Sort based on the index in our desiredOrder array
          return (
            sortKeys.indexOf(a.value) -
            sortKeys.indexOf(b.value)
          );
        });
    },
    runtime_mapping: {
      ref_width_group_1: {
        type: "keyword",
        script: {
          source: `
          // 1. Check for null at the top level
if (params['_source']['accentuate_data'] == null) return;

def rawValue = params['_source']['accentuate_data']['bbq.ref_specs_cutout_width'];

// 2. Check for null or empty string
if (rawValue == null || rawValue.toString().trim().isEmpty()) return;

double width;
try {
    // 3. Manual cleaning (No Regex)
    String str = rawValue.toString().toLowerCase()
                 .replace('"', '')
                 .replace('inches', '')
                 .replace('in', '')
                 .trim();
    
    // 4. Final check: if after cleaning it's empty, stop
    if (str.isEmpty()) return;
    
    width = Double.parseDouble(str);
} catch (Exception e) {
    // This catches cases like "N/A" or "TBD"
    return; 
}

// 5. Logic mapping (Clean Waterfall)
if (width < 14) {
    emit("Under 14 Inches");
} else if (width <= 22) {
    emit("14 Inches - 22 Inches");
} else if (width <= 24) {
    emit("22 Inches - 24 Inches");
} else {
    emit("24 Inches And Up");
}
        `,
        },
      },
    },
    facet_attribute: {
      attribute: "ref_width_group_1",
      field: "ref_width_group_1",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Door Type",
    attribute: "ref_door_type",
    accentuate_prop: "bbq.ref_specs_door_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_door_type",
      field: "accentuate_data.bbq.ref_specs_door_type",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Drain Type",
    attribute: "ref_drain_type",
    accentuate_prop: "bbq.ref_specs_drain_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_drain_type",
      field: "accentuate_data.bbq.ref_specs_drain_type",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Hinge Type",
    attribute: "ref_hinge",
    accentuate_prop: "bbq.ref_specs_hinge_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_hinge",
      field: "accentuate_data.bbq.ref_specs_hinge_type",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Ice Cube Type",
    attribute: "ref_ice_cube_type",
    accentuate_prop: "bbq.ref_specs_ice_cube_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_ice_cube_type",
      field: "accentuate_data.bbq.ref_specs_ice_cube_type",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Ice Produced Daily", // #
    attribute: "ref_ice_daily_output",
    accentuate_prop: "bbq.ref_specs_ice_produced_daily",
    searchable: false,
    type: "RefinementList",
    facet_attribute: {
      attribute: "ref_ice_daily_output",
      field: "accentuate_data.bbq.ref_specs_ice_produced_daily",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  // {
  //   label: "Ice Produced Daily (FROM TAGS)", // #
  //   attribute: "ref_ice_daily_output_old",
  //   searchable: false,
  //   type: "RefinementList",
  //   runtime_mapping: {
  //     ref_ice_daily_output_old: {
  //       type: "keyword",
  //       script: {
  //         source: `
  //             def validDIO = ${JSON.stringify(
  //               refDailyIceBucketKeys.map((k) => k.toLowerCase()),
  //             )};
  //             if (params['_source']['tags'] != null) {
  //               for (def tag : params['_source']['tags']) {
  //                 if (tag == null) continue;
    
  //                 if (validDIO.contains(tag.toLowerCase())) {
  //                   emit(tag);
  //                   return;
  //                 }
  //               }
  //             }
  //           `,
  //       },
  //     },
  //   },
  //   facet_attribute: {
  //     attribute: "ref_ice_daily_output_old",
  //     field: "ref_ice_daily_output_old",
  //     type: "string",
  //   },
  //   collapse: false,
  // },
  {
    label: "Ice Produced Daily", // #
    attribute: "ref_ice_daily_output_group_1",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      ref_ice_daily_output_group_1: {
        type: "keyword",
        script: {
          source: `
          // 1. Check for null at the top level
if (params['_source']['accentuate_data'] == null) return;

def rawValue = params['_source']['accentuate_data']['bbq.ref_specs_ice_produced_daily'];

// 2. Check for null or empty string
if (rawValue == null || rawValue.toString().trim().isEmpty()) return;

double produce;
try {
    // 3. Manual cleaning (No Regex)
    String str = rawValue.toString().toLowerCase()
                 .replace('lbs', '')
                 .trim();
    
    // 4. Final check: if after cleaning it's empty, stop
    if (str.isEmpty()) return;
    
    produce = Double.parseDouble(str);
} catch (Exception e) {
    // This catches cases like "N/A" or "TBD"
    return; 
}

// 5. Logic mapping (Clean Waterfall)
if (produce < 11) {
    emit("Under 11 lbs");
} else if (produce <= 20) {
    emit("11 lbs - 20 lbs");
} else if (produce <= 30) {
    emit("21 lbs - 30 lbs");
} else if (produce <= 40) {
    emit("31 lbs - 40 lbs");
} else if (produce <= 50) {
    emit("41 lbs - 50 lbs");
} else if (produce <= 60) {
    emit("51 lbs - 60 lbs");
} else if (produce <= 70) {
    emit("61 lbs - 70 lbs");
} else {
    emit("70 lbs And Up");
}
        `,
        },
      },
    },
    facet_attribute: {
      attribute: "ref_ice_daily_output_group_1",
      field: "ref_ice_daily_output_group_1",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Ice Storage Capacity RAW",
    attribute: "ref_ice_storage_capacity_raw",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_ice_storage_capacity_raw",
      field: "accentuate_data.bbq.ref_specs_ice_storage_capacity",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Ice Storage Capacity Normalize",
    attribute: "ref_ice_storage_capacity",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
      return items.map(item=>({...item, label: item.value.replace("lbs","").replace("Lbs","").trim() + " lbs"}))
    },
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_ice_storage_capacity",
      field: "accentuate_data.bbq.ref_specs_ice_storage_capacity",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Glass Door",
    attribute: "ref_glass_door",
    accentuate_prop: "bbq.ref_specs_is_glass_door",
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
    cluster:"refrigerators"
  },
  {
    label: "Max Keg Size",
    attribute: "ref_max_keg_size",
    accentuate_prop: "bbq.ref_specs_max_keg_size",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_max_keg_size",
      field: "accentuate_data.bbq.ref_specs_max_keg_size",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Configuration",
    attribute: "ref_mounting_type",
    accentuate_prop: "bbq.ref_specs_mount_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: {
      bbq_mount_type_split: {
        type: "keyword",
        script: {
          source: `
            def data = params['_source']['accentuate_data'];
            if (data != null && data['bbq.ref_specs_mount_type'] != null) {
              def val = data['bbq.ref_specs_mount_type'];
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
      attribute: "ref_mounting_type",
      field: "bbq_mount_type_split",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Number of Taps",
    attribute: "ref_no_of_taps",
    accentuate_prop: "bbq.ref_specs_no_of_taps",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_no_of_taps",
      field: "accentuate_data.bbq.ref_specs_no_of_taps",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Outdoor Certification",
    attribute: "ref_outdoor_certification",
    accentuate_prop: "bbq.ref_specs_outdoor_certification",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
      return items.map((item) => ({
        ...item,
        label: refOutdoorCertBuckets[item.value],
      }));
    },
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_outdoor_certification",
      field: "accentuate_data.bbq.ref_specs_outdoor_certification",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    // this is a normal display of filter option
    label: "Capacity",
    attribute: "ref_capacity",
    accentuate_prop: "bbq.ref_specs_total_capacity",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
      return items
        .map((item) => ({
          ...item,
          label: `${item.value} Cu. Ft.`,
        }))
    },
    facet_attribute: {
      attribute: "ref_capacity",
      field: "accentuate_data.bbq.ref_specs_total_capacity",
      type: "string",
    },
    collapse: true,
    cluster:"refrigerators"
  },
  {
    // this is a normal display of filter option
    label: "Capacity",
    attribute: "ref_capacity_group_1",
    searchable: false,
    type: "RefinementList",
    transform: function (items) {
      const sortKeys = [
        "Small (1.0 - 3.5 Cu. Ft.)",
        "Medium (3.6 - 5.0 Cu. Ft.)",
        "Large (5.1 Cu. Ft. & Up)"
      ];
      return items
        .sort((a, b) => {
          // 2. Sort based on the index in our desiredOrder array
          return (
            sortKeys.indexOf(a.value) - sortKeys.indexOf(b.value)
          );
        });
    },
    runtime_mapping: {
      ref_capacity_group_1: {
        type: "keyword",
        script: {
          source: `
            // 1. Safe Top-Level Check
            if (params['_source'].accentuate_data == null) return;
            def data = params['_source'].accentuate_data;

            // 2. Access the field
            def val = data.get('bbq.ref_specs_total_capacity');
            if (val == null || val.toString().trim() == "") return;

            double capacity = 0;
            try {
                // 3. Unified String Cleaning (Handles BOTH numeric and string 3.2)
                String strVal = val.toString(); 
                StringBuilder sb = new StringBuilder();
                boolean seenDot = false;

                for (int i = 0; i < strVal.length(); i++) {
                    char c = strVal.charAt(i);
                    if (Character.isDigit(c)) {
                        sb.append(c);
                    } else if (c == (char)'.' && !seenDot) {
                        sb.append(c);
                        seenDot = true;
                    }
                }

                if (sb.length() > 0) {
                    capacity = Double.parseDouble(sb.toString());
                } else {
                    return; 
                }
            } catch (Exception e) {
                return; 
            }

            // 4. Waterfall Logic (No gaps for 3.2)
            if (capacity < 1.0) {
                return; 
            } else if (capacity <= 3.5) {
                emit("Small (1.0 - 3.5 Cu. Ft.)");
            } else if (capacity <= 5.0) {
                emit("Medium (3.6 - 5.0 Cu. Ft.)");
            } else {
                emit("Large (5.1 Cu. Ft. & Up)");
            }
    `,
        },
      },
    },
    facet_attribute: {
      attribute: "ref_capacity_group_1",
      field: "ref_capacity_group_1",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Venting",
    attribute: "ref_vent",
    accentuate_prop: "bbq.ref_specs_vent_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_vent",
      field: "accentuate_data.bbq.ref_specs_vent_type",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Wine Bottle Capacity",
    attribute: "ref_wine_bottle_capacity",
    accentuate_prop: "bbq.ref_specs_wine_bottle_capacity",
    searchable: false,
    type: "RefinementList",
    // runtime_mapping: {
    //   ref_wine_bottle_capacity: {
    //     type: "keyword",
    //     script: {
    //       source: `
    //   if (params['_source']['accentuate_data'] == null || 
    //       params['_source']['accentuate_data']['bbq.ref_specs_wine_bottle_capacity'] == null) {
    //     return;
    //   }

    //   String rawValue = params['_source']['accentuate_data']['bbq.ref_specs_wine_bottle_capacity'];
      
    //   double bottles = 0;
    //   try {
    //     String cleanValue = rawValue.toLowerCase().trim();
    //     bottles = Double.parseDouble(cleanValue);
    //   } catch (Exception e) {
    //     return; 
    //   }

    //   if (bottles >= 14 && bottles <= 23) {
    //     emit("14 - 23 Bottles");
    //   } else if (bottles > 23 && bottles <= 40) {
    //     emit("24 - 40 Bottles");
    //   } else if (bottles > 40 && bottles <= 54) {
    //     emit("41 - 54 Bottles");
    //   } else if (bottles >=55) {
    //     emit("55 Bottles And Up");
    //   }
    // `,
    //     },
    //   },
    // },
    runtime_mapping:null,
    facet_attribute: {
      attribute: "ref_wine_bottle_capacity",
      // field: "ref_wine_bottle_capacity",
      field: "ref_wine_bottle_capacity",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Lock",
    attribute: "ref_with_lock",
    accentuate_prop: "bbq.ref_specs_with_lock",
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
    cluster:"refrigerators"
  },
  {
    label: "Number Of Zones",
    attribute: "ref_no_of_zones",
    accentuate_prop: "bbq.ref_specs_zones",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_no_of_zones",
      field: "accentuate_data.bbq.ref_specs_zones",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Outdoor Rated",
    attribute: "ref_outdoor_rated",
    accentuate_prop: "bbq.ref_specs_outdoor_rated",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_outdoor_rated",
      field: "accentuate_data.bbq.ref_specs_outdoor_rated",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
  {
    label: "Item Type",
    attribute: "ref_type",
    accentuate_prop:"bbq.ref_specs_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_type",
      field: "accentuate_data.bbq.ref_specs_type",
      type: "string",
    },
    collapse: false,
    cluster:"refrigerators"
  },
];


export const refFilterTypes = {
  "refrigerators": [
    "ways_to_shop",
    "brands",
    "ref_type",
    // "ref_capacity", // for demo
    "ref_capacity_group_1",
    "ref_is_commercial",
    "ref_width",
    // "ref_width_tmp", // for demo
    // "ref_width_group_1", // for demo
    "price_groups",
    "price",
    // "ref_depth", // exta
    "ref_height",
    "ref_outdoor_certification",
    "ref_color"
  ],
  "compact-refrigerators": [
    "ways_to_shop",
    "brands",
    "ref_capacity_group_1",
    "ref_glass_door",
    "ref_door_type",
    "ref_vent",
    "price_groups",
    "price",
    // "ref_width", // for checking
    "ref_width_group_1",
    // "ref_height", // for checking
    "ref_height_group_1",
    "material",
    "ref_mounting_type",
    "ref_with_lock",
    "ref_outdoor_certification",
    "ref_hinge",
    // "ref_depth", // for checking
    "ref_depth_group_1",
  ],
  "outdoor-beverage-refrigerators": [
    "ways_to_shop",
    "brands",
    "ref_glass_door",
    "ref_capacity_group_1",
    "ref_class",
    "ref_with_lock",
    "price_groups",
    "price",
    // "ref_width",
    "ref_width_group_1",
    // "ref_height",
    // "ref_height_group_1", // for demo
    "ref_height_group_2",
    // "ref_depth",
    "ref_depth_group_1",
    "ref_hinge",
    "ref_outdoor_certification",
    "ref_vent",
  ],
  "outdoor-ice-makers": [
    "ways_to_shop",
    "brands",
    "ref_ice_cube_type",
    "ref_drain_type",
    "ref_ice_storage_capacity_raw",
    "ref_ice_storage_capacity",
    "ref_mounting_type",
    "price_groups",
    "price",
    // "ref_ice_daily_output_old", // for demo
    // "ref_ice_daily_output", // for demo
    "ref_ice_daily_output_group_1",
    // "ref_width",
    // "ref_height",
    "ref_outdoor_certification",
    "ref_hinge",
    // "ref_depth",
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
    // "ref_width_group_1",
    "ref_depth",
    // "ref_depth_group_1",
    "ref_height",
    // "ref_height_group_1",
  ],
  "outdoor-kegerators": [
    "ways_to_shop",
    "brands",
    "ref_no_of_taps",
    "ref_max_keg_size",
    "ref_mounting_type",
    "ref_capacity_group_1",
    "price_groups",
    "price",
    "ref_width",
    "ref_class",
    "ref_outdoor_certification",
    "ref_with_lock",
    "ref_depth",
    "ref_height"
  ],
  "outdoor-compact-freezers":[
    "ways_to_shop",
    "brands",
    "ref_door_type",
    "ref_capacity_group_1",
    "ref_hinge",
    "ref_mounting_type",
    "price_groups",
    "price",
    "ref_with_lock",
    "ref_width",
    "ref_class",
    "ref_depth",
    "ref_height"
  ]
};

// console.log("refFilters", refFilters.map(item=> ({label: item.label, attribute: item.attribute, property: item.facet_attribute.field})))

