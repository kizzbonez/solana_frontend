"use client";
import { forwardRef, useImperativeHandle, useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { BASE_URL } from "@/app/lib/helpers";

// Initialise once at module level — never re-create the Stripe object
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#E85D26",
    colorBackground: "#ffffff",
    colorText: "#1A1A1A",
    colorDanger: "#ef4444",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "6px",
  },
};

// ── Inner form — lives inside <Elements> so useStripe/useElements work ───────
const StripeInnerForm = forwardRef(function StripeInnerForm(
  { onError },
  ref
) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);

  // Exposed to parent via ref so CheckoutComponent can trigger payment on its
  // own form submit without Stripe needing its own <form>.
  useImperativeHandle(ref, () => ({
    async pay(clientSecret) {
      if (!stripe || !elements) {
        onError?.("Stripe is not ready yet. Please wait a moment.");
        return null;
      }

      setCardError(null);

      // Step 1 — validate the Payment Element fields client-side
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setCardError(submitError.message);
        onError?.(submitError.message);
        return null;
      }

      // Step 2 — confirm the payment with the server-created PaymentIntent
      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            // Fallback redirect URL for payment methods that require a redirect
            // (e.g. bank transfers). Cards and wallets resolve inline.
            return_url: `${typeof window !== "undefined" ? window.location.origin : ""}${BASE_URL}/payment_success`,
          },
          redirect: "if_required",
        });

      if (confirmError) {
        setCardError(confirmError.message);
        onError?.(confirmError.message);
        return null;
      }

      if (paymentIntent?.status === "succeeded") {
        return paymentIntent.id;
      }

      onError?.("Payment did not complete. Please try again.");
      return null;
    },
  }));

  return (
    <div className="space-y-2">
      <PaymentElement
        options={{
          layout: "tabs",
          fields: { billingDetails: { address: "never" } },
        }}
      />
      {cardError && (
        <p className="text-red-500 text-xs mt-1">{cardError}</p>
      )}
    </div>
  );
});

// ── Outer wrapper — manages the <Elements> provider ───────────────────────────
// `ref` is forwarded all the way to StripeInnerForm so the parent can call
// stripeRef.current.pay(clientSecret).
const StripePaymentSection = forwardRef(function StripePaymentSection(
  { clientSecret, onError },
  ref
) {
  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center min-h-[200px] rounded border border-dashed border-stone-300 bg-stone-50">
        <div className="flex flex-col items-center gap-2 text-stone-400">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="animate-spin"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span className="text-sm">Preparing payment form…</span>
        </div>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance }}
    >
      <StripeInnerForm ref={ref} onError={onError} />
    </Elements>
  );
});

export default StripePaymentSection;
