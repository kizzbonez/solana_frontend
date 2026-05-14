import { STORE_CONTACT } from "@/app/lib/store_constants";

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_BASE_URL;
export const UIV2 = process.env.NEXT_PUBLIC_UIV2;
export const store_domain = process.env.NEXT_PUBLIC_STORE_DOMAIN;

// export const ES_INDEX = "solana_updated_product_index_flat";
// export const ES_INDEX = "solana_suggest_v2"; // did_you_mean
// export const ES_INDEX = "solana_suggest_v3"; // autocomplete sku
export const ES_INDEX = "solana_updated_product_index";

// Keywords that trigger main product priority sorting
export const MAIN_PRODUCT_KEYWORDS = [
  "blaze",
  "bull",
  "twin",
  "twin eagles",
  "eloquence",
  "napoleon",
  "fire magic",
];

// Helper to check if search query exactly matches any main product keywords
export const shouldApplyMainProductSort = (query) => {
  if (!query) return false;
  const lowerQuery = query.toLowerCase().trim();
  return MAIN_PRODUCT_KEYWORDS.some(
    (keyword) => lowerQuery === keyword.toLowerCase(),
  );
};

export function parseRatingCount(value) {
  if (typeof value === "string") {
    value = value.replace(/[^\d]/g, "");
  }
  const count = parseInt(value, 10);
  return isNaN(count) ? 0 : count;
}

export function updateOrderValues(items, startAt = 1) {
  return items.map((item, index) => ({
    ...item,
    order: startAt + index,
  }));
}

export function areAllKeysEmpty(obj, keys) {
  return keys.every((key) => !obj[key] || obj[key] === "");
}

export function getSum(array, prop) {
  return array.reduce((sum, item) => sum + item?.[prop], 0);
}

export const onsale_category_ids = [294, 360, 361, 362, 363, 364, 365];
export const filter_price_range = [
  { label: "$1 - $99", min: 1, max: 99 },
  { label: "$100 - $499", min: 100, max: 499 },
  { label: "$500 - $999", min: 500, max: 999 },
  { label: "$1000 - $2499", min: 1000, max: 2499 },
  { label: "$2500 - $4999", min: 2500, max: 4999 },
  { label: "$5000 and UP", min: 5000, max: 100000 },
];

export function createSlug(string, separator = "-") {
  return string
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and") // 👈 Convert ampersand to 'and'
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`\\${separator}+`, "g"), separator)
    .replace(new RegExp(`^${separator}|${separator}$`, "g"), ""); // Trim leading/trailing separators
}

export function getFirstPathSegment(pathname) {
  // Remove leading slash , split by "/", and return the first segment
  return pathname.replace(/^\/+/, "").split("/")[0] || "";
}

export function getCategoryIds(category_slug, categories, bc_categories) {
  const category_keywords = categories.find(
    (i) => i.url === (category_slug === "all-products" ? "" : category_slug),
  )?.key_words;
  // console.log("category_keywords",category_keywords)
  // console.log("Array.isArray(category_keywords)",Array.isArray(category_keywords))

  if (Array.isArray(category_keywords)) {
    const ids =
      category_keywords.length > 0
        ? bc_categories
            .filter((i) =>
              category_keywords.some((keyword) =>
                i?.url?.path.includes(keyword),
              ),
            )
            .map((i) => i.category_id)
        : [];
    return ids;
  } else {
    // console.log(
    //   "lib/helpers.js fn(getCategoryIds):ERROR -> Make sure that key_words property and value are provided in app/data/category.json"
    // );
    return [];
  }
}

export function hasCommonValue(array1, array2) {
  return array1.some((value) => array2.includes(value));
}


export function getCategoryNameById(id, bc_categories) {
  return bc_categories.find(({ category_id }) => category_id === id)?.name;
}

export function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "decimal", // Use 'currency' for currency formatting
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function getPageData(pathname, categories) {
  // console.log("lib/helper.js fn(getPageData):params->pathname", pathname);
  // console.log("lib/helper.js fn(getPageData):params->categories", categories);
  if (pathname === "") {
    const home = categories.find(({ name }) => name === "Home");
    return home;
  }

  return categories.find(({ url }) => url === pathname);
}

