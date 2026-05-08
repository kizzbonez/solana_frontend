"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import AddedToCartDialog from "@/app/components/atom/AddedToCartDialog";
import GuestBillingFormDialog from "@/app/components/atom/GuestBillingFormDialog";
import Cookies from "js-cookie";
import { getOrCreateSessionId } from "@/app/lib/session";
import { store_domain, mapOrderItems } from "@/app/lib/helpers";
import { sendAbandonedCart, redisGet, redisSet } from "@/app/lib/api";
import { useAuth } from "@/app/context/auth";
import { usePathname, useRouter } from "next/navigation";
import { BASE_URL, createSlug } from "@/app/lib/helpers";
import GuestEmailDialog from "@/app/components/atom/GuestEmailCaptureDialog";

const CartContext = createContext();

const added_to_cart_test_data = [
  {
    custom_metafields: {
      custom_sale_tag: "",
      size_headings:
        '{"size_1": "25 Inches", "size_2": "32 Inches", "size_3": "", "size_4": "", "size_5": "", "size_6": "", "heading_title": "Size"}',
      open_box: "",
      option_headings:
        '{"option1": "NG", "option2": "LP", "option3": "", "heading_title": "Gas Type"}',
    },
    body_html:
      "<p>The Blaze Prelude LBM Grill is tailored for grilling enthusiasts at all skill levels, featuring durable searing rods for optimal steak searing and secure vegetable grilling. Stainless steel heat zone separators enable versatile cooking styles, while the flame-stabilizing grid reduces flare-ups for safer grilling.</p>\n<p>Cleaning is effortless with the full-width drip tray, and the 304 stainless steel double-lined grill hood protects against heat discoloration, maintaining its shiny appearance. This heavy-duty grill is built to endure various grilling environments.</p>\n<p>Blaze understands the importance of creating exceptional outdoor living spaces where people of all ages can gather and enjoy summer picnics with loved ones. They've dedicated themselves to crafting a range of outdoor products designed to enhance these experiences.</p>\n<p>Key Features of the Blaze Prelude LBM Grill:</p>\n<ul>\n<li>High-Performance Burners: Each stainless steel tube burner delivers 14,000 BTUs of cooking power, totaling 42,000 BTUs across the cooking surface.</li>\n<li>Durable Cooking Rods: Strong 8mm stainless steel rods enhance searing capabilities and durability.</li>\n<li>Easy Ignition: Push-and-turn ignition system for safe and convenient lighting.</li>\n<li>Flare-Up Reduction: Grid design prevents flare-ups and protects burners.</li>\n<li>Premium Stainless Steel Construction: Built to last with durable stainless steel.</li>\n<li>Alternate Ignition Option: Flash tube ignition and crossovers provide additional lighting options.</li>\n<li>Effortless Cleanup: Wide drip tray facilitates easy cleaning.</li>\n<li>Added Value:\n<ul>\n<li>Competitive Pricing: Built-in grills are competitively priced.</li>\n<li>Lifetime Warranty: Comes with a lifetime warranty for peace of mind.</li>\n<li>Cost Savings: Significant savings compared to other high-end grill options.</li>\n</ul>\n</li>\n<li>Generous Cooking Area: 558 square inches provides ample space for cooking.</li>\n</ul>\n<p>Blaze grills cater to diverse cooking needs, whether for intimate family meals or entertaining large gatherings, allowing you to showcase your culinary skills and create memorable outdoor dining experiences.</p>",
    accentuate_data: {
      "bbq.configuration_heading_title": null,
      "bbq.grill_specs_color": "Stainless Steel",
      "bbq.seo_meta_total_grill_area": 542,
      "bbq.seo_meta_material": "304 Stainless Steel",
      "bbq.shopnew_heading_title": null,
      "bbq.side_burner_specification_type": null,
      "bbq.ref_specs_cutout_height": null,
      "bbq.side_burner_specs_configuration": null,
      "bbq.seo_meta_secondary_grilling_area": 137,
      "frequently.fbi_related_product": null,
      "bbq.grill_specs_cutout_depth": 21.25,
      "bbq.open_box_heading_title": null,
      "bbq.storage_specs_number_of_drawers": null,
      "bbq.storage_specs_cutout_height": null,
      "bbq.openbox_related_product": null,
      "bbq.grill_specs_type": "Gas Grill",
      "bbq.rear_infrared_burner_btu": null,
      "bbq.product_option_related_product": null,
      "bbq.side_burner_specs_number_of_burners": null,
      "bbq.product_weight": 81,
      "bbq.configuration_type": null,
      "bbq.seo_meta_manufacturer_part_number": null,
      "bbq.related_product": null,
      "bbq.hinge_related_product": null,
      "bbq.shipping_dimensions": "28 x 29 x 25",
      "bbq.storage_specs_cutout_width": null,
      "bbq.hinge_heading_title": null,
      "bbq.seo_meta_fuel_type": "Natural Gas/Liquid Propane",
      "bbq.file_name": null,
      "bbq.upload_file": null,
      "bbq.grill_specs_side_shelves": "No",
      "bbq.grill_specs_controller": null,
      "bbq.side_burner_specification_gas_type": null,
      "bbq.ref_specs_heading_title": null,
      "bbq.storage_specs_orientation": null,
      "bbq.thermometer": "Analog",
      "bbq.grill_specs_class": "Practical",
      "bbq.enable_call_availability_button": null,
      "bbq.overall_dimensions": ["25 x 25.75 x 21.25"],
      "frequently.fbi_heading": null,
      "bbq.storage_specs_cutout_depth": null,
      "bbq.storage_specs_mounting_type": null,
      "bbq.seo_meta_main_grilling_area": 405,
      _id: "blaze-prelude-lbm-25-inch-3-burner-built-in-grill-blz-3lbm",
      "bbq.grill_specs_on_wheels": "No",
      "bbq.product_offer_cta": null,
      "bbq.openbox_product_text": null,
      "bbq.ref_specs_outdoor_rated": null,
      "bbq.single_burner_btus": 14000,
      "bbq.shipping_weight": 95,
      "bbq.seo_meta_manufacturer": null,
      "bbq.manufacturer_download_heading_title": null,
      "bbq.grill_specs_no_of_racks": 1,
      "bbq.configuration_product": null,
      "bbq.shopnew_product_text": null,
      "bbq.size_heading_title": null,
      "bbq.ref_specs_cutout_width": null,
      "bbq.brand_storage_specs_type": null,
      "bbq.option_type": null,
      "bbq.ref_specs_type": null,
      "bbq.rear_infrared_burner": "No",
      "bbq.product_option_heading_title": null,
      "bbq.product_offer_image_link": null,
      "bbq.grill_specs_mount_type": "Built-In",
      "bbq.rotisserie_kit": "Optional",
      "bbq.option_title": null,
      "bbq.grill_specs_kamado_width": null,
      _info: "Blaze Prelude LBM - 25-Inch 3-Burner Built-In Grill - BLZ-3LBM",
      "bbq.seo_meta_series": "Prelude LBM",
      "bbq.shopnew_related_product": null,
      "bbq.product_offer_url": null,
      "bbq.number_of_main_burners": 3,
      "bbq.storage_specs_number_of_doors": null,
      "bbq.seo_meta_brand": null,
      "bbq.option_related_product": null,
      "bbq.side_burder_specification_gas_type": null,
      "bbq.product_option_name": null,
      "bbq.grill_specs_cutout_height": 8.5,
      "bbq.hinge_selection": null,
      "bbq.total_surface_btu": 42000,
      "bbq.grill_specs_size": 25,
      "bbq.select_sale_tag": null,
      "bbq.ref_specs_door_type": null,
      "bbq.cutout_dimensions": ["23.25 x 21.25 x 8.5"],
      "bbq.seo_meta_made_in_usa": null,
      "bbq.grill_lights": null,
      "bbq.shipping_info_heading_title": null,
      "bbq.seo_meta_cooking_grid_dimensions": "22.5 x 18",
      "bbq.ref_specs_cutout_depth": null,
      "bbq.storage_specs_heading_title": null,
      "bbq.grill_specs_cutout_width": 23.25,
      size_title: null,
      "bbq.specification_heading_title": null,
    },
    created_at: "2025-06-12T02:41:09.744312+00:00",
    variants: [
      {
        compare_at_price: 0,
        price: 1459,
        sku_suggest: ["BLZ-3LBM"],
        qty: 2,
        sku: "BLZ-3LBM",
      },
    ],
    title: "Blaze Prelude LBM - 25-Inch 3-Burner Built-In Grill - BLZ-3LBM",
    recommendations: {
      complementary_products: "",
      related_products_settings: "",
      search_boost: "",
      related_products: "",
    },
    features: {
      furniture_features: "",
      color: "",
      furniture_material: "",
      flue_type: "",
      top_surface_material: "",
      cover_features: "",
      material: "",
      mounting_type: "",
      stove_top_type: "",
      extraction_type: "",
      grease_filter_material: "",
      water_filter_application: "",
      power_source: "",
    },
    updated_at: "2026-03-06T02:34:23.773503+00:00",
    collections: [
      {
        name: "Shop All BBQ Grills and Smokers",
        id: 87,
        slug: "shop-all-bbq-grills-and-smokers",
      },
      {
        name: "Shop All Built In Grills",
        id: 88,
        slug: "shop-all-built-in-grills",
      },
      {
        name: "Gas Grills",
        id: 90,
        slug: "gas-grills",
      },
      {
        name: "Shop All Gas Grills",
        id: 92,
        slug: "shop-all-gas-grills",
      },
      {
        name: "Built In Gas Grills",
        id: 93,
        slug: "built-in-gas-grills",
      },
      {
        name: "Recommended Products Grandeur",
        id: 532,
        slug: "recommended-products-grandeur",
      },
      {
        name: "Recommended Products Grandeur-3burner",
        id: 536,
        slug: "recommended-products-grandeur-3burner",
      },
    ],
    ratings: {
      rating_count: "",
    },
    product_id: 1129,
    options: {
      option3: {
        name: "",
        value: "",
        linked_to: "",
      },
      option1: {
        name: "Title",
        value: "Default Title",
        linked_to: "",
      },
      option2: {
        name: "",
        value: "",
        linked_to: "",
      },
    },
    seo: {
      description:
        "Upgrade your outdoor kitchen with the Blaze Prelude Stainless Steel 3-Burner Built-In Gas Grill. Perfect for entry-level grilling enthusiasts. Get durability and top performance. Call us today for unbeatable prices and make grilling easier than ever!",
      title:
        "Elevate your BBQ with Blaze 25” 3-Burner LBM Grill—power and style!",
    },
    brand: "Blaze Outdoor Products",
    images: [
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3LBM-LP_c5af0ff1-5aac-40ec-999c-02fff91b7ab9.jpg?v=1743600968",
        alt: "",
        position: 1,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3LBM-NG.1.jpg?v=1743600977",
        alt: "",
        position: 2,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3LBM-NG.2.jpg?v=1743600980",
        alt: "",
        position: 3,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3LBM-NG.3.jpg?v=1743600983",
        alt: "",
        position: 4,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3LBM-NG.4.jpg?v=1743600986",
        alt: "",
        position: 5,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/Screenshot2022-11-07132548_e04a1000-bb73-481c-9a87-45563c733b0b.jpg?v=1743600988",
        alt: "",
        position: 6,
      },
    ],
    custom_fields: [],
    handle: "blaze-prelude-lbm-25-inch-3-burner-built-in-grill-blz-3lbm",
    published: true,
    frequently_bought_together: [],
    tags: [
      "0-26 Inches",
      "3 Burners",
      "304 Stainless Steel",
      "Analog",
      "Built In",
      "Built In Gas Grills",
      "Depth 0-26 Inches",
      "Gas Grills",
      "Height 0-26 Inches",
      "No",
      "No Lights",
      "No Rear Infrared Burner",
      "No Rotisserie",
      "Recommended Products Grandeur",
      "Recommended Products Grandeur-3burner",
      "Shop All BBQ Grills and Smoker",
      "Shop All BBQ Grills and Smokers",
      "Shop All Gas Grills",
      "Width 0-26 Inches",
    ],
    product_type: "Home & Garden",
    uploaded_at: "2025-06-12T02:41:09.744300+00:00",
    product_category: [
      {
        category_name: "Home & Garden",
        id: 1,
      },
    ],
    region_pricing: {
      compare_price_us: "",
      included_us: true,
      price_us: "",
    },
    status: "active",
    sp_product_options: [],
    fbt_bundle: [],
    fbt_carousel: null,
    open_box: null,
    new_items: null,
    product_specs: [
      {
        label: "Adjustable Thermostat",
        key: "bbq.frplc_spec_adj_thermostat",
        type: "fireplaces",
        value: "",
      },
      {
        label: "BTU",
        key: "bbq.heater_specs_btu",
        type: "patio heaters",
        value: "",
      },
      {
        label: "BTUs",
        key: "bbq.frplc_spec_btus",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Capacity",
        key: "bbq.ref_specs_total_capacity",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Class",
        key: "bbq.grill_specs_class",
        type: "grills",
        value: "Practical",
      },
      {
        label: "Class",
        key: "bbq.storage_specs_class",
        type: "storage",
        value: "",
      },
      {
        label: "Collection",
        key: "bbq.frplc_spec_model",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Color",
        key: "bbq.ref_specs_color",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Commercial",
        key: "bbq.ref_specs_is_commercial",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Configuration",
        key: "bbq.ref_specs_mount_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Configuration",
        key: "bbq.grill_specs_mount_type",
        type: "grills",
        value: "Built-In",
      },
      {
        label: "Cooking Grill Dimensions",
        key: "bbq.seo_meta_cooking_grid_dimensions",
        type: "grills",
        value: "22 1/2 Inches W x 18 Inches D",
      },
      {
        label: "Cutout Depth",
        key: "bbq.ref_specs_cutout_depth",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Cutout Depth",
        key: "bbq.grill_specs_cutout_depth",
        type: "grills",
        value: "21 1/4 Inches",
      },
      {
        label: "Cutout Dimensions",
        key: "bbq.cutout_dimensions",
        type: "grills",
        value: "23 1/4 Inches W x 21 1/4 Inches D x 8 1/2 Inches H",
      },
      {
        label: "Cutout Height",
        key: "bbq.ref_specs_cutout_height",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Cutout Height",
        key: "bbq.grill_specs_cutout_height",
        type: "grills",
        value: "8 1/2 Inches",
      },
      {
        label: "Cutout Width",
        key: "bbq.ref_specs_cutout_width",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Cutout Width",
        key: "bbq.grill_specs_cutout_width",
        type: "grills",
        value: "23 1/4 Inches",
      },
      {
        label: "Decor",
        key: "bbq.heater_specs_plate_style",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Door Type",
        key: "bbq.ref_specs_door_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Drain Type",
        key: "bbq.ref_specs_drain_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Elements",
        key: "bbq.heater_specs_elements",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Ember Bed Depth",
        key: "bbq.frplc_spec_ember_bed_depth",
        type: "fireplaces",
        value: "",
      },
      {
        label: "External Material",
        key: "bbq.seo_meta_material",
        type: "grills",
        value: "304 Stainless Steel",
      },
      {
        label: "Features",
        key: "bbq.heater_specs_features",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Finish",
        key: "bbq.frplc_spec_color",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Finish",
        key: "bbq.heater_specs_finish",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Firebox Width",
        key: "bbq.frplc_spec_firebox_width",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Fireplace Style",
        key: "bbq.frplc_spec_style",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Fireplace Type",
        key: "bbq.frplc_spec_view_type",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Framing Dimension",
        key: "bbq.frplc_spec_frame_dimension",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Fuel Type",
        key: "bbq.frplc_spec_fuel_type",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Fuel Type",
        key: "bbq.heater_specs_fuel_type",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Fuel Type",
        key: "bbq.seo_meta_fuel_type",
        type: "grills",
        value: "Natural Gas/Liquid Propane",
      },
      {
        label: "Glass Door",
        key: "bbq.ref_specs_is_glass_door",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Grade",
        key: "bbq.heater_specs_grade",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Grill Light",
        key: "bbq.grill_lights",
        type: "grills",
        value: "",
      },
      {
        label: "Heating Area",
        key: "bbq.frplc_spec_heat_area",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Hinge Type",
        key: "bbq.ref_specs_hinge_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Hinge Type",
        key: "bbq.storage_specs_hinge_type",
        type: "storage",
        value: "",
      },
      {
        label: "Ice Cube Type",
        key: "bbq.ref_specs_ice_cube_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Ice Produced Daily",
        key: "bbq.ref_specs_ice_produced_daily",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Installation Type",
        key: "bbq.frplc_spec_mount_type",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Item Type",
        key: "bbq.ref_specs_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Item Type",
        key: "bbq.frplc_spec_type",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Item Type",
        key: "bbq.grill_specs_type",
        type: "grills",
        value: "Gas Grill",
      },
      {
        label: "Kamado Width",
        key: "bbq.grill_specs_kamado_width ",
        type: "grills",
        value: "",
      },
      {
        label: "Line Location",
        key: "bbq.frplc_spec_line_loc",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Lock",
        key: "bbq.ref_specs_with_lock",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Main Grill Area",
        key: "bbq.seo_meta_main_grilling_area",
        type: "grills",
        value: "405 Sq. Inches",
      },
      {
        label: "Marine Grade",
        key: "bbq.heater_specs_marine_grade",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Material",
        key: "bbq.frplc_spec_material",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Max Keg Size",
        key: "bbq.ref_specs_max_keg_size",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Number of Main Burners",
        key: "bbq.number_of_main_burners",
        type: "grills",
        value: "3-Burner",
      },
      {
        label: "Number Of Racks",
        key: "bbq.grill_specs_no_of_racks",
        type: "grills",
        value: 1,
      },
      {
        label: "Number of Taps",
        key: "bbq.ref_specs_no_of_taps",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Number Of Zones",
        key: "bbq.ref_specs_zones",
        type: "refrigerators",
        value: "",
      },
      {
        label: "On Wheels",
        key: "bbq.grill_specs_on_wheels",
        type: "grills",
        value: "No",
      },
      {
        label: "Outdoor Certification",
        key: "bbq.ref_specs_outdoor_certification",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Outdoor Rated",
        key: "bbq.ref_specs_outdoor_rated",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Overall Dimensions",
        key: "bbq.overall_dimensions",
        type: "grills",
        value: "25 Inches W x 25 3/4 Inches D x 21 1/4 Inches H",
      },
      {
        label: "Primary Color",
        key: "bbq.grill_specs_color",
        type: "grills",
        value: "Stainless Steel",
      },
      {
        label: "Product Weight",
        key: "bbq.product_weight",
        type: "grills",
        value: "81 lbs",
      },
      {
        label: "Rear Infrared Burner",
        key: "bbq.rear_infrared_burner",
        type: "grills",
        value: "No",
      },
      {
        label: "Rear Infrared Burner BTU",
        key: "bbq.rear_infrared_burner_btu",
        type: "grills",
        value: "",
      },
      {
        label: "Recess Option",
        key: "bbq.frplc_spec_recess_option",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Refrigerator Class",
        key: "bbq.ref_specs_class",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Rotisserie Kit",
        key: "bbq.rotisserie_kit",
        type: "grills",
        value: "Optional",
      },
      {
        label: "Secondary Grill Area",
        key: "bbq.seo_meta_secondary_grilling_area",
        type: "grills",
        value: "137 Sq. Inches",
      },
      {
        label: "Series",
        key: "bbq.heater_specs_series",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Series",
        key: "bbq.seo_meta_series",
        type: "grills",
        value: "Prelude LBM",
      },
      {
        label: "Shipping Dimensions",
        key: "bbq.shipping_dimensions",
        type: "grills",
        value: "28 Inches W x 29 Inches D x 25 Inches H",
      },
      {
        label: "Shipping Weight",
        key: "bbq.shipping_weight",
        type: "grills",
        value: "95 lbs",
      },
      {
        label: "Side Burner Configuration",
        key: "bbq.side_burner_specs_configuration",
        type: "grills",
        value: "",
      },
      {
        label: "Side Burner Fuel Type",
        key: "bbq.side_burner_specification_gas_type",
        type: "grills",
        value: "",
      },
      {
        label: "Side Burner Type",
        key: "bbq.side_burner_specification_type",
        type: "grills",
        value: "",
      },
      {
        label: "Side Burners",
        key: "bbq.side_burner_specs_number_of_burners",
        type: "grills",
        value: "",
      },
      {
        label: "Side Shelves",
        key: "bbq.grill_specs_side_shelves ",
        type: "grills",
        value: "",
      },
      {
        label: "Single Burner BTU",
        key: "bbq.single_burner_btus",
        type: "grills",
        value: 14000,
      },
      {
        label: "Sink Bar Center Configuration",
        key: "bbq.sink_bars_center_configuration",
        type: "storage",
        value: "",
      },
      {
        label: "Sink Bar Center Type",
        key: "bbq.sink_bars_center_type",
        type: "storage",
        value: "",
      },
      {
        label: "Size",
        key: "bbq.frplc_spec_size",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Size",
        key: "bbq.heater_specs_size",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Size",
        key: "bbq.grill_specs_size",
        type: "grills",
        value: "25 Inches",
      },
      {
        label: "Storage Cofiguration",
        key: "bbq.storage_specs_mounting_type",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Cutout Depth",
        key: "bbq.storage_specs_cutout_depth",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Cutout Height",
        key: "bbq.storage_specs_cutout_height",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Cutout Width",
        key: "bbq.storage_specs_cutout_width",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Drawers",
        key: "bbq.storage_specs_number_of_drawers",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Number of Doors",
        key: "bbq.storage_specs_number_of_doors",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Orientation",
        key: "bbq.storage_specs_orientation",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Type",
        key: "bbq.brand_storage_specs_type",
        type: "grills",
        value: "",
      },
      {
        label: "Style",
        key: "bbq.heater_specs_mount_type",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Surround Dimension",
        key: "bbq.frplc_spec_sur_dimension",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Thermometer",
        key: "bbq.thermometer",
        type: "grills",
        value: "Analog",
      },
      {
        label: "Total Grill Area",
        key: "bbq.seo_meta_total_grill_area",
        type: "grills",
        value: "542 Sq. Inches",
      },
      {
        label: "Total Surface BTU",
        key: "bbq.total_surface_btu",
        type: "grills",
        value: 42000,
      },
      {
        label: "Type",
        key: "bbq.heater_specs_type",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Vent Type",
        key: "bbq.frplc_spec_vent_type",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Venting",
        key: "bbq.ref_specs_vent_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Viewing Area",
        key: "bbq.frplc_spec_view_area",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Voltage",
        key: "bbq.frplc_spec_voltage",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Voltage",
        key: "bbq.heater_specs_volts",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Watts",
        key: "bbq.heater_specs_watts",
        type: "patio heaters",
        value: "",
      },
      {
        label: "WIFI/Bluetooth Enabled",
        key: "bbq.grill_specs_controller",
        type: "grills",
        value: "",
      },
      {
        label: "Wine Bottle Capacity",
        key: "bbq.ref_specs_wine_bottle_capacity",
        type: "refrigerators",
        value: "",
      },
    ],
    product_manuals: null,
    product_shipping_info: [
      {
        key: "bbq.shipping_weight",
        label: "Shipping Weight",
        value: 95,
      },
      {
        key: "bbq.shipping_dimensions",
        label: "Shipping Dimensions (WxDxH)",
        value: "28 x 29 x 25",
      },
    ],
    quantity: 2,
  },
  {
    custom_metafields: {
      custom_sale_tag: "0.0",
      size_headings:
        '{"size_1": "", "size_2": "", "size_3": "", "size_4": "", "size_5": "", "size_6": "", "heading_title": ""}',
      open_box: "0.0",
      option_headings:
        '{"option1": "W/O Rotisserie", "option2": "W/ Rotisserie", "option3": "", "heading_title": "Product Option"}',
    },
    body_html:
      '<p><span style="font-weight: 400;">The Twin Eagles Wi-Fi Controlled 36-Inch Built-In Stainless Steel Pellet Grill and Smoker with Rotisserie - TEPG36R is the ultimate outdoor cooking equipment for all your grilling needs. Made in the USA with premium-grade 304 stainless steel, this grill ensures quality construction and long-lasting durability.</span></p>\n<p><span style="font-weight: 400;">With touchscreen controls and Wi-Fi capability, you have the ability to control your grill from anywhere, making it incredibly convenient.</span></p>\n<p><span style="font-weight: 400;">The included radiant heat briquette tray and the lump charcoal tray provide versatile cooking options, while the front load 13 lb capacity pellet hopper is a great addition. Boasting a temperature range of 140 - 725 degrees Fahrenheit, this grill provides unparalleled performance.</span></p>\n<p><span style="font-weight: 400;">The Twin Eagles pellet grill features seamless heli-arc welded construction for maximum strength and durability, finished in their signature high-polished accents. The double-lined hood, combined with a heavy-duty oven-grade braided 304 stainless steel gasket creates the perfect insulation and seal for maximum heat retention.</span></p>\n<p><span style="font-weight: 400;">You can easily control multiple food items from anywhere using the integrated Wi-Fi controller and the free Twin Eagles Mobile App (iOS and Android), along with three (3) temperature probes. The weatherproof touchscreen control allows you to manually set temperatures or choose from several pre-programmed food items with multiple levels of doneness.</span></p>\n<p>This pellet grill also has a 16 gauge stainless steel vaporizer plate that promotes natural convection, turning drippings into flavorful smoky vapors. With the radiant heat briquette tray or the lump charcoal tray, this grill provides direct heat cooking to beautifully sear your steaks, chops, or vegetables.<br></p>\n<p><span style="font-weight: 400;">The front-load 13-pound pellet hopper allows for easy access to check the pellet level and refill your natural wood pellets when necessary.</span></p>\n<p><span style="font-weight: 400;">The grill has two (2) independent drip tray drawers with removable and disposable pans for easy cleaning and additional storage for accessories. It also has three (3) hanger hooks allowing you to suspend your meat over the grill surface for even cooking and smoke flavor.</span></p>\n<p><span style="font-weight: 400;">The heavy-duty rotisserie system has a fully integrated motor with a 100-pound turning capacity and a chain-driven design providing consistent and uniform rotation of the rotisserie rod.</span></p>\n<p><span style="font-weight: 400;">Whether you want to smoke, bake, grill, sear, or rotisserie, this amazingly versatile Twin Eagles 36 Pellet Grill set the standards. Twin Eagles products are designed and manufactured with pride, ensuring exceptional quality without compromise.</span></p>',
    accentuate_data: {
      "bbq.configuration_heading_title": "Configuration",
      "bbq.grill_specs_color": "Stainless Steel",
      "bbq.seo_meta_total_grill_area": 948,
      "bbq.seo_meta_material": "304 Stainless Steel",
      "bbq.shopnew_heading_title": null,
      "bbq.side_burner_specification_type": null,
      "bbq.ref_specs_cutout_height": null,
      "bbq.side_burner_specs_configuration": null,
      "bbq.seo_meta_secondary_grilling_area": 308,
      "frequently.fbi_related_product": [
        "twin-eagles-36-inch-3-burner-propane-gas-grill-on-deluxe-cart-tebq36g-cl",
        "twin-eagles-36-vent-hood-tevh36-b",
        "twin-eagles-36-pellet-grill-smoker-insulating-jacket",
        "twineagles3-drawer-doorcombo-36x20-75-inch-tedd363-b",
      ],
      "bbq.grill_specs_cutout_depth": 24.25,
      "bbq.open_box_heading_title": null,
      "bbq.storage_specs_number_of_drawers": null,
      "bbq.storage_specs_cutout_height": null,
      "bbq.openbox_related_product": null,
      "bbq.grill_specs_type": "Pellet Grill/Smoker",
      "bbq.rear_infrared_burner_btu": null,
      "bbq.product_option_related_product": [
        "twin-eagles-36-pellet-grill-and-smoker-with-rotisserie-tepg36r",
        "twin-eagles-36-pellet-grill-and-smoker-tepg36g",
      ],
      "bbq.side_burner_specs_number_of_burners": null,
      "bbq.product_weight": 330,
      "bbq.configuration_type": ["Built In", "Freestanding"],
      "bbq.seo_meta_manufacturer_part_number": "TEPG36R",
      "bbq.related_product": null,
      "bbq.hinge_related_product": null,
      "bbq.shipping_dimensions": "40 x 48 x 32",
      "bbq.storage_specs_cutout_width": null,
      "bbq.hinge_heading_title": null,
      "bbq.seo_meta_fuel_type": "Pellets",
      "bbq.file_name": [
        "Twin Eagles Pellet Grill Owners Manual [Click to download]",
      ],
      "bbq.upload_file": null,
      "bbq.grill_specs_side_shelves": "No",
      "bbq.grill_specs_controller": "WiFi/Bluetooth/WiFi & Bluetooth",
      "bbq.side_burner_specification_gas_type": null,
      "bbq.ref_specs_heading_title": null,
      "bbq.storage_specs_orientation": null,
      "bbq.thermometer": "Digital",
      "bbq.grill_specs_class": "Luxury",
      "bbq.enable_call_availability_button": null,
      "bbq.overall_dimensions": ["36 x 25 x 31.62 "],
      "frequently.fbi_heading": "Frequently Bought Together",
      "bbq.storage_specs_cutout_depth": null,
      "bbq.storage_specs_mounting_type": null,
      "bbq.seo_meta_main_grilling_area": 640,
      _id: "twin-eagles-36-pellet-grill-and-smoker-with-rotisserie-tepg36r",
      "bbq.grill_specs_on_wheels": "No",
      "bbq.product_offer_cta": null,
      "bbq.openbox_product_text": null,
      "bbq.ref_specs_outdoor_rated": null,
      "bbq.single_burner_btus": null,
      "bbq.shipping_weight": 345,
      "bbq.seo_meta_manufacturer": "Twin Eagles",
      "bbq.manufacturer_download_heading_title": "Manufacturer's Manual",
      "bbq.grill_specs_no_of_racks": 2,
      "bbq.configuration_product": [
        "twin-eagles-36-pellet-grill-and-smoker-with-rotisserie-tepg36r",
        "twin-eagles-wi-fi-controlled-36-inch-stainless-steel-pellet-grill-smoker-rotisserie-on-cart-tepg36r-tepgb36",
      ],
      "bbq.shopnew_product_text": null,
      "bbq.size_heading_title": null,
      "bbq.ref_specs_cutout_width": null,
      "bbq.brand_storage_specs_type": null,
      "bbq.option_type": ["Pellets"],
      "bbq.ref_specs_type": null,
      "bbq.rear_infrared_burner": "No",
      "bbq.product_option_heading_title": "With Integrated Rotisserie System",
      "bbq.product_offer_image_link":
        "https://cdn.shopify.com/s/files/1/0660/1900/0577/files/SmallOpenBoxGrills.png?v=1676559383",
      "bbq.grill_specs_mount_type": "Built-In",
      "bbq.rotisserie_kit": "Integrated",
      "bbq.option_title": "Fuel Type",
      "bbq.grill_specs_kamado_width": null,
      _info:
        "Twin Eagles Wi-Fi Controlled 36-Inch Built-In Stainless Steel Pellet Grill and Smoker - with Rotisserie - TEPG36R",
      "bbq.seo_meta_series": "Pellet Series",
      "bbq.shopnew_related_product": null,
      "bbq.product_offer_url":
        "https://outdoorkitchenoutlet.com/collections/grills-open-box",
      "bbq.number_of_main_burners": 1,
      "bbq.storage_specs_number_of_doors": null,
      "bbq.seo_meta_brand": "Twin Eagles",
      "bbq.option_related_product": [
        "twin-eagles-36-pellet-grill-and-smoker-with-rotisserie-tepg36r",
      ],
      "bbq.side_burder_specification_gas_type": null,
      "bbq.product_option_name": ['"Yes", "No"]'],
      "bbq.grill_specs_cutout_height": 16.75,
      "bbq.hinge_selection": null,
      "bbq.total_surface_btu": null,
      "bbq.grill_specs_size": 36,
      "bbq.select_sale_tag": null,
      "bbq.ref_specs_door_type": null,
      "bbq.cutout_dimensions": ["34.25 x 24.25 x 16.25"],
      "bbq.seo_meta_made_in_usa": "Yes",
      "bbq.grill_lights": "Internal",
      "bbq.shipping_info_heading_title": "Shipping Information",
      "bbq.seo_meta_cooking_grid_dimensions": "32 x 20",
      "bbq.ref_specs_cutout_depth": null,
      "bbq.storage_specs_heading_title": null,
      "bbq.grill_specs_cutout_width": 34.25,
      size_title: null,
      "bbq.specification_heading_title": "Specification",
    },
    created_at: "2025-06-12T02:41:38.536136+00:00",
    variants: [
      {
        compare_at_price: 11442.05,
        taxable: true,
        weight_unit: "lb",
        requires_shipping: true,
        price: 10069,
        sku_suggest: ["TEPG36R"],
        qty: 10,
        costing: 6865.23,
        sku: "TEPG36R",
        grams: 149685.4821,
      },
    ],
    title:
      "Twin Eagles Wi-Fi Controlled 36-Inch Built-In Stainless Steel Pellet Grill and Smoker - with Rotisserie - TEPG36R",
    recommendations: {
      complementary_products: "",
      related_products_settings: "",
      search_boost: "",
      related_products: 0,
    },
    features: {
      furniture_features: "",
      color: "",
      furniture_material: "",
      flue_type: "",
      top_surface_material: "",
      cover_features: "",
      material: "",
      mounting_type: "",
      stove_top_type: "",
      extraction_type: "",
      grease_filter_material: "",
      water_filter_application: "",
      power_source: "",
    },
    updated_at: "2026-03-06T02:34:23.566572+00:00",
    collections: [
      {
        name: "Shop All Brands",
        id: 31,
        slug: "shop-all-brands",
      },
      {
        name: "Shop All BBQ Grills and Smokers",
        id: 87,
        slug: "shop-all-bbq-grills-and-smokers",
      },
      {
        name: "Shop All Built In Grills",
        id: 88,
        slug: "shop-all-built-in-grills",
      },
      {
        name: "OKO Top Rated",
        id: 186,
        slug: "oko-top-rated",
      },
      {
        name: "Shop All Twin Eagles",
        id: 211,
        slug: "shop-all-twin-eagles",
      },
      {
        name: "Twin Eagles",
        id: 213,
        slug: "twin-eagles",
      },
      {
        name: "Best Sellers for Pellet Grills",
        id: 223,
        slug: "best-sellers-for-pellet-grills",
      },
      {
        name: "Twin Eagles Grills",
        id: 224,
        slug: "twin-eagles-grills",
      },
      {
        name: "Shop All Pellet Grills",
        id: 226,
        slug: "shop-all-pellet-grills",
      },
      {
        name: "Best Sellers for Built In Pellet Grills",
        id: 390,
        slug: "best-sellers-for-built-in-pellet-grills",
      },
      {
        name: "Built In Pellet Grills",
        id: 391,
        slug: "built-in-pellet-grills",
      },
      {
        name: "Twin Eagles Built-In Grills",
        id: 958,
        slug: "twin-eagles-built-in-grills",
      },
    ],
    ratings: {
      rating_count: "'2",
    },
    product_id: 5331,
    options: {
      option3: {
        name: 0,
        value: 0,
        linked_to: 0,
      },
      option1: {
        name: "Title",
        value: "Default Title",
        linked_to: 0,
      },
      option2: {
        name: "",
        value: "",
        linked_to: 0,
      },
    },
    seo: {
      description:
        "The Twin Eagles Wood Fired Pellet Smoker & Grill combines the ultimate in performance, standard for premium pellet grills. Call us now!",
      title: "",
    },
    brand: "Twin Eagles",
    images: [
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEPG36R.jpg?v=1743611128",
        alt: 0,
        position: 1,
      },
    ],
    custom_fields: [],
    handle: "twin-eagles-36-pellet-grill-and-smoker-with-rotisserie-tepg36r",
    published: true,
    frequently_bought_together: [],
    tags: [
      "304 Stainless Steel",
      "34-42 Inches",
      "Best Sellers for Built In Pellet Grills",
      "Best Sellers for Pellet Grills",
      "Built In",
      "Built In Pellet Grills",
      "Digital",
      "Internal Lights",
      "No Rear Infrared Burner",
      "No Rotisserie",
      "OKO Top Rated",
      "Pellet",
      "Shop All BBQ Grills and Smoker",
      "Shop All BBQ Grills and Smokers",
      "Shop All Pellet Grills",
      "Shop All Twin Eagles",
      "Twin Eagles",
      "Twin Eagles Grills",
      "twinVCPG36",
      "Width 34-42 Inches",
      "Yes",
    ],
    product_type: "",
    uploaded_at: "2025-06-12T02:41:38.536119+00:00",
    product_category: [
      {
        category_name: "Uncategorized",
        id: 6,
      },
    ],
    region_pricing: {
      compare_price_us: null,
      included_us: null,
      price_us: null,
    },
    status: "active",
    sp_product_options: [
      {
        custom_metafields: {
          custom_sale_tag: "0.0",
          size_headings:
            '{"size_1": "", "size_2": "", "size_3": "", "size_4": "", "size_5": "", "size_6": "", "heading_title": ""}',
          open_box: "0.0",
          option_headings:
            '{"option1": "W/O Rotisserie", "option2": "W/ Rotisserie", "option3": "", "heading_title": "Product Option"}',
        },
        body_html:
          '<p><span style="font-weight: 400;">The Twin Eagles Wi-Fi Controlled 36-Inch Built-In Stainless Steel Pellet Grill and Smoker with Rotisserie - TEPG36R is the ultimate outdoor cooking equipment for all your grilling needs. Made in the USA with premium-grade 304 stainless steel, this grill ensures quality construction and long-lasting durability.</span></p>\n<p><span style="font-weight: 400;">With touchscreen controls and Wi-Fi capability, you have the ability to control your grill from anywhere, making it incredibly convenient.</span></p>\n<p><span style="font-weight: 400;">The included radiant heat briquette tray and the lump charcoal tray provide versatile cooking options, while the front load 13 lb capacity pellet hopper is a great addition. Boasting a temperature range of 140 - 725 degrees Fahrenheit, this grill provides unparalleled performance.</span></p>\n<p><span style="font-weight: 400;">The Twin Eagles pellet grill features seamless heli-arc welded construction for maximum strength and durability, finished in their signature high-polished accents. The double-lined hood, combined with a heavy-duty oven-grade braided 304 stainless steel gasket creates the perfect insulation and seal for maximum heat retention.</span></p>\n<p><span style="font-weight: 400;">You can easily control multiple food items from anywhere using the integrated Wi-Fi controller and the free Twin Eagles Mobile App (iOS and Android), along with three (3) temperature probes. The weatherproof touchscreen control allows you to manually set temperatures or choose from several pre-programmed food items with multiple levels of doneness.</span></p>\n<p>This pellet grill also has a 16 gauge stainless steel vaporizer plate that promotes natural convection, turning drippings into flavorful smoky vapors. With the radiant heat briquette tray or the lump charcoal tray, this grill provides direct heat cooking to beautifully sear your steaks, chops, or vegetables.<br></p>\n<p><span style="font-weight: 400;">The front-load 13-pound pellet hopper allows for easy access to check the pellet level and refill your natural wood pellets when necessary.</span></p>\n<p><span style="font-weight: 400;">The grill has two (2) independent drip tray drawers with removable and disposable pans for easy cleaning and additional storage for accessories. It also has three (3) hanger hooks allowing you to suspend your meat over the grill surface for even cooking and smoke flavor.</span></p>\n<p><span style="font-weight: 400;">The heavy-duty rotisserie system has a fully integrated motor with a 100-pound turning capacity and a chain-driven design providing consistent and uniform rotation of the rotisserie rod.</span></p>\n<p><span style="font-weight: 400;">Whether you want to smoke, bake, grill, sear, or rotisserie, this amazingly versatile Twin Eagles 36 Pellet Grill set the standards. Twin Eagles products are designed and manufactured with pride, ensuring exceptional quality without compromise.</span></p>',
        accentuate_data: {
          "bbq.configuration_heading_title": "Configuration",
          "bbq.grill_specs_color": "Stainless Steel",
          "bbq.seo_meta_total_grill_area": 948,
          "bbq.seo_meta_material": "304 Stainless Steel",
          "bbq.shopnew_heading_title": null,
          "bbq.side_burner_specification_type": null,
          "bbq.ref_specs_cutout_height": null,
          "bbq.side_burner_specs_configuration": null,
          "bbq.seo_meta_secondary_grilling_area": 308,
          "frequently.fbi_related_product": [
            "twin-eagles-36-inch-3-burner-propane-gas-grill-on-deluxe-cart-tebq36g-cl",
            "twin-eagles-36-vent-hood-tevh36-b",
            "twin-eagles-36-pellet-grill-smoker-insulating-jacket",
            "twineagles3-drawer-doorcombo-36x20-75-inch-tedd363-b",
          ],
          "bbq.grill_specs_cutout_depth": 24.25,
          "bbq.open_box_heading_title": null,
          "bbq.storage_specs_number_of_drawers": null,
          "bbq.storage_specs_cutout_height": null,
          "bbq.openbox_related_product": null,
          "bbq.grill_specs_type": "Pellet Grill/Smoker",
          "bbq.rear_infrared_burner_btu": null,
          "bbq.product_option_related_product": [
            "twin-eagles-36-pellet-grill-and-smoker-with-rotisserie-tepg36r",
            "twin-eagles-36-pellet-grill-and-smoker-tepg36g",
          ],
          "bbq.side_burner_specs_number_of_burners": null,
          "bbq.product_weight": 330,
          "bbq.configuration_type": ["Built In", "Freestanding"],
          "bbq.seo_meta_manufacturer_part_number": "TEPG36R",
          "bbq.related_product": null,
          "bbq.hinge_related_product": null,
          "bbq.shipping_dimensions": "40 x 48 x 32",
          "bbq.storage_specs_cutout_width": null,
          "bbq.hinge_heading_title": null,
          "bbq.seo_meta_fuel_type": "Pellets",
          "bbq.file_name": [
            "Twin Eagles Pellet Grill Owners Manual [Click to download]",
          ],
          "bbq.upload_file": null,
          "bbq.grill_specs_side_shelves": "No",
          "bbq.grill_specs_controller": "WiFi/Bluetooth/WiFi & Bluetooth",
          "bbq.side_burner_specification_gas_type": null,
          "bbq.ref_specs_heading_title": null,
          "bbq.storage_specs_orientation": null,
          "bbq.thermometer": "Digital",
          "bbq.grill_specs_class": "Luxury",
          "bbq.enable_call_availability_button": null,
          "bbq.overall_dimensions": ["36 x 25 x 31.62 "],
          "frequently.fbi_heading": "Frequently Bought Together",
          "bbq.storage_specs_cutout_depth": null,
          "bbq.storage_specs_mounting_type": null,
          "bbq.seo_meta_main_grilling_area": 640,
          _id: "twin-eagles-36-pellet-grill-and-smoker-with-rotisserie-tepg36r",
          "bbq.grill_specs_on_wheels": "No",
          "bbq.product_offer_cta": null,
          "bbq.openbox_product_text": null,
          "bbq.ref_specs_outdoor_rated": null,
          "bbq.single_burner_btus": null,
          "bbq.shipping_weight": 345,
          "bbq.seo_meta_manufacturer": "Twin Eagles",
          "bbq.manufacturer_download_heading_title": "Manufacturer's Manual",
          "bbq.grill_specs_no_of_racks": 2,
          "bbq.configuration_product": [
            "twin-eagles-36-pellet-grill-and-smoker-with-rotisserie-tepg36r",
            "twin-eagles-wi-fi-controlled-36-inch-stainless-steel-pellet-grill-smoker-rotisserie-on-cart-tepg36r-tepgb36",
          ],
          "bbq.shopnew_product_text": null,
          "bbq.size_heading_title": null,
          "bbq.ref_specs_cutout_width": null,
          "bbq.brand_storage_specs_type": null,
          "bbq.option_type": ["Pellets"],
          "bbq.ref_specs_type": null,
          "bbq.rear_infrared_burner": "No",
          "bbq.product_option_heading_title":
            "With Integrated Rotisserie System",
          "bbq.product_offer_image_link":
            "https://cdn.shopify.com/s/files/1/0660/1900/0577/files/SmallOpenBoxGrills.png?v=1676559383",
          "bbq.grill_specs_mount_type": "Built-In",
          "bbq.rotisserie_kit": "Integrated",
          "bbq.option_title": "Fuel Type",
          "bbq.grill_specs_kamado_width": null,
          _info:
            "Twin Eagles Wi-Fi Controlled 36-Inch Built-In Stainless Steel Pellet Grill and Smoker - with Rotisserie - TEPG36R",
          "bbq.seo_meta_series": "Pellet Series",
          "bbq.shopnew_related_product": null,
          "bbq.product_offer_url":
            "https://outdoorkitchenoutlet.com/collections/grills-open-box",
          "bbq.number_of_main_burners": 1,
          "bbq.storage_specs_number_of_doors": null,
          "bbq.seo_meta_brand": "Twin Eagles",
          "bbq.option_related_product": [
            "twin-eagles-36-pellet-grill-and-smoker-with-rotisserie-tepg36r",
          ],
          "bbq.side_burder_specification_gas_type": null,
          "bbq.product_option_name": ['"Yes", "No"]'],
          "bbq.grill_specs_cutout_height": 16.75,
          "bbq.hinge_selection": null,
          "bbq.total_surface_btu": null,
          "bbq.grill_specs_size": 36,
          "bbq.select_sale_tag": null,
          "bbq.ref_specs_door_type": null,
          "bbq.cutout_dimensions": ["34.25 x 24.25 x 16.25"],
          "bbq.seo_meta_made_in_usa": "Yes",
          "bbq.grill_lights": "Internal",
          "bbq.shipping_info_heading_title": "Shipping Information",
          "bbq.seo_meta_cooking_grid_dimensions": "32 x 20",
          "bbq.ref_specs_cutout_depth": null,
          "bbq.storage_specs_heading_title": null,
          "bbq.grill_specs_cutout_width": 34.25,
          size_title: null,
          "bbq.specification_heading_title": "Specification",
        },
        created_at: "2025-06-12T02:41:38.536136+00:00",
        variants: [
          {
            compare_at_price: 11442.05,
            taxable: true,
            weight_unit: "lb",
            requires_shipping: true,
            price: 10069,
            sku_suggest: ["TEPG36R"],
            qty: 10,
            costing: 6865.23,
            sku: "TEPG36R",
            grams: 149685.4821,
          },
        ],
        title:
          "Twin Eagles Wi-Fi Controlled 36-Inch Built-In Stainless Steel Pellet Grill and Smoker - with Rotisserie - TEPG36R",
        recommendations: {
          complementary_products: "",
          related_products_settings: "",
          search_boost: "",
          related_products: 0,
        },
        features: {
          furniture_features: "",
          color: "",
          furniture_material: "",
          flue_type: "",
          top_surface_material: "",
          cover_features: "",
          material: "",
          mounting_type: "",
          stove_top_type: "",
          extraction_type: "",
          grease_filter_material: "",
          water_filter_application: "",
          power_source: "",
        },
        updated_at: "2026-03-06T02:34:23.566572+00:00",
        collections: [
          {
            name: "Shop All Brands",
            id: 31,
            slug: "shop-all-brands",
          },
          {
            name: "Shop All BBQ Grills and Smokers",
            id: 87,
            slug: "shop-all-bbq-grills-and-smokers",
          },
          {
            name: "Shop All Built In Grills",
            id: 88,
            slug: "shop-all-built-in-grills",
          },
          {
            name: "OKO Top Rated",
            id: 186,
            slug: "oko-top-rated",
          },
          {
            name: "Shop All Twin Eagles",
            id: 211,
            slug: "shop-all-twin-eagles",
          },
          {
            name: "Twin Eagles",
            id: 213,
            slug: "twin-eagles",
          },
          {
            name: "Best Sellers for Pellet Grills",
            id: 223,
            slug: "best-sellers-for-pellet-grills",
          },
          {
            name: "Twin Eagles Grills",
            id: 224,
            slug: "twin-eagles-grills",
          },
          {
            name: "Shop All Pellet Grills",
            id: 226,
            slug: "shop-all-pellet-grills",
          },
          {
            name: "Best Sellers for Built In Pellet Grills",
            id: 390,
            slug: "best-sellers-for-built-in-pellet-grills",
          },
          {
            name: "Built In Pellet Grills",
            id: 391,
            slug: "built-in-pellet-grills",
          },
          {
            name: "Twin Eagles Built-In Grills",
            id: 958,
            slug: "twin-eagles-built-in-grills",
          },
        ],
        ratings: {
          rating_count: "'2",
        },
        product_id: 5331,
        options: {
          option3: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
          option1: {
            name: "Title",
            value: "Default Title",
            linked_to: 0,
          },
          option2: {
            name: "",
            value: "",
            linked_to: 0,
          },
        },
        seo: {
          description:
            "The Twin Eagles Wood Fired Pellet Smoker & Grill combines the ultimate in performance, standard for premium pellet grills. Call us now!",
          title: "",
        },
        brand: "Twin Eagles",
        images: [
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEPG36R.jpg?v=1743611128",
            alt: 0,
            position: 1,
          },
        ],
        custom_fields: [],
        handle:
          "twin-eagles-36-pellet-grill-and-smoker-with-rotisserie-tepg36r",
        published: true,
        frequently_bought_together: [],
        tags: [
          "304 Stainless Steel",
          "34-42 Inches",
          "Best Sellers for Built In Pellet Grills",
          "Best Sellers for Pellet Grills",
          "Built In",
          "Built In Pellet Grills",
          "Digital",
          "Internal Lights",
          "No Rear Infrared Burner",
          "No Rotisserie",
          "OKO Top Rated",
          "Pellet",
          "Shop All BBQ Grills and Smoker",
          "Shop All BBQ Grills and Smokers",
          "Shop All Pellet Grills",
          "Shop All Twin Eagles",
          "Twin Eagles",
          "Twin Eagles Grills",
          "twinVCPG36",
          "Width 34-42 Inches",
          "Yes",
        ],
        product_type: "",
        uploaded_at: "2025-06-12T02:41:38.536119+00:00",
        product_category: [
          {
            category_name: "Uncategorized",
            id: 6,
          },
        ],
        region_pricing: {
          compare_price_us: null,
          included_us: null,
          price_us: null,
        },
        status: "active",
      },
      {
        custom_metafields: {
          custom_sale_tag: "0.0",
          size_headings:
            '{"size_1": "", "size_2": "", "size_3": "", "size_4": "", "size_5": "", "size_6": "", "heading_title": ""}',
          open_box: "0.0",
          option_headings:
            '{"option1": "W/O Rotisserie", "option2": "W/ Rotisserie", "option3": "", "heading_title": "Product Option"}',
        },
        body_html:
          "<p>Get ready to experience predictable performance and convenience with the Twin Eagles Wi-Fi Controlled 36-Inch Freestanding Pellet Grill and Smoker With Rotisserie ‚Äì TEPG36R + TEPGB36. This grill is the perfect addition to your outdoor cooking and entertaining space, offering a wide range of features that ensure quality and consistency in every meal.</p><p>Constructed using all 304 stainless steel and seamless heli-arc welded construction, the Twin Eagles pellet grill stands out for its maximum strength and durability. Its double-lined hood has a commercial heavy-duty oven-grade braided 304 stainless steel gasket, which creates the perfect insulation and seals to keep smoke in and offer maximum heat retention.</p><p>With the Twin Eagles Mobile application, available on Apple and Android devices, you can monitor and manage temperatures in real-time, making it easier to cook the perfect meal every time. The three (3) temperature probes allow you to monitor the temperature of food items with multiple actions simultaneously. The front control panel features an integrated weather proof touch screen control that allows you to set temperatures from 140-725 degrees Fahrenheit manually or choose from many pre-programmed food items.</p><p>This grill is highly versatile, thanks to 4 different inserts that offer unique cooking styles. The 16 gauge stainless steel vaporizer plate turns drippings into smoky vapors, while the open fire insert offers searing or bark on ribs. The radiant heat briquette tray or the lump charcoal tray can be used for smoking or high heat. The sliding front hopper opens to load 13 pounds of pellets.</p><p>The built-in rotisserie ensures easy set-up and perfect results with every use. The grill comes with three stainless steel hooks with five positions, allowing you to hang foods such as sausages over the grill surface for even cooking and perfect smoke bake grill sear flavor.</p><p>The Twin Eagles Wood-Fired Pellet Smoker and Grill are the ultimate in performance and convenience, setting the standard for premium pellet grills. Plus, it's made in the USA, ensuring the highest quality and craftsmanship. Upgrade your outdoor cooking game with this top-of-the-line grill today.</p>",
        accentuate_data: {
          "bbq.configuration_heading_title": "Configuration",
          "bbq.grill_specs_color": "Stainless Steel",
          "bbq.seo_meta_total_grill_area": 939,
          "bbq.seo_meta_material": "304 Stainless Steel",
          "bbq.shopnew_heading_title": null,
          "bbq.side_burner_specification_type": null,
          "bbq.ref_specs_cutout_height": null,
          "bbq.side_burner_specs_configuration": null,
          "bbq.seo_meta_secondary_grilling_area": 315,
          "frequently.fbi_related_product": [
            "twin-eagles-54-grill-base-with-storage-drawers-two-doors-tegb54sd-b",
            "twin-eagles-30-inch-built-in-stainless-steel-outdoor-bar-sink-ice-bin-cooler-teob30-b",
            "twin-eagles-cklp-te1bql-conversion-kit-te1bq-ng-lp-lp-regulator-cklp-te1bq",
            "twin-eagles-u-burner-kit-tebq36-teub36-kit",
          ],
          "bbq.grill_specs_cutout_depth": null,
          "bbq.open_box_heading_title": null,
          "bbq.storage_specs_number_of_drawers": null,
          "bbq.storage_specs_cutout_height": null,
          "bbq.openbox_related_product": null,
          "bbq.grill_specs_type": "Pellet Grill/Smoker",
          "bbq.rear_infrared_burner_btu": null,
          "bbq.product_option_related_product": [
            "twin-eagles-wi-fi-controlled-36-inch-stainless-steel-pellet-grill-smoker-rotisserie-on-cart-tepg36r-tepgb36",
            "twin-eagles-wifi-controlled-36-inch-stainless-steel-pellet-grill-and-smoker-on-cart-tepg36g-tepgb36",
          ],
          "bbq.side_burner_specs_number_of_burners": null,
          "bbq.product_weight": 480,
          "bbq.configuration_type": ["Built In", "Freestanding"],
          "bbq.seo_meta_manufacturer_part_number": "TEPG36R + TEPGB36",
          "bbq.related_product": null,
          "bbq.hinge_related_product": null,
          "bbq.shipping_dimensions": "40 x 48 x 68",
          "bbq.storage_specs_cutout_width": null,
          "bbq.hinge_heading_title": null,
          "bbq.seo_meta_fuel_type": "Pellets",
          "bbq.file_name": [
            "Twin Eagles Pellet Grill Owners Manual [Click to download]",
          ],
          "bbq.upload_file": [
            "https://cdn.accentuate.io/7846018056449/-1671630088252/Twin-Eagles-Pellet-Grill-Owners-Manual-v1672853317029.pdf",
          ],
          "bbq.grill_specs_side_shelves": "Yes",
          "bbq.grill_specs_controller": "WiFi/Bluetooth/WiFi & Bluetooth",
          "bbq.side_burner_specification_gas_type": null,
          "bbq.ref_specs_heading_title": null,
          "bbq.storage_specs_orientation": null,
          "bbq.thermometer": "Digital",
          "bbq.grill_specs_class": "Luxury",
          "bbq.enable_call_availability_button": null,
          "bbq.overall_dimensions": ["60.18 x 26.09 x 68.23"],
          "frequently.fbi_heading": "Frequently Bought Together",
          "bbq.storage_specs_cutout_depth": null,
          "bbq.storage_specs_mounting_type": null,
          "bbq.seo_meta_main_grilling_area": 624,
          _id: "twin-eagles-wi-fi-controlled-36-inch-stainless-steel-pellet-grill-smoker-rotisserie-on-cart-tepg36r-tepgb36",
          "bbq.grill_specs_on_wheels": "Yes",
          "bbq.product_offer_cta": null,
          "bbq.openbox_product_text": null,
          "bbq.ref_specs_outdoor_rated": null,
          "bbq.single_burner_btus": null,
          "bbq.shipping_weight": 495,
          "bbq.seo_meta_manufacturer": "Twin Eagles",
          "bbq.manufacturer_download_heading_title": "Manufacturer's Manual",
          "bbq.grill_specs_no_of_racks": 2,
          "bbq.configuration_product": [
            "twin-eagles-36-pellet-grill-and-smoker-with-rotisserie-tepg36r",
            "twin-eagles-wi-fi-controlled-36-inch-stainless-steel-pellet-grill-smoker-rotisserie-on-cart-tepg36r-tepgb36",
          ],
          "bbq.shopnew_product_text": null,
          "bbq.size_heading_title": null,
          "bbq.ref_specs_cutout_width": null,
          "bbq.brand_storage_specs_type": "Access Doors",
          "bbq.option_type": ["Pellets"],
          "bbq.ref_specs_type": null,
          "bbq.rear_infrared_burner": "No",
          "bbq.product_option_heading_title":
            "With Integrated Rotisserie System",
          "bbq.product_offer_image_link":
            "https://cdn.shopify.com/s/files/1/0660/1900/0577/files/SmallOpenBoxGrills.png?v=1676559383",
          "bbq.grill_specs_mount_type": "Freestanding",
          "bbq.rotisserie_kit": "Integrated",
          "bbq.option_title": "Gas Type",
          "bbq.grill_specs_kamado_width": null,
          _info:
            "Twin Eagles Wi-Fi Controlled 36-Inch - Grill On Deluxe Cart - Pellet Grill And Smoker - With Rotisserie - TEPG36R + TEPGB36",
          "bbq.seo_meta_series": "Pellet Series",
          "bbq.shopnew_related_product": null,
          "bbq.product_offer_url":
            "https://outdoorkitchenoutlet.com/collections/grills-open-box",
          "bbq.number_of_main_burners": 1,
          "bbq.storage_specs_number_of_doors": 2,
          "bbq.seo_meta_brand": "Twin Eagles",
          "bbq.option_related_product": [
            "twin-eagles-wi-fi-controlled-36-inch-stainless-steel-pellet-grill-smoker-rotisserie-on-cart-tepg36r-tepgb36",
          ],
          "bbq.side_burder_specification_gas_type": null,
          "bbq.product_option_name": ['"Yes", "No"]'],
          "bbq.grill_specs_cutout_height": null,
          "bbq.hinge_selection": null,
          "bbq.total_surface_btu": null,
          "bbq.grill_specs_size": 36,
          "bbq.select_sale_tag": null,
          "bbq.ref_specs_door_type": null,
          "bbq.cutout_dimensions": null,
          "bbq.seo_meta_made_in_usa": "Yes",
          "bbq.grill_lights": "Internal",
          "bbq.shipping_info_heading_title": "Shipping Information",
          "bbq.seo_meta_cooking_grid_dimensions": "34 x 18.5",
          "bbq.ref_specs_cutout_depth": null,
          "bbq.storage_specs_heading_title": null,
          "bbq.grill_specs_cutout_width": null,
          size_title: null,
          "bbq.specification_heading_title": "Specification",
        },
        created_at: "2025-06-12T02:41:40.107420+00:00",
        variants: [
          {
            compare_at_price: "12929.54",
            price: 11378,
            sku_suggest: ["TEPG36R + TEPGB36"],
            qty: 10,
            sku: "TEPG36R + TEPGB36",
            grams: 0,
          },
        ],
        title:
          "Twin Eagles Wi-Fi Controlled 36-Inch - Grill On Deluxe Cart - Pellet Grill And Smoker - With Rotisserie - TEPG36R + TEPGB36",
        recommendations: {
          complementary_products: "",
          related_products_settings: "",
          search_boost: "",
          related_products: 0,
        },
        features: {
          furniture_features: "",
          color: "",
          furniture_material: "",
          flue_type: "",
          top_surface_material: "",
          cover_features: "",
          material: "",
          mounting_type: "",
          stove_top_type: "",
          extraction_type: "",
          grease_filter_material: "",
          water_filter_application: "",
          power_source: "",
        },
        updated_at: "2026-03-06T02:34:23.562153+00:00",
        collections: [
          {
            name: "Shop All Brands",
            id: 31,
            slug: "shop-all-brands",
          },
          {
            name: "Shop All BBQ Grills and Smokers",
            id: 87,
            slug: "shop-all-bbq-grills-and-smokers",
          },
          {
            name: "Shop All Twin Eagles",
            id: 211,
            slug: "shop-all-twin-eagles",
          },
          {
            name: "Twin Eagles",
            id: 213,
            slug: "twin-eagles",
          },
          {
            name: "Best Sellers for Freestanding Pellet Grills",
            id: 221,
            slug: "best-sellers-for-freestanding-pellet-grills",
          },
          {
            name: "Freestanding Pellet Grills",
            id: 222,
            slug: "freestanding-pellet-grills",
          },
          {
            name: "Best Sellers for Pellet Grills",
            id: 223,
            slug: "best-sellers-for-pellet-grills",
          },
          {
            name: "Twin Eagles Grills",
            id: 224,
            slug: "twin-eagles-grills",
          },
          {
            name: "Freestanding Pellet Grills",
            id: 225,
            slug: "freestanding-pellet-grills-1",
          },
          {
            name: "Shop All Pellet Grills",
            id: 226,
            slug: "shop-all-pellet-grills",
          },
          {
            name: "Twin Eagles Freestanding Grills",
            id: 959,
            slug: "twin-eagles-freestanding-grills",
          },
          {
            name: "Shop All Freestanding Grills",
            id: 962,
            slug: "shop-all-freestanding-grills",
          },
        ],
        ratings: {
          rating_count: "'2",
        },
        product_id: 5534,
        options: {
          option3: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
          option1: {
            name: "Title",
            value: "Default Title",
            linked_to: 0,
          },
          option2: {
            name: "",
            value: "",
            linked_to: 0,
          },
        },
        seo: {
          description:
            "The Twin Eagles pellet grill features a maximum strength, durability & finished signature high-polished accent. Call us now for best pricing!",
          title:
            "Twin Eagles Wi-Fi Controlled Pellet Grill - TEPG36R + TEPGB36",
        },
        brand: "Twin Eagles",
        images: [
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEPG36R_TEPGB36.png?v=1743609375",
            alt: 0,
            position: 1,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEPG36G_TEPGB36.1_bdc8efa4-1948-4960-9a23-17a30292e320.jpg?v=1743609378",
            alt: 0,
            position: 2,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEPG36G_TEPGB36.3_23714c4e-3b8e-4ac3-a619-069618a0b7bd.jpg?v=1743609380",
            alt: 0,
            position: 3,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEPG36G_TEPGB36.4_b96a14b3-c4eb-4a91-afe6-703a63cb6336.jpg?v=1743609382",
            alt: 0,
            position: 4,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEPG36G_TEPGB36.6_b7e21dda-c938-4194-b62e-76afe244c49e.jpg?v=1743609385",
            alt: 0,
            position: 5,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEPG36G_TEPGB36.7_d5fa5246-5ed5-455d-a7a8-34a36d39a94e.jpg?v=1743609388",
            alt: 0,
            position: 6,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEPG36G_TEPGB36.8_3d33e682-24b5-4a3e-9d20-d44139d8407c.jpg?v=1743609391",
            alt: 0,
            position: 7,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEPG36G_TEPGB36.9_3fdcabe8-df04-43e9-8943-6295f129db87.jpg?v=1743609393",
            alt: 0,
            position: 8,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEPG36G_TEPGB36_65d3c5f9-b23e-4289-a006-b2ebc0ee0f2a.jpg?v=1743609401",
            alt: 0,
            position: 9,
          },
        ],
        custom_fields: [],
        handle:
          "twin-eagles-wi-fi-controlled-36-inch-stainless-steel-pellet-grill-smoker-rotisserie-on-cart-tepg36r-tepgb36",
        published: true,
        frequently_bought_together: [],
        tags: [
          "304 Stainless Steel",
          "34-42 Inches",
          "Best Sellers for Freestanding Pellet Grills",
          "Best Sellers for Pellet Grills",
          "Digital",
          "Freestanding",
          "Freestanding Pellet Grills",
          "Internal",
          "Internal Lights",
          "No Rear Infrared Burner",
          "No Rotisserie",
          "Pellet",
          "Shop All BBQ Grills and Smoker",
          "Shop All BBQ Grills and Smokers",
          "Shop All Pellet Grills",
          "Shop All Twin Eagles",
          "Twin Eagles",
          "Twin Eagles Grills",
          "twinVCBQ36F",
          "Yes",
        ],
        product_type: "",
        uploaded_at: "2025-06-12T02:41:40.107410+00:00",
        product_category: [],
        region_pricing: {
          compare_price_us: null,
          included_us: null,
          price_us: null,
        },
        status: "active",
      },
      {
        custom_metafields: {
          custom_sale_tag: "0.0",
          size_headings:
            '{"size_1": "", "size_2": "", "size_3": "", "size_4": "", "size_5": "", "size_6": "", "heading_title": ""}',
          open_box: "0.0",
          option_headings:
            '{"option1": "W/O Rotisserie", "option2": "W/ Rotisserie", "option3": "", "heading_title": "Product Option"}',
        },
        body_html:
          '<p><span style="font-weight: 400;">Experience unparalleled outdoor cooking performance and convenience with the Twin Eagles Wi-Fi Controlled 36-Inch Built-In Stainless Steel Pellet Grill and Smoker - TEPG36G. Crafted in the USA using premium-grade 304 stainless steel, this grill boasts seamless heli-arc welded construction for optimal strength and durability, while its high-polished accents add an elegant touch to your outdoor cooking space. With features like a double-lined hood, heavy-duty stainless steel gasket, and integrated Wi-Fi controller with a mobile app, you can control your grill from anywhere.</span></p>\n<p><span style="font-weight: 400;">The 16 gauge stainless steel vaporizer plate, radiant heat briquette tray, and lump charcoal tray provide versatile cooking options, while the front load pellet hopper allows for easy refilling. With its removable drip trays, accessory storage, and hanger hooks for even cooking, this Twin Eagles Smoker Pellet Grill is the perfect choice for smoking, baking, grilling, and searing.</span></p>\n<h4><b>About Twin Eagles</b></h4>\n<p><b></b><span style="font-weight: 400;">Twin Eagles is a well-respected brand in the outdoor kitchen equipment industry, known for its innovative and durable appliances. Whether you\'re a professional chef or a home cook, </span><a href="https://outdoorkitchenoutlet.com/collections/twin-eagles" title="Twin Eagles"><span style="color: #2b00ff;"><span style="font-weight: 400;">Twin Eagles</span></span></a><span style="font-weight: 400;"> offers a wide range of high-quality products that meet your needs. What sets Twin Eagles apart from other manufacturers is their meticulous attention to detail and design, combined with their commitment to using top-notch materials and cutting-edge technology. By choosing Twin Eagles for your outdoor kitchen, you can expect a luxurious and functional environment that will last for years.</span></p>\n<h4><b>Twin Eagles Pellet Grill Key Features:</b></h4>\n<ul>\n<li>\n<p>Superior Construction: <span style="font-weight: 400;">Made in the USA with premium-grade 304 stainless steel for unbeatable durability and longevity.</span></p>\n</li>\n<li>\n<p>Ultimate Control:<span style="font-weight: 400;"> Enjoy the convenience of touchscreen controls and Wi-Fi connectivity, allowing you to monitor and adjust your grill\'s settings from anywhere.</span></p>\n</li>\n<li>\n<p>Versatile Cooking: <span style="font-weight: 400;">Experience a wide range of cooking options with the included radiant heat briquette tray and lump charcoal tray, giving you the freedom to smoke, bake, grill, or sear your favorite foods.</span></p>\n</li>\n<li>\n<p>Easy Pellet Loading: <span style="font-weight: 400;">The front load 13 lb capacity pellet hopper makes it effortless to check and refill your natural wood-fired pellets as needed.</span></p>\n</li>\n<li>\n<p>Precise Temperature Management:<span style="font-weight: 400;"> Achieve perfect results every time with a temperature range of 140 - 725 degrees Fahrenheit, providing optimal heat control for various cooking techniques.</span></p>\n</li>\n</ul>\n<h4><b>Added Value:¬†</b></h4>\n<ol>\n<li style="font-weight: 400;">\n<p><b>Lowest Cost Guaranteed:</b><span style="font-weight: 400;"> We ensure that our built-in grills are competitively priced, offering you the best value for your investment.</span></p>\n</li>\n<li style="font-weight: 400;">\n<p><b>Lifetime Warranty:</b><span style="font-weight: 400;"> Our grills come with a lifetime warranty, providing peace of mind and ensuring that your investment is protected for years to come.</span></p>\n</li>\n<li style="font-weight: 400;">\n<p><b>Save up to 60%: </b><span style="font-weight: 400;">With our built-in grills, you can enjoy significant savings compared to other high-end grill options on the market.</span></p>\n</li>\n</ol>',
        accentuate_data: {
          "bbq.configuration_heading_title": "Configuration",
          "bbq.grill_specs_color": "Stainless Steel",
          "bbq.seo_meta_total_grill_area": 939,
          "bbq.seo_meta_material": "304 Stainless Steel",
          "bbq.shopnew_heading_title": null,
          "bbq.side_burner_specification_type": null,
          "bbq.ref_specs_cutout_height": null,
          "bbq.side_burner_specs_configuration": null,
          "bbq.seo_meta_secondary_grilling_area": 315,
          "frequently.fbi_related_product": [
            "twin-eagles-36-twin-eagles-vinyl-cover-for-tepg36-freestanding-vcpg36f",
            "twin-eagles-vinyl-cover-42-inch-freestanding-one-grill-vce1bq42f",
            "twin-eagles-24-inch-drop-in-stainless-steel-ice-bin-cooler-teoc24d-b",
            "twin-eagles-u-burner-kit-tebq36-teub36-kit",
          ],
          "bbq.grill_specs_cutout_depth": 24.25,
          "bbq.open_box_heading_title": null,
          "bbq.storage_specs_number_of_drawers": null,
          "bbq.storage_specs_cutout_height": null,
          "bbq.openbox_related_product": null,
          "bbq.grill_specs_type": "Pellet Grill/Smoker",
          "bbq.rear_infrared_burner_btu": null,
          "bbq.product_option_related_product": [
            "twin-eagles-36-pellet-grill-and-smoker-with-rotisserie-tepg36r",
            "twin-eagles-36-pellet-grill-and-smoker-tepg36g",
          ],
          "bbq.side_burner_specs_number_of_burners": null,
          "bbq.product_weight": 320,
          "bbq.configuration_type": ["Built In", "Freestanding"],
          "bbq.seo_meta_manufacturer_part_number": "TEPG36G",
          "bbq.related_product": null,
          "bbq.hinge_related_product": null,
          "bbq.shipping_dimensions": "40 x 48 x 68",
          "bbq.storage_specs_cutout_width": null,
          "bbq.hinge_heading_title": null,
          "bbq.seo_meta_fuel_type": "Pellets",
          "bbq.file_name": [
            "Twin Eagles Pellet Grill Owners Manual [Click to download]",
          ],
          "bbq.upload_file": [
            "https://cdn.accentuate.io/7846017925377/-1671630088252/Twin-Eagles-Pellet-Grill-Owners-Manual-v1672851052586.pdf",
          ],
          "bbq.grill_specs_side_shelves": "No",
          "bbq.grill_specs_controller": "WiFi/Bluetooth/WiFi & Bluetooth",
          "bbq.side_burner_specification_gas_type": null,
          "bbq.ref_specs_heading_title": null,
          "bbq.storage_specs_orientation": null,
          "bbq.thermometer": "Digital",
          "bbq.grill_specs_class": "Luxury",
          "bbq.enable_call_availability_button": null,
          "bbq.overall_dimensions": ["36 x 25 x 31.64"],
          "frequently.fbi_heading": "Frequently Bought Together",
          "bbq.storage_specs_cutout_depth": null,
          "bbq.storage_specs_mounting_type": null,
          "bbq.seo_meta_main_grilling_area": 624,
          _id: "twin-eagles-36-pellet-grill-and-smoker-tepg36g",
          "bbq.grill_specs_on_wheels": "No",
          "bbq.product_offer_cta": null,
          "bbq.openbox_product_text": null,
          "bbq.ref_specs_outdoor_rated": null,
          "bbq.single_burner_btus": null,
          "bbq.shipping_weight": 335,
          "bbq.seo_meta_manufacturer": "Twin Eagles",
          "bbq.manufacturer_download_heading_title": "Manufacturer's Manual",
          "bbq.grill_specs_no_of_racks": 2,
          "bbq.configuration_product": [
            "twin-eagles-36-pellet-grill-and-smoker-tepg36g",
            "twin-eagles-wifi-controlled-36-inch-stainless-steel-pellet-grill-and-smoker-on-cart-tepg36g-tepgb36",
          ],
          "bbq.shopnew_product_text": null,
          "bbq.size_heading_title": null,
          "bbq.ref_specs_cutout_width": null,
          "bbq.brand_storage_specs_type": null,
          "bbq.option_type": ["Pellets"],
          "bbq.ref_specs_type": null,
          "bbq.rear_infrared_burner": "No",
          "bbq.product_option_heading_title":
            "With Integrated Rotisserie System",
          "bbq.product_offer_image_link": null,
          "bbq.grill_specs_mount_type": "Built-In",
          "bbq.rotisserie_kit": null,
          "bbq.option_title": "Fuel Type",
          "bbq.grill_specs_kamado_width": null,
          _info: "Twin Eagles - 36-Inch Pellet Grill and Smoker - TEPG36G",
          "bbq.seo_meta_series": "Pellet Series",
          "bbq.shopnew_related_product": null,
          "bbq.product_offer_url": null,
          "bbq.number_of_main_burners": 1,
          "bbq.storage_specs_number_of_doors": null,
          "bbq.seo_meta_brand": "Twin Eagles",
          "bbq.option_related_product": [
            "twin-eagles-36-pellet-grill-and-smoker-tepg36g",
          ],
          "bbq.side_burder_specification_gas_type": null,
          "bbq.product_option_name": ['"Yes", "No"]'],
          "bbq.grill_specs_cutout_height": 16.75,
          "bbq.hinge_selection": null,
          "bbq.total_surface_btu": null,
          "bbq.grill_specs_size": 36,
          "bbq.select_sale_tag": null,
          "bbq.ref_specs_door_type": null,
          "bbq.cutout_dimensions": ["34.25 x 24.25 x 16.25"],
          "bbq.seo_meta_made_in_usa": "Yes",
          "bbq.grill_lights": "Internal",
          "bbq.shipping_info_heading_title": "Shipping Information",
          "bbq.seo_meta_cooking_grid_dimensions": "34 x 18.5",
          "bbq.ref_specs_cutout_depth": null,
          "bbq.storage_specs_heading_title": null,
          "bbq.grill_specs_cutout_width": 34.25,
          size_title: null,
          "bbq.specification_heading_title": "Specification",
        },
        created_at: "2025-06-12T02:41:38.527568+00:00",
        variants: [
          {
            compare_at_price: 10567.05,
            taxable: true,
            weight_unit: "lb",
            requires_shipping: true,
            price: 9299,
            sku_suggest: ["TEPG36G"],
            qty: 10,
            costing: 6340.23,
            sku: "TEPG36G",
            grams: 145149.5584,
          },
        ],
        title: "Twin Eagles - 36-Inch Pellet Grill and Smoker - TEPG36G",
        recommendations: {
          complementary_products: "",
          related_products_settings: "",
          search_boost: "",
          related_products: 0,
        },
        features: {
          furniture_features: "",
          color: "",
          furniture_material: "",
          flue_type: "",
          top_surface_material: "",
          cover_features: "",
          material: "",
          mounting_type: "",
          stove_top_type: "",
          extraction_type: "",
          grease_filter_material: "",
          water_filter_application: "",
          power_source: "",
        },
        updated_at: "2026-03-06T02:34:22.972356+00:00",
        collections: [
          {
            name: "Shop All Brands",
            id: 31,
            slug: "shop-all-brands",
          },
          {
            name: "Shop All BBQ Grills and Smokers",
            id: 87,
            slug: "shop-all-bbq-grills-and-smokers",
          },
          {
            name: "Shop All Built In Grills",
            id: 88,
            slug: "shop-all-built-in-grills",
          },
          {
            name: "Shop All Twin Eagles",
            id: 211,
            slug: "shop-all-twin-eagles",
          },
          {
            name: "Twin Eagles",
            id: 213,
            slug: "twin-eagles",
          },
          {
            name: "Best Sellers for Pellet Grills",
            id: 223,
            slug: "best-sellers-for-pellet-grills",
          },
          {
            name: "Twin Eagles Grills",
            id: 224,
            slug: "twin-eagles-grills",
          },
          {
            name: "Shop All Pellet Grills",
            id: 226,
            slug: "shop-all-pellet-grills",
          },
          {
            name: "Best Sellers for Twin Eagles",
            id: 227,
            slug: "best-sellers-for-twin-eagles",
          },
          {
            name: "Best Sellers for Built In Pellet Grills",
            id: 390,
            slug: "best-sellers-for-built-in-pellet-grills",
          },
          {
            name: "Built In Pellet Grills",
            id: 391,
            slug: "built-in-pellet-grills",
          },
          {
            name: "Twin Eagles Built-In Grills",
            id: 958,
            slug: "twin-eagles-built-in-grills",
          },
        ],
        ratings: {
          rating_count: "'5",
        },
        product_id: 5330,
        options: {
          option3: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
          option1: {
            name: "Title",
            value: "Default Title",
            linked_to: 0,
          },
          option2: {
            name: "",
            value: "",
            linked_to: 0,
          },
        },
        seo: {
          description:
            "The Twin Eagles Wood Fired Pellet Smoker and Grill combines the ultimate in performance and convenience. For best pricing call us now!",
          title: "Twin Eagles 36 Inch Pellet Grill and Smoker - TEPG36G",
        },
        brand: "Twin Eagles",
        images: [
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEPG36G.jpg?v=1743609372",
            alt: 0,
            position: 1,
          },
        ],
        custom_fields: [],
        handle: "twin-eagles-36-pellet-grill-and-smoker-tepg36g",
        published: true,
        frequently_bought_together: [],
        tags: [
          "0-26 Inches",
          "304 Stainless Steel",
          "Best Sellers for Built In Pellet Grills",
          "Best Sellers for Pellet Grills",
          "Best Sellers for Twin Eagles",
          "Built In",
          "Built In Pellet Grills",
          "Digital",
          "Internal Lights",
          "No Rear Infrared Burner",
          "No Rotisserie",
          "Pellet",
          "Shop All BBQ Grills and Smoker",
          "Shop All BBQ Grills and Smokers",
          "Shop All Pellet Grills",
          "Shop All Twin Eagles",
          "Twin Eagles",
          "Twin Eagles Grills",
          "twinVCBQ36",
          "Width 0-26 Inches",
          "Yes",
        ],
        product_type: "",
        uploaded_at: "2025-06-12T02:41:38.527553+00:00",
        product_category: [],
        region_pricing: {
          compare_price_us: null,
          included_us: null,
          price_us: null,
        },
        status: "active",
      },
    ],
    fbt_bundle: [],
    fbt_carousel: [
      {
        custom_metafields: {
          custom_sale_tag: "0.0",
          size_headings:
            '{"size_1": "30 Inches", "size_2": "36 Inches", "size_3": "42 Inches", "size_4": "", "size_5": "", "size_6": 0.0, "heading_title": "Size"}',
          open_box: "",
          option_headings:
            '{"option1": "LP", "option2": "NG", "option3": "", "heading_title": "Gas Type"}',
        },
        body_html:
          '<p data-mce-fragment="1"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Introducing the Twin Eagles 36 Inch Grills. This grill is the epitome of the ultimate grilling system, featuring Twin Eagles\' proprietary 5-part grilling system. Designed and engineered exclusively by Twin Eagles, this advanced technology utilizes direct and radiant heat to provide an unparalleled grilling experience.</span></p>\n<p data-mce-fragment="1"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">With 25,000 BTU burners constructed from 14 gauge 304 stainless steel main burners, this grill is built for durability and precision. The unique synergistic grilling system ensures that your grill preheats faster, reaches higher temperatures, and distributes heat more evenly. This means you can enjoy perfectly cooked meals every time.</span></p>\n<h4 data-mce-fragment="1">\n<b data-mce-fragment="1">About Twin Eagles</b><b data-mce-fragment="1"><br data-mce-fragment="1"></b>\n</h4>\n<p><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Twin Eagles is a well-respected brand in the outdoor kitchen equipment industry, known for its innovative and durable appliances. Whether you\'re a professional chef or a home cook, </span><a href="https://outdoorkitchenoutlet.com/collections/twin-eagles" title="Twin Eagles"><span style="color: #2b00ff;"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Twin Eagles</span></span></a><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> offers a wide range of high-quality products that meet your needs. What sets Twin Eagles apart from other manufacturers is their meticulous attention to detail and design, combined with their commitment to using top-notch materials and cutting-edge technology. By choosing Twin Eagles for your outdoor kitchen, you can expect a luxurious and functional environment that will last for years.</span></p>\n<h4>\n<span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"><b data-mce-fragment="1">Twin Eagles Built-in Key Features:</b></span><br data-mce-fragment="1">\n</h4>\n<ul data-mce-fragment="1">\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<p><b data-mce-fragment="1">High-Quality Ceramic Briquettes</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">: The Twin Eagles grill features high-quality ceramic briquettes that evenly distribute heat and provide exceptional heat retention.</span></p>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<p><b data-mce-fragment="1">High-polished Accents</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">: Capture the essence of your grill and accessories with their exquisite design and luxurious refinements.</span></p>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<p><b data-mce-fragment="1">Hexagonal Grates: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Ensure consistent cooking results and enhance the flavor of your food.</span></p>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<p><b data-mce-fragment="1">Zone Dividers:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> This grill has zone dividers that let you create multiple cooking zones with different temperatures. It allows you to cook different types of food at the same time, making it efficient and versatile.</span></p>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<p><b data-mce-fragment="1">Reliable Hot Surface Ignition:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> The hot surface ignition system ensures quick and reliable grill ignition every time. No more hassle with matches or lighters. Just push a button for convenient and efficient ignition.</span></p>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<p><b data-mce-fragment="1">Grill Hood Assist System</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">: This outdoor gas grill feature simplifies the process of opening and closing the hood by utilizing concealed heavy-duty extension springs, which effectively reduce the weight load.</span></p>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<p><b data-mce-fragment="1">Interior Lights: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Elevate your grilling experience by adding an interior light hood-activated light switch for nighttime grilling. Enjoy the convenience and ease of cooking outdoors even after the sun sets, while ensuring optimal visibility and control over your culinary creations.</span></p>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<p><b data-mce-fragment="1">Exclusive Control Illumination:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> The Twin Eagles grill control knobs have exclusive illumination for enhanced visibility in low light. Adds elegance to your grilling setup.</span></p>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<p><b data-mce-fragment="1">Extra Large 3-Position Warming/Cooking Rack:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> This versatile rack provides additional cooking space or can be used to keep food warm while you prepare other dishes.</span></p>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<p><b data-mce-fragment="1">Sealed Smoker Box:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> This feature enhances the versatility of the grill and adds a new dimension to your grilling experience.</span></p>\n</li>\n</ul>\n<h4 data-mce-fragment="1"><b data-mce-fragment="1">Added Value:¬†</b></h4>\n<ol data-mce-fragment="1">\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<p><b data-mce-fragment="1">Lowest Cost Guaranteed:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> We ensure that our built-in grills are competitively priced, offering you the best value for your investment.</span></p>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<p><b data-mce-fragment="1">Lifetime Warranty:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> Our grills come with a lifetime warranty, providing peace of mind and ensuring that your investment is protected for years to come.</span></p>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<p><b data-mce-fragment="1">Save up to 60%: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">With our built-in grills, you can enjoy significant savings compared to other high-end grill options on the market.</span></p>\n</li>\n</ol>',
        accentuate_data: {
          "bbq.configuration_heading_title": "Configuration",
          "bbq.grill_specs_color": "Stainless Steel",
          "bbq.seo_meta_total_grill_area": 948,
          "bbq.seo_meta_material": "304 Stainless Steel",
          "bbq.shopnew_heading_title": null,
          "bbq.side_burner_specification_type": null,
          "bbq.ref_specs_cutout_height": null,
          "bbq.side_burner_specs_configuration": null,
          "bbq.seo_meta_secondary_grilling_area": 308,
          "frequently.fbi_related_product": [
            "twin-eagles-36-inch-3-burner-natural-gas-grill-sear-zone-infrared-rotisserie-burner-deluxe-cart-tebq36rs-cn",
            "twin-eagles-eagle-one-54-inch-4-burner-propane-gas-grill-sear-zone-two-infrared-rotisserie-burners-on-deluxe-cart-te1bq54rs-l-1",
            "twin-eagles-ng-conversion-kit-for-tetg-lp-to-ng-ckng-tetg",
            "twin-eagles-vinyl-cover-24-inch-tepb24-built-in-vcpb24",
          ],
          "bbq.grill_specs_cutout_depth": 24.25,
          "bbq.open_box_heading_title": null,
          "bbq.storage_specs_number_of_drawers": null,
          "bbq.storage_specs_cutout_height": null,
          "bbq.openbox_related_product": null,
          "bbq.grill_specs_type": "Gas Grill",
          "bbq.rear_infrared_burner_btu": null,
          "bbq.product_option_related_product": [
            "twin-eagles-36-inch-3-burner-propane-gas-grill-on-deluxe-cart-tebq36g-cl",
            "twin-eagles-36-inch-3-burner-propane-gas-grill-infrared-rotisserie-burner-standard-cart-tebq36r-cl-1",
            "twin-eagles-36-gas-grill-infraredx-rotisserie-sear-zone-tebq36rs-cl",
          ],
          "bbq.side_burner_specs_number_of_burners": null,
          "bbq.product_weight": 247,
          "bbq.configuration_type": ["Built In", "Freestanding"],
          "bbq.seo_meta_manufacturer_part_number": "TEBQ36G-CL",
          "bbq.related_product": [
            "twin-eagles-30-gas-grill-propane",
            "twin-eagles-36-inch-3-burner-propane-gas-grill-on-deluxe-cart-tebq36g-cl",
            "twin-eagles-42-gas-grill-lp-tebq42g-cl",
          ],
          "bbq.hinge_related_product": null,
          "bbq.shipping_dimensions": "40 x 48 x 26",
          "bbq.storage_specs_cutout_width": null,
          "bbq.hinge_heading_title": null,
          "bbq.seo_meta_fuel_type": "Liquid Propane",
          "bbq.file_name": [
            "Twin Eagles TEBQ36-C Cutout Specifications [Click to download]",
            "Twin Eagles Gas Grill Owners Manual [Click to download]",
          ],
          "bbq.upload_file": [
            "https://cdn.accentuate.io/7845980799233/-1671630088252/Twin-Eagles-TEBQ36-C-Cutout-Specifications-v1672846703424.pdf",
            "https://cdn.accentuate.io/7845980799233/-1671630088252/Twin-Eagles-Gas-Grill-Owners-Manual-v1672846746318.pdf",
          ],
          "bbq.grill_specs_side_shelves": "No",
          "bbq.grill_specs_controller": null,
          "bbq.side_burner_specification_gas_type": null,
          "bbq.ref_specs_heading_title": null,
          "bbq.storage_specs_orientation": null,
          "bbq.thermometer": "Analog",
          "bbq.grill_specs_class": "Luxury",
          "bbq.enable_call_availability_button": null,
          "bbq.overall_dimensions": ["36 x 29.64 x 26.39"],
          "frequently.fbi_heading": "Frequently Bought Together",
          "bbq.storage_specs_cutout_depth": null,
          "bbq.storage_specs_mounting_type": null,
          "bbq.seo_meta_main_grilling_area": 640,
          _id: "twin-eagles-36-inch-3-burner-propane-gas-grill-on-deluxe-cart-tebq36g-cl",
          "bbq.grill_specs_on_wheels": "No",
          "bbq.product_offer_cta": null,
          "bbq.openbox_product_text": null,
          "bbq.ref_specs_outdoor_rated": null,
          "bbq.single_burner_btus": 25000,
          "bbq.shipping_weight": 262,
          "bbq.seo_meta_manufacturer": "Twin Eagles",
          "bbq.manufacturer_download_heading_title": "Manufacturer's Manual",
          "bbq.grill_specs_no_of_racks": 1,
          "bbq.configuration_product": [
            "twin-eagles-36-inch-3-burner-propane-gas-grill-on-deluxe-cart-tebq36g-cl",
            "tebq36g-cl-tegb36sd-b",
          ],
          "bbq.shopnew_product_text": null,
          "bbq.size_heading_title": "Product Size",
          "bbq.ref_specs_cutout_width": null,
          "bbq.brand_storage_specs_type": null,
          "bbq.option_type": ["LP", "NG"],
          "bbq.ref_specs_type": null,
          "bbq.rear_infrared_burner": "No",
          "bbq.product_option_heading_title": "Burner Configuration",
          "bbq.product_offer_image_link":
            "https://cdn.shopify.com/s/files/1/0660/1900/0577/files/SmallOpenBoxGrills.png?v=1676559383",
          "bbq.grill_specs_mount_type": "Built-In",
          "bbq.rotisserie_kit": null,
          "bbq.option_title": "Gas Type",
          "bbq.grill_specs_kamado_width": null,
          _info:
            "Twin Eagles - 36-Inch 3-Burner Built-In Grill - Liquid Propane Gas - TEBQ36G-CL",
          "bbq.seo_meta_series": "C-Series",
          "bbq.shopnew_related_product": null,
          "bbq.product_offer_url":
            "https://outdoorkitchenoutlet.com/collections/grills-open-box",
          "bbq.number_of_main_burners": 3,
          "bbq.storage_specs_number_of_doors": null,
          "bbq.seo_meta_brand": "Twin Eagles",
          "bbq.option_related_product": [
            "twin-eagles-36-inch-3-burner-propane-gas-grill-on-deluxe-cart-tebq36g-cl",
            "copy-of-twin-eagles-propane-gas-grill-standard-cart-tebq36g-cn",
          ],
          "bbq.side_burder_specification_gas_type": null,
          "bbq.product_option_name": [
            "All conventional",
            "With Integrated Rotisserie System",
            "With Sear Zone and Integrated Rotisserie System",
          ],
          "bbq.grill_specs_cutout_height": 11.75,
          "bbq.hinge_selection": null,
          "bbq.total_surface_btu": 75000,
          "bbq.grill_specs_size": 36,
          "bbq.select_sale_tag": null,
          "bbq.ref_specs_door_type": null,
          "bbq.cutout_dimensions": ["34.25 x 24.25 x 11.75"],
          "bbq.seo_meta_made_in_usa": "Yes",
          "bbq.grill_lights": "Internal/External",
          "bbq.shipping_info_heading_title": "Shipping Information",
          "bbq.seo_meta_cooking_grid_dimensions": "32 x 20",
          "bbq.ref_specs_cutout_depth": null,
          "bbq.storage_specs_heading_title": null,
          "bbq.grill_specs_cutout_width": 34.25,
          size_title: ["30 Inches", "36 Inches", "42 Inches"],
          "bbq.specification_heading_title": "Specification",
        },
        created_at: "2025-06-12T02:42:00.273831+00:00",
        variants: [
          {
            compare_at_price: 8430.68,
            taxable: true,
            weight_unit: "lb",
            requires_shipping: true,
            price: 7419,
            sku_suggest: ["TEBQ36G-CL"],
            qty: 10,
            costing: 5058.41,
            sku: "TEBQ36G-CL",
            grams: 112037.31539,
          },
        ],
        title:
          "Twin Eagles - 36-Inch 3-Burner Built-In Grill - Liquid Propane Gas - TEBQ36G-CL",
        recommendations: {
          complementary_products: "",
          related_products_settings: "",
          search_boost: "",
          related_products: 0,
        },
        features: {
          furniture_features: 0,
          color: 0,
          furniture_material: 0,
          flue_type: 0,
          top_surface_material: 0,
          cover_features: 0,
          material: 0,
          mounting_type: 0,
          stove_top_type: 0,
          extraction_type: 0,
          grease_filter_material: 0,
          water_filter_application: 0,
          power_source: 0,
        },
        updated_at: "2026-03-06T02:34:22.920669+00:00",
        collections: [
          {
            name: "Shop All Brands",
            id: 31,
            slug: "shop-all-brands",
          },
          {
            name: "Shop All BBQ Grills and Smokers",
            id: 87,
            slug: "shop-all-bbq-grills-and-smokers",
          },
          {
            name: "Shop All Built In Grills",
            id: 88,
            slug: "shop-all-built-in-grills",
          },
          {
            name: "Gas Grills",
            id: 90,
            slug: "gas-grills",
          },
          {
            name: "Shop All Gas Grills",
            id: 92,
            slug: "shop-all-gas-grills",
          },
          {
            name: "Built In Gas Grills",
            id: 93,
            slug: "built-in-gas-grills",
          },
          {
            name: "Shop All Twin Eagles",
            id: 211,
            slug: "shop-all-twin-eagles",
          },
          {
            name: "Twin Eagles",
            id: 213,
            slug: "twin-eagles",
          },
          {
            name: "Twin Eagles Grills",
            id: 224,
            slug: "twin-eagles-grills",
          },
          {
            name: "Twin Eagles Built-In Grills",
            id: 958,
            slug: "twin-eagles-built-in-grills",
          },
        ],
        ratings: {
          rating_count: "'2",
        },
        product_id: 6255,
        options: {
          option3: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
          option1: {
            name: "Title",
            value: "Default Title",
            linked_to: 0,
          },
          option2: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
        },
        seo: {
          description:
            "This item features 304 stainless steel burners with lifetime warranty,ceramic briquettes,hexagonal grates.Call us now!",
          title: "Twin Eagles Propane Gas Grill Standard Cart TEBQ36G-CL",
        },
        brand: "Twin Eagles",
        images: [
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEBQ36G-CL_8d4afa29-8a91-4371-810b-726b9f00c84f.jpg?v=1743604277",
            alt: 0,
            position: 1,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEBQ42G-CL_TEGB42SD-B.1_076f091c-0f00-4430-ac95-69a2488341a0.jpg?v=1743604280",
            alt: 0,
            position: 2,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEBQ42G-CL_TEGB42SD-B.2_bbe36d5c-c742-4a02-a7e8-c29415a3bcca.jpg?v=1743604282",
            alt: 0,
            position: 3,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEBQ42G-CL_TEGB42SD-B.3_0b4e527d-2c3e-4c47-b911-275729ffb71d.jpg?v=1743604284",
            alt: 0,
            position: 4,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEBQ42G-CL_TEGB42SD-B.4_65cca107-9090-4f9a-90d7-564b36ee3869.jpg?v=1743604286",
            alt: 0,
            position: 5,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEBQ42G-CL_TEGB42SD-B.5_2d12021f-bf34-4fd2-9ace-2ad99cf28092.jpg?v=1743604287",
            alt: 0,
            position: 6,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEBQ42G-CL_TEGB42SD-B.6_6568aacf-48a4-4573-ad99-4d79c35bc99f.jpg?v=1743604289",
            alt: 0,
            position: 7,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEBQ42G-CL_TEGB42SD-B.7_46d505db-ffc4-486a-a187-1e43d1372474.jpg?v=1743604291",
            alt: 0,
            position: 8,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEBQ42G-CL_TEGB42SD-B.8_b4c91bca-c757-4861-a08b-5dfc0629272f.jpg?v=1743604299",
            alt: 0,
            position: 9,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEBQ42G-CL_TEGB42SD-B.9_5340af53-8e42-4587-bd0a-f7eced85d3c9.jpg?v=1743604302",
            alt: 0,
            position: 10,
          },
        ],
        custom_fields: [],
        handle:
          "twin-eagles-36-inch-3-burner-propane-gas-grill-on-deluxe-cart-tebq36g-cl",
        published: true,
        frequently_bought_together: [],
        tags: [
          "304 Stainless Steel",
          "34-42 Inches",
          "4 Burners",
          "Analog",
          "Built In",
          "Built In Gas Grills",
          "Depth 0-26 Inches",
          "Gas Grills",
          "Height 0-26 Inches",
          "Internal / External",
          "Internal and External Lights",
          "Liquid Propane Gas",
          "No Rear Infrared Burner",
          "No Rotisserie",
          "Shop All BBQ Grills and Smoker",
          "Shop All BBQ Grills and Smokers",
          "Shop All Gas Grills",
          "Shop All Twin Eagles",
          "Twin Eagles",
          "Twin Eagles Grills",
          "twinVCBQ36",
          "Width 34-42 Inches",
          "Yes",
        ],
        product_type: "",
        uploaded_at: "2025-06-12T02:42:00.273810+00:00",
        product_category: [
          {
            category_name: "Home & Garden",
            id: 1,
          },
          {
            category_name: "Kitchen & Dining",
            id: 2,
          },
          {
            category_name: "Kitchen Appliances",
            id: 15,
          },
          {
            category_name: "Outdoor Grills",
            id: 16,
          },
        ],
        region_pricing: {
          compare_price_us: null,
          included_us: null,
          price_us: null,
        },
        status: "active",
      },
      {
        custom_metafields: {
          custom_sale_tag: "0.0",
          size_headings:
            '{"size_1": "36 inches", "size_2": "48 inches", "size_3": "60 inches", "size_4": "", "size_5": "", "size_6": "", "heading_title": ""}',
          open_box: "0.0",
          option_headings:
            '{"option1": "", "option2": "", "option3": "", "heading_title": ""}',
        },
        body_html:
          "<p>Features:<br>Stainless Steel - Complete 304 stainless steel construction for longevity and durability<br>UL Listed - Engineered and UL approved for outdoor use<br>3-Speed Ventilation - Provides easy 3-speed control over internal/external blower (sold seperately)<br>Halogen Lighting - Includes (2) halogen lamps to provide lighting while grilling<br>Removable Baffles - Easy to remove and dishwasher safe to provide clean filtering</p>",
        accentuate_data: {
          "bbq.configuration_heading_title": null,
          "bbq.sink_bars_center_cutout_height": null,
          "bbq.seo_meta_total_grill_area": null,
          "bbq.seo_meta_material": null,
          "bbq.shopnew_heading_title": null,
          "bbq.side_burner_specification_type": null,
          "bbq.ref_specs_cutout_height": null,
          "bbq.side_burner_specs_configuration": null,
          "bbq.seo_meta_secondary_grilling_area": null,
          "frequently.fbi_related_product": [
            "twin-eagles-19-inch-stainless-steel-double-access-drawer-tesd192-b",
            "twin-eagles-13-double-side-burner-ng-tesb132-cn",
            "twin-eagles-36-pellet-grill-smoker-insulating-jacket",
            "twin-eagles-vinyl-cover-36-inch-built-in-on-grill-vce1bq36",
          ],
          "bbq.open_box_heading_title": null,
          "bbq.storage_specs_number_of_drawers": null,
          "bbq.storage_specs_cutout_height": null,
          "bbq.sink_bars_center_configuration": null,
          "bbq.openbox_related_product": null,
          "bbq.sink_bars_center_type": null,
          "bbq.ref_specs_total_capacity": null,
          "bbq.product_option_related_product": null,
          "bbq.side_burner_specs_number_of_burners": null,
          "bbq.product_weight": 75,
          "bbq.configuration_type": null,
          "bbq.seo_meta_manufacturer_part_number": null,
          "bbq.related_product": [
            "twin-eagles-36-vent-hood-tevh36-b",
            "twin-eagles-48-ventilation-hood-tevh48-c",
            "twin-eagles-60-ventilation-hood-tevh60-c",
          ],
          "bbq.orientation_heading_title": null,
          "bbq.hinge_related_product": null,
          "bbq.sink_bars_center_cutout_depth": null,
          "bbq.shipping_dimensions": "40 x 48 x 18",
          "bbq.storage_specs_cutout_width": null,
          "bbq.sink_bars_center_heading_title": null,
          "bbq.hinge_heading_title": null,
          "bbq.seo_meta_fuel_type": null,
          "bbq.file_name": ["TEV Manual [Click to download]"],
          "bbq.upload_file": [
            "https://cdn.accentuate.io/7846032048385/-1671630088252/TEV-Manual-%5BClick-to-download%5D-v1701476679176.pdf",
          ],
          "bbq.ref_specs_heading_title": null,
          "bbq.storage_specs_orientation": null,
          "bbq.thermometer": null,
          "bbq.shop_new_product_offer_url": null,
          "bbq.enable_call_availability_button": null,
          "bbq.overall_dimensions": ["36 x 27 x 18"],
          "frequently.fbi_heading": "Frequently Bought Together",
          "bbq.storage_specs_cutout_depth": null,
          "bbq.storage_specs_mounting_type": null,
          "bbq.seo_meta_main_grilling_area": null,
          _id: "twin-eagles-36-vent-hood-tevh36-b",
          "bbq.product_offer_cta": null,
          "bbq.openbox_product_text": null,
          "bbq.ref_specs_outdoor_rated": null,
          "bbq.single_burner_btus": null,
          "bbq.shipping_weight": 90,
          "bbq.seo_meta_manufacturer": null,
          "bbq.manufacturer_download_heading_title": "Manufacturer’s Downloads",
          "bbq.selection_related_product": null,
          "bbq.configuration_product": null,
          "bbq.shopnew_product_text": null,
          "bbq.size_heading_title": "Product Size",
          "bbq.ref_specs_cutout_width": null,
          "bbq.brand_storage_specs_type": null,
          "bbq.option_type": null,
          "bbq.ref_specs_type": null,
          "bbq.selection_name": null,
          "bbq.rear_infrared_burner": null,
          "bbq.product_option_heading_title": null,
          "bbq.product_offer_image_link": null,
          "bbq.sink_bars_center_water_type": null,
          "bbq.rotisserie_kit": null,
          "bbq.option_title": null,
          _info: "Twin Eagles 36 Inch Ventilation Hood - TEVH36-C",
          "bbq.seo_meta_series": null,
          "bbq.shopnew_related_product": null,
          "bbq.product_offer_url": null,
          "bbq.number_of_main_burners": null,
          "bbq.storage_specs_number_of_doors": null,
          "bbq.seo_meta_brand": null,
          "bbq.sideburner_specs_heading_title": null,
          "bbq.option_related_product": null,
          "bbq.side_burder_specification_gas_type": null,
          "bbq.product_option_name": null,
          "bbq.hinge_selection": null,
          "bbq.sink_bars_center_cutout_width": null,
          "bbq.total_surface_btu": null,
          "bbq.shop_new_image_link": null,
          "bbq.select_sale_tag": null,
          "bbq.ref_specs_door_type": null,
          "bbq.cutout_dimensions": null,
          "bbq.seo_meta_made_in_usa": null,
          "bbq.grill_lights": null,
          "bbq.shipping_info_heading_title": "Shipping Information",
          "bbq.seo_meta_cooking_grid_dimensions": null,
          "bbq.ref_specs_cutout_depth": null,
          "bbq.storage_specs_heading_title": null,
          size_title: ["36 Inches", "48 Inches", "60 Inches"],
          "bbq.specification_heading_title": "Specification",
        },
        created_at: "2025-06-12T02:41:38.567301+00:00",
        variants: [
          {
            compare_at_price: 2680.68,
            taxable: true,
            weight_unit: "lb",
            requires_shipping: true,
            price: 2359,
            sku_suggest: ["TEVH36-C"],
            qty: 10,
            costing: 1608.41,
            sku: "TEVH36-C",
            grams: 0,
          },
        ],
        title: "Twin Eagles 36 Inch Ventilation Hood - TEVH36-C",
        recommendations: {
          complementary_products: "",
          related_products_settings: "",
          search_boost: "",
          related_products: 0,
        },
        features: {
          furniture_features: "",
          color: "",
          furniture_material: "",
          flue_type: "",
          top_surface_material: "",
          cover_features: "",
          material: "",
          mounting_type: "",
          stove_top_type: "",
          extraction_type: "",
          grease_filter_material: "",
          water_filter_application: "",
          power_source: "",
        },
        updated_at: "2025-09-11T05:57:56.202598+00:00",
        collections: [
          {
            name: "Shop All Brands",
            id: 31,
            slug: "shop-all-brands",
          },
          {
            name: "Outdoor Kitchen Appliances",
            id: 41,
            slug: "outdoor-kitchen-appliances",
          },
          {
            name: "Shop All Outdoor Kitchen Appliances",
            id: 43,
            slug: "shop-all-outdoor-kitchen-appliances",
          },
          {
            name: "Shop All Outdoor Kitchen Ventilation",
            id: 76,
            slug: "shop-all-outdoor-kitchen-ventilation",
          },
          {
            name: "Outdoor Vent Hoods",
            id: 184,
            slug: "outdoor-vent-hoods",
          },
          {
            name: "Best Sellers for Outdoor Vent Hoods",
            id: 185,
            slug: "best-sellers-for-outdoor-vent-hoods",
          },
          {
            name: "Shop All Twin Eagles",
            id: 211,
            slug: "shop-all-twin-eagles",
          },
          {
            name: "Twin Eagles Accessories",
            id: 212,
            slug: "twin-eagles-accessories",
          },
          {
            name: "Twin Eagles",
            id: 213,
            slug: "twin-eagles",
          },
        ],
        ratings: {
          rating_count: "'2",
        },
        product_id: 5335,
        options: {
          option3: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
          option1: {
            name: "Title",
            value: "Default Title",
            linked_to: 0,
          },
          option2: {
            name: "",
            value: "",
            linked_to: 0,
          },
        },
        seo: {
          description:
            'Twin Eagles 36" Vent Hood safely remove excess smoke, odors and grease to protect your outdoor kitchen area and guests. Call us now!',
          title: 'Twin Eagles 36" Vent Hood - TEVH36-B',
        },
        brand: "Twin Eagles",
        images: [
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEVH36-C.jpg?v=1743611236",
            alt: 0,
            position: 1,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/TEVH_56331183-3678-4fc2-9810-cbf4ec765de5.jpg?v=1743611241",
            alt: 0,
            position: 2,
          },
        ],
        custom_fields: [],
        handle: "twin-eagles-36-vent-hood-tevh36-b",
        published: true,
        frequently_bought_together: [],
        tags: [
          "1000 - 1500 CFM",
          "30 - 39 Inches",
          "Best Sellers for Outdoor Vent Hoods",
          "Outdoor Kitchen Ventilation",
          "Outdoor Vent Hoods",
          "Shop All BBQ Grilling Tools and Accesories",
          "Shop All BBQ Grilling Tools and Accessories",
          "Shop All Outdoor Kitchen Appliances",
          "Shop All Outdoor Kitchen Ventilation",
          "Shop All Twin Eagles",
          "Twin Eagles",
          "Twin Eagles Accessories",
          "Yes",
        ],
        product_type: "",
        uploaded_at: "2025-06-12T02:41:38.567280+00:00",
        product_category: [
          {
            category_name: "Hardware",
            id: 35,
          },
          {
            category_name: "Heating, Ventilation & Air Conditioning",
            id: 150,
          },
        ],
        region_pricing: {
          compare_price_us: null,
          included_us: null,
          price_us: null,
        },
        status: "active",
      },
      {
        custom_metafields: {
          custom_sale_tag: "0.0",
          size_headings:
            '{"size_1": "", "size_2": "", "size_3": "", "size_4": "", "size_5": "", "size_6": "", "heading_title": ""}',
          open_box: "0.0",
          option_headings:
            '{"option1": "", "option2": "", "option3": "", "heading_title": ""}',
        },
        body_html:
          "<p>Twin Eagles provides a premium grill for your outdoor kitchen space. Featuring premium 304 stainless steel construction, this grill has been engineered to stand up to the test of time. This grill features innovative technology in the form of a wi-fi-enabled smoking interface, allowing for precise control between 140 degrees and 725 degrees Fahrenheit. The inclusion of 26 preprogrammed food item options allows for even easier smoking control--all you need to do is select your food and start cooking!</p>",
        accentuate_data: {
          "bbq.configuration_heading_title": null,
          "bbq.grill_specs_color": "Stainless Steel",
          "bbq.seo_meta_total_grill_area": null,
          "bbq.seo_meta_material": "304 Stainless Steel",
          "bbq.shopnew_heading_title": null,
          "bbq.side_burner_specification_type": null,
          "bbq.ref_specs_cutout_height": null,
          "bbq.side_burner_specs_configuration": null,
          "bbq.seo_meta_secondary_grilling_area": null,
          "frequently.fbi_related_product": [
            "twin-eagles-grill-cover-for-30-inch-built-in-grill-vcbq30",
            "twin-eagles-cklp-te1bq54lp-conversion-kit-tebq-ng-lp-lp-regulator-cklp-te1bq54",
            "twin-eagles-24-inch-drop-in-stainless-steel-ice-bin-cooler-teoc24d-b",
            "twin-eagles-vinyl-cover-24-inch-tepb24-built-in-vcpb24",
          ],
          "bbq.grill_specs_cutout_depth": 24.5,
          "bbq.open_box_heading_title": null,
          "bbq.storage_specs_number_of_drawers": null,
          "bbq.storage_specs_cutout_height": null,
          "bbq.openbox_related_product": null,
          "bbq.grill_specs_type": "Insulating Liner",
          "bbq.rear_infrared_burner_btu": null,
          "bbq.product_option_related_product": null,
          "bbq.side_burner_specs_number_of_burners": null,
          "bbq.product_weight": 85,
          "bbq.configuration_type": null,
          "bbq.seo_meta_manufacturer_part_number": null,
          "bbq.related_product": null,
          "bbq.hinge_related_product": null,
          "bbq.shipping_dimensions": "40 x 48 x 18",
          "bbq.storage_specs_cutout_width": null,
          "bbq.hinge_heading_title": null,
          "bbq.seo_meta_fuel_type": null,
          "bbq.file_name": ["TEPIJ36 Product Manual [Click to download]"],
          "bbq.upload_file": [
            "https://cdn.accentuate.io/7846018023681/-1671630088252/TEPIJ36-Product-Manual-%5BClick-to-download%5D---v1684436785540.pdf",
          ],
          "bbq.grill_specs_side_shelves": null,
          "bbq.grill_specs_controller": null,
          "bbq.side_burner_specification_gas_type": null,
          "bbq.ref_specs_heading_title": null,
          "bbq.storage_specs_orientation": null,
          "bbq.thermometer": null,
          "bbq.grill_specs_class": "Luxury",
          "bbq.enable_call_availability_button": null,
          "bbq.overall_dimensions": ["40.75 x 27.19 x 18"],
          "frequently.fbi_heading": "Frequently Bought Together",
          "bbq.storage_specs_cutout_depth": null,
          "bbq.storage_specs_mounting_type": null,
          "bbq.seo_meta_main_grilling_area": null,
          _id: "twin-eagles-36-pellet-grill-smoker-insulating-jacket",
          "bbq.grill_specs_on_wheels": null,
          "bbq.product_offer_cta": null,
          "bbq.openbox_product_text": null,
          "bbq.ref_specs_outdoor_rated": null,
          "bbq.single_burner_btus": null,
          "bbq.shipping_weight": 100,
          "bbq.seo_meta_manufacturer": null,
          "bbq.manufacturer_download_heading_title": "Manufacturer’s Downloads",
          "bbq.grill_specs_no_of_racks": null,
          "bbq.configuration_product": null,
          "bbq.shopnew_product_text": null,
          "bbq.size_heading_title": null,
          "bbq.ref_specs_cutout_width": null,
          "bbq.brand_storage_specs_type": null,
          "bbq.option_type": null,
          "bbq.ref_specs_type": null,
          "bbq.rear_infrared_burner": null,
          "bbq.product_option_heading_title": null,
          "bbq.product_offer_image_link": null,
          "bbq.grill_specs_mount_type": "Built-In",
          "bbq.rotisserie_kit": null,
          "bbq.option_title": null,
          "bbq.grill_specs_kamado_width": null,
          _info:
            'Twin Eagles 36" Pellet Grill and Smoker Insulating Jacket - TEPIJ36',
          "bbq.seo_meta_series": null,
          "bbq.shopnew_related_product": null,
          "bbq.product_offer_url": null,
          "bbq.number_of_main_burners": null,
          "bbq.storage_specs_number_of_doors": null,
          "bbq.seo_meta_brand": null,
          "bbq.option_related_product": null,
          "bbq.side_burder_specification_gas_type": null,
          "bbq.product_option_name": null,
          "bbq.grill_specs_cutout_height": 17.38,
          "bbq.hinge_selection": null,
          "bbq.total_surface_btu": null,
          "bbq.grill_specs_size": 36,
          "bbq.select_sale_tag": null,
          "bbq.ref_specs_door_type": null,
          "bbq.cutout_dimensions": ["39 x 26 x 17.5"],
          "bbq.seo_meta_made_in_usa": null,
          "bbq.grill_lights": null,
          "bbq.shipping_info_heading_title": "Shipping Information",
          "bbq.seo_meta_cooking_grid_dimensions": null,
          "bbq.ref_specs_cutout_depth": null,
          "bbq.storage_specs_heading_title": null,
          "bbq.grill_specs_cutout_width": 38.25,
          size_title: null,
          "bbq.specification_heading_title": "Specification",
        },
        created_at: "2025-06-12T02:41:38.543220+00:00",
        variants: [
          {
            compare_at_price: 1419.32,
            taxable: true,
            weight_unit: "lb",
            requires_shipping: true,
            price: 1249,
            sku_suggest: ["TEPIJ36"],
            qty: 10,
            costing: 851.59,
            sku: "TEPIJ36",
            grams: 0,
          },
        ],
        title:
          'Twin Eagles 36" Pellet Grill and Smoker Insulating Jacket - TEPIJ36',
        recommendations: {
          complementary_products: "",
          related_products_settings: "",
          search_boost: "",
          related_products: 0,
        },
        features: {
          furniture_features: "",
          color: "",
          furniture_material: "",
          flue_type: "",
          top_surface_material: "",
          cover_features: "",
          material: "",
          mounting_type: "",
          stove_top_type: "",
          extraction_type: "",
          grease_filter_material: "",
          water_filter_application: "",
          power_source: "",
        },
        updated_at: "2026-03-06T02:34:23.092397+00:00",
        collections: [
          {
            name: "Shop All Brands",
            id: 31,
            slug: "shop-all-brands",
          },
          {
            name: "Outdoor Kitchen Appliances",
            id: 41,
            slug: "outdoor-kitchen-appliances",
          },
          {
            name: "Shop All Outdoor Kitchen Appliances",
            id: 43,
            slug: "shop-all-outdoor-kitchen-appliances",
          },
          {
            name: "Installation Components",
            id: 70,
            slug: "installation-components",
          },
          {
            name: "Shop All BBQ Islands and Kits",
            id: 71,
            slug: "shop-all-bbq-islands-and-kits",
          },
          {
            name: "Shop All Twin Eagles",
            id: 211,
            slug: "shop-all-twin-eagles",
          },
          {
            name: "Twin Eagles Accessories",
            id: 212,
            slug: "twin-eagles-accessories",
          },
          {
            name: "Twin Eagles",
            id: 213,
            slug: "twin-eagles",
          },
        ],
        ratings: {
          rating_count: "'2",
        },
        product_id: 5332,
        options: {
          option3: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
          option1: {
            name: "Title",
            value: "Default Title",
            linked_to: 0,
          },
          option2: {
            name: "",
            value: "",
            linked_to: 0,
          },
        },
        seo: {
          description: "",
          title: "",
        },
        brand: "Twin Eagles",
        images: [
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/tepIJ36_e6bc6908-8f94-42f2-988d-c463e1ab479b.jpg?v=1743609374",
            alt: 0,
            position: 1,
          },
        ],
        custom_fields: [],
        handle: "twin-eagles-36-pellet-grill-smoker-insulating-jacket",
        published: true,
        frequently_bought_together: [],
        tags: [
          "BBQ Islands & Kits",
          "BBQ Islands and Kits",
          "Installation Components",
          "Shop All BBQ Grilling Tools and Accesories",
          "Shop All BBQ Grilling Tools and Accessories",
          "Shop All BBQ Islands and Kits",
          "Shop All Outdoor Kitchen Appliances",
          "Shop All Twin Eagles",
          "Twin Eagles",
          "Twin Eagles Accessories",
          "Yes",
        ],
        product_type: "",
        uploaded_at: "2025-06-12T02:41:38.543207+00:00",
        product_category: [
          {
            category_name: "Home & Garden",
            id: 1,
          },
          {
            category_name: "Kitchen & Dining",
            id: 2,
          },
          {
            category_name: "Kitchen Appliance Accessories",
            id: 3,
          },
          {
            category_name: "Outdoor Grill Accessories",
            id: 4,
          },
        ],
        region_pricing: {
          compare_price_us: null,
          included_us: null,
          price_us: null,
        },
        status: "active",
      },
    ],
    open_box: null,
    new_items: null,
    product_specs: [
      {
        label: "Adjustable Thermostat",
        key: "bbq.frplc_spec_adj_thermostat",
        type: "fireplaces",
        value: "",
      },
      {
        label: "BTU",
        key: "bbq.heater_specs_btu",
        type: "patio heaters",
        value: "",
      },
      {
        label: "BTUs",
        key: "bbq.frplc_spec_btus",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Capacity",
        key: "bbq.ref_specs_total_capacity",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Class",
        key: "bbq.grill_specs_class",
        type: "grills",
        value: "Luxury",
      },
      {
        label: "Class",
        key: "bbq.storage_specs_class",
        type: "storage",
        value: "",
      },
      {
        label: "Collection",
        key: "bbq.frplc_spec_model",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Color",
        key: "bbq.ref_specs_color",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Commercial",
        key: "bbq.ref_specs_is_commercial",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Configuration",
        key: "bbq.ref_specs_mount_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Configuration",
        key: "bbq.grill_specs_mount_type",
        type: "grills",
        value: "Built-In",
      },
      {
        label: "Cooking Grill Dimensions",
        key: "bbq.seo_meta_cooking_grid_dimensions",
        type: "grills",
        value: "32 Inches W x 20 Inches D",
      },
      {
        label: "Cutout Depth",
        key: "bbq.ref_specs_cutout_depth",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Cutout Depth",
        key: "bbq.grill_specs_cutout_depth",
        type: "grills",
        value: "24 1/4 Inches",
      },
      {
        label: "Cutout Dimensions",
        key: "bbq.cutout_dimensions",
        type: "grills",
        value: "34 1/4 Inches W x 24 1/4 Inches D x 16 1/4 Inches H",
      },
      {
        label: "Cutout Height",
        key: "bbq.ref_specs_cutout_height",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Cutout Height",
        key: "bbq.grill_specs_cutout_height",
        type: "grills",
        value: "16 3/4 Inches",
      },
      {
        label: "Cutout Width",
        key: "bbq.ref_specs_cutout_width",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Cutout Width",
        key: "bbq.grill_specs_cutout_width",
        type: "grills",
        value: "34 1/4 Inches",
      },
      {
        label: "Decor",
        key: "bbq.heater_specs_plate_style",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Door Type",
        key: "bbq.ref_specs_door_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Drain Type",
        key: "bbq.ref_specs_drain_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Elements",
        key: "bbq.heater_specs_elements",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Ember Bed Depth",
        key: "bbq.frplc_spec_ember_bed_depth",
        type: "fireplaces",
        value: "",
      },
      {
        label: "External Material",
        key: "bbq.seo_meta_material",
        type: "grills",
        value: "304 Stainless Steel",
      },
      {
        label: "Features",
        key: "bbq.heater_specs_features",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Finish",
        key: "bbq.frplc_spec_color",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Finish",
        key: "bbq.heater_specs_finish",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Firebox Width",
        key: "bbq.frplc_spec_firebox_width",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Fireplace Style",
        key: "bbq.frplc_spec_style",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Fireplace Type",
        key: "bbq.frplc_spec_view_type",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Framing Dimension",
        key: "bbq.frplc_spec_frame_dimension",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Fuel Type",
        key: "bbq.frplc_spec_fuel_type",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Fuel Type",
        key: "bbq.heater_specs_fuel_type",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Fuel Type",
        key: "bbq.seo_meta_fuel_type",
        type: "grills",
        value: "Pellets",
      },
      {
        label: "Glass Door",
        key: "bbq.ref_specs_is_glass_door",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Grade",
        key: "bbq.heater_specs_grade",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Grill Light",
        key: "bbq.grill_lights",
        type: "grills",
        value: "Internal",
      },
      {
        label: "Heating Area",
        key: "bbq.frplc_spec_heat_area",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Hinge Type",
        key: "bbq.ref_specs_hinge_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Hinge Type",
        key: "bbq.storage_specs_hinge_type",
        type: "storage",
        value: "",
      },
      {
        label: "Ice Cube Type",
        key: "bbq.ref_specs_ice_cube_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Ice Produced Daily",
        key: "bbq.ref_specs_ice_produced_daily",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Installation Type",
        key: "bbq.frplc_spec_mount_type",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Item Type",
        key: "bbq.ref_specs_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Item Type",
        key: "bbq.frplc_spec_type",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Item Type",
        key: "bbq.grill_specs_type",
        type: "grills",
        value: "Pellet Grill/Smoker",
      },
      {
        label: "Kamado Width",
        key: "bbq.grill_specs_kamado_width ",
        type: "grills",
        value: "",
      },
      {
        label: "Line Location",
        key: "bbq.frplc_spec_line_loc",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Lock",
        key: "bbq.ref_specs_with_lock",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Main Grill Area",
        key: "bbq.seo_meta_main_grilling_area",
        type: "grills",
        value: "640 Sq. Inches",
      },
      {
        label: "Marine Grade",
        key: "bbq.heater_specs_marine_grade",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Material",
        key: "bbq.frplc_spec_material",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Max Keg Size",
        key: "bbq.ref_specs_max_keg_size",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Number of Main Burners",
        key: "bbq.number_of_main_burners",
        type: "grills",
        value: "1-Burner",
      },
      {
        label: "Number Of Racks",
        key: "bbq.grill_specs_no_of_racks",
        type: "grills",
        value: 2,
      },
      {
        label: "Number of Taps",
        key: "bbq.ref_specs_no_of_taps",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Number Of Zones",
        key: "bbq.ref_specs_zones",
        type: "refrigerators",
        value: "",
      },
      {
        label: "On Wheels",
        key: "bbq.grill_specs_on_wheels",
        type: "grills",
        value: "No",
      },
      {
        label: "Outdoor Certification",
        key: "bbq.ref_specs_outdoor_certification",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Outdoor Rated",
        key: "bbq.ref_specs_outdoor_rated",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Overall Dimensions",
        key: "bbq.overall_dimensions",
        type: "grills",
        value: "36 Inches W x 25 Inches D x 31 31/50 Inches H",
      },
      {
        label: "Primary Color",
        key: "bbq.grill_specs_color",
        type: "grills",
        value: "Stainless Steel",
      },
      {
        label: "Product Weight",
        key: "bbq.product_weight",
        type: "grills",
        value: "330 lbs",
      },
      {
        label: "Rear Infrared Burner",
        key: "bbq.rear_infrared_burner",
        type: "grills",
        value: "No",
      },
      {
        label: "Rear Infrared Burner BTU",
        key: "bbq.rear_infrared_burner_btu",
        type: "grills",
        value: "",
      },
      {
        label: "Recess Option",
        key: "bbq.frplc_spec_recess_option",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Refrigerator Class",
        key: "bbq.ref_specs_class",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Rotisserie Kit",
        key: "bbq.rotisserie_kit",
        type: "grills",
        value: "Integrated",
      },
      {
        label: "Secondary Grill Area",
        key: "bbq.seo_meta_secondary_grilling_area",
        type: "grills",
        value: "308 Sq. Inches",
      },
      {
        label: "Series",
        key: "bbq.heater_specs_series",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Series",
        key: "bbq.seo_meta_series",
        type: "grills",
        value: "Pellet Series",
      },
      {
        label: "Shipping Dimensions",
        key: "bbq.shipping_dimensions",
        type: "grills",
        value: "40 Inches W x 48 Inches D x 32 Inches H",
      },
      {
        label: "Shipping Weight",
        key: "bbq.shipping_weight",
        type: "grills",
        value: "345 lbs",
      },
      {
        label: "Side Burner Configuration",
        key: "bbq.side_burner_specs_configuration",
        type: "grills",
        value: "",
      },
      {
        label: "Side Burner Fuel Type",
        key: "bbq.side_burner_specification_gas_type",
        type: "grills",
        value: "",
      },
      {
        label: "Side Burner Type",
        key: "bbq.side_burner_specification_type",
        type: "grills",
        value: "",
      },
      {
        label: "Side Burners",
        key: "bbq.side_burner_specs_number_of_burners",
        type: "grills",
        value: "",
      },
      {
        label: "Side Shelves",
        key: "bbq.grill_specs_side_shelves ",
        type: "grills",
        value: "",
      },
      {
        label: "Single Burner BTU",
        key: "bbq.single_burner_btus",
        type: "grills",
        value: "",
      },
      {
        label: "Sink Bar Center Configuration",
        key: "bbq.sink_bars_center_configuration",
        type: "storage",
        value: "",
      },
      {
        label: "Sink Bar Center Type",
        key: "bbq.sink_bars_center_type",
        type: "storage",
        value: "",
      },
      {
        label: "Size",
        key: "bbq.frplc_spec_size",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Size",
        key: "bbq.heater_specs_size",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Size",
        key: "bbq.grill_specs_size",
        type: "grills",
        value: "36 Inches",
      },
      {
        label: "Storage Cofiguration",
        key: "bbq.storage_specs_mounting_type",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Cutout Depth",
        key: "bbq.storage_specs_cutout_depth",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Cutout Height",
        key: "bbq.storage_specs_cutout_height",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Cutout Width",
        key: "bbq.storage_specs_cutout_width",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Drawers",
        key: "bbq.storage_specs_number_of_drawers",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Number of Doors",
        key: "bbq.storage_specs_number_of_doors",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Orientation",
        key: "bbq.storage_specs_orientation",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Type",
        key: "bbq.brand_storage_specs_type",
        type: "grills",
        value: "",
      },
      {
        label: "Style",
        key: "bbq.heater_specs_mount_type",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Surround Dimension",
        key: "bbq.frplc_spec_sur_dimension",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Thermometer",
        key: "bbq.thermometer",
        type: "grills",
        value: "Digital",
      },
      {
        label: "Total Grill Area",
        key: "bbq.seo_meta_total_grill_area",
        type: "grills",
        value: "948 Sq. Inches",
      },
      {
        label: "Total Surface BTU",
        key: "bbq.total_surface_btu",
        type: "grills",
        value: "",
      },
      {
        label: "Type",
        key: "bbq.heater_specs_type",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Vent Type",
        key: "bbq.frplc_spec_vent_type",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Venting",
        key: "bbq.ref_specs_vent_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Viewing Area",
        key: "bbq.frplc_spec_view_area",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Voltage",
        key: "bbq.frplc_spec_voltage",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Voltage",
        key: "bbq.heater_specs_volts",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Watts",
        key: "bbq.heater_specs_watts",
        type: "patio heaters",
        value: "",
      },
      {
        label: "WIFI/Bluetooth Enabled",
        key: "bbq.grill_specs_controller",
        type: "grills",
        value: "WiFi/Bluetooth/WiFi & Bluetooth",
      },
      {
        label: "Wine Bottle Capacity",
        key: "bbq.ref_specs_wine_bottle_capacity",
        type: "refrigerators",
        value: "",
      },
    ],
    product_manuals: null,
    product_shipping_info: [
      {
        key: "bbq.shipping_weight",
        label: "Shipping Weight",
        value: 345,
      },
      {
        key: "bbq.shipping_dimensions",
        label: "Shipping Dimensions (WxDxH)",
        value: "40 x 48 x 32",
      },
    ],
    quantity: 1,
  },
  {
    custom_metafields: {
      custom_sale_tag: "0.0",
      size_headings:
        '{"size_1": "34 Inches ", "size_2": "44 Inches", "size_3": "", "size_4": "", "size_5": "", "size_6": 0.0, "heading_title": "Size"}',
      open_box: "",
      option_headings:
        '{"option1": "LP", "option2": "NG", "option3": "", "heading_title": "Gas Type"}',
    },
    body_html:
      '<p data-mce-fragment="1"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Blaze presents the Blaze Professional Grill as a leading option in the industry, known for its durable build and reliable components. The grill\'s strong construction guarantees long-lasting performance, while its cooking system consistently produces excellent results. The Blaze Professional Grill 44 achieves high searing temperatures efficiently by precisely mixing fuel and oxygen. It also has an Illumination system that adds style, making it visually captivating for those who appreciate craftsmanship.</span></p>\n<h4><b data-mce-fragment="1">About Blaze<br></b></h4>\n<p><b data-mce-fragment="1"></b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Blaze understands the value of creating a top-notch outdoor living space that people of all ages can enjoy. For many, the ultimate summer pastime is gathering with loved ones for a delightful picnic while grilling up delicious food. That\'s why the company has dedicated extensive time and effort to developing a range of</span><a href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products" data-mce-fragment="1" data-mce-href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products"> </a><span style="color: #2b00ff;"><a style="color: #2b00ff;" href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products" title="Blaze Outdoor Products"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Blaze Outdoor Products.</span></a></span><br data-mce-fragment="1"></p>\n<p data-mce-fragment="1"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"><br>The team at Blaze works diligently to design grills that cater to each individual\'s unique cooking needs. Whether you\'re cooking for your immediate family or hosting a large crowd, Blaze has the perfect grill to suit your requirements. Regardless of your level of grilling expertise, Blaze offers a variety of grills that can accommodate your skill level, allowing you to showcase your culinary abilities and create memorable meals outdoors.</span></p>\n<h4><b data-mce-fragment="1">Blaze Professional Grill Key Features:</b></h4>\n<ul data-mce-fragment="1">\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Impressive BTU Power:  </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">With a total of 82,000 BTUs, including 4 main burners at 18,000 BTUs of cooking power per burner and a 10,000 BTU infrared rear rotisserie burner with an included rotisserie kit. </span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Spacious Cooking Area: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Offering 1050 square inches of total cooking space, this grill is ideal for accommodating large meals and gatherings.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Commercial-Quality H-Burners: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The main grill surface features 4 commercial-quality 304 cast stainless steel H-burners, ensuring durability and consistent heat distribution for even cooking.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Rotisserie Capability: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The rotisserie kit includes a waterproof motor, making it easy to roast meats perfectly.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Durable Hexagonal Cooking Rods:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> Heavy 12mm stainless steel hexagon cooking rods to maximize durability and enhance searing capabilities.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Flame Stabilizing Grids:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> These grids are built to minimize flare-ups while infusing your grilled food with that irresistible smoky flavor.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Illuminated Knobs:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> Illuminated control knobs not only create a sophisticated appearance but also provide practical visibility for evening gatherings and nighttime grilling sessions.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Efficient Ignition: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The push-and-turn flame-thrower primary ignition system delivers a fast start every time you ignite the grill.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Heat Zone Separators: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Heat zone separators split the cooking surface into different temperature zones, so you can cook different foods at the same time.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Warming Rack: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">A removable warming rack is included to keep your cooked dishes warm while you continue grilling.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Easy Cleanup: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The full-width drip tray simplifies post-grilling cleanup, ensuring a quick and hassle-free maintenance process.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Secondary Ignition: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Individual flash tube secondary ignition provides a backup ignition option for added reliability.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Interior Lights: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Built-in interior lighting systems are covered to assist you in navigating the grilling surface at night, ensuring precise cooking even in low-light conditions.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Double-lined Hood:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> The double-lined grill hood not only protects the outer layer from heat discoloration but also helps maintain a consistent cooking temperature by retaining heat efficiently.</span>\n</li>\n</ul>\n<h4 data-mce-fragment="1"><b data-mce-fragment="1">Added Value: </b></h4>\n<ol data-mce-fragment="1">\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Lowest Cost Guaranteed:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> We ensure that our built-in grills are competitively priced, offering you the best value for your investment.</span><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"><br data-mce-fragment="1"></span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Lifetime Warranty:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> Our grills come with a lifetime warranty, providing peace of mind and ensuring that your investment is protected for years to come.</span><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"><br data-mce-fragment="1"></span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Save up to 60%:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> With our built-in grills, you can enjoy significant savings compared to other high-end grill options on the market.</span><br>\n</li>\n</ol>',
    accentuate_data: {
      "bbq.configuration_heading_title": "Configuration",
      "bbq.grill_specs_color": "Stainless Steel",
      "bbq.seo_meta_total_grill_area": 1050,
      "bbq.seo_meta_material": "304 Stainless Steel",
      "bbq.shopnew_heading_title": null,
      "bbq.side_burner_specification_type": null,
      "bbq.ref_specs_cutout_height": null,
      "bbq.side_burner_specs_configuration": null,
      "bbq.seo_meta_secondary_grilling_area": 253,
      "frequently.fbi_related_product": [
        "blaze-39-inch-access-door-triple-drawer-combo-blz-ddc-39-r",
        "blaze-wind-guard-for-40-inch-5-burner-gas-grills-blz-wg-40",
        "blaze-lte-30-inch-natural-gas-griddle-with-lights-blz-griddle-lte-lp-blz-griddle-cart",
        "4-burner-pro-built-in-cover-4probicv",
      ],
      "bbq.grill_specs_cutout_depth": 23.625,
      "bbq.open_box_heading_title": null,
      "bbq.storage_specs_number_of_drawers": null,
      "bbq.storage_specs_cutout_height": null,
      "bbq.openbox_related_product": null,
      "bbq.grill_specs_type": "Gas Grill",
      "bbq.rear_infrared_burner_btu": 10000,
      "bbq.product_option_related_product": [
        "blaze-4-burner-lbm-blaze-grill-blz-4lbm-lp",
        "blaze-four-burner-built-in-propane-gas-grill-rear-infrared-burner-grill-lights",
        "blaze-marine-grade-32-inch-4-burner-built-in-propane-gas-grill-with-rear-infrared-burner-grill-lights-blz-4lte2mg-lp",
        "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
        "blaze-premium-lte-32-inch-4-burner-propane-gas-grill-w-rear-infrared-burner-lift-assist-hood-blz-4lte3-lp",
      ],
      "bbq.side_burner_specs_number_of_burners": null,
      "bbq.product_weight": 260,
      "bbq.configuration_type": ["Built In", "Freestanding"],
      "bbq.seo_meta_manufacturer_part_number": "BLZ-4PRO-LP",
      "bbq.related_product": [
        "blaze-professional-34-inch-3-burner-built-in-propane-gas-grill-with-rear-infrared-burner-blz-3pro-lp",
        "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
      ],
      "bbq.hinge_related_product": null,
      "bbq.shipping_dimensions": "40 x 48 x 25",
      "bbq.storage_specs_cutout_width": null,
      "bbq.hinge_heading_title": null,
      "bbq.seo_meta_fuel_type": "Liquid Propane",
      "bbq.file_name": [
        "Blaze Cutout Specifications [Click to download]",
        "Blaze Professional Grill Use & Care Guide [Click to download]",
      ],
      "bbq.upload_file": [
        "https://cdn.accentuate.io/7825463738625/-1671630088252/Blaze-Cutout-Specifications-v1672696677474.pdf",
        "https://cdn.accentuate.io/7825463738625/-1671630088252/Blaze-Professional-Grill-Use--Care-Guide-v1672696726355.pdf",
      ],
      "bbq.grill_specs_side_shelves": "No",
      "bbq.grill_specs_controller": null,
      "bbq.side_burner_specification_gas_type": null,
      "bbq.ref_specs_heading_title": null,
      "bbq.storage_specs_orientation": null,
      "bbq.thermometer": "Analog",
      "bbq.grill_specs_class": "Luxury",
      "bbq.enable_call_availability_button": null,
      "bbq.overall_dimensions": ["44.18 x 28.37 x 24.12"],
      "frequently.fbi_heading": "Frequently Bought Together",
      "bbq.storage_specs_cutout_depth": null,
      "bbq.storage_specs_mounting_type": null,
      "bbq.seo_meta_main_grilling_area": 797,
      _id: "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
      "bbq.grill_specs_on_wheels": "No",
      "bbq.product_offer_cta": null,
      "bbq.openbox_product_text": null,
      "bbq.ref_specs_outdoor_rated": null,
      "bbq.single_burner_btus": 18000,
      "bbq.shipping_weight": 275,
      "bbq.seo_meta_manufacturer": "Blaze",
      "bbq.manufacturer_download_heading_title": "Manufacturer's Manual",
      "bbq.grill_specs_no_of_racks": 2,
      "bbq.configuration_product": [
        "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
        "blz-4pro-lp-blz-4pro-cart",
      ],
      "bbq.shopnew_product_text": null,
      "bbq.size_heading_title": "Product Size",
      "bbq.ref_specs_cutout_width": null,
      "bbq.brand_storage_specs_type": null,
      "bbq.option_type": ["LP", "NG"],
      "bbq.ref_specs_type": null,
      "bbq.rear_infrared_burner": "Yes",
      "bbq.product_option_heading_title": "Product Option",
      "bbq.product_offer_image_link":
        "https://cdn.shopify.com/s/files/1/0660/1900/0577/files/SmallOpenBoxGrills.png?v=1676559383",
      "bbq.grill_specs_mount_type": "Built-In",
      "bbq.rotisserie_kit": "Integrated",
      "bbq.option_title": "Gas Type",
      "bbq.grill_specs_kamado_width": null,
      _info:
        "Blaze Professional LUX - 44-Inch 4-Burner Built-In Grill - Liquid Propane Gas With Rear Infrared Burner - BLZ-4PRO-LP (Home & Garden)",
      "bbq.seo_meta_series": "Professional",
      "bbq.shopnew_related_product": null,
      "bbq.product_offer_url":
        "https://outdoorkitchenoutlet.com/collections/grills-open-box",
      "bbq.number_of_main_burners": 4,
      "bbq.storage_specs_number_of_doors": null,
      "bbq.seo_meta_brand": "Blaze",
      "bbq.option_related_product": [
        "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
        "blaze-professional-44-inch-4-burner-built-in-natural-gas-grill-with-rear-infrared-burner-blz-4pro-ng",
      ],
      "bbq.side_burder_specification_gas_type": null,
      "bbq.product_option_name": [
        "LBM Series",
        "LTE Series",
        "Marine Grade Series",
        "Professional Lux Series",
        "LTE + Series",
      ],
      "bbq.grill_specs_cutout_height": 10.5,
      "bbq.hinge_selection": null,
      "bbq.total_surface_btu": 72000,
      "bbq.grill_specs_size": 44,
      "bbq.select_sale_tag": "Huge Savings",
      "bbq.ref_specs_door_type": null,
      "bbq.cutout_dimensions": ["42.5 x 23.625 x 10.5"],
      "bbq.seo_meta_made_in_usa": "No",
      "bbq.grill_lights": "Internal/External",
      "bbq.shipping_info_heading_title": "Shipping Information",
      "bbq.seo_meta_cooking_grid_dimensions": "40 x 19.9375",
      "bbq.ref_specs_cutout_depth": null,
      "bbq.storage_specs_heading_title": null,
      "bbq.grill_specs_cutout_width": 42.5,
      size_title: ["34 Inches", "44 Inches"],
      "bbq.specification_heading_title": "Specification",
    },
    created_at: "2025-06-12T02:41:56.593133+00:00",
    variants: [
      {
        compare_at_price: 6867.5,
        taxable: false,
        weight_unit: "lb",
        requires_shipping: true,
        price: 4769,
        sku_suggest: ["BLZ-4PRO-LP"],
        qty: 10,
        costing: 3179.4,
        sku: "BLZ-4PRO-LP",
        grams: 117934.0162,
      },
    ],
    title:
      "Blaze Professional LUX - 44-Inch 4-Burner Built-In Grill - Liquid Propane Gas With Rear Infrared Burner - BLZ-4PRO-LP",
    recommendations: {
      complementary_products: "",
      related_products_settings: "",
      search_boost: "",
      related_products: 0,
    },
    features: {
      furniture_features: 0,
      color: 0,
      furniture_material: 0,
      flue_type: 0,
      top_surface_material: 0,
      cover_features: 0,
      material: 0,
      mounting_type: 0,
      stove_top_type: 0,
      extraction_type: 0,
      grease_filter_material: 0,
      water_filter_application: 0,
      power_source: 0,
    },
    updated_at: "2026-03-06T02:34:19.214439+00:00",
    collections: [
      {
        name: "Shop All Brands",
        id: 31,
        slug: "shop-all-brands",
      },
      {
        name: "Shop All Blaze Outdoor Products",
        id: 77,
        slug: "shop-all-blaze-outdoor-products",
      },
      {
        name: "Blaze Outdoor Products",
        id: 79,
        slug: "blaze-outdoor-products",
      },
      {
        name: "Shop All BBQ Grills and Smokers",
        id: 87,
        slug: "shop-all-bbq-grills-and-smokers",
      },
      {
        name: "Shop All Built In Grills",
        id: 88,
        slug: "shop-all-built-in-grills",
      },
      {
        name: "Gas Grills",
        id: 90,
        slug: "gas-grills",
      },
      {
        name: "Shop All Gas Grills",
        id: 92,
        slug: "shop-all-gas-grills",
      },
      {
        name: "Built In Gas Grills",
        id: 93,
        slug: "built-in-gas-grills",
      },
      {
        name: "BBQ Grills year end",
        id: 136,
        slug: "bbq-grills-year-end",
      },
      {
        name: "Blaze Grills",
        id: 138,
        slug: "blaze-grills",
      },
      {
        name: "Year End Sale",
        id: 180,
        slug: "year-end-sale",
      },
      {
        name: "Top Deals",
        id: 192,
        slug: "top-deals",
      },
      {
        name: "Promotions",
        id: 193,
        slug: "promotions",
      },
      {
        name: "Blaze Built-In Grills",
        id: 954,
        slug: "blaze-built-in-grills",
      },
    ],
    ratings: {
      rating_count: "'2",
    },
    product_id: 5733,
    options: {
      option3: {
        name: 0,
        value: 0,
        linked_to: 0,
      },
      option1: {
        name: "Title",
        value: "Default Title",
        linked_to: 0,
      },
      option2: {
        name: 0,
        value: 0,
        linked_to: 0,
      },
    },
    seo: {
      description:
        "The heavy duty 304 stainless steel construction throughout the grill body ensures a long-lasting and durable appliance.Call us now!",
      title: "Blaze Professional Built-In Propane Gas Grill - BLZ-4PRO-LP",
    },
    brand: "Blaze Outdoor Products",
    images: [
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-LP.jpg?v=1743603499",
        alt: 0,
        position: 1,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.2_f64f62b5-e6cb-4132-bf00-f7df6f7366d4.jpg?v=1743604055",
        alt: 0,
        position: 2,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.3_d926c646-dfe2-48f9-8fbb-0022d9d1686c.jpg?v=1743604053",
        alt: 0,
        position: 3,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.4_286fecd8-d147-4ac7-bef5-161b884bc277.jpg?v=1743604050",
        alt: 0,
        position: 4,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.5_f22dd1ad-17d6-44e9-8564-c405ad69e329.jpg?v=1743603785",
        alt: 0,
        position: 5,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.6_b9cbca67-e785-4ff3-88c8-3641e1bae094.jpg?v=1743603781",
        alt: 0,
        position: 6,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.7_e42a812f-8eb3-4053-89bf-686c66ec4d79.jpg?v=1743603766",
        alt: 0,
        position: 7,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.8_b2723afb-a74e-4bc9-8357-af090307e681.jpg?v=1743603763",
        alt: 0,
        position: 8,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.9_c62d617f-497c-471b-96a3-c776228da078.jpg?v=1743603760",
        alt: 0,
        position: 9,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.10_895a2f6c-77ec-45e7-9242-a435abeec5a2.jpg?v=1743603757",
        alt: 0,
        position: 10,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.11_552d5ed0-5e8e-4808-adb4-95a874da6a9d.jpg?v=1743603754",
        alt: 0,
        position: 11,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG_eee30470-74be-451c-9537-bc8e483a57dc.jpg?v=1743603751",
        alt: 0,
        position: 12,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/Screenshot2022-11-07132548_43fa1612-1149-4837-aadd-d764b9e2dc6b.jpg?v=1743603502",
        alt: 0,
        position: 13,
      },
    ],
    custom_fields: [],
    handle:
      "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
    published: true,
    frequently_bought_together: [],
    tags: [
      "304 Stainless Steel",
      "4 Burners",
      "43 Inches And Up",
      "Analog",
      "BBQ Grills-yrend",
      "Blaze Grills",
      "Blaze Outdoor Products",
      "BLZ4PROBICV",
      "Built In",
      "Built In Gas Grills",
      "Depth 0-26 Inches",
      "Free Accessories",
      "Gas Grills",
      "Height 0-26 Inches",
      "Internal and External Lights",
      "Liquid Propane Gas",
      "No",
      "Price Drop",
      "Rotisserie Included",
      "Shop All BBQ Grills and Smoker",
      "Shop All BBQ Grills and Smokers",
      "Shop All Blaze",
      "Shop All Blaze Outdoor Products",
      "Shop All Gas Grills",
      "Top Deals",
      "Width 43 Inches and up",
      "With Rear Infrared Burner",
      "Year end Sale 2023",
    ],
    product_type: "Home & Garden",
    uploaded_at: "2025-06-12T02:41:56.593118+00:00",
    product_category: [
      {
        category_name: "Home & Garden",
        id: 1,
      },
    ],
    region_pricing: {
      compare_price_us: null,
      included_us: null,
      price_us: null,
    },
    status: "active",
    sp_product_options: [
      {
        custom_metafields: {
          custom_sale_tag: "0.0",
          size_headings:
            '{"size_1": "34 Inches", "size_2": "44 Inches", "size_3": "", "size_4": "", "size_5": "", "size_6": 0.0, "heading_title": "Size"}',
          open_box: "",
          option_headings:
            '{"option1": "LP", "option2": "NG", "option3": "", "heading_title": "Size"}',
        },
        body_html:
          '<p data-mce-fragment="1"><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">Blaze is excited to introduce the Blaze Professional LUX Grill, which stands out as an industry leader with its strong and long-lasting components. The Blaze Gas grill\'s thickness guarantees unmatched durability, while its efficient cooking system provides outstanding performance.</span></p>\n<p data-mce-fragment="1"><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">By precisely combining fuel and oxygen, the Blaze Professional LUX Portable Propane Gas Grill achieves impressive searing temperatures while maximizing gas usage efficiency compared to other top grill brands. To enhance its attractiveness, the grill also includes an Illumination system that adds a stylish touch, making it a visually striking choice for all admirers.</span></p>\n<h4><b data-mce-fragment="1">About Blaze<br></b></h4>\n<p data-mce-fragment="1"><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">Blaze understands the value of creating a top-notch outdoor living space that people of all ages can enjoy. For many, the ultimate summer pastime is gathering with loved ones for a delightful picnic while grilling up delicious food. That\'s why the company has dedicated extensive time and effort to developing a range of</span><a title="Blaze Outdoor Products" data-mce-fragment="1" href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products" data-mce-href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products"> <span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;"><span style="color: #2b00ff;">Blaze Outdoor Products</span>.</span></a></p>\n<p data-mce-fragment="1"><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">The team at Blaze works diligently to design grills that cater to each individual\'s unique cooking needs. Whether you\'re cooking for your immediate family or hosting a large crowd, Blaze has the perfect grill to suit your requirements. Regardless of your level of grilling expertise, Blaze offers a variety of grills that can accommodate your skill level, allowing you to showcase your culinary abilities and create memorable meals outdoors.</span></p>\n<h4 data-mce-fragment="1"><b data-mce-fragment="1">Blaze Professional LUX Grill Key Features:</b></h4>\n<ul data-mce-fragment="1">\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">BTU Power: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">This grill boasts a total of 54,000 BTUs, with 3 main burners each providing 18,000 BTUs of cooking power, along with a 10,000 BTU infrared rear rotisserie burner for versatile cooking options.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Generous Cooking Space: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">With 816 square inches of total cooking space, this grill provides ample room for grilling a variety of dishes, making it suitable for both small family meals and larger gatherings.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Commercial-Quality H-Burners: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">The main grill surface is equipped with 3 commercial-quality 304 cast stainless steel H-burners, ensuring durability and even heat distribution for consistent results.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Rotisserie Capability: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">The included rotisserie kit features a waterproof motor, guaranteeing dependable and efficient rotisserie cooking.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Durable Hexagonal Cooking Rods: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">Heavy-duty 12mm hexagon stainless steel cooking rods maximize durability and create distinct sear marks on your grilled creations.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Flame Stabilizing Grids: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">These grids are designed to minimize flare-ups while imparting a delicious grilled flavor to your dishes.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Illuminated Knobs: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">Illuminated control knobs not only enhance the grill\'s appearance but also provide practical visibility for evening gatherings and nighttime grilling sessions.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Efficient Ignition: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">The push-and-turn flame-thrower primary ignition system ensures a swift and reliable start every time you ignite the grill.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Heat Zone Separators: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">Heat zone separators divide the cooking surface into separate temperature zones, so you can grill different foods at the same time using different temperatures.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Warming Rack: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">The removable warming rack keeps cooked dishes warm while you grill.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Easy Cleanup: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">The full-width drip tray simplifies post-grilling cleanup, ensuring a quick and hassle-free maintenance process</span><b data-mce-fragment="1">.</b>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Secondary Ignition: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">Individual flash tube secondary ignition provides an alternative ignition method for added reliability.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Interior Lights: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">Built-in interior lights help you grill with precision, even in low-light conditions.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Double-lined Hood: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">The double-lined grill hood protects the outer layer from heat discoloration and helps maintain a consistent cooking temperature by retaining heat effectively.</span>\n</li>\n</ul>\n<h4 data-mce-fragment="1">\n<b data-mce-fragment="1">Added Value: </b><br>\n</h4>\n<ol data-mce-fragment="1">\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Lowest Cost Guaranteed:</b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;"> We ensure that our built-in grills are competitively priced, offering you the best value for your investment.</span><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;"><br data-mce-fragment="1"></span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Lifetime Warranty:</b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;"> Our grills come with a lifetime warranty, providing peace of mind and ensuring that your investment is protected for years to come.</span><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;"><br data-mce-fragment="1"></span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Save up to 60%: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">With our built-in grills, you can enjoy significant savings compared to other high-end grill options on the market.</span><br>\n</li>\n</ol>',
        accentuate_data: {
          "bbq.configuration_heading_title": "Configuration",
          "bbq.grill_specs_color": "Stainless Steel",
          "bbq.seo_meta_total_grill_area": 816,
          "bbq.seo_meta_material": "304 Stainless Steel",
          "bbq.shopnew_heading_title": null,
          "bbq.side_burner_specification_type": null,
          "bbq.ref_specs_cutout_height": null,
          "bbq.side_burner_specs_configuration": null,
          "bbq.seo_meta_secondary_grilling_area": 201,
          "frequently.fbi_related_product": [
            "blaze-grill-cover-professional-34-inch-built-in-grills-3probicv",
            "blaze-professional-built-in-propane-gas-burner-wok-ring-stainless-steel-lid",
            "blaze-32-inch-double-access-door-with-paper-towel-holder-blz-ad32-r",
            "blaze-32-inch-access-door-double-drawer-combo-blz-ddc-r",
          ],
          "bbq.grill_specs_cutout_depth": 23.625,
          "bbq.open_box_heading_title": "Save More",
          "bbq.storage_specs_number_of_drawers": null,
          "bbq.storage_specs_cutout_height": null,
          "bbq.openbox_related_product": [
            "blaze-professional-lux-34-inch-3-burner-built-in-liquid-propane-gas-grill-with-rear-infrared-burner-open-box-blz-3pro-lp-ob",
          ],
          "bbq.grill_specs_type": "Gas Grill",
          "bbq.rear_infrared_burner_btu": 10000,
          "bbq.product_option_related_product": [
            "blaze-3-burner-lbm-blaze-grill-blz-3lbm-lp",
            "blaze-professional-34-inch-3-burner-built-in-propane-gas-grill-with-rear-infrared-burner-blz-3pro-lp",
          ],
          "bbq.side_burner_specs_number_of_burners": null,
          "bbq.product_weight": 196,
          "bbq.configuration_type": ["Built In", "Freestanding"],
          "bbq.seo_meta_manufacturer_part_number": "BLZ-3PRO-LP",
          "bbq.related_product": [
            "blaze-professional-34-inch-3-burner-built-in-propane-gas-grill-with-rear-infrared-burner-blz-3pro-lp",
            "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
          ],
          "bbq.hinge_related_product": null,
          "bbq.shipping_dimensions": "40 x 48 x 25",
          "bbq.storage_specs_cutout_width": null,
          "bbq.hinge_heading_title": null,
          "bbq.seo_meta_fuel_type": "Liquid Propane",
          "bbq.file_name": [
            "Blaze Cutout Specifications [Click to download]",
            "Blaze Professional Grill Use & Care Guide [Click to download]",
          ],
          "bbq.upload_file": [
            "https://cdn.accentuate.io/7825429594369/-1671630088252/Blaze-Cutout-Specifications-v1672697375268.pdf",
            "https://cdn.accentuate.io/7825429594369/-1671630088252/Blaze-Professional-Grill-Use--Care-Guide-v1672697397657.pdf",
          ],
          "bbq.grill_specs_side_shelves": "No",
          "bbq.grill_specs_controller": null,
          "bbq.side_burner_specification_gas_type": null,
          "bbq.ref_specs_heading_title": null,
          "bbq.storage_specs_orientation": null,
          "bbq.thermometer": "Analog",
          "bbq.grill_specs_class": "Luxury",
          "bbq.enable_call_availability_button": null,
          "bbq.overall_dimensions": ["34 x 28.38 x 24.25"],
          "frequently.fbi_heading": "Frequently Bought Together",
          "bbq.storage_specs_cutout_depth": null,
          "bbq.storage_specs_mounting_type": null,
          "bbq.seo_meta_main_grilling_area": 615,
          _id: "blaze-professional-34-inch-3-burner-built-in-propane-gas-grill-with-rear-infrared-burner-blz-3pro-lp",
          "bbq.grill_specs_on_wheels": "No",
          "bbq.product_offer_cta": null,
          "bbq.openbox_product_text": null,
          "bbq.ref_specs_outdoor_rated": null,
          "bbq.single_burner_btus": 18000,
          "bbq.shipping_weight": 211,
          "bbq.seo_meta_manufacturer": "Blaze",
          "bbq.manufacturer_download_heading_title": "Manufacturer's Manual",
          "bbq.grill_specs_no_of_racks": 2,
          "bbq.configuration_product": [
            "blaze-professional-34-inch-3-burner-built-in-propane-gas-grill-with-rear-infrared-burner-blz-3pro-lp",
            "blaze-professional-34-inch-3-burner-freestanding-propane-gas-grill-rear-infrared-burner-blz-3pro-lp-blz-3pro-cart",
          ],
          "bbq.shopnew_product_text": null,
          "bbq.size_heading_title": "Product Size",
          "bbq.ref_specs_cutout_width": null,
          "bbq.brand_storage_specs_type": null,
          "bbq.option_type": ["LP", "NG"],
          "bbq.ref_specs_type": null,
          "bbq.rear_infrared_burner": "Yes",
          "bbq.product_option_heading_title": "Product Option",
          "bbq.product_offer_image_link": null,
          "bbq.grill_specs_mount_type": "Built-In",
          "bbq.rotisserie_kit": "Integrated",
          "bbq.option_title": "Gas Type",
          "bbq.grill_specs_kamado_width": null,
          _info:
            "Blaze Professional LUX - 34-Inch 3-Burner Built-In Grill - Liquid Propane Gas with Rear Infrared Burner - BLZ-3PRO-LP (Home & Garden)",
          "bbq.seo_meta_series": "Professional",
          "bbq.shopnew_related_product": null,
          "bbq.product_offer_url": null,
          "bbq.number_of_main_burners": 3,
          "bbq.storage_specs_number_of_doors": null,
          "bbq.seo_meta_brand": "Blaze",
          "bbq.option_related_product": [
            "blaze-professional-34-inch-3-burner-built-in-propane-gas-grill-with-rear-infrared-burner-blz-3pro-lp",
            "blaze-professional-34-inch-3-burner-built-in-natural-gas-grill-with-rear-infrared-burner-blz-3pro-ng",
          ],
          "bbq.side_burder_specification_gas_type": null,
          "bbq.product_option_name": ["LBM Series", "Professional Lux Series"],
          "bbq.grill_specs_cutout_height": 10.5,
          "bbq.hinge_selection": null,
          "bbq.total_surface_btu": 54000,
          "bbq.grill_specs_size": 34,
          "bbq.select_sale_tag": "Huge Savings",
          "bbq.ref_specs_door_type": null,
          "bbq.cutout_dimensions": ["32.25 x 23.625 x 10.5"],
          "bbq.seo_meta_made_in_usa": "No",
          "bbq.grill_lights": "Internal/External",
          "bbq.shipping_info_heading_title": "Shipping Information",
          "bbq.seo_meta_cooking_grid_dimensions": "30.8125 x 19.9375",
          "bbq.ref_specs_cutout_depth": null,
          "bbq.storage_specs_heading_title": null,
          "bbq.grill_specs_cutout_width": 32.25,
          size_title: ["34 Inches", "44 Inches"],
          "bbq.specification_heading_title": "Specification",
        },
        created_at: "2025-06-12T02:41:56.576240+00:00",
        variants: [
          {
            compare_at_price: 5571.5,
            taxable: true,
            weight_unit: "lb",
            requires_shipping: true,
            price: 3869,
            sku_suggest: ["BLZ-3PRO-LP"],
            qty: 10,
            costing: 2579.4,
            sku: "BLZ-3PRO-LP",
            grams: 88904.10452,
          },
        ],
        title:
          "Blaze Professional LUX - 34-Inch 3-Burner Built-In Grill - Liquid Propane Gas with Rear Infrared Burner - BLZ-3PRO-LP",
        recommendations: {
          complementary_products: "",
          related_products_settings: "",
          search_boost: "",
          related_products: 0,
        },
        features: {
          furniture_features: 0,
          color: 0,
          furniture_material: 0,
          flue_type: 0,
          top_surface_material: 0,
          cover_features: 0,
          material: 0,
          mounting_type: 0,
          stove_top_type: 0,
          extraction_type: 0,
          grease_filter_material: 0,
          water_filter_application: 0,
          power_source: 0,
        },
        updated_at: "2026-03-06T02:34:19.177325+00:00",
        collections: [
          {
            name: "Shop All Brands",
            id: 31,
            slug: "shop-all-brands",
          },
          {
            name: "Shop All Blaze Outdoor Products",
            id: 77,
            slug: "shop-all-blaze-outdoor-products",
          },
          {
            name: "Blaze Outdoor Products",
            id: 79,
            slug: "blaze-outdoor-products",
          },
          {
            name: "Shop All BBQ Grills and Smokers",
            id: 87,
            slug: "shop-all-bbq-grills-and-smokers",
          },
          {
            name: "Shop All Built In Grills",
            id: 88,
            slug: "shop-all-built-in-grills",
          },
          {
            name: "Gas Grills",
            id: 90,
            slug: "gas-grills",
          },
          {
            name: "Shop All Gas Grills",
            id: 92,
            slug: "shop-all-gas-grills",
          },
          {
            name: "Built In Gas Grills",
            id: 93,
            slug: "built-in-gas-grills",
          },
          {
            name: "BBQ Grills year end",
            id: 136,
            slug: "bbq-grills-year-end",
          },
          {
            name: "Blaze Grills",
            id: 138,
            slug: "blaze-grills",
          },
          {
            name: "Year End Sale",
            id: 180,
            slug: "year-end-sale",
          },
          {
            name: "Top Deals",
            id: 192,
            slug: "top-deals",
          },
          {
            name: "Promotions",
            id: 193,
            slug: "promotions",
          },
          {
            name: "Best Sellers for BBQ Grills and Smokers",
            id: 194,
            slug: "best-sellers-for-bbq-grills-and-smokers",
          },
          {
            name: "Best Sellers for Gas Grills",
            id: 195,
            slug: "best-sellers-for-gas-grills",
          },
          {
            name: "Blaze Built-In Grills",
            id: 954,
            slug: "blaze-built-in-grills",
          },
        ],
        ratings: {
          rating_count: "'2",
        },
        product_id: 5731,
        options: {
          option3: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
          option1: {
            name: "Title",
            value: "Default Title",
            linked_to: 0,
          },
          option2: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
        },
        seo: {
          description:
            "Step up your outdoor kitchen game with the Blaze Professional LUX Built-In Grill. Offering exceptional power, precision, and durability, this premium grill is designed for those who take their grilling seriously. Call us now for the best pricing!",
          title:
            "Blaze Professional LUX 34-Inch 3-Burner Built-In Grill - BLZ-3PRO-LP",
        },
        brand: "Blaze Outdoor Products",
        images: [
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3PRO-LP.jpg?v=1743601217",
            alt: 0,
            position: 1,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3PRO-NG.3_ec7950a9-9e44-40b9-810f-491916a4ecbf.jpg?v=1743601493",
            alt: 0,
            position: 2,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3PRO-NG.2_1aeb241d-c501-4e6e-a792-5ba2314d46ad.jpg?v=1743601609",
            alt: 0,
            position: 3,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3PRO-NG.4_2285bba0-1dbb-4d9e-ba3a-79353eff5ab0.jpg?v=1743601612",
            alt: 0,
            position: 4,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3PRO-NG.6_8840f102-1aef-45e9-9b8c-be9860be4b79.jpg?v=1743601736",
            alt: 0,
            position: 5,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3PRO-NG.7_b1f9c078-4e3d-4b3d-ac1c-32a57d3dec5c.jpg?v=1743601739",
            alt: 0,
            position: 6,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3PRO-NG.8_97569ab0-96cb-45fc-8595-642c25f83e22.jpg?v=1743601741",
            alt: 0,
            position: 7,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3PRO-NG.9_4db6732d-7d0d-4ffe-aafd-0a4ba831ce80.jpg?v=1743601744",
            alt: 0,
            position: 8,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3PRO-NG.10_21f09442-33f7-47a8-a25a-dd3466340fc8.jpg?v=1743601747",
            alt: 0,
            position: 9,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3PRO-NG.11_0d2f4ae8-ebe1-497a-b8eb-19d50d07a8ec.jpg?v=1743601749",
            alt: 0,
            position: 10,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3PRO-NG.12_5e6b403a-fbb9-4c55-b730-0ba07da88496.jpg?v=1743601751",
            alt: 0,
            position: 11,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3PRO-NG.13_aaf0a634-b860-4e1d-b1c1-85f7f42232b7.jpg?v=1743601754",
            alt: 0,
            position: 12,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-3PRO-NG_020c7f6f-c7f9-4c7e-9aca-70e202e0086b.jpg?v=1743601763",
            alt: 0,
            position: 13,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/Screenshot2022-11-07132548_b3acb44c-79c3-4378-82f6-a8d5abb2e57c.jpg?v=1743601765",
            alt: 0,
            position: 14,
          },
        ],
        custom_fields: [],
        handle:
          "blaze-professional-34-inch-3-burner-built-in-propane-gas-grill-with-rear-infrared-burner-blz-3pro-lp",
        published: true,
        frequently_bought_together: [],
        tags: [
          "27-33 Inches",
          "3 Burners",
          "304 Stainless Steel",
          "Analog",
          "BBQ Grills-yrend",
          "Best Sellers for BBQ Grills and Smokers",
          "Best Sellers for Gas Grills",
          "Blaze Grills",
          "Blaze Outdoor Products",
          "BLZ3PROBICV",
          "Built In",
          "Built In Gas Grills",
          "Depth 0-26 Inches",
          "Free Accessories",
          "Gas Grills",
          "Height 0-26 Inches",
          "Internal and External Lights",
          "Liquid Propane Gas",
          "No",
          "Price Drop",
          "Rotisserie Included",
          "Shop All BBQ Grills and Smoker",
          "Shop All BBQ Grills and Smokers",
          "Shop All Blaze",
          "Shop All Blaze Outdoor Products",
          "Shop All Gas Grills",
          "Top Deals",
          "Width 27-33 Inches",
          "With Rear Infrared Burner",
          "Year end Sale 2023",
        ],
        product_type: "Home & Garden",
        uploaded_at: "2025-06-12T02:41:56.576227+00:00",
        product_category: [
          {
            category_name: "Home & Garden",
            id: 1,
          },
        ],
        region_pricing: {
          compare_price_us: null,
          included_us: null,
          price_us: null,
        },
        status: "active",
      },
      {
        custom_metafields: {
          custom_sale_tag: "0.0",
          size_headings:
            '{"size_1": "", "size_2": "", "size_3": "", "size_4": "", "size_5": "", "size_6": "", "heading_title": ""}',
          open_box: "0.0",
          option_headings:
            '{"option1": "", "option2": "", "option3": "", "heading_title": ""}',
        },
        body_html:
          '<p>Blaze Premium LTE+ grills represent an enhancement of their previous bestseller, incorporating strategic improvements:<br><br>Four cast stainless steel linear burners ensure exceptional durability.<br>Patented triangle-shaped searing rods create distinct sear marks.<br>Heat zone separators provide greater cooking versatility.<br>Stainless steel flame tamers minimize flare-ups and distribute heat evenly.<br>Constructed from cast 304-grade stainless steel, the Blaze Premium LTE+ is built to withstand diverse challenges. The grill hood, double-lined in stainless steel, prevents heat discoloration and retains more heat where needed. The LTE+ model features a hood assist mechanism for easy opening and closing, improved lighting that stays on during use, and an LED illuminated control system with safety glow lighting. All backed by Blaze\'s lifetime warranty.<br><br>Specifications:<br><br>Class: Premium<br>Fuel Type: Propane<br>Configuration: Built-in<br>Exterior Material: Stainless Steel<br>Primary Color: Stainless Steel<br>Number Of Main Burners: 4 Burners<br>Grilling Surface BTUs: 56,000<br>Infrared Main Burner: Available<br>Main Burner Material: 304 Cast Stainless Steel<br>Flame Tamer Material: Stainless Steel<br>Cooking Grate Material: Stainless Steel<br>Cooking Grid Dimensions: 29 1/2 X 18"<br>Main Grilling Area: 531 Sq. Inches<br>Secondary Grilling Area: 184 Sq. Inches<br>Total Grilling Area: 715 Sq. Inches<br>Burger Count: 18<br>Rotisserie Burner BTUs: 10,000<br>Rotisserie Kit: Available<br>Heat Zone Separators: Yes<br>Ignition Type: Flame Thrower<br>Flash Tubes: Yes<br>Grill Lights: Internal / External<br>Spring Assisted Hood: Yes<br>Thermometer: Analog<br>Includes Smoker Box: No<br>Side Shelves: Yes<br>Hose Included: Yes<br>Made In USA: No<br>Cart Assembly: Some Assembly Required<br>Commercial-Grade Multi-User: No<br>Size: Medium (27 - 33")<br>Marine Grade: No<br>&nbsp;</p><p>Dimensions:<br><br>Width: 56.25"<br>Depth: 25.75"<br>Height: 57.25"<br>Weight: 183 lbs</p>',
        accentuate_data: {
          "bbq.configuration_heading_title": null,
          "bbq.grill_specs_color": "Stainless Steel",
          "bbq.seo_meta_total_grill_area": 715,
          "bbq.seo_meta_material": "304 Stainless Steel",
          "bbq.shopnew_heading_title": null,
          "bbq.side_burner_specification_type": null,
          "bbq.ref_specs_cutout_height": null,
          "bbq.side_burner_specs_configuration": null,
          "bbq.seo_meta_secondary_grilling_area": 184,
          "frequently.fbi_related_product": null,
          "bbq.grill_specs_cutout_depth": 21.25,
          "bbq.open_box_heading_title": null,
          "bbq.storage_specs_number_of_drawers": null,
          "bbq.storage_specs_cutout_height": null,
          "bbq.openbox_related_product": null,
          "bbq.grill_specs_type": "Gas Grill",
          "bbq.rear_infrared_burner_btu": 10000,
          "bbq.product_option_related_product": [
            "blaze-four-burner-built-in-propane-gas-grill-rear-infrared-burner-grill-lights",
            "blaze-premium-lte-32-inch-4-burner-propane-gas-grill-w-rear-infrared-burner-lift-assist-hood-blz-4lte3-lp",
            "blaze-premium-lte3-marine-grade-32-4-burner-gas-grill-with-rear-infrared-burner-grill-lights-blz-4lte3mg-lp",
            "blaze-4-burner-lbm-blaze-grill-blz-4lbm-lp",
          ],
          "bbq.side_burner_specs_number_of_burners": null,
          "bbq.product_weight": 114,
          "bbq.configuration_type": null,
          "bbq.seo_meta_manufacturer_part_number": null,
          "bbq.related_product": [
            "blaze-premium-lte-32-inch-4-burner-propane-gas-grill-w-rear-infrared-burner-lift-assist-hood-blz-4lte3-lp",
            "blaze-premium-lte-40-inch-5-burner-propane-gas-grill-w-rear-infrared-burner-lift-assist-hood-blz-5lte3-lp",
          ],
          "bbq.hinge_related_product": null,
          "bbq.shipping_dimensions": "40 x 48 x 29",
          "bbq.storage_specs_cutout_width": null,
          "bbq.hinge_heading_title": null,
          "bbq.seo_meta_fuel_type": "Liquid Propane",
          "bbq.file_name": ["Blaze LTE3 User Manual"],
          "bbq.upload_file": [
            "https://cdn.accentuate.io/8213485846785/-1671630088252/Blaze-LTE3-User-Manual-v1714167991384.pdf",
          ],
          "bbq.grill_specs_side_shelves": "No",
          "bbq.grill_specs_controller": null,
          "bbq.side_burner_specification_gas_type": null,
          "bbq.ref_specs_heading_title": null,
          "bbq.storage_specs_orientation": null,
          "bbq.thermometer": "Analog",
          "bbq.grill_specs_class": "Premium",
          "bbq.enable_call_availability_button": null,
          "bbq.overall_dimensions": ["32.5 x 25.75 x 21.25"],
          "frequently.fbi_heading": null,
          "bbq.storage_specs_cutout_depth": null,
          "bbq.storage_specs_mounting_type": null,
          "bbq.seo_meta_main_grilling_area": 531,
          _id: "blaze-premium-lte-32-inch-4-burner-propane-gas-grill-w-rear-infrared-burner-lift-assist-hood-blz-4lte3-lp",
          "bbq.grill_specs_on_wheels": "No",
          "bbq.product_offer_cta": null,
          "bbq.openbox_product_text": null,
          "bbq.ref_specs_outdoor_rated": null,
          "bbq.single_burner_btus": 14000,
          "bbq.shipping_weight": 130,
          "bbq.seo_meta_manufacturer": "Pacific Coast Manufacturing",
          "bbq.manufacturer_download_heading_title": "Manufacturer’s Downloads",
          "bbq.grill_specs_no_of_racks": 2,
          "bbq.configuration_product": null,
          "bbq.shopnew_product_text": null,
          "bbq.size_heading_title": "Product Size",
          "bbq.ref_specs_cutout_width": null,
          "bbq.brand_storage_specs_type": null,
          "bbq.option_type": ["LP", "NG"],
          "bbq.ref_specs_type": null,
          "bbq.rear_infrared_burner": "Yes",
          "bbq.product_option_heading_title": "Product Option",
          "bbq.product_offer_image_link": null,
          "bbq.grill_specs_mount_type": "Built-In",
          "bbq.rotisserie_kit": "Optional",
          "bbq.option_title": "Gas Type",
          "bbq.grill_specs_kamado_width": null,
          _info:
            "Blaze Premium LTE+ 32-Inch 4-Burner Built-In Propane Gas Grill W/ Rear Infrared Burner & Lift-Assist Hood - BLZ-4LTE3-LP",
          "bbq.seo_meta_series": "LTE",
          "bbq.shopnew_related_product": null,
          "bbq.product_offer_url": null,
          "bbq.number_of_main_burners": 4,
          "bbq.storage_specs_number_of_doors": null,
          "bbq.seo_meta_brand": "Blaze",
          "bbq.option_related_product": [
            "blaze-premium-lte-32-inch-4-burner-propane-gas-grill-w-rear-infrared-burner-lift-assist-hood-blz-4lte3-lp",
            "blaze-premium-lte-32-inch-4-burner-natural-gas-grill-w-rear-infrared-burner-lift-assist-hood-blz-4lte3-ng",
          ],
          "bbq.side_burder_specification_gas_type": null,
          "bbq.product_option_name": [
            "LTE Series",
            "LTE+ Series",
            "LTE+ Marine Grade",
            "LBM Series",
          ],
          "bbq.grill_specs_cutout_height": 8.5,
          "bbq.hinge_selection": null,
          "bbq.total_surface_btu": 56000,
          "bbq.grill_specs_size": 32,
          "bbq.select_sale_tag": "Free Accessory",
          "bbq.ref_specs_door_type": null,
          "bbq.cutout_dimensions": ["30 5/8 x 21 1/4 x 8 1/2"],
          "bbq.seo_meta_made_in_usa": "No",
          "bbq.grill_lights": "Internal/External",
          "bbq.shipping_info_heading_title": "Shipping Information",
          "bbq.seo_meta_cooking_grid_dimensions": "29 1/2 x 18",
          "bbq.ref_specs_cutout_depth": null,
          "bbq.storage_specs_heading_title": null,
          "bbq.grill_specs_cutout_width": 30.625,
          size_title: ["32 Inches", "40 Inches"],
          "bbq.specification_heading_title": "Specification",
        },
        created_at: "2025-06-12T02:41:09.838347+00:00",
        variants: [
          {
            compare_at_price: "3238.7",
            price: 2374,
            sku_suggest: ["BLZ-4LTE3-LP"],
            qty: 2,
            sku: "BLZ-4LTE3-LP",
            grams: 0,
          },
        ],
        title:
          "Blaze Premium LTE+ 32-Inch 4-Burner Built-In Propane Gas Grill W/ Rear Infrared Burner & Lift-Assist Hood - BLZ-4LTE3-LP",
        recommendations: {
          complementary_products: "",
          related_products_settings: "",
          search_boost: "",
          related_products: 0,
        },
        features: {
          furniture_features: "",
          color: "",
          furniture_material: "",
          flue_type: "",
          top_surface_material: "",
          cover_features: "",
          material: "",
          mounting_type: "",
          stove_top_type: "",
          extraction_type: "",
          grease_filter_material: "",
          water_filter_application: "",
          power_source: "",
        },
        updated_at: "2026-03-06T02:34:19.148532+00:00",
        collections: [
          {
            name: "Shop All Brands",
            id: 31,
            slug: "shop-all-brands",
          },
          {
            name: "Shop All Blaze Outdoor Products",
            id: 77,
            slug: "shop-all-blaze-outdoor-products",
          },
          {
            name: "Blaze Outdoor Products",
            id: 79,
            slug: "blaze-outdoor-products",
          },
          {
            name: "Shop All BBQ Grills and Smokers",
            id: 87,
            slug: "shop-all-bbq-grills-and-smokers",
          },
          {
            name: "Shop All Built In Grills",
            id: 88,
            slug: "shop-all-built-in-grills",
          },
          {
            name: "Shop All Gas Grills",
            id: 92,
            slug: "shop-all-gas-grills",
          },
          {
            name: "Built In Gas Grills",
            id: 93,
            slug: "built-in-gas-grills",
          },
          {
            name: "Blaze Grills",
            id: 138,
            slug: "blaze-grills",
          },
          {
            name: "Blaze Built-In Grills",
            id: 954,
            slug: "blaze-built-in-grills",
          },
        ],
        ratings: {
          rating_count: "",
        },
        product_id: 1144,
        options: {
          option3: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
          option1: {
            name: "Title",
            value: "Default Title",
            linked_to: 0,
          },
          option2: {
            name: "",
            value: "",
            linked_to: 0,
          },
        },
        seo: {
          description:
            "Unleash Gourmet Perfection Outdoors with the Blaze Premium LTE Grill. Designed for precision, durability, and style, this grill transforms any meal into a gourmet masterpiece.  Call us now for pricing!",
          title: "",
        },
        brand: "Blaze Outdoor Products",
        images: [
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/files/Snip2024-03-0517.07.01.jpg?v=1743576326",
            alt: 0,
            position: 1,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/files/Snip2024-03-0517.07.22.jpg?v=1743576328",
            alt: 0,
            position: 2,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/files/Snip2024-03-0517.07.58.jpg?v=1743576330",
            alt: 0,
            position: 3,
          },
        ],
        custom_fields: [],
        handle:
          "blaze-premium-lte-32-inch-4-burner-propane-gas-grill-w-rear-infrared-burner-lift-assist-hood-blz-4lte3-lp",
        published: true,
        frequently_bought_together: [],
        tags: [
          "Blaze Grills",
          "Blaze Outdoor Products",
          "Built In",
          "Built In Gas Grills",
          "Shop All BBQ Grills and Smoker",
          "Shop All BBQ Grills and Smokers",
          "Shop All Blaze",
          "Shop All Blaze Outdoor Products",
          "Shop All Built In Grills",
        ],
        product_type: "",
        uploaded_at: "2025-06-12T02:41:09.838337+00:00",
        product_category: [
          {
            category_name: "Home & Garden",
            id: 1,
          },
          {
            category_name: "Kitchen & Dining",
            id: 2,
          },
          {
            category_name: "Kitchen Appliances",
            id: 15,
          },
          {
            category_name: "Outdoor Grills",
            id: 16,
          },
        ],
        region_pricing: {
          compare_price_us: null,
          included_us: null,
          price_us: null,
        },
        status: "active",
      },
      {
        custom_metafields: {
          custom_sale_tag: "0.0",
          size_headings:
            '{"size_1": "34 Inches", "size_2": "44 Inches", "size_3": "", "size_4": "", "size_5": "", "size_6": "", "heading_title": ""}',
          open_box: "0.0",
          option_headings:
            '{"option1": "LP", "option2": "NG", "option3": "", "heading_title": "Gas Type"}',
        },
        body_html:
          '<p data-mce-fragment="1"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Introducing the Blaze 44 inch Professional Grill, a frontrunner in the industry known for its robust components that result in irrefutable durability and an effective cooking system. With precision mixing of fuel and blending oxygen Blaze Professional achieves extraordinary searing temperatures while maintaining low gas consumption per burner compared to other top-performing grill brands. The grill\'s professional illumination system adds a touch of elegance, making it a catch every admiring eye for all to behold. Experience unparalleled performance and undeniable sophistication with the Blaze Professional Grill 44.</span></p>\n<h4 data-mce-fragment="1"><b data-mce-fragment="1">About Blaze</b></h4>\n<p data-mce-fragment="1"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Blaze understands the value of creating a top-notch outdoor living space that people of all ages can enjoy. For many, the ultimate summer pastime is gathering with loved ones for a delightful picnic while grilling up delicious food. That\'s why the company has dedicated extensive time and effort to developing a range of </span><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"><span style="color: #2b00ff;"><a href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products" title="Blaze Outdoor Products" style="color: #2b00ff;">Blaze Outdoor Products</a></span><a href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products" data-mce-fragment="1" data-mce-href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products">.</a></span></p>\n<p data-mce-fragment="1"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The team at Blaze works diligently to design grills that cater to each individual\'s unique cooking needs. Whether you\'re cooking for your immediate family or hosting a large crowd, Blaze has the perfect grill to suit your requirements. Regardless of your level of grilling expertise, Blaze offers a variety of grills that can accommodate your skill level, allowing you to showcase your culinary abilities and create memorable meals outdoors.</span></p>\n<h4 data-mce-fragment="1"><b data-mce-fragment="1">Blaze Premium LTE Grill Key Features:</b></h4>\n<ul data-mce-fragment="1">\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">82000 Total BTUs: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">This gas grill features 4 main burners with 18,000 BTUs each, along with a 10,000 BTU infrared rear rotisserie burner.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Generous Cooking Space: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Enjoy a cooking space of 1050 square inches in total.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">H-Burners: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The main grill surface is powered by 4 commercial quality 304 cast stainless steel H-burners.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Included</b> <b data-mce-fragment="1">Rotisserie Kit: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The</span> <span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">rotisserie kit includes a waterproof motor for flavorful rotisserie cooking.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Hexagonal Cooking Rods: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Heavy 12mm stainless steel hexagon cooking rods maximize durability and create impressive sear marks.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Stabilizing Grids: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Flame stabilizing grids minimize flare-ups while adding a delicious grilled flavor.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Illuminated Knobs: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The illuminated control knobs enhance the grill\'s appearance for evening gatherings.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Flame Thrower Ignition: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The push-and-turn flame-thrower primary ignition system delivers a fast start every time.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Separate Heat Zones: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Heat zone separators divide the cooking surface into individual temperature zones for versatile cooking options.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Warming Rack: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">A removable warming rack is included for keeping food warm or cooking at lower temperatures.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Drip Pan: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Features a full-width drip tray and removable baffles for quick and easy cleanup.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Secondary Ignition: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Individual flash tube secondary ignition provides an alternate ignition option.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Interior Lights:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> Interior lights help navigate the grilling surface during nighttime cooking.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Double-lined Hood: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The double-lined grill hood protects the outer layer from heat discoloration and helps retain more heat.</span>\n</li>\n</ul>\n<h4 data-mce-fragment="1"><b data-mce-fragment="1">Added Value: </b></h4>\n<ol data-mce-fragment="1">\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Lowest Cost Guaranteed:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> We ensure that our built-in grills are competitively priced, offering you the best value for your investment.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Lifetime Warranty:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> Our grills come with a lifetime warranty, providing peace of mind and ensuring that your investment is protected for years to come.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Save up to 60%: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">With our built-in grills, you can enjoy significant savings compared to other high-end grill options on the market.</span>\n</li>\n</ol>',
        accentuate_data: {
          "bbq.configuration_heading_title": "Configuration",
          "bbq.grill_specs_color": "Stainless Steel",
          "bbq.seo_meta_total_grill_area": 1050,
          "bbq.seo_meta_material": "304 Stainless Steel",
          "bbq.shopnew_heading_title": null,
          "bbq.side_burner_specification_type": null,
          "bbq.ref_specs_cutout_height": null,
          "bbq.side_burner_specs_configuration": null,
          "bbq.seo_meta_secondary_grilling_area": 253,
          "frequently.fbi_related_product": [
            "blaze-grill-cover-for-professional-lux-44-inch-freestanding-gas-grills-4proctcv",
            "blaze-professional-infrared-searing-burner-blz-pro-ir",
            "blaze-ceramic-pizza-stone-stainless-steel-tray-blz-pro-pzst-2",
            "blaze-14-3-4-inch-ceramic-pizza-stone-with-stainless-steel-tray-blz-pzst",
          ],
          "bbq.grill_specs_cutout_depth": null,
          "bbq.open_box_heading_title": null,
          "bbq.storage_specs_number_of_drawers": null,
          "bbq.storage_specs_cutout_height": null,
          "bbq.openbox_related_product": null,
          "bbq.grill_specs_type": "Cart",
          "bbq.rear_infrared_burner_btu": null,
          "bbq.product_option_related_product": [
            "blz-4lbm-lp-blz-4-cart",
            "blaze-lte-32-inch-4-burner-freestanding-propane-gas-grill-blz-4lte2-lp-blz-4-cart",
            "blaze-marine-burner-freestanding-cart",
            "blz-4pro-lp-blz-4pro-cart",
          ],
          "bbq.side_burner_specs_number_of_burners": null,
          "bbq.product_weight": 315,
          "bbq.configuration_type": ["Freestanding", "Built In"],
          "bbq.seo_meta_manufacturer_part_number":
            "BLZ-4PRO + BLZ-4PRO-CART-LTSC",
          "bbq.related_product": [
            "blaze-professional-34-inch-3-burner-freestanding-propane-gas-grill-rear-infrared-burner-blz-3pro-lp-blz-3pro-cart",
            "blz-4pro-lp-blz-4pro-cart",
          ],
          "bbq.hinge_related_product": null,
          "bbq.shipping_dimensions": "40 x 48 x 51",
          "bbq.storage_specs_cutout_width": null,
          "bbq.hinge_heading_title": null,
          "bbq.seo_meta_fuel_type": null,
          "bbq.file_name": [
            "Product Manual [Click to download]",
            "Spec Sheet for BLZ-4PRO-LP + BLZ-4PRO-CART  [Click to download]",
            "Blaze Catalog [Click to download]",
          ],
          "bbq.upload_file": [
            "https://cdn.accentuate.io/7869687955713/-1671630088252/BLZ-4PRO-LP--BLZ-4PRO-CART-Manual-v1672681746295.pdf",
            "https://cdn.accentuate.io/7869687955713/-1671630088252/BLZ-4PRO-LP--BLZ-4PRO-CART-Spec-Sheet-v1672681917385.pdf",
            "https://cdn.accentuate.io/7869687955713/-1671630088252/Blaze-Catalog-v1672681870591.pdf",
          ],
          "bbq.grill_specs_side_shelves": "Yes",
          "bbq.grill_specs_controller": null,
          "bbq.side_burner_specification_gas_type": null,
          "bbq.ref_specs_heading_title": null,
          "bbq.storage_specs_orientation": null,
          "bbq.thermometer": null,
          "bbq.grill_specs_class": "Luxury",
          "bbq.enable_call_availability_button": null,
          "bbq.overall_dimensions": ["75 x 28.37 x 50.25"],
          "frequently.fbi_heading": "Frequently Bought Together",
          "bbq.storage_specs_cutout_depth": null,
          "bbq.storage_specs_mounting_type": null,
          "bbq.seo_meta_main_grilling_area": 797,
          _id: "blz-4pro-lp-blz-4pro-cart",
          "bbq.grill_specs_on_wheels": "Yes",
          "bbq.product_offer_cta": null,
          "bbq.openbox_product_text": null,
          "bbq.ref_specs_outdoor_rated": null,
          "bbq.single_burner_btus": 18000,
          "bbq.shipping_weight": 330,
          "bbq.seo_meta_manufacturer": "Blaze",
          "bbq.manufacturer_download_heading_title": "Manufacturer's Manual",
          "bbq.grill_specs_no_of_racks": null,
          "bbq.configuration_product": [
            "blz-4pro-lp-blz-4pro-cart",
            "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
          ],
          "bbq.shopnew_product_text": null,
          "bbq.size_heading_title": "Product Size",
          "bbq.ref_specs_cutout_width": null,
          "bbq.brand_storage_specs_type": null,
          "bbq.option_type": ["LP", "NG"],
          "bbq.ref_specs_type": null,
          "bbq.rear_infrared_burner": null,
          "bbq.product_option_heading_title": "Product Option",
          "bbq.product_offer_image_link":
            "https://cdn.shopify.com/s/files/1/0660/1900/0577/files/SmallOpenBoxGrills.png?v=1676559383",
          "bbq.grill_specs_mount_type": "Freestanding",
          "bbq.rotisserie_kit": null,
          "bbq.option_title": "Gas Type",
          "bbq.grill_specs_kamado_width": null,
          _info:
            "Blaze Professional LUX - 44-Inch 4-Burner Freestanding Grill - Liquid Propane with Rear Infrared Burner - BLZ-4PRO + BLZ-4PRO-CART-LTSC (Home & Garden)",
          "bbq.seo_meta_series": "Professional",
          "bbq.shopnew_related_product": null,
          "bbq.product_offer_url":
            "https://outdoorkitchenoutlet.com/collections/grills-open-box",
          "bbq.number_of_main_burners": 4,
          "bbq.storage_specs_number_of_doors": null,
          "bbq.seo_meta_brand": "Blaze",
          "bbq.option_related_product": [
            "blz-4pro-lp-blz-4pro-cart",
            "blz-4pro-ng-blz-4pro-cart",
          ],
          "bbq.side_burder_specification_gas_type": null,
          "bbq.product_option_name": [
            "LBM Series",
            "LTE Series",
            "Marine Grade Series",
            "Professional Lux Series",
          ],
          "bbq.grill_specs_cutout_height": null,
          "bbq.hinge_selection": null,
          "bbq.total_surface_btu": 72000,
          "bbq.grill_specs_size": 44,
          "bbq.select_sale_tag": null,
          "bbq.ref_specs_door_type": null,
          "bbq.cutout_dimensions": null,
          "bbq.seo_meta_made_in_usa": "No",
          "bbq.grill_lights": null,
          "bbq.shipping_info_heading_title": "Shipping Information",
          "bbq.seo_meta_cooking_grid_dimensions": "40 x 19.9375",
          "bbq.ref_specs_cutout_depth": null,
          "bbq.storage_specs_heading_title": null,
          "bbq.grill_specs_cutout_width": null,
          size_title: ["34 Inches", "44 Inches"],
          "bbq.specification_heading_title": "Specification",
        },
        created_at: "2025-06-12T02:41:10.116896+00:00",
        variants: [
          {
            compare_at_price: 7048,
            taxable: true,
            weight_unit: "lb",
            requires_shipping: true,
            price: 6748,
            sku_suggest: ["BLZ-4PRO-LP + BLZ-4PRO-CART-LTSC"],
            qty: 10,
            costing: 4230,
            sku: "BLZ-4PRO-LP + BLZ-4PRO-CART-LTSC",
            grams: 142881.59655,
          },
        ],
        title:
          "Blaze Professional LUX - 44-Inch 4-Burner Freestanding Grill - Liquid Propane with Rear Infrared Burner - BLZ-4PRO-LP + BLZ-4PRO-CART-LTSC",
        recommendations: {
          complementary_products: "",
          related_products_settings: "",
          search_boost: "",
          related_products: 0,
        },
        features: {
          furniture_features: "",
          color: "",
          furniture_material: "",
          flue_type: "",
          top_surface_material: "",
          cover_features: "",
          material: "",
          mounting_type: "",
          stove_top_type: "",
          extraction_type: "",
          grease_filter_material: "",
          water_filter_application: "",
          power_source: "",
        },
        updated_at: "2026-03-06T02:34:19.231845+00:00",
        collections: [
          {
            name: "Shop All Brands",
            id: 31,
            slug: "shop-all-brands",
          },
          {
            name: "Shop All Blaze Outdoor Products",
            id: 77,
            slug: "shop-all-blaze-outdoor-products",
          },
          {
            name: "Blaze Outdoor Products",
            id: 79,
            slug: "blaze-outdoor-products",
          },
          {
            name: "Shop All BBQ Grills and Smokers",
            id: 87,
            slug: "shop-all-bbq-grills-and-smokers",
          },
          {
            name: "Gas Grills",
            id: 90,
            slug: "gas-grills",
          },
          {
            name: "Freestanding Gas Grills",
            id: 91,
            slug: "freestanding-gas-grills",
          },
          {
            name: "Shop All Gas Grills",
            id: 92,
            slug: "shop-all-gas-grills",
          },
          {
            name: "Blaze Grills",
            id: 138,
            slug: "blaze-grills",
          },
          {
            name: "Top Deals",
            id: 192,
            slug: "top-deals",
          },
          {
            name: "Promotions",
            id: 193,
            slug: "promotions",
          },
          {
            name: "Best Sellers for Commercial-Grade Grills",
            id: 244,
            slug: "best-sellers-for-commercial-grade-grills",
          },
          {
            name: "Shop All Commercial Grade Grills",
            id: 245,
            slug: "shop-all-commercial-grade-grills",
          },
          {
            name: "Blaze Freestanding Grills",
            id: 955,
            slug: "blaze-freestanding-grills",
          },
          {
            name: "Shop All Freestanding Grills",
            id: 962,
            slug: "shop-all-freestanding-grills",
          },
        ],
        ratings: {
          rating_count: "'2",
        },
        product_id: 1190,
        options: {
          option3: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
          option1: {
            name: "Title",
            value: "Default Title",
            linked_to: 0,
          },
          option2: {
            name: "",
            value: "",
            linked_to: 0,
          },
        },
        seo: {
          description: "",
          title: "",
        },
        brand: "Blaze Outdoor Products",
        images: [
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-LP_BLZ-4PRO-CART_f9427960-50ae-4a36-9647-11ce14dd5ffd.jpg?v=1743615139",
            alt: 0,
            position: 1,
          },
        ],
        custom_fields: [],
        handle: "blz-4pro-lp-blz-4pro-cart",
        published: true,
        frequently_bought_together: [],
        tags: [
          "4 Burners",
          "43 Inches And Up",
          "Best Sellers for Commercial-Grade Grills",
          "Blaze Grills",
          "Blaze Outdoor Products",
          "BLZ4PROCTCV",
          "Commercial Grade Grills",
          "Freestanding",
          "Freestanding Gas Grills",
          "Gas Grills",
          "Internal and External Lights",
          "Liquid Propane Gas",
          "No",
          "Shop All BBQ Grills and Smoker",
          "Shop All BBQ Grills and Smokers",
          "Shop All Blaze",
          "Shop All Blaze Outdoor Products",
          "Shop All Gas Grills",
          "Top Deals",
          "With Rear Infrared Burner",
        ],
        product_type: "Home & Garden",
        uploaded_at: "2025-06-12T02:41:10.116888+00:00",
        product_category: [
          {
            category_name: "Home & Garden",
            id: 1,
          },
        ],
        region_pricing: {
          compare_price_us: null,
          included_us: null,
          price_us: null,
        },
        status: "active",
      },
      {
        custom_metafields: {
          custom_sale_tag: "0.0",
          size_headings:
            '{"size_1": "", "size_2": "", "size_3": "", "size_4": "", "size_5": "", "size_6": 0.0, "heading_title": ""}',
          open_box: "",
          option_headings:
            '{"option1": "LP", "option2": "NG", "option3": "", "heading_title": "Gas Type"}',
        },
        body_html:
          '<p data-mce-fragment="1"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Blaze is thrilled to introduce the latest addition to their lineup, the Blaze Premium LTE 32-inch 4-burner Propane Gas Grill. This amazing grill has been specially designed to handle the challenges of coastal BBQs. What\'s even more exciting is that the Marine Grade 4-Burner LTE is now approved for multi-user applications, making it perfect for apartments, hotels, and other similar settings.</span></p>\n<p data-mce-fragment="1"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">To make sure that users in busy areas stay safe, Blaze has added an innovative flame guard to this grill. This unique feature, which sits in the drip pan, reduces the risk of grease fires. With its durability and added safety measures, the Blaze 4 Burner Marine Grade LTE Grill is the perfect choice for those who love to grill in multi-user environments.</span></p>\n<h4 data-mce-fragment="1"><b data-mce-fragment="1">About Blaze</b></h4>\n<p data-mce-fragment="1"><b data-mce-fragment="1"></b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Blaze understands the value of creating a top-notch outdoor living space that people of all ages can enjoy. For many, the ultimate summer pastime is gathering with loved ones for a delightful picnic while grilling up delicious food. That\'s why the company has dedicated extensive time and effort to developing a range of</span><span style="color: #2b00ff;"><a href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products" data-mce-fragment="1" data-mce-href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products"> </a><a href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products" title="Blaze Outdoor Products" style="color: #2b00ff;"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Blaze Outdoor Products.</span></a></span></p>\n<p data-mce-fragment="1"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The team at Blaze works diligently to design grills that cater to each individual\'s unique cooking needs. Whether you\'re cooking for your immediate family or hosting a large crowd, Blaze has the perfect grill to suit your requirements. Regardless of your level of grilling expertise, Blaze offers a variety of grills that can accommodate your skill level, allowing you to showcase your culinary abilities and create memorable meals outdoors.</span></p>\n<h4 data-mce-fragment="1"><span style="color: #000000;"><b data-mce-fragment="1">Blaze Premium LTE Marine Grade Grill Key Features:</b></span></h4>\n<ul data-mce-fragment="1">\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Ample Cooking Space: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Enjoy a generous 740 square inches of total cooking surface, providing plenty of room to grill all your favorite foods.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Powerful BTU Output: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">With a total of 66,000 BTUs, including 14,000 BTUs of cooking power per burner and a 10,000 BTU infrared rear rotisserie burner, this grill delivers impressive heat for perfect results every time.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Durable Stainless Steel Burners: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The 4 commercial quality 316L cast stainless steel linear burners ensure long-lasting performance and even heat distribution.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Convenient Warming Rack: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The removable warming rack allows you to cook at lower temperatures or keep your food warm while preparing other dishes.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Easy Cleanup: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The full-width drip tray makes cleaning up a breeze, ensuring quick and effortless maintenance.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Precise Temperature Control: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Heat zone separators divide the cooking surface into individual temperature zones, allowing you to cook different foods simultaneously with precise control.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Marine-Grade Construction: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">All stainless steel components are constructed with marine-grade 316L Stainless Steel, ensuring durability and resistance to corrosion in coastal environments.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Multi-User Approved:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> This Blaze grill is designed and approved for multi-user applications, making it suitable for apartments, hotels, condominium complexes, fire stations, and more.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Triangular Cooking Rods: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The heavy 9mm patented triangle-shaped searing rods maximize durability and provide excellent heat retention for consistent grilling results.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Reliable Ignition System: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The reliable push-turn flame-thrower primary ignition system ensures a fast and reliable start every time. Additionally, the flash tube ignition and crossovers offer an alternate ignition option.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Flame Stabilization: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The flame-stabilizing grids minimize flare-ups and add a tasty grilled flavor to your food with beautiful sear marks.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Double-Lined Grill Hood: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The double-lined grill hood protects the outer layer from heat discoloration, ensuring a sleek and polished appearance while maintaining more heat inside for efficient cooking.</span>\n</li>\n</ul>\n<h4 data-mce-fragment="1"><b data-mce-fragment="1">Added Value: </b></h4>\n<ol data-mce-fragment="1">\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Lowest Cost Guaranteed:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> We ensure that our built-in grills are competitively priced, offering you the best value for your investment.</span><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"><br data-mce-fragment="1"></span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Lifetime Warranty:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> Our grills come with a lifetime warranty, providing peace of mind and ensuring that your investment is protected for years to come.</span><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"><br data-mce-fragment="1"></span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Save up to 60%: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">With our built-in grills, you can enjoy significant savings compared to other high-end grill options on the market.</span><br>\n</li>\n</ol>',
        accentuate_data: {
          "bbq.configuration_heading_title": "Configuration",
          "bbq.grill_specs_color": "Stainless Steel",
          "bbq.seo_meta_total_grill_area": 715,
          "bbq.seo_meta_material": "316L Stainless Steel",
          "bbq.shopnew_heading_title": null,
          "bbq.side_burner_specification_type": null,
          "bbq.ref_specs_cutout_height": null,
          "bbq.side_burner_specs_configuration": null,
          "bbq.seo_meta_secondary_grilling_area": 184,
          "frequently.fbi_related_product": [
            "blaze-32-inch-4-burner-built-in-natural-gas-gill-with-rear-infrared-burner-grill-lights-blz-4lte2-ng",
            "blaze-grill-cover-for-original-5-burner-built-in-grills-5bicv",
            "blaze-39-inch-access-door-triple-drawer-combo-blz-ddc-39-r",
            "blaze-18-inch-stainless-steel-single-access-door-vertical-blz-sv-1420-r",
          ],
          "bbq.grill_specs_cutout_depth": 21.25,
          "bbq.open_box_heading_title": null,
          "bbq.storage_specs_number_of_drawers": null,
          "bbq.storage_specs_cutout_height": null,
          "bbq.openbox_related_product": null,
          "bbq.grill_specs_type": "Gas Grill",
          "bbq.rear_infrared_burner_btu": 10000,
          "bbq.product_option_related_product": [
            "blaze-4-burner-lbm-blaze-grill-blz-4lbm-lp",
            "blaze-four-burner-built-in-propane-gas-grill-rear-infrared-burner-grill-lights",
            "blaze-marine-grade-32-inch-4-burner-built-in-propane-gas-grill-with-rear-infrared-burner-grill-lights-blz-4lte2mg-lp",
            "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
            "blaze-premium-lte-32-inch-4-burner-propane-gas-grill-w-rear-infrared-burner-lift-assist-hood-blz-4lte3-lp",
          ],
          "bbq.side_burner_specs_number_of_burners": null,
          "bbq.product_weight": 114,
          "bbq.configuration_type": ["Built In", "Freestanding"],
          "bbq.seo_meta_manufacturer_part_number": "BLZ-4LTE2MG-LP",
          "bbq.related_product": null,
          "bbq.hinge_related_product": null,
          "bbq.shipping_dimensions": "40 x 48 x 22",
          "bbq.storage_specs_cutout_width": null,
          "bbq.hinge_heading_title": null,
          "bbq.seo_meta_fuel_type": "Liquid Propane",
          "bbq.file_name": [
            "Blaze LTE2MG Gas Grill Use & Care Guide [Click to download]",
            "Blaze Cutout Specifications [Click to download]",
          ],
          "bbq.upload_file": [
            "https://cdn.accentuate.io/7825420452097/-1671630088252/Blaze-LTE2MG-Gas-Grill-Use--Care-Guide-v1672697624995.pdf",
            "https://cdn.accentuate.io/7825420452097/-1671630088252/Blaze-Cutout-Specifications-v1672697621291.pdf",
          ],
          "bbq.grill_specs_side_shelves": "No",
          "bbq.grill_specs_controller": null,
          "bbq.side_burner_specification_gas_type": null,
          "bbq.ref_specs_heading_title": null,
          "bbq.storage_specs_orientation": null,
          "bbq.thermometer": "Analog",
          "bbq.grill_specs_class": "Luxury",
          "bbq.enable_call_availability_button": null,
          "bbq.overall_dimensions": ["32.5 x 25.75 x 21.25"],
          "frequently.fbi_heading": "Frequently Bought Together",
          "bbq.storage_specs_cutout_depth": null,
          "bbq.storage_specs_mounting_type": null,
          "bbq.seo_meta_main_grilling_area": 531,
          _id: "blaze-marine-grade-32-inch-4-burner-built-in-propane-gas-grill-with-rear-infrared-burner-grill-lights-blz-4lte2mg-lp",
          "bbq.grill_specs_on_wheels": "No",
          "bbq.product_offer_cta": null,
          "bbq.openbox_product_text": null,
          "bbq.ref_specs_outdoor_rated": null,
          "bbq.single_burner_btus": 14000,
          "bbq.shipping_weight": 129,
          "bbq.seo_meta_manufacturer": "Blaze",
          "bbq.manufacturer_download_heading_title": "Manufacturer's Manual",
          "bbq.grill_specs_no_of_racks": 2,
          "bbq.configuration_product": [
            "blaze-marine-grade-32-inch-4-burner-built-in-propane-gas-grill-with-rear-infrared-burner-grill-lights-blz-4lte2mg-lp",
            "blaze-lte-marine-grade-32-inch-4-burner-freestanding-blz-4lte2mg-ng-blz-4-cart",
          ],
          "bbq.shopnew_product_text": null,
          "bbq.size_heading_title": null,
          "bbq.ref_specs_cutout_width": null,
          "bbq.brand_storage_specs_type": null,
          "bbq.option_type": ["LP", "NG"],
          "bbq.ref_specs_type": null,
          "bbq.rear_infrared_burner": "Yes",
          "bbq.product_option_heading_title": "Product Option",
          "bbq.product_offer_image_link":
            "https://cdn.shopify.com/s/files/1/0660/1900/0577/files/SmallOpenBoxGrills.png?v=1676559383",
          "bbq.grill_specs_mount_type": "Built-In",
          "bbq.rotisserie_kit": "Optional",
          "bbq.option_title": "Gas Type",
          "bbq.grill_specs_kamado_width": null,
          _info:
            "Blaze Premium LTE - 32-Inch 4-Burner Built-In Grill - Liquid Propane Gas with Rear Infrared Burner & Grill Lights - BLZ-4LTE2MG-LP (Home & Garden)",
          "bbq.seo_meta_series": "LTE/Marine Grade",
          "bbq.shopnew_related_product": null,
          "bbq.product_offer_url":
            "https://outdoorkitchenoutlet.com/collections/grills-open-box",
          "bbq.number_of_main_burners": 4,
          "bbq.storage_specs_number_of_doors": null,
          "bbq.seo_meta_brand": "Blaze",
          "bbq.option_related_product": [
            "blaze-marine-grade-32-inch-4-burner-built-in-propane-gas-grill-with-rear-infrared-burner-grill-lights-blz-4lte2mg-lp",
            "blaze-marine-grade-32-inch-4-burner-built-in-natural-gas-grill-with-rear-nfrared-burner-grill-lights-blz-4lte2mg-ng",
          ],
          "bbq.side_burder_specification_gas_type": null,
          "bbq.product_option_name": [
            "LBM Series",
            "LTE Series",
            "Marine Grade Series",
            "Professional Lux Series",
            "LTE + Series",
          ],
          "bbq.grill_specs_cutout_height": 8.5,
          "bbq.hinge_selection": null,
          "bbq.total_surface_btu": 56000,
          "bbq.grill_specs_size": 32,
          "bbq.select_sale_tag": "Huge Savings",
          "bbq.ref_specs_door_type": null,
          "bbq.cutout_dimensions": ["30.625 x 21.25 x 8.5"],
          "bbq.seo_meta_made_in_usa": "No",
          "bbq.grill_lights": "Internal/External",
          "bbq.shipping_info_heading_title": "Shipping Information",
          "bbq.seo_meta_cooking_grid_dimensions": "29.5 x 18",
          "bbq.ref_specs_cutout_depth": null,
          "bbq.storage_specs_heading_title": null,
          "bbq.grill_specs_cutout_width": 30.625,
          size_title: null,
          "bbq.specification_heading_title": "Specification",
        },
        created_at: "2025-06-12T02:41:56.499932+00:00",
        variants: [
          {
            compare_at_price: 3886.7,
            taxable: true,
            weight_unit: "lb",
            requires_shipping: true,
            price: 2999,
            sku_suggest: ["BLZ-4LTE2MG-LP"],
            qty: 10,
            costing: 1800,
            sku: "BLZ-4LTE2MG-LP",
            grams: 51709.53018,
          },
        ],
        title:
          "Blaze Premium LTE - 32-Inch 4-Burner Built-In Grill - Liquid Propane Gas with Rear Infrared Burner & Grill Lights - BLZ-4LTE2MG-LP",
        recommendations: {
          complementary_products: "",
          related_products_settings: "",
          search_boost: "blaze\nblaz\nbuilt in\ngrill\nbbq",
          related_products: 0,
        },
        features: {
          furniture_features: 0,
          color: 0,
          furniture_material: 0,
          flue_type: 0,
          top_surface_material: 0,
          cover_features: 0,
          material: 0,
          mounting_type: 0,
          stove_top_type: 0,
          extraction_type: 0,
          grease_filter_material: 0,
          water_filter_application: 0,
          power_source: 0,
        },
        updated_at: "2026-03-06T02:34:19.064192+00:00",
        collections: [
          {
            name: "Shop All Brands",
            id: 31,
            slug: "shop-all-brands",
          },
          {
            name: "Shop All Blaze Outdoor Products",
            id: 77,
            slug: "shop-all-blaze-outdoor-products",
          },
          {
            name: "Blaze Outdoor Products",
            id: 79,
            slug: "blaze-outdoor-products",
          },
          {
            name: "Shop All BBQ Grills and Smokers",
            id: 87,
            slug: "shop-all-bbq-grills-and-smokers",
          },
          {
            name: "Shop All Built In Grills",
            id: 88,
            slug: "shop-all-built-in-grills",
          },
          {
            name: "Gas Grills",
            id: 90,
            slug: "gas-grills",
          },
          {
            name: "Shop All Gas Grills",
            id: 92,
            slug: "shop-all-gas-grills",
          },
          {
            name: "Built In Gas Grills",
            id: 93,
            slug: "built-in-gas-grills",
          },
          {
            name: "Blaze Grills",
            id: 138,
            slug: "blaze-grills",
          },
          {
            name: "Top Deals",
            id: 192,
            slug: "top-deals",
          },
          {
            name: "Promotions",
            id: 193,
            slug: "promotions",
          },
          {
            name: "Best Sellers for BBQ Grills and Smokers",
            id: 194,
            slug: "best-sellers-for-bbq-grills-and-smokers",
          },
          {
            name: "Best Sellers for Built-In Gas Grills",
            id: 374,
            slug: "best-sellers-for-built-in-gas-grills",
          },
          {
            name: "Blaze Built-In Grills",
            id: 954,
            slug: "blaze-built-in-grills",
          },
        ],
        ratings: {
          rating_count: "'3",
        },
        product_id: 5723,
        options: {
          option3: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
          option1: {
            name: "Title",
            value: "Default Title",
            linked_to: 0,
          },
          option2: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
        },
        seo: {
          description:
            "Upgrade to the Blaze Premium LTE 32-Inch 4-Burner Propane Grill! Designed for coastal BBQs, it features 66,000 BTUs, marine-grade stainless steel, and a flame guard for safety. Perfect for multi-user settings with 740 sq. in. of cooking space. Call now for exclusive pricing and a lifetime warranty!",
          title:
            "Get S27TLP & S27NPED Grill Combo Today – Perfect for Your BBQ Setup!",
        },
        brand: "Blaze Outdoor Products",
        images: [
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2MG-LP.jpg?v=1743599672",
            alt: 0,
            position: 1,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2MG-NG.2_8656bb27-11a0-4e10-96d6-7d2488fb4b3d.jpg?v=1743599818",
            alt: 0,
            position: 2,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2MG-NG.3_e2dddea6-698a-4dc0-8e81-215c82689292.jpg?v=1743600005",
            alt: 0,
            position: 3,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2MG-NG.4_9d10df0d-e7fc-4af1-a240-7c4b560774fc.jpg?v=1743600008",
            alt: 0,
            position: 4,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2MG-NG.5_f77e9012-6cbd-4ae7-943d-0accbc81da98.jpg?v=1743600011",
            alt: 0,
            position: 5,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2MG-NG.6_6709042f-d867-4479-9b9f-38f063c1bc73.jpg?v=1743600014",
            alt: 0,
            position: 6,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2MG-NG.7_f458f9c6-2289-4c47-8d2d-c3d57121472e.jpg?v=1743600017",
            alt: 0,
            position: 7,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2MG-NG.8_8774a2dd-041b-4869-b3be-db3ca4ce819f.jpg?v=1743600019",
            alt: 0,
            position: 8,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2MG-NG.9_06b9a35e-e762-49ed-8ea3-1750f9aa9e7e.jpg?v=1743600022",
            alt: 0,
            position: 9,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2MG-NG.10_c19f9a9b-5244-48f6-967e-c12ab99d36f6.jpg?v=1743600024",
            alt: 0,
            position: 10,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2MG-NG.11_d274f7d5-efed-4e68-bd5f-77dc1ba33a6f.jpg?v=1743601030",
            alt: 0,
            position: 11,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2MG-NG_2b433364-699f-450e-8c5b-a8e70a6fe0d8.jpg?v=1743601039",
            alt: 0,
            position: 12,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/Screenshot2022-11-07132548_a1e68de8-76a5-4cec-8411-2282c22100ed.jpg?v=1743599821",
            alt: 0,
            position: 13,
          },
        ],
        custom_fields: [],
        handle:
          "blaze-marine-grade-32-inch-4-burner-built-in-propane-gas-grill-with-rear-infrared-burner-grill-lights-blz-4lte2mg-lp",
        published: true,
        frequently_bought_together: [],
        tags: [
          "27-33 Inches",
          "304 Stainless Steel",
          "4 Burners",
          "Analog",
          "Best Sellers for BBQ Grills and Smokers",
          "Best Sellers for Built-In Gas Grills",
          "Blaze Grills",
          "Blaze Outdoor Products",
          "BLZ4BICV",
          "Built In",
          "Built In Gas Grills",
          "Depth 0-26 Inches",
          "Free Accessories",
          "Gas Grills",
          "Height 0-26 Inches",
          "Internal and External Lights",
          "Liquid Propane Gas",
          "No",
          "Optional Rotisserie",
          "Price Drop",
          "Shop All BBQ Grills and Smoker",
          "Shop All BBQ Grills and Smokers",
          "Shop All Blaze Outdoor Products",
          "Shop All Gas Grills",
          "Top Deals",
          "Width 27-33 Inches",
          "With Rear Infrared Burner",
        ],
        product_type: "Home & Garden",
        uploaded_at: "2025-06-12T02:41:56.499918+00:00",
        product_category: [
          {
            category_name: "Home & Garden",
            id: 1,
          },
        ],
        region_pricing: {
          compare_price_us: null,
          included_us: null,
          price_us: null,
        },
        status: "active",
      },
      {
        custom_metafields: {
          custom_sale_tag: "0.0",
          size_headings:
            '{"size_1": "34 Inches ", "size_2": "44 Inches", "size_3": "", "size_4": "", "size_5": "", "size_6": 0.0, "heading_title": "Size"}',
          open_box: "",
          option_headings:
            '{"option1": "NG", "option2": "LP", "option3": "", "heading_title": "Gas Type"}',
        },
        body_html:
          "<p>Blaze takes pride in offering the Blaze Professional Grill, which stands out as a top contender in the industry due to its robust construction and long-lasting components. The grill's sturdy design ensures durability that is hard to dispute, while its cooking system delivers exceptional results.<br>With precise fuel and oxygen mixing, the Blaze Professional LUX gas grill achieves impressive searing temperatures while maintaining fuel efficiency compared to other leading grill brands. Adding to its appeal, the grill is equipped with an Illumination system that enhances its stylish appearance, making it a sight to behold for anyone who appreciates fine craftsmanship.<br><br>&nbsp;</p><p><strong>About Blaze</strong></p><p>Blaze understands the value of creating a top-notch outdoor living space that people of all ages can enjoy. For many, the ultimate summer pastime is gathering with loved ones for a delightful picnic while grilling up delicious food. That's why the company has dedicated extensive time and effort to developing a range of <a href=\"https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products\"><span style=\"color:#2b00ff;\">Blaze&nbsp;Outdoor Products</span></a>.<br><br>The team at Blaze works diligently to design grills that cater to each individual's unique cooking needs. Whether you're cooking for your immediate family or hosting a large crowd, Blaze has the perfect grill to suit your requirements. Regardless of your level of grilling expertise, Blaze offers a variety of grills that can accommodate your skill level, allowing you to showcase your culinary abilities and create memorable meals outdoors.<br>&nbsp;</p><p><br><strong>Blaze Professional LUX Grill Key Features:</strong></p><ul><li><strong>Impressive BTU Power: </strong>This blaze gas grill boasts a total of 82,000 BTUs of cooking power, including 4 main burners with 18,000 BTUs each and a 10,000 btu infrared rear rotisserie burner with an included rotisserie kit, ensuring high heat output for various cooking styles.</li><li><strong>Generous Cooking Area:</strong> With 1050 square inches of total cooking space, you can easily make big meals for parties and gatherings.<br>&nbsp;</li><li><strong>Commercial-Quality H-Burners:</strong> The main grill surface is powered by heavy-duty 4 commercial quality 304 cast stainless steel H-burners cooking grids body, known for their durability and consistent performance.<br>&nbsp;</li><li><strong>Rotisserie Capability:</strong> The included rotisserie kit features a waterproof motor, allowing you to roast meats with ease and precision.<br>&nbsp;</li><li><strong>Durable Hexagonal Cooking Rods:</strong> Heavy 12mm stainless steel hexagon cooking rods not only maximize durability but also provide excellent searing capabilities for your grilling needs.<br>&nbsp;</li><li><strong>Flame Stabilization Grids:</strong> Flame-stabilization grids minimize flare-ups while infusing your food with that classic sear marks grilled flavor.<br>&nbsp;</li><li><strong>Illuminated Knobs:</strong> Illuminated control knobs not only add a touch of sophistication but also provide practical visibility for evening gatherings and night-time grilling.<br>&nbsp;</li><li><strong>Efficient Ignition:</strong> The push-and-turn flame-thrower primary ignition system delivers a fast start every time.<br>&nbsp;</li><li><strong>Heat Zone Separators:</strong> Heat zone separators separate the cooking surface into different temperature zones, so you can cook different foods at the same time.<br>&nbsp;</li><li><strong>Warming Rack:</strong> A removable warming rack is included, keeping your cooked food warm while you continue grilling.<br>&nbsp;</li><li><strong>Secondary Ignition:</strong> Individual flash tube secondary ignition provides a backup ignition option for added reliability.<br>&nbsp;</li><li><strong>Double-lined Hood:</strong> The double-lined grill hood not only protects the outer layer from heat discoloration but also helps maintain more consistent heat levels for efficient cooking.<br>&nbsp;</li></ul><p><strong>Added Value:</strong></p><ol><li><strong>Lowest Cost Guaranteed:</strong> We ensure that our built-in grills are competitively priced, offering you the best value for your investment.</li><li><strong>Lifetime Warranty:</strong> Our grills come with a lifetime warranty, providing peace of mind and ensuring that your investment is protected for years to come.<br>&nbsp;</li><li><strong>Save up to 60%:</strong> With our built-in grills, you can enjoy significant savings compared to other high-end grill options on the market.<br>&nbsp;</li></ol>",
        accentuate_data: {
          "bbq.configuration_heading_title": "Configuration",
          "bbq.grill_specs_color": "Stainless Steel",
          "bbq.seo_meta_total_grill_area": 1050,
          "bbq.seo_meta_material": "304 Stainless Steel",
          "bbq.shopnew_heading_title": null,
          "bbq.side_burner_specification_type": null,
          "bbq.ref_specs_cutout_height": null,
          "bbq.side_burner_specs_configuration": null,
          "bbq.seo_meta_secondary_grilling_area": 253,
          "frequently.fbi_related_product": [
            "4-burner-pro-built-in-cover-4probicv",
            "blaze-professional-built-in-natural-gas-high-performance-power-burner-wok-ring-stainless-steel-lid-blz-propb-ng",
            "blaze-39-inch-access-door-triple-drawer-combo-blz-ddc-39-r",
            "blaze-40-inch-double-access-door-with-paper-towel-holder-blz-ad40-r",
          ],
          "bbq.grill_specs_cutout_depth": 23.625,
          "bbq.open_box_heading_title": null,
          "bbq.storage_specs_number_of_drawers": null,
          "bbq.storage_specs_cutout_height": null,
          "bbq.openbox_related_product": null,
          "bbq.grill_specs_type": "Gas Grill",
          "bbq.rear_infrared_burner_btu": 10000,
          "bbq.product_option_related_product": [
            "blz-4lbm-ng-blaze-4-burner-lbm-blaze-grill-32-blz-4lbm-ng",
            "blaze-32-inch-4-burner-built-in-natural-gas-gill-with-rear-infrared-burner-grill-lights-blz-4lte2-ng",
            "blaze-marine-grade-32-inch-4-burner-built-in-natural-gas-grill-with-rear-nfrared-burner-grill-lights-blz-4lte2mg-ng",
            "blaze-professional-44-inch-4-burner-built-in-natural-gas-grill-with-rear-infrared-burner-blz-4pro-ng",
            "blaze-premium-lte-32-inch-4-burner-natural-gas-grill-w-rear-infrared-burner-lift-assist-hood-blz-4lte3-ng",
          ],
          "bbq.side_burner_specs_number_of_burners": null,
          "bbq.product_weight": 261,
          "bbq.configuration_type": ["Built In", "Freestanding"],
          "bbq.seo_meta_manufacturer_part_number": "BLZ-4PRO-NG",
          "bbq.related_product": [
            "blaze-professional-34-inch-3-burner-built-in-natural-gas-grill-with-rear-infrared-burner-blz-3pro-ng",
            "blaze-professional-44-inch-4-burner-built-in-natural-gas-grill-with-rear-infrared-burner-blz-4pro-ng",
          ],
          "bbq.hinge_related_product": null,
          "bbq.shipping_dimensions": "40 x 48 x 25",
          "bbq.storage_specs_cutout_width": null,
          "bbq.hinge_heading_title": null,
          "bbq.seo_meta_fuel_type": "Natural Gas",
          "bbq.file_name": [
            "Blaze Cutout Specifications [Click to download]",
            "Blaze Professional Grill Use & Care Guide [Click to download]",
          ],
          "bbq.upload_file": [
            "https://cdn.accentuate.io/7825464197377/-1671630088252/Blaze-Cutout-Specifications-v1672696463170.pdf",
            "https://cdn.accentuate.io/7825464197377/-1671630088252/Blaze-Professional-Grill-Use--Care-Guide-v1672696554534.pdf",
          ],
          "bbq.grill_specs_side_shelves": "No",
          "bbq.grill_specs_controller": null,
          "bbq.side_burner_specification_gas_type": null,
          "bbq.ref_specs_heading_title": null,
          "bbq.storage_specs_orientation": null,
          "bbq.thermometer": "Analog",
          "bbq.grill_specs_class": "Luxury",
          "bbq.enable_call_availability_button": null,
          "bbq.overall_dimensions": ["44.18 x 28.37 x 24.12"],
          "frequently.fbi_heading": "Frequently Bought Together",
          "bbq.storage_specs_cutout_depth": null,
          "bbq.storage_specs_mounting_type": null,
          "bbq.seo_meta_main_grilling_area": 797,
          _id: "blaze-professional-44-inch-4-burner-built-in-natural-gas-grill-with-rear-infrared-burner-blz-4pro-ng",
          "bbq.grill_specs_on_wheels": "No",
          "bbq.product_offer_cta": null,
          "bbq.openbox_product_text": null,
          "bbq.ref_specs_outdoor_rated": null,
          "bbq.single_burner_btus": 18000,
          "bbq.shipping_weight": 275,
          "bbq.seo_meta_manufacturer": "Blaze",
          "bbq.manufacturer_download_heading_title": "Manufacturer's Manual",
          "bbq.grill_specs_no_of_racks": 2,
          "bbq.configuration_product": [
            "blaze-professional-44-inch-4-burner-built-in-natural-gas-grill-with-rear-infrared-burner-blz-4pro-ng",
            "blz-4pro-ng-blz-4pro-cart",
          ],
          "bbq.shopnew_product_text": null,
          "bbq.size_heading_title": "Product Size",
          "bbq.ref_specs_cutout_width": null,
          "bbq.brand_storage_specs_type": null,
          "bbq.option_type": ["NG", "LP"],
          "bbq.ref_specs_type": null,
          "bbq.rear_infrared_burner": "Yes",
          "bbq.product_option_heading_title": "Product Option",
          "bbq.product_offer_image_link":
            "https://cdn.shopify.com/s/files/1/0660/1900/0577/files/SmallOpenBoxGrills.png?v=1676559383",
          "bbq.grill_specs_mount_type": "Built-In",
          "bbq.rotisserie_kit": "Integrated",
          "bbq.option_title": "Gas Type",
          "bbq.grill_specs_kamado_width": null,
          _info:
            "Blaze Professional LUX - 44-Inch 4-Burner Built-In Grill - Natural Gas With Rear Infrared Burner - BLZ-4PRO-NG (Home & Garden)",
          "bbq.seo_meta_series": "Professional",
          "bbq.shopnew_related_product": null,
          "bbq.product_offer_url":
            "https://outdoorkitchenoutlet.com/collections/grills-open-box",
          "bbq.number_of_main_burners": 4,
          "bbq.storage_specs_number_of_doors": null,
          "bbq.seo_meta_brand": "Blaze",
          "bbq.option_related_product": [
            "blaze-professional-44-inch-4-burner-built-in-natural-gas-grill-with-rear-infrared-burner-blz-4pro-ng",
            "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
          ],
          "bbq.side_burder_specification_gas_type": null,
          "bbq.product_option_name": [
            "LBM Series",
            "LTE Series",
            "Marine Grade Series",
            "Professional Lux Series",
            "LTE + Series",
          ],
          "bbq.grill_specs_cutout_height": 10.5,
          "bbq.hinge_selection": null,
          "bbq.total_surface_btu": 72000,
          "bbq.grill_specs_size": 44,
          "bbq.select_sale_tag": "Huge Savings",
          "bbq.ref_specs_door_type": null,
          "bbq.cutout_dimensions": ["42.5 x 23.625 x 10.5"],
          "bbq.seo_meta_made_in_usa": "No",
          "bbq.grill_lights": "Internal/External",
          "bbq.shipping_info_heading_title": "Shipping Information",
          "bbq.seo_meta_cooking_grid_dimensions": "40 x 19.9375",
          "bbq.ref_specs_cutout_depth": null,
          "bbq.storage_specs_heading_title": null,
          "bbq.grill_specs_cutout_width": 42.5,
          size_title: ["34 Inches", "44 Inches"],
          "bbq.specification_heading_title": "Specification",
        },
        created_at: "2025-06-12T02:41:56.584272+00:00",
        variants: [
          {
            compare_at_price: "6867.5",
            price: 4769,
            sku_suggest: ["BLZ-4PRO-NG"],
            qty: 10,
            sku: "BLZ-4PRO-NG",
            grams: 117934.0162,
          },
        ],
        title:
          "Blaze Professional LUX - 44-Inch 4-Burner Built-In Grill - Natural Gas With Rear Infrared Burner - BLZ-4PRO-NG",
        recommendations: {
          complementary_products: "",
          related_products_settings: "",
          search_boost: "",
          related_products: 0,
        },
        features: {
          furniture_features: "0.0",
          color: "0.0",
          furniture_material: "0.0",
          flue_type: "0.0",
          top_surface_material: "0.0",
          cover_features: "0.0",
          material: "0.0",
          mounting_type: "0.0",
          stove_top_type: "0.0",
          extraction_type: "0.0",
          grease_filter_material: "0.0",
          water_filter_application: "0.0",
          power_source: "0.0",
        },
        updated_at: "2026-03-06T02:34:19.226164+00:00",
        collections: [
          {
            name: "Shop All Brands",
            id: 31,
            slug: "shop-all-brands",
          },
          {
            name: "Shop All Blaze Outdoor Products",
            id: 77,
            slug: "shop-all-blaze-outdoor-products",
          },
          {
            name: "Blaze Outdoor Products",
            id: 79,
            slug: "blaze-outdoor-products",
          },
          {
            name: "Shop All BBQ Grills and Smokers",
            id: 87,
            slug: "shop-all-bbq-grills-and-smokers",
          },
          {
            name: "Shop All Built In Grills",
            id: 88,
            slug: "shop-all-built-in-grills",
          },
          {
            name: "Gas Grills",
            id: 90,
            slug: "gas-grills",
          },
          {
            name: "Shop All Gas Grills",
            id: 92,
            slug: "shop-all-gas-grills",
          },
          {
            name: "Built In Gas Grills",
            id: 93,
            slug: "built-in-gas-grills",
          },
          {
            name: "BBQ Grills year end",
            id: 136,
            slug: "bbq-grills-year-end",
          },
          {
            name: "Best sellers for Blaze Grills",
            id: 137,
            slug: "best-sellers-for-blaze-grills",
          },
          {
            name: "Blaze Grills",
            id: 138,
            slug: "blaze-grills",
          },
          {
            name: "Year End Sale",
            id: 180,
            slug: "year-end-sale",
          },
          {
            name: "Top Deals",
            id: 192,
            slug: "top-deals",
          },
          {
            name: "Promotions",
            id: 193,
            slug: "promotions",
          },
          {
            name: "Blaze Built-In Grills",
            id: 954,
            slug: "blaze-built-in-grills",
          },
        ],
        ratings: {
          rating_count: "'2",
        },
        product_id: 5732,
        options: {
          option3: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
          option1: {
            name: "Title",
            value: "Default Title",
            linked_to: 0,
          },
          option2: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
        },
        seo: {
          description:
            "Blaze BLZ-4PRO provides a high performing luxury grill loaded with features to enhance your grilling experience.Call us now for best pricing!",
          title:
            "Blaze Professional Burner Freestanding Natural Gas Grill - BLZ-4PRO-NG",
        },
        brand: "Blaze Outdoor Products",
        images: [
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-LP_901e6c8a-31b2-4576-bc1c-f47d4339985d.jpg?v=1743604212",
            alt: 0,
            position: 1,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.2.jpg?v=1743604064",
            alt: 0,
            position: 2,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.3.jpg?v=1743604068",
            alt: 0,
            position: 3,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.4.jpg?v=1743604070",
            alt: 0,
            position: 4,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.5.jpg?v=1743604073",
            alt: 0,
            position: 5,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.6.jpg?v=1743604075",
            alt: 0,
            position: 6,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.7.jpg?v=1743604079",
            alt: 0,
            position: 7,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.8.jpg?v=1743604081",
            alt: 0,
            position: 8,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.9.jpg?v=1743604083",
            alt: 0,
            position: 9,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.10.jpg?v=1743604086",
            alt: 0,
            position: 10,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.11.jpg?v=1743604199",
            alt: 0,
            position: 11,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.jpg?v=1743604208",
            alt: 0,
            position: 12,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/Screenshot2022-11-07132548_9c16908a-2c08-4127-a747-076bccd80f0a.jpg?v=1743604210",
            alt: 0,
            position: 13,
          },
        ],
        custom_fields: [],
        handle:
          "blaze-professional-44-inch-4-burner-built-in-natural-gas-grill-with-rear-infrared-burner-blz-4pro-ng",
        published: true,
        frequently_bought_together: [],
        tags: [
          "304 Stainless Steel",
          "4 Burners",
          "43 Inches And Up",
          "Analog",
          "BBQ Grills-yrend",
          "Best sellers for Blaze Grills",
          "Blaze Grills",
          "Blaze Outdoor Products",
          "BLZ4PROBICV",
          "Built In",
          "Built In Gas Grills",
          "Depth 0-26 Inches",
          "Free Accessories",
          "Gas Grills",
          "Height 0-26 Inches",
          "Internal and External Lights",
          "Natural Gas",
          "No",
          "Price Drop",
          "Rotisserie Included",
          "Shop All BBQ Grills and Smoker",
          "Shop All BBQ Grills and Smokers",
          "Shop All Blaze",
          "Shop All Blaze Outdoor Products",
          "Shop All Gas Grills",
          "Top Deals",
          "Width 43 Inches and up",
          "With Rear Infrared Burner",
          "Year end Sale 2023",
        ],
        product_type: "Home & Garden",
        uploaded_at: "2025-06-12T02:41:56.584261+00:00",
        product_category: [
          {
            category_name: "Home & Garden",
            id: 1,
          },
        ],
        region_pricing: {
          compare_price_us: null,
          included_us: null,
          price_us: null,
        },
        status: "active",
      },
      {
        custom_metafields: {
          custom_sale_tag: "0.0",
          size_headings:
            '{"size_1": "34 Inches ", "size_2": "44 Inches", "size_3": "", "size_4": "", "size_5": "", "size_6": 0.0, "heading_title": "Size"}',
          open_box: "",
          option_headings:
            '{"option1": "LP", "option2": "NG", "option3": "", "heading_title": "Gas Type"}',
        },
        body_html:
          '<p data-mce-fragment="1"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Blaze presents the Blaze Professional Grill as a leading option in the industry, known for its durable build and reliable components. The grill\'s strong construction guarantees long-lasting performance, while its cooking system consistently produces excellent results. The Blaze Professional Grill 44 achieves high searing temperatures efficiently by precisely mixing fuel and oxygen. It also has an Illumination system that adds style, making it visually captivating for those who appreciate craftsmanship.</span></p>\n<h4><b data-mce-fragment="1">About Blaze<br></b></h4>\n<p><b data-mce-fragment="1"></b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Blaze understands the value of creating a top-notch outdoor living space that people of all ages can enjoy. For many, the ultimate summer pastime is gathering with loved ones for a delightful picnic while grilling up delicious food. That\'s why the company has dedicated extensive time and effort to developing a range of</span><a href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products" data-mce-fragment="1" data-mce-href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products"> </a><span style="color: #2b00ff;"><a style="color: #2b00ff;" href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products" title="Blaze Outdoor Products"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Blaze Outdoor Products.</span></a></span><br data-mce-fragment="1"></p>\n<p data-mce-fragment="1"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"><br>The team at Blaze works diligently to design grills that cater to each individual\'s unique cooking needs. Whether you\'re cooking for your immediate family or hosting a large crowd, Blaze has the perfect grill to suit your requirements. Regardless of your level of grilling expertise, Blaze offers a variety of grills that can accommodate your skill level, allowing you to showcase your culinary abilities and create memorable meals outdoors.</span></p>\n<h4><b data-mce-fragment="1">Blaze Professional Grill Key Features:</b></h4>\n<ul data-mce-fragment="1">\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Impressive BTU Power:  </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">With a total of 82,000 BTUs, including 4 main burners at 18,000 BTUs of cooking power per burner and a 10,000 BTU infrared rear rotisserie burner with an included rotisserie kit. </span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Spacious Cooking Area: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Offering 1050 square inches of total cooking space, this grill is ideal for accommodating large meals and gatherings.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Commercial-Quality H-Burners: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The main grill surface features 4 commercial-quality 304 cast stainless steel H-burners, ensuring durability and consistent heat distribution for even cooking.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Rotisserie Capability: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The rotisserie kit includes a waterproof motor, making it easy to roast meats perfectly.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Durable Hexagonal Cooking Rods:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> Heavy 12mm stainless steel hexagon cooking rods to maximize durability and enhance searing capabilities.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Flame Stabilizing Grids:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> These grids are built to minimize flare-ups while infusing your grilled food with that irresistible smoky flavor.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Illuminated Knobs:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> Illuminated control knobs not only create a sophisticated appearance but also provide practical visibility for evening gatherings and nighttime grilling sessions.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Efficient Ignition: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The push-and-turn flame-thrower primary ignition system delivers a fast start every time you ignite the grill.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Heat Zone Separators: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Heat zone separators split the cooking surface into different temperature zones, so you can cook different foods at the same time.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Warming Rack: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">A removable warming rack is included to keep your cooked dishes warm while you continue grilling.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Easy Cleanup: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The full-width drip tray simplifies post-grilling cleanup, ensuring a quick and hassle-free maintenance process.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Secondary Ignition: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Individual flash tube secondary ignition provides a backup ignition option for added reliability.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Interior Lights: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Built-in interior lighting systems are covered to assist you in navigating the grilling surface at night, ensuring precise cooking even in low-light conditions.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Double-lined Hood:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> The double-lined grill hood not only protects the outer layer from heat discoloration but also helps maintain a consistent cooking temperature by retaining heat efficiently.</span>\n</li>\n</ul>\n<h4 data-mce-fragment="1"><b data-mce-fragment="1">Added Value: </b></h4>\n<ol data-mce-fragment="1">\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Lowest Cost Guaranteed:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> We ensure that our built-in grills are competitively priced, offering you the best value for your investment.</span><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"><br data-mce-fragment="1"></span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Lifetime Warranty:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> Our grills come with a lifetime warranty, providing peace of mind and ensuring that your investment is protected for years to come.</span><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"><br data-mce-fragment="1"></span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Save up to 60%:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> With our built-in grills, you can enjoy significant savings compared to other high-end grill options on the market.</span><br>\n</li>\n</ol>',
        accentuate_data: {
          "bbq.configuration_heading_title": "Configuration",
          "bbq.grill_specs_color": "Stainless Steel",
          "bbq.seo_meta_total_grill_area": 1050,
          "bbq.seo_meta_material": "304 Stainless Steel",
          "bbq.shopnew_heading_title": null,
          "bbq.side_burner_specification_type": null,
          "bbq.ref_specs_cutout_height": null,
          "bbq.side_burner_specs_configuration": null,
          "bbq.seo_meta_secondary_grilling_area": 253,
          "frequently.fbi_related_product": [
            "blaze-39-inch-access-door-triple-drawer-combo-blz-ddc-39-r",
            "blaze-wind-guard-for-40-inch-5-burner-gas-grills-blz-wg-40",
            "blaze-lte-30-inch-natural-gas-griddle-with-lights-blz-griddle-lte-lp-blz-griddle-cart",
            "4-burner-pro-built-in-cover-4probicv",
          ],
          "bbq.grill_specs_cutout_depth": 23.625,
          "bbq.open_box_heading_title": null,
          "bbq.storage_specs_number_of_drawers": null,
          "bbq.storage_specs_cutout_height": null,
          "bbq.openbox_related_product": null,
          "bbq.grill_specs_type": "Gas Grill",
          "bbq.rear_infrared_burner_btu": 10000,
          "bbq.product_option_related_product": [
            "blaze-4-burner-lbm-blaze-grill-blz-4lbm-lp",
            "blaze-four-burner-built-in-propane-gas-grill-rear-infrared-burner-grill-lights",
            "blaze-marine-grade-32-inch-4-burner-built-in-propane-gas-grill-with-rear-infrared-burner-grill-lights-blz-4lte2mg-lp",
            "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
            "blaze-premium-lte-32-inch-4-burner-propane-gas-grill-w-rear-infrared-burner-lift-assist-hood-blz-4lte3-lp",
          ],
          "bbq.side_burner_specs_number_of_burners": null,
          "bbq.product_weight": 260,
          "bbq.configuration_type": ["Built In", "Freestanding"],
          "bbq.seo_meta_manufacturer_part_number": "BLZ-4PRO-LP",
          "bbq.related_product": [
            "blaze-professional-34-inch-3-burner-built-in-propane-gas-grill-with-rear-infrared-burner-blz-3pro-lp",
            "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
          ],
          "bbq.hinge_related_product": null,
          "bbq.shipping_dimensions": "40 x 48 x 25",
          "bbq.storage_specs_cutout_width": null,
          "bbq.hinge_heading_title": null,
          "bbq.seo_meta_fuel_type": "Liquid Propane",
          "bbq.file_name": [
            "Blaze Cutout Specifications [Click to download]",
            "Blaze Professional Grill Use & Care Guide [Click to download]",
          ],
          "bbq.upload_file": [
            "https://cdn.accentuate.io/7825463738625/-1671630088252/Blaze-Cutout-Specifications-v1672696677474.pdf",
            "https://cdn.accentuate.io/7825463738625/-1671630088252/Blaze-Professional-Grill-Use--Care-Guide-v1672696726355.pdf",
          ],
          "bbq.grill_specs_side_shelves": "No",
          "bbq.grill_specs_controller": null,
          "bbq.side_burner_specification_gas_type": null,
          "bbq.ref_specs_heading_title": null,
          "bbq.storage_specs_orientation": null,
          "bbq.thermometer": "Analog",
          "bbq.grill_specs_class": "Luxury",
          "bbq.enable_call_availability_button": null,
          "bbq.overall_dimensions": ["44.18 x 28.37 x 24.12"],
          "frequently.fbi_heading": "Frequently Bought Together",
          "bbq.storage_specs_cutout_depth": null,
          "bbq.storage_specs_mounting_type": null,
          "bbq.seo_meta_main_grilling_area": 797,
          _id: "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
          "bbq.grill_specs_on_wheels": "No",
          "bbq.product_offer_cta": null,
          "bbq.openbox_product_text": null,
          "bbq.ref_specs_outdoor_rated": null,
          "bbq.single_burner_btus": 18000,
          "bbq.shipping_weight": 275,
          "bbq.seo_meta_manufacturer": "Blaze",
          "bbq.manufacturer_download_heading_title": "Manufacturer's Manual",
          "bbq.grill_specs_no_of_racks": 2,
          "bbq.configuration_product": [
            "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
            "blz-4pro-lp-blz-4pro-cart",
          ],
          "bbq.shopnew_product_text": null,
          "bbq.size_heading_title": "Product Size",
          "bbq.ref_specs_cutout_width": null,
          "bbq.brand_storage_specs_type": null,
          "bbq.option_type": ["LP", "NG"],
          "bbq.ref_specs_type": null,
          "bbq.rear_infrared_burner": "Yes",
          "bbq.product_option_heading_title": "Product Option",
          "bbq.product_offer_image_link":
            "https://cdn.shopify.com/s/files/1/0660/1900/0577/files/SmallOpenBoxGrills.png?v=1676559383",
          "bbq.grill_specs_mount_type": "Built-In",
          "bbq.rotisserie_kit": "Integrated",
          "bbq.option_title": "Gas Type",
          "bbq.grill_specs_kamado_width": null,
          _info:
            "Blaze Professional LUX - 44-Inch 4-Burner Built-In Grill - Liquid Propane Gas With Rear Infrared Burner - BLZ-4PRO-LP (Home & Garden)",
          "bbq.seo_meta_series": "Professional",
          "bbq.shopnew_related_product": null,
          "bbq.product_offer_url":
            "https://outdoorkitchenoutlet.com/collections/grills-open-box",
          "bbq.number_of_main_burners": 4,
          "bbq.storage_specs_number_of_doors": null,
          "bbq.seo_meta_brand": "Blaze",
          "bbq.option_related_product": [
            "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
            "blaze-professional-44-inch-4-burner-built-in-natural-gas-grill-with-rear-infrared-burner-blz-4pro-ng",
          ],
          "bbq.side_burder_specification_gas_type": null,
          "bbq.product_option_name": [
            "LBM Series",
            "LTE Series",
            "Marine Grade Series",
            "Professional Lux Series",
            "LTE + Series",
          ],
          "bbq.grill_specs_cutout_height": 10.5,
          "bbq.hinge_selection": null,
          "bbq.total_surface_btu": 72000,
          "bbq.grill_specs_size": 44,
          "bbq.select_sale_tag": "Huge Savings",
          "bbq.ref_specs_door_type": null,
          "bbq.cutout_dimensions": ["42.5 x 23.625 x 10.5"],
          "bbq.seo_meta_made_in_usa": "No",
          "bbq.grill_lights": "Internal/External",
          "bbq.shipping_info_heading_title": "Shipping Information",
          "bbq.seo_meta_cooking_grid_dimensions": "40 x 19.9375",
          "bbq.ref_specs_cutout_depth": null,
          "bbq.storage_specs_heading_title": null,
          "bbq.grill_specs_cutout_width": 42.5,
          size_title: ["34 Inches", "44 Inches"],
          "bbq.specification_heading_title": "Specification",
        },
        created_at: "2025-06-12T02:41:56.593133+00:00",
        variants: [
          {
            compare_at_price: 6867.5,
            taxable: false,
            weight_unit: "lb",
            requires_shipping: true,
            price: 4769,
            sku_suggest: ["BLZ-4PRO-LP"],
            qty: 10,
            costing: 3179.4,
            sku: "BLZ-4PRO-LP",
            grams: 117934.0162,
          },
        ],
        title:
          "Blaze Professional LUX - 44-Inch 4-Burner Built-In Grill - Liquid Propane Gas With Rear Infrared Burner - BLZ-4PRO-LP",
        recommendations: {
          complementary_products: "",
          related_products_settings: "",
          search_boost: "",
          related_products: 0,
        },
        features: {
          furniture_features: 0,
          color: 0,
          furniture_material: 0,
          flue_type: 0,
          top_surface_material: 0,
          cover_features: 0,
          material: 0,
          mounting_type: 0,
          stove_top_type: 0,
          extraction_type: 0,
          grease_filter_material: 0,
          water_filter_application: 0,
          power_source: 0,
        },
        updated_at: "2026-03-06T02:34:19.214439+00:00",
        collections: [
          {
            name: "Shop All Brands",
            id: 31,
            slug: "shop-all-brands",
          },
          {
            name: "Shop All Blaze Outdoor Products",
            id: 77,
            slug: "shop-all-blaze-outdoor-products",
          },
          {
            name: "Blaze Outdoor Products",
            id: 79,
            slug: "blaze-outdoor-products",
          },
          {
            name: "Shop All BBQ Grills and Smokers",
            id: 87,
            slug: "shop-all-bbq-grills-and-smokers",
          },
          {
            name: "Shop All Built In Grills",
            id: 88,
            slug: "shop-all-built-in-grills",
          },
          {
            name: "Gas Grills",
            id: 90,
            slug: "gas-grills",
          },
          {
            name: "Shop All Gas Grills",
            id: 92,
            slug: "shop-all-gas-grills",
          },
          {
            name: "Built In Gas Grills",
            id: 93,
            slug: "built-in-gas-grills",
          },
          {
            name: "BBQ Grills year end",
            id: 136,
            slug: "bbq-grills-year-end",
          },
          {
            name: "Blaze Grills",
            id: 138,
            slug: "blaze-grills",
          },
          {
            name: "Year End Sale",
            id: 180,
            slug: "year-end-sale",
          },
          {
            name: "Top Deals",
            id: 192,
            slug: "top-deals",
          },
          {
            name: "Promotions",
            id: 193,
            slug: "promotions",
          },
          {
            name: "Blaze Built-In Grills",
            id: 954,
            slug: "blaze-built-in-grills",
          },
        ],
        ratings: {
          rating_count: "'2",
        },
        product_id: 5733,
        options: {
          option3: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
          option1: {
            name: "Title",
            value: "Default Title",
            linked_to: 0,
          },
          option2: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
        },
        seo: {
          description:
            "The heavy duty 304 stainless steel construction throughout the grill body ensures a long-lasting and durable appliance.Call us now!",
          title: "Blaze Professional Built-In Propane Gas Grill - BLZ-4PRO-LP",
        },
        brand: "Blaze Outdoor Products",
        images: [
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-LP.jpg?v=1743603499",
            alt: 0,
            position: 1,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.2_f64f62b5-e6cb-4132-bf00-f7df6f7366d4.jpg?v=1743604055",
            alt: 0,
            position: 2,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.3_d926c646-dfe2-48f9-8fbb-0022d9d1686c.jpg?v=1743604053",
            alt: 0,
            position: 3,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.4_286fecd8-d147-4ac7-bef5-161b884bc277.jpg?v=1743604050",
            alt: 0,
            position: 4,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.5_f22dd1ad-17d6-44e9-8564-c405ad69e329.jpg?v=1743603785",
            alt: 0,
            position: 5,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.6_b9cbca67-e785-4ff3-88c8-3641e1bae094.jpg?v=1743603781",
            alt: 0,
            position: 6,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.7_e42a812f-8eb3-4053-89bf-686c66ec4d79.jpg?v=1743603766",
            alt: 0,
            position: 7,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.8_b2723afb-a74e-4bc9-8357-af090307e681.jpg?v=1743603763",
            alt: 0,
            position: 8,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.9_c62d617f-497c-471b-96a3-c776228da078.jpg?v=1743603760",
            alt: 0,
            position: 9,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.10_895a2f6c-77ec-45e7-9242-a435abeec5a2.jpg?v=1743603757",
            alt: 0,
            position: 10,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG.11_552d5ed0-5e8e-4808-adb4-95a874da6a9d.jpg?v=1743603754",
            alt: 0,
            position: 11,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4PRO-NG_eee30470-74be-451c-9537-bc8e483a57dc.jpg?v=1743603751",
            alt: 0,
            position: 12,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/Screenshot2022-11-07132548_43fa1612-1149-4837-aadd-d764b9e2dc6b.jpg?v=1743603502",
            alt: 0,
            position: 13,
          },
        ],
        custom_fields: [],
        handle:
          "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
        published: true,
        frequently_bought_together: [],
        tags: [
          "304 Stainless Steel",
          "4 Burners",
          "43 Inches And Up",
          "Analog",
          "BBQ Grills-yrend",
          "Blaze Grills",
          "Blaze Outdoor Products",
          "BLZ4PROBICV",
          "Built In",
          "Built In Gas Grills",
          "Depth 0-26 Inches",
          "Free Accessories",
          "Gas Grills",
          "Height 0-26 Inches",
          "Internal and External Lights",
          "Liquid Propane Gas",
          "No",
          "Price Drop",
          "Rotisserie Included",
          "Shop All BBQ Grills and Smoker",
          "Shop All BBQ Grills and Smokers",
          "Shop All Blaze",
          "Shop All Blaze Outdoor Products",
          "Shop All Gas Grills",
          "Top Deals",
          "Width 43 Inches and up",
          "With Rear Infrared Burner",
          "Year end Sale 2023",
        ],
        product_type: "Home & Garden",
        uploaded_at: "2025-06-12T02:41:56.593118+00:00",
        product_category: [
          {
            category_name: "Home & Garden",
            id: 1,
          },
        ],
        region_pricing: {
          compare_price_us: null,
          included_us: null,
          price_us: null,
        },
        status: "active",
      },
      {
        custom_metafields: {
          custom_sale_tag: "0.0",
          size_headings:
            '{"size_1": "25 Inches", "size_2": "32 Inches", "size_3": "", "size_4": "", "size_5": "", "size_6": 0.0, "heading_title": "Size"}',
          open_box: "",
          option_headings:
            '{"option1": "LP", "option2": "NG", "option3": "", "heading_title": "Gas Type"}',
        },
        body_html:
          '<p data-mce-fragment="1"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Introducing the versatile Prelude LBM Grill, perfect for grillers of all expertise levels. This grill features durable searing rods that enhance your grilling experience by providing a reliable surface for searing steaks while keeping vegetables securely in place. With stainless steel heat zone separators, you can easily create different cooking zones on the grill surface, catering to various cooking styles and preferences. Built to last a lifetime, this heavy-duty grill is approved for Multi-User Settings, guaranteeing durability no matter where you choose to grill.</span><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"><br data-mce-fragment="1"></span><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"></span><b data-mce-fragment="1"></b></p>\n<h4 data-mce-fragment="1"><b data-mce-fragment="1">About Blaze</b></h4>\n<p data-mce-fragment="1"><b data-mce-fragment="1"></b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Blaze understands the value of creating a top-notch outdoor living space that people of all ages can enjoy. For many, the ultimate summer pastime is gathering with loved ones for a delightful picnic while grilling up delicious food. That\'s why the company has dedicated extensive time and effort to developing a range of </span><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"><span style="color: #2b00ff;"><a href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products" title="Blaze Outdoor Products" style="color: #2b00ff;">Blaze Outdoor Products</a></span><a href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products" data-mce-fragment="1" data-mce-href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products">.</a></span></p>\n<p data-mce-fragment="1"><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The team at Blaze works diligently to design grills that cater to each individual\'s unique cooking needs. Whether you\'re cooking for your immediate family or hosting a large crowd, Blaze has the perfect grill to suit your requirements. Regardless of your level of grilling expertise, Blaze offers a variety of grills that can accommodate your skill level, allowing you to showcase your culinary abilities and create memorable meals outdoors.</span></p>\n<h4 data-mce-fragment="1"><b data-mce-fragment="1">Blaze Prelude LBM 32-Inch Grill Key Features:</b></h4>\n<ul data-mce-fragment="1">\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">High-Powered Burners: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Each stainless steel tube burner delivers an impressive 14,000 BTUs of cooking power, resulting in a total cooking surface of 56,000 BTUs, ensuring a quick and efficient grilling surface.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Customizable Heat Zones: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The removable stainless steel heat zone separators enable you to create distinct cooking areas, allowing you to maintain different temperature zones simultaneously for precise cooking control.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Robust Cooking Rods: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The heavy-duty 8mm stainless steel durable searing rods enhance your grilling experience by providing excellent searing capabilities.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Effortless Ignition: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The Prelude LBM grill ignition system, featuring a push-and-turn flame-thrower primary ignition and Backup Flash Tube, simplifies the ignition process. Just push in the control knobs to ignite each burner individually, enhancing safety and convenience.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Flare-Up Reduction: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The perforated flame stabilizing grids minimize flare-ups during grilling while also serving as reliable protection for the burners below, enhancing safety and preserving the grill\'s longevity.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Long-Lasting Materials: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The</span> <span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">Blaze Prelude LBM gas grill is crafted from 304 stainless steel components. This grill is built to withstand the test of time, ensuring it remains a part of your outdoor cooking adventures for a lifetime.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Alternate Ignition: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The inclusion of flash tube ignition and crossovers provides an alternate ignition option, ensuring you\'re never left without a way to light your grill.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Efficient Cleanup: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The full-width drip tray simplifies the post-grilling cleanup process, allowing you to spend more time enjoying your delicious creations and less time on maintenance.</span>\n</li>\n</ul>\n<h4 data-mce-fragment="1"><b data-mce-fragment="1">Added Value: </b></h4>\n<ol data-mce-fragment="1">\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Lowest Cost Guaranteed: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">We ensure that our built-in grills are competitively priced, offering you the best value for your investment.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Lifetime Warranty:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> Our grills come with a lifetime warranty, providing peace of mind and ensuring that your investment is protected for years to come.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Save up to 60%:</b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;"> With our built-in grills, you can enjoy significant savings compared to other high-end grill options on the market.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Commercial Quality Burners: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The grill boasts 4 commercial quality 304 stainless steel tube cooking power per burner for professional-grade performance.</span>\n</li>\n<li style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Double-Lined Grill Hood: </b><span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">The double-lined stainless steel grill hood enhances heat retention and distribution, ensuring even cooking and flavor preservation.</span>\n</li>\n</ol>',
        accentuate_data: {
          "bbq.configuration_heading_title": "Configuration",
          "bbq.grill_specs_color": "Stainless Steel",
          "bbq.seo_meta_total_grill_area": 715,
          "bbq.seo_meta_material": "304 Stainless Steel",
          "bbq.shopnew_heading_title": null,
          "bbq.side_burner_specification_type": null,
          "bbq.ref_specs_cutout_height": null,
          "bbq.side_burner_specs_configuration": null,
          "bbq.seo_meta_secondary_grilling_area": 184,
          "frequently.fbi_related_product": [
            "blaze-grill-cover-blaz-4-burner-charcoal-built-in-grills-4bicv",
            "blaze-32-inch-double-access-door-with-paper-towel-holder-blz-ad32-r",
            "blaze-insulated-jacket-32-inch-4-burner-gas-grills-blz-4-ij",
            "blaze-drop-in-propane-gas-single-side-burner-blz-sb1-lp",
          ],
          "bbq.grill_specs_cutout_depth": 19.375,
          "bbq.open_box_heading_title": "Save More",
          "bbq.storage_specs_number_of_drawers": null,
          "bbq.storage_specs_cutout_height": null,
          "bbq.openbox_related_product": [
            "blaze-outdoor-products-prelude-lbm-32-inch-4-burner-built-in-propane-gas-grill-open-box-blz-4lbm-lp-ob",
          ],
          "bbq.grill_specs_type": "Gas Grill",
          "bbq.rear_infrared_burner_btu": null,
          "bbq.product_option_related_product": [
            "blaze-4-burner-lbm-blaze-grill-blz-4lbm-lp",
            "blaze-four-burner-built-in-propane-gas-grill-rear-infrared-burner-grill-lights",
            "blaze-marine-grade-32-inch-4-burner-built-in-propane-gas-grill-with-rear-infrared-burner-grill-lights-blz-4lte2mg-lp",
            "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
            "blaze-premium-lte-32-inch-4-burner-propane-gas-grill-w-rear-infrared-burner-lift-assist-hood-blz-4lte3-lp",
          ],
          "bbq.side_burner_specs_number_of_burners": null,
          "bbq.product_weight": 114,
          "bbq.configuration_type": ["Built In", "Freestanding"],
          "bbq.seo_meta_manufacturer_part_number": "BLZ-4LBM-LP",
          "bbq.related_product": [
            "blaze-3-burner-lbm-blaze-grill-blz-3lbm-lp",
            "blaze-4-burner-lbm-blaze-grill-blz-4lbm-lp",
          ],
          "bbq.hinge_related_product": null,
          "bbq.shipping_dimensions": "40 x 48 x 22",
          "bbq.storage_specs_cutout_width": null,
          "bbq.hinge_heading_title": null,
          "bbq.seo_meta_fuel_type": "Liquid Propane",
          "bbq.file_name": [
            "BLZ-4LBM-NG Use & Care Guide [Click to download]",
            "Blaze Cutout Specifications [Click to download]",
          ],
          "bbq.upload_file": [
            "https://cdn.accentuate.io/7827012747521/-1671630088252/BLZ-4LBM-NG-Use--Care-Guide-v1672694238032.pdf",
            "https://cdn.accentuate.io/7827012747521/-1671630088252/Blaze-Cutout-Specifications-v1672694266305.pdf",
          ],
          "bbq.grill_specs_side_shelves": "No",
          "bbq.grill_specs_controller": null,
          "bbq.side_burner_specification_gas_type": null,
          "bbq.ref_specs_heading_title": null,
          "bbq.storage_specs_orientation": null,
          "bbq.thermometer": "Analog",
          "bbq.grill_specs_class": "Practical",
          "bbq.enable_call_availability_button": null,
          "bbq.overall_dimensions": ["32.5 x 25.75 x 21.25"],
          "frequently.fbi_heading": "Frequently Bought Together",
          "bbq.storage_specs_cutout_depth": null,
          "bbq.storage_specs_mounting_type": null,
          "bbq.seo_meta_main_grilling_area": 531,
          _id: "blaze-4-burner-lbm-blaze-grill-blz-4lbm-lp",
          "bbq.grill_specs_on_wheels": "No",
          "bbq.product_offer_cta": null,
          "bbq.openbox_product_text": ["Blaze 32'' 4 Burner Grill Open Box"],
          "bbq.ref_specs_outdoor_rated": null,
          "bbq.single_burner_btus": 14000,
          "bbq.shipping_weight": 129,
          "bbq.seo_meta_manufacturer": "Blaze",
          "bbq.manufacturer_download_heading_title": "Manufacturer's Manual",
          "bbq.grill_specs_no_of_racks": 2,
          "bbq.configuration_product": [
            "blaze-4-burner-lbm-blaze-grill-blz-4lbm-lp",
            "blz-4lbm-lp-blz-4-cart",
          ],
          "bbq.shopnew_product_text": null,
          "bbq.size_heading_title": "Product Size",
          "bbq.ref_specs_cutout_width": null,
          "bbq.brand_storage_specs_type": null,
          "bbq.option_type": ["LP", "NG"],
          "bbq.ref_specs_type": null,
          "bbq.rear_infrared_burner": "No",
          "bbq.product_option_heading_title": "Product Option",
          "bbq.product_offer_image_link":
            "https://cdn.shopify.com/s/files/1/0660/1900/0577/files/SmallOpenBoxGrills.png?v=1676559383",
          "bbq.grill_specs_mount_type": "Built-In",
          "bbq.rotisserie_kit": "Optional",
          "bbq.option_title": "Gas Type",
          "bbq.grill_specs_kamado_width": null,
          _info:
            "Blaze Prelude LBM - 32-Inch 4-Burner Built-In Grill - Liquid Propane Gas - BLZ-4LBM-LP (Home & Garden)",
          "bbq.seo_meta_series": "LBM",
          "bbq.shopnew_related_product": null,
          "bbq.product_offer_url":
            "https://outdoorkitchenoutlet.com/collections/grills-open-box",
          "bbq.number_of_main_burners": 4,
          "bbq.storage_specs_number_of_doors": null,
          "bbq.seo_meta_brand": "Blaze",
          "bbq.option_related_product": [
            "blaze-4-burner-lbm-blaze-grill-blz-4lbm-lp",
            "blz-4lbm-ng-blaze-4-burner-lbm-blaze-grill-32-blz-4lbm-ng",
          ],
          "bbq.side_burder_specification_gas_type": null,
          "bbq.product_option_name": [
            "LBM Series",
            "LTE Series",
            "Marine Grade Series",
            "Professional Lux Series",
            "LTE + Series)",
          ],
          "bbq.grill_specs_cutout_height": 8.5,
          "bbq.hinge_selection": null,
          "bbq.total_surface_btu": 56000,
          "bbq.grill_specs_size": 32,
          "bbq.select_sale_tag": null,
          "bbq.ref_specs_door_type": null,
          "bbq.cutout_dimensions": ["30.625 x 21.25 x 8.5"],
          "bbq.seo_meta_made_in_usa": "No",
          "bbq.grill_lights": null,
          "bbq.shipping_info_heading_title": "Shipping Information",
          "bbq.seo_meta_cooking_grid_dimensions": "29.5 x 18",
          "bbq.ref_specs_cutout_depth": null,
          "bbq.storage_specs_heading_title": null,
          "bbq.grill_specs_cutout_width": 30.625,
          size_title: ["25 Inches", "32 Inches"],
          "bbq.specification_heading_title": "Specification",
        },
        created_at: "2025-06-12T02:41:56.000366+00:00",
        variants: [
          {
            compare_at_price: 2201.9,
            taxable: true,
            weight_unit: "lb",
            requires_shipping: true,
            price: 1661,
            sku_suggest: ["BLZ-4LBM-LP"],
            qty: 10,
            costing: 1049.4,
            sku: "BLZ-4LBM-LP",
            grams: 51709.53018,
          },
        ],
        title:
          "Blaze Prelude LBM - 32-Inch 4-Burner Built-In Grill - Liquid Propane Gas - BLZ-4LBM-LP",
        recommendations: {
          complementary_products: "",
          related_products_settings: "",
          search_boost: "",
          related_products: 0,
        },
        features: {
          furniture_features: 0,
          color: 0,
          furniture_material: 0,
          flue_type: 0,
          top_surface_material: 0,
          cover_features: 0,
          material: 0,
          mounting_type: 0,
          stove_top_type: 0,
          extraction_type: 0,
          grease_filter_material: 0,
          water_filter_application: 0,
          power_source: 0,
        },
        updated_at: "2026-03-06T02:34:19.002635+00:00",
        collections: [
          {
            name: "Shop All Brands",
            id: 31,
            slug: "shop-all-brands",
          },
          {
            name: "Shop All Blaze Outdoor Products",
            id: 77,
            slug: "shop-all-blaze-outdoor-products",
          },
          {
            name: "Blaze Outdoor Products",
            id: 79,
            slug: "blaze-outdoor-products",
          },
          {
            name: "Shop All BBQ Grills and Smokers",
            id: 87,
            slug: "shop-all-bbq-grills-and-smokers",
          },
          {
            name: "Shop All Built In Grills",
            id: 88,
            slug: "shop-all-built-in-grills",
          },
          {
            name: "Gas Grills",
            id: 90,
            slug: "gas-grills",
          },
          {
            name: "Shop All Gas Grills",
            id: 92,
            slug: "shop-all-gas-grills",
          },
          {
            name: "Built In Gas Grills",
            id: 93,
            slug: "built-in-gas-grills",
          },
          {
            name: "BBQ Grills year end",
            id: 136,
            slug: "bbq-grills-year-end",
          },
          {
            name: "Blaze Grills",
            id: 138,
            slug: "blaze-grills",
          },
          {
            name: "Year End Sale",
            id: 180,
            slug: "year-end-sale",
          },
          {
            name: "Blaze Built-In Grills",
            id: 954,
            slug: "blaze-built-in-grills",
          },
        ],
        ratings: {
          rating_count: "'2",
        },
        product_id: 5658,
        options: {
          option3: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
          option1: {
            name: "Title",
            value: "Default Title",
            linked_to: 0,
          },
          option2: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
        },
        seo: {
          description:
            "This product features an integrated zone dividers create independent cooking zones for direct/indirect grilling.Call us now for best pricing!",
          title:
            'Order Blaze Prelude LBM 32" 4-Burner Built-In Grill – Get Yours Now!',
        },
        brand: "Blaze Outdoor Products",
        images: [
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LBM-LP.jpg?v=1743600989",
            alt: 0,
            position: 1,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LBM-NG.1_ad854afb-8245-4f2f-86a7-5c3188c507a5.jpg?v=1743600992",
            alt: 0,
            position: 2,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LBM-NG.2_6b5c2f49-db65-42b4-a901-4f17390c751d.jpg?v=1743600995",
            alt: 0,
            position: 3,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LBM-NG.3_1cf1e38d-bf1d-4445-9d53-ce648bbcab11.jpg?v=1743600998",
            alt: 0,
            position: 4,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LBM-NG.4_213737bf-1020-4f8b-8ba2-668b040973d4.jpg?v=1743601000",
            alt: 0,
            position: 5,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/Screenshot2022-11-07132548_dde9621b-53e2-4729-b333-ca69dc14e5f0.jpg?v=1743601009",
            alt: 0,
            position: 6,
          },
        ],
        custom_fields: [],
        handle: "blaze-4-burner-lbm-blaze-grill-blz-4lbm-lp",
        published: true,
        frequently_bought_together: [],
        tags: [
          "27-33 Inches",
          "304 Stainless Steel",
          "4 Burners",
          "Analog",
          "BBQ Grills-yrend",
          "Blaze Grills",
          "Blaze Outdoor Products",
          "BLZ4BICV",
          "Built In",
          "Built In Gas Grills",
          "Depth 0-26 Inches",
          "Gas Grills",
          "Height 0-26 Inches",
          "Liquid Propane Gas",
          "No",
          "No Lights",
          "No Rear Infrared Burner",
          "No Rotisserie",
          "Shop All BBQ Grills and Smoker",
          "Shop All BBQ Grills and Smokers",
          "Shop All Blaze",
          "Shop All Blaze Outdoor Products",
          "Shop All Gas Grills",
          "Width 27-33 Inches",
          "Year end Sale 2023",
        ],
        product_type: "Home & Garden",
        uploaded_at: "2025-06-12T02:41:56.000348+00:00",
        product_category: [
          {
            category_name: "Home & Garden",
            id: 1,
          },
        ],
        region_pricing: {
          compare_price_us: null,
          included_us: null,
          price_us: null,
        },
        status: "active",
      },
      {
        custom_metafields: {
          custom_sale_tag: "0.0",
          size_headings:
            '{"size_1": "32 Inches", "size_2": "40 Inches ", "size_3": "", "size_4": "", "size_5": "", "size_6": 0.0, "heading_title": "Size"}',
          open_box: "",
          option_headings:
            '{"option1": "LP", "option2": "NG", "option3": "", "heading_title": "Gas Type"}',
        },
        body_html:
          '<p data-mce-fragment="1"><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">Blaze Grills offers an affordable premium commercial-style grill, meticulously crafted to fulfill your outdoor BBQ aspirations. These Blaze gas grills with rear infrared burners boast precision-cut 304 stainless steel components that deliver exceptional durability and longevity for your outdoor cooking endeavors. Furthermore, this model goes above and beyond with its distinctive SRL LED accent lights and integrated halogen hood lighting, elevating your grilling experience to new heights.</span></p>\n<h4 data-mce-fragment="1"><b data-mce-fragment="1">About Blaze</b></h4>\n<p data-mce-fragment="1"><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">Blaze understands the value of creating a top-notch outdoor living space that people of all ages can enjoy. For many, the ultimate summer pastime is gathering with loved ones for a delightful picnic while grilling up delicious food. That\'s why the company has dedicated extensive time and effort to developing a range of</span><span style="color: #2b00ff;"><a data-mce-fragment="1" href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products" data-mce-href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products"> </a><a title="Blaze Outdoor Products" href="https://outdoorkitchenoutlet.com/collections/blaze-outdoor-products" style="color: #2b00ff;"><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">Blaze Outdoor Products.</span></a></span></p>\n<p data-mce-fragment="1"><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">The team at Blaze works diligently to design grills that cater to each individual\'s unique cooking needs. Whether you\'re cooking for your immediate family or hosting a large crowd, Blaze has the perfect grill to suit your requirements. Regardless of your level of grilling expertise, Blaze offers a variety of grills that can accommodate your skill level, allowing you to showcase your culinary abilities and create memorable meals outdoors.</span></p>\n<h4 data-mce-fragment="1"><b data-mce-fragment="1">Blaze Premium LTE Grill Key Features:</b></h4>\n<ul data-mce-fragment="1">\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Ample Cooking Surface: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">Enjoy a spacious 748 square inches of total cooking space, providing plenty of room for your grilling needs.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Powerful BTU Output: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">This Blaze Premium LTE 32-inch 4-burner propane gas grill generates an impressive 66,000 BTUs in total, thanks to its commercial-quality 304 cast stainless steel burners and infrared rear burner.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Four Burners: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">Equipped with four commercial-quality 304 cast stainless steel burners, each boasting 14,000 BTUs of cooking power, ensuring even heat distribution and excellent performance.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Removable Warming Rack: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">Keep your food warm or cook at lower temperatures using the convenient removable warming rack.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Full-Width Drip Tray: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">The full-width drip tray makes cleanup a breeze, allowing for quick and effortless maintenance.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Heat Zone Separators: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">Divide the cooking surface into individual temperature zones with heat zone separators, providing versatility and precise control over your grilling.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Interior Lights:</b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;"> Illuminate your grilling surface with ease using the built-in interior lights, enabling you to navigate and cook with confidence, even in low-light conditions.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Triangular Cooking Rods: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">The heavy-duty 9mm patented triangle-shaped searing rods not only maximize durability but also create distinctive sear marks on your grilled masterpieces.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Primary Ignition: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">Experience a fast and reliable start every time with the push-and-turn flame-thrower primary ignition system.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Secondary Ignition: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">For added convenience, the backup flash tube crossover channels and ignition offer an alternative ignition option.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Flame Stabilizing Grids: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">Say goodbye to flare-ups while infusing your food with that delightful grilled flavor, thanks to the flame-stabilizing grids.</span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Double-Lined Hoods: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">The double-lined stainless steel grill hood not only protects the outer layer from heat discoloration but also helps maintain a higher temperature inside for efficient cooking.</span>\n</li>\n</ul>\n<h4 data-mce-fragment="1">\n<b data-mce-fragment="1">Added Value: </b><br>\n</h4>\n<ol data-mce-fragment="1">\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Lowest Cost Guaranteed:</b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;"> We ensure that our built-in grills are competitively priced, offering you the best value for your investment.</span><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;"><br data-mce-fragment="1"></span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Lifetime Warranty:</b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;"> Our grills come with a lifetime warranty, providing peace of mind and ensuring that your investment is protected for years to come.</span><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;"><br data-mce-fragment="1"></span>\n</li>\n<li data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">\n<b data-mce-fragment="1">Save up to 60%: </b><span data-mce-fragment="1" style="font-weight: 400;" data-mce-style="font-weight: 400;">With our built-in grills, you can enjoy significant savings compared to other high-end grill options on the market.</span><br>\n</li>\n</ol>',
        accentuate_data: {
          "bbq.configuration_heading_title": "Configuration",
          "bbq.grill_specs_color": "Stainless Steel",
          "bbq.seo_meta_total_grill_area": 748,
          "bbq.seo_meta_material": "304 Stainless Steel",
          "bbq.shopnew_heading_title": null,
          "bbq.side_burner_specification_type": null,
          "bbq.ref_specs_cutout_height": null,
          "bbq.side_burner_specs_configuration": null,
          "bbq.seo_meta_secondary_grilling_area": 186,
          "frequently.fbi_related_product": [
            "blaze-grill-cover-blaz-4-burner-charcoal-built-in-grills-4bicv",
            "blaze-6x14-stainless-steel-island-vent-panel-blz-island-vent",
            "blaze-32-inch-access-door-double-drawer-combo-blz-ddc-r",
            "blaze-drop-in-natural-gas-single-side-burner-blz-sb1-ng",
          ],
          "bbq.grill_specs_cutout_depth": 21.25,
          "bbq.open_box_heading_title": null,
          "bbq.storage_specs_number_of_drawers": null,
          "bbq.storage_specs_cutout_height": null,
          "bbq.openbox_related_product": null,
          "bbq.grill_specs_type": "Gas Grill",
          "bbq.rear_infrared_burner_btu": 10000,
          "bbq.product_option_related_product": [
            "blaze-4-burner-lbm-blaze-grill-blz-4lbm-lp",
            "blaze-four-burner-built-in-propane-gas-grill-rear-infrared-burner-grill-lights",
            "blaze-marine-grade-32-inch-4-burner-built-in-propane-gas-grill-with-rear-infrared-burner-grill-lights-blz-4lte2mg-lp",
            "blaze-professional-44-inch-4-burner-built-in-propane-gas-grill-rear-infrared-burner-blz-4pro-lp",
            "blaze-premium-lte-32-inch-4-burner-propane-gas-grill-w-rear-infrared-burner-lift-assist-hood-blz-4lte3-lp",
          ],
          "bbq.side_burner_specs_number_of_burners": null,
          "bbq.product_weight": 114,
          "bbq.configuration_type": ["Built In", "Freestanding"],
          "bbq.seo_meta_manufacturer_part_number": "BLZ-4LTE2-LP",
          "bbq.related_product": [
            "blaze-four-burner-built-in-propane-gas-grill-rear-infrared-burner-grill-lights",
            "blaze-lte-40-inch-5-burner-built-in-propane-gas-grill-with-rear-infrared-burner-grill-lights-blz-5lte2-lp",
          ],
          "bbq.hinge_related_product": null,
          "bbq.shipping_dimensions": "40 x 48 x 22",
          "bbq.storage_specs_cutout_width": null,
          "bbq.hinge_heading_title": null,
          "bbq.seo_meta_fuel_type": "Liquid Propane",
          "bbq.file_name": [
            "Blaze LTE User Manual [Click to download]",
            "Blaze Cutout Specifications [Click to download]",
          ],
          "bbq.upload_file": [
            "https://cdn.accentuate.io/7825365696769/-1671630088252/Blaze-LTE-User-Manual-v1672697849493.pdf",
            "https://cdn.accentuate.io/7825365696769/-1671630088252/Blaze-Cutout-Specifications-v1672697868680.pdf",
          ],
          "bbq.grill_specs_side_shelves": "No",
          "bbq.grill_specs_controller": null,
          "bbq.side_burner_specification_gas_type": null,
          "bbq.ref_specs_heading_title": null,
          "bbq.storage_specs_orientation": null,
          "bbq.thermometer": "Analog",
          "bbq.grill_specs_class": "Premium",
          "bbq.enable_call_availability_button": null,
          "bbq.overall_dimensions": ["32.5 x 25.75 x 21.25"],
          "frequently.fbi_heading": "Frequently Bought Together",
          "bbq.storage_specs_cutout_depth": null,
          "bbq.storage_specs_mounting_type": null,
          "bbq.seo_meta_main_grilling_area": 552,
          _id: "blaze-four-burner-built-in-propane-gas-grill-rear-infrared-burner-grill-lights",
          "bbq.grill_specs_on_wheels": "No",
          "bbq.product_offer_cta": null,
          "bbq.openbox_product_text": null,
          "bbq.ref_specs_outdoor_rated": null,
          "bbq.single_burner_btus": 14000,
          "bbq.shipping_weight": 129,
          "bbq.seo_meta_manufacturer": "Blaze",
          "bbq.manufacturer_download_heading_title": "Manufacturer's Manual",
          "bbq.grill_specs_no_of_racks": 2,
          "bbq.configuration_product": [
            "blaze-four-burner-built-in-propane-gas-grill-rear-infrared-burner-grill-lights",
            "blaze-lte-32-inch-4-burner-freestanding-propane-gas-grill-blz-4lte2-lp-blz-4-cart",
          ],
          "bbq.shopnew_product_text": null,
          "bbq.size_heading_title": "Product Size",
          "bbq.ref_specs_cutout_width": null,
          "bbq.brand_storage_specs_type": null,
          "bbq.option_type": ["LP", "NG"],
          "bbq.ref_specs_type": null,
          "bbq.rear_infrared_burner": "Yes",
          "bbq.product_option_heading_title": "Product Option",
          "bbq.product_offer_image_link":
            "https://cdn.shopify.com/s/files/1/0660/1900/0577/files/SmallOpenBoxGrills.png?v=1676559383",
          "bbq.grill_specs_mount_type": "Built-In",
          "bbq.rotisserie_kit": "Optional",
          "bbq.option_title": "Gas Type",
          "bbq.grill_specs_kamado_width": null,
          _info:
            "Blaze Premium LTE - 32-Inch 4-Burner Built-In Grill - Liquid Propane Gas with Rear Infrared Burner & Grill Lights - BLZ-4LTE2-LP (Home & Garden)",
          "bbq.seo_meta_series": "LTE",
          "bbq.shopnew_related_product": null,
          "bbq.product_offer_url":
            "https://outdoorkitchenoutlet.com/collections/grills-open-box",
          "bbq.number_of_main_burners": 4,
          "bbq.storage_specs_number_of_doors": null,
          "bbq.seo_meta_brand": "Blaze",
          "bbq.option_related_product": [
            "blaze-four-burner-built-in-propane-gas-grill-rear-infrared-burner-grill-lights",
            "blaze-32-inch-4-burner-built-in-natural-gas-gill-with-rear-infrared-burner-grill-lights-blz-4lte2-ng",
          ],
          "bbq.side_burder_specification_gas_type": null,
          "bbq.product_option_name": [
            "LBM Series",
            "LTE Series",
            "Marine Grade Series",
            "Professional Lux Series",
            "LTE + Series",
          ],
          "bbq.grill_specs_cutout_height": 8.5,
          "bbq.hinge_selection": null,
          "bbq.total_surface_btu": 56000,
          "bbq.grill_specs_size": 32,
          "bbq.select_sale_tag": "Free Accessory",
          "bbq.ref_specs_door_type": null,
          "bbq.cutout_dimensions": ["30.625 x 21.25 x 8.5"],
          "bbq.seo_meta_made_in_usa": "No",
          "bbq.grill_lights": "Internal/External",
          "bbq.shipping_info_heading_title": "Shipping Information",
          "bbq.seo_meta_cooking_grid_dimensions": "29.5 x 17.875",
          "bbq.ref_specs_cutout_depth": null,
          "bbq.storage_specs_heading_title": null,
          "bbq.grill_specs_cutout_width": 30.625,
          size_title: ["32 Inches", "40 Inches"],
          "bbq.specification_heading_title": "Specification",
        },
        created_at: "2025-06-12T02:41:56.255584+00:00",
        variants: [
          {
            compare_at_price: 2720.3,
            taxable: true,
            weight_unit: "lb",
            requires_shipping: true,
            price: 2099,
            sku_suggest: ["BLZ-4LTE2-LP"],
            qty: 8,
            costing: 1258,
            sku: "BLZ-4LTE2-LP",
            grams: 51709.53018,
          },
        ],
        title:
          "Blaze Premium LTE - 32-Inch 4-Burner Built-In Grill - Liquid Propane Gas with Rear Infrared Burner & Grill Lights - BLZ-4LTE2-LP",
        recommendations: {
          complementary_products: "",
          related_products_settings: "",
          search_boost: "blaze\nblaz\nbuilt in\ngrill\nbbq",
          related_products: 0,
        },
        features: {
          furniture_features: 0,
          color: 0,
          furniture_material: 0,
          flue_type: 0,
          top_surface_material: 0,
          cover_features: 0,
          material: 0,
          mounting_type: 0,
          stove_top_type: 0,
          extraction_type: 0,
          grease_filter_material: 0,
          water_filter_application: 0,
          power_source: 0,
        },
        updated_at: "2026-03-06T02:34:19.058610+00:00",
        collections: [
          {
            name: "Shop All Brands",
            id: 31,
            slug: "shop-all-brands",
          },
          {
            name: "Shop All Blaze Outdoor Products",
            id: 77,
            slug: "shop-all-blaze-outdoor-products",
          },
          {
            name: "Blaze Outdoor Products",
            id: 79,
            slug: "blaze-outdoor-products",
          },
          {
            name: "Shop All BBQ Grills and Smokers",
            id: 87,
            slug: "shop-all-bbq-grills-and-smokers",
          },
          {
            name: "Shop All Built In Grills",
            id: 88,
            slug: "shop-all-built-in-grills",
          },
          {
            name: "Gas Grills",
            id: 90,
            slug: "gas-grills",
          },
          {
            name: "Shop All Gas Grills",
            id: 92,
            slug: "shop-all-gas-grills",
          },
          {
            name: "Built In Gas Grills",
            id: 93,
            slug: "built-in-gas-grills",
          },
          {
            name: "BBQ Grills year end",
            id: 136,
            slug: "bbq-grills-year-end",
          },
          {
            name: "Blaze Grills",
            id: 138,
            slug: "blaze-grills",
          },
          {
            name: "Year End Sale",
            id: 180,
            slug: "year-end-sale",
          },
          {
            name: "Blaze",
            id: 182,
            slug: "blaze",
          },
          {
            name: "Top Deals",
            id: 192,
            slug: "top-deals",
          },
          {
            name: "Promotions",
            id: 193,
            slug: "promotions",
          },
          {
            name: "Best Sellers for BBQ Grills and Smokers",
            id: 194,
            slug: "best-sellers-for-bbq-grills-and-smokers",
          },
          {
            name: "Best Sellers for Grills",
            id: 197,
            slug: "best-sellers-for-grills",
          },
          {
            name: "Blaze Built-In Grills",
            id: 954,
            slug: "blaze-built-in-grills",
          },
        ],
        ratings: {
          rating_count: "'2",
        },
        product_id: 5690,
        options: {
          option3: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
          option1: {
            name: "Title",
            value: "Default Title",
            linked_to: 0,
          },
          option2: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
        },
        seo: {
          description:
            "Blaze Premium LTE Grill offers commercial-quality performance with 304 stainless steel burners, rear infrared burners, and SRL LED accent lights. With 748 sq.in. of cooking space, heat zone separators, and a full-width drip tray, it's perfect for any BBQ. Call now for the best price and enjoy lifetime warranty savings!",
          title:
            "Get Blaze 32-Inch 4-Burner Propane Grill & Accessories - Buy Now!",
        },
        brand: "Blaze Outdoor Products",
        images: [
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/blaze4lte2.png?v=1743597514",
            alt: 0,
            position: 1,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2-NG.2_8180e014-0aef-43f6-9c13-6e574f11192f.jpg?v=1743597507",
            alt: 0,
            position: 2,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2-NG.3_0ac9982f-374e-4d13-a415-6bc970b3a42d.jpg?v=1743597517",
            alt: 0,
            position: 3,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2-NG.4_62fee2ed-fa96-405b-a2b7-2f74af342dc0.jpg?v=1743597510",
            alt: 0,
            position: 4,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2-NG.5_313d8772-b17b-4651-b0d0-b485f1bd4591.jpg?v=1743597520",
            alt: 0,
            position: 5,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2-NG.6_37fc1138-4231-4695-acf3-cfe3f66e1e69.jpg?v=1743597944",
            alt: 0,
            position: 6,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2-NG.7_082ec642-53ed-4dba-8c05-db35a954c1d0.jpg?v=1743597947",
            alt: 0,
            position: 7,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2-NG.8_dc7d9fae-f1fe-4565-9b78-387ee2eed685.jpg?v=1743597964",
            alt: 0,
            position: 8,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2-NG.9_f46d2988-4357-4a52-ba7c-216fe7e54a77.jpg?v=1743597966",
            alt: 0,
            position: 9,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2-NG.10_1551bc0a-e000-4cdd-af8d-a8251c7d09c5.jpg?v=1743597969",
            alt: 0,
            position: 10,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2-NG.11_c55971d8-6a8f-4628-ba33-0ef6050c646f.jpg?v=1743597972",
            alt: 0,
            position: 11,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-4LTE2-NG_86cb330c-ce8e-4f85-b6ba-2897731590f6.jpg?v=1743598356",
            alt: 0,
            position: 12,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/Screenshot2022-11-07132548_b097fce3-5cf9-409e-8e0a-26d63fadcda2.jpg?v=1743598359",
            alt: 0,
            position: 13,
          },
        ],
        custom_fields: [],
        handle:
          "blaze-four-burner-built-in-propane-gas-grill-rear-infrared-burner-grill-lights",
        published: true,
        frequently_bought_together: [],
        tags: [
          "27-33 Inches",
          "304 Stainless Steel",
          "4 Burners",
          "Analog",
          "BBQ Grills-yrend",
          "Best Sellers for BBQ Grills and Smokers",
          "Best Sellers for Blaze",
          "Best Sellers for Grills",
          "Blaze Grills",
          "Blaze Outdoor Products",
          "BLZ4BICV",
          "Built In",
          "Built In Gas Grills",
          "Depth 0-26 Inches",
          "Free Accessories",
          "Gas Grills",
          "Height 0-26 Inches",
          "Internal and External Lights",
          "Internal Lights",
          "Liquid Propane Gas",
          "No",
          "Optional Rotisserie",
          "Shop All BBQ Grills and Smoker",
          "Shop All BBQ Grills and Smokers",
          "Shop All Blaze",
          "Shop All Blaze Outdoor Products",
          "Shop All Gas Grills",
          "Top Deals",
          "Width 27-33 Inches",
          "With Rear Infrared Burner",
          "Year end Sale 2023",
        ],
        product_type: "Home & Garden",
        uploaded_at: "2025-06-12T02:41:56.255572+00:00",
        product_category: [
          {
            category_name: "Home & Garden",
            id: 1,
          },
        ],
        region_pricing: {
          compare_price_us: null,
          included_us: null,
          price_us: null,
        },
        status: "active",
      },
    ],
    fbt_bundle: [],
    fbt_carousel: [
      {
        custom_metafields: {
          custom_sale_tag: "0.0",
          size_headings:
            '{"size_1": "4 Burner", "size_2": "5 Burner", "size_3": "", "size_4": "", "size_5": "", "size_6": 0.0, "heading_title": ""}',
          open_box: "",
          option_headings:
            '{"option1": "", "option2": "", "option3": "", "heading_title": ""}',
        },
        body_html:
          '<ul class="key-features" data-mce-fragment="1">\n<li data-mce-fragment="1">Soft felt backing will not scratch the exterior of your grill</li>\n<li data-mce-fragment="1">Greatly extends the life of your grill</li>\n<li data-mce-fragment="1">Designed to fit Blaze Professional LUX 44-Inch built-in gas grills</li>\n</ul>\n<p data-mce-fragment="1">Protect your Blaze Professional LUX 4-Burner 44-Inch Built-In Gas Grill from the elements with this quality grill cover. This quality grill cover is made with water-resistant vinyl to shield your grill from dirt, dust, and water, and has a felt backing that will not scratch the stainless steel exterior of your grill. This grill cover will greatly extend the life of your grill and allows you to get the most out of your investment with Blaze Professional. Not for use with Blaze Prelude LBM or Premium LTE Grills.</p>\n<p data-mce-fragment="1">Width 45.25"<br>Depth 29.5"<br>Height 25"<br>Weight 4 lbs</p>',
        accentuate_data: {
          "bbq.configuration_heading_title": "Configuration ",
          "bbq.sink_bars_center_cutout_height": null,
          "bbq.seo_meta_total_grill_area": null,
          "bbq.seo_meta_material": null,
          "bbq.shopnew_heading_title": null,
          "bbq.side_burner_specification_type": null,
          "bbq.ref_specs_cutout_height": null,
          "bbq.side_burner_specs_configuration": null,
          "bbq.seo_meta_secondary_grilling_area": null,
          "frequently.fbi_related_product": [
            "blaze-40-inch-double-access-door-with-paper-towel-holder-blz-ad40-r",
            "blz-4pro-ng-blz-4pro-cart",
            "blaze-39-inch-access-door-triple-drawer-combo-blz-ddc-39-r",
            "blaze-professional-xl-smoker-box-blz-xl-prosmbx",
          ],
          "bbq.open_box_heading_title": null,
          "bbq.storage_specs_number_of_drawers": null,
          "bbq.storage_specs_cutout_height": null,
          "bbq.sink_bars_center_configuration": null,
          "bbq.openbox_related_product": null,
          "bbq.sink_bars_center_type": null,
          "bbq.ref_specs_total_capacity": null,
          "bbq.product_option_related_product": null,
          "bbq.side_burner_specs_number_of_burners": null,
          "bbq.product_weight": null,
          "bbq.configuration_type": ["Built-In", "Freestanding"],
          "bbq.seo_meta_manufacturer_part_number": null,
          "bbq.related_product": [
            "blaze-grill-cover-professional-34-inch-built-in-grills-3probicv",
            "4-burner-pro-built-in-cover-4probicv",
          ],
          "bbq.orientation_heading_title": null,
          "bbq.hinge_related_product": null,
          "bbq.sink_bars_center_cutout_depth": null,
          "bbq.shipping_dimensions": "46 x 30 x 25",
          "bbq.storage_specs_cutout_width": null,
          "bbq.sink_bars_center_heading_title": null,
          "bbq.hinge_heading_title": null,
          "bbq.seo_meta_fuel_type": null,
          "bbq.file_name": null,
          "bbq.upload_file": null,
          "bbq.ref_specs_heading_title": null,
          "bbq.storage_specs_orientation": null,
          "bbq.thermometer": null,
          "bbq.shop_new_product_offer_url": null,
          "bbq.enable_call_availability_button": null,
          "bbq.overall_dimensions": null,
          "frequently.fbi_heading": "Frequently Bought Together",
          "bbq.storage_specs_cutout_depth": null,
          "bbq.storage_specs_mounting_type": null,
          "bbq.seo_meta_main_grilling_area": null,
          _id: "4-burner-pro-built-in-cover-4probicv",
          "bbq.product_offer_cta": null,
          "bbq.openbox_product_text": null,
          "bbq.ref_specs_outdoor_rated": null,
          "bbq.single_burner_btus": null,
          "bbq.shipping_weight": 4,
          "bbq.seo_meta_manufacturer": null,
          "bbq.manufacturer_download_heading_title": null,
          "bbq.selection_related_product": null,
          "bbq.configuration_product": [
            "4-burner-pro-built-in-cover-4probicv",
            "blaze-grill-cover-for-professional-lux-44-inch-freestanding-gas-grills-4proctcv",
          ],
          "bbq.shopnew_product_text": null,
          "bbq.size_heading_title": "Product Size",
          "bbq.ref_specs_cutout_width": null,
          "bbq.brand_storage_specs_type": null,
          "bbq.option_type": null,
          "bbq.ref_specs_type": null,
          "bbq.selection_name": null,
          "bbq.rear_infrared_burner": null,
          "bbq.product_option_heading_title": null,
          "bbq.product_offer_image_link":
            "https://cdn.shopify.com/s/files/1/0660/1900/0577/files/SmallOpenBoxAccessories_1.png?v=1676599538",
          "bbq.sink_bars_center_water_type": null,
          "bbq.rotisserie_kit": null,
          "bbq.option_title": null,
          _info:
            "Blaze Grill Cover For Professional LUX 44-Inch Built-In Gas Grills - 4PROBICV (Home & Garden)",
          "bbq.seo_meta_series": null,
          "bbq.shopnew_related_product": null,
          "bbq.product_offer_url":
            "https://outdoorkitchenoutlet.com/collections/shop-open-box-accessories",
          "bbq.number_of_main_burners": null,
          "bbq.storage_specs_number_of_doors": null,
          "bbq.seo_meta_brand": null,
          "bbq.sideburner_specs_heading_title": null,
          "bbq.option_related_product": null,
          "bbq.side_burder_specification_gas_type": null,
          "bbq.product_option_name": null,
          "bbq.hinge_selection": null,
          "bbq.sink_bars_center_cutout_width": null,
          "bbq.total_surface_btu": null,
          "bbq.shop_new_image_link": null,
          "bbq.select_sale_tag": null,
          "bbq.ref_specs_door_type": null,
          "bbq.cutout_dimensions": null,
          "bbq.seo_meta_made_in_usa": null,
          "bbq.grill_lights": null,
          "bbq.shipping_info_heading_title": "Shipping Information",
          "bbq.seo_meta_cooking_grid_dimensions": null,
          "bbq.ref_specs_cutout_depth": null,
          "bbq.storage_specs_heading_title": null,
          size_title: ["34 Inches", "44 Inches"],
          "bbq.specification_heading_title": null,
        },
        created_at: "2025-06-12T02:41:55.731264+00:00",
        variants: [
          {
            compare_at_price: 117.61,
            taxable: true,
            weight_unit: "lb",
            requires_shipping: true,
            price: 109,
            sku_suggest: ["4PROBICV"],
            qty: 10,
            costing: 65.4,
            sku: "4PROBICV",
            grams: 1814.36948,
          },
        ],
        title:
          "Blaze Grill Cover For Professional LUX 44-Inch Built-In Gas Grills - 4PROBICV",
        recommendations: {
          complementary_products: "",
          related_products_settings: "",
          search_boost: "",
          related_products: 0,
        },
        features: {
          furniture_features: 0,
          color: 0,
          furniture_material: 0,
          flue_type: 0,
          top_surface_material: 0,
          cover_features: 0,
          material: 0,
          mounting_type: 0,
          stove_top_type: 0,
          extraction_type: 0,
          grease_filter_material: 0,
          water_filter_application: 0,
          power_source: 0,
        },
        updated_at: "2025-09-11T05:58:19.610841+00:00",
        collections: [
          {
            name: "Shop All Brands",
            id: 31,
            slug: "shop-all-brands",
          },
          {
            name: "Shop All BBQ Grilling Tools and Accessories",
            id: 33,
            slug: "shop-all-bbq-grilling-tools-and-accessories",
          },
          {
            name: "Shop All Grill Attachments",
            id: 36,
            slug: "shop-all-grill-attachments",
          },
          {
            name: "Covers",
            id: 38,
            slug: "covers",
          },
          {
            name: "Shop All Grills and Smoker Covers",
            id: 40,
            slug: "shop-all-grills-and-smoker-covers",
          },
          {
            name: "Built In Grill Cover",
            id: 59,
            slug: "built-in-grill-cover",
          },
          {
            name: "Shop All Blaze Outdoor Products",
            id: 77,
            slug: "shop-all-blaze-outdoor-products",
          },
          {
            name: "Blaze Accessories",
            id: 78,
            slug: "blaze-accessories",
          },
          {
            name: "Blaze Outdoor Products",
            id: 79,
            slug: "blaze-outdoor-products",
          },
          {
            name: "Best Sellers for Built In Grill Cover",
            id: 229,
            slug: "best-sellers-for-built-in-grill-cover",
          },
          {
            name: "Best Sellers for Covers",
            id: 230,
            slug: "best-sellers-for-covers",
          },
        ],
        ratings: {
          rating_count: "'2",
        },
        product_id: 5625,
        options: {
          option3: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
          option1: {
            name: "Title",
            value: "Default Title",
            linked_to: 0,
          },
          option2: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
        },
        seo: {
          description:
            "The vinyl is designed to protect the stainless steel of your grill and the soft felt back will not scratch the grill exterior.Call us now!",
          title: "4 Burner PRO Built-in Cover - 4PROBICV",
        },
        brand: "Blaze Outdoor Products",
        images: [
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/4PROBICV.jpg?v=1743598693",
            alt: 0,
            position: 1,
          },
        ],
        custom_fields: [],
        handle: "4-burner-pro-built-in-cover-4probicv",
        published: true,
        frequently_bought_together: [],
        tags: [
          "Best Sellers for Built In Grill Cover",
          "Best Sellers for Covers",
          "Blaze Accessories",
          "Blaze Outdoor Products",
          "Built in",
          "Built In Grill Cover",
          "Grill Attachments",
          "Grill Covers",
          "No",
          "Shop All BBQ Grilling Tools and Accesories",
          "Shop All BBQ Grilling Tools and Accessories",
          "Shop All Blaze",
          "Shop All Blaze Outdoor Products",
          "Shop All Covers",
        ],
        product_type: "Home & Garden",
        uploaded_at: "2025-06-12T02:41:55.731250+00:00",
        product_category: [
          {
            category_name: "Home & Garden",
            id: 1,
          },
        ],
        region_pricing: {
          compare_price_us: null,
          included_us: null,
          price_us: null,
        },
        status: "active",
      },
      {
        custom_metafields: {
          custom_sale_tag: "0.0",
          size_headings:
            '{"size_1": "25 inches", "size_2": "32 inches", "size_3": "40 inches", "size_4": "", "size_5": "", "size_6": 0.0, "heading_title": ""}',
          open_box: "",
          option_headings:
            '{"option1": "", "option2": "", "option3": "", "heading_title": ""}',
        },
        body_html:
          '<ul class="key-features" data-mce-fragment="1">\n<li data-mce-fragment="1">Mounts into existing cutout or insulated grill jacket for easy installation</li>\n<li data-mce-fragment="1">Shields grill from winds of up to 25 MPH</li>\n<li data-mce-fragment="1">Heavy-duty 304 stainless steel construction for durability and longevity</li>\n<li data-mce-fragment="1">Fits Blaze &amp; Blaze Premium LTE 5-burner gas grills</li>\n</ul>\n<p data-mce-fragment="1">The Blaze wind guard is custom designed for high wind situations, such as coastal areas or balconies. Grilling in strong winds is often challenging. The Blaze Wind Guard allows you to cook on lower settings, keeps burners lit, and prevents the fire from going out, even in strong winds. Designed to mount within an existing grill cutout or inside insulated jackets for easy installation. This wind guard is designed for use with Blaze &amp; Blaze Premium LTE 5-burner gas grills.</p>\n<p data-mce-fragment="1">Width 43.69"<br>Depth 12"<br>Height 19"</p>',
        accentuate_data: {
          "bbq.configuration_heading_title": null,
          "bbq.grill_specs_color": "Stainless Steel",
          "bbq.seo_meta_total_grill_area": null,
          "bbq.seo_meta_material": "304 Stainless Steel",
          "bbq.shopnew_heading_title": null,
          "bbq.side_burner_specification_type": null,
          "bbq.ref_specs_cutout_height": null,
          "bbq.side_burner_specs_configuration": null,
          "bbq.seo_meta_secondary_grilling_area": null,
          "frequently.fbi_related_product": [
            "blaze-grill-cover-for-original-5-burner-built-in-grills-5bicv",
            "blaze-rotisserie-kit-for-40-inch-5-burner-gas-grills-blz-5-rotis-ss",
            "blaze-infrared-searing-burner-blz-irn",
            "blaze-xl-traditional-smoker-box-blz-xl-smbx",
          ],
          "bbq.grill_specs_cutout_depth": null,
          "bbq.open_box_heading_title": null,
          "bbq.storage_specs_number_of_drawers": 2,
          "bbq.storage_specs_cutout_height": null,
          "bbq.openbox_related_product": null,
          "bbq.grill_specs_type": "Wind Guard",
          "bbq.rear_infrared_burner_btu": null,
          "bbq.product_option_related_product": null,
          "bbq.side_burner_specs_number_of_burners": null,
          "bbq.product_weight": 30,
          "bbq.configuration_type": null,
          "bbq.seo_meta_manufacturer_part_number": null,
          "bbq.related_product": [
            "blaze-wind-guard-for-25-inch-3-burner-gas-grills-blz-wg-25",
            "blaze-wind-guard-for-32-inch-4-burner-gas-grills-blz-wg-32",
            "blaze-wind-guard-for-40-inch-5-burner-gas-grills-blz-wg-40",
          ],
          "bbq.hinge_related_product": null,
          "bbq.shipping_dimensions": "45 x 13 x 20",
          "bbq.storage_specs_cutout_width": null,
          "bbq.hinge_heading_title": null,
          "bbq.seo_meta_fuel_type": null,
          "bbq.file_name": null,
          "bbq.upload_file": null,
          "bbq.grill_specs_side_shelves": null,
          "bbq.grill_specs_controller": null,
          "bbq.side_burner_specification_gas_type": null,
          "bbq.ref_specs_heading_title": null,
          "bbq.storage_specs_orientation": "Vertical",
          "bbq.thermometer": null,
          "bbq.grill_specs_class": "Premium",
          "bbq.enable_call_availability_button": null,
          "bbq.overall_dimensions": ["43.69 x 12 x 19"],
          "frequently.fbi_heading": "Frequently Bought Together",
          "bbq.storage_specs_cutout_depth": null,
          "bbq.storage_specs_mounting_type": "Raised",
          "bbq.seo_meta_main_grilling_area": null,
          _id: "blaze-wind-guard-for-40-inch-5-burner-gas-grills-blz-wg-40",
          "bbq.grill_specs_on_wheels": null,
          "bbq.product_offer_cta": null,
          "bbq.openbox_product_text": null,
          "bbq.ref_specs_outdoor_rated": null,
          "bbq.single_burner_btus": null,
          "bbq.shipping_weight": 20,
          "bbq.seo_meta_manufacturer": null,
          "bbq.manufacturer_download_heading_title": null,
          "bbq.grill_specs_no_of_racks": null,
          "bbq.configuration_product": null,
          "bbq.shopnew_product_text": null,
          "bbq.size_heading_title": "Product Size",
          "bbq.ref_specs_cutout_width": null,
          "bbq.brand_storage_specs_type": "Access Doors",
          "bbq.option_type": null,
          "bbq.ref_specs_type": null,
          "bbq.rear_infrared_burner": null,
          "bbq.product_option_heading_title": null,
          "bbq.product_offer_image_link": null,
          "bbq.grill_specs_mount_type": null,
          "bbq.rotisserie_kit": null,
          "bbq.option_title": null,
          "bbq.grill_specs_kamado_width": null,
          _info:
            "Blaze Wind Guard For 40-Inch 5-Burner Gas Grills - BLZ-WG-40 (Home & Garden)",
          "bbq.seo_meta_series": "Original/LTE",
          "bbq.shopnew_related_product": null,
          "bbq.product_offer_url": null,
          "bbq.number_of_main_burners": null,
          "bbq.storage_specs_number_of_doors": 2,
          "bbq.seo_meta_brand": null,
          "bbq.option_related_product": null,
          "bbq.side_burder_specification_gas_type": null,
          "bbq.product_option_name": null,
          "bbq.grill_specs_cutout_height": null,
          "bbq.hinge_selection": null,
          "bbq.total_surface_btu": null,
          "bbq.grill_specs_size": 40,
          "bbq.select_sale_tag": null,
          "bbq.ref_specs_door_type": null,
          "bbq.cutout_dimensions": null,
          "bbq.seo_meta_made_in_usa": null,
          "bbq.grill_lights": null,
          "bbq.shipping_info_heading_title": "Shipping Information",
          "bbq.seo_meta_cooking_grid_dimensions": null,
          "bbq.ref_specs_cutout_depth": null,
          "bbq.storage_specs_heading_title": "Storage Specification",
          "bbq.grill_specs_cutout_width": null,
          size_title: ["3 Burners", "4 Burners", "5 Burners"],
          "bbq.specification_heading_title": "Specification",
        },
        created_at: "2025-06-12T02:41:56.757378+00:00",
        variants: [
          {
            compare_at_price: 451.63,
            taxable: true,
            weight_unit: "lb",
            requires_shipping: true,
            price: 419,
            sku_suggest: ["BLZ-WG-40"],
            qty: 10,
            costing: 251.4,
            sku: "BLZ-WG-40",
            grams: 9071.8474,
          },
        ],
        title: "Blaze Wind Guard For 40-Inch 5-Burner Gas Grills - BLZ-WG-40",
        recommendations: {
          complementary_products: "",
          related_products_settings: "",
          search_boost: "",
          related_products: 0,
        },
        features: {
          furniture_features: 0,
          color: 0,
          furniture_material: 0,
          flue_type: 0,
          top_surface_material: 0,
          cover_features: 0,
          material: 0,
          mounting_type: 0,
          stove_top_type: 0,
          extraction_type: 0,
          grease_filter_material: 0,
          water_filter_application: 0,
          power_source: 0,
        },
        updated_at: "2026-03-06T02:34:19.303754+00:00",
        collections: [
          {
            name: "Shop All Brands",
            id: 31,
            slug: "shop-all-brands",
          },
          {
            name: "Outdoor Kitchen Appliances",
            id: 41,
            slug: "outdoor-kitchen-appliances",
          },
          {
            name: "Shop All Outdoor Kitchen Appliances",
            id: 43,
            slug: "shop-all-outdoor-kitchen-appliances",
          },
          {
            name: "Installation Components",
            id: 70,
            slug: "installation-components",
          },
          {
            name: "Shop All BBQ Islands and Kits",
            id: 71,
            slug: "shop-all-bbq-islands-and-kits",
          },
          {
            name: "Shop All Blaze Outdoor Products",
            id: 77,
            slug: "shop-all-blaze-outdoor-products",
          },
          {
            name: "Blaze Accessories",
            id: 78,
            slug: "blaze-accessories",
          },
          {
            name: "Blaze Outdoor Products",
            id: 79,
            slug: "blaze-outdoor-products",
          },
          {
            name: "Best Sellers for BBQ Islands and Kits",
            id: 325,
            slug: "best-sellers-for-bbq-islands-and-kits",
          },
        ],
        ratings: {
          rating_count: "'2",
        },
        product_id: 5754,
        options: {
          option3: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
          option1: {
            name: "Title",
            value: "Default Title",
            linked_to: 0,
          },
          option2: {
            name: 0,
            value: 0,
            linked_to: 0,
          },
        },
        seo: {
          description: "",
          title: "",
        },
        brand: "Blaze Outdoor Products",
        images: [
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-WG-25_e147d225-b080-4966-bf5b-00ce05546fcb.jpg?v=1743600335",
            alt: 0,
            position: 1,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-PROWG-44.1_f7e2f3df-7442-4dc4-8e9e-353b4ed3e59d.jpg?v=1743600336",
            alt: 0,
            position: 2,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-PROWG-44.2_440ef780-32b9-4148-a9b4-0993ebe891f5.jpg?v=1743600338",
            alt: 0,
            position: 3,
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0660/1900/0577/products/BLZ-PROWG-44.3_81d5d1a9-e5af-4a1a-879e-dbfea5c72f8e.jpg?v=1743600339",
            alt: 0,
            position: 4,
          },
        ],
        custom_fields: [],
        handle: "blaze-wind-guard-for-40-inch-5-burner-gas-grills-blz-wg-40",
        published: true,
        frequently_bought_together: [],
        tags: [
          "BBQ Islands & Kits",
          "BBQ Islands and Kits",
          "Best Sellers for BBQ Islands and Kits",
          "Blaze Accessories",
          "Blaze Outdoor Products",
          "Installation Components",
          "No",
          "Shop All BBQ Grilling Tools and Accesories",
          "Shop All BBQ Grilling Tools and Accessories",
          "Shop All BBQ Islands and Kits",
          "Shop All Blaze",
          "Shop All Blaze Outdoor Products",
          "Shop All Outdoor Kitchen Appliances",
          "Wind Deflector",
        ],
        product_type: "Home & Garden",
        uploaded_at: "2025-06-12T02:41:56.757364+00:00",
        product_category: [
          {
            category_name: "Home & Garden",
            id: 1,
          },
        ],
        region_pricing: {
          compare_price_us: null,
          included_us: null,
          price_us: null,
        },
        status: "active",
      },
    ],
    open_box: null,
    new_items: null,
    product_specs: [
      {
        label: "Adjustable Thermostat",
        key: "bbq.frplc_spec_adj_thermostat",
        type: "fireplaces",
        value: "",
      },
      {
        label: "BTU",
        key: "bbq.heater_specs_btu",
        type: "patio heaters",
        value: "",
      },
      {
        label: "BTUs",
        key: "bbq.frplc_spec_btus",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Capacity",
        key: "bbq.ref_specs_total_capacity",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Class",
        key: "bbq.grill_specs_class",
        type: "grills",
        value: "Luxury",
      },
      {
        label: "Class",
        key: "bbq.storage_specs_class",
        type: "storage",
        value: "",
      },
      {
        label: "Collection",
        key: "bbq.frplc_spec_model",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Color",
        key: "bbq.ref_specs_color",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Commercial",
        key: "bbq.ref_specs_is_commercial",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Configuration",
        key: "bbq.ref_specs_mount_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Configuration",
        key: "bbq.grill_specs_mount_type",
        type: "grills",
        value: "Built-In",
      },
      {
        label: "Cooking Grill Dimensions",
        key: "bbq.seo_meta_cooking_grid_dimensions",
        type: "grills",
        value: "40 Inches W x 19 15/16 Inches D",
      },
      {
        label: "Cutout Depth",
        key: "bbq.ref_specs_cutout_depth",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Cutout Depth",
        key: "bbq.grill_specs_cutout_depth",
        type: "grills",
        value: "23 5/8 Inches",
      },
      {
        label: "Cutout Dimensions",
        key: "bbq.cutout_dimensions",
        type: "grills",
        value: "42 1/2 Inches W x 23 5/8 Inches D x 10 1/2 Inches H",
      },
      {
        label: "Cutout Height",
        key: "bbq.ref_specs_cutout_height",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Cutout Height",
        key: "bbq.grill_specs_cutout_height",
        type: "grills",
        value: "10 1/2 Inches",
      },
      {
        label: "Cutout Width",
        key: "bbq.ref_specs_cutout_width",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Cutout Width",
        key: "bbq.grill_specs_cutout_width",
        type: "grills",
        value: "42 1/2 Inches",
      },
      {
        label: "Decor",
        key: "bbq.heater_specs_plate_style",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Door Type",
        key: "bbq.ref_specs_door_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Drain Type",
        key: "bbq.ref_specs_drain_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Elements",
        key: "bbq.heater_specs_elements",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Ember Bed Depth",
        key: "bbq.frplc_spec_ember_bed_depth",
        type: "fireplaces",
        value: "",
      },
      {
        label: "External Material",
        key: "bbq.seo_meta_material",
        type: "grills",
        value: "304 Stainless Steel",
      },
      {
        label: "Features",
        key: "bbq.heater_specs_features",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Finish",
        key: "bbq.frplc_spec_color",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Finish",
        key: "bbq.heater_specs_finish",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Firebox Width",
        key: "bbq.frplc_spec_firebox_width",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Fireplace Style",
        key: "bbq.frplc_spec_style",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Fireplace Type",
        key: "bbq.frplc_spec_view_type",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Framing Dimension",
        key: "bbq.frplc_spec_frame_dimension",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Fuel Type",
        key: "bbq.frplc_spec_fuel_type",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Fuel Type",
        key: "bbq.heater_specs_fuel_type",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Fuel Type",
        key: "bbq.seo_meta_fuel_type",
        type: "grills",
        value: "Liquid Propane",
      },
      {
        label: "Glass Door",
        key: "bbq.ref_specs_is_glass_door",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Grade",
        key: "bbq.heater_specs_grade",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Grill Light",
        key: "bbq.grill_lights",
        type: "grills",
        value: "Internal/External",
      },
      {
        label: "Heating Area",
        key: "bbq.frplc_spec_heat_area",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Hinge Type",
        key: "bbq.ref_specs_hinge_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Hinge Type",
        key: "bbq.storage_specs_hinge_type",
        type: "storage",
        value: "",
      },
      {
        label: "Ice Cube Type",
        key: "bbq.ref_specs_ice_cube_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Ice Produced Daily",
        key: "bbq.ref_specs_ice_produced_daily",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Installation Type",
        key: "bbq.frplc_spec_mount_type",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Item Type",
        key: "bbq.ref_specs_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Item Type",
        key: "bbq.frplc_spec_type",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Item Type",
        key: "bbq.grill_specs_type",
        type: "grills",
        value: "Gas Grill",
      },
      {
        label: "Kamado Width",
        key: "bbq.grill_specs_kamado_width ",
        type: "grills",
        value: "",
      },
      {
        label: "Line Location",
        key: "bbq.frplc_spec_line_loc",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Lock",
        key: "bbq.ref_specs_with_lock",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Main Grill Area",
        key: "bbq.seo_meta_main_grilling_area",
        type: "grills",
        value: "797 Sq. Inches",
      },
      {
        label: "Marine Grade",
        key: "bbq.heater_specs_marine_grade",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Material",
        key: "bbq.frplc_spec_material",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Max Keg Size",
        key: "bbq.ref_specs_max_keg_size",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Number of Main Burners",
        key: "bbq.number_of_main_burners",
        type: "grills",
        value: "4-Burner",
      },
      {
        label: "Number Of Racks",
        key: "bbq.grill_specs_no_of_racks",
        type: "grills",
        value: 2,
      },
      {
        label: "Number of Taps",
        key: "bbq.ref_specs_no_of_taps",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Number Of Zones",
        key: "bbq.ref_specs_zones",
        type: "refrigerators",
        value: "",
      },
      {
        label: "On Wheels",
        key: "bbq.grill_specs_on_wheels",
        type: "grills",
        value: "No",
      },
      {
        label: "Outdoor Certification",
        key: "bbq.ref_specs_outdoor_certification",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Outdoor Rated",
        key: "bbq.ref_specs_outdoor_rated",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Overall Dimensions",
        key: "bbq.overall_dimensions",
        type: "grills",
        value: "44 9/50 Inches W x 28 37/100 Inches D x 24 3/25 Inches H",
      },
      {
        label: "Primary Color",
        key: "bbq.grill_specs_color",
        type: "grills",
        value: "Stainless Steel",
      },
      {
        label: "Product Weight",
        key: "bbq.product_weight",
        type: "grills",
        value: "260 lbs",
      },
      {
        label: "Rear Infrared Burner",
        key: "bbq.rear_infrared_burner",
        type: "grills",
        value: "Yes",
      },
      {
        label: "Rear Infrared Burner BTU",
        key: "bbq.rear_infrared_burner_btu",
        type: "grills",
        value: 10000,
      },
      {
        label: "Recess Option",
        key: "bbq.frplc_spec_recess_option",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Refrigerator Class",
        key: "bbq.ref_specs_class",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Rotisserie Kit",
        key: "bbq.rotisserie_kit",
        type: "grills",
        value: "Integrated",
      },
      {
        label: "Secondary Grill Area",
        key: "bbq.seo_meta_secondary_grilling_area",
        type: "grills",
        value: "253 Sq. Inches",
      },
      {
        label: "Series",
        key: "bbq.heater_specs_series",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Series",
        key: "bbq.seo_meta_series",
        type: "grills",
        value: "Professional",
      },
      {
        label: "Shipping Dimensions",
        key: "bbq.shipping_dimensions",
        type: "grills",
        value: "40 Inches W x 48 Inches D x 25 Inches H",
      },
      {
        label: "Shipping Weight",
        key: "bbq.shipping_weight",
        type: "grills",
        value: "275 lbs",
      },
      {
        label: "Side Burner Configuration",
        key: "bbq.side_burner_specs_configuration",
        type: "grills",
        value: "",
      },
      {
        label: "Side Burner Fuel Type",
        key: "bbq.side_burner_specification_gas_type",
        type: "grills",
        value: "",
      },
      {
        label: "Side Burner Type",
        key: "bbq.side_burner_specification_type",
        type: "grills",
        value: "",
      },
      {
        label: "Side Burners",
        key: "bbq.side_burner_specs_number_of_burners",
        type: "grills",
        value: "",
      },
      {
        label: "Side Shelves",
        key: "bbq.grill_specs_side_shelves ",
        type: "grills",
        value: "",
      },
      {
        label: "Single Burner BTU",
        key: "bbq.single_burner_btus",
        type: "grills",
        value: 18000,
      },
      {
        label: "Sink Bar Center Configuration",
        key: "bbq.sink_bars_center_configuration",
        type: "storage",
        value: "",
      },
      {
        label: "Sink Bar Center Type",
        key: "bbq.sink_bars_center_type",
        type: "storage",
        value: "",
      },
      {
        label: "Size",
        key: "bbq.frplc_spec_size",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Size",
        key: "bbq.heater_specs_size",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Size",
        key: "bbq.grill_specs_size",
        type: "grills",
        value: "44 Inches",
      },
      {
        label: "Storage Cofiguration",
        key: "bbq.storage_specs_mounting_type",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Cutout Depth",
        key: "bbq.storage_specs_cutout_depth",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Cutout Height",
        key: "bbq.storage_specs_cutout_height",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Cutout Width",
        key: "bbq.storage_specs_cutout_width",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Drawers",
        key: "bbq.storage_specs_number_of_drawers",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Number of Doors",
        key: "bbq.storage_specs_number_of_doors",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Orientation",
        key: "bbq.storage_specs_orientation",
        type: "grills",
        value: "",
      },
      {
        label: "Storage Type",
        key: "bbq.brand_storage_specs_type",
        type: "grills",
        value: "",
      },
      {
        label: "Style",
        key: "bbq.heater_specs_mount_type",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Surround Dimension",
        key: "bbq.frplc_spec_sur_dimension",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Thermometer",
        key: "bbq.thermometer",
        type: "grills",
        value: "Analog",
      },
      {
        label: "Total Grill Area",
        key: "bbq.seo_meta_total_grill_area",
        type: "grills",
        value: "1050 Sq. Inches",
      },
      {
        label: "Total Surface BTU",
        key: "bbq.total_surface_btu",
        type: "grills",
        value: 72000,
      },
      {
        label: "Type",
        key: "bbq.heater_specs_type",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Vent Type",
        key: "bbq.frplc_spec_vent_type",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Venting",
        key: "bbq.ref_specs_vent_type",
        type: "refrigerators",
        value: "",
      },
      {
        label: "Viewing Area",
        key: "bbq.frplc_spec_view_area",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Voltage",
        key: "bbq.frplc_spec_voltage",
        type: "fireplaces",
        value: "",
      },
      {
        label: "Voltage",
        key: "bbq.heater_specs_volts",
        type: "patio heaters",
        value: "",
      },
      {
        label: "Watts",
        key: "bbq.heater_specs_watts",
        type: "patio heaters",
        value: "",
      },
      {
        label: "WIFI/Bluetooth Enabled",
        key: "bbq.grill_specs_controller",
        type: "grills",
        value: "",
      },
      {
        label: "Wine Bottle Capacity",
        key: "bbq.ref_specs_wine_bottle_capacity",
        type: "refrigerators",
        value: "",
      },
    ],
    product_manuals: [
      {
        label: "Blaze Cutout Specifications [Click to download]",
        value:
          "https://cdn.accentuate.io/7825463738625/-1671630088252/Blaze-Cutout-Specifications-v1672696677474.pdf",
      },
      {
        label: "Blaze Professional Grill Use & Care Guide [Click to download]",
        value:
          "https://cdn.accentuate.io/7825463738625/-1671630088252/Blaze-Professional-Grill-Use--Care-Guide-v1672696726355.pdf",
      },
    ],
    product_shipping_info: [
      {
        key: "bbq.shipping_weight",
        label: "Shipping Weight",
        value: 275,
      },
      {
        key: "bbq.shipping_dimensions",
        label: "Shipping Dimensions (WxDxH)",
        value: "40 x 48 x 25",
      },
    ],
    quantity: 2,
  },
];

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const cart_channel = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const GUEST_ABANDON_TIMEOUT = 60 * 1000 * 5; // 5 minutes
  const USER_ABANDON_TIMEOUT = 60 * 60 * 1000 * 24; // 24 hours

  const {
    loading,
    isLoggedIn,
    user,
    userCartGet,
    userCartCreate,
    userCartUpdate,
    userCartClose,
  } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartStorage, setCartStorage] = useState(null);
  const [forage, setForage] = useState(null);
  const [loadingCartItems, setLoadingCartItems] = useState(true);
  const [addedToCart, setAddedToCart] = useState(null);

  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [guestEmailTrigger, setGuestEmailTrigger] = useState(0);
  const [abandonedCartUser, setAbandonedCartUser] = useState(null);

  // for stale value
  const cartRef = useRef(cart);
  const userRef = useRef(abandonedCartUser);
  const isSendingAbandonedCart = useRef(false); // prevents concurrent API calls
  const beaconSent = useRef(false);             // prevents double beacon on unload+visibilitychange

  const guestCartToActive = async () => {
    if (!forage) {
      // console.log("[forage]", forage);
    }
    const guestCart = await forage.getItem("cart");
    // console.log("guestCart", guestCart);
    await forage.setItem("cart", { ...guestCart, status: "active" });
  };

  const notifyCartUpdate = (cartData = null) => {
    if (!cart_channel.current) return;

    cart_channel.current.postMessage({
      type: "CART_UPDATED",
      payload: cartData, // optional: send the updated cart
    });

    // console.log("[CartContext] Broadcasted CART_UPDATED");
  };

  const sendAbandonedCartBeacon = (cart) => {
    if (
      typeof navigator === "undefined" || // prevent SSR crash
      !cart ||
      !Array.isArray(cart.items) ||
      cart.items.length === 0
    ) {
      return;
    }

    const url = "/api/abandoned-carts/create";
    const body = JSON.stringify(cart);

    const blob = new Blob([body], { type: "application/json" });

    // console.log("SEND BEACON", { url, body });

    navigator.sendBeacon(url, blob);
  };

  const updateRedisAbandonedRecord = async (key, value) => {
    const response = await redisSet({ key, value });
    if (!response?.ok) {
      console.warn("[updateRedisAbandonedRecord]", { key, value });
    }
  };

  const getRedisAbandonedRecord = async (key) => {
    const response = await redisGet(key);
    if (!response?.ok) {
      console.warn("[getRedisAbandonedRecord]", key);
    }
    const val = await response.json();
    return val;
  };

  const createAbandonedCart = async (cart_obj, user_obj, trigger = "timed") => {
    if (isSendingAbandonedCart.current) return;
    isSendingAbandonedCart.current = true;

    try {

    if (loading) return;

    if (!cart_obj && !cart_obj?.id) return;

    if (!user_obj?.billing_email || !user_obj?.shipping_email) return;

    const cart_items = cart_obj?.items ?? [];

    if (cart_items.length === 0) return;

    if (cart_obj?.is_abandoned) {
      // console.log("cart is_abandoned is ", cart_obj.is_abandoned);
      return;
    }

    const updatedAt = new Date(cart_obj.updated_at).getTime();

    const ABANDON_TIMEOUT = isLoggedIn
      ? USER_ABANDON_TIMEOUT
      : GUEST_ABANDON_TIMEOUT;

    const timedout = Date.now() - updatedAt > ABANDON_TIMEOUT;

    const sendCart = {
      ...cart_obj,
      abandoned_cart_id: cart_obj?.cart_id,
      items: mapOrderItems(cart_items),
      ...user_obj,
    };

    // console.log("TRIGGERED ABANDONED CART BUT THIS FEATURE IS TEMPORARY DISABLED");
    // console.log("[createAbandonedCart]", sendCart);

    const now = new Date().toISOString();

    if (trigger === "beacon" && !isLoggedIn) {
      // console.log("TRIGGERED ABANDONED CART BEACON", sendCart);
      const newCart = { ...cart_obj, is_abandoned: now, updated_at: now };
      const key = `abandoned:${newCart?.cart_id}`;
      await updateRedisAbandonedRecord(key, newCart?.is_abandoned);
      await saveCart(newCart);
      setCart({ ...newCart });
      sendAbandonedCartBeacon(sendCart);
      return;
    }

    let response = null;

    if (trigger === "timed") {
      // console.log("TRIGGERED ABANDONED CART TIMED [timedout]", timedout);
      if (timedout) {
        response = await sendAbandonedCart(sendCart);
      }
    }

    if (trigger === "forced") {
      // console.log("TRIGGERED ABANDONED CART FORCED", response);
      response = await sendAbandonedCart(sendCart);
    }

    if (!response) return;

    const { success, data } = await response.json();

    if (success) {
      const newCart = { ...cart, is_abandoned: now, updated_at: now };
      const key = `abandoned:${newCart?.cart_id}`;
      await updateRedisAbandonedRecord(key, newCart?.is_abandoned);
      await saveCart(newCart);
      setCart({ ...newCart });
    }

    if (data?.code === "DUPLICATE_CART_ID") {
      const newCart = { ...cart };
      const key = `abandoned:${newCart?.cart_id}`;
      await updateRedisAbandonedRecord(key, newCart?.is_abandoned);
    }

    } finally {
      isSendingAbandonedCart.current = false;
    }
  };

  async function syncCartToCookie(items) {
    try {
      Cookies.set(
        "cart",
        JSON.stringify(items.map(({ product_id }) => product_id)),
        {
          path: "/",
          sameSite: "lax",
        },
      );
      // Verify
      // const cart_check = JSON.parse(Cookies.get("cart") || "[]");
      // console.log("[Cookie check]", cart_check);
    } catch (error) {
      console.log("[SYNC CART TO COOKIE]", error);
    }
  }

  const buildCartObject = async (cartObject) => {
    if (!cartObject) return null;
    if (!cartObject?.items) return null;
    const items = cartObject?.items;
    syncCartToCookie(items);
    const { data } = await fetchOrderTotal({ items });
    // console.log("[buildCartObject]", data);
    const rebuild = {
      ...cartObject,
      sub_total: data?.sub_total,
      total_tax: data?.total_tax,
      total_shipping: data?.total_shipping,
      total_price: data?.total_price,
    };
    // setCart(rebuild);
    // console.log("REBUILD", rebuild);

    return rebuild;
  };

  const userProfileToCart = (user = {}) => {
    return {
      billing_address: user?.profile?.billing_address,
      billing_city: user?.profile?.billing_city,
      billing_country: user?.profile?.billing_country,
      billing_email: user?.email,
      billing_first_name: user?.first_name,
      billing_last_name: user?.last_name,
      billing_phone: user?.profile?.phone,
      billing_province: user?.profile?.billing_state,
      billing_zip_code: user?.profile?.billing_zip,
      shipping_address: user?.profile?.shipping_address,
      shipping_city: user?.profile?.shipping_city,
      shipping_country: user?.profile?.shipping_country,
      shipping_email: user?.email,
      shipping_first_name: user?.first_name,
      shipping_last_name: user?.last_name,
      shipping_phone: user?.profile?.phone,
      shipping_province: user?.profile?.shipping_state,
      shipping_zip_code: user?.profile?.shipping_zip,
    };
  };

  function getUserAgent() {
    if (typeof navigator !== "undefined") {
      return navigator.userAgent;
    }
    return null; // SSR-safe
  }

  function createCartId() {
    if (typeof window === "undefined") return null;
    return crypto.randomUUID();
  }

  function createOrderNumber() {
    const date = new Date();
    const y = date.getFullYear().toString().slice(-2);
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    const rand = Math.floor(Math.random() * 9000) + 1000; // 4-digit random
    return `SF-${y}${m}${d}${h}${min}${s}-${rand}`;
  }

  const createCartObj = async () => {
    const now = new Date().toISOString();
    const id = createCartId();
    return {
      id: id,
      cart_id: id,
      reference_number: createOrderNumber(),
      session_id: await getOrCreateSessionId(),
      user_agent: getUserAgent(),
      store_domain: store_domain,
      items: [],
      created_at: now,
      updated_at: now,
      status: "active",
      is_abandoned: null,
    };
  };

  const mergeUserCartItems = async () => {
    if (!user) {
      return;
    }

    const guestCart = await getGuestCart();

    const toMerge = (guestCart?.items ?? [])
      .filter((i) => !i?.merged)
      .map((item) => ({ ...item, ...item?.custom_fields }));

    const getCart = await userCartGet();
    const userCart = getCart?.message
      ? null
      : {
          ...getCart,
          items: (getCart?.items || []).map((item) => ({
            ...item,
            ...(item?.custom_fields || {}),
          })),
        };

    if (toMerge.length === 0) {
      return {
        ...userCart,
        reference_number: userCart?.reference_number ?? createOrderNumber(),
      };
    }

    let newCart;

    if (userCart) {
      newCart = {
        ...userCart,
        items: [...(userCart.items ?? []), ...toMerge],
        updated_at: new Date().toISOString(),
        reference_number: userCart?.reference_number ?? createOrderNumber(),
      };
    } else {
      newCart = await createCartObj();
      newCart = {
        ...newCart,
        items: [...toMerge],
        reference_number: createOrderNumber(),
      };
      const user_profile = userProfileToCart(user);
      newCart = await userCartCreate({ ...newCart, ...user_profile });
    }

    let saved = null;
    const user_cart_items = userCart?.items || [];
    if (user_cart_items.length > 0) {
      saved = await userCartUpdate(newCart);
    } else {
      const user_profile = userProfileToCart(user);
      saved = await userCartCreate({ ...newCart, ...user_profile });
    }

    if (saved) {
      await cartStorage.saveCart({
        ...guestCart,
        items: (guestCart.items ?? []).map((item) => ({
          ...item,
          merged: true,
        })),
      });
    }

    return { ...newCart };
  };

  const getGuestCart = async () => {
    const guest_cart = await cartStorage.getCart();
    if (!guest_cart) return null;
    const is_abandoned = await getRedisAbandonedRecord(
      `abandoned:${guest_cart?.id}`,
    );
    const _cart = {
      ...guest_cart,
      cart_id: guest_cart?.id,
      is_abandoned,
    };
    return _cart;
  };

  const getUserCart = async () => {
    return await mergeUserCartItems();
  };

  const getCart = async () => {
    if (cartStorage && !loading) {
      if (isLoggedIn && user) {
        return await getUserCart();
      } else {
        return await getGuestCart();
      }
    }
  };

  // load cart to state
  const loadCart = useCallback(async () => {
    if (cartStorage && !loading) {
      setLoadingCartItems(true);
      const loadedCart = await getCart();
      // console.log("[RELOAD CART]", loadedCart);
      const items = loadedCart?.items || [];
      setCart(loadedCart);
      syncCartToCookie(items);
      createAbandonedCart(loadedCart, abandonedCartUser, "timed"); // timed
      setLoadingCartItems(false);
    }
  }, [
    cartStorage,
    loading,
    user,
    abandonedCartUser,
    getCart,
    syncCartToCookie,
    createAbandonedCart,
  ]);

  const saveCart = async (newCart) => {
    if (isLoggedIn && user && user?.email) {
      await userCartUpdate(newCart);
    } else {
      await cartStorage.saveCart(newCart);
    }
  };

  const getOrCreateCart = async () => {
    return (await getCart()) ?? (await createCartObj());
  };

  const appendToMergeItems = (cart_items, new_item) => {
    if (!new_item || !new_item?.product_id || !new_item?.quantity) {
      console.log(
        "Invalid item passed to appendToMergeItems. Returning original cart.",
      );
      return cart_items;
    }

    const existingItemIndex = cart_items.findIndex(
      (item) => item.product_id === new_item.product_id,
    );
    if (existingItemIndex > -1) {
      const newCart = [...cart_items];
      newCart[existingItemIndex].quantity += new_item.quantity;
      newCart[existingItemIndex].custom_fields.quantity += new_item.quantity;
      return newCart;
    } else {
      const product_object = {
        product_id: new_item?.product_id,
        quantity: new_item?.quantity,
        handle: new_item?.handle,
        brand: new_item?.brand,
        title: new_item?.title,
        product_title: new_item?.title,
        product_link: `${store_domain}/${createSlug(new_item?.brand)}/product/${
          new_item?.handle
        }`,
        images: new_item?.images,
        ratings: new_item?.ratings,
        variants: new_item?.variants,
      };
      return [
        ...cart_items,
        {
          ...product_object,
          variant_data: new_item?.variants?.[0],
          custom_fields: product_object,
        },
      ];
    }
  };

  const appendMultipleToMergeItems = (cart_items, new_items) => {
    if (!Array.isArray(new_items) || new_items.length === 0) {
      console.log(
        "Invalid items array passed to appendMultipleToMergeItems. Returning original cart.",
      );
      return cart_items;
    }

    let updatedCart = [...cart_items];

    new_items.forEach((new_item) => {
      if (!new_item || !new_item?.product_id || !new_item?.quantity) {
        console.log("Skipping invalid item:", new_item);
        return;
      }

      const existingItemIndex = updatedCart.findIndex(
        (item) => item.product_id === new_item.product_id,
      );

      if (existingItemIndex > -1) {
        updatedCart[existingItemIndex].quantity += new_item.quantity;
        updatedCart[existingItemIndex].custom_fields.quantity +=
          new_item.quantity;
      } else {
        const product_object = {
          product_id: new_item?.product_id,
          quantity: new_item?.quantity,
          handle: new_item?.handle,
          brand: new_item?.brand,
          title: new_item?.title,
          product_title: new_item?.title,
          product_link: `${store_domain}/${createSlug(
            new_item?.brand,
          )}/product/${new_item?.handle}`,
          images: new_item?.images,
          ratings: new_item?.ratings,
          variants: new_item?.variants,
        };
        updatedCart.push({
          ...product_object,
          variant_data: new_item?.variants?.[0],
          custom_fields: product_object,
        });
      }
    });

    return updatedCart;
  };

  const updateAbandonedCartObj = async (newCart) => {
    if (!loading && !isLoggedIn) {
      const new_cart_id = createCartId();
      return {
        ...newCart,
        is_abandoned: null,
        id: new_cart_id,
        cart_id: new_cart_id,
        reference_number: !isLoggedIn
          ? createOrderNumber()
          : newCart?.reference_number,
      };
    } else if (!loading && isLoggedIn) {
      // close old cart and create new Cart with the updated Items
      const user_profile = userProfileToCart(user);
      const { cart_id, id, ...sendCart } = newCart;
      const newUserCart = await userCartCreate({
        ...sendCart,
        ...user_profile,
      });
      return newUserCart;
    }
  };

  const addToCart = async (item) => {
    setAddToCartLoading(true);
    try {
      const cartObj = await getOrCreateCart();
      // console.log("cartObj", cartObj);
      const cart_items = cartObj?.items || [];
      const injected_item = appendToMergeItems(cart_items, item);
      let newCart = await buildCartObject({
        ...cartObj,
        items: injected_item,
        updated_at: new Date().toISOString(),
      });

      if (newCart?.is_abandoned) {
        newCart = await updateAbandonedCartObj(newCart);
      }

      if (cart_items.length === 0 && isLoggedIn) {
        const user_profile = userProfileToCart(user);
        await userCartCreate({ ...newCart, ...user_profile });
      } else {
        // update cart
        await saveCart(newCart);
      }

      const assignCart = await getCart();
      setCart({ ...assignCart });

      notifyCartUpdate();
      setAddToCartLoading(false);
      setAddedToCart(item);
      if (!isLoggedIn && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("guestEmailRequired"));
      }
      return {
        code: 200,
        status: "success",
        message: "Successfully added items to cart.",
      };
    } catch (error) {
      return {
        code: 500,
        status: "error",
        message: "Error added items to cart.",
      };
    }
  };

  const addItemsToCart = async (items) => {
    setAddToCartLoading(true);
    try {
      if (!Array.isArray(items) || items.length === 0) {
        setAddToCartLoading(false);
        return {
          code: 400,
          status: "error",
          message: "Invalid items array. Must be a non-empty array.",
        };
      }

      const cartObj = await getOrCreateCart();
      const cart_items = cartObj?.items || [];
      const injected_items = appendMultipleToMergeItems(cart_items, items);
      let newCart = await buildCartObject({
        ...cartObj,
        items: injected_items,
        updated_at: new Date().toISOString(),
      });

      if (newCart?.is_abandoned) {
        newCart = await updateAbandonedCartObj(newCart);
      }

      if (cart_items.length === 0 && isLoggedIn) {
        const user_profile = userProfileToCart(user);
        await userCartCreate({ ...newCart, ...user_profile });
      } else {
        // update cart
        await saveCart(newCart);
      }

      const assignCart = await getCart();
      setCart({ ...assignCart });

      notifyCartUpdate();
      setAddToCartLoading(false);
      setAddedToCart(items);
      setGuestEmailTrigger((prev) => prev + 1);
      return {
        code: 200,
        status: "success",
        message: `Successfully added ${items.length} items to cart.`,
      };
    } catch (error) {
      setAddToCartLoading(false);
      return {
        code: 500,
        status: "error",
        message: "Error adding items to cart.",
      };
    }
  };

  const removeCartItem = async (item) => {
    const cartObj = await getCart();
    if (!cartObj) return;

    const updatedItems = (cartObj.items ?? []).filter(
      (i) => i?.product_id !== item?.product_id,
    );

    let newCart = await buildCartObject({
      ...cartObj,
      items: updatedItems,
      updated_at: new Date().toISOString(),
    });

    if (newCart?.is_abandoned) {
      newCart = await updateAbandonedCartObj(newCart);
    }

    if (newCart?.items.length === 0 && isLoggedIn) {
      await userCartClose();
    } else {
      await saveCart(newCart);
    }

    const assignCart = await getCart();
    setCart({ ...assignCart });
    notifyCartUpdate();
  };

  const increaseProductQuantity = async (item) => {
    const cartObj = await getCart();
    const cart_items = cartObj?.items || [];
    if (!cartObj) return;
    const product_id = item?.product_id;
    if (!product_id) return;

    const updatedItems = updateQuantity(cart_items, item?.product_id, "+");
    let newCart = await buildCartObject({
      ...cartObj,
      items: updatedItems,
      updated_at: new Date().toISOString(),
    });

    if (newCart?.is_abandoned) {
      newCart = await updateAbandonedCartObj(newCart);
    }

    const assignCart = await getCart();
    // console.log("[inc] assignCart", assignCart)
    setCart({ ...assignCart });
    await saveCart(newCart);
    notifyCartUpdate();
  };

  function updateQuantity(cart_items, product_id, action) {
    return cart_items
      .map((item) => {
        if (item.product_id === product_id) {
          const updated_quantity =
            action === "+" ? item.quantity + 1 : item.quantity - 1;

          return {
            ...item,
            quantity: updated_quantity,
            custom_fields: {
              ...item.custom_fields,
              quantity: updated_quantity,
            },
          };
        }
        return item;
      })
      .filter((item) => item.quantity > 0); // remove if quantity <= 0
  }

  const decreaseProductQuantity = async (item) => {
    const cartObj = await getCart();
    if (!cartObj) return;
    const items = cartObj.items ?? [];
    const product_id = item?.product_id;

    if (!product_id) {
      return;
    }

    // Find the index of the first matching item
    const indexToRemove = items.findIndex((i) => i?.product_id === product_id);

    if (
      indexToRemove !== -1 &&
      items.find((i) => i?.product_id === product_id)?.quantity > 1
    ) {
      const updatedItems = updateQuantity(items, product_id, "-");
      let newCart = await buildCartObject({
        ...cartObj,
        items: updatedItems,
        updated_at: new Date().toISOString(),
      });

      if (newCart?.is_abandoned) {
        newCart = await updateAbandonedCartObj(newCart);
      }

      const assignCart = await getCart();
      // console.log("[dec] assignCart", assignCart)
      setCart({ ...assignCart });
      await saveCart(newCart);
      notifyCartUpdate();
    }
  };

  const clearCartItems = async () => {
    if (isLoggedIn && user) {
      await userCartClose();
    } else {
      await saveCart(null);
    }
    syncCartToCookie([]);
    notifyCartUpdate();
  };

  const handleCloseAddedToCart = () => {
    setAddedToCart(null);
  };

  const fetchOrderTotal = async (orderData) => {
    try {
      const response = await fetch("/api/orders/get-total", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Frontend Fetch Error:", error);
      return { success: false, message: error.message };
    }
  };

  const loadGuestInfo = async () => {
    if (!forage) {
      // console.log("forage", forage);
      return;
    }
    const info = await forage.getItem("checkout_info");
    const tmp = {
      billing_address: info?.billing_address || "NA",
      billing_city: info?.billing_city || "NA",
      billing_country: info?.billing_country || "NA",
      billing_email: info?.billing_email || null,
      billing_first_name: info?.billing_first_name || "NA",
      billing_last_name: info?.billing_last_name || "NA",
      billing_province: info?.billing_province || "NA",
      billing_zip_code: info?.billing_zip_code || "NA",
      shipping_address: info?.shipping_address || "NA",
      shipping_city: info?.shipping_city || "NA",
      shipping_country: info?.shipping_country || "NA",
      shipping_email: info?.shipping_email || null,
      shipping_first_name: info?.shipping_first_name || "NA",
      shipping_last_name: info?.shipping_last_name || "NA",
      shipping_province: info?.shipping_province || "NA",
      shipping_zip_code: info?.shipping_zip_code || "NA",
    };
    setAbandonedCartUser(tmp);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;

    import("@/app/lib/cartStorage").then(async (module) => {
      if (!mounted) return;
      setCartStorage(module);
    });

    import("@/app/lib/localForage").then(async (module) => {
      if (!mounted) return;
      setForage(module);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!cartStorage) return;

    if (!loading && user) {
      const { email, first_name, last_name, profile = {} } = user || {};

      const {
        billing_address = "NA",
        billing_city = "NA",
        billing_country = "NA",
        billing_state = "NA",
        billing_zip = "NA",
        shipping_address = "NA",
        shipping_city = "NA",
        shipping_country = "NA",
        shipping_state = "NA",
        shipping_zip = "NA",
      } = profile;

      setAbandonedCartUser({
        billing_address,
        billing_city,
        billing_country,
        billing_email: email,
        billing_first_name: first_name || "NA",
        billing_last_name: last_name || "NA",
        billing_province: billing_state,
        billing_zip_code: billing_zip,
        shipping_address,
        shipping_city,
        shipping_country,
        shipping_email: email,
        shipping_first_name: first_name || "NA",
        shipping_last_name: last_name || "NA",
        shipping_province: shipping_state,
        shipping_zip_code: shipping_zip,
      });
    } else if (!loading && !user) {
      loadGuestInfo();
    }

    loadCart();
  }, [cartStorage, loading, isLoggedIn, user, forage]);

  const cartItems = useMemo(() => {
    if (!cart) return [];

    return cart?.items || [];
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    if (!cartItems) return 0;

    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cartItems]);

  // useEffect(() => {
  //   console.log("[CART]", cart);
  // }, [cart]);

  useEffect(() => {
    cart_channel.current = new BroadcastChannel("cart_channel");

    cart_channel.current.onmessage = (event) => {
      // console.log("[CartContext] Message received:", event.data);
      loadCart();
    };

    return () => {
      cart_channel.current?.close();
    };
  }, [loadCart]);

  useEffect(() => {
    cartRef.current = cart;
    userRef.current = abandonedCartUser;
  }, [cart, abandonedCartUser]);

  useEffect(() => {
    if (!cart || !abandonedCartUser) return;

    const sendBeaconOnce = () => {
      if (beaconSent.current) return;
      beaconSent.current = true;
      createAbandonedCart(cartRef.current, userRef.current, "beacon");
    };

    const handleUnload = () => sendBeaconOnce();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendBeaconOnce();
      } else {
        // tab became visible again — allow future beacon if user leaves again
        beaconSent.current = false;
      }
    };

    let activityDebounce;
    const handleEvent = () => {
      clearTimeout(activityDebounce);
      activityDebounce = setTimeout(() => {
        createAbandonedCart(cartRef.current, userRef.current, "timed");
      }, 2000);
    };

    const activityEvents = ["click", "keydown", "scroll"];
    activityEvents.forEach((evt) =>
      document.addEventListener(evt, handleEvent),
    );

    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(activityDebounce);
      activityEvents.forEach((evt) =>
        document.removeEventListener(evt, handleEvent),
      );
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [cart, abandonedCartUser, createAbandonedCart]);

  // useEffect(() => {
  //   if (!cart || !abandonedCartUser) return;

  //   const handleUnload = async () => {
  //     // console.log("AbandonedCart Event Unload");
  //     await createAbandonedCart(cart, abandonedCartUser, "beacon");
  //   };

  //   const handleVisibilityChange = async () => {
  //     // console.log("AbandonedCart Event Visibility Hidden");
  //     if (document.visibilityState === "hidden") {
  //       await createAbandonedCart(cart, abandonedCartUser, "beacon");
  //     }
  //   };

  //   const handleEvent = async () => {
  //     // console.log("AbandonedCart Event click, keydown and scroll");
  //     await createAbandonedCart(cart, abandonedCartUser, "timed");
  //   };

  //   const activityEvents = ["click", "keydown", "scroll"];

  //   activityEvents.forEach((evt) => {
  //     document.addEventListener(evt, handleEvent);
  //   });

  //   window.addEventListener("beforeunload", handleUnload);
  //   document.addEventListener("visibilitychange", handleVisibilityChange);

  //   return () => {
  //     activityEvents.forEach((evt) => {
  //       document.removeEventListener(evt, handleEvent);
  //     });
  //     window.removeEventListener("beforeunload", handleUnload);
  //     document.removeEventListener("visibilitychange", handleVisibilityChange);
  //   };
  // }, [cart, abandonedCartUser, createAbandonedCart]);

  return (
    <CartContext.Provider
      value={{
        cartObject: cart,
        cartItems,
        cartItemsCount,
        loadingCartItems,
        addToCart,
        addItemsToCart,
        clearCartItems,
        createAbandonedCart,
        decreaseProductQuantity,
        fetchOrderTotal,
        increaseProductQuantity,
        mergeUserCartItems,
        removeCartItem,
        loadCart,
        addToCartLoading,
        abandonedCartUser,

        // dev functions
        guestCartToActive,
      }}
    >
      {children}
      <AddedToCartDialog data={addedToCart} onClose={handleCloseAddedToCart} />
      <GuestEmailDialog />
    </CartContext.Provider>
  );
};
