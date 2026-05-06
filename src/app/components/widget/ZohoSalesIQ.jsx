"use client";
import Script from "next/script";

export default function ZohoSalesIQ() {
  const widgetCode = process.env.NEXT_PUBLIC_ZOHO_SALESIQ_WIDGET_CODE;
  if (!widgetCode) return null;

  return (
    <>
      <Script id="zsiq-init" strategy="afterInteractive">{`
        window.$zoho=window.$zoho||{};$zoho.salesiq=$zoho.salesiq||{ready:function(){}};
      `}</Script>
      <Script
        id="zsiqscript"
        src={`https://salesiq.zohopublic.com/widget?wc=${widgetCode}`}
        strategy="afterInteractive"
        defer
      />
    </>
  );
}
