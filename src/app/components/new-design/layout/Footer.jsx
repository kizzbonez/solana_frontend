import { PAYMENT_METHODS } from "@/app/data/new-homepage";
import { STORE_NAME, STORE_FACEBOOK, STORE_PINTEREST } from "@/app/lib/store_constants";

import Link from "next/link";
import Image from "next/image";
import { createSlug } from "@/app/lib/helpers";

export const FOOTER_COLS = [
  {
    heading: "Products",
    links: [
      { name: "Fireplaces", url: "/fireplaces" },
      { name: "Patio Heaters", url: "/patio-heaters" },
      { name: "Built-In Grills", url: "/built-in-grills" },
      { name: "Freestanding Grills", url: "/freestanding-grills" },
      { name: "Outdoor Refrigeration", url: "/outdoor-refrigeration" },
      { name: "Outdoor Storage", url: "/outdoor-storage" },
    ],
  },
  {
    heading: "Customer Service",
    links: [
      { name: "Contact Us", url: "/contact" },
      { name: "Returns & Refunds", url: "/return-policy" },
      { name: "Shipping Policy", url: "/shipping-policy" },
      { name: "Privacy Policy", url: "/privacy-policy" },
      // { name: "FAQs", url: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { name: "About Solana", url: "/about" },
      { name: "Our Brands", url: "/brands" },
      { name: "Open Box", url: "/open-box" },
      {
        name: "Package Deals",
        url: "/package-deals",
      },
      {
        name: "Clearance Sale",
        url: "/clearance-sale",
      },
      { name: "Current Deals", url: "/brand/eloquence" },
      { name: "Contractor Program", url: "/professional-program" },
    ],
  },
];

const SOCIALS = [
  { label: "f", href: STORE_FACEBOOK },
  { label: "P", href: STORE_PINTEREST },
];

export default function Footer({ logo }) {
  return (
    <footer className="bg-charcoal dark:bg-black text-white/60 pt-16 pb-8">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Grid: 1 col mobile → 2 col tablet → 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-12">
          {/* Brand column */}
          <div>
            <a href="/" className="flex items-center gap-2 mb-4">
              {!logo && (
                <>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fire to-red-700 flex items-center justify-center text-lg">
                    🔥
                  </div>
                  <span className="font-serif font-bold text-xl text-white">
                    Solana Fireplaces
                  </span>
                </>
              )}
              {logo && (
                <div className="relative w-[130px] aspect-1 rounded-md">
                  {
                    <Image
                      // src={logo}
                      src="/solana-new-logo-orig-white.png"
                      alt={`${STORE_NAME} logo`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      priority={false} // Set to true if this is "above the fold"
                    />
                  }
                </div>
              )}
            </a>
            <p className="text-sm leading-relaxed mb-5">
              We specialize in creating exceptional indoor and outdoor living
              experiences through expertly curated heating and kitchen products.
            </p>
            <div className="flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="
                  w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center
                  text-white/50 font-serif font-bold text-sm
                  hover:bg-fire hover:text-white transition-all duration-200
                "
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="text-white text-sm font-semibold mb-4 tracking-wide">
                {heading}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((item, index) => (
                  <li key={`foot-link-${createSlug(heading)}-${index}`}>
                    <Link
                      href={item?.url || "#"}
                      className="text-xs hover:text-white transition-colors duration-150"
                    >
                      {item?.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="
          border-t border-white/8 pt-5
          flex flex-col sm:flex-row items-center justify-between gap-4
          text-xs
        "
        >
          <p>
            © {new Date().getFullYear()} Solana Fireplaces. All rights reserved.
          </p>
          <div className="text-center sm:text-right">
            <p className="text-white/30 text-[11px] mb-1.5">We Accept:</p>
            <div className="flex gap-1.5 flex-wrap justify-center sm:justify-end">
              {PAYMENT_METHODS.map((m) => (
                <span
                  key={m}
                  className="bg-white/10 rounded px-2 py-1 text-[11px] text-white/45"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
