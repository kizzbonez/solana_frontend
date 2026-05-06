"use client";
import { useEffect } from "react";
import { useAuth } from "@/app/context/auth";
import { useCart } from "@/app/context/cart";
import { BASE_URL } from "@/app/lib/helpers";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const { user, logout, loading } = useAuth();
  const { cartObject, createAbandonedCart, abandonedCartUser } = useCart();
  const router = useRouter();

  useEffect(() => {
    const logUserOut = async () => {
      try {
        await createAbandonedCart(cartObject, abandonedCartUser, "forced");
        const response = await logout();
        if (!response?.ok) return;
        router.push(`${BASE_URL}/login`);
      } catch (err) {
        console.error("[LogoutPage]", err);
      }
    };

    if (!loading && user && abandonedCartUser && cartObject) {
      logUserOut();
    }
  }, [loading, user, abandonedCartUser, cartObject]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-fire animate-spin" />
        <div>
          <h2 className="text-base font-bold text-charcoal dark:text-white mb-1">
            Signing out…
          </h2>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            Please wait a moment.
          </p>
        </div>
      </div>
    </div>
  );
}
