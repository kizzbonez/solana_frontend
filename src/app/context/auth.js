"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { capitalizeFirstLetter, BASE_URL } from "@/app/lib/helpers";
import { usePathname } from "next/navigation";
import { redisGet } from "@/app/lib/api";
import Cookies from "js-cookie";

// ─── Constants ────────────────────────────────────────────────────────────────

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

// ─── Static data ──────────────────────────────────────────────────────────────

const myAccountLinks = [
  {
    label: "Dashboard",
    url: `${BASE_URL}/my-account`,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z" />
      </svg>
    ),
  },
  {
    label: "Orders",
    url: `${BASE_URL}/my-account/orders`,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M17 18c-1.11 0-2 .89-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2M1 2v2h2l3.6 7.59l-1.36 2.45c-.15.28-.24.61-.24.96a2 2 0 0 0 2 2h12v-2H7.42a.25.25 0 0 1-.25-.25q0-.075.03-.12L8.1 13h7.45c.75 0 1.41-.42 1.75-1.03l3.58-6.47c.07-.16.12-.33.12-.5a1 1 0 0 0-1-1H5.21l-.94-2M7 18c-1.11 0-2 .89-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2"
        />
      </svg>
    ),
  },
  {
    label: "Profile",
    url: `${BASE_URL}/my-account/profile`,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 19.2c-2.5 0-4.71-1.28-6-3.2c.03-2 4-3.1 6-3.1s5.97 1.1 6 3.1a7.23 7.23 0 0 1-6 3.2M12 5a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-3A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10c0-5.53-4.5-10-10-10"
        />
      </svg>
    ),
  },
  {
    label: "Change Password",
    url: `${BASE_URL}/my-account/change-password`,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3"
        />
      </svg>
    ),
  },
  {
    label: "Logout",
    url: `${BASE_URL}/logout`,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="m17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5M4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z"
        />
      </svg>
    ),
  },
];

const accountBenefits = [
  "Earn 1 point per $1 spent",
  "Track your orders",
  "Save Favorite items",
  "Quick and easy checkout",
];

// ─── Pure utilities ───────────────────────────────────────────────────────────