export function findParentByUrl(categories, url) {
  // console.log("categories", categories);
  // console.log("url", url);
  // Helper function to recursively search children up to the 3rd level
  function search(children, parent, level = 1) {
    if (level > 3) return null; // Stop searching beyond the 3rd level

    for (const child of children) {
      if (child.url === url) {
        return parent; // Return the parent if a match is found
      }
      if (child.children && child.children.length > 0) {
        const result = search(child.children, child, level + 1);
        if (result) {
          return result; // If a match is found deeper, return it
        }
      }
    }

    return null; // No match found
  }

  // Start searching from the top-level categories
  for (const category of categories) {
    const result = search(category.children || [], category, 1);
    if (result) {
      const result2 = categories.find(({ url }) => url === result.url);
      if (result2) {
        return result2;
      } else {
        return findParentByUrl(categories, result?.url);
      }
    }
  }

  return null; // Return null if no match is found
}

export function isProductOnSale(categories) {
  return categories.filter((i) => onsale_category_ids.includes(i)).length > 0;
}

export const generateId = () => {
  return Math.random().toString(36).substring(2, 11);
};

export const stripHtmlTags = (html) => {
  if (typeof document !== "undefined") {
    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.innerText || tempDiv.textContent;
  }
  return html.replace(/<[^>]+>/g, ""); // Fallback for SSR
};

/**
 * Flattens a nested menu tree into a single-level array,
 * removing the `children` property and preserving the rest of the item data.
 *
 * @param {Array} tree - The nested menu tree, where each item may have a `children` array.
 * @returns {Array} A flat array containing all menu items from all levels of the tree.
 *
 * Example:
 * const flatMenu = flattenNavTree(menuTree);
 */
export const flattenNavTree = (tree) => {
  let result = [];

  function traverse(nodeArray) {
    for (const node of nodeArray) {
      // Destructure without children
      const { children, ...rest } = node;
      result.push(rest);

      if (children && children.length > 0) {
        traverse(children); // Recurse on children
      }
    }
  }

  traverse(tree);
  return result;
};

/**
 * Recursively updates a menu item in a nested tree structure based on its `menu_id`.
 *
 * @param {Array} tree - The array of menu items (can include nested children).
 * @param {number|string} menuId - The ID of the menu item to update.
 * @param {Object} newItem - An object containing the updated properties for the target item.
 * @returns {Array} A new tree with the updated item, preserving structure and immutability.
 *
 * Example:
 * const updatedTree = updateMenuItemById(menuTree, 4, { name: "My Profile" });
 */
export const updateMenuItemById = (tree, menuId, newItem) => {
  return tree.map((item) => {
    if (item.menu_id === menuId) {
      return { ...item, ...newItem }; // Replace or merge properties
    }

    if (item.children) {
      return {
        ...item,
        children: updateMenuItemById(item.children, menuId, newItem),
      };
    }

    return item;
  });
};

export const mapOrderItems = (items) => {
  return items.map((item) => {
    // return if already formatted
    if (item?.product_link && item?.price && item?.quantity && item?.total)
      return { ...item };

    return {
      product_id: item?.product_id,
      product_link: item?.product_link || "",
      price: item?.variants?.[0]?.price,
      quantity: item.quantity,
      total: Number((item?.variants?.[0]?.price * item.quantity).toFixed(2)),
    };
  });
};

export const BaseNavObj = {
  Fireplaces: ["Shop All Outdoor Fireplaces"],
  "Patio Heaters": [
    "Electric Patio Heaters",
    "Gas Patio Heaters",
    "Freestanding Patio Heaters",
  ],
  "Built-In Grills": ["Shop All Built In Grills"],
  "Freestanding Grills": ["Shop All Freestanding Grills"],
  "Open Box": ["Shop All Open Box"],
};

export const BaseNavKeys = Object.keys(BaseNavObj);

// helper object for no. of burners filter
export const burnerBuckets = {
  "1 Burner": ["1", "1 Burner", "one"],
  "2 Burners": ["2", "2 Burner", "two"],
  "3 Burners": ["3", "3 Burner", "three"],
  "4 Burners": ["4", "4 Burner", "four"],
  "5 Burners": ["5", "5 Burners"],
  "6 Burners": ["6", "6 Burners"],
  "7 Burners": ["7", "7 Burners"],
  "8 Burners": ["8", "8 Burners"],
};

export const sizeBuckets = {
  "0-26 Inches": "Small (0 - 26 Inches)",
  "27-33 Inches": "Medium (27 - 33 Inches)",
  "34-42 Inches": "Large (34 - 42 Inches)",
  "43 Inches And Up": "XL (43 Inches And Up)",
};

export const widthBuckets = {
  "Width 0-26 Inches": "Small (0 - 26 Inches)",
  "Width 27-33 Inches": "Medium (27 - 33 Inches)",
  "Width 34-42 Inches": "Large (34 - 42 Inches)",
  "Width 43 Inches and up": "XL (43 Inches And Up)",
};

