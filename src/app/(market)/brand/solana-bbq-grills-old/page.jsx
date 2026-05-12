// NPM
import Image from "next/image";
import Link from "next/link";
// COMPONENTS
import SectionHeader from "@/app/components/atom/SectionHeader";
import MobileLoader from "@/app/components/molecule/MobileLoader";
import FeatureCategoriesSection from "@/app/components/section/HomePageFeatureCategories";
import ShopAllClearanceSection from "@/app/components/section/HomePageShopAllClearance";
import AboutProductSection from "@/app/components/section/HomePageAboutProduct";
import ReviewsSection from "@/app/components/section/HomePageReviews";
import FAQsSection from "@/app/components/section/HomePageFrequentlyAsked";
import NewsLetterSection from "@/app/components/section/NewsLetter";
import ProductCartToCart from "@/app/components/atom/ProductCardToCart";
import BlogsSection from "@/app/components/section/HomeBlogs";
import CollectionCarouselWrap from "@/app/components/atom/CollectionCarouselWrap";
import YmalCarousel from "@/app/components/atom/YmalCarousel";
// HELPERS
import { keys, redis } from "@/app/lib/redis";
import { BASE_URL, createSlug } from "@/app/lib/helpers";
// CONSTANTS
const pathname = "solana-bbq-grills";
export const metadata = {
  title: "Shop Outdoor Kitchen Equipment | Solana BBQ Grills",
  description:
    "Upgrade your backyard with premium outdoor kitchen equipment from Solana BBQ Grills. Best prices on grills, burners, and accessories. Shop now!",
};
const defaultMenuKey = keys.dev_shopify_menu.value;
const feat_carousel_items = [
  {
    label: "Gas Grills and Smokers",
    img: "/images/home/categories/bbq-grills-and-smokers.webp",
    url: `${BASE_URL}/solana-grills`,
  },
  {
    label: "Outdoor Kitchen Storage",
    img: "/images/home/categories/outdoor-kitchen-storage.webp",
    url: `${BASE_URL}/solana-storage`,
  },
  {
    label: "Side Burners",
    img: "/images/home/categories/side-burners.webp",
    url: `${BASE_URL}/solana-side-burners`,
  },
  {
    label: "Outdoor Refrigeration",
    img: "/images/home/categories/outdoor-refrigeration.webp",
    url: `${BASE_URL}/solana-refrigeration`,
  },
  {
    label: "Accessories",
    img: "/images/home/categories/accessories.webp",
    url: `${BASE_URL}/solana-accessories`,
  },
  {
    label: "Covers",
    img: "/images/home/categories/covers.webp",
    url: `${BASE_URL}/solana-covers`,
  },
];
const sac_contents = [
  {
    image: {
      src: "/images/home/unmatched-power-and-precision-from-bull-outdoor-products.webp",
      alt: "Unmatched Power and Precision from Bull Outdoor Products Image",
    },
    title: "Unmatched Power and Precision from Bull Outdoor Products",
    content:
      "Bull Outdoor Products has been a trusted name in outdoor kitchen equipment since 1993, offering durable, high-performance grills and accessories. At Solana BBQ Grills, we proudly carry Bull’s top-quality products to help you create a reliable and stylish outdoor cooking space.",
    button: {
      label: "Shop All Bull Products",
      url: `${BASE_URL}/bull-outdoor-products`,
      className:
        "font-medium border px-[20px] py-[8px] rounded bg-neutral-800 text-white shadow-md text-lg cursor-pointer hover:bg-neutral-700",
    },
  },
  {
    image: {
      src: "/images/home/cook-with-power-and-precision-using-blaze-grills.webp",
      alt: "Cook with Power and Precision Using Blaze Grills Image",
    },
    title: "Cook with Power and Precision Using Blaze Grills",
    content:
      "Blaze Grills delivers commercial-grade performance and sleek design at a great value. Made with durable stainless steel and precise engineering, Blaze is trusted by backyard chefs who want pro-level results. At Solana BBQ Grills, we proudly offer Blaze products to help you create a high-performance outdoor kitchen.",
    button: {
      label: "Shop All Blaze Products",
      url: `${BASE_URL}/blaze-outdoor-products`,
      className:
        "font-medium border px-[20px] py-[8px] rounded bg-neutral-800 text-white shadow-md text-lg cursor-pointer hover:bg-neutral-700",
    },
  },
];
const about_content = {
  image: "/images/home/about-solana-grills-image.webp",
  imageWrap: {
    className: "relative aspect-1 w-[300px]",
  },
  contact: "(888) 667-4986",
  content: {
    title: "About Solana BBQ Grills",
    par: [
      "At Solana BBQ Grills, we’re passionate about bringing people together through great food and outdoor living. We specialize in high-quality grills, side burners, and outdoor kitchen equipment from trusted brands like Bull, Blaze, and more. From building a full outdoor kitchen to upgrading your backyard grill station, we provide reliable, performance-driven products that match your style, space, and budget.",
      "We believe outdoor cooking should be easy, enjoyable, and built to last. That’s why we offer expert support, fast shipping, and a carefully selected range of products known for durability and value. At Solana BBQ Grills, we don’t just sell equipment; we help you create unforgettable moments, one perfectly grilled meal at a time.",
    ],
  },
  button: {
    className:
      "font-medium border px-[20px] py-[8px] rounded bg-neutral-800 text-white shadow-md text-lg cursor-pointer hover:bg-neutral-700 flex items-center gap-[10px]",
  },
};
const blogs_title = "Your Backyard Cooking Resource Hub";
const blogs = [
  {
    title: "The Ultimate Guide to Building Your Dream Outdoor BBQ Kitchen",
    img: "/images/home/blogs/the-ultimate-guide-to-building-your-dream-outdoor-bbq-kitchen-solana.webp",
    tag: "Buying Guide",
    tag_bg: "bg-green-600",
    content:
      "This comprehensive guide will walk you through every step of the process, from initial planning to adding those final personal touches.",
  },
  {
    title: "Your Guide to Affordable BBQ Bliss",
    img: "/images/home/blogs/your-guide-to-affordable-bbq-bliss-image-solana.webp",
    tag: "Buying Guide",
    tag_bg: "bg-green-600",
    content:
      "This guide will walk you through the steps to designing a fantastic outdoor BBQ kitchen without breaking the bank.",
  },
  {
    title:
      "Essential Outdoor Kitchen Maintenance Tips for Long-Lasting Performance",
    img: "/images/home/blogs/essential-outdoor-kitchen-maintenance-tips-for-long-lasting-performance-image-solana.webp",
    tag: "Tips & Tricks",
    tag_bg: "bg-rose-600",
    content:
      "This guide provides key tips for effective outdoor kitchen maintenance, helping you preserve both beauty and functionality.",
  },
];
const faqs = [
  {
    id: "Q1",
    is_open: false,
    question: "What does every outdoor kitchen need?",
    answer:
      "Every outdoor kitchen needs a quality grill, ample counter space, weather-resistant storage, proper ventilation, and access to gas, electricity, or water. Essentials like side burners, a sink, and a refrigerator enhance function and convenience. Durable materials and smart layout design ensure long-lasting performance and easy outdoor cooking year-round.",
  },
  {
    id: "Q2",
    is_open: false,
    question: "Which brand is best for barbecue grills?",
    answer:
      "Some of the best barbecue grill brands known for quality and performance include Bull, Blaze, Weber, Napoleon, and Lynx. For professional-grade outdoor kitchens, Bull and Blaze stand out for their durable stainless steel construction, powerful burners, and long-lasting value, making them top choices for serious backyard chefs.",
  },
  {
    id: "Q3",
    is_open: false,
    question: "What to use for an outdoor kitchen?",
    answer:
      "For an outdoor kitchen, use weather-resistant materials like stainless steel for appliances and cabinets, stone or granite for countertops, and sealed pavers or concrete for flooring. Equip it with a quality grill, side burners, storage, a sink, and a fridge. Choose materials and appliances rated for outdoor use to ensure durability and safety.",
  },
  {
    id: "Q4",
    is_open: false,
    question: "What are the basic kitchen equipments?",
    answer:
      "Basic kitchen equipment includes a grill or stove, refrigerator, sink, countertop, and storage cabinets. For outdoor kitchens, it's also important to use weather-resistant materials like stainless steel and stone. Optional additions like side burners or a pizza oven can enhance functionality, but the essentials focus on cooking, cleaning, storing, and prepping food safely.",
  },
  {
    id: "Q5",
    is_open: false,
    question: "What are the different types of BBQ grills?",
    answer:
      "The main types of BBQ grills include gas grills, charcoal grills, pellet grills, and electric grills. Gas grills offer convenience and quick heat-up, while charcoal grills deliver classic smoky flavor. Pellet grills use wood pellets for precise temperature control, and electric grills are ideal for small spaces with easy plug-in use.",
  },
];

