"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, BASE_URL } from "@/app/lib/helpers";
import { STORE_CONTACT, STORE_EMAIL } from "@/app/lib/store_constants";

const cardCls =
  "bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-5";

function SuccessPaymentPage() {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("order_summary");
    if (!raw) {
      router.replace(BASE_URL || "/");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setOrder(parsed);
      sessionStorage.removeItem("order_summary");
      if (!parsed.isLoggedIn && parsed.email) {
        sessionStorage.setItem(
          "register_prefill",
          JSON.stringify({
            email: parsed.email,
            first_name: parsed.firstName,
            last_name: parsed.lastName,
          })
        );
      }
    } catch {
      router.replace(BASE_URL || "/");
      return;
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  const { email, items, cartTotal, shipping, transactionId, orderId, isLoggedIn } = order;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-10 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-5">

        {/* ── Header ── */}
        <div className={`${cardCls} flex flex-col items-center text-center gap-3 py-8`}>
          <span className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
          <div>
            <h1 className="text-xl font-bold text-charcoal dark:text-white">Order Confirmed!</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              Thank you{order.firstName ? `, ${order.firstName}` : ""}. Your payment was successful.
            </p>
          </div>
          {email && (
            <p className="text-xs text-stone-400 dark:text-stone-500">
              A confirmation email has been sent to{" "}
              <span className="font-semibold text-charcoal dark:text-white">{email}</span>
            </p>
          )}
          {(orderId || transactionId) && (
            <p className="text-[11px] text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 rounded-lg px-3 py-1.5">
              {orderId ? `Order #${orderId}` : `Transaction: ${transactionId}`}
            </p>
          )}
        </div>

        {/* ── Items ── */}
        {items?.length > 0 && (
          <div className={cardCls}>
            <p className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider mb-4">
              Items Ordered
            </p>
            <ul className="flex flex-col gap-4">
              {items.map((item, i) => (
                <li key={i} className="flex gap-3 items-center">
                  <div className="relative w-14 h-14 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 flex-shrink-0 overflow-visible">
                    <span className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-stone-800 dark:bg-stone-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.quantity}
                    </span>
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title || ""}
                        fill
                        className="object-contain p-1 rounded-xl"
                        sizes="56px"
                      />
                    )}
                  </div>
                  <p className="flex-1 min-w-0 text-xs font-medium text-charcoal dark:text-white line-clamp-2">
                    {item.title}
                  </p>
                  <p className="text-xs font-semibold text-charcoal dark:text-white flex-shrink-0">
                    ${formatPrice((item.price || 0) * (item.quantity || 1))}
                  </p>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-stone-200 dark:border-stone-700">
              <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
                <span>Subtotal · {cartTotal?.items_count || items.length} items</span>
                <span>${formatPrice(cartTotal?.sub_total || 0)}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
                <span>Shipping</span>
                {cartTotal?.total_shipping === 0 ? (
                  <span className="text-green-600 dark:text-green-400 font-semibold">FREE</span>
                ) : (
                  <span>${formatPrice(cartTotal?.total_shipping || 0)}</span>
                )}
              </div>
              <div className="flex justify-between text-sm font-bold text-charcoal dark:text-white pt-2 border-t border-stone-200 dark:border-stone-700">
                <span>Total</span>
                <span>${formatPrice(cartTotal?.total_price || 0)}</span>
              </div>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 -mt-1">
                Including ${formatPrice(cartTotal?.total_tax || 0)} in taxes
              </p>
            </div>
          </div>
        )}

        {/* ── Shipping Address ── */}
        {shipping?.address && (
          <div className={cardCls}>
            <p className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider mb-3">
              Shipping To
            </p>
            <div className="text-sm text-stone-600 dark:text-stone-400 flex flex-col gap-0.5">
              {shipping.name && <p className="font-semibold text-charcoal dark:text-white">{shipping.name}</p>}
              <p>{shipping.address}</p>
              <p>{[shipping.city, shipping.state, shipping.zip].filter(Boolean).join(", ")}</p>
              {shipping.country && <p>{shipping.country}</p>}
            </div>
          </div>
        )}

        {/* ── CTAs ── */}
        {isLoggedIn ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`${BASE_URL}/my-account/orders`}
              className="flex-1 py-3 text-center text-sm font-semibold rounded-xl bg-fire hover:bg-orange-600 text-white transition-colors"
            >
              View My Orders
            </Link>
            <Link
              href={BASE_URL || "/"}
              className="flex-1 py-3 text-center text-sm font-semibold rounded-xl border border-stone-200 dark:border-stone-700 text-charcoal dark:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Guest: account creation prompt */}
            <div className={`${cardCls} flex flex-col gap-3`}>
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4.5 h-4.5 text-fire" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-charcoal dark:text-white">
                    Save time on your next order
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Create a free account to track this order, view order history, and check out faster next time.
                  </p>
                </div>
              </div>
              <Link
                href={`${BASE_URL}/login`}
                className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-fire hover:bg-orange-600 text-white transition-colors"
              >
                Create Account
              </Link>
            </div>

            <Link
              href={BASE_URL || "/"}
              className="w-full py-3 text-center text-sm font-semibold rounded-xl border border-stone-200 dark:border-stone-700 text-charcoal dark:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </>
        )}

        {/* ── Support ── */}
        <div className={cardCls}>
          <p className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider mb-3">
            Need Help?
          </p>
          <div className="flex flex-col gap-2 text-xs text-stone-500 dark:text-stone-400">
            <Link
              prefetch={false}
              href={`tel:${STORE_CONTACT}`}
              className="flex items-center gap-2 hover:text-fire transition-colors"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              {STORE_CONTACT}
            </Link>
            <a
              href={`mailto:${STORE_EMAIL}`}
              className="flex items-center gap-2 hover:text-fire transition-colors"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              {STORE_EMAIL}
            </a>
            <div className="pt-2 mt-1 border-t border-stone-100 dark:border-stone-800">
              <p className="text-[10px] font-semibold text-stone-600 dark:text-stone-300">
                Sales & Support · Mon–Fri 5:00am–5:00pm PST
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SuccessPaymentPage;
