"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSolanaCategories } from "@/app/context/category";
import {
  BASE_URL,
  exclude_brands,
  exclude_collections,
  createSlug,
  main_products,
  shouldApplyMainProductSort,
} from "@/app/lib/helpers";

// ============================================================================
// CONSTANTS
// ============================================================================
const RECENT_SEARCH_KEY = "recent_searches";
const SEARCH_RESULT_SIZE = 100;
const MIN_SUGGESTION_LENGTH = 2;
const DEBOUNCE_DELAY = 400; // milliseconds
const HIDDEN_COLLECTIONS = ["American Outdoor Grill"];

// ============================================================================
// CONTEXT
// ============================================================================
const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within SearchProvider");
  }
  return context;
};

// ============================================================================
// PROVIDER
// ============================================================================
export const SearchProvider = ({ children }) => {
  // ---------------------------------------------------------------------------
  // HOOKS
  // ---------------------------------------------------------------------------
  const { flatCategories } = useSolanaCategories();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ---------------------------------------------------------------------------
  // STATE - UI
  // ---------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [mainIsActive, setMainIsActive] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // STATE - SEARCH RESULTS
  // ---------------------------------------------------------------------------
  const [productResults, setProductResults] = useState([]);
  const [productResultsCount, setProductResultsCount] = useState(0);
  const [suggestionResults, setSuggestionResults] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [popularResults, setPopularResults] = useState([]);
  const [categoryResults, setCategoryResults] = useState([]);
  const [brandResults, setBrandResults] = useState([]);
  const [collectionsResults, setCollectionsResults] = useState([]);
  const [skusResults, setSkusResults] = useState([]);

  // ---------------------------------------------------------------------------
  // STATE - DATA SOURCES
  // ---------------------------------------------------------------------------
  const [lForage, setLForage] = useState(null);
  const [popularSearches, setPopularSearches] = useState([]);
  const [searchPageProductCount, setSearchPageProductCount] = useState(0);

  // ---------------------------------------------------------------------------
  // REFS
  // ---------------------------------------------------------------------------
  const oldSearchResults = useRef([]);
  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const lastProcessedUrlQuery = useRef(null);
  const currentSearchQuery = useRef("");

  // ---------------------------------------------------------------------------
  // HELPER: Build Elasticsearch Query
  // ---------------------------------------------------------------------------
  // const buildSearchQuery = useCallback((trimmedQuery) => {
  //   if (!trimmedQuery) {
  //     return {
  //       query: { match_all: {} },
  //       size: SEARCH_RESULT_SIZE,
  //     };
  //   }

  //   return {
  //     aggs: {
  //       brands_facet: {
  //         terms: {
  //           field: "brand.keyword",
  //           size: 1000,
  //         },
  //       },
  //       collections_facet: {
  //         terms: {
  //           field: "collections.name.keyword",
  //           size: 1000,
  //         },
  //       },
  //     },
  //     query: {
  //       bool: {
  //         filter: [],
  //         must: {
  //           bool: {
  //             should: [
  //               {
  //                 multi_match: {
  //                   query: "trimmedQuery",
  //                   fields: ["variants.sku^10"],
  //                   type: "phrase",
  //                 },
  //               },
  //               {
  //                 bool: {
  //                   should: [
  //                     {
  //                       multi_match: {
  //                         query: trimmedQuery, // Placeholder for actual query text
  //                         fields: ["title^3", "brand^2", "description"],
  //                         fuzziness: "AUTO:4,8",
  //                       },
  //                     },
  //                     {
  //                       multi_match: {
  //                         query: trimmedQuery, // Placeholder for actual query text
  //                         fields: ["title^1.5", "brand^1", "description"],
  //                         type: "bool_prefix",
  //                       },
  //                     },
  //                   ],
  //                 },
  //               },
  //               {
  //                 multi_match: {
  //                   query: trimmedQuery, // Placeholder for actual query text
  //                   type: "phrase",
  //                   fields: ["title^6", "brand^4", "description"],
  //                 },
  //               },
  //             ],
  //           },
  //         },
  //         must_not: [
  //           {
  //             terms: {
  //               "brand.keyword": exclude_brands, // Placeholder for actual array
  //             },
  //           },
  //           {
  //             terms: {
  //               "collections.name.keyword": exclude_collections, // Placeholder for actual array
  //             },
  //           },
  //         ],
  //       },
  //     },
  //     size: 10, // Placeholder for SEARCH_RESULT_SIZE
  //     suggest: {
  //       did_you_mean: {
  //         text: trimmedQuery, // Placeholder for actual query text
  //         phrase: {
  //           field: "suggest_combined",
  //           size: 1,
  //           confidence: 0.5,
  //           max_errors: 5.0,
  //           real_word_error_likelihood: 0.4,
  //           smoothing: {
  //             stupid_backoff: {
  //               discount_threshold: 0.1,
  //             },
  //           },
  //           direct_generator: [
  //             {
  //               field: "suggest_combined",
  //               suggest_mode: "always",
  //               min_word_length: 2,
  //             },
  //           ],
  //           collate: {
  //             query: {
  //               source: {
  //                 multi_match: {
  //                   query: "{{suggestion}}",
  //                   type: "phrase",
  //                   fields: ["suggest_combined"],
  //                 },
  //               },
  //             },
  //             prune: true,
  //           },
  //           highlight: {
  //             pre_tag: "!",
  //             post_tag: "!",
  //           },
  //         },
  //       },
  //       sku_autocomplete: {
  //         prefix: trimmedQuery, // The input string from the user (e.g., "AB-12")
  //         completion: {
  //           field: "variants.sku_suggest",
  //           size: 3,
  //           skip_duplicates: true,
  //           fuzzy: {
  //             fuzziness: "AUTO",
  //             min_length: 2,
  //           },
  //         },
  //       },
  //     },
  //   };
  // }, []);

  const buildSearchQuery = useCallback((trimmedQuery) => {
    if (!trimmedQuery) {
      return {
        query: { match_all: {} },
        size: SEARCH_RESULT_SIZE,
      };
    }

    // Check if main product sorting should be applied
    const applyMainProductSort = shouldApplyMainProductSort(trimmedQuery);

    return {
      aggs: {
        brands_facet: {
          terms: {
            field: "brand.keyword",
            size: 1000,
          },
        },
        collections_facet: {
          terms: {
            field: "collections.name.keyword",
            size: 1000,
          },
        },
      },

      sort: applyMainProductSort
        ? [
            // Apply main product priority when keyword matches
            {
              _script: {
                type: "number",
                script: {
                  source: `
                  def main_collections = params.main_products;
                  def product_collections = doc['collections.name.keyword'];

                  for (collection in product_collections) {
                    if (main_collections.contains(collection)) {
                      return 0; // Main product - top priority
                    }
                  }

                  return 1; // Non-main product - lower priority
                `,
                  params: {
                    main_products: main_products,
                  },
                },
                order: "asc",
              },
            },
            { updated_at: "desc" },
            "_score",
          ]
        : [
            // Regular relevance sorting for other searches
            "_score",
            { updated_at: "desc" },
          ],

      query: {
        bool: {
          filter: [
            {
              term: {
                published: true,
              },
            },
          ],
          must: {
            bool: {
              should: [
                {
                  multi_match: {
                    query: trimmedQuery, // Using the variable directly
                    fields: ["variants.sku^10"],
                    type: "phrase",
                  },
                },
                {
                  bool: {
                    should: [
                      {
                        multi_match: {
                          query: trimmedQuery,
                          fields: ["title"],
                          fuzziness: "AUTO:4,8", // Back to original
                        },
                      },
                      {
                        multi_match: {
                          query: trimmedQuery,
                          fields: ["title"],
                          type: "bool_prefix",
                        },
                      },
                    ],
                  },
                },
                {
                  multi_match: {
                    query: trimmedQuery, // Using the variable directly
                    type: "phrase",
                    fields: ["title"],
                  },
                },
              ],
            },
          },
          must_not: [
            {
              terms: {
                "brand.keyword": exclude_brands, // Placeholder for actual array
              },
            },
            {
              terms: {
                "collections.name.keyword": exclude_collections, // Placeholder for actual array
              },
            },
          ],
        },
      },
      size: SEARCH_RESULT_SIZE,
      suggest: {
        did_you_mean: {
          text: trimmedQuery, // Using the variable directly
          phrase: {
            field: "suggest_combined",
            size: 1,
            confidence: 0.5,
            max_errors: 5.0,
            real_word_error_likelihood: 0.4,
            smoothing: {
              stupid_backoff: {
                discount_threshold: 0.1,
              },
            },
            direct_generator: [
              {
                field: "suggest_combined",
                suggest_mode: "always",
                min_word_length: 2,
              },
            ],
            collate: {
              query: {
                source: {
                  multi_match: {
                    query: "{{suggestion}}",
                    type: "phrase",
                    fields: ["suggest_combined"],
                  },
                },
              },
              prune: true,
            },
            highlight: {
              pre_tag: "!",
              post_tag: "!",
            },
          },
        },
        sku_autocomplete: {
          prefix: trimmedQuery, // Using the variable directly
          completion: {
            field: "variants.sku_suggest",
            size: 3,
            skip_duplicates: true,
            fuzzy: {
              fuzziness: "AUTO",
              min_length: 2,
            },
          },
        },
      },
    };
  }, []); // Assuming SEARCH_RESULT_SIZE, exclude_brands, and exclude_collections are passed via closure or are global

  // ---------------------------------------------------------------------------
  // HELPER: Sort Alphabetically
  // ---------------------------------------------------------------------------
  const sortAlphabetically = useCallback((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  }, []);

  // ---------------------------------------------------------------------------
  // HELPER: Filter Navigation Items
  // ---------------------------------------------------------------------------
  const filterNavigationItems = useCallback(
    (navType, query = "", suggestion = "") => {
      const items = flatCategories
        .filter(({ name }) => !["Search", "Home"].includes(name))
        .filter((item) => {
          if (navType === "custom_page") {
            return item?.nav_type === navType && item?.collection_display;
          } else if (navType === "brand") {
            return (
              item?.nav_type === navType && !exclude_brands.includes(item?.name)
            );
          } else {
            return item?.nav_type === navType;
          }
        })
        .map((i) => ({
          name: i?.name || i?.title,
          url: i?.menu?.href || i?.url,
        }));

      const rawSearchString = `${query} ${suggestion}`;
      const searchWords = new Set(
        rawSearchString
          .toLowerCase()
          .split(/\W+/)
          .filter((word) => word.length > 0)
      );

      if (searchWords.size === 0) {
        return items.sort(sortAlphabetically);
      }

      const result = items
        .filter((item) => {
          const itemName = item.name || "";

          const itemNameWords = itemName
            .toLowerCase()
            .split(/\W+/)
            .filter((word) => word.length > 0);

          return itemNameWords.some((itemNameWord) =>
            searchWords.has(itemNameWord)
          );
        })
        .sort(sortAlphabetically);
      return result;
    },
    [flatCategories, sortAlphabetically]
  );

  // ---------------------------------------------------------------------------
  // HELPER: Dedupe Recent Searches
  // ---------------------------------------------------------------------------
  const dedupeRecents = useCallback((data) => {
    if (!Array.isArray(data)) {
      return [];
    }

    const map = new Map();
    data.forEach((item) => {
      const existing = map.get(item.term);
      if (!existing || item.timestamp > existing.timestamp) {
        map.set(item.term, item);
      }
    });

    return Array.from(map.values());
  }, []);

  // ---------------------------------------------------------------------------
  // API: Update URL
  // ---------------------------------------------------------------------------
  const updateURL = useCallback(
    (query) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("query", query);
      const newUrl = `/search?${params.toString()}`;
      window.history.pushState(null, "", newUrl);
    },
    [searchParams]
  );

  // ---------------------------------------------------------------------------
  // API: Get Recent Searches
  // ---------------------------------------------------------------------------
  const getRecentSearch = useCallback(async () => {
    try {
      if (!lForage) return [];
      return (await lForage.getItem(RECENT_SEARCH_KEY)) || [];
    } catch (error) {
      console.error("[LocalForage] getRecentSearch error:", error);
      return [];
    }
  }, [lForage]);

  // ---------------------------------------------------------------------------
  // API: Set Recent Searches
  // ---------------------------------------------------------------------------
  const setRecentSearch = useCallback(
    async (value) => {
      try {
        if (!lForage) return;
        const new_value = dedupeRecents(value);
        await lForage.setItem(
          RECENT_SEARCH_KEY,
          new_value.map((item) => ({
            ...item,
            term: item?.term?.toLowerCase(),
          }))
        );
      } catch (error) {
        console.error("[LocalForage] setRecentSearch error:", error);
      }
    },
    [lForage, dedupeRecents]
  );

  // ---------------------------------------------------------------------------
  // FUNCTION: Get Search Results (Recent, Popular, Categories, Brands)
  // ---------------------------------------------------------------------------
  const getSearchResults = useCallback(
    async (query, suggest, brands = []) => {
      try {
        const recentLS = await getRecentSearch();
        const recent = recentLS && Array.isArray(recentLS) ? recentLS : [];

        const results =
          query === ""
            ? recent
            : recent
                .filter((i) =>
                  i.term.toLowerCase().includes(query.toLowerCase())
                )
                .sort((a, b) => b.timestamp - a.timestamp);

        // Popular searches logic:
        // - Show top 10 when query is empty
        // - Filter and prioritize by relevance when user is typing
        let popular_searches = [];

        if (!query || query.trim() === "") {
          // No query: show top 10 most popular
          console.log(
            "📊 popularSearches (no query):",
            popularSearches.length,
            popularSearches.slice(0, 3)
          );

          popular_searches = (popularSearches || [])
            .filter((item) => item && typeof item === "object" && item.term)
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 10)
            .map((item) => item.term);
        } else {
          // Has query: filter by relevance and sort
          const queryLower = query.toLowerCase().trim();

          console.log(
            "🔍 popularSearches in getSearchResults:",
            popularSearches.length,
            popularSearches.slice(0, 3)
          );

          popular_searches = (popularSearches || [])
            .filter((item) => {
              // Defensive check: ensure item has a term property that's a string
              if (!item || typeof item !== "object") {
                console.warn("Invalid item in popularSearches:", item);
                return false;
              }
              if (!item.term || typeof item.term !== "string") {
                console.warn("Invalid term in popularSearches item:", item);
                return false;
              }
              const termLower = item.term.toLowerCase();
              return termLower.includes(queryLower);
            })
            .map((item) => {
              const termLower = item?.term?.toLowerCase() || "";
              // Prioritize: starts with query > contains query
              const startsWithQuery = termLower.startsWith(queryLower);
              const matchIndex = termLower.indexOf(queryLower);

              return {
                ...item,
                startsWithQuery,
                matchIndex,
              };
            })
            .sort((a, b) => {
              // First: higher score (popularity) - most important!
              const scoreDiff = (b.score || 0) - (a.score || 0);
              if (scoreDiff !== 0) return scoreDiff;

              // Second: prioritize starts-with matches
              if (a.startsWithQuery && !b.startsWithQuery) return -1;
              if (!a.startsWithQuery && b.startsWithQuery) return 1;

              // Third: earlier match position
              return a.matchIndex - b.matchIndex;
            })
            .slice(0, 10)
            .map((item) => item?.term);
        }

        const category_searches = filterNavigationItems(
          "custom_page",
          query,
          suggest
        );
        const brand_searches = (brands || []).map((item) => ({
          name: item?.key,
          url: createSlug(item?.key),
        }));

        setPopularResults(popular_searches);
        setCategoryResults(category_searches);
        setBrandResults(brand_searches);

        return {
          recent: results,
          popular: popular_searches,
          category: category_searches,
          brand: brand_searches,
        };
      } catch (error) {
        console.error("[ERROR] getSearchResults:", error);
        return null;
      }
    },
    [getRecentSearch, popularSearches, filterNavigationItems]
  );

  // ---------------------------------------------------------------------------
  // API: Fetch Products from Elasticsearch
  // ---------------------------------------------------------------------------
  const fetchProducts = useCallback(
    async (query_string) => {
      try {
        // Cancel previous fetch if it exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new AbortController for this fetch
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const trim_query = query_string.trim();
        const rawQuery = buildSearchQuery(trim_query);

        const res = await fetch("/api/es/shopify/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rawQuery),
          signal: abortController.signal,
        });

        if (!res.ok) {
          throw new Error(`[SHOPIFY SEARCH] Failed: ${res.status}`);
        }

        const data = await res.json();
        const formatted_results = data?.hits?.hits?.map(
          ({ _source }) => _source
        );

        // console.log("data", data);
        const result_total_count = data?.hits?.total?.value;
        const dym = data?.suggest?.did_you_mean?.[0];
        const sku_ac = data?.suggest?.sku_autocomplete?.[0];
        const suggest_options = dym?.options;
        const sku_ac_options = sku_ac?.options || [];
        const aggs_brands = data?.aggregations?.brands_facet?.buckets || [];
        const aggs_collections = (
          data?.aggregations?.collections_facet?.buckets || []
        ).map((item) => {
          const url = `search?query=${trim_query}&filter%3Acollections=${item?.key}`;
          return { name: item?.key, url };
        });

        console.log("🔎 fetchProducts results:", {
          query: trim_query,
          productsCount: formatted_results?.length,
          brandsCount: aggs_brands?.length,
          collectionsCount: aggs_collections?.length,
          skusCount: sku_ac_options?.length,
        });

        setSkusResults(trim_query.length > 2 ? sku_ac_options || [] : []);
        setCollectionsResults(
          aggs_collections.filter((i) => !HIDDEN_COLLECTIONS.includes(i.name))
        );
        setProductResults(formatted_results || []);
        setSuggestionResults(
          trim_query.length > MIN_SUGGESTION_LENGTH ? suggest_options || [] : []
        );
        setProductResultsCount(result_total_count || 0);
        setLoading(false);
        getSearchResults(
          trim_query,
          suggest_options?.[0]?.text || "",
          aggs_brands
        );
        return data;
      } catch (err) {
        // Don't log abort errors as they're expected when canceling
        if (err.name === "AbortError") {
          return null;
        }
        console.error("[SHOPIFY SEARCH] Failed to fetch products:", err);
        return null;
      }
    },
    [buildSearchQuery, getSearchResults]
  );

  // ---------------------------------------------------------------------------
  // API: Add Popular Search
  // ---------------------------------------------------------------------------
  const addPopularSearches = useCallback(async (query) => {
    try {
      const res = await fetch("/api/add_popular_searches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ term: query }),
      });
      await res.json();
    } catch (err) {
      console.error("[ERROR] Add Popular Searches:", err);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // FUNCTION: Set Search with Debounce
  // ---------------------------------------------------------------------------
  const setSearch = useCallback(
    (search_string, shouldUpdateUrl = true) => {
      // Guard: Prevent update if same value (prevents loops)
      if (search_string === currentSearchQuery.current) {
        return;
      }

      // Update ref to track current value
      currentSearchQuery.current = search_string;

      // Update search query immediately for responsive UI
      setSearchQuery(search_string);

      // Clear previous debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounce the fetch calls AND URL update to prevent excessive operations
      debounceTimeoutRef.current = setTimeout(() => {
        // Update URL after debounce (only on /search page)
        if (pathname === "/search" && shouldUpdateUrl) {
          updateURL(search_string);
          lastProcessedUrlQuery.current = search_string;
        }

        fetchProducts(search_string);
        // getSearchResults(search_string);
      }, DEBOUNCE_DELAY);
    },
    [pathname, updateURL, fetchProducts, getSearchResults]
  );

  // ---------------------------------------------------------------------------
  // FUNCTION: Redirect to Search Page
  // ---------------------------------------------------------------------------
  const redirectToSearchPage = useCallback(async () => {
    const recent = await getRecentSearch();
    await setRecentSearch([
      { term: searchQuery, timestamp: Date.now() },
      ...recent,
    ]);
    await addPopularSearches(searchQuery);
    router.push(`${BASE_URL}/search?query=${searchQuery}`);
  }, [
    searchQuery,
    getRecentSearch,
    setRecentSearch,
    addPopularSearches,
    router,
  ]);

  // ---------------------------------------------------------------------------
  // EFFECT: Initialize LocalForage and Popular Searches
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@/app/lib/localForage")
        .then(async (module) => {
          setLForage(module);
          const recentLS = await module.getItem(RECENT_SEARCH_KEY);
          setRecentResults(Array.isArray(recentLS) ? recentLS : []);
        })
        .catch((error) => {
          console.error("Error loading localForage module:", error);
        });
    }

    const fetchPopularSearches = async () => {
      try {
        // Fetch top 100 popular searches for better filtering (NO query filter on initial load)
        const res = await fetch("/api/popular_searches?limit=100");
        const data = await res.json();
        console.log("📊 Popular searches fetched:", data?.length, data);

        if (!data || data.length === 0) {
          console.warn("⚠️ No popular searches returned from API");
          return;
        }

        setPopularSearches(data);

        // Initialize popular results on mount (top 10)
        const popular = data
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
          .map((item) => item?.term);
        console.log("📊 Popular results initialized:", popular);
        setPopularResults(popular);
      } catch (err) {
        console.error("Failed to fetch popular searches", err);
      }
    };

    fetchPopularSearches();
  }, []);

  // ---------------------------------------------------------------------------
  // EFFECT: Update popular results when popularSearches loads
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (popularSearches.length > 0 && searchQuery === "") {
      // Re-run getSearchResults when popularSearches is loaded for empty query
      const initPopular = popularSearches
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((item) => item?.term);
      setPopularResults(initPopular);
      console.log("🔄 Popular results synced after load:", initPopular);
    }
  }, [popularSearches, searchQuery]);

  // ---------------------------------------------------------------------------
  // EFFECT: Sync URL Query with Search State (on /search page)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const urlQuery = searchParams.get("query");

    // Only process if: on search page, has query, different from current, and not already processed
    if (
      pathname === "/search" &&
      urlQuery &&
      urlQuery !== searchQuery &&
      urlQuery !== lastProcessedUrlQuery.current
    ) {
      lastProcessedUrlQuery.current = urlQuery;
      // Update state and fetch data without updating URL (since we're already responding to a URL change)
      setSearch(urlQuery, false);
    }
  }, [pathname, searchParams, searchQuery, setSearch]);

  // ---------------------------------------------------------------------------
  // EFFECT: Update noResults State
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const hasNoResults =
      productResults?.length === 0 &&
      categoryResults.length === 0 &&
      brandResults.length === 0 &&
      collectionsResults.length === 0 &&
      skusResults.length === 0;
    setNoResults(hasNoResults);
  }, [
    productResults,
    categoryResults,
    brandResults,
    collectionsResults,
    skusResults,
  ]);

  // ---------------------------------------------------------------------------
  // EFFECT: Cleanup on Unmount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // MEMO: Formatted Search Results
  // ---------------------------------------------------------------------------
  const searchResults = useMemo(() => {
    const newSearchResults = [
      {
        total: skusResults.length,
        prop: "skus",
        label: "SKU",
        visible: true,
        data: skusResults,
        showExpand: skusResults.length > 0,
      },
      {
        total: suggestionResults?.length || 0,
        prop: "suggestion",
        label: "Did you mean",
        visible: true,
        data: suggestionResults || [],
        showExpand: (suggestionResults?.length || 0) > 3,
      },
      {
        total: recentResults.length,
        prop: "recent",
        label: "Recent",
        visible: true,
        data: recentResults,
        showExpand: recentResults.length > 3,
      },
      {
        total: popularResults?.length || 0,
        prop: "popular",
        label: "Popular Searches",
        visible: true,
        data: popularResults || [],
        showExpand: (popularResults?.length || 0) > 0,
      },
      {
        total: searchPageProductCount || productResultsCount || 0,
        prop: "product",
        label: "Product",
        visible: true,
        data: productResults || [],
        showExpand: (productResults?.length || 0) > 0,
      },
      {
        total: categoryResults.length,
        prop: "category",
        label: "Category",
        visible: true,
        data: categoryResults,
        showExpand: categoryResults.length > 0,
      },
      {
        total: brandResults.length,
        prop: "brand",
        label: "Brand",
        visible: true,
        data: brandResults,
        showExpand: brandResults.length > 0,
      },
      {
        total: collectionsResults.length,
        prop: "collections",
        label: "Collections",
        visible: true,
        data: collectionsResults,
        showExpand: collectionsResults.length > 0,
      },
    ];

    if (!loading) {
      oldSearchResults.current = newSearchResults;
    }

    const finalResults = loading ? oldSearchResults.current : newSearchResults;
    console.log(
      "📋 searchResults memo:",
      finalResults.map((s) => ({
        prop: s.prop,
        dataLength: s.data?.length,
      }))
    );

    return finalResults;
  }, [
    suggestionResults,
    recentResults,
    popularResults,
    productResults,
    categoryResults,
    brandResults,
    collectionsResults,
    skusResults,
    searchPageProductCount,
    productResultsCount,
    loading,
  ]);

  // ---------------------------------------------------------------------------
  // CONTEXT VALUE
  // ---------------------------------------------------------------------------
  const contextValue = useMemo(
    () => ({
      searchQuery,
      loading,
      mainIsActive,
      searchResults,
      noResults,
      searchPageProductCount,
      recentSearchKey: RECENT_SEARCH_KEY,
      setSearch,
      setSearchPageProductCount,
      setMainIsActive,
      redirectToSearchPage,
      getRecentSearch,
      setRecentSearch,
    }),
    [
      searchQuery,
      loading,
      mainIsActive,
      searchResults,
      noResults,
      searchPageProductCount,
      setSearch,
      redirectToSearchPage,
      getRecentSearch,
      setRecentSearch,
    ]
  );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};
