"use client";
import "@/app/search.css";
import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useSolanaCategories } from "@/app/context/category";
import { useSearch } from "@/app/context/search";
import { usePathname } from "next/navigation";
import SPProductCard from "@/app/components/new-design/ui/ProductCard";
import ProductsSectionLoader from "@/app/components/new-design/sections/gallery/ProductsSectionLoader";

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
  useStats,
  usePagination,
  useCurrentRefinements,
  useRefinementList,
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
const hitsPerPage = 30;

// Server-side: use absolute URL (window is undefined during SSR/getServerState).
// Client-side: use relative URL (avoids CORS issues and is cleaner).
const searchClient = Client({
  url:
    typeof window === "undefined"
      ? `${process.env.NEXT_PUBLIC_SITE_BASE_URL}/api/es/searchkit`
      : "/api/es/searchkit",
});


// Registers a single attribute with InstantSearch via the hook connector —
// same effect as a hidden <RefinementList> but with no DOM output.
const AttributeConnector = ({ attribute }) => {
  useRefinementList({ attribute });
  return null;
};

// When filterType is provided (from server props), only registers the attributes
// relevant to that page type — reducing widget registration from ~130 down to
// the actual set the page needs. Falls back to all facets when unknown.
// "price" is excluded because it uses RangeInput, not useRefinementList.
const AttributeRegistry = memo(({ filterType }) => {
  const attributes = useMemo(() => {
    const facets = getActiveFacets(filterType);
    return facets
      .filter((f) => f.type !== "RangeInput")
      .map((f) => f.attribute);
  }, [filterType]);

  return (
    <>
      {attributes.map((attr) => (
        <AttributeConnector key={attr} attribute={attr} />
      ))}
    </>
  );
});
AttributeRegistry.displayName = "AttributeRegistry";

// Warms the Redis cache for the next page so pagination feels instant.
// Fires a background fetch after results load — the response is never used
// by the component directly; it just pre-populates the server-side cache.
const PrefetchNextPage = ({ filterString }) => {
  const { results, indexUiState } = useInstantSearch();
  const prefetchedRef = useRef(new Set());

  useEffect(() => {
    if (!results || results.nbHits === 0) return;

    const { page = 0, sortBy } = indexUiState;
    const nextPage = page + 1;
    const totalPages = Math.ceil(results.nbHits / hitsPerPage);

    if (nextPage >= totalPages) return;

    const prefetchKey = `${filterString}:${sortBy ?? ""}:${nextPage}`;
    if (prefetchedRef.current.has(prefetchKey)) return;
    prefetchedRef.current.add(prefetchKey);

    // Build a minimal InstantSearch-compatible request body for page+1.
    // The searchkit client sends an array of request objects.
    const body = [
      {
        indexName: es_index,
        params: {
          hitsPerPage,
          page: nextPage,
          filter: filterString || undefined,
          ...(sortBy ? { sort: sortBy } : {}),
        },
      },
    ];

    fetch("/api/es/searchkit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // Low priority so it doesn't compete with the current page's resources
      priority: "low",
    }).catch(() => {
      // Prefetch failures are silent — it's a best-effort cache warm
    });
  }, [results?.nbPages, indexUiState.page, filterString]);

  return null;
};

const sortPriceItems = (items) =>
  [...items].sort(
    (a, b) =>
      priceBucketKeys.indexOf(a.value) - priceBucketKeys.indexOf(b.value),
  );

// Moved to module scope — no dependency on component state
function findCategory1(categories, category) {
  return categories.find(({ slug }) => slug === category);
}

function DisplayedItems() {
  const { nbHits } = useStats();
  const { currentRefinement } = usePagination();

  const perPage = hitsPerPage;
  const start = nbHits === 0 ? 0 : currentRefinement * perPage + 1;
  const end = Math.min((currentRefinement + 1) * perPage, nbHits);

  if (nbHits === 0) {
    return (
      <p className="text-sm text-neutral-500">
        No products found for this search.
      </p>
    );
  }

  return (
    <p className="text-sm text-neutral-500 dark:text-neutral-400">
      Showing{" "}
      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
        {start}–{end}
      </span>{" "}
      of{" "}
      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
        {nbHits.toLocaleString()} products
      </span>
    </p>
  );
}

const Panel = ({ children }) => {
  return <div className="panel p-2">{children}</div>;
};

