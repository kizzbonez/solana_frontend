"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/cart";
import Link from "next/link";
import Image from "next/image";
import { BASE_URL, formatPrice, createSlug } from "@/app/lib/helpers";

export default function CartListItem({ item, onItemCountUpdate }) {
  const { removeCartItem } = useCart();
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    if (item?.images) {
      setThumbnail(item.images.find(({ position }) => position === 1)?.src);
    }
  }, [item]);

  const handleRemoveItem = () => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      removeCartItem(item);
    }
  };

  const handleCount = (increment) => {
    onItemCountUpdate({ product: item, increment });
  };

  const price = item?.variants?.[0]?.price || item?.variant_data?.price || 0;
  const compareAtPrice = item?.variants?.[0]?.compare_at_price || item?.variant_data?.compare_at_price || 0;
  const qty = item?.quantity || 1;
  const hasDiscount = Number(compareAtPrice) > 0 && Number(compareAtPrice) > Number(price);
  const discountPct = hasDiscount ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;
  const savings = hasDiscount ? (compareAtPrice - price) * qty : 0;
  const productUrl = `${BASE_URL}/${createSlug(item?.brand || "")}/product/${item?.handle}` || "#";
  const imgSrc = thumbnail || item?.product_image_url;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-4">
      <div className="flex gap-4">
        <Link prefetch={false} href={productUrl} className="flex-shrink-0">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
            {imgSrc && (
              <Image
                src={imgSrc}
                alt={createSlug(item?.title || item?.product_title || "")}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 96px, 112px"
              />
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <Link
            prefetch={false}
            href={productUrl}
            className="text-sm font-semibold text-charcoal dark:text-white hover:text-fire dark:hover:text-orange-400 transition-colors line-clamp-2 leading-snug"
          >
            {item?.title || item?.product_title}
          </Link>

          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm font-bold text-charcoal dark:text-white">
              ${formatPrice(price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs text-stone-400 line-through">${formatPrice(compareAtPrice)}</span>
                <span className="text-[10px] font-bold text-white bg-green-600 px-1.5 py-0.5 rounded-full">
                  {discountPct}% off
                </span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto pt-1 flex-wrap gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCount(false)}
                type="button"
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-charcoal dark:text-white transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 18 2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M1 1h16" />
                </svg>
              </button>
              <span className="w-8 text-center text-sm font-semibold text-charcoal dark:text-white select-none">
                {qty}
              </span>
              <button
                onClick={() => handleCount(true)}
                type="button"
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-charcoal dark:text-white transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 18 18">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 1v16M1 9h16" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {savings > 0 && (
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                  Save ${formatPrice(savings)}
                </span>
              )}
              <span className="text-sm font-bold text-charcoal dark:text-white">
                ${formatPrice(price * qty)}
              </span>
              <button
                type="button"
                title="Remove item"
                onClick={handleRemoveItem}
                className="text-stone-300 hover:text-red-500 dark:text-stone-600 dark:hover:text-red-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
