import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import MobileLoader from "@/app/components/molecule/MobileLoader";
import AddToCartButtonWrap from "@/app/components/atom/AddToCartButtonWrap";
import CarouselWrap from "@/app/components/atom/CarouselWrap";
import { Rating } from "@smastrom/react-rating";
import StarRating from "@/app/components/new-design/ui/StarRating";

import {
  BASE_URL,
  createSlug,
  parseRatingCount,
  formatProduct,
  formatPrice
} from "@/app/lib/helpers";

export const metadata = {
  title: "Shop Outdoor Kitchen Equipment | Solana BBQ Grills",
  description:
    "Upgrade your backyard with premium outdoor kitchen equipment from Solana BBQ Grills. Best prices on grills, burners, and accessories. Shop now!",
};

const CONTACT = "(888) 667-4986";

const CATEGORIES = [
  {
    label: "Eloquence Grills",
    image: "/images/home/eloquence/eloquence-home-eloquence-grills.webp",
    url: `${BASE_URL}/eloquence-grills`,
  },
  {
    label: "Eloquence Side Burners",
    image: "/images/home/eloquence/eloquence-home-eloquence-side-burners.webp",
    url: `${BASE_URL}/eloquence-side-burners`,
  },
  {
    label: "Eloquence Storage",
    image: "/images/home/eloquence/eloquence-home-eloquence-storage.webp",
    url: `${BASE_URL}/eloquence-storage`,
  },
  {
    label: "Eloquence Accessories",
    image: "/images/home/eloquence/eloquence-home-eloquence-accessories.webp",
    url: `${BASE_URL}/eloquence-accessories`,
  },
  {
    label: "Eloquence Fireplaces",
    image: "/images/home/eloquence/eloquence-home-eloquence-fireplaces.webp",
    url: `${BASE_URL}/eloquence-fireplaces`,
  },
];

const REVIEWS = [
  {
    rating: 5,
    title: "Unlock Your Inner Chef",
    text: "I'm thrilled with this Blaze grill! It's live having a professional grade.",
    img: "/images/home/user-profile-review-1.webp",
    name: "Rendell Silver",
  },
  {
    rating: 5,
    title: "Impressive Quality",
    text: "What a fantastic grill! This Grandeur Premium has...",
    img: "/images/home/user-profile-review-1.webp",
    name: "Zachary Pugh",
  },
  {
    rating: 5,
    title: "Super Team",
    text: "Great customer service and even sent me a replacement...",
    img: "/images/home/user-profile-review-2.webp",
    name: "Sarah Smith",
  },
];

const BLOGS = [
  {
    title:
      "The Eloquence Journey: From Ordinary to Extraordinary Backyard Outdoor Kitchens",
    img: "/images/home/eloquence/proven-tips-to-extend-your-grills-lifespan.webp",
    tag: "Buying Guide",
    tag_bg: "bg-green-600",
    content:
      "Eloquence was born from a simple belief. The backyard outdoor kitchen should feel luxurious withiout luxurious price.",
  },
  {
    title: "Stainless BBQ Grill Showdown: Eloquence vs Bull",
    img: "/images/home/eloquence/key-outdoor-kitchen-appliances-for-bbq-mastery.webp",
    tag: "Buying Guide",
    tag_bg: "bg-green-600",
    content:
      "Outdoor living with a stainless BBQ grill is no longer a trend. It's a lifestyle. Families gather around patio tables...",
  },
  {
    title: "Best Materials for Outdoor Kitchens That Last Years",
    img: "/images/home/eloquence/key-outdoor-kitchen-appliances-for-bbq-mastery-1.webp",
    tag: "Tips & Tricks",
    tag_bg: "bg-rose-600",
    content:
      "Transforming your backyard with an outdoor kitchen starts with selecting the best materials for outdoor kitchens to ensure durability...",
  },
];

const Hero = () => (
  <div className="w-full mx-auto flex flex-col md:flex-row">
    <div className="w-full md:w-full relative overflow-hidden">
      <div className="w-full relative aspect-[640/119] bg-red-200">
        {/* FOR SEO */}
        <h1 className="hidden">
          Eloquence: Outdoor Kitchen Products That Define Quality and Style
        </h1>
        <Image
          src="/images/home/eloquence/eloquence-banner-202509.webp"
          alt="Banner"
          className="object-contain"
          fill
          loading="eager"
          priority={true}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px"
        />
      </div>
    </div>
  </div>
);

