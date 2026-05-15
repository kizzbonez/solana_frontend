import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * On-demand ISR revalidation for Product Detail Pages.
 *
 * Two modes:
 *
 *   Single product
 *     GET /api/revalidate-pdp?secret=SECRET&path=/brand/product/handle
 *     Busts the page HTML for that URL and the cached product data.
 *
 *   All products
 *     GET /api/revalidate-pdp?secret=SECRET&all=true
 *     Busts the page HTML for every PDP route and ALL product data cache
 *     entries in one call. Use after a bulk price or inventory update.
 *
 * The secret must match the REVALIDATE_SECRET environment variable so
 * this endpoint cannot be triggered by arbitrary external requests.
 */
export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get("secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const all  = searchParams.get("all");
  const path = searchParams.get("path"); // e.g. /napoleon/product/napoleon-phantom-65

  // ── Bulk: revalidate every product page ──────────────────────────────────
  if (all === "true") {
    // revalidatePath with the route template busts every page that matches it
    revalidatePath("/[slug]/product/[product_path]", "page");
    // revalidateTag("pdp") busts all fetchProduct unstable_cache entries
    revalidateTag("pdp");
    // revalidateTag("pdp-reviews") busts all review cache entries
    revalidateTag("pdp-reviews");

    return NextResponse.json({
      revalidated: true,
      mode:        "all",
      message:     "All product pages and data cache cleared.",
    });
  }

  // ── Single: revalidate one product page ───────────────────────────────────
  if (path) {
    // Derive the product handle from the path: /brand/product/handle → handle
    const handle = path.split("/").pop();

    // Bust the page HTML for this specific URL
    revalidatePath(path, "page");
    // Bust the cached data for this specific product
    revalidateTag(`product-${handle}`);
    // Bust the cached reviews for this product (if product_id is unknown,
    // the caller can pass ?reviews_id=123 to also bust that tag)
    const reviewsId = searchParams.get("reviews_id");
    if (reviewsId) {
      revalidateTag(`product-reviews-${reviewsId}`);
    }

    return NextResponse.json({
      revalidated: true,
      mode:        "single",
      path,
      handle,
      message:     `Product page and data cache cleared for: ${handle}`,
    });
  }

  // ── Missing params ────────────────────────────────────────────────────────
  return NextResponse.json(
    {
      message: "Provide either ?all=true or ?path=/brand/product/handle",
    },
    { status: 400 },
  );
}
