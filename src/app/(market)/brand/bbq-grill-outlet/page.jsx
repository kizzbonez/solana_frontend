import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
import CollectionCarousel from "@/app/components/atom/CollectionCarousel";
// HELPERS
import { keys, redis } from "@/app/lib/redis";
import { BASE_URL, createSlug } from "@/app/lib/helpers";
// CONSTANTS
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
      src: "/images/home/bbq-grill-outlet-blog-section-1-1.webp",
      alt: "Premium Scratch and Dent Grills at Discount Prices Image",
    },
    title: "Premium Scratch and Dent Grills at Discount Prices",
    content:
      "Slight imperfections, same great grilling power. These top-brand grills cost way less. Perfect if you want serious performance without the premium price tag.",
    button: {
      label: "shop all open box",
      url: `${BASE_URL}/shop-all-open-box`,
      className:
        "bg-[#E53237] w-[257px] h-[58px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] text-[18px] tracking-[0.54px] leading-[115%] font-[700] text-[#FFF]",
    },
  },
  {
    image: {
      src: "/images/home/bbq-grill-outlet-blog-section-1-2.webp",
      alt: "Outdoor Kitchen Package Deals Image",
    },
    title: "Outdoor Kitchen Package Deals",
    content:
      "Our outdoor kitchen package deals make it easy to create your dream backyard setup. With a grill, storage, and stylish extras included, you’ll spend less time planning and more time enjoying.",
    button: {
      label: "shop all package deals",
      url: `#`,
      className:
        "bg-[#E53237] w-[257px] h-[58px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] text-[18px] tracking-[0.54px] leading-[115%] font-[700] text-[#FFF]",
    },
  },
];
const about_content = {
  image: "/images/home/about-bbq-grill-outlet.webp",
  imageWrap: {
    className: "relative aspect-1 w-[300px]",
  },
  contact: "888-667-4986",
  content: {
    title: "About BBQ Grill Outlet",
    par: [
      "At BBQ Grill Outlet, we believe everyone deserves to enjoy outdoor cooking without the high price tag. That’s why we offer high-quality grills, outdoor kitchen packages, and accessories at prices that make sense for your budget.",
      "We carefully select every product in our lineup to deliver real value where it matters most: long-lasting use, reliable heat, and smart features that make grilling easy. From scratch and dent deals to complete outdoor kitchen packages, our goal is to help you create the perfect setup without overspending.",
    ],
  },
  button: {
    className:
      "font-medium border px-[20px] py-[8px] rounded bg-neutral-800 text-white shadow-md text-lg cursor-pointer hover:bg-neutral-700 flex items-center gap-[10px]",
  },
};
const blogs_title = "Your Trusted Backyard BBQ Resource";
const blogs = [
  {
    title: "Find Your Perfect Grill",
    url: "https://bbqgrilloutlet.com/blog/natural-gas-grill-buying-guide",
    img: "/images/home/blogs/find-your-perfect-grill.webp",
    // tag: "Buying Guide",
    // tag_bg: "bg-green-600",
    content:
      "Our natural gas grill buying guide is your go-to resource for upgrading your outdoor cooking setup. Enjoy hassle-free grilling with a steady fuel supply—no more propane refills!",
  },
  {
    title: "Key Outdoor Kitchen Appliances for BBQ Mastery",
    url: "https://bbqgrilloutlet.com/blog/key-outdoor-kitchen-appliances-for-bbq-mastery/",
    img: "/images/home/blogs/key-outdoor-kitchen-appliances-for-bbq-mastery.webp",
    // tag: "Buying Guide",
    // tag_bg: "bg-green-600",
    content:
      "In this guide, we'll take you through the must-have equipment to turn your outdoor BBQ kitchen into a dream setup that’s both practical and packed with style!",
  },
  {
    title: "Proven Tips to Extend Your Grill’s Lifespan",
    url: "https://bbqgrilloutlet.com/blog/gas-grill-maintenance-proven-tips-to-extend-your-grills-lifespan-/",
    img: "/images/home/blogs/proven-tips-to-extend-your-grills-lifespan.webp",
    // tag: "Tips & Tricks",
    // tag_bg: "bg-rose-600",
    content: `In this guide, we'll cover essential 
maintenance practices, including cleaning routines, proper storage, and troubleshooting common problems, so you can enjoy perfectly grilled meals for years to come`,
  },
];
const faqs = [
  {
    id: "Q1",
    is_open: false,
    question: "What is the best brand of barbecue grill?",
    answer:
      "The best barbecue grill brand depends on your cooking needs, fuel preference, and budget. Look for grills with durable materials, even heat distribution, strong warranties, and easy-to-use features. Choose a grill that fits your lifestyle, cooking habits, and outdoor space for the best experience.",
  },
  {
    id: "Q2",
    is_open: false,
    question: "What is a BBQ grill called?",
    answer:
      "A BBQ grill is commonly called a grill or barbecue, and it refers to a cooking device used for grilling food outdoors over direct heat. Depending on the fuel type, it may also be called a gas grill, charcoal grill, pellet grill, or electric grill.",
  },
  {
    id: "Q3",
    is_open: false,
    question: "What is the healthiest grill to use?",
    answer:
      "Infrared and electric grills are often considered the healthiest because they produce less smoke and fewer harmful compounds. Grills with easy-to-clean surfaces and proper fat drainage also help reduce flare-ups and excess grease, making meals healthier and cleaner to prepare.",
  },
  {
    id: "Q4",
    is_open: false,
    question: "What are the three types of grills?",
    answer:
      "The three main types of grills are gas grills, which offer convenience and quick heating, charcoal grills, known for rich, smoky flavor, and electric grills, ideal for small spaces and indoor use. Each type suits different cooking styles, preferences, and outdoor setups.",
  },
  {
    id: "Q5",
    is_open: false,
    question: "What kind of grill lasts the longest?",
    answer:
      "Grills made from high-quality stainless steel or cast iron tend to last the longest. With proper care, these grills resist rust, retain heat well, and offer long-term durability. Regular maintenance, cleaning, and protective covers also extend a grill's lifespan.",
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
  const useBanner = "/images/banner/bbq-grill-outlet-banner.webp";
  return (
    <div className={`w-full mx-auto flex flex-col md:flex-row`}>
      <div className={`w-full md:w-full relative overflow-hidden`}>
        <div className="w-full relative isolate px-6 lg:px-8 bg-no-repeat bg-center bg-cover h-[250px] md:h-[calc(100vh-450px)] md:max-h-[550px]">
          {
            <Image
              src={useBanner}
              alt={"Banner"}
              className="w-full h-full object-cover"
              fill
              loading="eager"
              priority={true}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px"
            />
          }
          <div
            className="bg-[#292929] absolute left-0 w-[50%] top-0 h-full flex items-center"
            style={{
              clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)",
            }}
          >
            <div className="w-full flex justify-end">
              <div className="mr-[100px] max-w-[680px]">
                <div className="flex flex-col gap-[25px]">
                  <div>
                    <h1 className="text-white text-shadow-[0_4px_4px_rgba(0,0,0,0.25)] text-[54px] leading-[54px]">
                      Where Great Food Meets Great Company
                    </h1>
                  </div>
                  <div>
                    <p className="text-[28px] leading-[32.2px] text-white font-[300] tracking-[0.84px]">
                      Quality grills and tools designed to turn every gathering
                      into a celebration.
                    </p>
                  </div>
                  <div>
                    <button className="bg-[#FFF] text-[#4D4D4D] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] w-[257px] h-[58px] text-[22px] font-[800] leading-[100%] tracking-[-0.22px]">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShopAllGrills = async () => {
  const getOpenBoxProducts = async () => {
    const collection_id = 6; // collection id 6 is a collection made for this only purpose
    const res = await fetch(
      `${BASE_URL}/api/collections/collection-products/${collection_id}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return false;
      throw new Error(`Failed to fetch collection ${id}`);
    }

    return res.json();
  };

  const max_product_display = 5;

  const bbb_menu = [
    {
      name: "Gas Grills and Smokers",
      url: "#",
      child: [
        { name: "Built-In Gas Grills", url: "#" },
        { name: "Freestanding Gas Grills", url: "#" },
        { name: "Portable Gas Grills", url: "#" },
        { name: "Post Mount Gas Grills", url: "#" },
      ],
    },
    {
      name: "Outdoor Kitchen",
      url: "#",
      child: [
        { name: "Outdoor Storage", url: "#" },
        { name: "Outdoor Refrigeration", url: "#" },
        { name: "Side Burners", url: "#" },
      ],
    },
    {
      name: "Accessories",
      url: "#",
    },
    {
      name: "Brands",
      url: "#",
    },
    {
      name: "On Sale",
      url: "#",
      child: [
        { name: "Open Box", url: "#" },
        { name: "Clearance", url: "#" },
        { name: "Package Deals", url: "#" },
      ],
    },
  ];

  const items_per_break_point = [
    { minWidth: 0, value: 1 },
    { minWidth: 640, value: 2 },
    { minWidth: 768, value: 3 },
    { minWidth: 1280, value: 4 },
  ];

  const items = await getOpenBoxProducts();

  return (
    <div className="w-full mt-10">
      <div className="container mx-auto px-[10px] lg:px-[20px]">
        <div className="hidden lg:block">
          <SectionHeader text="Shop All Grills" />
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
                Gas Grills and Smokers
              </div>
              {items && Array.isArray(items) && items?.length > 0 ? (
                <div className="flex gap-[30px] mt-5 min-h-[230px]">
                  {items.slice(0, max_product_display).map((item, idx) => (
                    <ProductCartToCart
                      key={`product-cart-to-cart-item-${idx}`}
                      item={item}
                    />
                  ))}
                </div>
              ):(<div className="mt-5 min-h-[230px] flex items-center justify-center">
                <div className="text-neutral-500 text-lg font-bold">
                  [COLLECTION IS NOT AVAILABLE]
                </div>
              </div>)}
              <div className="flex mt-5 items-center justify-end">
                <Link
                  prefetch={false}
                  href={`${BASE_URL}/shop-all-open-box`}
                  className="flex items-center justify-center bg-[#E53237] w-[257px] h-[58px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] text-[18px] tracking-[0.54px] leading-[115%] font-[700] text-[#FFF]"
                >
                  shop all products
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:hidden">
          <SectionHeader text="Shop All Grills" />
          <div className="flex flex-col gap-[30px] mt-5">
            {items && Array.isArray(items) && items?.length > 0 ? (
              <div className=" w-full flex flex-wrap gap-5">
                <YmalCarousel breakpoints={items_per_break_point}>
                  {items.map((item, idx) => (
                    <div
                      key={`product-cart-to-cart-item-${idx}`}
                      className="px-10"
                    >
                      <ProductCartToCart item={item} />
                    </div>
                  ))}
                </YmalCarousel>
              </div>
            ) : (
              <div className="mt-5 min-h-[230px] flex items-center justify-center">
                <div className="text-neutral-500 text-lg font-bold">
                  [COLLECTION IS NOT AVAILABLE]
                </div>
              </div>
            )}
            <div className="flex justify-center">
              <Link
                prefetch={false}
                href={`${BASE_URL}/shop-all-open-box`}
                className="flex items-center justify-center bg-[#E53237] w-[257px] h-[58px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] text-[18px] tracking-[0.54px] leading-[115%] font-[700] text-[#FFF]"
              >
                shop all products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShopAllOpenBox = async () => {
  // Shop Open Box ID: 6
  const collection_id = 6;
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
        <div className="mt-5 flex items-center justify-center">
          <Link
            prefetch={false}
            href={`${BASE_URL}/shop-all-open-box`}
            className="flex items-center justify-center bg-[#E53237] w-[257px] h-[58px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] text-[18px] tracking-[0.54px] leading-[115%] font-[700] text-[#FFF]"
          >
            shop all products
          </Link>
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
const TopBrandsCarousel = () => {
  const brands = [
    {
      name: "Blaze Outdoor Products",
      image: "/images/feature/blaze-outdoor-products-logo.webp",
      url: `${BASE_URL}/blaze-outdoor-products`,
    },
    {
      name: "American Outdoor Grill",
      image: "/images/feature/aog-logo.webp",
      url: `${BASE_URL}/aog`,
    },
    {
      name: "Bull Outdoor Products",
      image: "/images/feature/bull-outdoor-products-logo.webp",
      url: `${BASE_URL}/bull-outdoor-products`,
    },
    {
      name: "Delta Heat",
      image: "/images/feature/delta-heat-logo.webp",
      url: `${BASE_URL}/delta-heat`,
    },
    {
      name: "Broilmaster",
      image: "/images/feature/broilmaster-logo.webp",
      url: `${BASE_URL}/broilmaster`,
    },
    {
      name: "Bonfire",
      image: "/images/feature/bonefire-logo.webp",
      url: `${BASE_URL}/bonfire`,
    },
  ];

  const items_per_break_point = [
    { minWidth: 0, value: 3 },
    { minWidth: 640, value: 4 },
    { minWidth: 768, value: 5 },
    { minWidth: 1280, value: 6 },
    { minWidth: 1550, value: 8 },
  ];

  return (
    <div className="container mx-auto my-[50px]">
      <h2 className="text-xl md:text-4xl text-[30px] font-normal underline italic font-libre">
        Our Top Brands
      </h2>
      <CollectionCarousel
        breakpoints={items_per_break_point}
        settings={{ autoplay: true, dots: true }}
      >
        {brands &&
          Array.isArray(brands) &&
          brands.map((brand) => (
            <Link
              prefetch={false}
              href={brand?.url || "#"}
              key={`brand-${createSlug(brand?.name)}`}
              className="relative aspect-1 flex items-center"
            >
              {brand?.image && (
                <Image
                  src={brand?.image}
                  title={brand?.name}
                  alt={`${createSlug(brand?.name)}-image`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              )}
            </Link>
          ))}
      </CollectionCarousel>
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
      <div className="my-10">
        <FeatureCategoriesSection items={feat_carousel_items} />
      </div>
      <ShopAllClearanceSection contents={sac_contents} />
      <div className="bg-[#292929]">
        <AboutProductSection
          data={about_content}
          textColor="text-[#FFF]"
          bgColor="bg-[transparent]"
        >
          <a href={`tel:(888) 667-4986`}>
            <button
              className={
                "font-bold bg-[#E53237] text-white py-[4px] px-[10px] md:py-[7px] md:px-[25px] rounded-[15px] flex items-center gap-[5px] md:gap-[10px]"
              }
            >
              <div className="text-sm md:text-base">Call Now 888-667-4986</div>
            </button>
          </a>
        </AboutProductSection>
      </div>
      <ReviewsSection />
      <ShopAllGrills />
      <TopBrandsCarousel />
      <BlogsSection
        title={blogs_title}
        contents={blogs}
        imageAspect={`aspect-[16:9]`}
      />
      <ShopAllOpenBox />
      <OuterKitchenAndAccessories />
      <FAQsSection
        faqs={faqs}
        itemClassName="bg-[#292929] text-white py-[10px] px-[20px] cursor-pointer flex justify-between font-medium"
      />
      <NewsLetterSection />
    </>
  );
}
