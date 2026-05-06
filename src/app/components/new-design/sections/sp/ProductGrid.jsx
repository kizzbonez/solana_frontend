import SectionHeading from "@/app/components/new-design/sections/sp/SectionHeading";
import ProductCard from "@/app/components/new-design/sections/sp/ProductCard";

const SkeletonCard = () => (
  <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden animate-pulse">
    {/* Mirrors ProductCard's aspect-[16/9] image link */}
    <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-700" />

    {/* Mirrors ProductCard's flex flex-col gap-1.5 p-3 flex-1 content body */}
    <div className="flex flex-col gap-2 p-3 flex-1">
      <div className="h-2 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="h-2.5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full mt-1" />
      <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700 rounded-full mt-1" />
    </div>

    {/* Mirrors ProductCard's px-3 pb-3 button row */}
    <div className="px-3 pb-3 flex gap-2">
      <div className="h-8 flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  </div>
);

/**
 * loading  – pass true while data is in flight; renders skeletons instead of cards
 * skeletonCount – how many skeleton cards to show (default 4 matches lg:grid-cols-4)
 */
const ProductGrid = ({ title, items, action, loading = false, skeletonCount = 4 }) => (
  <section className="mb-14">
    <SectionHeading action={action}>{title}</SectionHeading>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {loading || !items?.length
        ? Array.from({ length: skeletonCount }, (_, i) => (
            <SkeletonCard key={`skeleton-${title}-${i}`} />
          ))
        : items.map((p, i) => (
            <ProductCard key={`prod-grid-${title}-${p?.title}-${i}`} p={p} />
          ))}
    </div>
  </section>
);

export default ProductGrid;
