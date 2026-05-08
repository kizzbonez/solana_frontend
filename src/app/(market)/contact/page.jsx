import Link from "next/link";
import { BASE_URL } from "@/app/lib/helpers";
import {
  STORE_NAME2,
  STORE_CONTACT,
  STORE_EMAIL,
} from "@/app/lib/store_constants";

import Breadcrumb from "@/app/components/new-design/utility/Breadcrumb";
import PageHero from "@/app/components/new-design/utility/PageHero";
import InfoCard from "@/app/components/new-design/utility/InfoCard";

const channels = [
  {
    icon: "📞",
    label: "Call Us",
    value: STORE_CONTACT,
    sub: "Mon–Fri 8am–6pm PST",
    href: "tel:8885759720",
  },
  {
    icon: "✉️",
    label: "Email Us",
    value: STORE_EMAIL,
    sub: "Response within 24 hours",
    href: `mailto:${STORE_EMAIL}`,
  },
];

export default function ContactPage() {
  return (
    <div className="max-w-[1240] mx-auto px-4 sm:px-6 py-10">
      <Breadcrumb items={["Home", "Contact"]} />
      <PageHero
        eyebrow="We're here to help"
        title="Contact Us"
        subtitle="Have a question about a fireplace, an order, or need expert advice? Our team of fireplace specialists is ready to help."
      />

      <div className="max-w-[800px] mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
          <p className="mb-5 text-center">
            At{" "}
            <Link
              prefetch={false}
              href={`${BASE_URL}`}
              className="text-theme-600 font-bold underline"
            >
              {STORE_NAME2}
            </Link>{" "}
            customer service comes first. Whether you need details about a
            product or assistance with your order, our team is ready to help.
            You can reach us in three convenient ways.
          </p>
        </div>

        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {channels.map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="group flex flex-col gap-3 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-theme-600 dark:hover:border-theme-700 hover:shadow-md transition-all"
              >
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">
                    {c.label}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors">
                    {c.value}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {c.sub}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <InfoCard icon="⏱️" title="Response Times" accent>
          <ul className="space-y-2 mt-1">
            {[
              ["Phone", "Same day"],
              ["Email", "Within 24h"],
              ["Live Chat", "Under 5 min"],
              // ["Contact Form", "1–2 business days"],
            ].map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{k}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {v}
                </span>
              </li>
            ))}
          </ul>
        </InfoCard>
        <InfoCard icon="🕐" title="Business Hours">
          <ul className="space-y-1.5 mt-1">
            {[
              ["Mon – Fri", "8:00 AM – 6:00 PM"],
              ["Saturday", "9:00 AM – 4:00 PM"],
              ["Sunday", "Closed"],
            ].map(([d, t]) => (
              <li key={d} className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{d}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </InfoCard>
        <InfoCard icon="🏆" title="Expert Advice">
          <p>
            All our support staff are certified fireplace specialists with 5+
            years of experience. We speak your language — no jargon.
          </p>
        </InfoCard>
      </div>
    </div>
  );
}
