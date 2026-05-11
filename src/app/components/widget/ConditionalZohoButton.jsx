"use client";
import { usePathname } from "next/navigation";
import ZohoSalesIQButton from "./ZohoSalesIQButton";

export default function ConditionalZohoButton() {
  const pathname = usePathname();
  // Product pages have their own sticky CTA with a chat trigger
  if (/\/[^/]+\/product\//.test(pathname)) return null;
  return <ZohoSalesIQButton />;
}
