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

export const refFilters = [
  {
    label: "Refrigerator Class",
    attribute: "ref_class",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_class",
      field: "accentuate_data.bbq.ref_specs_class",
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
    label: "Drain Type",
    attribute: "ref_drain_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_drain_type",
      field: "accentuate_data.bbq.ref_specs_drain_type",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Hinge Type",
    attribute: "ref_hinge",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_hinge",
      field: "accentuate_data.bbq.ref_specs_hinge_type",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Ice Cube Type",
    attribute: "ref_ice_cube_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_ice_cube_type",
      field: "accentuate_data.bbq.ref_specs_ice_cube_type",
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
    label: "Max Keg Size",
    attribute: "ref_max_keg_size",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_max_keg_size",
      field: "accentuate_data.bbq.ref_specs_max_keg_size",
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
  },
  {
    label: "Number of Taps",
    attribute: "ref_no_of_taps",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_no_of_taps",
      field: "accentuate_data.bbq.ref_specs_no_of_taps",
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
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_outdoor_certification",
      field: "accentuate_data.bbq.ref_specs_outdoor_certification",
      type: "string",
    },
    collapse: false,
  },
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
      ref_total_capacity: {
        type: "keyword",
        script: {
          source: `
      if (params['_source']['accentuate_data'] == null || 
          params['_source']['accentuate_data']['bbq.bbq.ref_specs_total_capacity'] == null) {
        return;
      }

      String rawValue = params['_source']['accentuate_data']['bbq.bbq.ref_specs_total_capacity'];
      
      double capacity = 0;
      try {
        // Remove "Inches" and whitespace to parse the number
        String cleanValue = rawValue.toLowerCase().trim();
        capacity = Double.parseDouble(cleanValue);
      } catch (Exception e) {
        return; 
      }

      // Logic mapping to refDimensionGroupBuckets
      if (capacity >= 1 && capacity <= 3) {
        emit("1-3 Cu. Ft.");
      } else if (capacity >= 4 && capacity <= 6) {
        emit("4-6 Cu. Ft.");
      } else if (capacity >= 7 && capacity <= 10) {
        emit("7-10 Cu. Ft.");
      } else if (capacity > 10) {
        emit("11 Cu. Ft. +");
      }
    `,
        },
      },
    },
    facet_attribute: {
      attribute: "capacity",
      field: "ref_total_capacity",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Venting",
    attribute: "ref_vent",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_vent",
      field: "accentuate_data.bbq.ref_specs_vent_type",
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
    label: "Number Of Zones",
    attribute: "ref_no_of_zones",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_no_of_zones",
      field: "accentuate_data.bbq.ref_specs_zones",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Outdoor Rated",
    attribute: "ref_outdoor_rated",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_outdoor_rated",
      field: "accentuate_data.bbq.ref_specs_outdoor_rated",
      type: "string",
    },
    collapse: false,
  },
  {
    label: "Type",
    attribute: "ref_type",
    searchable: false,
    type: "RefinementList",
    runtime_mapping: null,
    facet_attribute: {
      attribute: "ref_type",
      field: "accentuate_data.bbq.ref_specs_type",
      type: "string",
    },
    collapse: false,
  },
];


export const refFilterTypes = {
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
    "ref_mounting_type",
    "price_groups",
    "price",
    "ref_ice_daily_output",
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
  "outdoor-kegerators": [
    "ways_to_shop",
    "brands",
    "ref_no_of_taps",
    "ref_max_keg_size",
    "ref_mounting_type",
    "capacity",
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
    "capacity",
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

console.log("refFilters", refFilters.map(item=> ({label: item.label, attribute: item.attribute, property: item.facet_attribute.field})))