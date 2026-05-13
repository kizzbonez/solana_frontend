import { unstable_cache } from "next/cache";

import HeroBackground from "@/app/components/new-design/sections/HeroBackground";
import NewHomePage from "@/app/components/new-design/page/HomePage";
import { getCollectionProducts } from "@/app/lib/fn_server";

// Cache the full rendered page at Vercel's CDN edge for 24h (ISR).
// TTFB drops to ~50ms globally instead of hitting the origin server.
// revalidateTag("home-products") from /api/revalidate-all also busts this.
export const revalidate = 86400;

const getCachedCollectionProducts = unstable_cache(
  (id) => getCollectionProducts(id),
  ["home-collection-products"],
  { revalidate: 86400, tags: ["home-products"] },
);

export default async function HomePage() {
  const initialProducts = await getCachedCollectionProducts(137);
  return <NewHomePage heroBg={<HeroBackground />} initialProducts={initialProducts} />;
}