// FUNCTIONS
const getMenu = async () => {
  return await redis.get(defaultMenuKey);
};
const flattenNav = (navItems) => {
  let result = [];

  const extractLinks = (items) => {
    items.forEach(({ children = [], ...rest }) => {
      result.push({ ...rest, children });
      extractLinks(children);
    });
  };

  extractLinks(navItems);

  return result;
};
// EXTENDED COMPONENT
const Hero = () => {
  const useBanner = "/images/banner/home-banner.webp";
  const data = {
    title: "Grill Better for Less with Solana Outdoor Kitchen Equipments",
    tag_line:
      "Solana Grills offers high-quality grills, burners, and outdoor kitchen accessories from trusted brands to help you build a stylish and functional outdoor cooking space that fits your needs.",
  };
  return (
    <div
      className={`w-full mx-auto flex flex-col md:flex-row ${
        data ? "fade-in" : "opacity-0"
      }`}
    >
      <div className={`w-full md:w-full`}>
        <div className="w-full relative isolate px-6 lg:px-8 bg-no-repeat bg-center bg-cover bg-stone-800 h-[250px] md:h-[calc(100vh-450px)] md:max-h-[550px]">
          {
            <Image
              src={useBanner}
              alt={data?.title ?? "Banner"}
              className="w-full h-full object-cover"
              fill
              loading="eager"
              priority={true}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px"
            />
          }
          <div className="absolute z-[9999] inset-0 m-auto flex items-center justify-center">
            <div className="container text-center flex justify-center">
              <div className="flex flex-col items-center justify-center w-full">
                <div className="w-[90%]">
                  <h1 className="text-balance text-md tracking-wide text-white md:text-4xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.5)] italic">
                    {data?.title}
                  </h1>
                </div>
                <div className="w-[75%]">
                  <h2 className="text-xs md:text-base text-balance font-normal mt-1 tracking-wide text-white drop-shadow-[2px_2px_2px_rgba(0,0,0,0.5)] text-center">
                    {data?.tag_line}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const BestBBQBrands = async () => {
  const getBlazeProducts = async () => {
    const collection_id = 4; // collection id 4 is a collection made for this only purpose
    const res = await fetch(
      `${BASE_URL}/api/collections/collection-products/${collection_id}`,
      {
        cache: "no-store", // optional: avoid caching during SSR
      }
    );

    if (!res.ok) {
      return false;
      throw new Error(`Failed to fetch collection ${id}`);
    }

    return res.json();
  };

  const bbb_menu = [
    {
      name: "Blaze Outdoor Products",
      url: "blaze-outdoor-products  ",
      child: [
        { name: "Blaze Open Box", url: "blaze-open-box" },
        { name: "Blaze Grills", url: "blaze-grills" },
        { name: "Blaze Side Burners", url: "blaze-side-burners" },
        { name: "Blaze Storage", url: "blaze-storage" },
        { name: "Blaze Refrigeration", url: "blaze-refrigeration" },
        { name: "Blaze Accessories", url: "blaze-accessories" },
      ],
    },
    {
      name: "Bull outdoor Products",
      url: "bull-outdoor-products",
    },
    {
      name: "Napoleon",
      url: "napoleon",
    },
    {
      name: "Eloquence Outdoor Kitchen Products",
      url: "eloquence",
    },
    {
      name: "Grandeur",
      url: "grandeur",
    },
  ];

  const items_per_break_point = [
    { minWidth: 0, value: 1 },
    { minWidth: 640, value: 2 },
    { minWidth: 768, value: 3 },
    { minWidth: 1280, value: 4 },
  ];

  const items = await getBlazeProducts();

  return (
    <div className="w-full mt-10">
      <div className="container mx-auto px-[10px] lg:px-[20px]">
        <div className="hidden lg:block">
          <SectionHeader text="Best BBQ Brands" />
          <div className="flex-col md:flex-row flex gap-[10px] mt-5">
            <div className="w-[25%] min-w-[250px] flex flex-col gap-5">
              {bbb_menu.map((i, idx) => (
                <div key={`menu-item-${idx}`} className="">
                  <Link
                    prefetch={false}
                    href={i?.url || "#"}
                    className="font-bold"
                  >
                    <h3>{i?.name}</h3>
                  </Link>
                  <div className="mt-3 flex flex-col gap-[3px]">
                    {i?.child &&
                      Array.isArray(i?.child) &&
                      i?.child?.length > 0 &&
                      i.child.map((i2, idx2) => (
                        <Link
                          prefetch={false}
                          href={`${BASE_URL}/${i2?.url}`}
                          key={`menu-sub-item-${idx}-${idx2}`}
                        >
                          {i2.name}
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-l w-[calc(100%-250px)]  pl-[20px]">
              <div className="text-3xl italic font-semibold __className_b1512a">
                Blaze Outdoor Products
              </div>
              {items && Array.isArray(items) && items?.length > 0 ? (
                <div className="flex gap-[30px] mt-5 min-h-[230px]">
                  {items.map((item, idx) => (
                    <ProductCartToCart
                      key={`product-cart-to-cart-item-${idx}`}
                      item={item}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-5 min-h-[230px] flex items-center justify-center">
                  <div className="text-neutral-500 text-lg font-bold">
                    [COLLECTION IS NOT AVAILABLE]
                  </div>
                </div>
              )}
              <div className="flex mt-5 items-center justify-end">
                <Link
                  prefetch={false}
                  href={`${BASE_URL}/blaze-outdoor-products`}
                  className="font-medium border px-[20px] py-[8px] rounded bg-neutral-800 text-white shadow-md text-lg cursor-pointer hover:bg-neutral-700 flex items-center gap-[10px]"
                >
                  Shop All Blaze Products
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:hidden">
          <SectionHeader text="Shop Blaze Products" />
          <div className="flex flex-col gap-[30px] mt-5">
            <div className=" w-full flex flex-wrap gap-5">
              <YmalCarousel breakpoints={items_per_break_point}>
                {items &&
                  items.map((item, idx) => (
                    <div
                      key={`product-cart-to-cart-item-${idx}`}
                      className="px-10"
                    >
                      <ProductCartToCart item={item} />
                    </div>
                  ))}
              </YmalCarousel>
            </div>
            <div className="flex justify-center">
              <Link
                prefetch={false}
                href={`${BASE_URL}/blaze-outdoor-products`}
                className="font-medium border px-[20px] py-[8px] rounded bg-neutral-800 text-white shadow-md text-lg cursor-pointer hover:bg-neutral-700 flex items-center gap-[10px]"
              >
                Shop All Blaze Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const ShopAllOpenBox = async () => {
  // Solana Home Open Box ID: 5
  const collection_id = 5;
  return (
    <div className="w-full mt-10">
      <div className="container mx-auto px-[10px] lg:px-[20px]">
        <SectionHeader text="Shop All Open Box" />
        <div className="mt-5">
          Save big on like-new items that have been opened, inspected, and
          approved for resale. Same great quality, just a better price.
        </div>
        <div className="mt-5">
          <CollectionCarouselWrap data={{ id: collection_id }} />
        </div>
      </div>
    </div>
  );
};
const OuterKitchenAndAccessories = () => {
  const items = [
    {
      image: "/images/feature/outdoor-kitchen-storage.webp",
      label: "Outdoor Kitchen Storage",
      url: "#",
    },
    {
      image: "/images/feature/side-burners.webp",
      label: "Side Burners",
      url: "#",
    },
    {
      image: "/images/feature/grill-covers.webp",
      label: "Grill Covers",
      url: "#",
    },
    {
      image: "/images/feature/grill-attachments.webp",
      label: "Grill Attachments",
      url: "#",
    },
    {
      image: "/images/feature/grill-tools-and-utensils.webp",
      label: "Grilling Tools & Utensils",
      url: "#",
    },
  ];

  return (
    <div className="w-full mt-10">
      <div className="container mx-auto px-[10px] lg:px-[20px]">
        <SectionHeader text="Outer Kitchen Products & Accessories" />
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {items &&
            items.map((item, index) => (
              <Link
                key={`extras-category-links-${index}`}
                prefetch={false}
                href={`${BASE_URL}/${item?.url}`}
              >
                <div className="shadow-lg py-5 px-3 text-center">
                  <div className="w-full aspect-w-4 aspect-h-5 relative bg-white">
                    {item?.image && (
                      <Image
                        src={item?.image}
                        title={item?.label}
                        alt={`${createSlug(item?.label)}-image`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    )}
                  </div>
                  <h4 className="font-semibold h-[48px] flex items-center justify-center">
                    {item?.label}
                  </h4>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

// MAIN COMPONENT
export default async function SolanaGrillsPage() {
  // const menu = await getMenu();

  // const pageData = flattenNav(menu).find(({ url }) => url === pathname);
  return (
    <>
      <MobileLoader />
      <Hero />
      <FeatureCategoriesSection items={feat_carousel_items} />
      <ShopAllClearanceSection contents={sac_contents} />
      <AboutProductSection data={about_content} />
      <ReviewsSection />
      <BestBBQBrands />
      <BlogsSection title={blogs_title} contents={blogs} />
      <ShopAllOpenBox />
      <OuterKitchenAndAccessories />
      <FAQsSection
        faqs={faqs}
        itemClassName="bg-stone-600 hover:bg-stone-500 text-white py-[10px] px-[20px] cursor-pointer flex justify-between font-medium"
      />
      <NewsLetterSection />
    </>
  );
}
