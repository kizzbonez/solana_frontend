"use client";
import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Rating } from "@smastrom/react-rating";
import { useSolanaCategories } from "@/app/context/category";
import { formatPrice, parseRatingCount } from "@/app/lib/helpers";
import AddToCartButtonWrap from "./AddToCartButtonWrap";
import { useCart } from "@/app/context/cart";

function PriceDisplay({ price, compare_at_price }) {
  const locale = "en-US";
  const options = {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  };
  const display_price = useMemo(() => {
    return Math.floor(price); // extract the dollar part
  }, [price]);

  const display_cents = useMemo(() => {
    const cents = Math.round((price - Math.floor(price)) * 100);
    return cents.toString().padStart(2, "0");
  }, [price]);

  const display_regular_price = useMemo(() => {
    if (
      compare_at_price &&
      compare_at_price !== "" &&
      compare_at_price !== 0 &&
      compare_at_price !== "0"
    ) {
      return parseFloat(compare_at_price)?.toFixed(2);
    }
    return null;
  }, [compare_at_price]);

  if (!price || typeof price !== "number") return;

  return (
    <div className="text-lg font-medium text-left">
      {display_price.toLocaleString(locale, options)}
      <sup className="text-xs">{display_cents}</sup>
      {display_regular_price ? (
        <sup className="text-xs ml-2 line-through font-normal">
          ${display_regular_price}
        </sup>
      ) : null}
    </div>
  );
}

function CompareProductCard({ is_active = false, product }) {
  const { getProductUrl } = useSolanaCategories();
  const { addToCartLoading } = useCart();
  const product_image = useMemo(() => {
    if (product && product?.images) {
      const img =
        product.images.find(({ position }) => position === 1)?.src || null;
      return img;
    }
    return null;
  }, [product]);

  return (
    <div className="py-1 px-5 min-w-[200px] max-w-[200px]">
      <div className="p-2">
        <div className="aspect-1 relative bg-white border border-white">
          {product_image && product && (
            <Image
              src={product_image}
              alt={product?.title || "Product Image"}
              title={product?.title || "Product Image"}
              fill
              style={{ objectFit: "contain" }}
            />
          )}
        </div>
      </div>
      <Link prefetch={false} href={getProductUrl(product)}>
        <h4
          className="text-xs font-normal line-clamp-3 text-left hover:underline"
          title={product?.title}
        >
          {product?.title}
        </h4>
      </Link>

      <Rating
        readOnly
        value={parseRatingCount(product?.ratings?.rating_count)}
        fractions={2}
        style={{ maxWidth: 100 }}
      ></Rating>

      <PriceDisplay
        price={product?.variants?.[0]?.price}
        compare_at_price={product?.variants?.[0]?.compare_at_price}
      />

      <div className="w-full flex justify-center items-center mt-3">
        {is_active ? (
          <AddToCartButtonWrap product={product}>
            <button
              disabled={addToCartLoading}
              className="text-white border-2 border-theme-600 font-bold uppercase py-1 px-4 rounded-sm bg-theme-600"
            >
              Add To Cart
            </button>
          </AddToCartButtonWrap>
        ) : (
          <Link
            prefetch={false}
            href={getProductUrl(product)}
            title={product?.title}
            className="text-theme-600 border-2 border-theme-600 font-bold uppercase py-1 px-4 rounded-sm bg-white"
          >
            View
          </Link>
        )}
      </div>
    </div>
  );
}

export default CompareProductCard;
