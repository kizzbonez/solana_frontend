import "@/app/globals.css";
import "@smastrom/react-rating/style.css";
import { redis, keys, redisGet } from "@/app/lib/redis";
import Link from "next/link";
import Image from "next/image";
import {
  Inter,
  Libre_Baskerville,
  Playfair_Display,
  Playfair,
  Playfair_Display_SC,
} from "next/font/google";
import Footer from "@/app/components/new-design/layout/Footer";
import { AuthProvider } from "@/app/context/auth";
import { CartProvider } from "@/app/context/cart";
import { GoogleReCaptchaProvider } from "@/app/context/recaptcha";
import { generateMetadata } from "@/app/metadata";
import { CartIcon } from "@/app/components/icons/lib";

import { BASE_URL } from "../lib/helpers";
const shopify = true; // if shopify product structure

const InterFont = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"], // Available weights: 400 (regular), 700 (bold)
  subsets: ["latin"],
  display: "swap",
  variable: "--font-libre-baskerville",
});

const playfair = Playfair({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-playfair",
});

const playfair_display = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair-display",
});

const playfair_display_sc = Playfair_Display_SC({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
  variable: "--font-playfair-display-sc",
});
// add playfair_display font
// add
export const metadata = await generateMetadata();

const Header = ({ logo }) => {
  return (
    <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href={BASE_URL} prefetch={false} className="flex-shrink-0">
          <div className="w-[130px] aspect-[191/94] relative">
            <Image
              src={logo || `/Logo.webp`}
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
        </Link>

        {/* Secure badge */}
        <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-stone-400 dark:text-stone-500 select-none">
          <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Secure Checkout
        </span>

        {/* Back to cart */}
        <Link
          href={`${BASE_URL}/cart`}
          prefetch={false}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-fire dark:hover:text-orange-400 transition-colors"
        >
          <CartIcon width="18" height="18" />
          <span className="hidden sm:inline">Cart</span>
        </Link>

      </div>
    </header>
  );
};

export default async function CheckoutLayout({ children }) {
  const redisLogoKey = keys.logo.value;
  const themeKey = keys.theme.value;
  const mgetKeys = [redisLogoKey, themeKey];
  const [redisLogo, color] = await redis.mget(mgetKeys);
  return (
    <html lang="en">
      <body
        className={`antialiased ${InterFont.className} ${libreBaskerville.variable} ${playfair.variable} ${playfair_display.variable} ${playfair_display_sc.variable} theme-${color}`}
      >
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
        >
          <AuthProvider>
            <CartProvider>
              <Header logo={redisLogo} />
              <div className="flex flex-col min-h-screen">{children}</div>
            </CartProvider>
          </AuthProvider>
        </GoogleReCaptchaProvider>
        <Footer />
      </body>
    </html>
  );
}
