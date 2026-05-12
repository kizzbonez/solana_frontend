"use client";
import { useState } from "react";
import { useReveal } from "@/app/hooks/useReveal";
import useReviews from "@/app/hooks/useReviews";

const StarRow = ({ rating, size = "sm" }) => {
  const stars = Math.round(Number(rating) || 0);
  const sizeClass = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`${sizeClass} ${i < stars ? "text-amber-400" : "text-stone-200 dark:text-stone-700"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const ReviewCardSkeleton = () => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-5 flex flex-col gap-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2 pt-1">
        <div className="h-3 w-28 bg-stone-200 dark:bg-stone-700 rounded-full" />
        <div className="h-2.5 w-20 bg-stone-200 dark:bg-stone-700 rounded-full" />
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <div className="h-3 w-full bg-stone-200 dark:bg-stone-700 rounded-full" />
      <div className="h-3 w-full bg-stone-200 dark:bg-stone-700 rounded-full" />
      <div className="h-3 w-2/3 bg-stone-200 dark:bg-stone-700 rounded-full" />
    </div>
    <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
      <div className="h-2.5 w-40 bg-stone-200 dark:bg-stone-700 rounded-full" />
    </div>
  </div>
);

function ReviewCard({ initial, gradient, user, comment, rating, product }) {
  const [expanded, setExpanded] = useState(false);
  const ref = useReveal();
  const name = user?.username || "";
  const displayInitial = initial || name.charAt(0).toUpperCase() || "?";
  const avatarGradient = gradient || "linear-gradient(135deg, #f97316, #ea580c)";

  return (
    <article
      ref={ref}
      onClick={() => setExpanded((v) => !v)}
      className="opacity-0 translate-y-6 transition-all duration-700 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-5 flex flex-col gap-4 cursor-pointer"
    >
      {/* Header: avatar + name + stars */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 select-none"
          style={{ background: avatarGradient }}
        >
          {displayInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-charcoal dark:text-white truncate">{name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StarRow rating={rating} />
            <span className="text-xs font-semibold text-stone-400">
              {parseFloat(rating).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Quote with max-height transition */}
      <div className="relative">
        <span className="absolute -top-1 -left-0.5 font-serif text-5xl leading-none text-fire/10 select-none pointer-events-none">
          "
        </span>
        <div
          className="overflow-hidden relative min-h-[60px]"
          style={{
            maxHeight: expanded ? "600px" : "3.75rem",
            transition: "max-height 0.45s ease-in-out",
          }}
        >
          <p className="relative text-xs text-stone-600 dark:text-stone-300 leading-relaxed pl-4">
            "{comment}"
          </p>
          {/* Fade gradient when collapsed */}
          {!expanded && (
            <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-white dark:from-stone-900 to-transparent pointer-events-none" />
          )}
        </div>
      </div>

      {/* Read more / Show less toggle */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
        className="flex items-center gap-1 text-[10px] font-semibold text-fire/60 hover:text-fire transition-colors self-start -mt-2 select-none"
      >
        {expanded ? "Show less" : "Read more"}
        <svg
          className={`w-3 h-3 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Product footer */}
      {product?.title && (
        <div className="flex items-center gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
          <svg className="w-3 h-3 text-fire flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-stone-400 dark:text-stone-500 truncate" title={product.title}>
            {product.title}
          </span>
        </div>
      )}
    </article>
  );
}

export default function Reviews() {
  const { reviewDetails, loading } = useReviews();
  const hdrRef = useReveal();

  const avgRating = reviewDetails?.summary?.average_rating;
  const totalReviews = reviewDetails?.summary?.total_reviews;

  return (
    <section id="reviews" className="py-20 md:py-24 bg-cream dark:bg-stone-950">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div
          ref={hdrRef}
          className="opacity-0 translate-y-6 transition-all duration-700 text-center mb-12"
        >
          <p className="text-[11px] tracking-[.15em] uppercase font-semibold text-fire mb-2.5">
            Customer Reviews
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal dark:text-white mb-6 leading-tight">
            What Our Customers Say
          </h2>

          {avgRating && (
            <div className="flex items-center justify-center gap-4">
              <span className="font-serif text-[3.5rem] font-bold text-charcoal dark:text-white leading-none">
                {parseFloat(avgRating).toFixed(1)}
              </span>
              <div className="flex flex-col items-start gap-1">
                <StarRow rating={avgRating} size="lg" />
                <p className="text-xs text-stone-400">
                  Based on {totalReviews} verified review{totalReviews !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Grid: 1 col mobile → 2 col tablet → 3 col desktop */}
        {/* items-start prevents grid stretch from equalising card heights across rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {loading
            ? [...Array(3)].map((_, i) => (
                <div key={`skeleton-${i}`} className={i >= 2 ? "hidden sm:block" : ""}>
                  <ReviewCardSkeleton />
                </div>
              ))
            : (reviewDetails?.results || []).slice(0, 3).map((r, i) => (
                <div key={`home-review-card-${r.id}`} className={i >= 2 ? "hidden sm:block" : ""}>
                  <ReviewCard {...r} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
