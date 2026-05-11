import Link from "next/link";
import Image from "next/image";
import IdleState from "@/app/components/new-design/sections/search/IdleState";
import NoSearchResults from "@/app/components/new-design/sections/search/NoSearchResults";
import ProductsSection from "@/app/components/molecule/ProductsSection";

import {
  fetchSearchResults as SSR_fetchSearchResults,
  fetchUniqueCategories,
} from "@/app/lib/fn_server";
import { BASE_URL } from "@/app/lib/helpers";

const STATIC_POPULARS = [
  "Napoleon Ascent",
  "Bromic Eclipse",
  "Twin Eagles pellet grill",
  "Gas fireplace insert",
  "Outdoor kitchen",
  "Patio heater",
  "Fire pit table",
  "Built-in grill",
];

const PageWrapper = ({ children }) => (
  <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
    <div className="max-w-[1240px] mx-auto">{children}</div>
  </div>
);

function CategoryResults({ searchResult }) {
  return (
    <div className="max-w-[1240px] mx-auto px-4 pb-6">
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {searchResult.map((c, i) => (
          <Link
            prefetch={false}
            key={`category-search-page-result-${c?.slug}-${i}`}
            href={`${BASE_URL}/category/${c?.slug}`}
            className="flex gap-3 px-2 py-4 hover:bg-orange-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg group"
          >
            <div>
              <div className="rounded-lg min-w-32 min-h-32 bg-white relative overflow-hidden flex-shrink-0 border border-stone-100 dark:border-stone-700">
                {c?.image && (
                  <Image
                    src={c.image} // or your specific object path
                    alt={c.name || "Category search result thumbnail"}
                    fill
                    sizes="(max-width: 768px) 100vw, 128px"
                    className="object-cover"
                    priority={false}
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {/* <Hl text={c.} q={q} /> */}
                {c.name}
              </div>
              <div className="text-sm text-neutral-600">{c.sub}</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {c.count} product{c.count > 1 ? "s" : ""}
                </span>
                <svg
                  className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-orange-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function BrandResults({ searchResult }) {
  return (
    <div className="max-w-[1240px] mx-auto px-4 pb-6">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResult.map((b) => (
          <Link
            prefetch={false}
            key={`search-page-brand-result-${b.url}`}
            href={b.url || "#"}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-orange-400 hover:shadow-md transition-all group"
          >
            <div>
              <div className="rounded-lg min-w-32 min-h-32 bg-white relative overflow-hidden flex-shrink-0 border border-stone-100 dark:border-stone-700">
                {b?.image && (
                  <Image
                    src={b.image} // or your specific object path
                    alt={b.name || "Brand search result thumbnail"}
                    fill
                    sizes="(max-width: 768px) 100vw, 128px"
                    className="object-contain"
                    priority={false}
                  />
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {b.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{b.desc}</p>
              <p className="text-xs font-semibold mt-1 text-theme-500">
                {b.count} product{b.count > 1 ? "s" : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function SearchPage({ params, searchParams }) {
  const urlParams = await searchParams;
  const query = urlParams?.query || "";
  const ACTIVE_TAB = urlParams?.tab || "product";

  if (query === "") {
    const CATEGORIES = await fetchUniqueCategories();
    return (
      <PageWrapper>
        <IdleState populars={STATIC_POPULARS} categories={CATEGORIES} />
      </PageWrapper>
    );
  }

  const rawResults = await SSR_fetchSearchResults(query);
  const productTotal = rawResults?.["total_products"] || 0;

  if (productTotal === 0) {
    const CATEGORIES = await fetchUniqueCategories();
    return (
      <PageWrapper>
        <NoSearchResults
          query={query}
          populars={STATIC_POPULARS}
          categories={CATEGORIES}
        />
      </PageWrapper>
    );
  }

  const productResults = rawResults?.["products"] || [];
  const categoryResults = rawResults?.["categories"] || [];
  const brandResults = rawResults?.["brands"] || [];

  const searchResults = [
    {
      total: productTotal,
      prop: "product",
      label: "Product",
      visible: true,
      data: productResults,
    },
    {
      total: categoryResults.length,
      prop: "category",
      label: "Category",
      visible: true,
      data: categoryResults,
    },
    {
      total: brandResults.length,
      prop: "brand",
      label: "Brand",
      visible: true,
      data: brandResults,
    },
  ].map((item) => ({
    ...item,
    url: `${BASE_URL}/search?${new URLSearchParams({ ...urlParams, tab: item.prop }).toString()}`,
  }));

  return (
    <PageWrapper>
      <div className="max-w-[1240px] mx-auto  px-4 sm:px-6 py-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Results found for{" "}
          <span className="font-bold text-theme-500">{query}</span>
        </p>
      </div>

      {/* {topResult?.[0] && (
        <ExactMatchCard p={topResult[0]} q={searchPageQuery} />
      )} */}

      <div className="w-full  border-b border-gray-200 dark:border-gray-700 mb-0 sticky top-[64px] lg:top-[105px] bg-white z-10 overflow-x-auto">
        <div className="max-w-[1240px] mx-auto  px-4 sm:px-6">
          <div className="flex">
            {searchResults.map((t) => (
              <Link
                key={`search-result-tabs-${t.prop}`}
                prefetch={false}
                href={t?.url || "#"}
                className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${ACTIVE_TAB === t?.prop ? "border-orange-500 text-orange-600 dark:text-orange-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"}`}
              >
                {t.label}{" "}
                <span
                  className={`ml-1 text-xs ${ACTIVE_TAB === t.prop ? "text-orange-500" : "text-gray-400"}`}
                >
                  ({t.total || 0})
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-6 mt-5 items-start">
        <div
          className={`w-full ${ACTIVE_TAB === "product" ? "flex" : "hidden"}`}
        >
          <ProductsSection
            category={"search"}
            search={urlParams?.query || ""}
          />
        </div>
        <div className={`w-full ${ACTIVE_TAB === "category" ? "flex" : "hidden"}`}>
          <CategoryResults searchResult={categoryResults} />
        </div>
        <div className={`w-full ${ACTIVE_TAB === "brand" ? "flex" : "hidden"}`}>
          <BrandResults searchResult={brandResults} />
        </div>
      </div>
    </PageWrapper>
  );
}
