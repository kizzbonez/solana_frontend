import Link from "next/link";
import Image from "next/image";

import { BASE_URL } from "@/app/lib/helpers";
import { STORE_CONTACT } from "@/app/lib/store_constants";

const STATS = [
  { num: "6K+", label: "Products" },
  { num: "4.4★", label: "122 Reviews" },
  { num: "20+", label: "Brands" },
];
const TRUST = [
  "Free Shipping Available",
  "Expert Consultations",
  "Contractor Pricing",
];
const CARDS = [
  {
    image: "/images/banner/home-gas-fireplace.webp",
    url: "/gas-fireplaces",
    title: "Gas Fireplaces",
    sub: "Instant Warmth & Modern Ambiance",
  },
  {
    image: "/images/banner/home-built-in-grills.webp",
    url: "/built-in-grills",
    title: "Built-In Grills",
    sub: "Elevate Your Outdoor Kitchen Luxury",
  },
];

// CTA OPTIONS — delete the two you don't want, then remove this comment block
// Option A: "Call Now & Start Saving →"
// Option B: "Call. Tell Us Your Budget. Save. →"
// Option C: "Tell Us What You Need →"

function TopbarRow({ cta, label }) {
  return (
    <div className="bg-charcoal dark:bg-black py-2.5 text-[11px] border-b border-white/5 last:border-0">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="hidden md:flex items-center justify-between">
          <h2 className="font-normal tracking-wide text-xs">
            <span className="text-white font-semibold uppercase tracking-[.1em] italic">
              ✦ Name Your Price
            </span>
            <span className="text-neutral-400 mx-3">—</span>
            <span className="text-white/50">Lowest Prices Guaranteed</span>
          </h2>

          <Link
            href={`tel:${STORE_CONTACT}`}
            className="text-fire hover:text-fire-light transition-colors duration-150 tracking-wide hover:underline"
          >
            {cta}
          </Link>
        </div>

        <h2 className="md:hidden text-center font-normal">
          <span className="text-white font-semibold uppercase tracking-[.1em] text-[10px]">
            ✦ Name Your Price
          </span>
          <span className="text-white/20 mx-2.5">—</span>
          <span className="text-white/50">Lowest Prices Guaranteed</span>
        </h2>
      </div>
    </div>
  );
}


export default function Hero({ background }) {
  return (
    <section className="relative min-h-[85vh] md:min-h-[92vh] flex items-center overflow-hidden">
      <div className="absolute top-0 left-0 bg-white z-10 w-full">
        <TopbarRow label="A:" cta="Call Now & Start Saving →" />
      </div>
      {/* Fallback gradient — visible while image loads or if it fails */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0600] via-[#3d1208] to-[#0d0300]" />
      {background}
      {/* Mobile: uniform dark overlay — Desktop: directional so right side is lighter for cards */}
      <div className="absolute inset-0 bg-black/75 md:bg-gradient-to-r md:from-black/90 md:via-black/70 md:to-black/30" />

      <div className="relative z-10 max-w-[1240px] mx-auto px-6 sm:px-6 w-full">
        <div className="grid gap-14 items-center py-16 md:py-20 grid-cols-1 md:grid-cols-2">
          {/* ── Copy — centered on mobile, left-aligned on desktop ── */}
          <div className="text-center md:text-left">
            <p className="text-[11px] tracking-[.15em] uppercase font-semibold text-fire-light mb-3">
              Premium Outdoor Solutions
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.8rem] text-white leading-[1.15] mb-5">
              Your Dream
              <br />
              Kitchen <em className="not-italic text-fire-light">One</em>
              <br />
              Call Away
            </h1>
            <p className="text-white/70 text-base lg:text-lg max-w-md mb-9 leading-relaxed mx-auto md:mx-0">
              From stunning gas fireplaces to all-weather outdoor kitchens — we
              bring warmth, beauty, and craftsmanship to every space.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-10">
              <Link
                href={`${BASE_URL}/fireplaces`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-fire hover:bg-fire-light text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-fire/30"
              >
                Shop All Products
              </Link>
              <Link
                href={`tel:${STORE_CONTACT}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border-2 border-white/60 text-white hover:bg-white/10 font-semibold transition-all duration-200"
              >
                Get Expert Advice
              </Link>
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start gap-8 mb-5">
              {STATS.map(({ num, label }) => (
                <div key={label}>
                  <div className="font-serif text-3xl font-bold text-white">
                    {num}
                  </div>
                  <div className="text-[11px] tracking-widest uppercase text-white/40 mt-0.5">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              {TRUST.map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-1.5 text-white/55 text-xs before:content-['✓'] before:text-fire-light before:font-bold"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Feature Cards — hidden on mobile ── */}
          <div className="hidden md:flex flex-col gap-3 hero-cards-reveal">
            {CARDS.map(({ image, url, title, sub }, index) => (
              <Link
                key={title}
                href={url}
                className="
                rounded-2xl overflow-hidden
                bg-white/7 backdrop-blur-md
                border border-white/10
                shadow-[0_8px_32px_rgba(0,0,0,.3)]
                hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,.4)]
                transition-all duration-300 group
              "
              >
                <div className="h-40 bg-white relative overflow-hidden">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-[15px] font-semibold">
                      {title}
                    </h3>
                    <p className="text-white/50 text-xs mt-0.5">{sub}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-fire flex items-center justify-center text-white text-sm group-hover:bg-fire-light transition-colors">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