export const depthBuckets = {
  "Depth 0-26 Inches": "Small (0 - 26 Inches)",
  "Depth 27-33 Inches": "Medium (27 - 33 Inches)",
  "Depth 34-42 Inches": "Large (34 - 42 Inches)",
  "Depth 43 Inches and up": "XL (43 Inches And Up)",
};

export const heightBuckets = {
  "Height 0-26 Inches": "Small (0 - 26 Inches)",
  "Height 27-33 Inches": "Medium (27 - 33 Inches)",
  "Height 34-42 Inches": "Large (34 - 42 Inches)",
  "Height 43 Inches and Up": "XL (43 Inches And Up)",
};

export const capacityBuckets = {
  "1-3 Cu. Ft.": "Small (1 - 3 Cu. Ft.)",
  "4-6 Cu. Ft.": "Medium (4 - 6 Cu. Ft.)",
  "7-10 Cu. Ft.": "Large (7 - 10 Cu. Ft.)",
  "11 Cu. Ft. +": "XL (11 Cu. Ft. and Up)",
};

export const refVentBuckets = {
  "Front Venting": "Front",
  "Rear Venting": "Rear",
};

export const refHingeBuckets = {
  "Left Hinged": "Left",
  "Right Hinged": "Right",
};

export const refOutdoorCertBuckets = {
  CSA: "Canadian Standards Association (CSA)",
  ETL: "Edison Testing Laboratories (ETL)",
  UL: "Underwriters Laboratories (UL)",
  NSF: "NSF Certified",
  "NSF Certified": "NSF Certified",
};

export const refClassBuckets = {
  Luxury: "Luxury",
  Premium: "Premium",
  Standard: "Standard",
};

export const refDailyIceBuckets = {
  "31-40 lbs": "31-40 lbs",
  "41-50 lbs": "41-50 lbs",
  "51-60 lbs": "51-60 lbs",
  "61-70 lbs": "61-70 lbs",
};

export const refConfigBuckets = {
  "Drop In": "Drop In",
  "Roll Out": "Roll Out",
  "Slide In": "Slide In",
};

export const refDrainTypeBuckets = {
  Gravity: "Gravity",
  Pump: "Pump",
};

export const refNoOfZonesBuckets = {
  Single: "Single",
  Dual: "Dual",
};

export const refGlassDoorBuckets = {
  Yes: "Yes",
  No: "No",
};

export const refDimensionGroupBuckets = {
  "Under 14": "Under 14",
  "14-22 Inches": "14 Inches - 22 Inches",
  "22-24 Inches": "22 Inches -  24 Inches",
  "24 and up": "24 Inches And Up",
};

export const sizeBucketKeys = Object.keys(sizeBuckets);
export const widthBucketKeys = Object.keys(widthBuckets);
export const depthBucketKeys = Object.keys(depthBuckets);
export const heightBucketKeys = Object.keys(heightBuckets);
export const capacityBucketKeys = Object.keys(capacityBuckets);
export const refVentBucketKeys = Object.keys(refVentBuckets);
export const refHingeBucketKeys = Object.keys(refHingeBuckets);
export const refOutdoorCertBucketKeys = Object.keys(refOutdoorCertBuckets);
export const refClassBucketKeys = Object.keys(refClassBuckets);
export const refDailyIceBucketKeys = Object.keys(refDailyIceBuckets);
export const refConfigBucketKeys = Object.keys(refConfigBuckets);
export const refDrainTypeBucketKeys = Object.keys(refDrainTypeBuckets);
export const refNoOfZonesBucketKeys = Object.keys(refNoOfZonesBuckets);
export const refGlassDoorBucketKeys = Object.keys(refGlassDoorBuckets);
export const refDimensionGroupBucketKeys = Object.keys(
  refDimensionGroupBuckets,
);

export function capitalizeFirstLetter(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    // accept args
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay); // forward args
  };
}

//  varaible used to exclude products by brand from displaying on the app
export const exclude_brands = ["Cedar Creek Fireplaces", "American Fire Glass"];

//  varaible used to exclude products by collections from displaying on the app
export const exclude_collections = ["Dimplex Fireplace Accessories"];

