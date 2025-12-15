"use client";
import ProductSection from "@/app/components/pages/product/section/product";
import React, { useState, useEffect, useMemo } from "react";
import useESFetchProductShopify from "@/app/hooks/useESFetchProductShopify";
import { notFound } from "next/navigation";
import ProductPlaceholder from "@/app/components/atom/SingleProductPlaceholder";

const shopify_structure = true;
import Link from "next/link";
import Image from "next/image";
import MediaGallery from "@/app/components/widget/MediaGalleryV2";
import ProductToCart from "@/app/components/widget/ProductToCartV2";
import ProductMetaTabs from "@/app/components/product/meta/Tabs";
import { BASE_URL, createSlug, formatPrice } from "@/app/lib/helpers";
import { useSolanaCategories } from "@/app/context/category";
import { useCart } from "@/app/context/cart";
import FaqSection from "@/app/components/molecule/SingleProductFaqSection";
import YouMayAlsoLike from "@/app/components/molecule/YouMayAlsoLike";
import CompareProductsTable from "@/app/components/molecule/CompareProductsTable";
import ProductReviewSection from "@/app/components/molecule/ProductReviewSection";
import ProductCard from "@/app/components/atom/ProductCard";
import ProductCardV2 from "@/app/components/atom/ProductCardV2";
import ProductCardLoader from "@/app/components/atom/ProductCardLoader";
import { Eos3DotsLoading } from "@/app/components/icons/lib";
import { STORE_CONTACT } from "@/app/lib/store_constants";
import AddToCartWidget from "@/app/components/widget/AddToCartWidget";
import { Icon } from "@iconify/react";
import { getProductsByCollectionId } from "@/app/lib/api";

const BreadCrumbs = ({ slug, product_title }) => {
  const { getNameBySlug } = useSolanaCategories();
  if (!slug && !product_title) {
    return;
  }

  return (
    <div className="flex items-center gap-[10px]">
      <Link
        prefetch={false}
        href={`/`}
        className="hover:underline hover:text-theme-600 transition-all"
      >
        Home
      </Link>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="m11 9l3 3l-3 3"
        />
      </svg>
      <Link
        prefetch={false}
        href={`/${slug}`}
        className="hover:underline hover:text-theme-600 transition-all whitespace-nowrap"
      >
        {getNameBySlug(slug)}
      </Link>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="m11 9l3 3l-3 3"
        />
      </svg>
      <div title={product_title} className="underline line-clamp-1">
        {product_title}
      </div>
    </div>
  );
};

const CategoryChips = ({ categories }) => {
  const { getProductCategories } = useSolanaCategories();
  const [localCategories, setCategories] = useState(
    getProductCategories(categories)
  );

  if (!categories || localCategories.length === 0) {
    return;
  }

  return (
    <div>
      <div className="font-bold text-sm lg:text-lg mb-[15px]">Category</div>
      <div className="flex gap-[5px] flex-wrap">
        {localCategories &&
          localCategories.length > 0 &&
          localCategories.map((v, i) => (
            <div
              key={`category-tag-${createSlug(v)}`}
              className="text-[9px] py-[4px] px-[8px] bg-theme-200 text-theme-700 font-semibold rounded-full"
            >
              {v}
            </div>
          ))}
      </div>
    </div>
  );
};

