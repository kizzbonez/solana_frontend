import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// General cache-bust endpoint — clears all unstable_cache entries across the site.
// Call this whenever any shared data is updated (products, menu, logo, theme, categories).
//
// Usage:
//   GET /api/revalidate-all?secret=YOUR_REVALIDATE_SECRET
export async function GET(request) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  revalidateTag("plp-initial-hits");   // PLP page initial products
  revalidateTag("home-products");      // Homepage featured products
  revalidateTag("layout-data");        // Menu, logo, theme, categories (layout)

  return NextResponse.json({
    revalidated: true,
    timestamp: new Date().toISOString(),
    tags: ["plp-initial-hits", "home-products", "layout-data"],
    message: "All caches cleared. Pages will re-fetch fresh data on next visit.",
  });
}
