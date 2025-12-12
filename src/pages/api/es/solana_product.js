import {
  ES_INDEX,
  exclude_brands,
  exclude_collections,
} from "../../../app/lib/helpers";

//  this hook is used for searching products
export default async function handler(req, res) {
  const ESURL = process.env.NEXT_ES_URL;
  const ESShard = ES_INDEX;
  const ESApiKey = `apiKey ${process.env.NEXT_ES_API_KEY}`;

  const fetchConfig = {
    method: req.method,
    cache: "no-store",
    headers: {
      Authorization: ESApiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };

  const BASE_API_URL = `${ESURL}/${ESShard}/_search`;

  if (req.method === "POST") {
    const API_URL = `${BASE_API_URL}`;
    const body = JSON.parse(req.body);
    const handle = body?.handle;

    const new_body = {
      size: 1,
      query: {
        term: {
          "handle.keyword": {
            value: `${handle}`,
          },
        },
      },
    };

    fetchConfig["body"] = JSON.stringify(new_body);

    try {
      let product_options = null;
      let fbw_products = null;
      let ob_products = null; // open box product if any
      let new_products = null; // new product if product is an open box
      const response = await fetch(API_URL, fetchConfig);

      const data = await response.json();
      // elasticsearch result restructured to bigcommerce response object
      const product = data?.hits?.hits.map((i) => i._source);

      const accentuate_data = product[0].accentuate_data || null;
      if (product?.[0] && accentuate_data) {
        const keys = [
          "bbq.related_product",
          "bbq.configuration_product",
          "bbq.hinge_related_product",
          "bbq.option_related_product",
          "bbq.openbox_related_product",
          "bbq.shopnew_related_product",
          "bbq.selection_related_product",
          "bbq.product_option_related_product",
          "frequently.fbi_related_product",
          "bbq.shopnew_related_product",
        ];

        const mergedProducts = [
          ...new Set([...mergeRelatedProducts(accentuate_data, keys)]),
        ];

        const secondFetchConfig = {
          ...fetchConfig,
          body: JSON.stringify({
            size: 100,
            query: {
              bool: {
                filter: [
                  {
                    terms: {
                      "handle.keyword": mergedProducts,
                    },
                  },
                  {
                    bool: {
                      must_not: [
                        {
                          terms: {
                            "brand.keyword": exclude_brands,
                          },
                        },
                        {
                          terms: {
                            "collections.name.keyword": exclude_collections,
                          },
                        },
                      ],
                    },
                  },
                  {
                    exists: {
                      field: "brand.keyword",
                    },
                  },
                ],
              },
            },
          }),
        };

        const product_options_response = await fetch(
          API_URL,
          secondFetchConfig
        );

        const product_options_json = await product_options_response.json();

        const relative_products = (product_options_json?.hits?.hits || []).map(
          (i) => ({ ...i._source })
        );

        // map fbt_products
        const fbw = accentuate_data?.["frequently.fbi_related_product"] || [];
        const has_fbw = Array.isArray(fbw) && fbw.length > 0;

        // map open_box
        const ob = accentuate_data?.["bbq.openbox_related_product"] || [];
        const has_ob = Array.isArray(ob) && ob.length > 0;

        // map new_products
        const new_variant =
          accentuate_data?.["bbq.shopnew_related_product"] || [];
        const has_new_variant =
          Array.isArray(new_variant) && new_variant.length > 0;

        if (has_new_variant) {
          new_products = relative_products.filter((item) =>
            new_variant.includes(item?.handle)
          );
        }

        if (has_fbw) {
          fbw_products = relative_products.filter((item) =>
            fbw.includes(item?.handle)
          );
        }

        if (has_ob) {
          ob_products = relative_products.filter((item) =>
            ob.includes(item?.handle)
          );
        }

        product_options = relative_products.filter(
          (item) =>
            ![...(new_variant || []), ...(fbw || []), ...(ob || [])].includes(
              item?.handle
            )
        );
      }

      // map specs
      let specs;
      const spec_keys = [
        // common specs
        { key: "bbq.overall_dimensions", label: "Dimension (WxDxH)" },
        { key: "bbq.product_weight", label: "Product Weight" },
        { key: "bbq.number_of_main_burners", label: "Number Of Main Burners" },
        { key: "bbq.total_surface_btu", label: "Total Surface BTUs" },
        { key: "bbq.single_burner_btus", label: "Single Burner BTUs" },
        { key: "bbq.grill_lights", label: "Grill Lights" },
        { key: "bbq.rear_infrared_burner", label: "Rear Infrared Burner" },
        { key: "bbq.rotisserie_kit", label: "Rotisserie Kit" },
        { key: "bbq.thermometer", label: "Thermometer" },
        { key: "bbq.seo_meta_brand", label: "Brand" },
        { key: "bbq.seo_meta_manufacturer", label: "Manufacturer" },
        { key: "bbq.seo_meta_material", label: "Material" },
        { key: "bbq.seo_meta_fuel_type", label: "Fuel Type" },
        {
          key: "bbq.seo_meta_manufacturer_part_number",
          label: "Manufacturer Part Number",
        },
        { key: "bbq.seo_meta_made_in_usa", label: "Made In USA" },
        {
          key: "bbq.seo_meta_cooking_grid_dimensions",
          label: "Cooking Grid Dimensions",
        },
        { key: "bbq.seo_meta_main_grilling_area", label: "Main Grilling Area" },
        {
          key: "bbq.seo_meta_secondary_grilling_area",
          label: "Secondary Grilling Area",
        },
        { key: "bbq.seo_meta_total_grill_area", label: "Total Grill Area" },
        // side burner specs
        {
          key: "bbq.side_burder_specification_gas_type",
          label: "Side Burner Gas Type",
        },
        {
          key: "bbq.side_burner_specification_type",
          label: "Side Burner Type",
        },
        {
          key: "bbq.side_burner_specs_configuration",
          label: "Side Burner Configuration",
        },
        {
          key: "bbq.side_burner_specs_number_of_burners",
          label: "Side Burner No. of Burners",
        },
        // storage specs
        {
          key: "bbq.storage_specs_cutout_depth",
          label: "Storage Cutout Depth",
        },
        {
          key: "bbq.storage_specs_cutout_height",
          label: "Storage Cutout Height",
        },
        {
          key: "bbq.storage_specs_cutout_width",
          label: "Storage Cutout Width",
        },
        {
          key: "bbq.storage_specs_mounting_type",
          label: "Storage Mounting Type",
        },
        {
          key: "bbq.storage_specs_number_of_doors",
          label: "Storage No. of Doors",
        },
        {
          key: "bbq.storage_specs_number_of_drawers",
          label: "Storage No. of Drawers",
        },
        { key: "bbq.storage_specs_orientation", label: "Storage Orientation" },
        // sink bars specs
        // {key:"bbq.sink_bars_center_heading_title", label:"Sink Bars Center Type"},
        { key: "bbq.sink_bars_center_type", label: "Sink Bars Center Type" },
        {
          key: "bbq.sink_bars_center_configuration",
          label: "Sink Bars Center Configuration",
        },
        {
          key: "bbq.sink_bars_center_cutout_depth",
          label: "Sink Bars Center Cutout Depth",
        },
        {
          key: "bbq.sink_bars_center_cutout_height",
          label: "Sink Bars Center Cutout Height",
        },
        {
          key: "bbq.sink_bars_center_cutout_width",
          label: "Sink Bars Center Cutout Width",
        },
        {
          key: "bbq.sink_bars_center_water_type",
          label: "Sink Bars Center Water Type",
        },
        // ref specs
        // {key:"bbq.ref_specs_heading_title", label:""},
        { key: "bbq.ref_specs_type", label: "Ref Type" },
        { key: "bbq.ref_specs_cutout_depth", label: "Ref Cutout Depth" },
        { key: "bbq.ref_specs_cutout_height", label: "Ref Cutout Height" },
        { key: "bbq.ref_specs_cutout_width", label: "Ref Cutout Width" },
        { key: "bbq.ref_specs_door_type", label: "Ref Door Type" },
        { key: "bbq.ref_specs_outdoor_rated", label: "Ref Outdoor Rated" },
        { key: "bbq.ref_specs_total_capacity", label: "Ref Total Capacity" },
      ];

      specs = spec_keys.map((item) => ({
        ...item,
        value: accentuate_data?.[item?.key] || "",
      }));

      // map manuals
      let manuals = null;
      const manual_labels = accentuate_data?.["bbq.file_name"];
      const manual_links = accentuate_data?.["bbq.upload_file"];

      if (manual_links && Array.isArray(manual_links)) {
        manuals = manual_links.map((item, index) => ({
          label: manual_labels?.[index] || "",
          value: item || "",
        }));
      }

      // map shipping info
      let shipping_info = [
        {
          key: "bbq.shipping_weight",
          label: "Shipping Weight",
          value: accentuate_data?.["bbq.shipping_weight"] || "",
        },
        {
          key: "bbq.shipping_dimensions",
          label: "Shipping Dimensions (WxDxH)",
          value: accentuate_data?.["bbq.shipping_dimensions"] || "",
        },
      ];

      shipping_info = shipping_info.filter(({ value }) => value !== "");

      if (shipping_info.length === 0) {
        shipping_info = null;
      }

      if (product.length > 0) {
        product[0]["sp_product_options"] = product_options;
        // product[0]["fbt_bundle"] = fbt_bundle;
        product[0]["fbt_bundle"] = (
          product?.[0]?.["frequently_bought_together"] || []
        ).map((i) => ({ ...i, product_id: i.id }));
        product[0]["fbt_carousel"] = fbw_products;
        product[0]["open_box"] = ob_products;
        product[0]["new_items"] = new_products;
        const specsIsEmpty = specs.every((item) => item.value === "");
        product[0]["product_specs"] = specsIsEmpty ? null : specs;
        product[0]["product_manuals"] = manuals || null;
        product[0]["product_shipping_info"] = shipping_info || null;
      }

      const bc_formated_data = {
        data: product,
        requestConfig: fetchConfig,
        requestBody: req.body,
        response: response,
      };
      res.status(200).json(bc_formated_data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products", error });
    }
  }
}

function mergeRelatedProducts(data, keys) {
  const merged = [];

  keys.forEach((key) => {
    // 1. Get the value for the current key
    const rawValue = data[key];
    let value = [];

    // 2. Check the raw value's type before proceeding
    if (rawValue === null || rawValue === undefined) {
      // If null or undefined, skip or set to empty array
      value = [];
    } else if (Array.isArray(rawValue)) {
      // If it's already an array, use it directly
      value = rawValue;
    } else if (typeof rawValue === "string") {
      // If it's a string, attempt to parse it
      try {
        value = JSON.parse(rawValue);
      } catch (e) {
        console.error(`Error parsing JSON for key "${key}":`, e);
        // On error, treat as empty or handle as required
        value = [];
      }
    } else {
      // For any other non-string, non-null, non-array value (e.g., number or object)
      // This is defensive coding; assuming related products should be an array.
      value = [];
    }

    // 3. Ensure the final result is an array before spreading
    if (Array.isArray(value)) {
      merged.push(...value);
    }
  });

  // 4. Optionally, you might want to deduplicate the results
  return [...new Set(merged)];
}
