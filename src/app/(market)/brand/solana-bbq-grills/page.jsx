import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import MobileLoader from "@/app/components/molecule/MobileLoader";
import AddToCartButtonWrap from "@/app/components/atom/AddToCartButtonWrap";
import CarouselWrap from "@/app/components/atom/CarouselWrap";
import StarRating from "@/app/components/new-design/ui/StarRating";
import SubscribeWidget from "@/app/components/new-design/ui/SubscribeWidget";
import Reviews from "@/app/components/brand/Reviews";
import { getCollectionProducts } from "@/app/lib/fn_server";

import { BASE_URL, createSlug, formatProduct, formatPrice } from "@/app/lib/helpers";

export const metadata = {
  title: "Solana BBQ Grills | Premium Outdoor Kitchen Equipment",
  description:
    "Shop premium outdoor kitchen equipment at Solana BBQ Grills. Top-rated gas grills, side burners, outdoor storage, and accessories from Bull, Blaze, and Eloquence. Free shipping available.",
};

const CONTACT = "(888) 667-4986";

const BLAZE_COL_ID = 137;
const BLAZE_OPENBOX_COL_ID = 480;

const CATEGORIES = [
  { label: "Gas Grills & Smokers", image: "/images/home/categories/bbq-grills-and-smokers.webp", url: `${BASE_URL}/solana-grills` },
  { label: "Outdoor Kitchen Storage", image: "/images/home/categories/outdoor-kitchen-storage.webp", url: `${BASE_URL}/solana-storage` },
  { label: "Side Burners", image: "/images/home/categories/side-burners.webp", url: `${BASE_URL}/solana-side-burners` },
  { label: "Outdoor Refrigeration", image: "/images/home/categories/outdoor-refrigeration.webp", url: `${BASE_URL}/solana-refrigeration` },
  { label: "Accessories", image: "/images/home/categories/accessories.webp", url: `${BASE_URL}/solana-accessories` },
  { label: "Covers", image: "/images/home/categories/covers.webp", url: `${BASE_URL}/solana-covers` },
];

const BRANDS = [
  { name: "Bull Outdoor Products", url: `${BASE_URL}/bull-outdoor-products` },
  { name: "Napoleon", url: `${BASE_URL}/napoleon` },
  { name: "Eloquence Outdoor Living", url: `${BASE_URL}/eloquence` },
  { name: "Grandeur", url: `${BASE_URL}/grandeur` },
];

const ACCESSORIES = [
  { label: "Outdoor Kitchen Storage", image: "/images/feature/outdoor-kitchen-storage.webp", url: `${BASE_URL}/solana-storage` },
  { label: "Side Burners", image: "/images/feature/side-burners.webp", url: `${BASE_URL}/solana-side-burners` },
  { label: "Grill Covers", image: "/images/feature/grill-covers.webp", url: `${BASE_URL}/solana-covers` },
  { label: "Grill Attachments", image: "/images/feature/grill-attachments.webp", url: `${BASE_URL}/solana-accessories` },
  { label: "Grilling Tools & Utensils", image: "/images/feature/grill-tools-and-utensils.webp", url: `${BASE_URL}/solana-accessories` },
];

const BLOGS = [
  {
    title: "The Ultimate Guide to Building Your Dream Outdoor BBQ Kitchen",
    img: "/images/home/blogs/the-ultimate-guide-to-building-your-dream-outdoor-bbq-kitchen-solana.webp",
    tag: "Buying Guide", tag_bg: "bg-green-600",
    content: "This comprehensive guide will walk you through every step of the process, from initial planning to adding those final personal touches.",
  },
  {
    title: "Your Guide to Affordable BBQ Bliss",
    img: "/images/home/blogs/your-guide-to-affordable-bbq-bliss-image-solana.webp",
    tag: "Buying Guide", tag_bg: "bg-green-600",
    content: "This guide will walk you through the steps to designing a fantastic outdoor BBQ kitchen without breaking the bank.",
  },
  {
    title: "Essential Outdoor Kitchen Maintenance Tips for Long-Lasting Performance",
    img: "/images/home/blogs/essential-outdoor-kitchen-maintenance-tips-for-long-lasting-performance-image-solana.webp",
    tag: "Tips & Tricks", tag_bg: "bg-rose-600",
    content: "This guide provides key tips for effective outdoor kitchen maintenance, helping you preserve both beauty and functionality.",
  },
];

