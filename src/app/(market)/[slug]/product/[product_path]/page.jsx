import "@/app/styles/product-pages.css";

// Safety-net fallback: pages self-heal after 24h even if a manual
// revalidation trigger was missed. Primary invalidation is on-demand
// via /api/revalidate-pdp using revalidatePath + revalidateTag.
export const revalidate = 86400;
import { redis, keys } from "@/app/lib/redis";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import RatingStyles from "@/app/components/atom/RatingStyles";
import { BASE_URL, ES_INDEX } from "@/app/lib/helpers";
import { STORE_NAME } from "@/app/lib/store_constants";

import { fetchProduct, getReviewsByProductId, getYMALProducts } from "@/app/lib/fn_server";

import ProductPlaceholder from "@/app/components/atom/SingleProductPlaceholder";
import ProductClient from "@/app/components/molecule/ProductClient";
import SingleProductPage from "@/app/components/new-design/page/SingleProductPage";

// Helper function to strip HTML tags
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { slug, product_path } = await params;

  const product = await fetchProduct(product_path);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  // Clean description from HTML
  const cleanDescription = stripHtml(
    product?.seo?.description || product.title || "",
  );
  const metaDescription = cleanDescription.substring(0, 160) || product.title;

  // Get the first image or use a fallback
  const productImage = product.images?.[0]?.src;
  const siteName = STORE_NAME;

  const metaTitle = product?.seo?.title || `${product.title} | ${siteName}`;

  return {
    title: metaTitle || "Product",
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: productImage
        ? [
            {
              url: productImage,
              width: 1200,
              height: 630,
              alt: metaTitle,
            },
          ]
        : [],
      type: "website",
      siteName: siteName,
      url: `${BASE_URL}/${slug}/product/${product_path}`,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: productImage ? [productImage] : [],
    },
    alternates: {
      canonical: `${BASE_URL}/${slug}/product/${product_path}`,
    },
    // Product-specific metadata for structured data
    other: {
      "product:price:amount": product.variants?.[0]?.price || "",
      "product:price:currency": "USD",
      "product:availability": product.published ? "in stock" : "out of stock",
      "product:brand": product.brand || product.vendor || "",
      "og:type": "product",
      "og:price:amount": product.variants?.[0]?.price || "",
      "og:price:currency": "USD",
    },
  };
}

function buildJsonLd(product, slug, product_path) {
  const variant = product?.variants?.[0];
  const price = variant?.price;
  const availability = product?.published
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: stripHtml(product?.body_html || ""),
    image: product.images?.map((img) => img.src).filter(Boolean) || [],
    sku: variant?.sku || "",
    brand: {
      "@type": "Brand",
      name: product.vendor || STORE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/${slug}/product/${product_path}`,
      priceCurrency: "USD",
      price: price || "0",
      availability,
      seller: {
        "@type": "Organization",
        name: STORE_NAME,
      },
    },
  };

  if (product?.ratings) {
    const ratingValue = parseFloat(product.ratings) || 0;
    const reviewCount = product.reviews;
    if (ratingValue > 0 && reviewCount > 0) {
      jsonLd.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: ratingValue.toFixed(1),
        bestRating: "5",
        worstRating: "1",
        reviewCount,
      };
    }
  }

  return jsonLd;
}

export default async function ProductPage({ params }) {
  const { slug, product_path } = await params;

  const product = await fetchProduct(product_path);
  const product_id = product?.product_id;
  const ymal_products = await getYMALProducts();

  if(!product || !product_id){
    notFound();
  }

  const product_reviews = await getReviewsByProductId(product_id) || [];
  const jsonLd = buildJsonLd(product, slug, product_path);

  const [about, shipping_policy, return_policy, warranty] = await redis.mget([
    keys.faqs_about_brand.value,
    keys.faqs_shipping_policy.value,
    keys.faqs_return_policy.value,
    keys.faqs_warranty.value,
  ]);

  const FAQS = [
    {q: `About ${STORE_NAME}`, a: about},
    {q: `Shipping Policy`, a: shipping_policy},
    {q: `Return Policy`, a: return_policy},
    {q: `Warranty`, a: warranty},
  ];

  return (
    <>
      <RatingStyles />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<ProductPlaceholder />}>
        <SingleProductPage
        product={product}
        slug={slug}
        reviews={product_reviews}
        faqs={FAQS}
        ymalProducts={ymal_products}
        />
      </Suspense>
    </>
  );
}
