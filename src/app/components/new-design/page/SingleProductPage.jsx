import dynamic from "next/dynamic";
import Link from "next/link";
import { BASE_URL, formatPrice, formatProduct } from "@/app/lib/helpers";

// Above-fold — load immediately
import Breadcrumb from "@/app/components/new-design/sections/sp/Breadcrumb";
import Topbar from "@/app/components/new-design/sections/sp/Topbar";
import ImageGallery from "@/app/components/new-design/sections/sp/ImageGallery";
import ProductInfo from "@/app/components/new-design/sections/sp/ProductInfo";
import CompareTable from "@/app/components/new-design/sections/sp/CompareTable";
import StickyCTA from "@/app/components/new-design/sections/sp/StickyCTA";
import MobileStickyCTA from "@/app/components/new-design/sections/sp/MobileStickyCTA";

// Below-fold — lazy loaded to reduce initial JS bundle
const CollectionStrip = dynamic(
  () => import("@/app/components/new-design/sections/sp/CollectionStrip"),
);
const DescriptionSection = dynamic(
  () => import("@/app/components/new-design/sections/sp/DescriptionSection"),
);
const SpecsShipping = dynamic(
  () => import("@/app/components/new-design/sections/sp/SpecsShipping"),
);
const ReviewsSection = dynamic(
  () => import("@/app/components/new-design/sections/sp/ReviewsSection"),
);
const FAQSection = dynamic(
  () => import("@/app/components/new-design/sections/sp/FAQSection"),
);
const SupportCTA = dynamic(
  () => import("@/app/components/new-design/sections/sp/SupportCTA"),
);

const ProductGrid = dynamic(
  () => import("@/app/components/new-design/sections/sp/ProductGrid"),
);

const RecentViews = dynamic(
  () => import("@/app/components/new-design/sections/sp/RecentViews"),
);

const STATIC_SPECS = [
  { label: "Class", value: "Premium" },
  { label: "BTU Output", value: "56,000" },
  { label: "Cutout Depth", value: "27 3/4 Inches" },
  { label: "Configuration", value: "Built-In" },
  {
    label: "Cutout Dimensions",
    value: "33 5/16 W × 21 1/4 D × 8 1/2 H Inches",
  },
  { label: "Cooking Grill Dimensions", value: "29 5/12 W × 18 D Inches" },
  { label: "Cutout Height", value: "8 1/2 Inches" },
];

const STATIC_SHIPPING = [
  { label: "Weight", value: "135 lbs" },
  { label: "Dimensions", value: "36″ × 25″ × 25″" },
];

const RELATED = [
  {
    name: "Napoleon 700 Series Dual Range Top Burner",
    brand: "Napoleon",
    price: 889,
    was: 945,
    badge: "Popular",
  },
  {
    name: "Summit 76-Wide 2-Burner Radiant Cooking Block",
    brand: "Summit Appliance",
    price: 455,
    was: 500,
    badge: "Popular",
  },
  {
    name: "WPPO Karma 25-inch Wood-Fired Pizza Oven",
    brand: "WPPO",
    price: 1525,
    was: null,
    badge: null,
  },
  {
    name: "RCS 27-Inch Freestanding Beverage Center",
    brand: "RCS",
    price: 4400,
    was: null,
    badge: null,
  },
];

const RECENT = [
  {
    name: "American Fyre Designs 26 Inch Java Free-Standing Granite Shelf",
    brand: "American Fyre Design",
    price: 12490,
    was: 13960,
    badge: "Sale",
  },
  {
    name: "Blaze Freelan LBE 25-Inch 2-Burner Built-In Grill",
    brand: "Blaze Outdoor Products",
    price: 1409,
    was: null,
    badge: null,
  },
  {
    name: "Bromic Heating Tungsten Smart-Heat 56,000 BTU",
    brand: "Bromic Heaters",
    price: 2250,
    was: 3000,
    badge: "Sale",
  },
  {
    name: "Sunglo Stainless Steel Patio Heater A270SS",
    brand: "Sunglo",
    price: 1325,
    was: null,
    badge: null,
  },
];

function SingleProductPage({
  product,
  slug,
  reviews,
  recentlyViewed,
  faqs,
  ymalProducts,
}) {
  const firstVariant = product?.variants?.[0];
  const price = parseFloat(firstVariant?.price) || 0;
  const was = parseFloat(firstVariant?.compare_at_price) || 0;

  const brandDescription = product?.vendor
    ? `Designed with features that make it easy to grill great food, every ${product.vendor} product is built for those who demand performance, durability, and bold outdoor style.`
    : "";

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen font-sans">
      <Topbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-20">
        <Breadcrumb crumbs={product?.breadcrumbs} />

        {/* HERO: GALLERY + INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-12 lg:items-start">
          {/* min-h matches the gallery's lg:h-[460px] — prevents CLS during hydration */}
          <div className="lg:sticky lg:top-[140px]">
            <ImageGallery
              images={product?.images || []}
              productTitle={product?.title}
            />
          </div>
          <ProductInfo product={product} />
        </div>

        {/* BELOW-FOLD SECTIONS */}
        <CollectionStrip product={product} />
        <DescriptionSection
          brand={product?.brand}
          brandHref={product?.brand_url}
          brandImage={product?.brand_image}
          description={product?.body_html}
        />
        <SpecsShipping
          specs={product?.product_specs}
          shipping={product?.shipping_info}
          isFreeshipping={product?.is_freeshipping || false}
        />
        {/* Compare Table Component */}
        {product?.sp_product_options &&
          Array.isArray(product?.sp_product_options) &&
          product?.sp_product_options.length > 1 && (
            <CompareTable
              products={product?.sp_product_options}
              activeProductId={product?.product_id}
            />
          )}
        <ReviewsSection
        rating={product?.ratings || 0}
        reviewCount={product?.reviews ?? 0}
        reviews={reviews?.results || []}
        summary={reviews?.summary || null}
        product_id={product?.product_id} />
        <FAQSection faqs={faqs} />
        <SupportCTA />
        {Array.isArray(product?.fbt_carousel) &&
          product.fbt_carousel?.length > 0 && (
            <ProductGrid
              title="Frequently Bought Together"
              items={product.fbt_carousel.map((i) => formatProduct(i, "card"))}
            />
          )}
        {ymalProducts && (
          <ProductGrid title="You May Also Like" items={ymalProducts} />
        )}
        <RecentViews product_id={product?.product_id} />
      </div>
      <StickyCTA product={product} />
      <MobileStickyCTA product={product} />
    </div>
  );
}

export default SingleProductPage;