const ProductOptions = ({ product, slug }) => {
  const [isGalleryFullscreen, setIsGalleryFullscreen] = useState(false);

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

  if (!product && !product?.accentuate_data) {
    return;
  }

  const accentuate_data = product.accentuate_data;

  // Dynamic z-index: negative when gallery is fullscreen, positive otherwise
  const zIndexClass = isGalleryFullscreen ? "-z-20" : "z-0";

  return (
    <div className={`flex flex-col gap-[10px] relative ${zIndexClass}`}>
      {/* Gas type */}
      {accentuate_data?.["bbq.option_related_product"] && (
        <ProductOptionItem
          slug={slug}
          title={accentuate_data?.["bbq.option_title"]}
          options={accentuate_data?.["bbq.option_type"]}
          urls={accentuate_data?.["bbq.option_related_product"]}
          current_url={product.handle}
          product_options={product.sp_product_options}
        />
      )}
      {/* Configuration */}
      {accentuate_data?.["bbq.configuration_product"] && (
        <ProductOptionItem
          slug={slug}
          title={accentuate_data?.["bbq.configuration_heading_title"]}
          options={accentuate_data?.["bbq.configuration_type"]}
          urls={accentuate_data?.["bbq.configuration_product"]}
          current_url={product.handle}
          product_options={product.sp_product_options}
        />
      )}
      {/* Product Size */}
      {accentuate_data?.["bbq.related_product"] && (
        <ProductOptionItem
          slug={slug}
          title={accentuate_data?.["bbq.size_heading_title"]}
          options={accentuate_data?.["size_title"]}
          urls={accentuate_data?.["bbq.related_product"]}
          current_url={product.handle}
          product_options={product.sp_product_options}
        />
      )}
      {/* Product Option */}
      {accentuate_data?.["bbq.product_option_related_product"] && (
        <ProductOptionItem
          slug={slug}
          title={accentuate_data?.["bbq.product_option_heading_title"]}
          options={accentuate_data?.["bbq.product_option_name"]}
          urls={accentuate_data?.["bbq.product_option_related_product"]}
          current_url={product.handle}
          product_options={product.sp_product_options}
        />
      )}
      {/* Hinge */}
      {accentuate_data?.["bbq.hinge_related_product"] && (
        <ProductOptionItem
          slug={slug}
          title={accentuate_data?.["hinge_heading_title"]}
          options={accentuate_data?.["hinge_selection"]}
          urls={accentuate_data?.["bbq.hinge_related_product"]}
          current_url={product.handle}
          product_options={product.sp_product_options}
        />
      )}
    </div>
  );
};

const UpsellPriceDisplay = ({
  product_price,
  other_product_price,
  isSelected,
}) => {
  if (product_price > other_product_price) {
    return (
      <div
        className={`font-semibold ${
          isSelected ? "text-green-200" : "text-green-600"
        }`}
      >
        {`Save $${formatPrice(product_price - other_product_price)}`}
      </div>
    );
  }
  if (product_price < other_product_price) {
    return (
      <div
        className={`font-semibold ${
          isSelected ? "text-red-200" : "text-red-600"
        }`}
      >
        {`Add $${formatPrice(other_product_price - product_price)}`}
      </div>
    );
  }
  if (product_price === other_product_price) {
    return ``;
  }
};

