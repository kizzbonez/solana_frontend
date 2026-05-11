"use client";

import Link from "next/link";
import { formatPrice } from "@/app/lib/helpers";
import { STORE_CONTACT } from "@/app/lib/store_constants";
import AddToCartButtonWrap from "@/app/components/atom/AddToCartButtonWrap";

const MobileStickyCTA = ({ product }) => {
  const openChat = () => window.$zoho?.salesiq?.floatwindow?.visible("show");

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3 shadow-2xl">
      <div className="flex-1 min-w-0">
        <p className="text-base font-black text-gray-900 dark:text-white leading-none">
          ${formatPrice(product?.price)}
        </p>
        {!!product?.save_amt && (
          <p className="text-[10px] text-green-500 font-semibold mt-0.5">
            Save ${formatPrice(product?.save_amt)}
            {!!product?.is_freeshipping && " · Free Shipping"}
          </p>
        )}
      </div>
      <Link
        href={`tel:${STORE_CONTACT}`}
        className="flex items-center gap-1.5 border-2 border-theme-500 text-theme-600 dark:text-theme-400 text-xs font-bold py-2.5 px-3 rounded-xl hover:bg-theme-50 transition-colors whitespace-nowrap flex-shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Call
      </Link>
      <button
        onClick={openChat}
        className="flex-shrink-0 flex items-center gap-1.5 border-2 border-green-500 text-green-600 text-xs font-bold py-2.5 px-3 rounded-xl hover:bg-green-50 transition-colors whitespace-nowrap"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Chat
      </button>
      <AddToCartButtonWrap product={product}>
        <button className="flex-shrink-0 flex items-center gap-2 bg-theme-600 hover:bg-theme-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Add to Cart
        </button>
      </AddToCartButtonWrap>
    </div>
  );
};

export default MobileStickyCTA;