const FAQS = [
  { q: "What does every outdoor kitchen need?", a: "Every outdoor kitchen needs a quality grill, ample counter space, weather-resistant storage, proper ventilation, and access to gas, electricity, or water. Essentials like side burners, a sink, and a refrigerator enhance function and convenience. Durable materials and smart layout design ensure long-lasting performance and easy outdoor cooking year-round." },
  { q: "Which brand is best for barbecue grills?", a: "Some of the best barbecue grill brands known for quality and performance include Bull, Blaze, Weber, Napoleon, and Lynx. For professional-grade outdoor kitchens, Bull and Blaze stand out for their durable stainless steel construction, powerful burners, and long-lasting value, making them top choices for serious backyard chefs." },
  { q: "What to use for an outdoor kitchen?", a: "For an outdoor kitchen, use weather-resistant materials like stainless steel for appliances and cabinets, stone or granite for countertops, and sealed pavers or concrete for flooring. Equip it with a quality grill, side burners, storage, a sink, and a fridge. Choose materials and appliances rated for outdoor use to ensure durability and safety." },
  { q: "What are the basic kitchen equipments?", a: "Basic kitchen equipment includes a grill or stove, refrigerator, sink, countertop, and storage cabinets. For outdoor kitchens, use weather-resistant materials like stainless steel and stone. Optional additions like side burners or a pizza oven can enhance functionality, but the essentials focus on cooking, cleaning, storing, and prepping food safely." },
  { q: "What are the different types of BBQ grills?", a: "The main types of BBQ grills include gas grills, charcoal grills, pellet grills, and electric grills. Gas grills offer convenience and quick heat-up, while charcoal grills deliver classic smoky flavor. Pellet grills use wood pellets for precise temperature control, and electric grills are ideal for small spaces with easy plug-in use." },
];


// ─── Shared primitives ────────────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <p className="text-[11px] tracking-[.15em] uppercase font-semibold text-fire mb-2">
    {children}
  </p>
);

const PriceFormatter = ({ price, was, save }) => {
  if (!price) return null;
  const [int, dec = "00"] = String(price).split(".");
  return (
    <div className="min-h-[43px]">
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-fire">
          <sup className="text-xs">$</sup>{int}
          <sup className="text-xs">{dec}</sup>
        </span>
        {!!was && (
          <span className="text-xs text-stone-400 line-through">
            ${formatPrice(was)}
          </span>
        )}
      </div>
      {!!save && (
        <p className="text-[10px] text-emerald-600 font-semibold">
          Save ${formatPrice(save)}
        </p>
      )}
    </div>
  );
};

const ProductImage = ({ data }) => {
  const image = data?.images?.find(({ position }) => position === 1);
  if (!image) return null;
  return (
    <Image
      src={image.src}
      title={data.title}
      alt={`${createSlug(data.title)} image`}
      fill
      className="object-contain transition-transform duration-500 group-hover:scale-105"
      sizes="(max-width: 768px) 100vw, 300px"
    />
  );
};

