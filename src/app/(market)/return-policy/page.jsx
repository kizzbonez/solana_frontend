import Link from "next/link";
import { BASE_URL } from "@/app/lib/helpers";
import { STORE_NAME2 as brandName } from "@/app/lib/store_constants";

import Breadcrumb from "@/app/components/new-design/utility/Breadcrumb";
import PageHero from "@/app/components/new-design/utility/PageHero";
import InfoCard from "@/app/components/new-design/utility/InfoCard";
import PolicySection from "@/app/components/new-design/utility/PolicySection";
import Divider from "@/app/components/new-design/utility/Divider";

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10">
      <Breadcrumb items={["Home", "Return Policy"]} />
      <PageHero
        title="Return Policy"
        subtitle={`The ${brandName} offers a straightforward return policy. If you need to return an item please give us a call. We strive to provide a superior shopping experience for all of our customers. Our Return Policy requirements are detailed below.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {[
          { icon: "📅", title: "30-Day Window",      desc: "Return an item within 30 calendar days from the date you received it." },
          { icon: "📦", title: "Original Condition", desc: "Item must be unused and in the same condition that you received it with all original packaging." },
          { icon: "💳", title: "Refund Issued",      desc: "Refunds provided 3–5 business days after return is received. Allow up to 14 business days depending on payment method." },
        ].map((c) => (
          <InfoCard key={c.title} icon={c.icon} title={c.title} accent>{c.desc}</InfoCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <PolicySection title="Return Eligibility">
            <p>
              You have{" "}
              <span className="font-medium underline">30 calendar days</span>{" "}
              to return an item from the date you received it. To be eligible for a return,
              your item must be unused and in the same condition that you received it with
              all original packaging. All refunds are provided 3–5 business days after
              return is received.
            </p>
            <p>
              Shipping fees apply to all returns. To return a qualified item please{" "}
              <Link
                prefetch={false}
                href={BASE_URL + "/contact"}
                className="underline text-theme-600 dark:text-theme-400 hover:text-theme-700 transition-colors"
              >
                contact us
              </Link>{" "}
              to get a Return Merchandise Authorization (RMA). Restocking fee of{" "}
              <strong className="text-gray-800 dark:text-gray-200">20%</strong> is
              applicable for all items.
            </p>
            <ul className="list-none space-y-2 mt-1">
              {[
                "We will require detail pictures showing the condition of all item(s) being returned.",
                "The customer is responsible for all return shipping cost. All incurred shipping costs to and from will be deducted from the refund. Once we receive the item(s) it will be inspected. Once the item(s) passes the return inspection a refund/partial refund will be issued and the customer will receive the refund within 14 business days depending on payment method.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-theme-600">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </PolicySection>

          <Divider />

          <PolicySection title="Damage or Defective Order">
            <ul className="list-none space-y-2">
              {[
                "All orders must be received by someone 18 years old or older. While the driver is at your location please inspect the box and the contents for any damage. If damage is found please do not sign for item and reject delivery. Please call us immediately so we can provide instructions.",
                "If you receive a defective or damage item please contact us immediately. Most products come with a manufacturer's warranty. We will help direct you to the manufacturer to receive a replacement. Customers must call us to receive Return Merchandise Authorization (RMA) prior to all returns.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-theme-600">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </PolicySection>

          <Divider />

          <PolicySection title="Cancellation">
            <p>
              {brandName} wants to get your order to you as soon as possible. Most orders
              ship within 24 hours. If an order is cancelled and the item has been shipped,
              the customer is responsible for all shipping costs. Please{" "}
              <Link
                prefetch={false}
                href={BASE_URL + "/contact"}
                className="underline text-theme-600 dark:text-theme-400 hover:text-theme-700 transition-colors"
              >
                contact us
              </Link>{" "}
              immediately when wanting to cancel your order to avoid being charged shipping.
            </p>
          </PolicySection>

          <Divider />

          <PolicySection title="Items That Do Not Qualify for Returns">
            <ul className="list-none space-y-2">
              {[
                "Used items including items that have been installed or have been assembled",
                `Special promotional items, special order, made-to-order, customer order, clearance items, open box, scratch & dent or items marked as "No Return" or "Non-Returnable".`,
                "Items with a return request that is more than 30 calendar days from the date the item was received.",
                "Items without a valid Return Merchandise Authorization (RMA)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-red-500 dark:text-red-400">
                  <span className="mt-0.5 shrink-0">✗</span>
                  <span className="text-gray-600 dark:text-gray-400">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              {brandName} is here to make your experience as simple as possible. If you have
              any questions about how to return your item to us, please{" "}
              <Link
                prefetch={false}
                href={BASE_URL + "/contact"}
                className="underline text-theme-600 dark:text-theme-400 hover:text-theme-700 transition-colors"
              >
                contact us
              </Link>
              .
            </p>
          </PolicySection>
        </div>

        <div className="space-y-4 lg:sticky lg:top-[120px] self-start">
          <InfoCard icon="📞" title="Need Help?" accent>
            <p className="mb-3">
              Contact us to initiate your return or get a Return Merchandise Authorization
              (RMA).
            </p>
            <Link
              prefetch={false}
              href={BASE_URL + "/contact"}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity bg-theme-600"
            >
              Contact Us
            </Link>
          </InfoCard>
          <InfoCard icon="📋" title="Quick Summary">
            <ul className="space-y-2 text-xs">
              {[
                ["Return window",   "30 calendar days"],
                ["Condition",       "Unused, original packaging"],
                ["Restocking fee",  "20% on all items"],
                ["Shipping costs",  "Customer's responsibility"],
                ["Refund timeline", "3–5 business days"],
                ["Max refund time", "14 business days"],
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
