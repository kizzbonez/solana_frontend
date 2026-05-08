import Link from "next/link";
import { BASE_URL } from "@/app/lib/helpers";
import { STORE_NAME2 as brandName, STORE_CONTACT as contact } from "@/app/lib/store_constants";

import Breadcrumb from "@/app/components/new-design/utility/Breadcrumb";
import PageHero from "@/app/components/new-design/utility/PageHero";
import InfoCard from "@/app/components/new-design/utility/InfoCard";
import PolicySection from "@/app/components/new-design/utility/PolicySection";
import Divider from "@/app/components/new-design/utility/Divider";

const highlights = [
  { icon: "🆓", title: "Free Shipping",     sub: "On selected items" },
  { icon: "📦", title: "2–3 Business Days", sub: "Processing after payment" },
  { icon: "🚚", title: "Continental US",    sub: "Standard ground shipping" },
  { icon: "📍", title: "No PO Boxes",       sub: "APO/FPO not accepted" },
];

const terms = [
  "Free Shipping on selected items.",
  "We use standard ground shipping services to deliver orders within the continental United States.",
  "Orders are typically processed and shipped within 2–3 business days after payment is received.",
  "Customer is responsible for return/restocking fee of orders made by mistake. Contact us to know more about the return policy.",
  "Delivery times may vary depending on your location and the shipping carrier's schedule.",
  "We do not ship to PO boxes or APO/FPO addresses.",
  "Oversized or overweight items may incur additional shipping charges.",
  "Customers will be notified of any shipping delays or issues.",
  "Customers can track their order status through their account or by contacting our customer service team.",
];

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10">
      <Breadcrumb items={["Home", "Shipping Policy"]} />
      <PageHero
        eyebrow="Seamless Delivery"
        title="Shipping Policy"
        subtitle={`${brandName} wants to make sure that our customers have a seamless and hassle-free shopping experience.`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {highlights.map((h) => (
          <div
            key={h.title}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 text-center hover:border-orange-600 dark:hover:border-orange-800 transition-colors"
          >
            <span className="text-2xl block mb-2">{h.icon}</span>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{h.title}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{h.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <PolicySection title="Shipping Details">
            <ul className="list-none space-y-2">
              {terms.map((term, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-theme-600">•</span>
                  {term}
                </li>
              ))}
            </ul>
          </PolicySection>

          <Divider />

          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            If you need any further assistance with your shipping policy or have any other
            questions, don&apos;t hesitate to reach out to our customer service team at{" "}
            <Link
              prefetch={false}
              href={`tel:${contact}`}
              className="underline text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors"
            >
              {contact}
            </Link>
          </p>
        </div>

        <div className="space-y-4 lg:sticky lg:top-[120px] self-start">
          <InfoCard icon="📞" title="Shipping Questions?" accent>
            <p className="mb-3">Our team is ready to assist with any shipping questions.</p>
            <Link
              prefetch={false}
              href={`tel:${contact}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity bg-theme-700"
            >
              {contact}
            </Link>
          </InfoCard>
          <InfoCard icon="📋" title="Quick Summary">
            <ul className="space-y-2 text-xs">
              {[
                ["Free shipping",   "On selected items"],
                ["Processing",      "2–3 business days"],
                ["Delivery area",   "Continental US only"],
                ["PO Boxes",        "Not accepted"],
                ["Oversized items", "May incur extra charges"],
              ].map(([k, v]) => (
                <li
                  key={k}
                  className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5 last:border-0 last:pb-0"
                >
                  <span className="text-gray-500 dark:text-gray-400">{k}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-right max-w-[55%]">{v}</span>
                </li>
              ))}
            </ul>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
