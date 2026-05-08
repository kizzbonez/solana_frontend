import Link from "next/link";
import { BASE_URL } from "@/app/lib/helpers";
import { STORE_NAME2, STORE_CONTACT } from "@/app/lib/store_constants";

import Breadcrumb from "@/app/components/new-design/utility/Breadcrumb";
import PageHero from "@/app/components/new-design/utility/PageHero";
import InfoCard from "@/app/components/new-design/utility/InfoCard";
import SectionLabel from "@/app/components/new-design/utility/SectionLabel";
import Divider from "@/app/components/new-design/utility/Divider";

const stats = [
  { n: "20+", label: "Years in Business" },
  { n: "5K+", label: "Happy Customers" },
  { n: "40+", label: "Brand Partners" },
  { n: "98%", label: "Satisfaction Rate" },
];

const values = [
  { icon: "🔥", title: "Passion for Fire",   desc: "We believe every home deserves the warmth and beauty of a world-class fireplace. It's not just a product — it's an experience." },
  { icon: "🏆", title: "Expert Knowledge",   desc: "Our team of certified specialists has decades of combined experience across gas, electric, and wood-burning systems." },
  { icon: "🤝", title: "Customer First",     desc: "From first click to final install, we're your partner. Found it cheaper? We'll match it. Not satisfied? We'll make it right." },
  { icon: "🌿", title: "Sustainability",     desc: "We actively source and promote energy-efficient products and partner with brands committed to reducing environmental impact." },
  { icon: "⚡", title: "Fast & Reliable",    desc: "Same-day shipping on in-stock items, white-glove delivery options, and real-time order tracking from warehouse to door." },
  { icon: "🛡️", title: "Trusted Quality",   desc: "Every product we carry is vetted by our team. If we wouldn't put it in our own homes, it doesn't make our shelves." },
];

const team = [
  { name: "Marcus Rivera", role: "Founder & CEO",      initials: "MR", color: "#E85D26" },
  { name: "Sandra Lee",    role: "Head of Product",    initials: "SL", color: "#1d4ed8" },
  { name: "Derek Okafor",  role: "Lead Specialist",    initials: "DO", color: "#16a34a" },
  { name: "Priya Nair",    role: "Customer Success",   initials: "PN", color: "#7c3aed" },
];

const brands = [
  "Napoleon", "Dimplex", "Blaze Outdoor", "Eloquence",
  "Gradeur", "Bromic", "Twin Eagles", "Bull Outdoor",
];

export default function About() {
  return (
    <div className="max-w-[1240] mx-auto px-4 sm:px-6 py-10">
      <Breadcrumb items={["Home", "About Us"]} />
      <PageHero
        eyebrow="Our Story"
        title="America's Fireplace Specialists"
        subtitle={`At ${STORE_NAME2}, we are focused on providing the best prices on the largest selection of fireplaces and outdoor products. We've been selling fireplaces and accessories for over 20 years, striving to be the most trusted source for all home heating needs.`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center hover:border-orange-300 dark:hover:border-orange-800 transition-colors"
          >
            <p className="text-3xl font-bold mb-1 text-theme-600">{s.n}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14 items-center">
        <div>
          <SectionLabel>Our Mission</SectionLabel>
          <h2
            className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4"
            style={{ fontFamily: "Georgia,serif" }}
          >
            Bringing warmth to every home, one fireplace at a time.
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            At{" "}
            <Link prefetch={false} href={`${BASE_URL}`} className="text-theme-600 font-bold underline">
              {STORE_NAME2}
            </Link>
            , we are focused on providing the best prices on the largest selection of
            fireplaces and outdoor products. We&apos;ve been selling fireplaces and
            accessories for over 20 years and strive to become the most trusted source
            for all home heating needs.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            Not only do we provide the most complete collection of high-quality fireplaces
            and heating products, but our customer service is the best in the business. Our
            specialists guide customers throughout their shopping experience to ensure they
            get the fireplace that best suits their needs — and even after installation, our
            door is always open for questions about features, setup, or making the most of
            your space.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Licensed & Insured", "Price Match Guarantee", "Free Expert Advice", "Authorized Dealer"].map((b) => (
              <div key={b}>{b}</div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { e: "🏠", t: "Home Fireplaces" },
            { e: "🏢", t: "Commercial Projects" },
            { e: "🌲", t: "Outdoor Living" },
            { e: "🔧", t: "Installation Support" },
          ].map((i) => (
            <div
              key={i.t}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col items-start gap-2 hover:border-orange-300 dark:hover:border-orange-800 transition-colors"
            >
              <span className="text-3xl">{i.e}</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{i.t}</span>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      <div className="mb-14">
        <div className="text-center mb-8">
          <SectionLabel>What We Stand For</SectionLabel>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: "Georgia,serif" }}>
            Our Core Values
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {values.map((v) => (
            <InfoCard key={v.title} icon={v.icon} title={v.title}>{v.desc}</InfoCard>
          ))}
        </div>
      </div>

      <Divider />

      <div className="mb-14">
        <div className="text-center mb-8">
          <SectionLabel>Meet the Team</SectionLabel>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: "Georgia,serif" }}>
            The Experts Behind {STORE_NAME2}
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {team.map((t) => (
            <div
              key={t.name}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center text-center hover:border-orange-300 dark:hover:border-orange-800 transition-colors group"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-4 group-hover:scale-105 transition-transform"
                style={{ background: t.color }}
              >
                {t.initials}
              </div>
              <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{t.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t.role}</p>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      <div className="mb-14">
        <div className="text-center mb-6">
          <SectionLabel>Our Partners</SectionLabel>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: "Georgia,serif" }}>
            Authorized Dealer for 200+ Brands
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {brands.map((b) => (
            <span
              key={b}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-all cursor-pointer"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl p-8 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(120deg,#1a0600,#3d1208)" }}
      >
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--theme-primary-700), transparent 60%), transparent 60%)` }}
        />
        <div className="relative z-10">
          <p className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Georgia,serif" }}>
            Ready to find your perfect fireplace?
          </p>
          <p className="text-orange-200 text-sm mb-6">
            Talk to a specialist today — free, no obligation advice.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`tel:${STORE_CONTACT}`}
              className="px-6 py-3 rounded-xl text-sm font-bold text-white border border-orange-400 hover:bg-orange-900/30 transition-colors"
            >
              {STORE_CONTACT}
            </a>
            <button className="px-6 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 bg-theme-600 text-white">
              Browse Fireplaces
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