const ProductCard = ({ item }) => (
  <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 hover:border-fire/40 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group flex flex-col">
    <Link
      prefetch={false}
      href={`${BASE_URL}/${createSlug(item.brand)}/product/${item.handle}`}
      className="block"
    >
      <div className="aspect-[4/3] relative bg-stone-50 dark:bg-stone-800 overflow-hidden">
        <ProductImage data={item} />
      </div>
    </Link>
    <div className="p-4 flex flex-col gap-2 flex-1">
      <p className="text-[10px] tracking-widest uppercase text-fire font-bold">
        {item.brand}
      </p>
      <Link
        prefetch={false}
        href={`${BASE_URL}/${createSlug(item.brand)}/product/${item.handle}`}
        title={item.title}
        className="text-sm font-medium text-stone-800 dark:text-stone-200 line-clamp-2 leading-snug hover:text-fire transition-colors duration-200 flex-1"
      >
        {item.title}
      </Link>
      <StarRating rating={item.ratings} />
      <PriceFormatter price={item.price} was={item.was} save={item.save_amt} />
      <AddToCartButtonWrap product={item}>
        <button className="w-full mt-1 bg-fire hover:bg-orange-600 text-white font-semibold rounded-full py-2 px-4 text-sm transition-colors duration-300">
          Add to Cart
        </button>
      </AddToCartButtonWrap>
    </div>
  </div>
);

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-hidden">
        <div className="aspect-[4/3] bg-stone-200 dark:bg-stone-700" />
        <div className="p-4 flex flex-col gap-3">
          <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/3" />
          <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-full" />
          <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-2/3" />
          <div className="h-8 bg-stone-300 dark:bg-stone-600 rounded-full w-full mt-1" />
        </div>
      </div>
    ))}
  </div>
);

const carouselBreakpoints = [
  { minWidth: 0, value: 1 },
  { minWidth: 640, value: 2 },
  { minWidth: 768, value: 3 },
  { minWidth: 1280, value: 4 },
];

