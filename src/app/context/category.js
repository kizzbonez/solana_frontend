"use client";
import { createContext, useContext, useMemo } from "react";
import {
  BASE_URL,
  hasCommonValue,
  BaseNavObj,
  BaseNavKeys,
} from "@/app/lib/helpers";
import { usePathname } from "next/navigation";
const CategoriesContext = createContext([]);

export function CategoriesProvider({ categories, children }) {
  const pathName = usePathname();

  /**
   * Recursively flattens a nested category tree into a single-level array.
   *
   * @param {Array} categories - An array of category objects. Each category may contain a `children` array with nested categories.
   * @param {Array} [flatArray=[]] - (Optional) The accumulator array used to collect flattened categories during recursion.
   *
   * @returns {Array} - A flat array containing all categories from the nested structure.
   */
  const flattenCategories = (categories, flatArray = []) => {
    categories.forEach((category) => {
      flatArray.push(category);
      if (category.children && category.children.length > 0) {
        flattenCategories(category.children, flatArray);
      }
    });

    return flatArray;
  };

  /**
   * Determines whether the price of a product should be visible based on its category and brand.
   *
   * @param {Array} product_category - An array of objects representing the product's categories.
   *        Each object is expected to have a `category_name` property.
   * @param {string} product_brand - The brand of the product.
   *
   * @returns {boolean} - Returns `true` if the product belongs to a category or has a brand
   *        that matches any in the globally defined `flatCategories` list with `price_visibility` set to "show";
   *        otherwise, returns `false`.
   */
  const isPriceVisible = (product_category, product_brand) => {
    if (!product_category || !product_brand) {
      return false;
    }

    let visible = false;

    const visible_price_categories = flatCategories
      .filter(({ name }) => !["Home", "Search"].includes(name))
      .filter(({ price_visibility }) => price_visibility === "show");

    const product_category_array = product_category
      .map(({ category_name }) => category_name)
      .filter(Boolean);

    const flat_categories_array = visible_price_categories
      .map(({ key }) => key)
      .filter(Boolean);

    const page_pathname = pathName;

    const visible_price_categories_urls = visible_price_categories
      .map(({ url }) => url)
      .filter(Boolean);

    if (hasCommonValue(flat_categories_array, product_category_array)) {
      visible = true;
    }

    if (flat_categories_array.includes(product_brand)) {
      visible = true;
    }

    // hide and show price by custom_page
    if (visible_price_categories_urls.includes(page_pathname)) {
      visible = true;
    }

    return visible;
  };

  /**
   * Retrieves a list of valid category names for a given product, excluding "Home" and "Search".
   *
   * @param {Array} product_category - An array of product category objects, each containing a `category_name` property.
   *
   * @returns {Array} - An array of category names from `solana_categories` that match the product's categories
   *                    based on `origin_name`, excluding "Home" and "Search".
   */
  const getProductCategories = (product_category) => {
    if (!product_category) {
      return [];
    }

    const category_scope = solana_categories.filter(
      ({ name }) => !["Home", "Search"].includes(name)
    );

    return category_scope
      .filter((menuItem) =>
        product_category.some(
          (category) => category.category_name === menuItem.origin_name
        )
      )
      .map((menuItem) => menuItem.name);
  };

  const getProductCategoriesV2 = (product) => {
    if (!product || !collectionsByCategory) return [];

    // Get all collection names associated with this product
    const productCollectionNames = (product?.collections || []).map(
      (c) => c.name
    );

    const matchedCategories = [];

    collectionsByCategory.forEach((catObj) => {
      const hasMatch = (catObj?.collections || []).some((colName) =>
        productCollectionNames.includes(colName)
      );

      if (hasMatch) {
        matchedCategories.push(catObj.category_name);
      }
    });

    return [...new Set(matchedCategories)];
  };
  const getProductUrls = (product_category, product_brand, handle) => {
    if (!product_brand || !handle) return [];

    const tmp_category = product_category || [];
    const valid_categories = flatCategories.filter(
      ({ name }) => !["Home", "Search"].includes(name)
    );

    const product_categories_brand = [
      ...new Set([
        ...tmp_category.map(({ category_name }) => category_name),
        product_brand,
      ]),
    ].filter(Boolean);

    const valid_product_categories = valid_categories.filter(
      ({ origin_name }) => product_categories_brand.includes(origin_name)
    );

    const result =
      valid_product_categories.length > 0
        ? valid_product_categories.map(({ url }) => `/${url}/product/${handle}`)
        : [];
    return result;
  };

  const getProductUrl = (hit) => {
    if (!hit) {
      // console.error("[Product Url Error] hit undefined");
      return "#";
    }

    const pathname = pathName;
    const product_urls = getProductUrls(
      hit?.product_category,
      hit?.brand,
      hit?.handle
    );

    if (product_urls.length === 0) {
      // console.log("[Product Url Error] product urls length is 0", hit?.handle);
      return "#";
    }

    // const menu_item = flatCategories.find(({url})=> url === pathname);
    // if(menu_item?.nav_type === "custom_page"){
    //   return product_urls[0];
    // }

    return (
      product_urls.find((item) => item.includes(pathname + "/")) ||
      product_urls[0]
    );
  };

  const getNameBySlug = (slug) => {
    return flatCategories.find(({ url }) => slug === url)?.name || "";
  };

  const getPopularSearchUrl = (query) => {
    console.log("query", query);
    const category_url = flatCategories.find(
      ({ name }) => name.toLowerCase() === query.toLowerCase()
    );
    return category_url?.url
      ? `${BASE_URL}/${category_url?.url}`
      : `${BASE_URL}/search?query=${query}`;
  };

  const solana_categories = useMemo(() => {
    return categories.map((item) => ({ ...item }));
  }, [categories]);

  const flatCategories = useMemo(() => {
    const _flatCategories = flattenCategories(categories);
    return _flatCategories || [];
  }, [categories]);

  const collectionsByCategory = useMemo(() => {
    const mapped = flatCategories
      .filter(({ name }) => !["Home", "Search"].includes(name))
      .filter((item) => !!item?.collection_display)
      .map(({ name, collection_display, nav_type }) => {
        const collections =
          nav_type === "brand" ? [name] : [collection_display?.name];
        return {
          category_name: name,
          collections,
        };
      });

    const baseNavItems = Object.entries(BaseNavObj).map(([key, value]) => ({
      category_name: key,
      collections: value,
    }));

    const result = [...baseNavItems, ...mapped];
    console.log("processed category", result);
    return result;
  }, [flatCategories]);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        solana_categories,
        flatCategories,
        isPriceVisible,
        getNameBySlug,
        getPopularSearchUrl,
        getProductUrl,
        getProductUrls,
        getProductCategories,
        getProductCategoriesV2,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useSolanaCategories() {
  return useContext(CategoriesContext);
}
