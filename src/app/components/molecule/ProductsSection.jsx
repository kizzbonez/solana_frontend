"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSolanaCategories } from "@/app/context/category";
import { useSearch } from "@/app/context/search";
import SPProductCard from "@/app/components/atom/ProductCard";
import {
  InstantSearch,
  Hits,
  RefinementList,
  Pagination,
  CurrentRefinements,
  Configure,
  DynamicWidgets,
  RangeInput,
  useQueryRules,
  SortBy,
  useInstantSearch,
  SearchBox,
} from "react-instantsearch";
import Client from "@searchkit/instantsearch-client";
import Link from "next/link";
import Image from "next/image";
import {
  BaseNavKeys,
  ES_INDEX,
  getInitialUiStateFromUrl,
} from "@/app/lib/helpers";
import { priceBucketKeys, getActiveFacets } from "@/app/lib/filter-helper";

import { STORE_CONTACT } from "@/app/lib/store_constants";

const es_index = ES_INDEX;

const searchClient = Client({
  url: `/api/es/searchkit/`,
});

const sortPriceItems = (items) => {
  return [...items].sort(
    (a, b) =>
      priceBucketKeys.indexOf(a.value) - priceBucketKeys.indexOf(b.value),
  );
};

const Panel = ({ header, children }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    // border-gray-200 shadow border
    <div className="panel p-2">
      {/* <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center gap-[20px] justify-between"
      >
        <h5 className=" font-semibold text-[14px] text-stone-800">{header}</h5>
        {expanded ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path fill="currentColor" d="M19 13H5v-2h14z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
          </svg>
        )}
      </button> */}
      <div className={`${expanded ? "" : "hidden"}`}>{children}</div>
    </div>
  );
};

const FilterGroup = ({ header, children }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    // border-gray-200 shadow border
    <div className="panel p-2">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center gap-[20px] justify-between"
      >
        <h5 className=" font-semibold text-[14px] text-stone-800">{header}</h5>
        {expanded ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path fill="currentColor" d="M19 13H5v-2h14z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
          </svg>
        )}
      </button>
      <div className={`${expanded ? "" : "hidden"}`}>{children}</div>
    </div>
  );
};

const QueryRulesBanner = () => {
  const { items } = useQueryRules({});
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="query-rules">
      {items.map((item, index) => (
        <div
          key={`query-rules-${index}-${item.objectID}`}
          className="query-rules__item"
        >
          <a href={item.url}>
            <b className="query-rules__item-title">{item.title}</b>
            <span className="query-rules__item-description">{item.body}</span>
          </a>
        </div>
      ))}
    </div>
  );
};