const ProductOptionItem = ({
  title,
  options,
  urls,
  current_url,
  product_options,
  slug,
}) => {
  const [localTitle, setLocalTitle] = useState(null);
  const [localOptions, setLocalOptions] = useState(null);
  const [localUrls, setLocalUrls] = useState(null);
  const [localCurrentUrl, setLocalCurrentUrl] = useState(null);
  const [localProductOptions, setLocalProductOptions] = useState(null);
  const [localSlug, setLocalSlug] = useState(null);
  const [image, setImage] = useState(null);
  const extractOptions = (options) => {
    if (typeof options === "string") {
      return JSON.parse(options);
    } else if (
      Array.isArray(options) ||
      (typeof options === "object" && options !== null)
    ) {
      return options;
    } else {
      console.error("Options is an unexpected data type:", options);
      return null;
    }
  };

  const formatOptionLabel = (label) => {
    const labels = {
      NG: "Natural Gas",
      LP: "Liquid Propane",
    };

    return labels?.[label] || label;
  };

  useEffect(() => {
    // console.log("options", options);

    if (title) {
      setLocalTitle(title);
    }
    if (options) {
      setLocalOptions(extractOptions(options));
    } else {
      const sku_options = [];
      urls.forEach((v, i) => {
        const option =
          product_options.find((item) => item.handle === v)?.variants?.[0]
            ?.sku || "NA";
        sku_options.push(option);
      });
      setLocalOptions(extractOptions(sku_options));
    }
    if (urls) {
      setLocalUrls(extractOptions(urls));
    }
    if (current_url) {
      setLocalCurrentUrl(current_url);
      // setLocalCurrentUrl(extractOptions(current_url));
    }
    if (product_options) {
      setLocalProductOptions(product_options);
      // setLocalProductOptions(extractOptions(product_options));
    }
    if (slug) {
      setLocalSlug(slug);
      // setLocalSlug(extractOptions(slug));
    }
  }, [title, options, urls, current_url, slug]);

  return (
    <div>
      <div className="font-semibold text-base text-neutral-800">
        {localTitle}
      </div>
      <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-[10px]">
        {localOptions &&
          Array.isArray(localOptions) &&
          localOptions.map((item, index) => (
            <Link
              prefetch={false}
              href={`/${localSlug}/product/${localUrls[index]}`}
              title={item}
              key={`${createSlug(title)}-option-${index}`}
              className={`product-option-item-link group relative flex items-center gap-1 p-0 transition-all duration-300 border rounded-lg overflow-hidden ${
                localUrls[index] === localCurrentUrl
                  ? "bg-theme-600 text-white shadow-xs shadow-theme-500/30 border-theme-600 border-2"
                  : "bg-white border-2 border-neutral-300 hover:border-theme-600 hover:shadow-md"
              }`}
            >
              {/* Active Check Icon */}
              {localUrls[index] === localCurrentUrl && (
                <div className="absolute top-1 right-1 z-10 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <Icon icon="mdi:check" className="text-theme-600 text-sm" />
                </div>
              )}

              {/* Image Container */}
              <div
                className={`flex-shrink-0 w-[60px] bg-white h-[60px] overflow-hidden relative p-1`}
              >
                {localProductOptions &&
                  Array.isArray(localProductOptions) &&
                  localProductOptions.find(
                    ({ handle }) => handle === localUrls[index]
                  )?.images?.[0]?.src && (
                    <Image
                      src={
                        localProductOptions.find(
                          ({ handle }) => handle === localUrls[index]
                        )?.images?.[0]?.src
                      }
                      alt={item}
                      width={60}
                      height={60}
                      className="object-contain w-full h-full"
                    />
                  )}
              </div>

              {/* Content Container */}
              <div className="flex flex-col gap-1 min-w-0 flex-1 px-2">
                <div
                  className={`font-semibold text-xs line-clamp-2 ${
                    localUrls[index] === localCurrentUrl
                      ? "text-white"
                      : "text-neutral-800 group-hover:text-theme-600"
                  }`}
                >
                  {formatOptionLabel(item)}
                </div>
                {localProductOptions && Array.isArray(localProductOptions) && (
                  <div className="text-xs">
                    <UpsellPriceDisplay
                      product_price={
                        localProductOptions.find(
                          ({ handle }) => handle === localCurrentUrl
                        )?.variants?.[0]?.price
                      }
                      other_product_price={
                        localProductOptions.find(
                          ({ handle }) => handle === localUrls[index]
                        )?.variants?.[0]?.price
                      }
                      isSelected={localUrls[index] === localCurrentUrl}
                    />
                  </div>
                )}
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

const FBTSection = ({ products }) => {
  if (!products || !Array.isArray(products) || products.length === 0) return;
  const displayItems = 4;
  return (
    <div className="p-4">
      <div className="container max-w-7xl px-[0px] sm:px-[20px] mx-auto">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Frequently Bought Together
        </h3>
        <div className="mt-6 gap-4 sm:mt-8 flex flex-wrap">
          {products && Array.isArray(products) && products.length > 0
            ? products.map((item, idx) => (
                <div
                  key={`product-card-wrapper-${idx}`}
                  className={`space-y-6 overflow-hidden ${
                    displayItems === 4 &&
                    "w-[calc(50%-10px)] md:w-[calc(33%-10px)] lg:w-[calc(25%-12px)]"
                  } ${
                    (displayItems === undefined || displayItems === 3) &&
                    "w-[calc(50%-10px)] lg:w-[calc(33%-10px)]"
                  }`}
                >
                  <ProductCard key={`product-card-${item}`} hit={item} />
                </div>
              ))
            : makeArray(displayItems ?? 3).map((item, idx) => (
                <div
                  key={`product-card-${idx}`}
                  className={`space-y-6 overflow-hidden ${
                    displayItems === 4 &&
                    "w-[calc(50%-10px)] md:w-[calc(33%-10px)] lg:w-[calc(25%-12px)]"
                  } ${
                    (displayItems === undefined || displayItems === 3) &&
                    "w-[calc(50%-10px)] lg:w-[calc(33%-10px)]"
                  }`}
                >
                  <ProductCardLoader />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

const makeArray = (n) => {
  return Array.from({ length: n }, (_, i) => i);
};

const RecentViewedProducts = ({ recents }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const displayItems = 4;
  useEffect(() => {
    if (!recents || !Array.isArray(recents) || recents.length < 1) return;
    const getProducts = async () => {
      const raw = await fetch(
        `/api/es/products-by-ids?${recents
          .map((item) => `product_ids=${item}`)
          .join("&")}`
      );

      const response = await raw.json();

      if (response?.data) {
        setProducts(response.data);
      }
      setLoading(false);
    };

    getProducts();
  }, [recents]);

  if (!recents || !Array.isArray(recents) || recents.length < 1) {
    return; // dont display the component
  }

  if (products.length === 0 && !loading) {
    return <div>NO DATA</div>;
  }

  return (
    <div className="p-4">
      <div className="container max-w-7xl px-[0px] sm:px-[20px] mx-auto">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Recently Viewed
        </h3>
        <div className="mt-6 gap-4 sm:mt-8 flex flex-wrap">
          {!loading &&
          products &&
          Array.isArray(products) &&
          products.length > 0
            ? products.slice(0, 4).map((item, idx) => (
                <div
                  key={`product-card-wrapper-${idx}`}
                  className={`space-y-6 overflow-hidden ${
                    displayItems === 4 &&
                    "w-[calc(50%-10px)] md:w-[calc(33%-10px)] lg:w-[calc(25%-12px)]"
                  } ${
                    (displayItems === undefined || displayItems === 3) &&
                    "w-[calc(50%-10px)] lg:w-[calc(33%-10px)]"
                  }`}
                >
                  <ProductCard key={`product-card-${item}`} hit={item} />
                </div>
              ))
            : makeArray(displayItems ?? 3).map((item, idx) => (
                <div
                  key={`product-card-${idx}`}
                  className={`space-y-6 overflow-hidden ${
                    displayItems === 4 &&
                    "w-[calc(50%-10px)] md:w-[calc(33%-10px)] lg:w-[calc(25%-12px)]"
                  } ${
                    (displayItems === undefined || displayItems === 3) &&
                    "w-[calc(50%-10px)] lg:w-[calc(33%-10px)]"
                  }`}
                >
                  <ProductCardLoader />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

const DiscountLinksSection = () => {
  const [isGalleryFullscreen, setIsGalleryFullscreen] = useState(false);

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

  const links = [
    {
      hidden: false,
      url: `tel:${STORE_CONTACT}`,
      label: "Phone Discounts",
      icon: "mdi:phone",
    },
    {
      hidden: false,
      url: `${BASE_URL}/package-deals`,
      label: "Package Deals",
      icon: "mdi:package-variant-closed",
    },
    {
      hidden: false,
      url: `${BASE_URL}/open-box`,
      label: "Open Box",
      icon: "mdi:package-variant",
    },
    {
      hidden: false,
      url: `${BASE_URL}/close-out-deals`,
      label: "Close Out",
      icon: "mdi:sale",
    },
    {
      hidden: false,
      url: ``,
      label: "Scratch + Dent",
      icon: "mdi:hammer-wrench",
    },
    {
      hidden: false,
      url: ``,
      label: "Low Monthly Payments",
      icon: "mdi:calendar-month",
    },
    {
      hidden: false,
      url: ``,
      label: "Free Accessory Bundle",
      icon: "mdi:gift",
    },
  ];

  // Dynamic z-index: negative when gallery is fullscreen, positive otherwise
  const zIndexClass = isGalleryFullscreen ? "-z-20" : "z-0";

  return (
    <div className={`relative overflow-hidden ${zIndexClass}`}>
      {/* Corner Badge */}
      <div className="absolute top-0 right-0 z-10 pointer-events-none">
        <div className="bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 shadow-sm">
          SPECIAL OFFERS
        </div>
      </div>

      {/* Header with Icons */}
      <div className="font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2 py-1.5 flex items-center justify-center gap-2 uppercase rounded relative z-0 text-sm">
        <Icon icon="mdi:tag-multiple" className="text-green-200 text-lg" />
        <span>Discounts & Savings</span>
        <Icon icon="mdi:tag-multiple" className="text-green-200 text-lg" />
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-2 gap-1.5 mt-2 relative z-0">
        {links
          .filter((item) => !item.hidden)
          .map((link, index) => (
            <Link
              key={`discount-section-link-item-${index}`}
              href={`${link.url || "#"}`}
              className="flex gap-1.5 items-center p-1.5 rounded-md bg-white border border-green-200 hover:border-green-400 hover:bg-green-50 hover:shadow-md transition-all group"
            >
              <Icon
                icon={link.icon}
                className="text-green-600 group-hover:text-green-700 text-base flex-shrink-0"
              />
              <div className="text-xs text-stone-700 group-hover:text-green-800 transition-all font-semibold line-clamp-2">
                {link.label}
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

const FrequentlyBoughtTogetherSection = ({ products, product }) => {
  const { addItemsToCart, addToCartLoading } = useCart();
  const { getProductUrl } = useSolanaCategories();
  const [fbwProducts, setFbwProducts] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const isActiveProduct = (item, active_item) => {
    if (!item || !active_item) return false;
    return item?.handle === product?.handle;
  };

  const handleAddSelectionToCart = async () => {
    console.log("selectedItems", selectedItems);
    try {
      if (selectedCount === 0) return;
      const result = await addItemsToCart(selectedItems);
      if (result.status === "success") {
        console.log(result.message);
      }
    } catch (error) {
      console.log("[handleAddSelectionToCart]", error);
    }
  };

  const handleCheckboxChange = (data) => {
    const { id, checked } = data;
    setFbwProducts((prev) => {
      if (!id || !prev) return prev;
      const newProducts = prev.map((item) => ({
        ...item,
        isSelected: item?.product_id === id ? checked : item?.isSelected,
      }));
      return newProducts;
    });
    setUpdateTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (!products) return;
    const tmp_products = [product, ...products].map((item) => ({
      ...item,
      isSelected: true,
      thisProduct: item?.product_id == product?.product_id,
    }));
    setFbwProducts(tmp_products);
  }, [products, product]);

  const total_price = useMemo(() => {
    if (!fbwProducts) return `$${formatPrice("0.00")}`;

    const total = fbwProducts
      .filter((item) => item?.isSelected)
      .map((item) => parseFloat(item.variants?.[0]?.price) || 0)
      .reduce((sum, price) => sum + price, 0);

    return `$${formatPrice(total.toFixed(2))}`;
  }, [fbwProducts, updateTrigger]);

  const hasSelectedItems = useMemo(() => {
    return fbwProducts?.some((item) => item?.isSelected) || false;
  }, [fbwProducts, updateTrigger]);

  const selectedCount = useMemo(() => {
    return fbwProducts?.filter((item) => item?.isSelected).length || 0;
  }, [fbwProducts, updateTrigger]);

  const selectedItems = useMemo(() => {
    return (
      fbwProducts
        ?.filter((item) => item?.isSelected)
        .map((item) => ({ ...item, quantity: 1 })) || []
    );
  }, [fbwProducts, updateTrigger]);

  if (!fbwProducts || fbwProducts.length === 0) return null;

  return (
    <div className="my-5">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Frequently Bought Together
      </h3>
      <div className="flex flex-wrap md:flex-nowrap items-center mt-5 gap-1">
        {selectedItems?.map((item, index) => {
          const productImage = item?.images?.find(
            (img) => img.position === 1
          )?.src;

          return (
            <React.Fragment key={`fbt-product-${index}`}>
              {index > 0 && (
                <Icon
                  icon="mdi:plus"
                  className="text-neutral-600 text-2xl font-bold"
                />
              )}
              <Link
                prefetch={false}
                href={
                  isActiveProduct(item, product) ? "#" : getProductUrl(item)
                }
                className="w-[120px] h-[120px] bg-white rounded-sm border border-neutral-300 relative overflow-hidden group"
              >
                {productImage && (
                  <Image
                    src={productImage}
                    alt={item?.title || "Product"}
                    fill
                    className="object-contain p-2"
                  />
                )}
                <div className="w-full aspect-1 bg-slate-950/70 absolute left-0 top-0 hidden group-hover:flex items-center justify-center transition-all text-white font-bold">
                  {isActiveProduct(item, product) ? "Active" : "View Item"}
                </div>
              </Link>
            </React.Fragment>
          );
        })}
        <div className="flex flex-col justify-between h-[120px] ml-5">
          <div>
            <div>Total</div>
            <div className="text-lg font-semibold">{total_price}</div>
          </div>
          <button
            disabled={!hasSelectedItems}
            onClick={handleAddSelectionToCart}
            className={`rounded-sm bg-theme-600 hover:bg-theme-700 text-white font-bold h-[48px] w-[250px] relative ${
              hasSelectedItems
                ? "bg-neutral-800 hover:bg-neutral-900 text-white cursor-pointer"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            <div className={addToCartLoading === true ? "hidden" : "block"}>
              Add {selectedCount > 0 ? `${selectedCount} ` : ""}selected item
              {selectedCount !== 1 ? "s" : ""} to cart
            </div>
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                addToCartLoading === true ? "visible" : "invisible"
              }`}
            >
              <Eos3DotsLoading width={50} height={50} />
            </div>
          </button>
        </div>
      </div>
      <div className="space-y-1.5 mt-5">
        {fbwProducts.map((product, index) => (
          <FrequentlyBoughtItemV2
            key={`fbw-item-v2-${index}`}
            product={product}
            onChange={handleCheckboxChange}
          />
        ))}
      </div>
    </div>
  );
};

const FrequentlyBoughtItemV2 = ({ product, onChange }) => {
  const [checked, setChecked] = useState(true);
  const handleCheckboxChange = (event) => {
    const newChecked = event.target.checked;
    setChecked(newChecked);
    onChange({ id: product?.product_id, checked: newChecked });
  };

  useEffect(() => {
    setChecked(product?.isSelected);
  }, [product]);

  return (
    <label
      htmlFor={product?.product_id}
      className={`flex items-center gap-5 py-1.5 px-2 cursor-pointer transition-all bg-neutral-200 rounded-sm `}
    >
      {/* Checkbox */}
      <div
        className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center ${
          checked
            ? "bg-theme-600 border-theme-600"
            : "border-neutral-400 bg-white"
        }`}
      >
        {checked && (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-grow min-w-0">
        <div className="text-base text-neutral-700 line-clamp-1 leading-tight">
          {product?.thisProduct ? (
            <>
              <span className="font-semibold">This Item: </span>{" "}
              {product?.title}
            </>
          ) : (
            product?.title
          )}
        </div>
        <div className="text-base font-bold text-theme-600 mt-0.5">
          ${formatPrice(product?.variants?.[0].price)}
        </div>
      </div>

      {/* Hidden Input */}
      <input
        type="checkbox"
        id={product?.product_id}
        checked={checked}
        onChange={handleCheckboxChange}
        className="sr-only"
      />
    </label>
  );
};

const ShopCollectionSection = ({ product }) => {
  const [collectionProducts, setCollectionProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const loader = [1, 2, 3, 4];

  useEffect(() => {
    const brand = product?.brand;
    const collections = product?.collections;
    if (brand && collections) {
      const collection_id =
        collections.find(({ name }) => name === brand)?.id || null;
      if (collection_id) {
        getProductsByCollectionId(collection_id)
          .then((res) => res.json())
          .then((res) => {
            setCollectionProducts(res);
          })
          .catch((err) => {
            console.log("Error", err);
            setCollectionProducts([]);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  }, [product]);

  return (
    <div className="my-5">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Shop This Collection
      </h3>
      <div className="w-full flex gap-1 overflow-x-auto py-1">
        {isLoading &&
          loader &&
          loader.map((item, index) => (
            <div
              key={`loader-collection-product-${index}`}
              className="flex items-center justify-center py-1 px-5 flex-col gap-1  min-w-[220px] max-w-[220px] bg-neutral-100 border border-neutral-200 h-[360px] rounded-sm text-neutral-400"
            >
              Loading...
            </div>
          ))}
        {!isLoading &&
          collectionProducts &&
          Array.isArray(collectionProducts) &&
          collectionProducts.length > 0 &&
          collectionProducts.map((product, index) => (
            <ProductCardV2
              key={`collection-product-${index}`}
              product={product}
            />
          ))}
      </div>
    </div>
  );
};

export default function ProductClient({ params }) {
  const { slug, product_path } = React.use(params);
  const [product, setProduct] = useState(null);
  const [forage, setForage] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const {
    product: fetchedProduct,
    loading,
    error,
  } = useESFetchProductShopify({
    handle: product_path,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;

    import("@/app/lib/localForage").then(async (module) => {
      if (!mounted) return;
      const recent_products = (await module.getItem("recentProducts")) || [];
      setRecentlyViewed(recent_products);
      setForage(module);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (error) {
      notFound();
    }

    if (!loading && fetchedProduct === null) {
      notFound();
    }

    if (fetchedProduct && fetchedProduct.length > 0) {
      setProduct(fetchedProduct[0]);
      console.log("[product]", fetchedProduct[0]);

      if (fetchedProduct[0]?.published) {
        const new_recents = [
          ...new Set([fetchedProduct[0]?.product_id, ...recentlyViewed]),
        ];
        forage.setItem("recentProducts", new_recents.slice(0, 5));
      }
    }
  }, [loading, fetchedProduct, error]);

  if (!product && loading) {
    return <ProductPlaceholder />;
  }

  return (
    <div className="min-h-screen">
      {shopify_structure ? (
        <div className="min-h-screen">
          {/* {product && <JsonViewer product={product} loading={loading} />} */}
          <div className="p-2 bg-stone-700">
            <div className="container max-w-7xl px-[0px] sm:px-[20px] mx-auto flex flex-col gap-[10px]">
              <Link
                prefetch={false}
                href="#"
                className="text-neutral-100 flex items-center justify-center gap-2 text-sm hover:text-theme-400 hover:underline transition-all"
              >
                Shop up to 50% off Grills, Furniture & More
                <svg
                  className="h-5 w-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 12H5m14 0-4 4m4-4-4-4"
                  />
                </svg>
              </Link>
            </div>
          </div>
          <div className="p-2 bg-white">
            <div className="container max-w-7xl px-[0px] sm:px-[20px] mx-auto flex flex-col gap-[10px]">
              <div className="text-stone-800">
                <BreadCrumbs slug={slug} product_title={product?.title} />
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="container max-w-7xl px-[0px] sm:px-[20px] mx-auto flex flex-col lg:flex-row gap-[0px] lg:gap-[40px] py-[20px]">
              <div className="w-full lg:w-[50%] relative">
                <div className="sm:sticky sm:top-[60px]">
                  <div className="w-full px-[5px] mb-0 sm:mb-8 sm:aspect-h-5 lg:aspect-h-4">
                    <MediaGallery mediaItems={product?.images} />
                  </div>
                  {/* {product?.fbt_bundle &&
                    Array.isArray(product?.fbt_bundle) &&
                    product?.fbt_bundle.length > 0 && (
                      <FrequentlyBoughtBundle
                        products={product?.fbt_bundle || []}
                        product={product}
                      />
                    )} */}
                </div>
              </div>
              <div className="w-full lg:w-[50%]">
                <ProductToCart product={product} loading={loading} />
                <div className="py-[10px] flex flex-col gap-[15px] ">
                  <ProductOptions product={product} slug={slug} />
                  {product?.product_category && (
                    <CategoryChips categories={product.product_category} />
                  )}
                </div>
                <DiscountLinksSection />
                <div className="mt-5">
                  {/* QTY Section and Add to Cart Button */}
                  <AddToCartWidget product={product} />
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="container max-w-7xl px-[0px] sm:px-[20px] mx-auto border-t">
              <FrequentlyBoughtTogetherSection
                products={product?.fbt_bundle || []}
                product={product}
              />
              <ShopCollectionSection product={product} />
            </div>
          </div>
          <div className="p-4">
            <div className="container max-w-7xl px-[0px] sm:px-[20px] mx-auto">
              <ProductMetaTabs product={product} />
            </div>
          </div>

          <div className="p-4">
            <div className="container max-w-7xl px-[0px] sm:px-[20px] mx-auto">
              <ProductReviewSection product={product} />
            </div>
          </div>
          {product && product?.sp_product_options && product?.handle && (
            <div className="p-4">
              <div className="container max-w-7xl px-[0px] sm:px-[20px] mx-auto">
                <CompareProductsTable
                  similar_products={product.sp_product_options}
                  product={product}
                />
              </div>
            </div>
          )}
          <FaqSection />
          <FBTSection products={product?.fbt_carousel} />
          <div className="p-4">
            <div className="container max-w-7xl px-[0px] sm:px-[20px] mx-auto">
              <YouMayAlsoLike displayItems={4} />
            </div>
          </div>
          <RecentViewedProducts
            recents={(recentlyViewed || []).filter(
              (item) => item != product?.product_id
            )}
          />
        </div>
      ) : (
        <ProductSection product={product} loading={loading} />
      )}
    </div>
  );
}
