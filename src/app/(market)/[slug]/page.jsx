import { notFound } from "next/navigation";
import { keys, redis } from "@/app/lib/redis";
import { getPageData, BASE_URL } from "@/app/lib/helpers";
import TuiHero from "@/app/components/template/tui_hero";
import ProductsSection from "@/app/components/section/Products";
import FeatureCategoriesSection from "@/app/components/section/HomePageFeatureCategories";
import ShopifyProductsSection from "@/app/components/molecule/ProductsSection";
import MobileLoader from "@/app/components/molecule/MobileLoader";
import Faq from "@/app/components/molecule/Faq";
import Reviews from "@/app/components/molecule/Reviews";
import CategoriesCarousel from "@/app/components/molecule/CategoriesCarousel";
import HeroNotice from "@/app/components/atom/HeroNotice";
import NewsLetter from "@/app/components/section/NewsLetter";
import CollectionCarouselWrap from "@/app/components/atom/CollectionCarouselWrap";
import BaseNavPage from "@/app/components/template/BaseNavItemPage";
import Image from "next/image";
import { STORE_NAME } from "@/app/lib/store_constants";

const isShopify = true;

const feat_carousel_items = [
  {
    label: "Fireplaces",
    img: "/images/feature/Firepit.webp",
    url: `${BASE_URL}/fireplaces`,
  },
  {
    label: "Patio Heaters",
    img: "/images/feature/patio-heaters-1.webp",
    url: `${BASE_URL}/patio-heaters`,
  },
  {
    label: "Built-In Grills",
    img: "/images/feature/Built-in Grill 2.webp",
    url: `${BASE_URL}/built-in-grills`,
  },
  {
    label: "Freestanding Grills",
    img: "/images/feature/Freestanding Grill 2.webp",
    url: `${BASE_URL}/freestanding-grills`,
  },
  {
    label: "Open Box",
    img: "/images/feature/open-box.webp",
    url: `${BASE_URL}/open-box`,
  },
  {
    label: "Current Deals",
    img: "/images/home/categories/clearance.webp",
    url: `${BASE_URL}/brand/eloquence`,
  },
];

// const defaultMenuKey = keys.default_shopify_menu.value;
const defaultMenuKey = keys.dev_shopify_menu.value; // dev-menu-object

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

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const menuData = await redis.get(defaultMenuKey);
  const flatData = flattenNav(menuData);
  const pageData = getPageData(slug, flatData);

  if (!pageData) return {};

  return {
    title:
      pageData.meta_title || pageData.name || `${STORE_NAME} | Stylish Indoor & Outdoor Heating`,
    description:
      pageData.meta_description ||
      `Transform your home with ${STORE_NAME}! Add warmth and style with our wood, gas, and electric designs. Shop now and create your perfect space!`,
  };
}

const Hero = ({ data }) => {
  const useBanner = data?.banner?.img?.src;
  if (!useBanner) return;

  return (
    <div className={`w-full mx-auto flex flex-col md:flex-row`}>
      <div className={`w-full md:w-full relative overflow-hidden`}>
        <div className="w-full relative isolate px-6 lg:px-8 bg-no-repeat bg-center bg-cover aspect-[414/77]">
          {
            <Image
              src={useBanner}
              alt={"Banner"}
              className="w-full h-full object-contain"
              fill
              loading="eager"
              priority={true}
              quality={100}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px"
            />
          }
        </div>
      </div>
    </div>
  );
};

export default async function GenericCategoryPage({ params }) {
  const { slug } = await params;
  const menuData = await redis.get(defaultMenuKey);
  const flatData = flattenNav(
    menuData.map((i) => ({
      ...i,
      is_base_nav: !["On Sale", "New Arrivals"].includes(i?.name),
    }))
  );
  const pageData = getPageData(slug, flatData);

  if (!pageData) return notFound();

  if (pageData?.is_base_nav) return <BaseNavPage page_details={pageData} />;

  return (
    <div>
      <MobileLoader isLoading={!pageData} />
      <HeroNotice data={pageData} />
      <Hero data={pageData} />
      {/* <TuiHero data={pageData} /> */}
      <div className="px-1 md:px-[20px]">
        {isShopify ? (
          <ShopifyProductsSection category={slug} />
        ) : (
          <ProductsSection category={slug} />
        )}

        {pageData?.collections &&
          Array.isArray(pageData.collections) &&
          pageData.collections.length > 0 && (
            <div className="container mx-auto flex flex-col gap-[50px]">
              {pageData.collections.map((collection) => (
                <CollectionCarouselWrap
                  key={`collection-carousel-${collection?.mb_uid}`}
                  data={collection}
                />
              ))}
            </div>
          )}

        <Reviews />
        {/* <CategoriesCarousel /> */}

        <FeatureCategoriesSection items={feat_carousel_items} />

        {pageData?.faqs &&
          pageData?.faqs?.visible &&
          pageData?.faqs?.data &&
          Array.isArray(pageData.faqs.data) &&
          pageData.faqs.data.length > 0 && <Faq data={pageData.faqs.data} />}

        <NewsLetter />
      </div>
    </div>
  );
}