/** Appends display-friendly fields (full_name, name_initials) to a raw user object. */
function injectUserFields(data) {
  if (!data) return null;
  return {
    ...data,
    full_name: `${capitalizeFirstLetter(data.first_name || "")} ${capitalizeFirstLetter(data.last_name || "")}`.trim(),
    name_initials: `${data.first_name?.[0] || ""}${data.last_name?.[0] || ""}`.toUpperCase(),
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const pathname = usePathname();

  const [forage,       setForage]       = useState(null);
  const [accessToken,  setAccessToken]  = useState(null);
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [user,         setUser]         = useState(null);
  const [loading,      setLoading]      = useState(true);

  // ── Storage: lazy-load browser-only localForage ────────────────────────────
  // localForage uses browser APIs unavailable during SSR, so it must be
  // imported dynamically on the client after mount.
  useEffect(() => {
    import("@/app/lib/localForage")
      .then((mod) => setForage(mod.default || mod))
      .catch((err) => console.error("[AuthProvider] Failed to load localForage:", err));
  }, []);

  // ── Auth ───────────────────────────────────────────────────────────────────

  /** Fetches the logged-in user's profile and injects display fields. */
  const getUser = useCallback(async () => {
    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(injectUserFields(await res.json()));
      setLoading(false);
    } catch {
      setUser(null);
      setLoading(false);
    }
  }, [accessToken]);

  /** Clears all session state and removes persisted tokens. */
  const logout = useCallback(async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST", credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("[logout] Failed:", body.error || res.statusText);
        return false;
      }
      setAccessToken(null);
      setUser(null);
      setIsLoggedIn(false);
      // Clear the cart cookie so server-side middleware sees an empty cart
      Cookies.set("cart", "[]", { path: "/", sameSite: "lax" });
      if (forage) {
        await forage.removeItem("refresh");
        await forage.removeItem("last_refresh");
        await forage.removeItem("access");
      }
      return res;
    } catch (err) {
      console.error("[logout] Error:", err);
    }
  }, [forage]);

  /**
   * Silently refreshes the access token using the stored refresh token.
   *
   * force=false: skips the network call if the stored token is still fresh.
   * force=true:  always hits the refresh endpoint (used on first load when
   *              there is no stored access token yet).
   */
  const refreshAccessToken = useCallback(async (force = false) => {
    if (!forage)                return;
    if (pathname === "/logout") return;

    try {
      const now            = Date.now();
      const lastRefresh    = await forage.getItem("last_refresh");
      const existingAccess = await forage.getItem("access");

      // Token is still fresh — restore session without a network call
      if (!force && lastRefresh && now - lastRefresh < REFRESH_INTERVAL && existingAccess) {
        setIsLoggedIn(true);
        setAccessToken(existingAccess);
        return;
      }

      const refresh = await forage.getItem("refresh");
      if (!refresh) {
        // No refresh token means the user was never logged in (or logged out)
        setLoading(false);
        return;
      }

      const res = await fetch("/api/refresh", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refresh }),
      });

      if (!res.ok) throw new Error("Refresh failed");

      const { access } = await res.json();
      if (access) {
        setIsLoggedIn(true);
        setAccessToken(access);
        await forage.setItem("access", access);
        await forage.setItem("last_refresh", now);
      }
    } catch (err) {
      console.error("[refreshAccessToken] Error:", err);
      setLoading(false);
      logout();
    }
  }, [forage, pathname, logout]);

  /** Sets the session after a successful login response from the server. */
  const login = useCallback(async (data) => {
    if (!data?.access || !data?.refresh) return false;
    setIsLoggedIn(true);
    setAccessToken(data.access);
    if (forage) {
      await forage.setItem("refresh", data.refresh);
    } else {
      console.warn("[login] forage not ready — refresh token not persisted");
    }
    return true;
  }, [forage]);

  // ── Cart API ───────────────────────────────────────────────────────────────
  // These live in AuthProvider (not CartProvider) because they need the access
  // token. All are wrapped in useCallback so CartProvider's useCallbacks that
  // depend on them remain stable between renders.

  const userCartGet = useCallback(async () => {
    if (loading || !user) return null;
    try {
      const res = await fetch("/api/auth/cart/active", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.status === 404) return null;

      const cart  = await res.json();
      const redis = await redisGet(`abandoned:${cart?.cart_id}`);
      // Degrade gracefully if Redis is unavailable — return the cart without the flag
      const is_abandoned = redis?.ok ? await redis.json() : null;

      return {
        ...cart,
        is_abandoned,
        items: (cart.items ?? []).map((item) => ({ ...item, ...item.custom_fields })),
      };
    } catch (err) {
      console.error("[userCartGet]", err);
      return null;
    }
  }, [loading, user, accessToken]);

  const userCartCreate = useCallback(async (cart = {}) => {
    if (loading || !user) return null;
    try {
      const res = await fetch("/api/auth/cart/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body:    JSON.stringify(cart),
      });
      return res.ok ? res.json() : null;
    } catch (err) {
      console.error("[userCartCreate]", err);
      return null;
    }
  }, [loading, user, accessToken]);

  const userCartUpdate = useCallback(async (cart = {}) => {
    if (loading || !user) return null;
    // product_id must come from custom_fields for the API; fall back to the
    // top-level field so we never send an item with a missing product_id.
    const sendCart = {
      ...cart,
      items: (cart.items ?? []).map((item) => ({
        ...item,
        product_id: item.custom_fields?.product_id ?? item.product_id,
      })),
    };
    try {
      const res = await fetch("/api/auth/cart/update", {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body:    JSON.stringify(sendCart),
      });
      return res.ok ? res.json() : null;
    } catch (err) {
      console.error("[userCartUpdate]", err);
      return null;
    }
  }, [loading, user, accessToken]);

  const userCartClose = useCallback(async () => {
    if (loading || !user || !isLoggedIn) return null;
    try {
      return fetch("/api/auth/cart/close", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      });
    } catch (err) {
      console.error("[userCartClose]", err);
      return null;
    }
  }, [loading, user, isLoggedIn, accessToken]);

  // ── Orders API ─────────────────────────────────────────────────────────────

  const userOrdersGet = useCallback(async () => {
    const res = await fetch("/api/auth/orders", {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
    return res.json();
  }, [accessToken]);

  const userOrderCreate = useCallback(async (order) => {
    if (loading) return null;
    try {
      return fetch("/api/orders/checkout", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(order),
      });
    } catch (err) {
      console.error("[userOrderCreate]", err);
      return null;
    }
  }, [loading, accessToken]);

  // ── Profile API ────────────────────────────────────────────────────────────

  const updateProfile = useCallback(async (updatedData) => {
    const res = await fetch("/api/profile/update", {
      method:  "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body:    JSON.stringify(updatedData),
    });
    if (!res.ok) {
      console.error("[updateProfile] Failed:", res.status);
      return res;
    }
    setUser(injectUserFields(await res.json()));
    return res;
  }, [accessToken]);

  const changePassword = useCallback(async (password) => {
    return fetch("/api/auth/change-password", {
      method:  "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body:    JSON.stringify(password),
    });
  }, [accessToken]);

  // ── Reviews API ────────────────────────────────────────────────────────────

  const userReviewCreate = useCallback(async (data) => {
    try {
      return fetch("/api/reviews/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body:    JSON.stringify(data),
      });
    } catch (err) {
      console.warn("[userReviewCreate]", err);
    }
  }, [accessToken]);

  const userReviewUpdate = useCallback(async (data) => {
    try {
      return fetch("/api/reviews/update", {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body:    JSON.stringify(data),
      });
    } catch (err) {
      console.warn("[userReviewUpdate]", err);
    }
  }, [accessToken]);

  // ── Effects ────────────────────────────────────────────────────────────────

  // Once forage is ready: restore or refresh the session, then keep it alive
  // with a single periodic interval. The original code had two overlapping
  // effects that both called refreshAccessToken on forage load, causing
  // double token requests and two competing intervals.
  useEffect(() => {
    if (!forage) return;
    refreshAccessToken();
    const interval = setInterval(() => refreshAccessToken(), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [forage, refreshAccessToken]);

  // Fetch the user profile whenever a new access token is set
  useEffect(() => {
    if (!accessToken) return;
    getUser();
  }, [accessToken, getUser]);

  // ── Derived state ──────────────────────────────────────────────────────────

  // full_name is already injected by injectUserFields — just expose it directly
  const fullName = useMemo(() => user?.full_name ?? "", [user]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        accountBenefits,
        forage,
        fullName,
        userOrderCreate,
        userOrdersGet,
        userCartClose,
        userCartCreate,
        userCartGet,
        userCartUpdate,
        isLoggedIn,
        user,
        myAccountLinks,
        changePassword,
        userReviewCreate,
        userReviewUpdate,
        login,
        logout,
        updateProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
