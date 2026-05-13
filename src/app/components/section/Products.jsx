"use client";

import { useState, useEffect } from "react";
import useFetchProducts from "@/app/hooks/useFetchProducts";
import useESFetchProducts from "@/app/hooks/useESFetchProducts";
import TuiFilterSort from "@/app/components/template/tui_filter_sort";
import {
  getCategoryIds,
  filter_price_range,
} from "@/app/lib/helpers";
import { bc_categories, flatCategories } from "@/app/lib/category-helpers";
import { useMediaQuery } from "react-responsive";
import { useSearchParams } from "next/navigation";
import {useFilter} from "@/app/context/filter";
import { useSolanaCategories } from "@/app/context/category";
const bccat_json = bc_categories;
const init_sort = "total_sold:desc"
const ProductsSection = ({ category, keyword }) => {
  const {solana_categories} = useSolanaCategories();
  const flattenCategories = (categories) => {
    let result = [];
  
    const traverse = (items, parent = null) => {
      items.forEach((item) => {
        const { children, ...categoryData } = item;
        result.push({ ...categoryData, parent });
  
        if (children && children.length > 0) {
          traverse(children, categoryData.url); // Keep track of parent URL if needed
        }
      });
    };
  
    traverse(categories);
    return result;
  };

  // console.log("solana_categories", solana_categories);
  // console.log("flattened solana_categories", flattenCategories(solana_categories));
  // console.log("bccat_json", bccat_json)
  // console.log("category_ids", getCategoryIds(
  //   category,
  //   flattenCategories(solana_categories),
  //   bccat_json
  // ).join(","));
  const {filters, initFilters} = useFilter();
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const searchParams = useSearchParams();
  const [onloadParams, setOnloadParams] = useState(() => {
    const params = {
      page: 1,
      limit: isMobile ? 4 : 10,
      "categories": getCategoryIds(
        category,
        flattenCategories(solana_categories),
        bccat_json
      ).join(","),
      sort: init_sort
    };
    // handle params for price range
    const priceParams = searchParams.get("price");
    if (priceParams && priceParams.split("-").length === 2) {
      // check if price range values are valid
      const tmp = priceParams.split("-");
      if (
        filter_price_range.filter(
          (i) => i.min === parseInt(tmp[0]) && i.max === parseInt(tmp[1])
        ).length > 0
      ) {
        params["price:min"] = tmp[0];
        params["price:max"] = tmp[1];
      }
    }
    return params;
  });

  const [productsParams, setProductsParams] = useState(onloadParams);

  useEffect(()=>{
    if(category==="search"){
      setProductsParams(prev=>{
        return {...prev, q:keyword}
      })
    }
  },[category, keyword])

  
  const {
    products,
    loading: products_loading,
    filters:es_filters,
    pagination,
    noResult,
    error: products_error,
    refetch: productsRefetch,
  } = useESFetchProducts(productsParams);

  useEffect(() => {
    const limit = isMobile ? 4 : 10;
    setProductsParams((prev) => {
      const updateParams = {
        ...prev,
        limit: limit,
      };
      return updateParams;
    });
  }, [isMobile]);

  useEffect(() => {
    productsRefetch(productsParams);
  }, [productsParams, productsRefetch]);

  const handleSortChange = (option) => {
    
    setProductsParams((prev) => {
      const updateParams = {
        ...prev,
        sort: `${option.sort}:${option.direction}`,
        page: 1,
      };
      return updateParams;
    });
  };

  const handlePageChange = (page) => {
    setProductsParams((prev) => {
      const updateParams = {
        ...prev,
        page: page,
      };
      return updateParams;
    });
  };

  const handleFilterChange = (e) => {
    // console.log("handleFilterChange", e);
    setProductsParams((prev) => {
      // insert root filter on filterArray
      const filtersArray = [
        e.free_shipping,
        ...transformObjectToArray(e),
      ];
      // console.log("onFilterChanges", filtersArray);
      const filterObjParams = prev;
      // -----------------------------------------------------------------
      // free shipping filtering
      const free_shipping_filter = filtersArray.find(
        ({ prop, is_checked }) => prop === "free_shipping" && is_checked
      );
      if (free_shipping_filter) {
        filterObjParams["is_free_shipping"] = 1;
      } else {
        delete filterObjParams["is_free_shipping"];
      }
      // -----------------------------------------------------------------
      // price filtering
      const price_filters = filtersArray.filter(({ prop }) =>
        prop.includes("price:")
      );
      if (price_filters.filter(({ is_checked }) => is_checked).length > 0) {
        // insert price and value to query
        const filtered = price_filters.find(({ is_checked }) => is_checked); // single select only
        const tmp = filtered.prop.split(":");
        // console.log("filtered_price", filtered);
        const [min,max] = tmp[1].split("-");
        filterObjParams["price"] = `${min}-${max}`;
      } else {
        // remove price from query
        // console.log("remove price from request");
        delete filterObjParams["price"];
      }
      // -----------------------------------------------------------------
      // brand filtering
      const brand_filters = filtersArray.filter(({ prop }) =>
        prop.includes("brand:")
      );
      // console.log("brand_filters", brand_filters);
      if (brand_filters.filter(({ is_checked }) => is_checked).length > 0) {
        // insert brand and value to query
        const filtered = brand_filters.filter(({ is_checked }) => is_checked); // multiselect
        filterObjParams["brand_id:in"] = filtered
          .map(({ prop }) => prop.split(":").pop())
          .join(",");
      } else {
        // remove brand from query
        // console.log("remove brand from request");
        delete filterObjParams["brand_id:in"];
      }
      // -----------------------------------------------------------------

      return { ...filterObjParams, page: 1 };
    });
  };

  const transformObjectToArray = (obj) => {
    return Object.values(obj).flatMap((item) => {
      if (item.options) {
        return item.options;
      }
      return item;
    });
  };


  useEffect(()=>{
    initFilters(es_filters, productsParams);
  },[es_filters, productsParams]);

  

  return (
    <div className="w-full">
      <div className="container mx-auto">
        {products && (
          <TuiFilterSort
            category={category}
            products={products}
            loading={products_loading}
            filters={filters}
            noResult={noResult}
            pagination={pagination}
            onSortChange={handleSortChange}
            onPageChange={handlePageChange}
            onFilterChange={handleFilterChange}
          />
        )}
      </div>
    </div>
  );
};

export default ProductsSection;
