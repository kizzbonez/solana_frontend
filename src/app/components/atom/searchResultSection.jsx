"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

import { useSolanaCategories } from "@/app/context/category";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_BASE_URL;
const COLLAPSED_LIMIT = 3;

// Helper function to capitalize first letter of each word
const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper component for hover container
const HoverContainer = ({ children, className = "" }) => (
  <div className={`group hover:bg-stone-50 px-2 py-[5px] ${className}`}>
    {children}
  </div>
);

// Helper component for text-based items (recent, suggestion, popular)
const SimpleTextItem = ({ text }) => (
  <HoverContainer>
    <div className="text-[14px] group-hover:text-theme-600 my-2">{text}</div>
  </HoverContainer>
);

// Helper component for items with label (category, brand)
const LabeledTextItem = ({ text, label }) => (
  <HoverContainer>
    <div className="text-[14px] group-hover:text-theme-600">{text}</div>
    <div className="text-[10px] text-gray-500 font-normal">{label}</div>
  </HoverContainer>
);

// Helper component for product image
const ProductImage = ({ product }) => {
  const primaryImage = useMemo(() => {
    return product?.images?.find(({ position }) => position === 1);
  }, [product?.images]);

  if (!primaryImage?.src) return null;

  return (
    <Image
      src={primaryImage.src}
      alt={`product:${product?.title}`}
      className="object-contain w-full"
      fill
    />
  );
};

// Helper component for product items
const ProductItem = ({ product, label }) => (
  <HoverContainer className="flex items-center">
    <div className="w-[75px] h-[75px] overflow-hidden bg-white mr-[10px] flex items-center rounded relative">
      <ProductImage product={product} />
    </div>
    <div className="w-full">
      <div className="text-[14px] group-hover:text-theme-600">
        {product?.title}
      </div>
      <div className="text-[10px] text-gray-500 font-normal">{label}</div>
    </div>
  </HoverContainer>
);

function SearchResultSection({ section, onOptionSelect }) {
  const pathname = usePathname();
  const router = useRouter();
  const { getProductUrl } = useSolanaCategories();
  const [expanded, setExpanded] = useState(false);

  const sectionData = useMemo(() => {
    if (!section?.data) return [];
    return expanded ? section.data : section.data.slice(0, COLLAPSED_LIMIT);
  }, [section?.data, expanded]);

  const handleOptionClick = (e) => {
    e.preventDefault();
    const linkElement = e.target.closest("a");
    if (linkElement) {
      const href = linkElement.getAttribute("href");
      onOptionSelect();
      console.log("pathname", pathname);
      // router.push(href);
      if (pathname === "/search") {
        window.location.href = href;
      } else {
        router.push(href);
      }
    }
  };

  const renderItem = (item, index) => {
    const { prop, label } = section;

    // Configuration for each section type
    const getItemConfig = () => {
      switch (prop) {
        case "skus":
          return {
            href: `${BASE_URL}/search?query=${item?.text}`,
            key: `sku-search-${index}`,
            content: <SimpleTextItem text={item?.text} />,
          };
        case "recent":
          return {
            href: `${BASE_URL}/search?query=${item?.term}`,
            key: `recent-search-${index}`,
            content: <SimpleTextItem text={item?.term} />,
          };
        case "suggestion":
          return {
            href: `${BASE_URL}/search?query=${item?.text}`,
            key: `suggestion-search-${index}`,
            content: <SimpleTextItem text={item?.text + "?"} />,
          };
        case "popular":
          return {
            href: `${BASE_URL}/search?query=${item}`,
            key: `popular-search-${index}`,
            content: <SimpleTextItem text={capitalizeWords(item)} />,
          };
        case "product":
          return {
            href: getProductUrl(item),
            key: `product-result-${item?.handle}-${index}`,
            content: <ProductItem product={item} label={label} />,
          };
        case "category":
          return {
            href: `${BASE_URL}/${item.url}`,
            key: `cat-result-${item.url}`,
            content: <LabeledTextItem text={item.name} label={label} />,
          };
        case "brand":
          return {
            href: `${BASE_URL}/${item.url}`,
            key: `brand-result-${item.url}`,
            content: <LabeledTextItem text={item.name} label={label} />,
          };
        case "collections":
          return {
            href: `${BASE_URL}/${item.url}`,
            key: `collections-result-${item.url}`,
            content: <LabeledTextItem text={item.name} label={label} />,
          };
        default:
          return null;
      }
    };

    const config = getItemConfig();
    if (!config) return null;

    return (
      <Link
        prefetch={false}
        onClick={handleOptionClick}
        key={config.key}
        href={config.href}
      >
        {config.content}
      </Link>
    );
  };

  if (!sectionData || sectionData.length === 0) {
    return null;
  }

  // Determine if section should show expand/collapse button
  const canExpand = section?.data?.length > COLLAPSED_LIMIT;
  const shouldShowButton =
    canExpand &&
    ["popular", "product", "category", "brand", "collections"].includes(section?.prop);

  return (
    <div>
      <div className="bg-stone-200 font-bold text-sm py-1 px-3">
        {section.label}
      </div>
      <div
        className={`w-full ${
          expanded ? "max-h-[60vh] overflow-y-auto" : ""
        }`}
      >
        {sectionData.map(renderItem)}
      </div>
      {shouldShowButton && (
        <div className="px-2 py-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-theme-600 hover:text-theme-700 font-medium underline"
          >
            {expanded ? "See Less" : "See All"}
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchResultSection;