// Separate component to isolate product count updates from re-render cycles
const ProductCountUpdater = () => {
  const { results } = useInstantSearch();
  const { setSearchPageProductCount } = useSearch();
  const prevCountRef = useRef(null);
  const updateCountRef = useRef(0);

  useEffect(() => {
    const count = results?.nbHits || 0;
    updateCountRef.current++;

    // console.log(
    //   "[ProductCountUpdater] Update #",
    //   updateCountRef.current,
    //   "Count:",
    //   count,
    //   "Prev:",
    //   prevCountRef.current
    // );

    // Only update if count actually changed
    if (prevCountRef.current !== count) {
      prevCountRef.current = count;
      // console.log("[ProductCountUpdater] Setting count to:", count);
      setSearchPageProductCount(count);
    }

    // Alert if too many updates
    if (updateCountRef.current > 50) {
      console.error(
        "[ProductCountUpdater] TOO MANY UPDATES! Something is causing a loop.",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results?.nbHits]); // setSearchPageProductCount is stable from context

  return null;
};

const InnerUI = ({ category, page_details, onDataLoaded }) => {
  const { status, results } = useInstantSearch();
  const [loadHint, setLoadHint] = useState("");
  const [firstLoad, setFirstLoad] = useState(true);
  const hasLoadedResults = useRef(false);

  useEffect(() => {
    setLoadHint((prev) => {
      let result = prev;
      if (prev === "" && status === "loading") {
        result = "loading";
      }
      if (prev === "loading" && status === "idle") {
        result = "loading-idle";
      }
      return result;
    });
  }, [status]);

  useEffect(() => {
    const result = ["loading"].includes(loadHint);
    setFirstLoad(result);
    onDataLoaded(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadHint]); // onDataLoaded is stable from parent

  // Track when we've actually received results
  useEffect(() => {
    if (results && results.nbHits !== undefined) {
      hasLoadedResults.current = true;
    }
  }, [results]);

  const filters = getActiveFacets(page_details?.filter_type);

  // Only show "No Results" if we're done loading AND have received results AND count is 0
  const shouldShowNoResults =
    !firstLoad &&
    hasLoadedResults.current &&
    results?.nbHits === 0 &&
    status !== "loading";

  if (shouldShowNoResults) {
    return (
      <div className="container">
        <div className="flex items-center justify-between mb-5">
          <h1 className="uppercase text-lg font-bold">{`${page_details?.name} ${
            results?.nbHits && `(${results?.nbHits})`
          }`}</h1>
        </div>
        <div className="pb-[100px] flex justify-center text-neutral-600 font-bold text-lg">
          No Results Found...
        </div>
      </div>
    );
  }

  if (!firstLoad) {
    return (
      <div className="container">
        <div className="flex items-center justify-between mb-5">
          <h1 className="uppercase text-lg font-bold">{`${page_details?.name} ${
            results?.nbHits && `(${results?.nbHits})`
          }`}</h1>
          <SortBy
            items={[
              { label: "Most Popular", value: `${es_index}_popular` },
              { label: "Newest", value: `${es_index}_newest` },
              { label: "Price: Low to High", value: `${es_index}_price_asc` },
              { label: "Price: High to Low", value: `${es_index}_price_desc` },
            ]}
          />
        </div>
        <div className="search-panel flex pb-[50px]">
          <div className="search-panel__filters  pfd-filter-section">
            {page_details &&
              page_details?.nav_type === "custom_page" &&
              page_details?.nav_type !== "brand" &&
              page_details?.name !== "Search" && (
                <DynamicWidgets facets={["*"]}>
                  {filters
                    .filter(
                      (item) =>
                        !["price", "price_groups"].includes(item?.attribute),
                    )
                    .map((item) => (
                      <div
                        key={`filter-item-${item?.attribute}`}
                        className={`facet-wrapper my-1 facet_${item?.attribute}`}
                      >
                        <FilterGroup header={item?.label}>
                          {item?.attribute && (
                            <>
                              {item?.attribute !== "ratings" ? (
                                <RefinementList
                                  attribute={item?.attribute}
                                  searchable={item?.searchable}
                                  {...(item?.transform
                                    ? { transformItems: item.transform }
                                    : {})}
                                  showMore={item?.collapse ?? true}
                                />
                              ) : (
                                <RefinementList
                                  attribute={item?.attribute}
                                  searchable={item?.searchable}
                                  classNames={{ labelText: "stars" }}
                                  showMore={item?.collapse || false}
                                />
                              )}
                            </>
                          )}
                        </FilterGroup>
                      </div>
                    ))}

                  <div>
                    <FilterGroup header={"Price"}>
                      <RefinementList
                        attribute={"price_groups"}
                        searchable={false}
                        showMore={false}
                        transformItems={sortPriceItems}
                      />
                    </FilterGroup>
                  </div>
                  <div>
                    <Panel>
                      <RangeInput attribute="price" />
                    </Panel>
                  </div>
                </DynamicWidgets>
              )}

            {((page_details && page_details?.nav_type === "brand") ||
              page_details?.name === "Search") && (
              <DynamicWidgets facets={["*"]}>
                {filters.map((item) => (
                  <div
                    key={`filter-item-${item?.attribute}`}
                    className={`my-1 facet_${item?.attribute}`}
                  >
                    <Panel header={item?.label}>
                      {item?.attribute && item?.attribute !== "price" ? (
                        <>
                          {item?.attribute !== "ratings" ? (
                            <RefinementList
                              attribute={item?.attribute}
                              searchable={item?.searchable}
                              showMore={item?.collapse || true}
                            />
                          ) : (
                            <RefinementList
                              attribute={item?.attribute}
                              searchable={item?.searchable}
                              classNames={{ labelText: "stars" }}
                              showMore={item?.collapse || true}
                            />
                          )}
                        </>
                      ) : (
                        <RangeInput attribute="price" />
                      )}
                    </Panel>
                  </div>
                ))}
              </DynamicWidgets>
            )}

            <div className="relative lg:w-[240px] h-[360px]">
              <Link
                href={`tel:${page_details?.contact_number || STORE_CONTACT}`}
                prefetch={false}
                className=""
              >
                <Image
                  src="/images/banner/sub-banner-image.webp"
                  alt={`Sub Banner Image`}
                  className="object-contain"
                  layout="fill"
                  objectFit="contain"
                  objectPosition="center"
                  sizes="100vw"
                />
              </Link>
            </div>
          </div>
          <div className="search-panel__results pfd-product-section">
            <CurrentRefinements />
            <QueryRulesBanner />

            <Hits
              hitComponent={(props) => (
                <SPProductCard {...props} page_details={page_details} />
              )}
            />
            <Pagination />
          </div>
        </div>
      </div>
    );
  }
};

// desktop skeleton loader
const SkeletonLoader = () => {
  return (
    <div className="container">
      <div className="flex items-center justify-between mb-5">
        <div className="h-[28px] w-[150px] rounded bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 bg-[length:200%_100%] animate-pulse"></div>
        <div className="h-[28px] w-[200px] rounded  bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 bg-[length:200%_100%] animate-pulse"></div>
      </div>
      <div className="search-panel flex pb-[50px]">
        <div className="search-panel__filters  pfd-filter-section pr-[10px]">
          <div className="my-5">
            <div className="my-3 h-[23px] w-[130px] rounded bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 bg-[length:200%_100%] animate-pulse"></div>
            <div className="h-[35px] w-full rounded bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 bg-[length:200%_100%] animate-pulse"></div>
            <div className="mt-[3px]">
              <ul className="flex flex-col gap-[2px]">
                {Array.from({ length: 6 }).map((_, index) => (
                  <li
                    key={`checkbox-loader-list-${index}`}
                    className="border-b border-neutral-200 w-full h-[25px] flex items-center"
                  >
                    <div className="w-[16px] h-[16px] bg-neutral-200"></div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="my-3 h-[23px] w-[130px] bg-neutral-200 rounded  bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 bg-[length:200%_100%] animate-pulse"></div>
            <div className="flex justify-between">
              <div className="h-[23px] w-[75px] bg-neutral-200 rounded bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 bg-[length:200%_100%] animate-pulse"></div>
              <div className="h-[23px] w-[75px] bg-neutral-200 rounded bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 bg-[length:200%_100%] animate-pulse"></div>
              <div className="h-[23px] w-[30px] bg-neutral-200 rounded bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 bg-[length:200%_100%] animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="search-panel__results pfd-product-section">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 30 }).map((_, index) => (
              <div
                key={`product-loader-card-${index}`}
                className="bg-neutral-100 w-full h-[400px] rounded"
              />
            ))}
          </div>
          <div className="flex gap-[20px] mt-[20px]">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`pagination-loader-btn-${index}`}
                className="bg-neutral-200 w-[40px] h-[30px] rounded bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 bg-[length:200%_100%] animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Refresh = ({ search }) => {
  const { refresh, setUiState } = useInstantSearch();
  const prevSearchRef = useRef(null); // Start with null to allow initial load
  const hasInitialized = useRef(false);

  useEffect(() => {
    // On initial mount, always set the query (handles URL params on page load)
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      if (search) {
        console.log("[Refresh] Initial load with query:", search);
        prevSearchRef.current = search;
        setUiState((prev) => ({
          ...prev,
          [es_index]: {
            ...prev[es_index],
            query: search,
          },
        }));
        refresh();
      }
      return;
    }

    // After initial mount, only update if search actually changed
    if (prevSearchRef.current === search) return;

    console.log(
      "[Refresh] Search changed from",
      prevSearchRef.current,
      "to",
      search,
    );
    prevSearchRef.current = search;

    setUiState((prev) => ({
      ...prev,
      [es_index]: {
        ...prev[es_index],
        query: search,
      },
    }));
    refresh();
  }, [search, setUiState, refresh]);

  return null;
};

export function URLHandler() {
  const { results, indexUiState, setUiState } = useInstantSearch();
  const isSearchPage =
    typeof window !== "undefined" && window.location.pathname === "/search";

  function deleteParamsWithPrefix(prefix, params) {
    const keysToDelete = [];
    for (const [key] of params.entries()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => params.delete(key));
    return params;
  }

  function setParams(type, value, params) {
    if (type === "filter") {
      const keys = Object.keys(value);
      params = deleteParamsWithPrefix("filter:", params);
      keys.forEach((v, i) => {
        params.set(`filter:${v}`, value?.[v]);
      });
    }

    if (type === "range") {
      const keys = Object.keys(value);
      params = deleteParamsWithPrefix("range:", params);
      keys.forEach((v, i) => {
        params.set(`range:${v}`, value?.[v]);
      });
    }

    if (type === "sort" && value) {
      const sort_val = value.replace(`${es_index}_`, "");
      params.set(`sort`, sort_val);
    }

    if (type === "page" && value) {
      params.set("page", value);
    }

    return params;
  }

  useEffect(() => {
    // Don't run URLHandler on /search page - let search context handle URL
    // if (isSearchPage) {
    //   console.log(
    //     "[URLHandler] Skipping - on /search page, search context handles URL"
    //   );
    //   return;
    // }

    if (results) {
      let url = new URL(window.location.href);
      const { refinementList, sortBy, range, page } = indexUiState;
      let params = url.searchParams;

      if (refinementList) {
        params = setParams("filter", refinementList, params);
      } else {
        params = deleteParamsWithPrefix("filter:", params);
      }

      if (range) {
        params = setParams("range", range, params);
      } else {
        params = deleteParamsWithPrefix("range:", params);
      }

      if (sortBy) {
        params = setParams("sort", sortBy, params);
      } else {
        params = deleteParamsWithPrefix("sort", params);
      }

      if (page) {
        params = setParams("page", page, params);
      } else {
        params = deleteParamsWithPrefix("page", params);
      }

      const stringParams = params.toString();
      const newUrl = `${url.origin}${url.pathname}${
        stringParams ? `?${stringParams}` : ""
      }`;
      // console.log("[URLHandler] Updating URL:", newUrl);
      window.history.pushState({}, "", newUrl);
    }
  }, [indexUiState, results, isSearchPage]);

  return null;
}

function ProductsSection({ category, search = "" }) {
  // search is assigned only on search page
  const url = typeof window !== "undefined" ? window.location.href : null;
  const { flatCategories } = useSolanaCategories();
  const [pageDetails, setPageDetails] = useState(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const [filterString, setFilterString] = useState("");

  useEffect(() => {
    if (category) {
      const details = flatCategories.find(({ url }) => url === category);
      if (details) {
        setPageDetails(details);

        // Calculate filter string
        let result = "";
        if (details?.nav_type === "category") {
          result = `page_category:${details?.origin_name}${":" + details.filter_type}`;
        } else if (details?.nav_type === "brand") {
          result = `page_brand:${details?.origin_name}${":" + details.filter_type}`;
        } else if (details?.nav_type === "custom_page") {
          if (details?.name === "Search") {
            result = `custom_page:Search:Search`;
          } else {
            const page_name = details?.name;
            if (BaseNavKeys.includes(page_name)) {
              result = `custom_page:${page_name}:${details.filter_type}`;
            } else {
              result = `custom_page:${
                details?.collection_display?.name || "NA"
              }:${details.filter_type}`;
            }
          }
        }

        console.log("filterString", result);
        console.log("page collection", details?.collection_display?.name || "NA");

        // Only update if value changed (prevents unnecessary re-renders)
        setFilterString((prev) => (prev !== result ? result : prev));
      } else {
        setPageDetails(null);
        setFilterString((prev) => (prev !== "" ? "" : prev));
      }
    }
  }, [category, flatCategories]);

  const initialUiState = getInitialUiStateFromUrl(url);

  return (
    <>
      <div className={`container mx-auto ${firstLoad ? "" : "hidden"}`}>
        <div className="mt-5">
          <SkeletonLoader />
        </div>
      </div>
      <div className="container mx-auto">
        <div className="mt-5">
          <InstantSearch
            indexName={es_index}
            searchClient={searchClient}
            initialUiState={initialUiState}
            future={{
              preserveSharedStateOnUnmount: true,
            }}
          >
            <URLHandler />
            <ProductCountUpdater />
            <SearchBox className="hidden-main-search-input hidden" />
            <Refresh search={search} />
            {/* <HitsPerPage /> */}
            {filterString ? (
              <Configure hitsPerPage={30} filter={filterString} />
            ) : (
              <Configure hitsPerPage={30} />
            )}
            {/*  hack to make initialUiState work*/}
            <Pagination className="hidden" />
            <SortBy
              className="hidden"
              items={[
                { label: "Most Popular", value: `${es_index}_popular` },
                { label: "Newest", value: `${es_index}_newest` },
                { label: "Price: Low to High", value: `${es_index}_price_asc` },
                {
                  label: "Price: High to Low",
                  value: `${es_index}_price_desc`,
                },
              ]}
            />
            {/* Refinement List Hack for URL-Based Filter */}
            <RefinementList attribute="ref_depth" className="hidden" />
            <RefinementList attribute="ways_to_shop" className="hidden" />
            <RefinementList attribute="ratings" className="hidden" />
            <RefinementList attribute="brand" className="hidden" />
            <RefinementList attribute="product_category" className="hidden" />
            <RefinementList attribute="features_fuel_type" className="hidden" />
            <RefinementList attribute="features_type" className="hidden" />
            <RefinementList attribute="features_inches" className="hidden" />
            <RefinementList
              attribute="features_mounting_type"
              className="hidden"
            />
            <RefinementList
              attribute="features_vent_option"
              className="hidden"
            />
            <RefinementList attribute="features_color" className="hidden" />
            <RefinementList
              attribute="features_recess_option"
              className="hidden"
            />
            <RefinementList attribute="features_model" className="hidden" />
            <RefinementList
              attribute="features_valve_line_location"
              className="hidden"
            />
            <RefinementList attribute="features_fuel_type" className="hidden" />
            <RefinementList
              attribute="features_mounting_type"
              className="hidden"
            />
            <RefinementList
              attribute="features_heating_elements"
              className="hidden"
            />
            <RefinementList attribute="features_finish" className="hidden" />
            <RefinementList attribute="collections" className="hidden" />
            <RefinementList attribute="configuration_type" className="hidden" />
            <RefinementList attribute="no_of_burners" className="hidden" />
            <RefinementList attribute="grill_lights" className="hidden" />
            <RefinementList attribute="ref_door_type" className="hidden" />
            <RefinementList attribute="capacity" className="hidden" />
            <RefinementList attribute="ref_mounting_type" className="hidden" />
            <RefinementList attribute="ref_ice_cube_type" className="hidden" />
            <RefinementList
              attribute="ref_outdoor_certification"
              className="hidden"
            />
            <RefinementList attribute="ref_class" className="hidden" />
            <RefinementList
              attribute="ref_ice_daily_output"
              className="hidden"
            />
            <RefinementList attribute="ref_config" className="hidden" />
            <RefinementList attribute="ref_drain_type" className="hidden" />
            <RefinementList attribute="ref_no_of_zones" className="hidden" />
            <RefinementList attribute="ref_vent" className="hidden" />
            <RefinementList attribute="ref_hinge" className="hidden" />
            <RefinementList attribute="ref_storage_type" className="hidden" />
            <RefinementList attribute="ref_width" className="hidden" />
            <RefinementList attribute="ref_height" className="hidden" />
            <RefinementList attribute="size" className="hidden" />
            <RefinementList attribute="width" className="hidden" />
            <RefinementList attribute="depth" className="hidden" />
            <RefinementList attribute="height" className="hidden" />
            <RefinementList
              attribute="rear_infrared_burner"
              className="hidden"
            />
            <RefinementList attribute="cut_out_width" className="hidden" />
            <RefinementList attribute="cut_out_depth" className="hidden" />
            <RefinementList attribute="cut_out_height" className="hidden" />
            <RefinementList attribute="made_in_usa" className="hidden" />
            <RefinementList
              attribute="storage_mounting_type"
              className="hidden"
            />
            <RefinementList
              attribute="storage_no_of_drawers"
              className="hidden"
            />
            <RefinementList
              attribute="storage_no_of_doors"
              className="hidden"
            />
            <RefinementList
              attribute="storage_orientation"
              className="hidden"
            />
            <RefinementList attribute="material" className="hidden" />
            <RefinementList attribute="thermometer" className="hidden" />
            <RefinementList attribute="rotisserie_kit" className="hidden" />
            <RefinementList attribute="gas_type" className="hidden" />
            <InnerUI
              category={category}
              page_details={pageDetails}
              onDataLoaded={setFirstLoad}
            />
          </InstantSearch>
        </div>
      </div>
    </>
  );
}

export default ProductsSection;
