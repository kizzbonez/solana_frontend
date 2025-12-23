"use client";
import { Rating } from "@smastrom/react-rating";
import { useState, useEffect } from "react";
import { createSlug, formatPrice } from "@/app/lib/helpers";
import Link from "next/link";
import { AkarIconsShippingV1 } from "../icons/lib";
import { BASE_URL } from "@/app/lib/helpers";
import { useSolanaCategories } from "@/app/context/category";
import { Icon } from "@iconify/react";

// Utility functions
const parseRatingCount = (value) => {
  if (typeof value === "string") {
    value = value.replace(/[^\d]/g, "");
  }
  const count = parseInt(value, 10);
  return isNaN(count) ? 0 : count;
};

const calculateSavings = (comparePrice, currentPrice) => {
  const savings = comparePrice - currentPrice;
  const percentage = ((savings / comparePrice) * 100).toFixed(0);
  return { savings, percentage };
};

// Sub-components
const OnsaleTag = ({ variant }) => {
  const comparePrice = variant?.compare_at_price || 0;
  const price = variant?.price || 0;

  if (comparePrice && price && comparePrice > price) {
    return (
      <div className="py-[2px] px-[10px] text-white bg-theme-500 w-fit rounded-r-full text-xs md:text-base font-semibold">
        ON SALE
      </div>
    );
  }
  return null;
};

const VariantItemLink = ({ product, comparePrice, type = "openbox" }) => {
  if (!product || !comparePrice) return null;

  const productPrice = product?.variants?.[0]?.price || 0;
  const { savings, percentage } = calculateSavings(comparePrice, productPrice);

  const isOpenBox = type === "openbox";

  // Different text formats for open box vs new items
  const priceText = isOpenBox
    ? `Open Box: From $${formatPrice(productPrice)} - Save $${formatPrice(
        savings
      )} (${percentage}%)`
    : `Brand New at $${formatPrice(productPrice)} (+$${formatPrice(
        Math.abs(savings)
      )})`;

  const savingsColor = isOpenBox
    ? "text-orange-700 group-hover:text-orange-400"
    : "text-blue-700 group-hover:text-blue-400";

  return (
    <Link
      href={`${BASE_URL}/${createSlug(product?.brand)}/product/${
        product?.handle
      }`}
      target="_blank"
      rel="noopener noreferrer"
      className="py-2 px-5 border-[transparent] hover:bg-stone-800 group hover:border-neutral-300 transition-all border-b border-stone-400"
    >
      <div className="line-clamp-1 text-xs font-bold text-stone-700 text-center group-hover:text-white group-hover:font-medium">
        {product?.title}
      </div>
      <div
        className={`font-bold text-center text-xs group-hover:font-medium ${savingsColor}`}
      >
        {priceText}
      </div>
    </Link>
  );
};

const ProductOffersSection = ({
  products,
  productPrice,
  title = "Save Big - Shop Open Box",
  type = "openbox", // "openbox" or "new"
}) => {
  if (!products || !Array.isArray(products) || products.length === 0)
    return null;

  const isOpenBox = type === "openbox";

  // Styling configurations based on type
  const styles = {
    openbox: {
      headerBg: "bg-gradient-to-r from-amber-600 to-orange-600",
      icon: "mdi:package-variant",
      iconColor: "text-amber-200",
      badge: "OPEN BOX DEAL",
      badgeBg: "bg-amber-500",
    },
    new: {
      headerBg: "bg-gradient-to-r from-blue-600 to-cyan-600",
      icon: "mdi:seal",
      iconColor: "text-blue-200",
      badge: "NEW ITEM DEAL",
      badgeBg: "bg-blue-500",
    },
  };

  const currentStyle = isOpenBox ? styles.openbox : styles.new;

  return (
    <div className="relative overflow-hidden">
      {/* Corner Badge */}
      <div className="absolute top-0 right-0 z-10 pointer-events-none">
        <div
          className={`${currentStyle.badgeBg} text-white text-[9px] font-bold px-2 py-0.5 transform rotate-0 shadow-sm`}
        >
          {currentStyle.badge}
        </div>
      </div>

      {/* Header with Icon */}
      <div
        className={`font-bold ${currentStyle.headerBg} text-white px-2 py-1.5 flex items-center justify-center gap-2 uppercase rounded relative z-0 text-sm`}
      >
        <Icon
          icon={currentStyle.icon}
          className={`${currentStyle.iconColor} text-lg`}
        />
        <span>{title}</span>
        <Icon
          icon={currentStyle.icon}
          className={`${currentStyle.iconColor} text-lg`}
        />
      </div>

      {/* Products List */}
      <div className="flex flex-col w-full mt-2 relative z-0">
        {products.map((product, index) => (
          <VariantItemLink
            key={`product-offer-${index}`}
            product={product}
            comparePrice={productPrice}
            type={type}
          />
        ))}
      </div>
    </div>
  );
};

