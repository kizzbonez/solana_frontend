"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FluentChevronLeft } from "@/app/components/icons/lib";
import { useSolanaCategories } from "@/app/context/category";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_BASE_URL;
function BreadCrumbs({ category }) {
  const { solana_categories } = useSolanaCategories();
  const [crumbs, setCrumbs] = useState([]);
  const isMainCategory = useMemo(() => {
    return solana_categories.find(({ url }) => url === category) !== undefined;
  }, [category]);

  useEffect(() => {
    const findBreadcrumbs = (categories, targetUrl, path = []) => {
      for (const category of categories) {
        const newPath = [
          ...path,
          { name: category.name, url: category.url || "#" },
        ];
        if (category.url === targetUrl) {
          return newPath;
        }
        if (category.children) {
          const result = findBreadcrumbs(category.children, targetUrl, newPath);
          if (result) return result;
        }
      }
      return null;
    };

    setCrumbs((prev) => {
      const tmp = findBreadcrumbs(solana_categories, category).filter(
        (i) => i.url !== category
      );
      return tmp.length > 1
        ? tmp.filter(
            (i) => !solana_categories.map((i1) => i1.url).includes(i.url)
          )
        : tmp;
    });
  }, [category]);

  if (!isMainCategory) {
    return (
      <div>
        {crumbs &&
          crumbs.length > 0 &&
          crumbs.slice(0, 1).map((i, idx) => (
            <Link
              key={`crumb-link-${idx}`}
              href={`${BASE_URL}/${i.url}`}
              className="font-bold text-theme-500 hover:underline hover:text-theme-600 uppercase"
            >
              <div className="flex items-center">
                <FluentChevronLeft width={20} height={20} />
                <div>{i.name}</div>
              </div>
            </Link>
          ))}
      </div>
    );
  }
}

export default BreadCrumbs;
