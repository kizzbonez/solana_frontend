import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Hero from "@/app/components/brand/Hero"
import TopSelling from "@/app/components/brand/TopSelling"
import About from "@/app/components/brand/About"
import Extra from "@/app/components/brand/Extra"
import Sale from "@/app/components/brand/Sale"
import Reviews from "@/app/components/brand/Reviews"
import AtBrand from "@/app/components/brand/AtBrand"
import NewsLetter from "@/app/components/brand/NewsLetter"
async function GrandeurPage() {
  return (
    <main>
      <Hero />
      <TopSelling />
      <About />
      <Extra />
      <Sale />
      <Reviews label={"Our Happy Customers"}/>
      <AtBrand />
      <NewsLetter />
    </main>
  );
}

export default GrandeurPage;
