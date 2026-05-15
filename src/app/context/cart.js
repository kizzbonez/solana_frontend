"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import AddedToCartDialog from "@/app/components/atom/AddedToCartDialog";
import GuestEmailDialog from "@/app/components/atom/GuestEmailCaptureDialog";
import Cookies from "js-cookie";
import { getOrCreateSessionId } from "@/app/lib/session";
import { store_domain, mapOrderItems, createSlug } from "@/app/lib/helpers";
import { sendAbandonedCart, redisGet, redisSet } from "@/app/lib/api";
import { useAuth } from "@/app/context/auth";

// ─── Module-level constants ───────────────────────────────────────────────────

const GUEST_ABANDON_TIMEOUT = 5 * 60 * 1000;        // 5 minutes
const USER_ABANDON_TIMEOUT  = 24 * 60 * 60 * 1000;  // 24 hours

// ─── Pure utility functions (no React state, safe to call anywhere) ───────────

function getUserAgent() {
  return typeof navigator !== "undefined" ? navigator.userAgent : null;
}

function createCartId() {
  return typeof window !== "undefined" ? crypto.randomUUID() : null;
}

function createOrderNumber() {
  const d   = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const ts  = [
    d.getFullYear().toString().slice(-2),
    pad(d.getMonth() + 1),
    pad(d.getDate()),
    pad(d.getHours()),
    pad(d.getMinutes()),
    pad(d.getSeconds()),
  ].join("");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `SF-${ts}-${rand}`;
}

/** Builds a blank cart object for first-time guests or new logged-in sessions. */
async function createCartObj() {
  const now = new Date().toISOString();
  const id  = createCartId();
  return {
    id,
    cart_id:          id,
    reference_number: createOrderNumber(),
    session_id:       await getOrCreateSessionId(),
    user_agent:       getUserAgent(),
    store_domain,
    items:            [],
    created_at:       now,
    updated_at:       now,
    status:           "active",
    is_abandoned:     null,
  };
}

/** Maps a user's profile fields onto cart billing/shipping address fields. */
function userProfileToCart(user = {}) {
  const { email, first_name, last_name, profile = {} } = user;
  return {
    billing_address:     profile.billing_address,
    billing_city:        profile.billing_city,
    billing_country:     profile.billing_country,
    billing_email:       email,
    billing_first_name:  first_name,
    billing_last_name:   last_name,
    billing_phone:       profile.phone,
    billing_province:    profile.billing_state,
    billing_zip_code:    profile.billing_zip,
    shipping_address:    profile.shipping_address,
    shipping_city:       profile.shipping_city,
    shipping_country:    profile.shipping_country,
    shipping_email:      email,
    shipping_first_name: first_name,
    shipping_last_name:  last_name,
    shipping_phone:      profile.phone,
    shipping_province:   profile.shipping_state,
    shipping_zip_code:   profile.shipping_zip,
  };
}

/** Syncs cart product IDs to a cookie for server-side middleware reads. */
function syncCartToCookie(items) {
  try {
    Cookies.set(
      "cart",
      JSON.stringify(items.map(({ product_id }) => product_id)),
      { path: "/", sameSite: "lax" },
    );
  } catch (err) {
    console.warn("[syncCartToCookie]", err);
  }
}

/** POST to the order-total API and return the price breakdown. */
async function fetchOrderTotal(orderData) {
  try {
    const res = await fetch("/api/orders/get-total", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(orderData),
    });
    return res.json();
  } catch (err) {
    console.error("[fetchOrderTotal]", err);
    return { success: false, message: err.message };
  }
}

async function updateRedisAbandonedRecord(key, value) {
  const res = await redisSet({ key, value });
  if (!res?.ok) console.warn("[updateRedisAbandonedRecord]", { key, value });
}

async function getRedisAbandonedRecord(key) {
  const res = await redisGet(key);
  if (!res?.ok) console.warn("[getRedisAbandonedRecord]", key);
  return res.json();
}

/**
 * Builds the normalized cart item shape stored in cart.items.
 * Kept as a shared builder so single-add and bulk-add produce identical shapes.
 */
function buildCartItem(item) {
  const product_link = `${store_domain}/${createSlug(item.brand)}/product/${item.handle}`;
  const base = {
    product_id:    item.product_id,
    quantity:      item.quantity,
    handle:        item.handle,
    brand:         item.brand,
    title:         item.title,
    product_title: item.title,
    product_link,
    images:        item.images,
    ratings:       item.ratings,
    variants:      item.variants,
  };
  return { ...base, variant_data: item.variants?.[0], custom_fields: base };
}

