"use client";
import { Children, useState, useEffect } from "react";

const INITIAL_COUNT = 4;

/**
 * Thin client boundary for the Categories section.
 * Receives server-rendered CategoryCard elements as children and manages
 * the mobile "Show All" toggle. All other rendering stays server-side.
 */
export default function CategoriesGrid({ children, total }) {
  const [showAll, setShowAll] = useState(false);
  const items = Children.toArray(children);
  const remaining = Math.max(0, total - INITIAL_COUNT);

  useEffect(() => {
    // Desktop always shows all — no button needed
    if (window.innerWidth >= 640) setShowAll(true);
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {showAll ? items : items.slice(0, INITIAL_COUNT)}
      </div>

      {!showAll && remaining > 0 && (
        <div className="mt-8 text-center sm:hidden">
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-fire text-fire font-semibold text-sm hover:bg-fire hover:text-white transition-all duration-200"
          >
            Show All Categories ({remaining} more)
          </button>
        </div>
      )}
    </>
  );
}
