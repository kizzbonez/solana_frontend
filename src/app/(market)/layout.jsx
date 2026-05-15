import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import "@/app/globals.css";
import { THEME_COLORS } from "@/app/data/theme-colors";
import { redis, keys } from "@/app/lib/redis";
import { Inter, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/app/context/auth";
import { CartProvider } from "@/app/context/cart";
import { QuickViewProvider } from "@/app/context/quickview";
import { SearchProvider } from "@/app/context/search";
import { CategoriesProvider } from "@/app/context/category";
import { CompareProductsProvider } from "@/app/context/compare_product";
import { generateMetadata } from "@/app/metadata";
import SessionWrapper from "@/app/components/wrapper/SessionWrapper";
import ConditionalZohoButton from "@/app/components/widget/ConditionalZohoButton";
import LazyZohoLoader from "@/app/components/widget/LazyZohoLoader";
import { fetchUniqueCategories } from "@/app/lib/fn_server";
import { notFound } from "next/navigation";
import Topbar from "@/app/components/new-design/layout/Topbar";
import Navbar from "@/app/components/new-design/layout/Navbar";
import Footer from "@/app/components/new-design/layout/Footer";

const InterFont = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  // "optional" tells the browser: paint with whatever font is ready right now,
  // never swap later. This collapses LCP and FCP to the same moment (~1.4 s)
  // instead of waiting for the web font swap (was causing LCP at 3.9 s).
  // Repeat visitors still see Playfair Display because next/font preloads it.
  display: "optional",
  variable: "--font-playfair-display",
});

export const metadata = await generateMetadata();

// Both cached for 24h under the "layout-data" tag.
// Bust via GET /api/revalidate-all?secret=... after updating menu, logo, theme, or categories.
const getInitData = unstable_cache(
  async () => {
    const mgetKeys = [keys.dev_shopify_menu.value, keys.logo.value, keys.theme.value];
    return await redis.mget(mgetKeys);
  },
  ["layout-init-data"],
  { revalidate: 86400, tags: ["layout-data"] },
);

const getCachedCategories = unstable_cache(
  () => fetchUniqueCategories(),
  ["layout-categories"],
  { revalidate: 86400, tags: ["layout-data"] },
);

export default async function MarketLayout({ children }) {
  const [initData, categories] = await Promise.all([
    getInitData(),
    getCachedCategories(),
  ]);

  if (!initData) {
    return notFound();
  }

  const [menu, redisLogo, color] = initData;

  const activeTheme = THEME_COLORS[color] ?? THEME_COLORS.orange;
  const themeCSS = `:root{${Object.entries(activeTheme)
    .map(([k, v]) => `--theme-primary-${k}:${v}`)
    .join(";")}}`;

  const formattedMenuItems =
    menu?.map((i) => ({
      ...i,
      is_base_nav: !["On Sale", "New Arrivals"].includes(i?.name),
    })) || [];

  // Preload the first 4 category cards — they're all visible above-the-fold on mobile
  // (INITIAL_COUNT = 4 in Categories.jsx). Preloading them in the server-rendered <head>
  // lets the browser fetch in parallel with JS parsing, eliminating the "late-discovered
  // image" PageSpeed audit. Index 0 is the LCP candidate → fetchPriority="high".
  const initialCats = (categories || []).slice(0, 4);

  return (
    <html lang="en">
      <head>
        {/* dns-prefetch is cheap (DNS only, no TCP/TLS).
            preconnect is intentionally omitted here — Next.js already adds 2
            for Google Fonts, and adding more pushes past the browser's 4-connection
            warning. Pages that need fast CDN image loading add their own preconnect. */}
        <link
          rel="dns-prefetch"
          href="https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com"
        />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
        {initialCats.map((cat, i) => {
          const base = `/_next/image?url=%2Fimages%2Fcategories%2F${cat.slug}.webp&q=40`;
          return (
            <link
              key={cat.slug}
              rel="preload"
              as="image"
              href={`${base}&w=512`}
              imageSrcSet={`${base}&w=375 375w, ${base}&w=512 512w, ${base}&w=640 640w, ${base}&w=750 750w`}
              imageSizes="(max-width: 1024px) calc(50vw - 2rem), calc(33vw - 2rem)"
              fetchPriority={i === 0 ? "high" : undefined}
            />
          );
        })}
        {/* eslint-disable-next-line react/no-danger */}
        <style
          dangerouslySetInnerHTML={{ __html: themeCSS }}
          suppressHydrationWarning
        />
      </head>
      <body
        className={`antialiased ${InterFont.variable} ${playfairDisplay.variable}`}
      >
        <AuthProvider>
          <CategoriesProvider
            menu_items={formattedMenuItems}
            categories={categories}
          >
            <CartProvider>
              <CompareProductsProvider>
                <Suspense fallback={null}>
                  <SearchProvider>
                    <SessionWrapper>
                      <QuickViewProvider>
                        <Topbar />
                        <Navbar logo={redisLogo} />
                        <main className="flex flex-col min-h-svh">
                          {children}
                        </main>
                        <Footer logo={redisLogo} />
                        <ConditionalZohoButton />
                        <LazyZohoLoader />
                      </QuickViewProvider>
                    </SessionWrapper>
                  </SearchProvider>
                </Suspense>
              </CompareProductsProvider>
            </CartProvider>
          </CategoriesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
