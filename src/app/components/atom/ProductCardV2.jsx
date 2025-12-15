"use client";
import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Rating } from "@smastrom/react-rating";
import { useSolanaCategories } from "@/app/context/category";
import { formatPrice, parseRatingCount } from "@/app/lib/helpers";
import AddToCartButtonWrap from "@/app/components/atom/AddToCartButtonWrap";
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
    <div className="text-lg font-medium text-left text-stone-700">
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

function ProductCardV2({ is_active = false, product }) {
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
    <div className="py-1 px-5 flex flex-col gap-1 justify-between min-w-[220px] max-w-[220px] group">
      <div className="flex flex-col gap-1">
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
            className="text-sm text-stone-900  line-clamp-3 text-left hover:underline group-hover:text-theme-600 min-h-[60px]"
            title={product?.title}
          >
            {product?.title}
          </h4>
        </Link>

        <Rating
          readOnly
          value={parseRatingCount(product?.ratings?.rating_count)}
          fractions={2}
          style={{ maxWidth: 80 }}
        ></Rating>

        <PriceDisplay
          price={product?.variants?.[0]?.price}
          compare_at_price={product?.variants?.[0]?.compare_at_price}
        />

        {/* <div className="text-xs underline text-stone-700">
          As low as $84 per month*
        </div>

        <div className="text-green-700 text-sm mt-5">Free Shipping</div>
        <div className="text-xs text-stone-700">
          <div>Leaves Warehouse:</div>
          <div>24hrs</div>
        </div> */}
      </div>
      <div className="w-full flex justify-center items-center mt-3">
        <AddToCartButtonWrap product={product}>
          <button
            disabled={addToCartLoading}
            className="text-white font-bold uppercase py-2 px-5 rounded-sm bg-theme-600"
          >
            Add To Cart
          </button>
        </AddToCartButtonWrap>
      </div>
    </div>
  );
}

export default ProductCardV2;