// ─── Sections ─────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className="relative w-full h-[300px] sm:h-[420px] md:h-[540px] bg-stone-900 overflow-hidden">
    <h1 className="sr-only">
      Solana BBQ Grills — Premium Outdoor Kitchen Equipment
    </h1>
    <Image
      src="/images/banner/home-banner.webp"
      alt="Solana BBQ Grills — Premium Outdoor Kitchen Equipment"
      fill
      className="object-cover opacity-75"
      loading="eager"
      priority
      sizes="100vw"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-stone-900/70 via-stone-900/30 to-transparent" />
    <div className="absolute inset-0 flex items-center">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 w-full">
        <div className="max-w-lg">
          <SectionLabel>Premium Outdoor Kitchen Equipment</SectionLabel>
          <p className="text-white text-3xl sm:text-5xl font-serif leading-tight mb-3">
            Grill Better.<br />
            <span className="text-fire">Live Better.</span>
          </p>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6 max-w-sm">
            Top-rated grills, burners, and outdoor kitchen gear from Bull, Blaze, and more.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              prefetch={false}
              href={`${BASE_URL}/solana-grills`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-fire hover:bg-orange-600 text-white font-semibold rounded-full text-sm transition-colors duration-300"
            >
              Shop Grills →
            </Link>
            <Link
              prefetch={false}
              href={`tel:${CONTACT}`}
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 hover:border-white/70 text-white font-semibold rounded-full text-sm transition-colors duration-300"
            >
              {CONTACT}
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const CategoryGrid = () => (
  <section className="py-12 md:py-16 bg-cream dark:bg-stone-950">
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
      <div className="mb-8">
        <SectionLabel>Shop by Category</SectionLabel>
        <h2 className="font-serif text-3xl text-charcoal dark:text-white">
          Everything You Need Outdoors
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.url}
            prefetch={false}
            href={cat.url}
            className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-fire/50 hover:shadow-md transition-all duration-300"
          >
            <div className="relative aspect-1 bg-stone-100 dark:bg-stone-900 overflow-hidden">
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
              />
            </div>
            <div className="px-3 py-2.5 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800">
              <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 group-hover:text-fire transition-colors duration-200 leading-tight">
                {cat.label}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const FeaturedBrand = async () => {
  const raw = await getCollectionProducts(BLAZE_COL_ID);
  const products = (raw || []).map((p) => formatProduct(p, "card"));

  return (
    <section className="py-12 md:py-20 bg-white dark:bg-stone-900">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <SectionLabel>Featured Brand</SectionLabel>
            <h2 className="font-serif text-3xl text-charcoal dark:text-white">
              Blaze Outdoor Products
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 max-w-md">
              Commercial-grade performance and sleek stainless steel design at exceptional value.
            </p>
          </div>
          <Link
            prefetch={false}
            href={`${BASE_URL}/blaze-outdoor-products`}
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 border-2 border-stone-200 dark:border-stone-700 hover:border-fire text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-fire rounded-full transition-colors duration-300"
          >
            View All Blaze →
          </Link>
        </div>
        <CarouselWrap breakpoints={carouselBreakpoints}>
          {products.map((item) => (
            <ProductCard key={item.handle} item={item} />
          ))}
        </CarouselWrap>
        <div className="flex flex-wrap gap-2 items-center mt-8 pt-8 border-t border-stone-100 dark:border-stone-800">
          <span className="text-xs text-stone-400 font-medium mr-1">More brands:</span>
          {BRANDS.map((b) => (
            <Link
              key={b.url}
              prefetch={false}
              href={b.url}
              className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-fire border border-stone-200 dark:border-stone-700 hover:border-fire/50 px-3 py-1.5 rounded-full transition-colors duration-200"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = () => (
  <section className="py-12 md:py-20 bg-stone-50 dark:bg-stone-950">
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
      <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">
        <div className="w-full md:w-1/2 overflow-hidden rounded-2xl shadow-xl flex-shrink-0">
          <Image
            src="/images/home/about-solana-grills-image.webp"
            alt="About Solana BBQ Grills — Outdoor Kitchen Specialists"
            width={800}
            height={600}
            className="object-cover w-full hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-5">
          <div className="w-8 h-[2px] bg-fire" />
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal dark:text-white leading-tight">
            About Solana BBQ Grills
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
            At Solana BBQ Grills, we&rsquo;re passionate about bringing people together through great food and outdoor living. We specialize in high-quality grills, side burners, and outdoor kitchen equipment from trusted brands like Bull, Blaze, and more.
          </p>
          <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
            We believe outdoor cooking should be easy, enjoyable, and built to last. That&rsquo;s why we offer expert support, fast shipping, and a carefully selected range of products known for durability and value.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              prefetch={false}
              href={`${BASE_URL}/solana-grills`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-fire hover:bg-orange-600 text-white font-semibold rounded-full text-sm transition-colors duration-300"
            >
              Shop Now →
            </Link>
            <Link
              prefetch={false}
              href={`tel:${CONTACT}`}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-stone-200 dark:border-stone-700 hover:border-fire text-stone-700 dark:text-stone-300 font-semibold rounded-full text-sm transition-colors duration-300"
            >
              Call Us {CONTACT}
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const AccessoriesGrid = () => (
  <section className="py-12 md:py-20 bg-white dark:bg-stone-900">
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
      <div className="mb-8">
        <SectionLabel>Accessories</SectionLabel>
        <h2 className="font-serif text-3xl text-charcoal dark:text-white">
          Complete Your Outdoor Kitchen
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {ACCESSORIES.map((item) => (
          <Link
            key={item.label}
            prefetch={false}
            href={item.url}
            className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-fire/40 hover:shadow-md transition-all duration-300 bg-stone-50 dark:bg-stone-800"
          >
            <div className="relative aspect-1 overflow-hidden">
              <Image
                src={item.image}
                alt={item.label}
                fill
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
              />
            </div>
            <div className="px-3 py-2.5 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 text-center">
              <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 group-hover:text-fire transition-colors duration-200">
                {item.label}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const OpenBox = async () => {
  const raw = await getCollectionProducts(BLAZE_OPENBOX_COL_ID);
  const products = (raw || []).map((p) => formatProduct(p, "card"));
  if (!products.length) return null;

  return (
    <section className="py-12 md:py-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <SectionLabel>Open Box</SectionLabel>
            <h2 className="font-serif text-3xl text-charcoal dark:text-white">
              Like New, Better Price
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
              Inspected, approved, and ready to ship — at a fraction of the retail price.
            </p>
          </div>
          <Link
            prefetch={false}
            href={`${BASE_URL}/blaze-outdoor-products?sort=popular&filter%3Aways_to_shop=Clearance%2FOpen+Box`}
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 border-2 border-stone-200 dark:border-stone-700 hover:border-fire text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-fire rounded-full transition-colors duration-300"
          >
            View All →
          </Link>
        </div>
        <CarouselWrap breakpoints={carouselBreakpoints}>
          {products.map((item) => (
            <div key={item.handle} className="relative">
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Open Box
                </span>
              </div>
              <ProductCard item={item} />
            </div>
          ))}
        </CarouselWrap>
      </div>
    </section>
  );
};

const BlogsSection = () => (
  <section className="py-12 md:py-20 bg-white dark:bg-stone-900">
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
      <div className="mb-10">
        <SectionLabel>Resources</SectionLabel>
        <h2 className="font-serif text-3xl text-charcoal dark:text-white">
          Your Backyard Cooking Hub
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {BLOGS.map((blog) => (
          <article
            key={blog.title}
            className="group flex flex-col bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-100 dark:border-stone-800 hover:border-fire/40 hover:shadow-md transition-all duration-300"
          >
            <div className="relative overflow-hidden">
              <span className={`absolute top-3 left-3 z-10 text-white text-[10px] font-semibold py-1 px-3 rounded-full ${blog.tag_bg}`}>
                {blog.tag}
              </span>
              <div className="aspect-[16/10] overflow-hidden">
                <Image
                  src={blog.img}
                  alt={blog.title}
                  width={640}
                  height={400}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="p-5 flex flex-col gap-3 flex-1">
              <h3 className="font-serif font-medium text-stone-800 dark:text-white line-clamp-2 text-base leading-snug group-hover:text-fire transition-colors duration-200">
                {blog.title}
              </h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed line-clamp-3 flex-1">
                {blog.content}
              </p>
              <span className="text-fire text-xs font-bold tracking-[0.15em] uppercase mt-auto pt-2">
                Read More →
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const FAQs = () => (
  <section className="py-12 md:py-20 bg-stone-50 dark:bg-stone-950">
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
      <div className="mb-10">
        <SectionLabel>FAQs</SectionLabel>
        <h2 className="font-serif text-3xl text-charcoal dark:text-white">
          Frequently Asked Questions
        </h2>
      </div>
      <div className="flex flex-col divide-y divide-stone-200 dark:divide-stone-800">
        {FAQS.map((faq, i) => (
          <details key={i} className="group py-5 cursor-pointer">
            <summary className="flex items-center justify-between gap-4 list-none text-sm font-semibold text-stone-800 dark:text-white hover:text-fire transition-colors duration-200 select-none">
              {faq.q}
              <svg
                className="w-4 h-4 flex-shrink-0 text-fire transition-transform duration-300 group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="mt-3 text-sm text-stone-500 dark:text-stone-400 leading-relaxed pr-8">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

const NewsletterSection = () => (
  <section className="bg-stone-900 py-16 md:py-24">
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col items-center gap-6 text-center">
      <div className="w-8 h-[2px] bg-fire mx-auto" />
      <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-white leading-tight">
        Stay in the Loop
      </h2>
      <p className="text-stone-400 text-sm sm:text-base max-w-md leading-relaxed">
        Subscribe for exclusive deals, guides, and outdoor living inspiration delivered straight to your inbox.
      </p>
      <SubscribeWidget label="Subscribe →" />
      <p className="text-stone-600 text-xs">No spam. Unsubscribe at any time.</p>
    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const FeaturedBrandSkeleton = () => (
  <div className="py-12 md:py-20 bg-white dark:bg-stone-900">
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
      <ProductGridSkeleton />
    </div>
  </div>
);

const OpenBoxSkeleton = () => (
  <div className="py-12 md:py-20 bg-stone-50 dark:bg-stone-950">
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
      <ProductGridSkeleton />
    </div>
  </div>
);

export default async function SolanaGrillsPage() {

  return (
    <>
      <MobileLoader />
      <Hero />
      <CategoryGrid />
      <Suspense fallback={<FeaturedBrandSkeleton />}>
        <FeaturedBrand />
      </Suspense>
      <About />
      <AccessoriesGrid />
      <Suspense fallback={<OpenBoxSkeleton />}>
        <OpenBox />
      </Suspense>
      <BlogsSection />
      <Reviews />
      <FAQs />
      <NewsletterSection />
    </>
  );
}
