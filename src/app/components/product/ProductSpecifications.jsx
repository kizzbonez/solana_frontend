"use client";
import { useState } from "react";

const normalizeSpecValue = (key, value) => {
  let result = value;
  switch (key) {
    case "bbq.number_of_main_burners":
      result = `${value
        ?.toLowerCase()
        ?.replace("burners", "")
        .replace("burner", "")} burner/s`;
      break;
    case "bbq.product_weight":
    case "bbq.shipping_weight":
      const unit = " lbs.";

      let formattedWeight;

      if (value % 1 !== 0) {
        // If the number has a fractional part (e.g., 490.5)
        formattedWeight = new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2, // Force two decimal places
          maximumFractionDigits: 2,
        }).format(value);
      } else {
        // If the number is an integer (e.g., 490.0)
        formattedWeight = new Intl.NumberFormat("en-US", {
          maximumFractionDigits: 0, // No decimal places
        }).format(value);
      }
      result = formattedWeight + unit;
      break;
    default:
      result = value;
      break;
  }
  return result;
};

const ProductSpecifications = ({ product }) => {
  const specs = product?.product_specs;
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_ITEMS_SHOWN = 6;

  if (!specs || !Array.isArray(specs) || specs.length === 0) return null;

  const filteredSpecs = specs.filter(({ value }) => value !== "");
  const displayedSpecs = isExpanded
    ? filteredSpecs
    : filteredSpecs.slice(0, INITIAL_ITEMS_SHOWN);
  const hasMoreItems = filteredSpecs.length > INITIAL_ITEMS_SHOWN;

  // Split specs into 2 columns
  const midPoint = Math.ceil(displayedSpecs.length / 2);
  const column1 = displayedSpecs.slice(0, midPoint);
  const column2 = displayedSpecs.slice(midPoint);

  const SpecTable = ({ items }) => (
    <table className="w-full border-collapse">
      <tbody>
        {items.map((item, index) => (
          <tr
            key={`spec-item-${index}`}
            className="border-b border-neutral-200 hover:bg-theme-100 transition-all duration-200 group"
          >
            <td className="text-xs sm:text-sm font-bold text-neutral-800 py-3 px-3 align-top border-r border-neutral-200 group-hover:text-neutral-900 group-hover:bg-neutral-100">
              {item?.label}
            </td>
            <td className="text-xs sm:text-sm font-semibold text-theme-600 py-3 px-3 align-top group-hover:text-theme-700 group-hover:bg-neutral-100">
              {normalizeSpecValue(item?.key, item?.value)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="my-5">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Specifications
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <SpecTable items={column1} />
        </div>
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <SpecTable items={column2} />
        </div>
      </div>
      {hasMoreItems && (
        <div className="flex items-center gap-4 mt-6">
          <hr className="flex-grow border-t border-neutral-300" />
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-6 py-2.5 border-2 border-neutral-700 bg-neutral-800 hover:bg-neutral-900 text-white font-semibold text-sm rounded-full flex items-center gap-2 transition-all duration-200 hover:border-neutral-900"
          >
            {isExpanded ? (
              <>
                <span>See Less</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </>
            ) : (
              <>
                <span>
                  See More ({filteredSpecs.length - INITIAL_ITEMS_SHOWN} more)
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </>
            )}
          </button>
          <hr className="flex-grow border-t border-neutral-300" />
        </div>
      )}
    </div>
  );
};

export default ProductSpecifications;