//  varaible used to sort products up using the collections defined in this array
export const main_products = [
  "Bull Grills",
  "Blaze Grills",
  "American Outdoor Grill (BBQ Grills)",
  "Bonfire Grills",
  "Delta Heat Grills",
  "Sunstone Grills",
  "RCS Grills",
  "Napoleon Grills", // Newly Created Collection
  "Summerset Grills",
  "Twin Eagles Grills",
  "TEC Grills",
  "Lion Grills",
  "Le Griddle Grills",
  "Broilmaster Grills",
  "PGS Grills", // Newly Created Collection
  "MHP Grills",
  "TrueFlame Grills",
  "Sole Gourmet Grills",
  "Fire Magic BBQ Grills",
  "Primo Grills",
  "Infratech Grills",
  "Bromic Heaters",
  "Sunglo Gas Patio Heaters",
  "Sunpak Heaters",
  "OCI Grills",
  "PGL Fire Pit Burners",
  "Brand-Man BBQ Grills",
  "Eloquence Grills",
  "Grandeur Grills",
  "Dimplex Fireplaces",
  "Athena Fire Pit Burners",
  "Athena Fire Pit Tables",
  "Best Sellers for WPPO",
  // "American Fyre Designs Fireplaces",
];

export const isValidPassword = (password) => {
  const hasWhitespace = /\s/;

  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long.",
    };
  }
  if (hasWhitespace.test(password)) {
    return { valid: false, message: "Password cannot contain spaces." };
  }

  return { valid: true, message: "Password is valid." };
};

export const getInitialUiStateFromUrl = (url) => {
  try {
    const searchParams = new URL(url).searchParams;
    const refinementList = {};
    const range = {};
    let sortBy = `${ES_INDEX}_popular`;
    let page = 1;

    for (const key of new Set(searchParams.keys())) {
      if (key.startsWith("filter:")) {
        const attribute = key.replace("filter:", "");
        refinementList[attribute] = searchParams.getAll(key);
      }
      if (key.startsWith("range:")) {
        const attribute = key.replace("range:", "");
        range[attribute] = searchParams.get(key);
      }
      if (key === "sort") {
        sortBy = `${ES_INDEX}_${searchParams.get(key)}`;
      }
      if (key === "page") {
        page = searchParams.get(key);
      }
    }

    const result = {
      [ES_INDEX]: {
        refinementList: Object.keys(refinementList).length
          ? refinementList
          : undefined,
        range: Object.keys(range).length ? range : undefined,
        sortBy: sortBy || undefined,
        page: page || 1,
      },
    };

    return result;
  } catch (err) {
    console.warn("[getInitialUiStateFromUrl] error", err);
  }
};

/**
 * Calculates the overall average rating and the count of reviews by star using reduce.
 *
 * @param {object} reviews - The reviews object, expected to have a 'results' array of review objects.
 * @returns {object|number} The summary object or 0 if no valid reviews are found.
 */
