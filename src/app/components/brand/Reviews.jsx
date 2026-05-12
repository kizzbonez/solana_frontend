"use client";
import { useState } from "react";
import { Rating } from "@smastrom/react-rating";
import StarRating from "@/app/components/new-design/ui/StarRating";
import CarouselWrap from "@/app/components/atom/CarouselWrap";
import useReviews from "@/app/hooks/useReviews";

const breakpoints = [
  { minWidth: 0, value: 1 },
  { minWidth: 1024, value: 2 },
  { minWidth: 1280, value: 3 },
];

const GRADIENTS = [
  "linear-gradient(135deg, #f97316, #ea580c)",
  "linear-gradient(135deg, #e98f3b, #d97706)",
  "linear-gradient(135deg, #dc2626, #b91c1c)",
];

const ReviewCardSkeleton = () => (
  <div className="min-h-[234px] bg-white rounded-2xl border border-stone-100 p-6 flex flex-col gap-3 animate-pulse">
    <div className="h-3.5 w-24 bg-stone-200 rounded-full" />
    <div className="flex flex-col gap-2 flex-1">
      <div className="h-3 w-full bg-stone-200 rounded-full" />
      <div className="h-3 w-full bg-stone-200 rounded-full" />
      <div className="h-3 w-3/4 bg-stone-200 rounded-full" />
    </div>
    <div className="mt-auto pt-3 border-t border-stone-100 flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-stone-200 flex-shrink-0" />
      <div className="h-3 w-28 bg-stone-200 rounded-full flex-1" />
      <div className="w-6 h-6 rounded-full bg-stone-200 flex-shrink-0" />
    </div>
  </div>
);

const ReviewCard = ({ r, idx }) => {
  const [expanded, setExpanded] = useState(false);
  const name = r.user?.username || "Customer";
  const initial = name.charAt(0).toUpperCase();

  return (
    // Slot clips when collapsed; releases when expanded so the card grows naturally
    <div className={expanded ? "" : "h-[234px] overflow-hidden"}>
      <div className={`min-h-[234px] bg-white rounded-2xl border p-6 flex flex-col gap-3 transition-shadow duration-300 ${
        expanded
          ? "border-[#e98f3b]/50 shadow-xl"
          : "border-stone-100 hover:border-[#e98f3b]/30 hover:shadow-md"
      }`}>
        <StarRating rating={r.ratings} />

        <p className={`text-sm text-stone-600 leading-relaxed flex-1 min-h-[91px] ${expanded ? "" : "line-clamp-4"}`}>
          &ldquo;{r.comment}&rdquo;
        </p>

        <div className="mt-auto pt-3 border-t border-stone-100 flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none"
            style={{ background: GRADIENTS[idx % GRADIENTS.length] }}
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-stone-800 truncate">{name}</p>
            {r.product?.title && (
              <p className="text-[10px] text-stone-400 truncate">{r.product.title}</p>
            )}
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Show less" : "Read more"}
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-stone-400 hover:text-[#e98f3b] hover:bg-orange-50 transition-colors duration-200"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Reviews() {
  const { reviewDetails, loading } = useReviews();

  const avgRating = parseFloat(reviewDetails?.summary?.average_rating ?? 0);
  const totalReviews = reviewDetails?.summary?.total_reviews ?? 0;
  const results = reviewDetails?.results ?? [];
  const barWidth = `${Math.min((avgRating / 5) * 100, 100)}%`;

  return (
    <div className="w-full mt-10">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

          {/* Summary panel */}
          <div className="lg:w-[28%] flex flex-col gap-5 text-center lg:text-left items-center lg:items-start lg:sticky lg:top-24">
            <h2 className="text-[#e98f3b] text-4xl font-medium leading-tight italic font-playfair-display">
              Our customer reviews
            </h2>

            <div className="flex flex-col gap-2 items-center lg:items-start">
              <Rating
                readOnly
                value={loading ? 0 : avgRating}
                fractions={2}
                style={{ maxWidth: 130 }}
              />
              <p className="text-sm text-stone-500">
                {loading ? (
                  <span className="text-stone-300">—</span>
                ) : (
                  <>
                    <span className="font-semibold text-stone-800">{avgRating.toFixed(1)}</span>
                    {" "}out of 5 &middot;{" "}
                    <span className="underline cursor-pointer">
                      {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </p>
            </div>

            {!loading && (
              <div className="w-full max-w-[220px]">
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-700"
                    style={{ width: barWidth }}
                  />
                </div>
              </div>
            )}

            {/* <button className="text-xs text-[#e98f3b] font-semibold tracking-wide hover:underline transition-colors">
              Write a review →
            </button> */}
          </div>

          {/* Review carousel — overflow-x:clip keeps slides clipped laterally while
              overflow-y:visible lets expanded cards grow downward past slick-list */}
          <div className="w-full lg:w-[72%] [&_.slick-list]:[overflow-x:clip] [&_.slick-list]:[overflow-y:visible]">
            <CarouselWrap breakpoints={breakpoints}>
              {loading
                ? [...Array(3)].map((_, i) => (
                    <ReviewCardSkeleton key={`skeleton-${i}`} />
                  ))
                : results.slice(0, 6).map((r, idx) => (
                    <ReviewCard key={`brand-review-${r.id}`} r={r} idx={idx} />
                  ))}
            </CarouselWrap>
          </div>

        </div>
      </div>
    </div>
  );
}
