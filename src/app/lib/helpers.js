import brands_json from "@/app/data/filters/brands.json";
import products_json from "@/app/data/filters/products.json";
import popular_keywords_json from "@/app/data/popular_keyword.json";

export const popular_keywords = popular_keywords_json;

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_BASE_URL;
export const store_domain = process.env.NEXT_PUBLIC_STORE_DOMAIN;

// export const ES_INDEX = "solana_updated_product_index_flat";
export const ES_INDEX = "solana_updated_product_index";
// export const ES_INDEX = "solana_suggest_v2"; // did_you_mean
// export const ES_INDEX = "solana_suggest_v3"; // autocomplete sku

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
  // { label: "Request A Quote", min: 0, max: 0 },
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

function hasEqualValue(array1, array2) {
  return array1.some((value) => array2.includes(value));
}

export function hasCommonValue(array1, array2) {
  return array1.some((value) => array2.includes(value));
}

export function getCategoryFilters(active_filters = {}) {
  const active_categories = active_filters?.["categories:in"]
    ? active_filters["categories:in"]
        .split(",")
        .map((value) => parseInt(value, 10))
    : [];

  let productsList = products_json.filter((i) =>
    hasEqualValue(i.categories, active_categories),
  );

  const active_is_free_shipping = active_filters?.["is_free_shipping"];

  const active_brands = active_filters?.["brand_id:in"]
    ? active_filters?.["brand_id:in"]
        .split(",")
        .map((value) => parseInt(value, 10))
    : null;

  const active_price_range =
    active_filters?.["price:min"] && active_filters?.["price:min"]
      ? `price:${active_filters["price:min"]}-${active_filters["price:max"]}`
      : null;

  const brandsList = brands_json;
  // console.log("brands.length", brandsList.length);
  // Step 1: Extract all unique brand IDs from productsList
  const availableBrandIds = [
    ...new Set(productsList.map((product) => product.brand_id)),
  ];

  if (active_brands !== null) {
    productsList = productsList.filter((i) =>
      active_brands.includes(i.brand_id),
    );
  }

  if (active_price_range !== null) {
    productsList = productsList.filter((i) => {
      const tmp = active_price_range.split(":");
      const price = tmp[1].split("-");
      return i.price >= price[0] && i.price <= price[1];
    });
  }
  // test if no active filter return all info
  const filters = {
    onsale: {
      label: "On Sale",
      prop: "onsale",
      count: 0,
      is_checked: false,
      multi: false,
      options: [],
    },
    free_shipping: {
      label: "Free Shipping",
      prop: "free_shipping",
      count: 0,
      is_checked: active_is_free_shipping ? true : false,
      multi: false,
      options: [],
    },
    brand: {
      label: "Brands",
      prop: "brand",
      count: 0,
      is_checked: false,
      multi: true,
      options: brandsList
        .filter((brand) => availableBrandIds.includes(brand.id))
        .map((i) => ({
          ...i,
          label: i.name,
          prop: `brand:${i.id}`,
          count: productsList.filter((i2) => i2.brand_id === i.id).length,
          is_checked: active_brands ? active_brands.includes(i.id) : false,
        }))
        .sort((a, b) => {
          return a.name.localeCompare(b.name);
        }),
    },
    price: {
      label: "Price",
      prop: "price",
      count: 0,
      is_checked: false,
      multi: false,
      options: [
        {
          label: "$1.00 - $99.00",
          prop: "price:1-99",
          count: productsList.filter((i) => i.price > 0 && i.price < 100)
            .length,
          is_checked: active_price_range === "price:1-99",
        },
        {
          label: "$100.00 - $499.00",
          prop: "price:100-499",
          count: productsList.filter((i) => i.price > 99 && i.price < 500)
            .length,
          is_checked: active_price_range === "price:100-499",
        },
        {
          label: "$500.00 - $999.00",
          prop: "price:500-999",
          count: productsList.filter((i) => i.price > 499 && i.price < 1000)
            .length,
          is_checked: active_price_range === "price:500-999",
        },
        {
          label: "$1,000.00 - $2,499.00",
          prop: "price:1000-2499",
          count: productsList.filter((i) => i.price > 999 && i.price < 2500)
            .length,
          is_checked: active_price_range === "price:1000-2499",
        },
        {
          label: "$2,500.00 - $4,999.00",
          prop: "price:2500-4999",
          count: productsList.filter((i) => i.price > 2499 && i.price < 5000)
            .length,
          is_checked: active_price_range === "price:2500-4999",
        },
        {
          label: "$5,000.00 and UP",
          prop: "price:5000-100000",
          count: productsList.filter((i) => i.price > 4999 && i.price < 200000)
            .length,
          is_checked: active_price_range === "price:5000-100000",
        },
      ],
    },
  };

  return filters;
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
};

export const refVentBuckets = {
  "Front Venting": "Front",
  "Rear Venting": "Rear",
};

export const refHingeBuckets = {
  "Left Hinged": "Left",
  "Right Hinged": "Right",
};

export const sizeBucketKeys = Object.keys(sizeBuckets);
export const widthBucketKeys = Object.keys(widthBuckets);
export const depthBucketKeys = Object.keys(depthBuckets);
export const heightBucketKeys = Object.keys(heightBuckets);
export const capacityBucketKeys = Object.keys(capacityBuckets);
export const refVentBucketKeys = Object.keys(refVentBuckets);
export const refHingeBucketKeys = Object.keys(refHingeBuckets);

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

    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("filter:")) {
        const attribute = key.replace("filter:", "");
        refinementList[attribute] = value.split(",");
      }
      if (key.startsWith("range:")) {
        const attribute = key.replace("range:", "");
        range[attribute] = value;
      }
      if (key === "sort") {
        sortBy = `${ES_INDEX}_${value}`;
      }
      if (key === "page") {
        page = value;
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