export const calculateRatingSummary = (reviews) => {
  const reviewList = reviews?.results;

  if (!Array.isArray(reviewList) || reviewList.length === 0) {
    return 0;
  }

  // Initialize counts and totals using reduce
  const initialAccumulator = {
    totalScore: 0,
    totalVotes: 0,
    starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  const { totalScore, totalVotes, starCounts } = reviewList.reduce(
    (acc, review) => {
      const rating = review?.rating;

      // Ensure the rating is a valid number between 1 and 5
      if (typeof rating === "number" && rating >= 1 && rating <= 5) {
        acc.totalScore += rating;
        acc.totalVotes += 1;
        acc.starCounts[rating] += 1;
      }
      return acc;
    },
    initialAccumulator,
  );

  // Check if any valid votes were processed
  if (totalVotes === 0) {
    return 0;
  }

  const overallRating = totalScore / totalVotes;

  // Structure the star breakdown data
  const byStar = [
    { name: "highest", star: 5, votes: starCounts[5] },
    { name: "high", star: 4, votes: starCounts[4] },
    { name: "mid", star: 3, votes: starCounts[3] },
    { name: "low", star: 2, votes: starCounts[2] },
    { name: "lowest", star: 1, votes: starCounts[1] },
  ];

  return {
    overall_rating: overallRating.toFixed(1),
    by_star: byStar,
  };
};

export const STAR_FILTERS = {
  5: "★★★★★",
  4: "★★★★☆",
  3: "★★★☆☆",
  2: "★★☆☆☆",
  1: "★☆☆☆☆",
  0: "No Star",
};

export const formatToInches = (items) => {
  return items.map((item) => ({
    ...item,
    label: `${item.value.match(/[\d.]+/)?.[0] || ""} Inches`,
  }));
};

export const decimalToFraction = (decimal) => {
  if (decimal === null || decimal === undefined) return "";

  // 1. Handle whole numbers immediately
  if (decimal % 1 === 0) return decimal.toString();

  const wholeNumber = Math.floor(decimal);

  // 2. Work only with the fractional part
  let fractionalPart = decimal - wholeNumber;

  // 3. Use a fixed precision (e.g., 10^8) to avoid floating point errors
  // instead of trying to count string length
  const precision = 100000000;
  let numerator = Math.round(fractionalPart * precision);
  let denominator = precision;

  // 4. Greatest Common Divisor function (Iterative is safer for JS)
  const gcd = (a, b) => {
    while (b) {
      a %= b;
      [a, b] = [b, a];
    }
    return a;
  };

  const commonDivisor = gcd(numerator, denominator);

  // 5. Simplify
  numerator /= commonDivisor;
  denominator /= commonDivisor;

  // 6. Return formatted string
  return wholeNumber === 0
    ? `${numerator}/${denominator}`
    : `${wholeNumber} ${numerator}/${denominator}`;
};

export const transformNumber = (value) => {
  if (!value) return "";
  const num = Number(value);
  return isNaN(num) ? "" : num;
};

export const transformFilterNumber = (items) => {
  return items.map((item) => ({
    ...item,
    label: transformNumber(item.value),
  }));
};

export const transformNumberBurners = (value) => {
  if (!value) return "";
  const num = Number(value);
  if (isNaN(num)) return "";
  return num + "-Burner";
};

export const transformFilterNumberBurners = (items) => {
  return items.map((item) => ({
    ...item,
    label: transformNumberBurners(item.value),
  }));
};

export const transformNumberDoors = (value) => {
  if (!value) return "";
  const num = Number(value);
  if (isNaN(num)) return "";
  return num + "-Door";
};

export const transformFilterNumberDoors = (items) => {
  return items.map((item) => ({
    ...item,
    label: transformNumberDoors(item.value),
  }));
};

export const transformNumberSize = (value = "") => {
  if (!value) return "";
  return decimalToFraction(Number(value)) + " Inches";
};

export const transformFilterNumberSize = (items) => {
  return items.map((item) => ({
    ...item,
    label: transformNumberSize(item.value),
  }));
};

export const transformNumberDrawers = (value) => {
  if (!value) return "";
  return decimalToFraction(Number(value)) + "-Drawer";
};

export const transformFilterNumberDrawers = (items) => {
  return items.map((item) => ({
    ...item,
    label: transformNumberDrawers(item.value),
  }));
};

export const transformNumberRacks = (value) => {
  if (!value) return "";
  return decimalToFraction(Number(value)) + "-Rack";
};

export const transformFilterNumberRacks = (items) => {
  return items.map((item) => ({
    ...item,
    label: transformNumberRacks(item.value),
  }));
};

export const transformDimension = (value) => {
  if (!value) return "";

  const suf = ["Inches W", "Inches D", "Inches H"];

  const result = String(value)
    .split("x")
    .map((part, index) => {
      const trimmed = part.trim();

      // Handle cases where there might be an extra 'x' or empty space
      if (trimmed === "") return "";

      const fraction = decimalToFraction(trimmed);

      // Only attach a suffix if we have one defined for this index
      const label = suf[index] ? ` ${suf[index]}` : "";

      return `${fraction}${label}`;
    })
    .filter((part) => part !== "") // Remove empty segments
    .join(" x ");

  return result.includes("NaN") ? "" : result;
};

export const transformFilterDimensions = (items) => {
  return items.map((item) => ({
    ...item,
    label: transformDimension(item.value),
  }));
};

export const transformWeight = (value) => {
  if (!value) return "";
  const num = Number(value);
  if (isNaN(num)) return "";
  return `${num} lbs`;
};

export const transformFilterWeight = (items) => {
  return items.map((item) => ({
    ...item,
    label: transformWeight(item?.value),
  }));
};

export const transformGrillArea = (value) => {
  if (!value) return "";
  const num = Number(value);
  if (isNaN(num)) return "";
  return `${num} Sq. Inches`;
};

export const transformFilterGrillArea = (items) => {
  return items.map((item) => ({
    ...item,
    label: transformGrillArea(item?.value),
  }));
};

export const transformYesNo = (items) => {
  const sortKeys = ["Yes", "No"];
  return items.sort((a, b) => {
    return sortKeys.indexOf(a.value) - sortKeys.indexOf(b.value);
  });
};

export function getRootByUrl(data, url) {
  // Helper function to check if an object or any of its nested children match the URL
  const hasMatch = (node, target) => {
    if (node.url === target) return true;
    if (node.children && node.children.length > 0) {
      return node.children.some((child) => hasMatch(child, target));
    }
    return false;
  };

  // Find the top-level object where the URL exists somewhere in its tree
  return data.find((rootItem) => hasMatch(rootItem, url));
}

function getCategoryType(category = "") {
  // used for displaying categories in categories page
  switch (category) {
    case "Grills & Smokers":
    case "Heating & Fire":
    case "Outdoor Kitchen Components":
    case "Outdoor Refrigeration":
      return "outdoor";
    case "Installation & Parts":
    case "Replacement Parts":
      return "technical";
    default:
      return "general";
  }
}

function getCategorySubs(category = "") {
  const subs = {
    "grills-and-smokers": [
      "Gas Grill",
      "Kamado Grill",
      "Charcoal Grill",
      "Flat Top Grill",
      "Pizza Oven",
      "Electric Grill",
      "Wood Grill",
      "Pellet Grill",
      "Pellet Grill/Smoker",
    ],
    "heating-and-fire": [
      "Patio Heater",
      "Fireplace",
      "Firebowl",
      "Fire Pit Table",
      "Firebox",
      "Log Sets",
      "Screens",
    ],
    "outdoor-refrigeration": [
      "Compact Refrigerator",
      "Beverage Cooler",
      "Drawer Refrigerator",
      "Ice Maker",
      "Kegerator",
      "Ice Bin Cooler",
      "Wine Cooler",
      "Freezer",
      "Beverage Center",
      "Outdoor Refrigerator",
      "Beverage Refrigerator",
      "Convertible Refrigerator",
      "Wine Cellar + Kegerator",
    ],
    "installation-and-parts": [
      "Refrigerator Door Sleeve",
      "Trim Kit",
      "Insulating Liner",
      "Insulated Sleeve",
      "Insulated Jacket",
      "Insulating Jacket",
      "Insulation Liner",
      "Zero Clearance Liner",
      "Clearance Liner",
      "Insulated Liner",
      "Liner",
      "Grill Liner",
      "Trim or Surround",
      "Kamado Sleeve",
      "Recess Kit",
      "Mounting Bracket",
      "Tube Suspension Kit",
      "Recess Kit/Replacement Part",
      "Controller/Recess Kit",
      "Vent Cap",
      "Protector Plate",
      "Conversion Kits",
    ],
    "outdoor-kitchen-components": [
      "Grill Center",
      "Modano Island",
      "Storage Drawers",
      "Propane Tank Bin",
      "Storage Drawer",
      "Trash Bin",
      "Paper Towel Dispenser",
      "Access Door",
      "Ice Bin",
      "Door & Drawer Combo",
      "Storage Pantry",
      "Ice Bin and Storage",
      "Ice Bin And Storage",
      "Spice Rack",
      "Outdoor Kitchen Cabinet & Storage",
      "Warming Drawer",
      "Cabinet",
      "Storage Package",
      "Trash Chute",
      "Tank Tables",
    ],
    accessories: [
      "Kegerator Tap Kit",
      "Adaptor",
      "Wind Guard",
      "Accessory",
      "Cart",
      "Grill Handle",
      "Steel Grid Cover",
      "Cart Bracket",
      "Bar Accessory",
      "Extension Hose",
      "GFRC Cover",
      "Fire Bowl Cover",
      "Fire Urn Cover",
    ],
    "replacement-parts": [
      "Ice Maker Water Filter",
      "Water Filtration System",
      "Drain Pump",
      "Replacement Door",
      "Replacement Part",
      "Replacement Part/Controller",
      "Replacement Part/Mesh",
      "Replacement Part/Gas Valve",
      "Replacement Part/Manifold Assembly",
      "Controller",
      "Mesh/Replacement Part",
      "Gas Valve",
      "Gas Valves",
      "Mesh",
      "Manifold Assembly",
      "Tube Element",
      "Control Valve",
      "Pilot Assembly",
    ],
    deals: ["Clearance Sale", "Package Deals", "Open Box"],
  };

  const extracted = subs[createSlug(category)];

  const uniqueSub = [
    ...new Set(
      extracted.flatMap((item) => item.split("/").map((s) => s.trim())),
    ),
  ];
  return uniqueSub;
}

function getCategoryDescription(category = "") {
  const desc = {
    "grills-and-smokers":
      "Premium gas, charcoal, and wood-pellet grills designed for professional-grade backyard searing and smoking.",
    "heating-and-fire":
      "Enhance your outdoor ambiance with high-efficiency fireplaces, fire pits, and patio heaters for year-round warmth.",
    "outdoor-refrigeration":
      "Keep beverages chilled and ingredients fresh with weather-resistant outdoor refrigerators, kegerators, and wine coolers.",
    "installation-and-parts":
      "Essential mounting kits, gas lines, and structural components to ensure a safe and seamless outdoor kitchen setup.",
    "outdoor-kitchen-components":
      "Durable stainless steel storage drawers, access doors, and built-in islands to complete your custom outdoor space.",
    accessories:
      "Must-have BBQ tools, protective covers, and specialized cookware to maximize your outdoor cooking experience.",
    "replacement-parts":
      "OEM burners, igniters, and grates to maintain your equipment and extend the lifespan of your favorite outdoor appliances.",
    deals:
      "Exclusive savings on top-tier outdoor appliances and essential gear to help you build your dream kitchen for less.",
  };

  return desc[createSlug(category)] || "";
}

export function mapCategoryResults(cat) {
  if (!cat) return null;
  const slug = createSlug(cat.key);
  return {
    name: cat.key,
    count: cat.doc_count,
    slug: slug,
    url: `${BASE_URL}/category/${slug}`,
    image: `/images/categories/${slug}.webp`, // insert images which are named base on slug
    type: getCategoryType(cat.key),
    description: getCategoryDescription(cat.key),
    sub: (getCategorySubs(cat.key) || []).join(" · "),
    nav_type: "category1",
  };
}

export function mapBrandResults(brand) {
  if (!brand) return null;
  const slug = createSlug(brand.key);
  return {
    name: brand.key,
    count: brand.doc_count,
    slug: slug,
    url: `${BASE_URL}/${slug}`,
    image: `/images/brand-logo/${slug}.webp`,
  };
}

export function productIsFreeshipping(product_tags) {
  return (product_tags || []).some(
    (tag) => tag?.toLowerCase() === "free shipping",
  );
}

export function productBadge(product_tags = [], product_collections = []) {
  const tags = Array.isArray(product_tags) ? product_tags : [];
  const collections = Array.isArray(product_collections)
    ? product_collections
    : [];

  for (const tag of tags) {
    if (typeof tag !== "string") continue;
    const lowerTag = tag.toLowerCase();

    if (lowerTag.includes("new arrival")) return "new";
    if (lowerTag.includes("sale")) return "sale";
  }

  for (const col of collections) {
    const name = col?.name?.toLowerCase();
    if (!name) continue; // Skip if name is missing

    if (name.includes("best sellers")) return "bestseller";
    if (name.includes("open box")) return "openbox";
  }

  return "";
}

function generateBreadCrumbs(product) {
  if (!product || !product?.brand) return null;

  return [
    { name: "Home", url: BASE_URL },
    { name: product?.brand, url: `${BASE_URL}/${createSlug(product?.brand)}` },
    { name: product?.title || "", url: "#" },
  ];
}

function calculateUpsell(base_price, option_price) {
  if (!base_price || !option_price) return null;
  const fbase_price = parseFloat(base_price);
  const foption_price = parseFloat(option_price);

  if (fbase_price === foption_price)
    return {
      mod: "same",
      value: 0,
    };

  return {
    mod: fbase_price > foption_price ? "add" : "less",
    value: Math.abs(fbase_price - foption_price),
  };
}

function getProductMainImage(images) {
  if (!images && !Array.isArray(images)) return null;
  return images.find(({ position }) => position == 1)?.src || null;
}

function generateProductOptionItem(config, product) {
  if (!config || !product || !product?.accentuate_data || !product?.handle)
    return null;
  const base_product_price = product?.variants?.[0]?.price || 0;
  const ad = product?.accentuate_data;
  const handles = ad?.[config?.urls] || [];
  const prop = ad?.[config?.prop] || [];
  const labels = (ad?.[config?.options] || []).map((i) => i.trim());
  const options = (product?.sp_product_options || [])
    .filter((o) => prop.includes(o?.handle))
    .map((o, i) => ({
      active: o?.handle === product?.handle,
      title: o?.name || o?.title,
      label: labels[i],
      image: getProductMainImage(o?.images || []),
      upsell: calculateUpsell(base_product_price, o?.variants?.[0]?.price || 0),
      url: `${BASE_URL}/${createSlug(o?.brand)}/product/${o?.handle}`,
      data: { ...o },
    }));

  return {
    option_label: ad?.[config?.title],
    options,
  };
}

function generateProductOptions(product) {
  if (!product || !product?.accentuate_data) return null;
  const options_config = [
    {
      prop: "bbq.option_related_product",
      title: "bbq.option_title",
      options: "bbq.option_type",
      urls: "bbq.option_related_product",
    },
    {
      prop: "bbq.configuration_product",
      title: "bbq.configuration_heading_title",
      options: "bbq.configuration_type",
      urls: "bbq.configuration_product",
    },
    {
      prop: "bbq.related_product",
      title: "bbq.size_heading_title",
      options: "size_title",
      urls: "bbq.related_product",
    },
    {
      prop: "bbq.product_option_related_product",
      title: "bbq.product_option_heading_title",
      options: "bbq.product_option_name",
      urls: "bbq.product_option_related_product",
    },
    {
      prop: "bbq.hinge_related_product",
      title: "hinge_heading_title",
      options: "hinge_selection",
      urls: "bbq.hinge_related_product",
    },
  ];
  const options = options_config.map((i) => ({
    ...generateProductOptionItem(i, product),
  }));

  return options.filter(
    (item) => item.option_label !== null && item.handles !== null,
  );
}

export function formatProduct(product, mod = "pdp") {
  if (!product) return null;
  const acc_data = product?.accentuate_data || null;
  const variant = product?.variants?.[0];
  const rating = product?.ratings;
  const price = variant?.price;
  const was = variant?.compare_at_price || 0;
  const save_amt = was ? was - price : 0;
  const save_pct = was > 0 ? Math.round(((was - price) / was) * 100) : 0;
  const category = product?.accentuate_data?.category || "uncategorized";
  const category_url = `${BASE_URL}/category/${createSlug(category)}`;
  const brand_slug = createSlug(product?.brand);
  const brand_url = `${BASE_URL}/${brand_slug}`;
  const brand_image = `/images/brand-logo/${brand_slug}.webp`;
  const main_image = product?.images?.find((i) => i?.position == 1)?.src;
  const secondary_image = product?.images?.find((i) => i?.position == 2)?.src;
  const fallback_image = product?.images?.[0]?.src
  const discount_links = [
    {
      url: `tel:${STORE_CONTACT}`,
      label: "Phone Discounts",
    },
    {
      url: `${BASE_URL}/package-deals`,
      label: "Package Deals",
    },
    {
      url: `${BASE_URL}/open-box`,
      label: "Open Box",
    },
    {
      url: `${BASE_URL}/close-out-deals`,
      label: "Close Out",
    },
    {
      url: `#`,
      label: "Scratch + Dent",
    },
    {
      url: `#`,
      label: "Low Monthly Payments",
    },
    {
      url: `#`,
      label: "Free Accessory Bundle",
    },
  ];

  const formatted_product = {
    ...product,
    name: product?.title,
    image: main_image || secondary_image || fallback_image || null,
    breadcrumbs: generateBreadCrumbs(product),
    brand_image,
    brand_url,
    category,
    category_url,
    sku: variant?.sku || "",
    ratings: rating?.rating || 0,
    reviews: rating?.review_count || 0,
    is_freeshipping: productIsFreeshipping(product?.tags),
    badge: productBadge(product?.tags, product?.collections),
    price: price,
    was: was,
    save_amt,
    save_pct,
    discount_links,
    url: `${BASE_URL}/${createSlug(product?.brand)}/product/${product?.handle}`,
    ships: "Ships Within 1 to 2 Business Days",
  };

  // PDP only properties
  if (mod === "pdp") {
    const product_options = generateProductOptions(product);
    formatted_product["product_options"] = product_options;
    formatted_product["product_specs"] = (
      product?.["product_specs"] || []
    ).filter((i) => i?.value !== "");
    formatted_product["shipping_info"] = [
      {
        label: "Weight",
        value: acc_data ? acc_data?.["bbq.shipping_weight"] ? acc_data?.["bbq.shipping_weight"]+" lbs" : "NA" : "NA",
      },

      {
        label: "Dimensions",
        value: acc_data
          ? formatShippingDimensions(acc_data?.["bbq.shipping_dimensions"]) ||
            "NA"
          : "NA",
      },
      {
        label: "Est. Delivery",
        value: "5–7 Business Days", //static
      },
    ];
  }

  return formatted_product;
}

function formatShippingDimensions(dimensions) {
  if (!dimensions) return "NA";

  return dimensions
    .split("x")
    .map((i) => `${i}"`)
    .join(" x ");
}