const PriceDisplay = ({ variant, isFreeShipping }) => {
  const price = variant?.price || 0;
  const comparePrice = variant?.compare_at_price || 0;
  const hasDiscount = price > 0 && comparePrice > price;

  if (!hasDiscount) {
    return (
      <div className="text-3xl md:text-4xl font-extrabold text-pallete-green">
        ${formatPrice(price)}
      </div>
    );
  }

  const { percentage, savings } = calculateSavings(comparePrice, price);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-3 items-center flex-wrap">
        <div className="text-3xl md:text-4xl font-extrabold text-pallete-green">
          ${formatPrice(price)}
        </div>
        {percentage > 0 && (
          <div className="text-base md:text-lg bg-red-600 px-3 rounded-full py-1 font-bold text-white select-none">
            SAVE {percentage}%
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        {percentage > 0 && (
          <div className="text-base md:text-lg font-semibold text-stone-400 line-through">
            ${formatPrice(comparePrice)}
          </div>
        )}
        {isFreeShipping && (
          <div className="text-base md:text-lg font-bold text-green-700">
            + Free Shipping
          </div>
        )}
      </div>
    </div>
  );
};

const ProductInfo = ({ product, reviews }) => {
  const sku = product?.variants?.[0]?.sku;
  const ratingValue = parseRatingCount(product?.ratings?.rating_count); // old ratingValue

  return (
    <>
      <div className="space-y-1">
        <div className="font-bold text-lg md:text-2xl text-stone-900 leading-tight">
          {product?.title}
        </div>
        <div className="text-stone-500 text-sm md:text-base uppercase">
          <Link
            prefetch={false}
            href="#"
            className="hover:text-stone-700 transition-colors"
          >
            {product?.brand + " "}
          </Link>
          <span className="text-stone-400">&#9679;</span> SKU:{" "}
          <span className="font-medium">{sku}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Rating
          value={reviews?.overall_rating || 5}
          style={{ maxWidth: 110 }}
          readOnly
        />
        <Link
          href="#customer-review-section"
          prefetch={false}
          className="text-neutral-700 hover:text-neutral-800 hover:underline transition-all"
        >
          ({reviews?.count || 0})
        </Link>
      </div>

      <div className="text-sm md:text-base flex items-center gap-2 text-stone-600 font-medium">
        <AkarIconsShippingV1 width={24} height={24} />
        <span>Ships Within 1 to 2 Business Days</span>
      </div>
    </>
  );
};

const ProductCategoryChips = ({ product }) => {
  const [categories, setCategories] = useState([]);
  const { getProductCategoriesV2 } = useSolanaCategories();
  useEffect(() => {
    if (product) {
      const cats = getProductCategoriesV2(product);
      setCategories(cats);
    }
  }, [product]);
  return (
    <div className="flex flex-wrap gap-1">
      {categories.map((category, index) => (
        <Link
          prefetch={false}
          href={`${BASE_URL}/${createSlug(category)}`}
          key={`category-chip-item-${index}-${category}`}
          className="bg-theme-600 text-xs text-white text-medium py-1 px-5 rounded-full border-2 border-neutral-900/10 hover:bg-theme-500"
        >
          {category}
        </Link>
      ))}
    </div>
  );
};

// Main Component
const ProductToCart = ({ product, loading, reviews }) => {
  const { isPriceVisible } = useSolanaCategories();
  const [productData, setProductData] = useState(product);
  const [isGalleryFullscreen, setIsGalleryFullscreen] = useState(false);

  useEffect(() => {
    setProductData(product);
  }, [product]);

  // Monitor fullscreen state from MediaGallery
  useEffect(() => {
    const checkFullscreen = () => {
      setIsGalleryFullscreen(
        document.body.classList.contains("gallery-fullscreen-active")
      );
    };

    // Check initially
    checkFullscreen();

    // Set up a MutationObserver to watch for class changes on body
    const observer = new MutationObserver(checkFullscreen);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const variant = productData?.variants?.[0];
  const showPrice = isPriceVisible(
    productData?.product_category,
    productData?.brand
  );

  // Dynamic z-index: negative when gallery is fullscreen, positive otherwise
  const zIndexClass = isGalleryFullscreen ? "-z-20" : "z-0";

  return (
    <div className={`flex flex-col gap-4 w-full relative ${zIndexClass}`}>
      <ProductInfo product={productData} reviews={reviews} />

      {!showPrice ? (
        <div className="font-semibold text-base md:text-lg text-stone-700 py-2">
          Contact us for pricing.
        </div>
      ) : (
        <div className="space-y-3">
          <PriceDisplay
            variant={variant}
            isFreeShipping={productData?.is_free_shipping}
          />
        </div>
      )}

      <ProductCategoryChips product={productData} />

      <ProductOffersSection
        products={productData?.open_box}
        productPrice={variant?.price}
        title="Save Big - Shop Open Box"
        type="openbox"
      />

      <ProductOffersSection
        products={productData?.new_items}
        productPrice={variant?.price}
        title="Factory Sealed - Full Warranty"
        type="new"
      />
    </div>
  );
};

export default ProductToCart;
