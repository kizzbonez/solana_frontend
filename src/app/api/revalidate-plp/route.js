import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// Busts the 24h server-side cache for all PLP initial-hits.
// Call this whenever product data is updated so the next page visit
// re-fetches fresh results instead of serving the stale cached hits.
//
// Usage:
//   GET /api/revalidate-plp?secret=YOUR_REVALIDATE_SECRET
//
// The secret must match the REVALIDATE_SECRET environment variable.
// After calling this, each PLP page will re-fetch its initial hits
// on the next visit and cache them for another 24h.
export async function GET(request) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  revalidateTag("plp-initial-hits");
  revalidateTag("home-products");

  return NextResponse.json({
    revalidated: true,
    timestamp: new Date().toISOString(),
    message: "All PLP and homepage product caches cleared. Pages will re-fetch on next visit.",
  });
}
