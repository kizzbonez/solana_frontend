"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/cart";
import { formatPrice, BASE_URL } from "@/app/lib/helpers";
import Link from "next/link";
import AuthButtons from "@/app/components/molecule/AuthButtons";
import { useAuth } from "@/app/context/auth";

const SavingsBanner = ({ savings, shipping_cost }) => (
  <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-xl">
    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="text-xs font-medium text-green-700 dark:text-green-400">
      You're saving{" "}
      <span className="font-bold">${formatPrice(savings)}</span>
      {shipping_cost === 0 && (
        <> + <span className="font-bold">FREE</span> shipping</>
      )}
    </p>
  </div>
);

function CartOrderSummary({ checkoutButton = true }) {
  const { loading, user } = useAuth();
  const { cartObject, cartItems } = useCart();
  const [originalPrice, setOriginalPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [savings, setSavings] = useState(0);

  const handleCheckout = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("You don't have items in your cart yet.");
      return;
    }
    window.location.href = `${BASE_URL}/checkout`;
  };

  const getPriceSum = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce(
      (total, item) => total + (item?.variants?.[0]?.price || 0) * (item.quantity || 0),
      0
    );
  };

  const getOriginalPriceSum = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce(
      (total, item) =>
        total +
        (item?.variants?.[0]?.compare_at_price || item?.variants?.[0]?.price || 0) *
          (item.quantity || 0),
      0
    );
  };

  useEffect(() => {
    const _originalPrice = getOriginalPriceSum(cartItems);
    const _salePrice = getPriceSum(cartItems);
    setOriginalPrice(_originalPrice);
    setSalePrice(_salePrice);
    setSavings(_originalPrice - _salePrice);
  }, [cartItems]);

  const shippingDisplay = cartObject?.total_shipping
    ? `$${formatPrice(cartObject.total_shipping)}`
    : cartItems.length > 0
    ? "FREE"
    : "$0.00";

  const shippingIsFree = cartObject && !cartObject?.total_shipping && cartItems.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {cartObject && savings > 0 && (
        <SavingsBanner savings={savings} shipping_cost={cartObject?.total_shipping} />
      )}

      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-charcoal dark:text-white mb-4">Order Summary</h2>

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-stone-500 dark:text-stone-400">Original price</span>
            <span className="text-xs font-semibold text-charcoal dark:text-white">
              ${formatPrice(originalPrice)}
            </span>
          </div>

          {savings > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-stone-500 dark:text-stone-400">Savings</span>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                −${formatPrice(savings)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-xs text-stone-500 dark:text-stone-400">Shipping</span>
            <span
              className={`text-xs font-semibold ${
                shippingIsFree ? "text-green-600 dark:text-green-400" : "text-charcoal dark:text-white"
              }`}
            >
              {shippingDisplay}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-stone-500 dark:text-stone-400">Tax</span>
            <span className="text-xs text-stone-400 dark:text-stone-500 italic">
              Calculated at checkout
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-stone-100 dark:border-stone-800 mb-5">
          <span className="text-sm font-bold text-charcoal dark:text-white">Total</span>
          <span className="text-sm font-bold text-charcoal dark:text-white">
            ${formatPrice(cartObject?.total_price || 0)}
          </span>
        </div>

        {checkoutButton && (
          <>
            <button
              onClick={handleCheckout}
              className="w-full py-2.5 bg-fire hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors mb-3"
            >
              Proceed to Checkout
            </button>
            <Link
              href={`${BASE_URL}/fireplaces`}
              prefetch={false}
              className="flex items-center justify-center text-xs font-medium text-stone-400 hover:text-fire dark:text-stone-500 dark:hover:text-orange-400 transition-colors"
            >
              or continue shopping
            </Link>
          </>
        )}
      </div>

      {loading ? (
        <div className="h-10 bg-stone-200 dark:bg-stone-700 rounded-xl animate-pulse" />
      ) : (
        !user && (
          <div className="w-full flex items-center justify-center">
            <AuthButtons uiVersion={2} />
          </div>
        )
      )}
    </div>
  );
}

export default CartOrderSummary;
