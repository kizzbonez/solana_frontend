import dynamic from "next/dynamic";

// Above the fold — load immediately
import Hero from "@/app/components/new-design/sections/Hero";
import Features from "@/app/components/new-design/sections/Features";
// Categories is above the fold on mobile and contains the LCP image — static import
// ensures Next.js emits <link rel="preload"> in <head> during SSR
import Categories from "@/app/components/new-design/sections/Categories";

// Below the fold — lazy loaded to reduce initial JS parse/execution
const Brands      = dynamic(() => import("@/app/components/new-design/sections/Brands"));
const Products    = dynamic(() => import("@/app/components/new-design/sections/Products"));
const WhySolana   = dynamic(() => import("@/app/components/new-design/sections/WhySolana"));
const Promo       = dynamic(() => import("@/app/components/new-design/sections/Promo"));
const Reviews     = dynamic(() => import("@/app/components/new-design/sections/Reviews"));
const Blog        = dynamic(() => import("@/app/components/new-design/sections/Blog"));
const Cta         = dynamic(() => import("@/app/components/new-design/sections/Cta"));
const NewsLetter  = dynamic(() => import("@/app/components/new-design/sections/NewsLetter"));
function HomePage({ heroBg, initialProducts }) {
  return (
    <div>
      <Hero background={heroBg} />
      <Features />
      <div className="hidden md:block"><Brands /></div>
      <Categories />
      <Products initialProducts={initialProducts} />
      <div className="hidden md:block"><WhySolana /></div>
      <div className="hidden md:block"><Promo /></div>
      <Reviews />
      <Blog />
      <Cta />
      <NewsLetter />
    </div>
  );
}

export default HomePage;
