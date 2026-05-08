import Link from "next/link";
import { BASE_URL } from "@/app/lib/helpers";
import { STORE_NAME2, STORE_CONTACT } from "@/app/lib/store_constants";

import Breadcrumb from "@/app/components/new-design/utility/Breadcrumb";
import PageHero from "@/app/components/new-design/utility/PageHero";
import InfoCard from "@/app/components/new-design/utility/InfoCard";
import SectionLabel from "@/app/components/new-design/utility/SectionLabel";
import PolicySection from "@/app/components/new-design/utility/PolicySection";
import Divider from "@/app/components/new-design/utility/Divider";

const benefits = [
  { icon: "💰", title: "Trade Pricing",      accent: true,  desc: "Exclusive discounts across our full catalog — from fireplaces and inserts to mantels, accessories, and outdoor heating." },
  { icon: "🚚", title: "Priority Shipping",  accent: false, desc: "Free shipping on eligible orders delivered anywhere in the continental US, with real-time tracking from warehouse to job site." },
  { icon: "🤝", title: "Expert Access",      accent: false, desc: "A direct line to our certified fireplace specialists for product specs, project guidance, and installation support." },
];

const steps = [
  { n: "01", title: "Apply Online",    desc: "Complete the short application form on our website. Takes less than 5 minutes." },
  { n: "02", title: "Get Reviewed",    desc: "Our team reviews your application within 1–2 business days and confirms your credentials." },
  { n: "03", title: "Start Saving",    desc: "Once approved, trade pricing activates immediately on your account — no waiting." },
];

const qualifications = [
  "Licensed fireplace or HVAC contractors",
  "Interior designers and home stagers",
  "Architects and building designers",
  "General contractors and home builders",
  "Property developers and real estate professionals",
];

const programBenefits = [
  "Exclusive trade discounts on the full product catalog",
  "Free shipping on eligible orders within the continental US",
  "Dedicated account support from our specialist team",
  "Access to product specs, CAD drawings, and installation guides",
  "Early access to new arrivals and limited inventory",
  "Flexible ordering with volume pricing available on request",
];

export default function ProfessionalProgramPage() {
  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10">
      <Breadcrumb items={["Home", "Professional Program"]} />
      <PageHero
        eyebrow="For Trade Professionals"
        title={`${STORE_NAME2} Professional Program`}
        subtitle={`An exclusive program for licensed contractors, designers, and builders. Get trade pricing, dedicated support, and expert resources on every project.`}
      />

      {/* Key benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {benefits.map((b) => (
          <InfoCard key={b.title} icon={b.icon} title={b.title} accent={b.accent}>
            {b.desc}
          </InfoCard>
        ))}
      </div>

      <Divider />

      {/* How it works */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <SectionLabel>Simple Process</SectionLabel>
          <h2
            className="text-2xl font-bold text-gray-900 dark:text-gray-100"
            style={{ fontFamily: "Georgia,serif" }}
          >
            How It Works
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.n} className="flex gap-4">
              <span className="text-3xl font-bold text-gray-100 dark:text-gray-800 shrink-0 select-none leading-none mt-0.5">
                {s.n}
              </span>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">{s.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* Content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <PolicySection title="Who Qualifies">
            <p>
              The {STORE_NAME2} Professional Program is open to verified trade
              professionals who design, specify, or install fireplace and heating
              systems. Eligible applicants include:
            </p>
            <ul className="list-none space-y-2 mt-1">
              {qualifications.map((q) => (
                <li key={q} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-theme-600">→</span>
                  {q}
                </li>
              ))}
            </ul>
            <p>
              Not sure if you qualify?{" "}
              <Link
                prefetch={false}
                href={`tel:${STORE_CONTACT}`}
                className="underline text-theme-600 dark:text-theme-400 hover:text-theme-700 transition-colors"
              >
                Give us a call
              </Link>{" "}
              — we're happy to discuss your situation.
            </p>
          </PolicySection>

          <Divider />

          <PolicySection title="Program Benefits">
            <ul className="list-none space-y-2">
              {programBenefits.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-theme-600">•</span>
                  {b}
                </li>
              ))}
            </ul>
            <p>
              Getting started is easy — complete the short online application and
              our team will review it within 1–2 business days. Once approved,
              trade pricing activates immediately on your account.
            </p>
          </PolicySection>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-[120px] self-start">
          <InfoCard icon="📋" title="Ready to Apply?" accent>
            <p className="mb-4">
              Call us to get started or ask any questions about the program.
              Our team is available Monday–Friday, 8am–6pm PST.
            </p>
            <Link
              prefetch={false}
              href={`tel:${STORE_CONTACT}`}
              className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity bg-theme-600"
            >
              {STORE_CONTACT}
            </Link>
          </InfoCard>

          <InfoCard icon="⏱️" title="Approval Timeline">
            <ul className="space-y-2 text-xs">
              {[
                ["Application",  "Under 5 minutes"],
                ["Review",       "1–2 business days"],
                ["Activation",   "Immediate on approval"],
              ].map(([k, v]) => (
                <li
                  key={k}
                  className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5 last:border-0 last:pb-0"
                >
                  <span className="text-gray-500 dark:text-gray-400">{k}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{v}</span>
                </li>
              ))}
            </ul>
          </InfoCard>

          <InfoCard icon="💬" title="Have Questions?">
            <p className="mb-3">
              Our specialists are ready to walk you through the program and answer
              any questions before you apply.
            </p>
            <Link
              prefetch={false}
              href={BASE_URL + "/contact"}
              className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-theme-600 hover:text-theme-600 transition-colors"
            >
              Contact Us
            </Link>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
