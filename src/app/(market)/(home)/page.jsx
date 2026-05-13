import { unstable_cache } from "next/cache";

import HeroBackground from "@/app/components/new-design/sections/HeroBackground";
import NewHomePage from "@/app/components/new-design/page/HomePage";
import { getCollectionProducts } from "@/app/lib/fn_server";

const getCachedCollectionProducts = unstable_cache(
  (id) => getCollectionProducts(id),
  ["home-collection-products"],
  { revalidate: 86400, tags: ["home-products"] },
);

export default async function HomePage() {
  const initialProducts = await getCachedCollectionProducts(137);
  return <NewHomePage heroBg={<HeroBackground />} initialProducts={initialProducts} />;
}
