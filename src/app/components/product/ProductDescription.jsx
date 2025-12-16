"use client";
import { useState } from "react";

const ProductDescription = ({ product }) => {
  const description = product?.description || product?.body_html;
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) return null;

  return (
    <div className="my-5">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Product Description
      </h3>
      <div className="relative">
        <div
          className={`product_description_content text-sm md:text-base transition-all duration-300 ${
            isExpanded ? "" : "max-h-[180px] overflow-hidden"
          }`}
          dangerouslySetInnerHTML={{
            __html: description,
          }}
        ></div>
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        )}
      </div>
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
              <span>See More</span>
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
    </div>
  );
};

export default ProductDescription;