const HeroAlert = () => (
  <div className="bg-[#1e1e24] border-b border-[#e98f3b]/20">
    <div className="max-w-[1240px] mx-auto py-3 px-4 sm:px-6">
      <Link
        prefetch={false}
        href={`tel:${CONTACT}`}
        className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 group"
      >
        <span className="text-[#e98f3b] text-xs font-semibold tracking-[0.15em] uppercase">
          Call For Best Pricing
        </span>
        <span className="hidden sm:block text-stone-600 select-none">·</span>
        <span className="text-white text-sm sm:text-base font-light tracking-wider group-hover:text-[#e98f3b] transition-colors duration-300">
          888-667-4986
        </span>
        <span className="hidden sm:block text-stone-600 select-none">·</span>
        <span className="text-stone-400 text-xs font-light hidden sm:inline">
          Experts standing by · Exclusive package deals
        </span>
      </Link>
    </div>
  </div>
);

const Block1 = () => (
  <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 md:py-20">
    <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">
      <div className="w-full md:w-1/2 overflow-hidden rounded-2xl shadow-xl">
        <Image
          src="/images/home/eloquence/built-to-impress-priced-to-compete.webp"
          alt="Build to Impress. Priced to Compete"
          className="object-cover w-full hover:scale-105 transition-transform duration-700"
          width={1000}
          height={0}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px"
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col gap-5">
        <div className="w-8 h-[2px] bg-[#e98f3b]" />
        <h2 className="text-3xl sm:text-[40px] font-semibold leading-tight font-playfair-display text-stone-800">
          Built to Impress.{" "}
          <span className="text-[#e98f3b] italic">Priced to Compete</span>
        </h2>
        <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
          Eloquence Outdoor Living combines premium outdoor kitchen equipment
          with timeless design to enhance backyard kitchens of every style. From
          outdoor cooking essentials to storage solutions, fireplaces, and
          accessories, each piece is built for lasting performance.
        </p>
        <div>
          <Link
            prefetch={false}
            href={`${BASE_URL}/eloquence`}
            className="inline-flex items-center gap-2 py-3 px-8 font-semibold text-white bg-[#e53237] rounded-full text-sm hover:bg-[#c62b30] transition-colors duration-300 tracking-wide"
          >
            Shop Now →
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const Block2 = () => {
  const breakpoints = [
    { minWidth: 0, value: 1 },
    { minWidth: 350, value: 2 },
    { minWidth: 750, value: 3 },
    { minWidth: 850, value: 4 },
    { minWidth: 1024, value: 5 },
    { minWidth: 1280, value: 6 },
  ];

  return (
    <div className="bg-stone-50 py-12 md:py-20">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="w-8 h-[2px] bg-[#e98f3b] mx-auto mb-4" />
          <h2 className="text-3xl sm:text-[40px] font-semibold leading-tight font-playfair-display text-stone-800">
            Design You Can Feel.{" "}
            <span className="text-[#e98f3b] italic">
              Performance You Can Trust
            </span>
          </h2>
          <p className="mt-4 text-stone-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Premium outdoor kitchen equipment crafted for lasting performance
            and timeless appeal.
          </p>
        </div>
        <CarouselWrap breakpoints={breakpoints}>
          {CATEGORIES.map((item) => (
            <Link
              key={`eloquence-products-categories-${createSlug(item?.label)}`}
              prefetch={false}
              href={item?.url}
              className="flex flex-col overflow-hidden rounded-xl border border-stone-200 hover:border-[#e98f3b] hover:shadow-lg transition-all duration-300 w-full aspect-[236/362] group"
            >
              <div className="bg-stone-100 w-full aspect-w-4 aspect-h-5 flex items-center justify-center relative overflow-hidden">
                {item?.image && (
                  <Image
                    src={item?.image}
                    title={`${item?.label}`}
                    alt={`${createSlug(item?.label)}-image`}
                    fill
                    className="object-cover  group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                )}
              </div>
              <div className="font-playfair-display font-medium bg-white border-t border-stone-100 min-h-[60px] flex items-center justify-center text-center px-3 py-3 text-stone-800 text-sm group-hover:text-[#e98f3b] transition-colors duration-300">
                {item?.label}
              </div>
            </Link>
          ))}
          <Link
            prefetch={false}
            href={`${BASE_URL}/eloquence`}
            className="relative overflow-hidden rounded-xl border border-stone-800 bg-stone-900 hover:border-[#e98f3b] hover:shadow-lg transition-all duration-300 w-full aspect-[236/362] group"
          >
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-5">
              <div className="relative aspect-w-4 aspect-h-5 w-[55%]">
                <Image
                  src="/images/home/eloquence/eloquence-logo-only.webp"
                  title="Shop All Eloquence"
                  alt="eloquence-logo-only-image"
                  fill
                  className="object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              <div className="font-playfair-display text-sm font-light text-white/70 group-hover:text-white transition-colors duration-300 tracking-widest">
                Shop All →
              </div>
            </div>
          </Link>
        </CarouselWrap>
      </div>
    </div>
  );
};

const getCollectionProducts = async (id) => {
  const res = await fetch(
    `${BASE_URL}/api/collections/collection-products/${id}`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  return res.json();
};

const PriceFormatter = ({ price, was, save }) => {
  if (!price) return null;
  const [intPart, decimalPart = "00"] = String(price).split(".");
  const [wasIntPart, wasDecimalPart = "00"] = String(was).split(".");
  return (
    <div>
      <div>
        <div className="inline-block text-3xl relative text-[#e98f3b] font-bold mr-[30px]">
          <span className="text-sm self-start">$</span>
          {intPart}
          <span className="absolute top-1 left-full text-sm">{decimalPart}</span>
        </div>
        {
          was &&
        <div className="inline-block text-base relative text-neutral-600 line-through">
          ${formatPrice(was)}
        </div>
        }
      </div>
      <div className="text-xs text-emerald-600">
        {
          save && `Save $${formatPrice(save)}`
        }
      </div>
    </div>
  );
};

const ProductImage = ({ data }) => {
  if (!data?.images) return null;
  const image = data.images.find(({ position }) => position === 1);
  if (!image) return null;
  return (
    <Image
      src={image?.src}
      title={`${data.title}`}
      alt={`${createSlug(data.title)}-image`}
      fill
      className="object-contain"
      sizes="(max-width: 768px) 100vw, 300px"
    />
  );
};

const Block3Skeleton = () => (
  <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 md:py-20">
    <div className="text-center mb-10 animate-pulse">
      <div className="w-8 h-[2px] bg-stone-200 mx-auto mb-4" />
      <div className="h-10 bg-stone-200 rounded-lg w-56 mx-auto" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-stone-100 animate-pulse rounded-xl overflow-hidden"
        >
          <div className="aspect-[4/3] bg-stone-200" />
          <div className="p-4 flex flex-col gap-3">
            <div className="h-4 bg-stone-200 rounded w-full" />
            <div className="h-4 bg-stone-200 rounded w-3/4" />
            <div className="h-4 bg-stone-200 rounded w-1/2" />
            <div className="h-8 bg-stone-300 rounded-full w-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Block3 = async () => {
  const data = await getCollectionProducts(483);
  const products = (data || []).map((p) => formatProduct(p, "card"));
  const breakpoints = [
    { minWidth: 0, value: 1 },
    { minWidth: 640, value: 2 },
    { minWidth: 768, value: 3 },
    { minWidth: 1280, value: 4 },
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 md:py-20">
      <div className="text-center mb-10">
        <div className="w-8 h-[2px] bg-[#e98f3b] mx-auto mb-4" />
        <h2 className="text-3xl sm:text-[40px] font-semibold leading-tight font-playfair-display text-stone-800">
          Our <span className="text-[#e98f3b] italic">Best Sellers</span>
        </h2>
      </div>
      <CarouselWrap breakpoints={breakpoints}>
        {products &&
          products.map((item) => (
            <div
              key={`carousel-product-item-${item?.handle}`}
              className="bg-white border border-stone-100 hover:border-[#e98f3b] hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden group"
            >
              <Link
                prefetch={false}
                href={`${BASE_URL}/${createSlug(item?.brand)}/product/${item?.handle}`}
                title={item?.title}
              >
                <div className="aspect-[4/3] relative bg-stone-50 w-full overflow-hidden">
                  <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500">
                    <ProductImage data={item} />
                  </div>
                </div>
              </Link>
              <div className="p-4 flex flex-col gap-3">
                <div className="text-xs tracking-widest uppercase text-[#e98f3b] font-bold">
                  {item?.brand}
                </div>
                <Link
                  prefetch={false}
                  href={`${BASE_URL}/${createSlug(item?.brand)}/product/${item?.handle}`}
                  className="line-clamp-2 text-sm font-medium text-stone-800 group-hover:text-[#e53237] transition-colors duration-200 leading-snug"
                  title={item?.title}
                >
                  {item?.title}
                </Link>
                <StarRating rating={item?.ratings} />
                <PriceFormatter
                  price={item?.price}
                  was={item?.was}
                  save={item?.save_amt}
                />
                <AddToCartButtonWrap product={item}>
                  <button
                    className="w-full bg-[#e53237] text-white font-semibold rounded-full py-2 px-6 text-sm hover:bg-[#c62b30] transition-colors duration-300"
                    title={item?.title}
                  >
                    Buy Now
                  </button>
                </AddToCartButtonWrap>
              </div>
            </div>
          ))}
      </CarouselWrap>
      <div className="text-center mt-10">
        <Link
          prefetch={false}
          href={`${BASE_URL}/eloquence`}
          className="inline-flex items-center gap-2 bg-[#e53237] text-white font-semibold rounded-full py-3 px-10 text-sm hover:bg-[#c62b30] transition-colors duration-300 tracking-wide"
        >
          View All Products →
        </Link>
      </div>
    </div>
  );
};

const Reviews = () => {
  const breakpoints = [
    { minWidth: 0, value: 1 },
    { minWidth: 1024, value: 2 },
    { minWidth: 1280, value: 3 },
  ];

  return (
    <div className="w-full mt-10">
      <div className="max-w-[1240] mx-auto">
        <div className="flex-col lg:flex-row flex gap-[50px] lg:gap-[10px] items-center">
          <div className="lg:w-[30%] lg:p-[20px] flex flex-col gap-[8px] justify-center text-center lg:justify-normal lg:text-left">
            <h2 className="text-[#e98f3b] text-[40px] font-medium leading-[120%] italic font-playfair-display">
              Our customer reviews
            </h2>
            <div className="flex justify-center lg:justify-start">
              <Rating
                readOnly
                value={4.5}
                fractions={2}
                style={{ maxWidth: 150 }}
              />
            </div>
            <div className="text-xs lg:text-base">
              4.4 stars out of based from{" "}
              <span className="underline cursor-pointer">122 reviews</span>
            </div>
            <div className="flex justify-center lg:justify-start">
              <div className="w-[250px] border border-stone-500 bg-stone-200 h-[35px] rounded-lg overflow-hidden">
                <div className="h-[35px] w-[90%] bg-amber-400 border-t border-t-white" />
              </div>
            </div>
            <div className="text-xs lg:text-sm underline text-stone-700 cursor-pointer">
              Write a review
            </div>
          </div>
          <div className="w-full lg:w-[70%] flex-col lg:flex-row flex gap-[10px] min-h-[227px]">
            <CarouselWrap breakpoints={breakpoints}>
              {REVIEWS.map((i, idx) => (
                <div key={`review-${idx}`} className="bg-white w-full p-[20px]">
                  <div className="flex flex-col gap-[15px] justify-center items-center text-center">
                    <div className="flex text-center justify-center">
                      <Rating
                        readOnly
                        value={i.rating}
                        style={{ maxWidth: 150 }}
                      />
                    </div>
                    <div className="font-extrabold text-sm lg:text-base">
                      {i.title}
                    </div>
                    <div className="text-xs lg:text-sm">{i.text}</div>
                    <div className="flex items-center justify-center">
                      <div className="relative w-[30px] h-[30px]">
                        <Image
                          src={i.img}
                          alt={`${i.name}-image`}
                          className="w-full h-full object-cover"
                          width={200}
                          height={200}
                        />
                      </div>
                      <div className="text-xs text-stone-700">{i.name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CarouselWrap>
          </div>
        </div>
      </div>
    </div>
  );
};

const Block5 = () => (
  <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 md:py-20">
    <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">
      <div className="w-full md:w-1/2 flex flex-col gap-5 order-2 md:order-1">
        <div className="w-8 h-[2px] bg-[#e98f3b]" />
        <h2 className="text-3xl sm:text-[40px] font-semibold leading-tight font-playfair-display text-stone-800">
          Where Lasting Flavor,{" "}
          <span className="text-[#e98f3b] italic">Meets Lasting Value</span>
        </h2>
        <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
          An outdoor kitchen is more than a cooking space — it&apos;s the heart
          of family gatherings and celebrations. At Eloquence Outdoor Living, we
          craft premium grills, storage, and fireplaces that bring lasting
          flavor to every meal and timeless value to your backyard kitchen.
        </p>
        <div>
          <Link
            prefetch={false}
            href={`${BASE_URL}/eloquence`}
            className="inline-flex items-center gap-2 py-3 px-8 font-semibold text-white bg-[#e53237] rounded-full text-sm hover:bg-[#c62b30] transition-colors duration-300 tracking-wide"
          >
            Shop Now →
          </Link>
        </div>
      </div>
      <div className="w-full md:w-1/2 order-1 md:order-2 overflow-hidden rounded-2xl shadow-xl">
        <Image
          src="/images/home/eloquence/where-lasting-flavor-meets-lasting-value.webp"
          alt="Where Lasting Flavor, Meets Lasting Value"
          className="object-cover w-full hover:scale-105 transition-transform duration-700"
          width={1000}
          height={0}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px"
        />
      </div>
    </div>
  </div>
);

const Blogs = () => (
  <div className="bg-stone-50 py-12 md:py-20">
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
      <div className="mb-10">
        <div className="w-8 h-[2px] bg-[#e98f3b] mb-4" />
        <h2 className="text-3xl sm:text-[40px] font-semibold leading-tight font-playfair-display text-stone-800">
          Your Trusted{" "}
          <span className="text-[#e98f3b] italic">Backyard BBQ Resource</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {BLOGS.map((i, idx) => (
          <div
            key={`blog-${idx}`}
            className="group flex flex-col bg-white rounded-xl overflow-hidden border border-stone-100 hover:border-[#e98f3b] hover:shadow-md transition-all duration-300"
          >
            <div className="relative overflow-hidden">
              <span
                className={`absolute top-3 left-3 z-10 text-white text-xs font-semibold py-1 px-3 rounded-full ${i.tag_bg}`}
              >
                {i.tag}
              </span>
              <div className="aspect-[16/10] bg-stone-100 overflow-hidden">
                {i?.img && (
                  <Link prefetch={false} href={i?.url || "#"}>
                    <Image
                      src={i.img}
                      alt={`${i.title}-image`}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      width={1000}
                      height={0}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px"
                    />
                  </Link>
                )}
              </div>
            </div>
            <div className="p-5 flex flex-col gap-3 flex-1">
              <Link
                prefetch={false}
                href={i?.url || "#"}
                className="font-playfair-display font-medium text-stone-800 hover:text-[#e98f3b] transition-colors duration-200 line-clamp-2 text-base leading-snug"
              >
                <h3>{i.title}</h3>
              </Link>
              <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 flex-1">
                {i.content}
              </p>
              <Link
                prefetch={false}
                href={i?.url || "#"}
                className="text-[#e53237] text-xs font-bold tracking-[0.15em] uppercase hover:underline mt-auto pt-2 flex items-center gap-1"
              >
                Learn More →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Newsletter = () => (
  <div className="bg-stone-900 py-16 md:py-24">
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col items-center gap-6 text-center">
      <div className="w-8 h-[2px] bg-[#e98f3b] mx-auto" />
      <h2 className="text-2xl sm:text-3xl font-playfair-display font-semibold text-white leading-tight">
        Stay in the Loop
      </h2>
      <p className="text-stone-400 text-sm sm:text-base max-w-md leading-relaxed">
        Subscribe for exclusive sales, recipes, guides, and backyard inspiration
        delivered straight to your inbox.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
        <input
          type="email"
          placeholder="Your email address"
          className="flex-1 text-sm py-3 px-5 rounded-full outline-none bg-stone-800 text-white placeholder-stone-500 border border-stone-700 focus:border-[#e98f3b] transition-colors duration-300"
        />
        <button className="py-3 px-8 text-white bg-[#e53237] rounded-full text-sm font-semibold hover:bg-[#c62b30] transition-colors duration-300 whitespace-nowrap tracking-wide">
          Subscribe →
        </button>
      </div>
      <p className="text-stone-600 text-xs">
        No spam. Unsubscribe at any time.
      </p>
    </div>
  </div>
);

export default async function EloquencePage() {
  return (
    <>
      <MobileLoader />
      <Hero />
      <HeroAlert />
      <Block1 />
      <Block2 />
      <Suspense fallback={<Block3Skeleton />}>
        <Block3 />
      </Suspense>
      <Reviews />
      <Block5 />
      <Blogs />
      <Newsletter />
    </>
  );
}
