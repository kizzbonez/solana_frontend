"use server"
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { accentuateSpecLabels } from "@/app/lib/filter-helper";
import { formatPrice, formatProduct } from "@/app/lib/helpers";
import StarRating from "@/app/components/new-design/ui/StarRating";
import CompareItemAddToCart from "@/app/components/new-design/sections/sp/CompareItemAddToCart";

const extractProductSpecs = (product) => {
  const accentuate = product?.accentuate_data || null;
  if (!accentuate) return null;
  const accentuateKeys = Object.keys(accentuate);
  const specsConfig = accentuateSpecLabels
    .filter((asl) => accentuateKeys.includes(asl?.key))
    .map((asl) => ({ ...asl, value: accentuate[asl?.key] }));
  const specs = specsConfig
    .filter((sc) => sc?.value)
    .map((sc) => {
      const transform = sc?.transform || null;
      const rawValue = accentuate[sc?.key];
      const renderValue =
        typeof transform === "function" ? transform(rawValue) : rawValue;
      return { ...sc, value: renderValue };
    });

  return specs;
};

const ItemValue = ({ specs, specKey, className }) => {
  const specsObject = Object.fromEntries(
    specs.map((item) => [item.key, item.value]),
  );
  const value = specsObject?.[specKey] || "N/A";
  return <td className={className}>{value}</td>;
};

const ProductTableHeadItem = ({ product, activeId }) => {
  return (
    <th
      className={`border-b min-w-[250px] ${product?.product_id === activeId ? "bg-blue-50 border-x border-blue-200" : ""}`}
    >
      <div className="p-2">
        <Link
          prefetch={false}
          href={product?.url || "#"}
          title={product?.title}
        >
          <div className="relative aspect-[16/9] bg-white">
            {product?.image && (
              <Image
                src={product?.image}
                alt={product?.title || "Compare Product Image"}
                fill
                className="object-contain  rounded-md border"
              />
            )}
          </div>
        </Link>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <Link
          prefetch={false}
          href={product?.url || "#"}
          title={product?.title}
          className="text-xs font-normal text-theme-500 hover:text-theme-700 line-clamp-2 hover:underline"
        >
          {product?.name}
        </Link>
        <div>
          <StarRating rating={product?.ratings || 0} />
        </div>
        <div className="text-neutral-600 font-medium">
          ${formatPrice(product?.price)}
        </div>
        <div>
          {product?.product_id !== activeId && (
            <CompareItemAddToCart
              product={product}
              className="font-medium py-1 px-2 text-white w-full rounded-md bg-theme-600 hover:bg-theme-700"
              label="Add to Cart"
            />
          )}
          {product?.product_id === activeId && (
            <div className="font-medium py-1 px-2 text-theme-600 w-full rounded-md border-2 border-theme-600 bg-theme-100 text-center">
              ACTIVE
            </div>
          )}
        </div>
      </div>
    </th>
  );
};

const CompareTable = ({ products, activeProductId }) => {
  // Move active product to the front of the list for display
  const activeProduct = products.find((p) => p.product_id === activeProductId);
  const otherProducts = products.filter(
    (p) => p.product_id !== activeProductId,
  );

  const orderedProducts = [activeProduct, ...otherProducts]
    .map((op) => formatProduct(op, "card"))

  const orderedSpecs = orderedProducts
    .map((op) => ({ ...op, compare_specs: extractProductSpecs(op) }));

  const specKeys = (orderedSpecs?.[0]?.compare_specs || []).map(
    ({ label, key }) => ({ label, key }),
  );

  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="block w-1 h-5 bg-theme-500 rounded-full flex-shrink-0"></span>
          <h2 className="text-xs font-bold text-theme-500 uppercase tracking-widest">
            Compare Product Options
          </h2>
        </div>
      </div>
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full text-left border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-4 border-b font-semibold text-gray-700 w-1/4 min-w-[230px] sticky left-0 z-[1] bg-gray-100 px-4 py-2">
                Features
              </th>
              {orderedProducts.map((product, i) => (
                <ProductTableHeadItem
                  key={`compare-product-item-${product?.product_id}-${i}`}
                  product={product}
                  activeId={activeProductId}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {specKeys.map(({ label, key }) => (
              <tr
                key={`tr-${key}`}
                className="hover:bg-gray-50 transition-colors "
              >
                <td className="p-4 border-b font-medium text-gray-600 capitalize !min-w-[230px] text-xs sticky left-0 z-[1] bg-gray-100 px-4 py-2">
                  {label}
                </td>
                {orderedSpecs.map((product) => (
                  <ItemValue
                    key={`table-item-${product.product_id}-${key}`}
                    specs={product?.compare_specs || []}
                    specKey={key}
                    className={`px-6 py-4 border-b text-gray-600 text-center text-xs ${product?.product_id === activeProductId ? "bg-blue-50/30 border-x border-blue-100" : ""}`}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default CompareTable;
