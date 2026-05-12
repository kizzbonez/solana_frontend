import { useState, useEffect } from "react";

export default function useReviews() {
  const [reviewDetails, setReviewDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/reviews/list", {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
        setReviewDetails(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch reviews:", err);
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchReviews();
    return () => controller.abort();
  }, []);

  return { reviewDetails, loading, error };
}
