"use client";

import React, { useState, useEffect, useMemo } from "react";
import { formatPrice, formatProduct } from "@/app/lib/helpers";
import { useReveal } from "@/app/hooks/useReveal";
import { useSolanaCategories } from "@/app/context/category";
import AddToCartButtonWrap from "@/app/components/atom/AddToCartButtonWrap";
import Link from "next/link";
import Image from "next/image";

const PRODUCT_TABS = [
  {
    name: "All",
    collection_id: 137,
  },
  {
    name: "Fireplaces",
    collection_id: 953,
  },
  {
    name: "Built-In Grills",
    collection_id: 954,
  },
  {
    name: "Freestanding Grills",
    collection_id: 955,
  },
  {
    name: "Accessories",
    collection_id: 78,
  },
  {
    name: "Open Box",
    collection_id: 480,
  },
];

const VIEW_ALL_URL = "/blaze-outdoor-products";

async function getProductsByCollectionId(id) {
  // Use a full URL if calling from the server, or relative if client-side
  const res = await fetch(`/api/collections/collection-products/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

function ProductCard({ product }) {
  const ref = useReveal();

  const onSale = !!product.was && product?.save_amt > 0;

  return (
    <article
      ref={ref}
      className="
        opacity-0 translate-y-6 transition-all duration-700
        rounded-xl overflow-hidden bg-white dark:bg-stone-900
        border border-stone-100 dark:border-stone-800
        hover:shadow-[0_12px_48px_rgba(0,0,0,.15)] dark:hover:shadow-[0_12px_48px_rgba(0,0,0,.5)]
        hover:-translate-y-1 group flex flex-col
      "
    >
      {/* Image */}
      <Link href={product?.url || "#"} aria-label={product?.title} title={product?.title}>
        <div className="relative h-48 bg-white">
          {onSale && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="bg-red-500 text-white text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full">
                -{product?.save_pct}%
              </span>
            </div>
          )}
          {product?.image && (
            <Image
              src={product?.image}
              alt={product?.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-0.5">
          {product?.brand}
        </p>
        <Link href={product?.url || "#"} aria-label={product?.title} title={product?.title}>
          <h3 className="font-serif text-base text-charcoal dark:text-white mb-2 leading-snug line-clamp-2">
            {product?.title}
          </h3>
        </Link>
        <div className="flex items-center gap-0.5 mb-3">
          <span className="text-amber-400 text-xs">
            {"★".repeat(Math.round(product?.ratings || 0))}
          </span>
          <span className="text-stone-300 dark:text-stone-600 text-xs">
            {"★".repeat(5 - Math.round(product?.ratings || 0))}
          </span>
        </div>

        {/* Price + Button */}
        <div className="mt-auto">
          {onSale ? (
            <div className="flex items-end justify-between gap-2">
              <div>
                <s className="text-xs text-stone-400 block leading-none mb-0.5">
                  ${formatPrice(product?.was)}
                </s>
                <span className="text-lg font-bold text-red-500">
                  ${formatPrice(product?.price)}
                </span>
              </div>
              <AddToCartButtonWrap product={product}>
                <button
                  aria-label={`Add ${product.title} to cart`}
                  className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-lg font-light transition-colors duration-200"
                >
                  +
                </button>
              </AddToCartButtonWrap>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-charcoal dark:text-white">
                ${formatPrice(product?.price)}
              </span>
              <AddToCartButtonWrap product={product}>
                <button
                  aria-label={`Add ${product?.title} to cart`}
                  className="flex-shrink-0 w-9 h-9 rounded-lg bg-fire hover:bg-fire-light text-white flex items-center justify-center text-lg font-light transition-colors duration-200"
                >
                  +
                </button>
              </AddToCartButtonWrap>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

const MOBILE_INITIAL = 2;

export default function Products({ initialProducts = [] }) {
  const [products, setProducts] = useState((initialProducts || []).map(i => formatProduct(i)));
  const [active, setActive] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const hdrRef = useReveal();

  const handleChangeTab = async (tab) => {
    setActive(tab?.name);
    setShowAll(false);
    const newProducts = await getProductsByCollectionId(tab?.collection_id);
    setProducts((newProducts || []).map(i => formatProduct(i)));
  };

  return (
    <section
      id="products"
      className="py-20 md:py-24 bg-cream dark:bg-stone-950"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div
          ref={hdrRef}
          className="
            opacity-0 translate-y-6 transition-all duration-700
            flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10
          "
        >
          <div>
            <p className="text-[11px] tracking-[.15em] uppercase font-semibold text-fire mb-1.5">
              Featured Products
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal dark:text-white mb-4 leading-tight">
              Blaze Bestsellers
            </h2>
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {PRODUCT_TABS.map((t, index) => (
                <button
                  key={`product-tabs-${t?.name}-${index}`}
                  onClick={() => handleChangeTab(t)}
                  className={`
                    px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200
                    ${
                      active === t?.name
                        ? "border-fire text-fire bg-fire/5"
                        : "border-stone-200 dark:border-stone-700 text-stone-400 dark:text-stone-500 hover:border-fire hover:text-fire"
                    }
                  `}
                >
                  {t?.name}
                </button>
              ))}
            </div>
          </div>
          <Link
            href={VIEW_ALL_URL}
            className="
            inline-flex items-center gap-2 px-7 py-3 rounded-lg
            border-2 border-fire text-fire hover:bg-fire hover:text-white
            font-semibold text-sm transition-all duration-200 self-start sm:self-auto flex-shrink-0
          "
          >
            View All Products
          </Link>
        </div>

        {/* Grid: 2 col mobile → 2 col tablet → 4 col desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.length === 0 ? (
            <>
              {/* Mobile: 2 skeletons; desktop: 4 */}
              {[...Array(2)].map((_, i) => (
                <div key={`skeleton-${i}`} className="rounded-xl bg-stone-100 dark:bg-stone-800 h-64 animate-pulse" />
              ))}
              {[...Array(2)].map((_, i) => (
                <div key={`skeleton-d-${i}`} className="hidden sm:block rounded-xl bg-stone-100 dark:bg-stone-800 h-64 animate-pulse" />
              ))}
            </>
          ) : (
            <>
              {/* Mobile: first 2 always rendered */}
              {products.slice(0, MOBILE_INITIAL).map((p, i) => (
                <ProductCard key={`product-${p.title}-${i}`} product={p} />
              ))}
              {/* Mobile: rest only rendered after "Show All" click; always shown on sm+ */}
              {products.slice(MOBILE_INITIAL, 4).map((p, i) => (
                showAll
                  ? <ProductCard key={`product-more-${p.title}-${i}`} product={p} />
                  : <div key={`product-more-${p.title}-${i}`} className="hidden sm:block"><ProductCard product={p} /></div>
              ))}
            </>
          )}
        </div>

        {/* Show All — mobile only */}
        {!showAll && products.length > MOBILE_INITIAL && (
          <div className="mt-8 text-center sm:hidden">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-fire text-fire font-semibold text-sm hover:bg-fire hover:text-white transition-all duration-200"
            >
              Show All Products ({products.length - MOBILE_INITIAL} more)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
