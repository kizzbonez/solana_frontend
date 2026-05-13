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

  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://cdn.shopify.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com"
        />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
        {/* eslint-disable-next-line react/no-danger */}
        <style
          dangerouslySetInnerHTML={{ __html: themeCSS }}
          suppressHydrationWarning
        />
        {/* eslint-disable-next-line react/no-danger */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.$zoho=window.$zoho||{};$zoho.salesiq=$zoho.salesiq||{ready:function(){$zoho.salesiq.floatbutton.visible("hide");}};`,
          }}
        />
        <script
          id="zsiqscript"
          src={`https://salesiq.zohopublic.com/widget?wc=${process.env.NEXT_PUBLIC_ZOHO_SALESIQ_WIDGET_CODE}`}
          defer
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