// Memoized — only re-renders when the filters array reference changes
const FilterContent = memo(({ filters }) => (
  <>
    <CurrentRefinements />
    <DynamicWidgets facets={["*"]}>
      {filters
        .filter((item) => !["price", "price_groups"].includes(item?.attribute))
        .map((item) => (
          <div
            key={`filter-item-${item?.attribute}`}
            className={`facet-wrapper facet_${item?.attribute}`}
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
  </>
));
FilterContent.displayName = "FilterContent";

const FilterGroup = ({ header, children }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="panel">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center gap-[20px] justify-between px-4 py-2 border-t"
      >
        <h5 className=" font-semibold text-[13px] text-stone-800">{header}</h5>
        {expanded ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            className="text-[#6e6e6e]"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="m7.71 15.71l4.29-4.3l4.29 4.3l1.42-1.42L12 8.59l-5.71 5.7z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            className="text-[#6e6e6e]"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="m12 15.41l5.71-5.7l-1.42-1.42l-4.29 4.3l-4.29-4.3l-1.42 1.42z"
            />
          </svg>
        )}
      </button>
      <div className={`pl-4 py-1 ${expanded ? "" : "hidden"}`}>{children}</div>
    </div>
  );
};

const QueryRulesBanner = () => {
  const { items } = useQueryRules({});
  if (items.length === 0) return null;

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

const ProductCountUpdater = () => {
  const { results } = useInstantSearch();
  const { setSearchPageProductCount } = useSearch();
  const prevCountRef = useRef(null);

  useEffect(() => {
    const count = results?.nbHits || 0;
    if (prevCountRef.current !== count) {
      prevCountRef.current = count;
      setSearchPageProductCount(count);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results?.nbHits]);

  return null;
};

const ScrollOnPaginate = ({ targetRef }) => {
  const { currentRefinement } = usePagination();
  const isReady = useRef(false);
  const currentRef = useRef(currentRefinement);
  const prevRefinement = useRef(null);

  currentRef.current = currentRefinement;

  useEffect(() => {
    const id = setTimeout(() => {
      isReady.current = true;
      prevRefinement.current = currentRef.current;
    }, 300);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!isReady.current || prevRefinement.current === null) return;
    const prev = prevRefinement.current;
    prevRefinement.current = currentRefinement;
    if (prev === currentRefinement) return;
    if (targetRef?.current) {
      const y =
        targetRef.current.getBoundingClientRect().top + window.scrollY - 105;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [currentRefinement]);

  return null;
};

const InnerUI = ({ category, page_details, onDataLoaded, initialHits }) => {
  const { status, results } = useInstantSearch();
  const [loadHint, setLoadHint] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const hasLoadedResults = useRef(false);
  const productSectionRef = useRef(null);
  const pathname = usePathname();
  const isSearchPage = pathname === "/search";
  const { items: activeRefinements } = useCurrentRefinements();
  const activeCount = activeRefinements.reduce(
    (sum, item) => sum + item.refinements.length,
    0,
  );

  // Fixed: removed `loadHint` from deps — it was being set inside the effect,
  // creating a re-run cycle on every state update.
  useEffect(() => {
    if (results?.nbHits > 0) {
      setLoadHint("idle");
      onDataLoaded(true);
    } else {
      setLoadHint("loading-idle");
      onDataLoaded(false);
    }
  }, [status, results?.nbHits, onDataLoaded]);

  useEffect(() => {
    if (results && results.nbHits !== undefined) {
      hasLoadedResults.current = true;
    }
  }, [results]);

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFiltersOpen]);

  // Show the pre-fetched static grid until InstantSearch has its own results.
  // Once live results arrive the swap is invisible — same products, same order.
  const hasLiveResults = results && results.nbHits !== undefined && results.nbHits > 0;
  const showStaticHits = !hasLiveResults && !!initialHits?.length;

  // Memoized so FilterContent doesn't re-render when unrelated state changes
  const filters = useMemo(
    () => getActiveFacets(page_details?.filter_type),
    [page_details?.filter_type],
  );

  // Memoized so Hits doesn't remount all 30 cards on unrelated InnerUI re-renders
  const hitComponent = useCallback(
    (props) => <SPProductCard {...props} page_details={page_details} />,
    [page_details],
  );

  const shouldShowNoResults =
    loadHint === "loading-idle" && results?.nbHits === 0 && status === "idle";

  if (shouldShowNoResults) {
    return (
      <div className="container">
        <div className="pb-[100px] flex justify-center text-neutral-600 font-bold text-lg">
          No Results Found...
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* ── Mobile filter drawer ── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative z-10 w-[300px] max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  Filters
                </span>
                {activeCount > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                aria-label="Close filters"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterContent filters={filters} />
            </div>
            <div className="px-4 py-3 border-t bg-white sticky bottom-0">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="search-panel flex pb-[50px] gap-[20px]">
        {/* Desktop filter sidebar */}
        <div className="search-panel__filters pfd-filter-section relative">
          <div className="border rounded-xl bg-white">
            <div className="text-sm font-semibold p-4">Filters</div>
            <FilterContent filters={filters} />
          </div>
          <div className="relative w-full aspect-w-3 aspect-h-4 mt-2">
            <Link
              href={`tel:${page_details?.contact_number || STORE_CONTACT}`}
              prefetch={false}
            >
              <Image
                src="/images/banner/sub-banner-image.webp"
                alt="Sub Banner Image"
                className="object-contain"
                layout="fill"
                objectFit="contain"
                objectPosition="center"
                sizes="100vw"
              />
            </Link>
          </div>
        </div>

        {/* Products section */}
        <div
          ref={productSectionRef}
          className="search-panel__results pfd-product-section"
        >
          <div className="flex flex-col gap-1.5 md:flex-row md:items-center justify-between mb-5">
            <button
              className="md:hidden flex items-center gap-2 self-start px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-colors"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" d="M3 6h18M7 12h10M11 18h2" />
              </svg>
              Filters
              {activeCount > 0 && (
                <span className="bg-orange-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {activeCount}
                </span>
              )}
            </button>

            {!!isSearchPage && <DisplayedItems />}
            <SortBy
              items={[
                { label: "Most Popular", value: `${es_index}_popular` },
                { label: "Newest", value: `${es_index}_newest` },
                { label: "Price: Low to High", value: `${es_index}_price_asc` },
                { label: "Price: High to Low", value: `${es_index}_price_desc` },
              ]}
            />
          </div>
          <QueryRulesBanner />
          <ScrollOnPaginate targetRef={productSectionRef} />
          {showStaticHits ? (
            <div className="ais-Hits">
              <ol className="ais-Hits-list">
                {initialHits.map((hit) => (
                  <li
                    key={hit.objectID || hit.product_id}
                    className="ais-Hits-item"
                  >
                    <SPProductCard hit={hit} page_details={page_details} />
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <Hits hitComponent={hitComponent} />
          )}
          <Pagination />
        </div>
      </div>
    </div>
  );
};

const Refresh = ({ search }) => {
  const { refresh, setUiState } = useInstantSearch();
  const prevSearchRef = useRef(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      if (search) {
        prevSearchRef.current = search;
        setUiState((prev) => ({
          ...prev,
          [es_index]: { ...prev[es_index], query: search },
        }));
        refresh();
      }
      return;
    }

    if (prevSearchRef.current === search) return;
    prevSearchRef.current = search;

    setUiState((prev) => ({
      ...prev,
      [es_index]: { ...prev[es_index], query: search },
    }));
    refresh();
  }, [search, setUiState, refresh]);

  return null;
};

export function URLHandler() {
  const { results, indexUiState } = useInstantSearch();

  function deleteParamsWithPrefix(prefix, params) {
    const keysToDelete = [];
    for (const [key] of params.entries()) {
      if (key.startsWith(prefix)) keysToDelete.push(key);
    }
    keysToDelete.forEach((key) => params.delete(key));
    return params;
  }

  function setParams(type, value, params) {
    if (type === "filter") {
      params = deleteParamsWithPrefix("filter:", params);
      Object.keys(value).forEach((v) => {
        const vals = Array.isArray(value[v]) ? value[v] : [value[v]];
        vals.forEach((val) => params.append(`filter:${v}`, val));
      });
    }
    if (type === "range") {
      params = deleteParamsWithPrefix("range:", params);
      Object.keys(value).forEach((v) => params.set(`range:${v}`, value[v]));
    }
    if (type === "sort" && value) {
      params.set("sort", value.replace(`${es_index}_`, ""));
    }
    if (type === "page" && value) {
      params.set("page", value);
    }
    return params;
  }

  useEffect(() => {
    if (!results) return;
    const url = new URL(window.location.href);
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
    const newUrl = `${url.origin}${url.pathname}${stringParams ? `?${stringParams}` : ""}`;
    window.history.replaceState({}, "", newUrl);
  }, [indexUiState, results]);

  return null;
}

function ProductsSectionV2({
  category,
  search = "",
  filterType = null,
  initialFilterString = "",
  initialHits = null,
}) {
  const { categories, flatCategories } = useSolanaCategories();
  const [pageDetails, setPageDetails] = useState(null);
  // Start loaded immediately when we have server-prefetched hits — no skeleton shown.
  const [dataLoaded, setDataLoaded] = useState(!!initialHits?.length);
  // initialFilterString comes from the server so InstantSearch has the right
  // filter on the very first render — before the context useEffect resolves.
  const [filterString, setFilterString] = useState(initialFilterString);

  // When initial hits are present, never allow the loader to re-appear while
  // InstantSearch is warming up — the static grid covers that window.
  const handleDataLoaded = useCallback(
    (loaded) => setDataLoaded(initialHits?.length ? true : loaded),
    [initialHits?.length],
  );

  // Computed once from the initial URL — URLHandler takes over after mount
  const initialUiState = useRef(
    getInitialUiStateFromUrl(
      typeof window !== "undefined" ? window.location.href : null,
    ),
  );

  useEffect(() => {
    if (!category) {
      setPageDetails(null);
      setFilterString((prev) => (prev !== "" ? "" : prev));
      return;
    }

    const details = flatCategories.find(({ url }) => url === category);
    const use_details = details || findCategory1(categories, category);

    if (!use_details) {
      setPageDetails(null);
      setFilterString((prev) => (prev !== "" ? "" : prev));
      return;
    }

    setPageDetails(use_details);

    let result = "";
    if (use_details?.nav_type === "category") {
      result = `page_category:${use_details?.origin_name}${":" + use_details.filter_type}`;
    } else if (use_details?.nav_type === "brand") {
      result = `page_brand:${use_details?.origin_name}${":" + use_details.filter_type}`;
    } else if (use_details?.nav_type === "custom_page") {
      if (use_details?.name === "Search") {
        result = `custom_page:Search:Search`;
      } else {
        const page_name = use_details?.name;
        if (BaseNavKeys.includes(page_name)) {
          result = `custom_page:${page_name}:${use_details.filter_type}`;
        } else {
          result = `custom_page:${use_details?.collection_display?.name || "NA"}:${use_details.filter_type}`;
        }
      }
    } else if (use_details?.nav_type === "category1") {
      result = `page_category1:${use_details?.name}${":" + use_details.filter_type}`;
    }

    setFilterString((prev) => (prev !== result ? result : prev));
  }, [category, flatCategories, categories]);

  return (
    <>
      <div className={`${!dataLoaded ? "w-full" : "hidden"}`}>
        <ProductsSectionLoader />
      </div>

      <div
        className={`${dataLoaded ? "max-w-7xl mx-auto w-full px-4 sm:px-6" : "hidden"}`}
      >
        <div className="mt-5">
          <InstantSearch
            indexName={es_index}
            searchClient={searchClient}
            initialUiState={initialUiState.current}
            future={{
              preserveSharedStateOnUnmount: true,
            }}
          >
            <URLHandler />
            <ProductCountUpdater />
            <SearchBox className="hidden-main-search-input hidden" />
            <Refresh search={search} />
            {filterString ? (
              <Configure hitsPerPage={hitsPerPage} filter={filterString} />
            ) : (
              <Configure hitsPerPage={hitsPerPage} />
            )}
            {/* Pagination + SortBy + RangeInput stubs keep initialUiState working */}
            <Pagination className="hidden" />
            <SortBy
              className="hidden"
              items={[
                { label: "Most Popular", value: `${es_index}_popular` },
                { label: "Newest", value: `${es_index}_newest` },
                { label: "Price: Low to High", value: `${es_index}_price_asc` },
                { label: "Price: High to Low", value: `${es_index}_price_desc` },
              ]}
            />
            <RangeInput attribute="price" className="hidden" />

            {/* Registers only the attributes relevant to this page's filterType.
                Falls back to the default set when filterType is unknown.
                Each connector calls useRefinementList() for URL hydration — no DOM output. */}
            <AttributeRegistry filterType={filterType} />

            <PrefetchNextPage filterString={filterString} />
            <InnerUI
              category={category}
              page_details={pageDetails}
              onDataLoaded={handleDataLoaded}
              initialHits={initialHits}
            />
          </InstantSearch>
        </div>
      </div>
    </>
  );
}

export default ProductsSectionV2;
