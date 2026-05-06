"use client";

import { useState, useRef } from "react";
import StarRating from "@/app/components/new-design/sections/sp/StarRating";
import Pagination from "@/app/components/new-design/ui/Pagination";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

async function fetchProductReviews(productId, page = 1) {
  if (!productId) {
    throw new Error("Product ID is required to fetch reviews.");
  }

  try {
    // Construct the URL to your local Next.js API route
    const url = `/api/reviews/list?product_id=${encodeURIComponent(productId)}&page=${page}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Throw an error with the message from the server if available
      throw new Error(data.message || `Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    throw error; // Re-throw so the UI component can handle the error state
  }
}

function Reviews({ reviews, reviewCount, product_id }) {
  const [reviewList, setReviewList] = useState(reviews || []);
  const reviewsTopRef = useRef(null);

  const handlePageChange = async (page) => {
    const response = await fetchProductReviews(product_id, page);
    const newReviews = response?.results || [];
    setReviewList(newReviews);

    if (reviewsTopRef.current) {
      const yOffset = -100; 
      const element = reviewsTopRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div
    ref={reviewsTopRef}
    className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
      {reviewList.map((review, i) => (
        <div key={review.id ?? i} className="py-5 first:pt-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {review?.user?.username || review.name || "Verified Buyer"}
              </p>
              <StarRating rating={review.rating} size="sm" />
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {formatDate(review.created_at)}
            </span>
          </div>
          {review.title && (
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
              {review.title}
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {review.comment || review.content || ""}
          </p>
        </div>
      ))}
      {/* Pagination */}
      {reviewCount > 10 && (
        <Pagination
          total_count={reviewCount || 0}
          results_per_page={10}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default Reviews;
