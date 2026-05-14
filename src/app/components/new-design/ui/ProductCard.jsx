"use client";
import { useState, useMemo } from "react";
import { useSolanaCategories } from "@/app/context/category";

import Link from "next/link";
import Image from "next/image";

import AddToCartButtonWrap from "@/app/components/atom/AddToCartButtonWrap";
import FicDropDown from "@/app/components/atom/FicDropDown";
import { ICRoundPhone } from "@/app/components/icons/lib";
import { STORE_CONTACT } from "@/app/lib/store_constants";
import { useQuickView } from "@/app/context/quickview";
import { formatPrice, formatProduct } from "@/app/lib/helpers";
import StarRating from "@/app/components/new-design/ui/StarRating";

const BADGE_STYLES = {
  bestseller: "bg-orange-500 text-white",
  sale: "bg-green-600 text-white",
  new: "bg-blue-600 text-white",
  openbox: "bg-violet-600 text-white",
};
const BADGE_LABELS = {
  bestseller: "Bestseller",
  sale: "Sale",
  new: "New",
  openbox: "Open Box",
};

// Simple SVG fireplace placeholder
function FireplaceThumb({ product }) {
  const mainImage = useMemo(() => {
    return product?.images?.find(({ position }) => position == 1)?.src;
  }, [product]);

  if (!mainImage) return null;

  return (
    <Image
      src={mainImage}
      alt={product?.name || "Product Image"}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover transition-transform duration-300 group-hover:scale-105"
      priority={false} // Set to true if this is "above the fold"
    />
  );
}

function ProductCard({ hit, page_details, onCompare }) {
  const { viewItem } = useQuickView();
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const { isPriceVisible, getProductUrl } = useSolanaCategories();
  const [product, setProduct] = useState(formatProduct(hit, "card"))

  function handleAdd() {
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-neutral-200/60 dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="relative h-52 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <Link aria-label={product?.name} title={product?.name} href={product?.url} prefetch={false}>
          <FireplaceThumb product={hit} />
        </Link>

        {/* badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-0">
          {product?.badge && (
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${BADGE_STYLES[product?.badge]}`}
            >
              {BADGE_LABELS[product?.badge]}
            </span>
          )}
        </div>
        {/* wishlist */}
        {/* <button
          onClick={() => setWished(!wished)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors z-10 ${wished ? "bg-white dark:bg-neutral-800 text-orange-500" : "bg-white/80 dark:bg-neutral-800/80 text-neutral-400 hover:text-orange-500"}`}
        >
          <svg
            className="w-4 h-4"
            fill={wished ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button> */}
        {/* compare */}
        {/* <button
          onClick={() => onCompare(product)}
          className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm text-neutral-700 dark:text-neutral-200 px-2.5 py-1 rounded-lg font-medium hover:bg-orange-500 hover:text-white transition-colors z-10"
        >
          + Compare
        </button> */}
      </div>
      {/* Body */}
      <div className="p-4">
        <p
          title={product?.brand}
          className="line-clamp-1 text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1 font-medium"
        >
          {product?.brand}
        </p>
        <Link aria-label={product?.name} title={product?.name} href={product?.url} prefetch={false}>
          <h2
            className="line-clamp-2 min-h-[38.5px] text-sm font-semibold text-neutral-900 dark:text-white leading-snug mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {product?.name}
          </h2>
        </Link>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <StarRating rating={product?.ratings} />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {product?.ratings} {!!product?.reviews && `(${product?.reviews})`}
            </span>
          </div>
          {/* <span className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-md">
            {product?.spec}
          </span> */}
        </div>
        {/* Footer */}
        <div className="flex items-end justify-between gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <div className="min-h-[46px]">
            {!isPriceVisible(hit?.product_category, hit?.brand) ? (
              <div className="font-medium text-[14px] text-stone-700">
                Contact us for pricing.
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-neutral-900 dark:text-white">
                    ${formatPrice(product?.price)}
                  </span>
                  {!!product?.was && (
                    <span className="text-xs text-neutral-400 line-through">
                      ${formatPrice(product?.was)}
                    </span>
                  )}
                </div>
                {!!(product?.was && product?.was > product?.price) && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">
                    Save ${formatPrice(product.was - product.price)}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => viewItem(hit)}
            aria-label="Quick view"
            className="w-9 h-9 min-w-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-300 hover:bg-neutral-800 dark:hover:bg-neutral-600 hover:text-white dark:hover:text-white transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <AddToCartButtonWrap product={{...formatProduct(hit,"card"), quantity:1}}>
            <button
              onClick={handleAdd}
              className={`w-full flex justify-center   items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${added ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
              </svg>
              Add
            </button>
          </AddToCartButtonWrap>
        </div>
        <FicDropDown contact_number={page_details?.contact_number}>
          <div className="text-xs my-[5px] text-blue-500 flex items-center cursor-default gap-[7px] flex-wrap">
            {!isPriceVisible(hit?.product_category, hit?.brand) ? (
              <>Call for Price </>
            ) : (
              <>Found It Cheaper? </>
            )}
            <div className="hover:underline flex items-center gap-[3px] cursor-pointer">
              <ICRoundPhone width={16} height={16} />{" "}
              <div>{page_details?.contact_number || STORE_CONTACT}</div>
            </div>
          </div>
        </FicDropDown>
      </div>
    </article>
  );
}

export default ProductCard;

//  Where You Left: Generate New Product Page Base On AI Mockup
