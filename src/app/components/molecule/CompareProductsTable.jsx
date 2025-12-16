"use client";
import { useMemo } from "react";
import CompareProductCard from "@/app/components/atom/CompareProductCard";

function CompareProductsTable({ similar_products, product }) {
  const compare_products = useMemo(() => {
    if (similar_products.length > 0 && product) {
      const filtered_similars = similar_products.filter(
        (item) => item.handle !== product?.handle
      );
      return [product, ...filtered_similars];
    }
    return [];
  }, [similar_products, product]);

  const product_accentuate_data = useMemo(() => {
    if (similar_products.length > 0 && product) {
      const filtered_similars = similar_products.filter(
        (item) => item.handle !== product?.handle
      );

      const tmp = [
        product?.accentuate_data || [],
        ...filtered_similars.map(
          ({ accentuate_data }) => accentuate_data && accentuate_data
        ),
      ];

      const tmp_obj = tmp.map((item) => {
        if (!item || typeof item !== "object") return {}; // skip this item
        const item_keys = Object.keys(item);
        const include_keys = item_keys.filter((item) =>
          item.includes("seo_meta")
        );
        return include_keys.reduce((accumulator, currentValue) => {
          accumulator[currentValue] = item[currentValue];
          return accumulator;
        }, {});
      });

      return tmp_obj;
    }
    return [];
  }, [similar_products, product]);

  // Get all unique keys and filter out fields where all products have no value
  const filteredFields = useMemo(() => {
    if (product_accentuate_data.length === 0) return [];

    // Collect all unique keys from all products
    const allKeys = new Set();
    product_accentuate_data.forEach((data) => {
      Object.keys(data).forEach((key) => allKeys.add(key));
    });

    // Filter keys where at least one product has a non-empty value
    return Array.from(allKeys).filter((key) => {
      return product_accentuate_data.some((data) => {
        const value = data[key];
        return value !== undefined && value !== null && value !== "";
      });
    });
  }, [product_accentuate_data]);

  const getPropLabel = (prop) => {
    const noPrefix = prop.replace("bbq.seo_meta_", "");

    const label = noPrefix
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return label;
  };

  if (compare_products.length > 1) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-stone-900 my-[20px]">
          Similar Products
        </h2>
        <div className="w-full overflow-x-auto">
          <table className="table-auto">
            <thead>
              <tr>
                {/* Empty header cell for label column */}
                <th className="min-w-[200px] border-r border-gray-400 bg-gray-50"></th>
                {/* Product cards header */}
                {compare_products.map((item, index) => (
                  <th
                    key={`thead-${index}`}
                    className="min-w-[150px] max-w-[200px] border-r border-gray-400"
                  >
                    <CompareProductCard
                      is_active={item?.handle === product?.handle}
                      product={item}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredFields.map((prop_key, index) => (
                <tr key={`th-${index}`} className="group">
                  {/* Label column - first column */}
                  <td className="p-4 border-y border-r border-gray-400 group-hover:bg-neutral-200 text-sm font-semibold bg-gray-50">
                    {getPropLabel(prop_key)}
                  </td>
                  {/* Product data columns */}
                  {product_accentuate_data.map((spec, index2) => {
                    const value = spec[prop_key];
                    const displayValue =
                      value !== undefined && value !== null && value !== ""
                        ? value
                        : "NA";

                    return (
                      <td
                        key={`td-${index}-${index2}`}
                        className="text-center p-4 border-y border-r border-gray-400 group-hover:bg-neutral-200 text-sm"
                      >
                        <div>{displayValue}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default CompareProductsTable;