/**
 * Merges one or more new items into an existing cart items array.
 * Increments quantity for existing products, appends new ones.
 * Returns a NEW array — never mutates the originals.
 */
function mergeItems(cart_items, new_items) {
  const incoming = Array.isArray(new_items) ? new_items : [new_items];
  // Deep-copy so we never mutate objects owned by React state
  const result = cart_items.map((i) => ({
    ...i,
    custom_fields: { ...i.custom_fields },
  }));

  for (const item of incoming) {
    if (!item?.product_id || !item?.quantity) {
      console.warn("[mergeItems] Skipping invalid item:", item);
      continue;
    }
    const idx = result.findIndex((i) => i.product_id === item.product_id);
    if (idx > -1) {
      const qty = result[idx].quantity + item.quantity;
      result[idx] = {
        ...result[idx],
        quantity:      qty,
        custom_fields: { ...result[idx].custom_fields, quantity: qty },
      };
    } else {
      result.push(buildCartItem(item));
    }
  }
  return result;
}

/**
 * Applies a +1 or -1 delta to a product's quantity.
 * Removes the item entirely if quantity reaches zero.
 * Returns a NEW array — never mutates the originals.
 */
function applyQuantityChange(cart_items, product_id, delta) {
  return cart_items
    .map((item) => {
      if (item.product_id !== product_id) return item;
      const quantity = item.quantity + delta;
      return { ...item, quantity, custom_fields: { ...item.custom_fields, quantity } };
    })
    .filter((item) => item.quantity > 0);
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const CartProvider = ({ children }) => {
  const {
    loading,
    isLoggedIn,
    user,
    userCartGet,
    userCartCreate,
    userCartUpdate,
    userCartClose,
  } = useAuth();

  const [cart,              setCart]              = useState(null);
  const [cartStorage,       setCartStorage]       = useState(null);
  const [forage,            setForage]            = useState(null);
  const [loadingCartItems,  setLoadingCartItems]  = useState(true);
  const [addedToCart,       setAddedToCart]       = useState(null);
  const [addToCartLoading,  setAddToCartLoading]  = useState(false);
  const [abandonedCartUser, setAbandonedCartUser] = useState(null);

  // Refs hold current values for event callbacks that must not re-subscribe on every render
  const cartRef                = useRef(cart);
  const userRef                = useRef(abandonedCartUser);
  const cart_channel           = useRef(null);
  const isSendingAbandonedCart = useRef(false); // prevents concurrent abandoned-cart API calls
  const beaconSent             = useRef(false);  // prevents double beacon on unload + visibilitychange

  // ── Lazy-load browser-only storage modules ─────────────────────────────────
  // cartStorage and localForage cannot be imported at module level because they
  // use browser APIs unavailable during SSR.
  useEffect(() => {
    let mounted = true;
    import("@/app/lib/cartStorage").then((mod) => { if (mounted) setCartStorage(mod); });
    import("@/app/lib/localForage").then((mod)  => { if (mounted) setForage(mod); });
    return () => { mounted = false; };
  }, []);

  // ── Persistence ────────────────────────────────────────────────────────────

  /** Saves cart to the user API when logged in, or to localForage for guests. */
  const saveCart = useCallback(async (newCart) => {
    if (isLoggedIn && user?.email) {
      await userCartUpdate(newCart);
    } else {
      await cartStorage.saveCart(newCart);
    }
  }, [isLoggedIn, user, userCartUpdate, cartStorage]);

  // ── Cart reads ─────────────────────────────────────────────────────────────

  const getGuestCart = useCallback(async () => {
    const guest_cart = await cartStorage.getCart();
    if (!guest_cart) return null;
    const is_abandoned = await getRedisAbandonedRecord(`abandoned:${guest_cart.id}`);
    return { ...guest_cart, cart_id: guest_cart.id, is_abandoned };
  }, [cartStorage]);

  /**
   * Fetches the logged-in user's cart from the API and merges any unmerged
   * guest cart items into it. Marks merged items so they aren't re-merged
   * on subsequent loads.
   */
  const getUserCart = useCallback(async () => {
    if (!user) return null;

    const guestCart = await getGuestCart();
    const toMerge   = (guestCart?.items ?? [])
      .filter((i) => !i.merged)
      .map((item) => ({ ...item, ...item.custom_fields }));

    const raw      = await userCartGet();
    const userCart = raw?.message
      ? null
      : { ...raw, items: (raw.items ?? []).map((i) => ({ ...i, ...(i.custom_fields ?? {}) })) };

    // No guest items to merge — return the existing user cart as-is
    if (toMerge.length === 0) {
      return { ...userCart, reference_number: userCart?.reference_number ?? createOrderNumber() };
    }

    // Build the merged cart
    let mergedCart;
    const profile = userProfileToCart(user);
    if (userCart) {
      mergedCart = {
        ...userCart,
        items:            [...(userCart.items ?? []), ...toMerge],
        updated_at:       new Date().toISOString(),
        reference_number: userCart.reference_number ?? createOrderNumber(),
      };
    } else {
      // First login with no existing user cart — create a fresh one
      const fresh = await createCartObj();
      mergedCart  = await userCartCreate({ ...fresh, items: toMerge, ...profile });
    }

    // Persist the merged result
    const saved = (userCart?.items?.length ?? 0) > 0
      ? await userCartUpdate(mergedCart)
      : await userCartCreate({ ...mergedCart, ...profile });

    // Mark guest items as merged so they aren't duplicated on the next load
    if (saved && guestCart) {
      await cartStorage.saveCart({
        ...guestCart,
        items: (guestCart.items ?? []).map((i) => ({ ...i, merged: true })),
      });
    }

    return mergedCart;
  }, [user, cartStorage, getGuestCart, userCartGet, userCartCreate, userCartUpdate]);

  const getCart = useCallback(async () => {
    if (!cartStorage || loading) return undefined;
    return isLoggedIn && user ? getUserCart() : getGuestCart();
  }, [cartStorage, loading, isLoggedIn, user, getGuestCart, getUserCart]);

  // ── Cart write helpers ─────────────────────────────────────────────────────

  /**
   * Re-fetches order totals (subtotal, tax, shipping) from the server after
   * any cart mutation and syncs the cookie. Always call this before persisting
   * a changed cart so pricing stays accurate.
   */
  const buildCartObject = useCallback(async (cartObject) => {
    if (!cartObject?.items) return null;
    syncCartToCookie(cartObject.items);
    const { data } = await fetchOrderTotal({ items: cartObject.items });
    return {
      ...cartObject,
      sub_total:      data?.sub_total,
      total_tax:      data?.total_tax,
      total_shipping: data?.total_shipping,
      total_price:    data?.total_price,
    };
  }, []);

  /**
   * When a user adds/removes items from a previously-abandoned cart, we reset
   * it to a new active cart so it can be tracked as abandoned again if needed.
   */
  const resetAbandonedCart = useCallback(async (newCart) => {
    if (!loading && !isLoggedIn) {
      const id = createCartId();
      return { ...newCart, is_abandoned: null, id, cart_id: id, reference_number: createOrderNumber() };
    }
    if (!loading && isLoggedIn) {
      // Close old server cart and open a fresh one with the current items
      const { cart_id, id, ...rest } = newCart;
      return userCartCreate({ ...rest, ...userProfileToCart(user) });
    }
  }, [loading, isLoggedIn, user, userCartCreate]);

  // ── Abandoned cart ─────────────────────────────────────────────────────────

  /**
   * Attempts to record a cart as abandoned and notify the backend.
   *
   * trigger:
   *   "beacon"  — fires on tab close/hide via navigator.sendBeacon (guest only)
   *   "timed"   — fires after the inactivity timeout since the last cart update
   *   "forced"  — always fires regardless of timeout
   */
  const createAbandonedCart = useCallback(async (cart_obj, user_obj, trigger = "timed") => {
    if (isSendingAbandonedCart.current) return;
    isSendingAbandonedCart.current = true;

    try {
      if (loading)                                     return;
      if (!cart_obj?.id)                               return;
      if (!user_obj?.billing_email)                    return;
      if ((cart_obj.items ?? []).length === 0)         return;
      if (cart_obj.is_abandoned)                       return;

      const updatedAt = new Date(cart_obj.updated_at).getTime();
      const timeout   = isLoggedIn ? USER_ABANDON_TIMEOUT : GUEST_ABANDON_TIMEOUT;
      const timedOut  = Date.now() - updatedAt > timeout;

      const sendCart = {
        ...cart_obj,
        abandoned_cart_id: cart_obj.cart_id,
        items:             mapOrderItems(cart_obj.items ?? []),
        ...user_obj,
      };

      const now = new Date().toISOString();

      // Beacon path: fire-and-forget on tab close (guest only, survives page unload)
      if (trigger === "beacon" && !isLoggedIn) {
        const updated = { ...cart_obj, is_abandoned: now, updated_at: now };
        await updateRedisAbandonedRecord(`abandoned:${updated.cart_id}`, now);
        await saveCart(updated);
        setCart(updated);
        if (
          typeof navigator !== "undefined" &&
          Array.isArray(cart_obj.items) &&
          cart_obj.items.length > 0
        ) {
          const blob = new Blob([JSON.stringify(sendCart)], { type: "application/json" });
          navigator.sendBeacon("/api/abandoned-carts/create", blob);
        }
        return;
      }

      let response = null;
      if (trigger === "timed" && timedOut) response = await sendAbandonedCart(sendCart);
      if (trigger === "forced")            response = await sendAbandonedCart(sendCart);
      if (!response) return;

      const { success, data } = await response.json();

      if (success) {
        const updated = { ...cart_obj, is_abandoned: now, updated_at: now };
        await updateRedisAbandonedRecord(`abandoned:${updated.cart_id}`, now);
        await saveCart(updated);
        setCart(updated);
      }

      // Cart was already recorded — just make sure Redis is in sync
      if (data?.code === "DUPLICATE_CART_ID") {
        await updateRedisAbandonedRecord(`abandoned:${cart_obj.cart_id}`, cart_obj.is_abandoned);
      }
    } finally {
      isSendingAbandonedCart.current = false;
    }
  }, [loading, isLoggedIn, saveCart]);

  // ── Cart load ──────────────────────────────────────────────────────────────

  const loadCart = useCallback(async () => {
    if (!cartStorage || loading) return;
    setLoadingCartItems(true);
    try {
      const loaded = await getCart();
      setCart(loaded ?? null);
      syncCartToCookie(loaded?.items ?? []);
      // userRef.current avoids adding abandonedCartUser to deps, which would
      // cause the BroadcastChannel effect to re-subscribe on every cart update
      createAbandonedCart(loaded, userRef.current, "timed");
    } finally {
      setLoadingCartItems(false);
    }
  }, [cartStorage, loading, getCart, createAbandonedCart]);

  // ── User info for abandoned cart ───────────────────────────────────────────

  /** Reads guest checkout info from localForage to populate abandoned cart data. */
  const loadGuestInfo = useCallback(async () => {
    if (!forage) return;
    const info = await forage.getItem("checkout_info");
    setAbandonedCartUser({
      billing_address:     info?.billing_address     || "NA",
      billing_city:        info?.billing_city        || "NA",
      billing_country:     info?.billing_country     || "NA",
      billing_email:       info?.billing_email       || null,
      billing_first_name:  info?.billing_first_name  || "NA",
      billing_last_name:   info?.billing_last_name   || "NA",
      billing_province:    info?.billing_province    || "NA",
      billing_zip_code:    info?.billing_zip_code    || "NA",
      shipping_address:    info?.shipping_address    || "NA",
      shipping_city:       info?.shipping_city       || "NA",
      shipping_country:    info?.shipping_country    || "NA",
      shipping_email:      info?.shipping_email      || null,
      shipping_first_name: info?.shipping_first_name || "NA",
      shipping_last_name:  info?.shipping_last_name  || "NA",
      shipping_province:   info?.shipping_province   || "NA",
      shipping_zip_code:   info?.shipping_zip_code   || "NA",
    });
  }, [forage]);

  // ── Cart mutations ─────────────────────────────────────────────────────────

  /** Broadcasts a cart-updated message to other open tabs via BroadcastChannel. */
  const notifyCartUpdate = useCallback((cartData = null) => {
    cart_channel.current?.postMessage({ type: "CART_UPDATED", payload: cartData });
  }, []);

  const addToCart = useCallback(async (item) => {
    setAddToCartLoading(true);
    try {
      const cartObj     = (await getCart()) ?? (await createCartObj());
      const merged      = mergeItems(cartObj.items ?? [], item);
      let   newCart     = await buildCartObject({ ...cartObj, items: merged, updated_at: new Date().toISOString() });

      if (newCart?.is_abandoned) newCart = await resetAbandonedCart(newCart);

      // On first add for a logged-in user, create the server cart; otherwise update
      if ((cartObj.items ?? []).length === 0 && isLoggedIn) {
        await userCartCreate({ ...newCart, ...userProfileToCart(user) });
      } else {
        await saveCart(newCart);
      }

      setCart(newCart);
      syncCartToCookie(newCart.items);
      notifyCartUpdate();
      setAddedToCart(item);

      if (!isLoggedIn && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("guestEmailRequired"));
      }
      return { code: 200, status: "success", message: "Successfully added item to cart." };
    } catch {
      return { code: 500, status: "error", message: "Failed to add item to cart." };
    } finally {
      setAddToCartLoading(false);
    }
  }, [getCart, buildCartObject, resetAbandonedCart, isLoggedIn, user, userCartCreate, saveCart, notifyCartUpdate]);

  const addItemsToCart = useCallback(async (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return { code: 400, status: "error", message: "Must provide a non-empty array of items." };
    }
    setAddToCartLoading(true);
    try {
      const cartObj = (await getCart()) ?? (await createCartObj());
      const merged  = mergeItems(cartObj.items ?? [], items);
      let   newCart = await buildCartObject({ ...cartObj, items: merged, updated_at: new Date().toISOString() });

      if (newCart?.is_abandoned) newCart = await resetAbandonedCart(newCart);

      if ((cartObj.items ?? []).length === 0 && isLoggedIn) {
        await userCartCreate({ ...newCart, ...userProfileToCart(user) });
      } else {
        await saveCart(newCart);
      }

      setCart(newCart);
      syncCartToCookie(newCart.items);
      notifyCartUpdate();
      setAddedToCart(items);

      return { code: 200, status: "success", message: `Successfully added ${items.length} items to cart.` };
    } catch {
      return { code: 500, status: "error", message: "Failed to add items to cart." };
    } finally {
      setAddToCartLoading(false);
    }
  }, [getCart, buildCartObject, resetAbandonedCart, isLoggedIn, user, userCartCreate, saveCart, notifyCartUpdate]);

  const removeCartItem = useCallback(async (item) => {
    const cartObj = await getCart();
    if (!cartObj) return;

    const updated = (cartObj.items ?? []).filter((i) => i.product_id !== item.product_id);
    let   newCart = await buildCartObject({ ...cartObj, items: updated, updated_at: new Date().toISOString() });

    if (newCart?.is_abandoned) newCart = await resetAbandonedCart(newCart);

    if (newCart.items.length === 0 && isLoggedIn) {
      await userCartClose();
    } else {
      await saveCart(newCart);
    }

    setCart(newCart);
    syncCartToCookie(newCart.items);
    notifyCartUpdate();
  }, [getCart, buildCartObject, resetAbandonedCart, isLoggedIn, userCartClose, saveCart, notifyCartUpdate]);

  const increaseProductQuantity = useCallback(async (item) => {
    const cartObj = await getCart();
    if (!cartObj || !item?.product_id) return;

    const updated = applyQuantityChange(cartObj.items ?? [], item.product_id, +1);
    let   newCart = await buildCartObject({ ...cartObj, items: updated, updated_at: new Date().toISOString() });

    if (newCart?.is_abandoned) newCart = await resetAbandonedCart(newCart);

    await saveCart(newCart);
    setCart(newCart);
    syncCartToCookie(newCart.items);
    notifyCartUpdate();
  }, [getCart, buildCartObject, resetAbandonedCart, saveCart, notifyCartUpdate]);

  const decreaseProductQuantity = useCallback(async (item) => {
    const cartObj = await getCart();
    if (!cartObj || !item?.product_id) return;

    const current = (cartObj.items ?? []).find((i) => i.product_id === item.product_id);
    // When quantity is 1, the caller should use removeCartItem instead
    if (!current || current.quantity <= 1) return;

    const updated = applyQuantityChange(cartObj.items ?? [], item.product_id, -1);
    let   newCart = await buildCartObject({ ...cartObj, items: updated, updated_at: new Date().toISOString() });

    if (newCart?.is_abandoned) newCart = await resetAbandonedCart(newCart);

    await saveCart(newCart);
    setCart(newCart);
    syncCartToCookie(newCart.items);
    notifyCartUpdate();
  }, [getCart, buildCartObject, resetAbandonedCart, saveCart, notifyCartUpdate]);

  const clearCartItems = useCallback(async () => {
    if (isLoggedIn && user) {
      await userCartClose();
    } else {
      await saveCart(null);
    }
    setCart(null);
    syncCartToCookie([]);
    notifyCartUpdate();
  }, [isLoggedIn, user, userCartClose, saveCart, notifyCartUpdate]);

  // ── Dev helpers ────────────────────────────────────────────────────────────

  /** Marks the persisted guest cart as active. Used during development/testing only. */
  const guestCartToActive = useCallback(async () => {
    if (!forage) return;
    const guestCart = await forage.getItem("cart");
    await forage.setItem("cart", { ...guestCart, status: "active" });
  }, [forage]);

  // ── Derived state ──────────────────────────────────────────────────────────

  const cartItems      = useMemo(() => cart?.items ?? [], [cart]);
  const cartItemsCount = useMemo(
    () => cartItems.reduce((total, item) => total + (item.quantity || 0), 0),
    [cartItems],
  );

  // ── Effects ────────────────────────────────────────────────────────────────

  // Keep refs in sync so abandoned-cart event callbacks always read the latest
  // values without being listed as effect dependencies (which would cause
  // unnecessary re-subscriptions to document/window events).
  useEffect(() => {
    cartRef.current = cart;
    userRef.current = abandonedCartUser;
  }, [cart, abandonedCartUser]);

  // Populate abandonedCartUser then trigger the initial cart load.
  // Runs when auth state resolves or storage modules finish loading.
  useEffect(() => {
    if (!cartStorage) return;

    if (!loading && user) {
      const { email, first_name, last_name, profile = {} } = user;
      setAbandonedCartUser({
        billing_address:     profile.billing_address  ?? "NA",
        billing_city:        profile.billing_city     ?? "NA",
        billing_country:     profile.billing_country  ?? "NA",
        billing_email:       email,
        billing_first_name:  first_name               || "NA",
        billing_last_name:   last_name                || "NA",
        billing_province:    profile.billing_state    ?? "NA",
        billing_zip_code:    profile.billing_zip      ?? "NA",
        shipping_address:    profile.shipping_address ?? "NA",
        shipping_city:       profile.shipping_city    ?? "NA",
        shipping_country:    profile.shipping_country ?? "NA",
        shipping_email:      email,
        shipping_first_name: first_name               || "NA",
        shipping_last_name:  last_name                || "NA",
        shipping_province:   profile.shipping_state   ?? "NA",
        shipping_zip_code:   profile.shipping_zip     ?? "NA",
      });
    } else if (!loading && !user) {
      loadGuestInfo();
    }

    loadCart();
  }, [cartStorage, loading, isLoggedIn, user, forage, loadGuestInfo, loadCart]);

  // Sync cart across tabs: reload when another tab mutates the cart.
  useEffect(() => {
    const channel        = new BroadcastChannel("cart_channel");
    cart_channel.current = channel;
    channel.onmessage    = () => loadCart();
    return () => channel.close();
  }, [loadCart]);

  // Abandoned cart tracking: debounced activity listener + tab close/hide beacon.
  useEffect(() => {
    if (!cart || !abandonedCartUser) return;

    // Beacon fires at most once per tab-hide cycle; resets when the tab becomes visible again
    const sendBeaconOnce = () => {
      if (beaconSent.current) return;
      beaconSent.current = true;
      createAbandonedCart(cartRef.current, userRef.current, "beacon");
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendBeaconOnce();
      } else {
        beaconSent.current = false;
      }
    };

    // Debounce activity so we don't spam the API on every keystroke/scroll
    let activityDebounce;
    const handleActivity = () => {
      clearTimeout(activityDebounce);
      activityDebounce = setTimeout(() => {
        createAbandonedCart(cartRef.current, userRef.current, "timed");
      }, 2000);
    };

    const activityEvents = ["click", "keydown", "scroll"];
    activityEvents.forEach((evt) => document.addEventListener(evt, handleActivity));
    window.addEventListener("beforeunload", sendBeaconOnce);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(activityDebounce);
      activityEvents.forEach((evt) => document.removeEventListener(evt, handleActivity));
      window.removeEventListener("beforeunload", sendBeaconOnce);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [cart, abandonedCartUser, createAbandonedCart]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <CartContext.Provider
      value={{
        cartObject:              cart,
        cartItems,
        cartItemsCount,
        loadingCartItems,
        addToCart,
        addItemsToCart,
        clearCartItems,
        createAbandonedCart,
        decreaseProductQuantity,
        fetchOrderTotal,
        increaseProductQuantity,
        mergeUserCartItems:      getUserCart,
        removeCartItem,
        loadCart,
        addToCartLoading,
        abandonedCartUser,
        // dev only
        guestCartToActive,
      }}
    >
      {children}
      <AddedToCartDialog data={addedToCart} onClose={() => setAddedToCart(null)} />
      <GuestEmailDialog />
    </CartContext.Provider>
  );
};
