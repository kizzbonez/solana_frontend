import Link from "next/link";
import Image from "next/image";
// COMPONENTS
import StarRating from "@/app/components/new-design/sections/sp/StarRating";
import Badge from "@/app/components/new-design/sections/sp/Badge";
import AddToCartWidget from "@/app/components/new-design/sections/sp/AddToCartWidget";
import ProductOptionItemLink from "@/app/components/new-design/sections/sp/ProductOptionItemLink";
import FicDropDown from "@/app/components/atom/FicDropDown";
import { ICRoundPhone } from "@/app/components/icons/lib";

// HELPERS
import { STORE_CONTACT } from "@/app/lib/store_constants";
import { createSlug, formatPrice } from "@/app/lib/helpers";
import { Icon } from "@iconify/react";

const ProductCategoryChip = ({ category, url = "#" }) => {
  if (!category) {
    return (
      <div
        className={
          //text-red-600 border-red-700/20 bg-red-100/70
          "text-[10px] font-bold text-red-600 border-red-700/20 bg-red-100/70 border px-2.5 py-1 rounded-full uppercase tracking-widest hover:bg-orange-100 transition-colors"
        }
      >
        Category Not Assigned
      </div>
    );
  }

  return (
    <Link
      prefetch={false}
      href={url}
      className={
        "self-start inline-block text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 px-2.5 py-1 rounded-full uppercase tracking-widest hover:bg-orange-100 transition-colors"
      }
    >
      {category}
    </Link>
  );
};

const ProductOptionGroup = ({ option_group }) => {
  if (
    !option_group ||
    !option_group?.options ||
    (option_group?.options || []).length === 0
  )
    return null;
  return (
    <div className="w-full">
      <div className="font-semibold text-base text-neutral-800">
        {option_group?.option_label}
      </div>
      <ProductOptionGroupItems options={option_group?.options} />
    </div>
  );
};

const ProductOptionGroupItems = ({ options }) => {
  return (
    <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-[10px]">
      {options &&
        Array.isArray(options) &&
        options.map((opt, index) => (
          <ProductOptionItemLink
            key={`${createSlug(opt?.title)}-option-${index}`}
            product={opt}
          />
        ))}
    </div>
  );
};

const ProductInfo = ({ product }) => {
  return (
    <div className="flex flex-col gap-5">
      {/* Brand + SKU */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <Link
          href={product?.brand_url || "#"}
          prefetch={false}
          className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 px-2.5 py-1 rounded-full uppercase tracking-widest hover:bg-orange-100 transition-colors"
        >
          {product?.brand}
        </Link>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">
          SKU: {product?.sku}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
        {product?.name}
      </h1>

      <ProductCategoryChip
        category={product?.category}
        url={product?.category_url}
      />

      {/* Rating */}
      {/* <div className="flex items-center gap-3 flex-wrap pb-4 border-b border-gray-100 dark:border-gray-800">
        <StarRating
          rating={product?.ratings}
          showCount
          count={product?.reviews}
        />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {product?.ratings} out of 5
        </span>
        <span className="text-gray-200 dark:text-gray-700">·</span>
      </div> */}

      {/* Price */}
      <div className="flex flex-col items-start gap-3 flex-wrap my-3">
        <div className="text-4xl font-black text-gray-900 dark:text-white">
          ${formatPrice(product?.price)}
        </div>
        {product?.save_pct > 0 && (
          <div className="flex flex-col pb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 line-through">
                ${formatPrice(product?.was)}
              </span>
              <Badge variant="green">SAVE {product?.save_pct}%</Badge>
            </div>
            <span className="text-xs text-neutral-700 dark:text-gray-500 mt-0.5">
              You save <strong>${formatPrice(product?.save_amt)}</strong>
              {product?.is_freeshipping && ` · Free Shipping`}
            </span>
          </div>
        )}
      </div>

      {/* Ships */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <svg
            className="w-4 h-4 text-green-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{product?.ships}</span>
        </div>

        <FicDropDown contact_number={STORE_CONTACT}>
          <div className="text-xs my-[5px] text-blue-500 flex items-center cursor-default gap-[7px] flex-wrap">
            Found It Cheaper?
            <div className="hover:underline flex items-center gap-[3px] cursor-pointer">
              <ICRoundPhone width={16} height={16} /> <div>{STORE_CONTACT}</div>
            </div>
          </div>
        </FicDropDown>
      </div>

      {/* ProductOptions */}
      <div className="flex flex-col gap-4">
        {Array.isArray(product?.product_options) &&
          product.product_options.length > 0 &&
          (product?.product_options || []).map((og, i) => (
            <ProductOptionGroup
              key={`product-option-group-${og?.option_label}-${i}`}
              option_group={og}
            />
          ))}
      </div>

      {/* Discounts */}
      {Array.isArray(product?.discount_links) &&
        product.discount_links.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-md bg-orange-500 flex items-center justify-center text-xs flex-shrink-0">
                🔥
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Discounts & Savings Available
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {product?.discount_links?.map((b, i) => (
                <Link
                  prefetch={false}
                  href={b?.url}
                  key={`discount-links-${b?.label}-${i}`}
                  className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
                >
                  <span className="w-4 h-4 rounded-full bg-orange-100 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-800 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-2 h-2 text-orange-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  {b?.label}
                </Link>
              ))}
            </div>
          </div>
        )}

      {/* Qty + CTA */}
      <div className="flex items-stretch gap-3 flex-wrap">
        {/* ATC WIDGET HERE */}
        <AddToCartWidget product={product} />
        <Link
          href={`tel:${STORE_CONTACT}`}
          className="flex items-center gap-2 h-11 px-4 rounded-xl border-2 border-orange-500 text-orange-600 dark:text-orange-400 text-sm font-bold hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors whitespace-nowrap"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call Expert
        </Link>
      </div>
    </div>
  );
};

export default ProductInfo;
