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

import {
  BASE_URL,
  exclude_brands,
  exclude_collections,
  createSlug,
  main_products,
  shouldApplyMainProductSort,
} from "@/app/lib/helpers";
import { popular_keywords } from "@/app/lib/filter-helpers";
import { mapCategoryResults } from "../lib/helpers";

// ============================================================================
// CONSTANTS
// ============================================================================
const RECENT_SEARCH_KEY = "recent_searches";
const SEARCH_RESULT_SIZE = 100;
const MIN_SUGGESTION_LENGTH = 2;
const DEBOUNCE_DELAY = 400;
const HIDDEN_COLLECTIONS = ["American Outdoor Grill"];
const CACHE_TTL = 5 * 60 * 1000; // 5 min client-side ES response cache

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
  const [productHit, setProductHit] = useState(null);
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
  const searchCache = useRef(new Map()); // query → { data, ts }

  // ---------------------------------------------------------------------------
  // HELPER: Build Elasticsearch Query
  // ---------------------------------------------------------------------------
  const buildSearchQuery = useCallback((trimmedQuery) => {
    if (!trimmedQuery) {
      return {
        query: { match_all: {} },
        size: SEARCH_RESULT_SIZE,
      };
    }

    const applyMainProductSort = shouldApplyMainProductSort(trimmedQuery);

    return {
      aggs: {
        brands_facet: {
          terms: { field: "brand.keyword", size: 1000 },
        },
        collections_facet: {
          terms: { field: "collections.name.keyword", size: 1000 },
        },
        categories_facet: {
          terms: { field: "accentuate_data.category", size: 1000 },
        },
      },

      sort: applyMainProductSort
        ? [
            {
              _script: {
                type: "number",
                script: {
                  source: `
                  def main_collections = params.main_products;
                  def product_collections = doc['collections.name.keyword'];
                  for (collection in product_collections) {
                    if (main_collections.contains(collection)) return 0;
                  }
                  return 1;
                `,
                  params: { main_products: main_products },
                },
                order: "asc",
              },
            },
            { updated_at: "desc" },
            "_score",
          ]
        : ["_score", { updated_at: "desc" }],

      query: {
        bool: {
          filter: [{ term: { published: true } }],
          must: {
            bool: {
              should: [
                {
                  multi_match: {
                    query: trimmedQuery,
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
                          fuzziness: "AUTO:4,8",
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
                    query: trimmedQuery,
                    type: "phrase",
                    fields: ["title"],
                  },
                },
              ],
            },
          },
          must_not: [
            { terms: { "brand.keyword": exclude_brands } },
            { terms: { "collections.name.keyword": exclude_collections } },
          ],
        },
      },
      size: SEARCH_RESULT_SIZE,
      suggest: {
        did_you_mean: {
          text: trimmedQuery,
          phrase: {
            field: "suggest_combined",
            size: 1,
            confidence: 0.5,
            max_errors: 5.0,
            real_word_error_likelihood: 0.4,
            smoothing: {
              stupid_backoff: { discount_threshold: 0.1 },
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
            highlight: { pre_tag: "!", post_tag: "!" },
          },
        },
        sku_autocomplete: {
          prefix: trimmedQuery,
          completion: {
            field: "variants.sku_suggest",
            size: 3,
            skip_duplicates: true,
            fuzzy: { fuzziness: "AUTO", min_length: 2 },
          },
        },
      },
    };
  }, []);

  // ---------------------------------------------------------------------------
  // HELPER: Dedupe Recent Searches
  // ---------------------------------------------------------------------------
  const dedupeRecents = useCallback((data) => {
    if (!Array.isArray(data)) return [];

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
      window.history.pushState(null, "", `/search?${params.toString()}`);
    },
    [searchParams],
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
          })),
        );
      } catch (error) {
        console.error("[LocalForage] setRecentSearch error:", error);
      }
    },
    [lForage, dedupeRecents],
  );

  // ---------------------------------------------------------------------------
  // HELPER: Match Query Words
  // ---------------------------------------------------------------------------
  const matchesQueryWords = useCallback((text, queryWords) => {
    if (!text || !queryWords || queryWords.length === 0) return false;
    const textLower = text.toLowerCase();
    return queryWords.some((word) => textLower.includes(word));
  }, []);

  // ---------------------------------------------------------------------------
  // FUNCTION: Process Popular Search Result
  // ---------------------------------------------------------------------------
  const processPopularSearchResult = useCallback(
    (query) => {
      if (!query || query.trim() === "") {
        return (popular_keywords || [])
          .sort((a, b) => a.localeCompare(b))
          .map((item) => (item || "").toLowerCase());
      }

      const queryLower = query.toLowerCase().trim();
      const queryWords = queryLower.split(" ");

      const dynamicResults = (popularSearches || [])
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.term === "string" &&
            matchesQueryWords(item.term, queryWords),
        )
        .map((item) => {
          const termLower = item.term.toLowerCase();
          return {
            ...item,
            startsWithQuery: termLower.startsWith(queryLower),
            matchIndex: termLower.indexOf(queryLower),
          };
        })
        .sort((a, b) => {
          const scoreDiff = (b.score || 0) - (a.score || 0);
          if (scoreDiff !== 0) return scoreDiff;
          if (a.startsWithQuery && !b.startsWithQuery) return -1;
          if (!a.startsWithQuery && b.startsWithQuery) return 1;
          return a.matchIndex - b.matchIndex;
        })
        .slice(0, 10)
        .map((item) => item.term.toLowerCase());

      const staticResults = (popular_keywords || []).filter((keyword) =>
        matchesQueryWords(keyword, queryWords),
      );

      return [...new Set([...staticResults, ...dynamicResults])];
    },
    [popularSearches, matchesQueryWords],
  );

  // ---------------------------------------------------------------------------
  // FUNCTION: Process Brand Search Result
  // ---------------------------------------------------------------------------
  const processBrandSearchResult = useCallback((query, brands) => {
    const allBrands = (brands || []).map((item) => ({
      name: item?.key,
      count: item?.doc_count,
      url: createSlug(item?.key),
    }));

    if (!query || query.trim() === "") return allBrands;

    const allBrandsMap = new Map(allBrands.map((item) => [item.name, item]));
    const mergedNames = [...new Set(allBrands.map((item) => item?.name))];

    return mergedNames.map(
      (name) =>
        allBrandsMap.get(name) || {
          name,
          count: 0,
          url: createSlug(name || ""),
        },
    );
  }, []);

  // ---------------------------------------------------------------------------
  // FUNCTION: Process Collection Search Result
  // ---------------------------------------------------------------------------
  const processCollectionSearchResult = useCallback(
    (query, collections) => {
      const allCollections = collections.filter(
        (item) =>
          !HIDDEN_COLLECTIONS.map((hcol) => hcol.toLowerCase()).includes(
            item.key.toLowerCase(),
          ),
      );

      if (!query || query.trim() === "") {
        return allCollections.map((item) => ({
          name: item?.key,
          count: item?.doc_count,
          url: `search?query=${query}&filter%3Acollections=${item?.key}`,
        }));
      }

      const queryWords = query.toLowerCase().trim().split(" ");

      const matchingCollections = allCollections
        .map(({ key }) => key)
        .filter((collection) => matchesQueryWords(collection, queryWords));

      const allCollectionsMap = new Map(
        allCollections.map((item) => [item.key, item]),
      );
      const mergedNames = [
        ...new Set([
          ...matchingCollections,
          ...allCollections.map(({ key }) => key),
        ]),
      ];

      return mergedNames.map((name) => {
        const item = allCollectionsMap.get(name);
        return {
          name,
          count: item?.doc_count ?? 0,
          url: `search?query=${query}&filter%3Acollections=${name}`,
        };
      });
    },
    [matchesQueryWords],
  );

  // ---------------------------------------------------------------------------
  // FUNCTION: Process Products Search Result
  // ---------------------------------------------------------------------------
  const processProductSearchResult = useCallback(
    (query, products) => {
      if (!query || query.trim() === "") {
        return { exactMatch: null, products };
      }

      const queryWords = query.toLowerCase().trim().split(" ");

      const exactLastSubstringMatches = products.filter((product) => {
        const titleTokens = (product?.title || "")
          .toLowerCase()
          .trim()
          .split(/\s+/);
        const lastToken = titleTokens[titleTokens.length - 1];
        return queryWords.some((word) => word === lastToken);
      });

      const productsByTitle = new Map(
        products.map((product) => [
          (product?.title || "").toLowerCase(),
          product,
        ]),
      );

      const matchingTitles = products
        .map((p) => (p?.title || "").toLowerCase())
        .filter((title) => matchesQueryWords(title, queryWords));

      const mergedNames = [
        ...new Set([
          ...matchingTitles,
          ...products.map((p) => (p?.title || "").toLowerCase()),
        ]),
      ];

      const mergedProducts = mergedNames
        .map((item) => productsByTitle.get(item))
        .filter(Boolean);

      const exactMatchTitles = new Set(
        exactLastSubstringMatches.map((p) => (p?.title || "").toLowerCase()),
      );

      const otherProducts = mergedProducts.filter(
        (p) => !exactMatchTitles.has((p?.title || "").toLowerCase()),
      );

      return {
        exactMatch: exactLastSubstringMatches[0] || null,
        products: [...exactLastSubstringMatches, ...otherProducts],
      };
    },
    [matchesQueryWords],
  );

  // ---------------------------------------------------------------------------
  // FUNCTION: Get Search Results (Recent, Popular, Categories, Brands)
  // ---------------------------------------------------------------------------
  const getSearchResults = useCallback(
    async (query, suggest, brands = [], categories = [], collections = []) => {
      try {
        const recentLS = await getRecentSearch();
        const recent = Array.isArray(recentLS) ? recentLS : [];

        const results =
          query === ""
            ? recent
            : recent
                .filter((i) =>
                  (i?.term || "").toLowerCase().includes(query.toLowerCase()),
                )
                .sort((a, b) => b.timestamp - a.timestamp);

        const popular_searches = processPopularSearchResult(query);
        setPopularResults(popular_searches);

        setCategoryResults(
          categories.map((item) => ({ ...mapCategoryResults(item) })),
        );

        const brand_searches = processBrandSearchResult(query, brands).map(
          (b) => ({ ...b, image: `/images/brand-logo/${b.url}.webp` }),
        );
        setBrandResults(brand_searches);

        const collection_results = processCollectionSearchResult(
          query,
          collections,
        ).filter(({ name }) => !name.includes("Shop All"));
        setCollectionsResults(collection_results);

        return {
          recent: results,
          popular: popular_searches,
          category: categories,
          brand: brand_searches,
          collection: collection_results,
        };
      } catch (error) {
        console.error("[ERROR] getSearchResults:", error);
        return null;
      }
    },
    [
      getRecentSearch,
      popularSearches,
      processBrandSearchResult,
      processPopularSearchResult,
    ],
  );

  // ---------------------------------------------------------------------------
  // HELPER: Apply an ES response object to all search state slices.
  // Used by both live fetches and cache hits so the two paths stay in sync.
  // ---------------------------------------------------------------------------
  const applyEsResponse = useCallback(
    async (trim_query, data) => {
      const formatted_results = data?.hits?.hits
        ?.filter(Boolean)
        .map(({ _source }) => _source);

      const result_total_count = data?.hits?.total?.value;
      const suggest_options = data?.suggest?.did_you_mean?.[0]?.options;
      const sku_ac_options = data?.suggest?.sku_autocomplete?.[0]?.options || [];
      const aggs_brands = data?.aggregations?.brands_facet?.buckets || [];
      const aggs_collections = data?.aggregations?.collections_facet?.buckets || [];
      const aggs_categories = data?.aggregations?.categories_facet?.buckets;

      setSkusResults(trim_query.length > 2 ? sku_ac_options : []);

      const { exactMatch, products } = processProductSearchResult(
        trim_query,
        formatted_results || [],
      );

      setProductHit(exactMatch);
      setProductResults(products);
      setProductResultsCount(result_total_count || 0);

      await getSearchResults(
        trim_query,
        suggest_options?.[0]?.text || "",
        aggs_brands,
        aggs_categories,
        aggs_collections,
      );
    },
    [processProductSearchResult, getSearchResults],
  );

  // ---------------------------------------------------------------------------
  // API: Fetch Products from Elasticsearch
  // ---------------------------------------------------------------------------
  const fetchProducts = useCallback(
    async (query_string) => {
      // Always abort any in-flight request first — prevents stale results racing in
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setLoading(true);
      const trim_query = query_string.trim();

      // Client cache hit — apply instantly, skip the network entirely
      const cached = searchCache.current.get(trim_query);
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        await applyEsResponse(trim_query, cached.data);
        setLoading(false);
        return cached.data;
      }

      try {
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const res = await fetch("/api/es/shopify/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildSearchQuery(trim_query)),
          signal: abortController.signal,
        });

        const data = await res.json();

        await applyEsResponse(trim_query, data);

        // Store response — cap at 200 entries to prevent unbounded growth
        if (searchCache.current.size >= 200) searchCache.current.clear();
        searchCache.current.set(trim_query, { data, ts: Date.now() });

        setLoading(false);
        return data;
      } catch (err) {
        if (err.name === "AbortError") return null;
        console.error("[SHOPIFY SEARCH] Failed to fetch products:", err);
        setLoading(false);
        return null;
      }
    },
    [buildSearchQuery, applyEsResponse],
  );

  // ---------------------------------------------------------------------------
  // API: Add Popular Search
  // ---------------------------------------------------------------------------
  const addPopularSearches = useCallback(async (query) => {
    try {
      const res = await fetch("/api/add_popular_searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (search_string === currentSearchQuery.current) return;

      currentSearchQuery.current = search_string;
      setSearchQuery(search_string);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (pathname === "/search" && shouldUpdateUrl) {
          updateURL(search_string);
          lastProcessedUrlQuery.current = search_string;
        }
        fetchProducts(search_string);
      }, DEBOUNCE_DELAY);
    },
    [pathname, updateURL, fetchProducts],
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
        })
        .catch((error) => {
          console.error("Error loading localForage module:", error);
        });
    }

    const fetchPopularSearches = async () => {
      try {
        const res = await fetch("/api/popular_searches?limit=100");
        const data = await res.json();

        if (!data || data.length === 0) return;

        setPopularSearches(data);

        const popular = data
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
          .map((item) => item?.term);
        setPopularResults(popular);

        oldSearchResults.current = [
          {
            total: popular.length,
            prop: "popular",
            label: "Popular Searches",
            visible: true,
            data: popular,
            showExpand: false,
          },
        ];
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
      const initPopular = popularSearches
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((item) => item?.term);
      setPopularResults(initPopular);
    }
  }, [popularSearches, searchQuery]);

  // ---------------------------------------------------------------------------
  // EFFECT: Sync URL Query with Search State (on /search page)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const urlQuery = searchParams.get("query");

    if (pathname === "/search" && !urlQuery) {
      setLoading(false);
      return;
    }

    if (
      pathname === "/search" &&
      urlQuery &&
      urlQuery !== searchQuery &&
      urlQuery !== lastProcessedUrlQuery.current
    ) {
      lastProcessedUrlQuery.current = urlQuery;
      setSearch(urlQuery, false);
    }
  }, [pathname, searchParams, setSearch]);

  // ---------------------------------------------------------------------------
  // EFFECT: Update noResults State
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setNoResults(
      productResults?.length === 0 &&
        categoryResults.length === 0 &&
        brandResults.length === 0 &&
        collectionsResults.length === 0 &&
        skusResults.length === 0,
    );
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
      clearTimeout(debounceTimeoutRef.current);
      abortControllerRef.current?.abort();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // MEMO: Formatted Search Results
  // ---------------------------------------------------------------------------
  const searchResults = useMemo(() => {
    const newSearchResults = [
      {
        total: productHit ? 1 : 0,
        prop: "top-product",
        label: "Top Result",
        visible: true,
        data: productHit ? [productHit] : [],
        showExpand: productHit !== null,
      },
      {
        total: popularResults?.length || 0,
        prop: "popular",
        label: "Popular Searches",
        visible: true,
        data:
          searchQuery === ""
            ? processPopularSearchResult("")
            : popularResults || [],
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
    return finalResults;
  }, [
    productHit,
    popularResults,
    productResults,
    productResultsCount,
    searchPageProductCount,
    categoryResults,
    brandResults,
    collectionsResults,
    searchQuery,
    processPopularSearchResult,
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
      setSearchPageProductCount,
      setMainIsActive,
      redirectToSearchPage,
      getRecentSearch,
      setRecentSearch,
    ],
  );

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};
