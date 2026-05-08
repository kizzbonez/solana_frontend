import Link from "next/link";
import { BASE_URL } from "@/app/lib/helpers";
import {
  STORE_NAME2,
  STORE_EMAIL,
  STORE_CONTACT,
} from "@/app/lib/store_constants";

import Breadcrumb from "@/app/components/new-design/utility/Breadcrumb";
import PageHero from "@/app/components/new-design/utility/PageHero";
import PolicySection from "@/app/components/new-design/utility/PolicySection";
import Divider from "@/app/components/new-design/utility/Divider";

const toc = [
  "Information We Collect",
  "How We Use Your Information",
  "Information Sharing",
  "Cookies & Tracking",
  "Data Security",
  "Your Rights & Choices",
  "Children's Privacy",
  "Changes to This Policy",
  "Contact Us",
];

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
      <Breadcrumb items={["Home", "Privacy Policy"]} />
      <PageHero
        eyebrow="Your Privacy Matters"
        title="Privacy Policy"
        subtitle="We are committed to protecting your personal information. This policy explains what we collect, how we use it, and your rights."
      >
        <p className="text-theme-300 text-xs mt-4">Last updated: January 15, 2025</p>
      </PageHero>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:sticky lg:top-[120px] self-start">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 text-theme-600">
              Table of Contents
            </p>
            <nav className="space-y-1">
              {toc.map((t, i) => (
                <a
                  key={t}
                  href={`#privacy-${i}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-theme-50 dark:hover:bg-gray-800 hover:text-theme-600 dark:hover:text-theme-400 transition-colors"
                >
                  <span className="text-gray-300 dark:text-gray-600 font-mono text-[10px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {t}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-10">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-8 p-4 rounded-xl border-l-4 bg-theme-50 dark:bg-theme-900/10 border-theme-700">
            This Privacy Policy applies to {STORE_NAME2} ("we," "us," or "our") and governs
            data collection and usage. By using our website, you consent to the data
            practices described in this policy.
          </p>

          <div id="privacy-0">
            <PolicySection title="1. Information We Collect">
              <p>We collect information you provide directly, including:</p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
                <li>Name, email address, phone number, and mailing address</li>
                <li>Payment information (processed securely; we do not store full card numbers)</li>
                <li>Order history and product preferences</li>
                <li>Communications with our support team</li>
              </ul>
              <p className="mt-3">
                We also collect information automatically when you visit our site, including
                IP address, browser type, pages visited, and referring URLs.
              </p>
            </PolicySection>
          </div>

          <Divider />
          <div id="privacy-1">
            <PolicySection title="2. How We Use Your Information">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations, shipping updates, and delivery notifications</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Personalize your shopping experience and show relevant products</li>
                <li>Send promotional emails (you may opt out at any time)</li>
                <li>Improve our website, products, and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </PolicySection>
          </div>

          <Divider />
          <div id="privacy-2">
            <PolicySection title="3. Information Sharing">
              <p>
                We do not sell, trade, or rent your personal information to third parties.
                We may share information with:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
                <li>
                  <strong className="text-gray-700 dark:text-gray-300">Service providers</strong>{" "}
                  — payment processors, shipping carriers, email platforms
                </li>
                <li>
                  <strong className="text-gray-700 dark:text-gray-300">Analytics providers</strong>{" "}
                  — to understand site usage (data is anonymized)
                </li>
                <li>
                  <strong className="text-gray-700 dark:text-gray-300">Legal authorities</strong>{" "}
                  — when required by law or to protect our rights
                </li>
              </ul>
            </PolicySection>
          </div>

          <Divider />
          <div id="privacy-3">
            <PolicySection title="4. Cookies & Tracking">
              <p>
                We use cookies and similar tracking technologies to enhance your experience.
                Types of cookies we use:
              </p>
              <div className="mt-3 space-y-2">
                {[
                  ["Essential",  "Required for the site to function. Cannot be disabled."],
                  ["Analytics",  "Help us understand how visitors interact with our site."],
                  ["Marketing",  "Used to deliver relevant advertisements."],
                ].map(([t, d]) => (
                  <div
                    key={t}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800"
                  >
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold">
                      {t}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{d}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3">
                You can manage cookie preferences in your browser settings. Disabling cookies
                may affect site functionality.
              </p>
            </PolicySection>
          </div>

          <Divider />
          <div id="privacy-4">
            <PolicySection title="5. Data Security">
              <p>
                We implement industry-standard security measures including SSL/TLS encryption,
                PCI-DSS compliant payment processing, regular security audits, and restricted
                access to personal data. While we take every precaution, no method of
                transmission over the Internet is 100% secure.
              </p>
            </PolicySection>
          </div>

          <Divider />
          <div id="privacy-5">
            <PolicySection title="6. Your Rights & Choices">
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-none space-y-1.5 mt-2">
                {[
                  "Access the personal data we hold about you",
                  "Request correction of inaccurate data",
                  "Request deletion of your personal data",
                  "Opt out of marketing communications at any time",
                  "Request data portability",
                ].map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="text-theme-600">→</span>
                    {r}
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                To exercise any of these rights, contact us at{" "}
                <a
                  href={`mailto:${STORE_EMAIL}`}
                  className="font-semibold hover:underline text-theme-600"
                >
                  {STORE_EMAIL}
                </a>
                .
              </p>
            </PolicySection>
          </div>

          <Divider />
          <div id="privacy-6">
            <PolicySection title="7. Children's Privacy">
              <p>
                Our services are not directed to children under 13. We do not knowingly
                collect personal information from children. If we become aware that a child
                has provided us with personal information, we will delete it promptly.
              </p>
            </PolicySection>
          </div>

          <Divider />
          <div id="privacy-7">
            <PolicySection title="8. Changes to This Policy">
              <p>
                We may update this policy periodically. We&apos;ll notify you of significant
                changes by posting the new policy on this page with an updated "last updated"
                date. Continued use of our site after changes constitutes acceptance of the
                updated policy.
              </p>
            </PolicySection>
          </div>

          <Divider />
          <div id="privacy-8">
            <PolicySection title="9. Contact Us">
              <p>For privacy-related questions or requests, contact our Privacy Officer:</p>
              <div className="mt-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {STORE_NAME2} – Privacy Office
                </p>
                <p>
                  Email:{" "}
                  <a href={`mailto:${STORE_EMAIL}`} className="font-semibold text-theme-600">
                    {STORE_EMAIL}
                  </a>
                </p>
                <p>
                  Phone:{" "}
                  <a href={`tel:${STORE_CONTACT}`} className="font-semibold text-theme-600">
                    {STORE_CONTACT}
                  </a>
                </p>
              </div>
            </PolicySection>
          </div>
        </div>
      </div>
    </div>
  );
}
