"use client";
import Link from "next/link";

const ProductGuidesInstallations = ({ product }) => {
  const guides = product?.product_manuals;

  if (!guides || !Array.isArray(guides) || guides.length === 0) return null;

  return (
    <div className="my-5">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Guides & Installations
      </h3>
      <div>
        <h4 className="text-stone-800 mb-3">Manufacturer's Manual</h4>
        <div className="flex flex-wrap gap-3">
          {guides.map((item, index) => (
            <Link
              key={`manual-item-${index}`}
              prefetch={false}
              href={item?.value || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md text-center hover:shadow-md p-3 bg-theme-800 text-white text-xs font-semibold break-words max-w-[250px] line-clamp-2"
              title={item?.label}
            >
              {item?.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGuidesInstallations;
