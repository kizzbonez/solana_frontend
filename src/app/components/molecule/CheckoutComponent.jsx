"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import dropin from "braintree-web-drop-in";
import Image from "next/image";
import Link from "next/link";
import AuthButtons from "@/app/components/molecule/AuthButtons";
import { useAuth } from "@/app/context/auth";
import { useCart } from "@/app/context/cart";
import { useGoogleReCaptcha } from "@/app/context/recaptcha";
import {
  BASE_URL,
  mapOrderItems,
  formatPrice,
  createSlug,
  debounce,
} from "@/app/lib/helpers";
import {
  STORE_EMAIL,
  STORE_DOMAIN,
  STORE_CONTACT,
} from "@/app/lib/store_constants";

const initialForm = {
  status: null,
  payment_method: "braintree",
  payment_status: false,
  billing_first_name: "",
  billing_last_name: "",
  billing_email: "",
  billing_phone: "",
  billing_address: "",
  billing_city: "",
  billing_province: "",
  billing_zip_code: "",
  billing_country: "",
  is_valid_billing_zip: false,
  shipping_first_name: "",
  shipping_last_name: "",
  shipping_email: "",
  shipping_phone: "",
  shipping_address: "",
  shipping_city: "",
  shipping_province: "",
  shipping_zip_code: "",
  shipping_country: "",
  is_valid_shipping_zip: false,
  notes: "",
  items: [],
  newsletter: false,
  save_information: false,
  shipping_to_billing: true,
};

const inputCls =
  "text-sm w-full px-3 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-charcoal dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700 disabled:bg-stone-50 dark:disabled:bg-stone-900 disabled:text-stone-400 dark:disabled:text-stone-500 transition-colors";

const cardCls =
  "bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-5";

// ─── AutoInput ────────────────────────────────────────────────────────────────

const AutoInput = ({ name, placeholder, value, onChange, required }) => (
  <div className="relative">
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      disabled
      value={value || ""}
      onChange={onChange}
      required={required}
      className={inputCls}
    />
    <span
      className="absolute top-1/2 -translate-y-1/2 right-3 text-stone-400 pointer-events-none"
      title="Auto-filled on valid ZIP entry"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    </span>
  </div>
);

// ─── ItemsList ────────────────────────────────────────────────────────────────

const ItemsList = ({ items }) => (
  <ul className="flex flex-col gap-4">
    {items?.map((item, i) => {
      const img = item?.images?.find((img) => img?.position === 1);
      return (
        <li key={i} className="flex gap-3 items-center">
          <div className="relative w-14 h-14 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 flex-shrink-0 overflow-visible">
            <span className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-stone-800 dark:bg-stone-600 text-white text-[10px] font-bold flex items-center justify-center">
              {item?.quantity || 0}
            </span>
            {img?.src && (
              <Image
                src={img.src}
                alt={createSlug(item?.title || "")}
                fill
                className="object-contain p-1 rounded-xl"
                sizes="56px"
              />
            )}
          </div>
          <p className="flex-1 min-w-0 text-xs font-medium text-charcoal dark:text-white line-clamp-2">
            {item?.title}
          </p>
          <p className="text-xs font-semibold text-charcoal dark:text-white flex-shrink-0">
            ${formatPrice(item?.quantity * item?.variants?.[0]?.price || 0)}
          </p>
        </li>
      );
    })}
  </ul>
);

// ─── ComputationSection ───────────────────────────────────────────────────────

const ComputationSection = ({ data, items }) => {
  const empty = !items?.length;
  return (
    <div className="flex flex-col gap-2.5 pt-4 mt-4 border-t border-stone-200 dark:border-stone-700">
      <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
        <span>Subtotal · {empty ? 0 : data?.items_count || 0} items</span>
        <span>${formatPrice(empty ? 0 : data?.sub_total || 0)}</span>
      </div>
      <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
        <span
          className="flex items-center gap-1"
          title="Calculated on valid shipping ZIP"
        >
          Shipping
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 110 16A8 8 0 0112 4zm0 12a1 1 0 100 2 1 1 0 000-2zm0-9.5a3.625 3.625 0 011.348 6.99.8.8 0 00-.305.201c-.044.05-.051.114-.05.18L13 14a1 1 0 01-1.993.117L11 14v-.25c0-1.153.93-1.845 1.604-2.116a1.626 1.626 0 10-2.229-1.509 1 1 0 11-2 0A3.625 3.625 0 0112 6.5z" />
          </svg>
        </span>
        {empty || !data?.allowPay ? (
          <span className="italic text-stone-400 dark:text-stone-500">Enter postal code</span>
        ) : data?.total_shipping === 0 ? (
          <span className="text-green-600 dark:text-green-400 font-semibold">FREE</span>
        ) : (
          <span>${formatPrice(data?.total_shipping)}</span>
        )}
      </div>
      <div className="flex justify-between text-sm font-bold text-charcoal dark:text-white pt-2 border-t border-stone-200 dark:border-stone-700 mt-0.5">
        <span>Total</span>
        <span>${formatPrice(empty ? 0 : data?.total_price || 0)}</span>
      </div>
      <p className="text-[10px] text-stone-400 dark:text-stone-500 -mt-1">
        Including ${formatPrice(empty ? 0 : data?.total_tax || 0)} in taxes
      </p>
    </div>
  );
};

// ─── OrderQuerySection ────────────────────────────────────────────────────────

const OrderQuerySection = ({ reference_number }) => (
  <div className={cardCls}>
    <p className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider mb-3">
      Need help?
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
    {reference_number && (
      <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-3">
        Ref: <span className="text-fire font-semibold">{reference_number}</span>
      </p>
    )}
  </div>
);

// ─── LogoutButton ─────────────────────────────────────────────────────────────

const LogoutButton = () => {
  const { logout } = useAuth();
  const { cartObject, createAbandonedCart, abandonedCartUser } = useCart();

  const handleLogout = async () => {
    try {
      await createAbandonedCart(cartObject, abandonedCartUser, "forced");
      await logout();
    } catch (err) {
      console.warn("[handleLogout] error", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-xs text-stone-400 hover:text-fire dark:hover:text-orange-400 transition-colors font-medium"
    >
      Sign out
    </button>
  );
};

// ─── FormLoader ───────────────────────────────────────────────────────────────

const FormLoader = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className={`${cardCls} h-16`} />
    <div className={cardCls}>
      <div className="h-3 w-28 bg-stone-200 dark:bg-stone-700 rounded mb-4" />
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="h-10 w-full bg-stone-100 dark:bg-stone-800 rounded-xl" />
          <div className="h-10 w-full bg-stone-100 dark:bg-stone-800 rounded-xl" />
        </div>
        <div className="h-10 w-full bg-stone-100 dark:bg-stone-800 rounded-xl" />
        <div className="flex gap-3">
          <div className="h-10 w-full bg-stone-100 dark:bg-stone-800 rounded-xl" />
          <div className="h-10 w-full bg-stone-100 dark:bg-stone-800 rounded-xl" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-full bg-stone-100 dark:bg-stone-800 rounded-xl" />
          <div className="h-10 w-full bg-stone-100 dark:bg-stone-800 rounded-xl" />
        </div>
        <div className="h-10 w-full bg-stone-100 dark:bg-stone-800 rounded-xl" />
      </div>
    </div>
    <div className={`${cardCls} h-[330px]`} />
    <div className="h-12 w-full bg-stone-200 dark:bg-stone-700 rounded-xl" />
  </div>
);

// ─── CheckoutComponent ────────────────────────────────────────────────────────

function CheckoutComponent() {
  const [cartTotal, setCartTotal] = useState({});
  const { clearCartItems, fetchOrderTotal, loadCart, cartObject, cartItems } = useCart();
  const dropinContainer = useRef(null);
  const [instance, setInstance] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [forage, setForage] = useState(null);
  const { isLoggedIn, user, loading, updateProfile, userOrderCreate } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const router = useRouter();

  const getOrderTotal = async (newForm) => {
    const items = mapOrderItems(newForm?.items);
    if (items.length > 0) {
      const response = await fetchOrderTotal({ ...newForm, items });
      const hasCompleteShipping = Boolean(
        newForm?.shipping_zip_code && newForm?.is_valid_shipping_zip
      );
      if (response?.success) {
        setCartTotal({ ...response.data, allowPay: hasCompleteShipping });
      }
    }
  };

  async function createOrder(orderData) {
    try {
      const response = await userOrderCreate(orderData);
      const contentType = response.headers.get("content-type");
      const result = contentType?.includes("application/json")
        ? await response.json()
        : { success: false, message: "Invalid JSON response from server" };

      if (!response?.ok || result.success === false) {
        return { success: false, message: result.message || "Failed to create order" };
      }
      return { success: true, data: result.data || result.order || result };
    } catch (error) {
      console.error("Order creation failed:", error.message || error);
      return { success: false, message: error.message || "Unexpected error while creating order" };
    }
  }

  const debouncedGetOrderTotal = useMemo(() => debounce(getOrderTotal, 300), []);

  const zipQuery = async (zip) => {
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (!response?.ok) return { error: "Invalid Zip Code" };
      const data = await response.json();
      const place = data.places[0];
      return {
        error: false,
        data: {
          city: place["place name"],
          state: place["state"],
          province: place["state abbreviation"],
          country: data["country"],
          country_abbr: data["country abbreviation"],
        },
      };
    } catch (err) {
      return { error: err };
    }
  };

  const debouncedZipQuery = useMemo(
    () =>
      debounce(async (zip, callback) => {
        const result = await zipQuery(zip);
        callback(result);
      }, 500),
    []
  );

  const saveInformation = (condition) => {
    if (loading || !condition) return;
    const {
      items, newsletter, save_information, shipping_to_billing,
      notes, payment_details, payment_status, payment_method, status,
      ...toSave
    } = form;

    if (isLoggedIn) {
      updateProfile({
        ...user,
        profile: {
          phone: toSave?.shipping_phone,
          billing_address: toSave?.billing_address,
          billing_country: toSave?.billing_country,
          billing_city: toSave?.billing_city,
          billing_state: toSave?.billing_province,
          billing_zip: toSave?.billing_zip_code,
          shipping_address: toSave?.shipping_address,
          shipping_country: toSave?.shipping_country,
          shipping_city: toSave?.shipping_city,
          shipping_state: toSave?.shipping_province,
          shipping_zip: toSave?.shipping_zip_code,
        },
      });
    } else {
      forage.setItem("checkout_info", toSave);
    }
  };

  const shippingAsBilling = (condition, newForm) => ({
    ...newForm,
    billing_first_name: condition ? newForm?.shipping_first_name : "",
    billing_last_name: condition ? newForm?.shipping_last_name : "",
    billing_phone: condition ? newForm?.shipping_phone : "",
    billing_address: condition ? newForm?.shipping_address : "",
    billing_city: condition ? newForm?.shipping_city : "",
    billing_province: condition ? newForm?.shipping_province : "",
    billing_zip_code: condition ? newForm?.shipping_zip_code : "",
    billing_country: condition ? newForm?.shipping_country : "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      let updatedForm = { ...prev, [name]: type === "checkbox" ? checked : value };

      if (
        updatedForm.shipping_to_billing &&
        name.startsWith("shipping_") &&
        !["shipping_to_billing", "shipping_email"].includes(name)
      ) {
        const [, ...fieldParts] = name.split("_");
        updatedForm[`billing_${fieldParts.join("_")}`] = value;
      }

      if (name === "shipping_email") {
        updatedForm.billing_email = updatedForm.shipping_email;
      }

      if (name === "shipping_to_billing") {
        updatedForm = shippingAsBilling(checked, updatedForm);
      }

      return updatedForm;
    });

    if (name === "shipping_zip_code" || name === "billing_zip_code") {
      debouncedZipQuery(value, (result) => updateOnZipChange(name, result));
    }
  };

  const updateOnZipChange = (name, result) => {
    const { error, data } = result;

    setForm((prev) => {
      const updatedForm = { ...prev };

      if (name === "shipping_zip_code") {
        updatedForm.shipping_country = error ? "" : data?.country;
        updatedForm.shipping_city = error ? "" : data?.city;
        updatedForm.shipping_province = error ? "" : data?.province;
        updatedForm.is_valid_shipping_zip = !Boolean(error);

        if (prev.shipping_to_billing) {
          updatedForm.billing_country = error ? "" : data?.country;
          updatedForm.billing_city = error ? "" : data?.city;
          updatedForm.billing_province = error ? "" : data?.province;
          updatedForm.is_valid_billing_zip = !Boolean(error);
        }

        debouncedGetOrderTotal(updatedForm);
      } else if (name === "billing_zip_code") {
        updatedForm.billing_country = error ? "" : data?.country;
        updatedForm.billing_city = error ? "" : data?.city;
        updatedForm.billing_province = error ? "" : data?.province;
        updatedForm.is_valid_billing_zip = !Boolean(error);
      }

      return updatedForm;
    });
  };

  const fillUserToForm = (user) => {
    if (!user) return;
    setForm((prev) => {
      const updated = {
        ...prev,
        billing_first_name: user?.first_name,
        billing_last_name: user?.last_name,
        billing_email: user?.email,
        billing_phone: user?.profile?.phone,
        billing_address: user?.profile?.billing_address,
        billing_city: user?.profile?.billing_city,
        billing_province: user?.profile?.billing_state,
        billing_zip_code: user?.profile?.billing_zip,
        billing_country: user?.profile?.billing_country,
        shipping_first_name: user?.first_name,
        shipping_last_name: user?.last_name,
        shipping_email: user?.email,
        shipping_phone: user?.profile?.phone,
        shipping_address: user?.profile?.shipping_address,
        shipping_city: user?.profile?.shipping_city,
        shipping_province: user?.profile?.shipping_state,
        shipping_zip_code: user?.profile?.shipping_zip,
        shipping_country: user?.profile?.shipping_country,
        is_valid_shipping_zip: false,
        is_valid_billing_zip: false,
        newsletter: false,
        save_information: false,
        shipping_to_billing: true,
      };
      debouncedZipQuery(updated.shipping_zip_code, (result) =>
        updateOnZipChange("shipping_zip_code", result)
      );
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      alert("reCAPTCHA not available. Please try again.");
      return;
    }

    let recaptchaToken;
    try {
      recaptchaToken = await executeRecaptcha("checkout");
    } catch {
      alert("reCAPTCHA verification failed. Please try again.");
      return;
    }

    if (!cartTotal?.allowPay) {
      alert("Please fill in your shipping postal code so we can calculate your shipping total.");
      return;
    }

    if (!instance) {
      alert("Payment UI is not initialized.");
      return;
    }

    try {
      const { nonce } = await instance.requestPaymentMethod();
      if (!nonce) {
        alert("Error: No nonce received. Try again.");
        return;
      }

      const total_amount = parseFloat(cartTotal?.total_price || 0).toFixed(2);

      const response = await fetch("/api/braintree_checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nonce, amount: `${total_amount}`, recaptchaToken }),
      });

      const result = await response.json();

      if (result.success) {
        const orders = {
          ...form,
          status: "paid",
          payment_status: true,
          payment_details: result?.transaction?.id,
          store_domain: STORE_DOMAIN,
          items: mapOrderItems(cartItems),
        };

        const order_response = await createOrder(orders);

        if (order_response.success) {
          const orderSummary = {
            orderId: order_response.data?.order_number || null,
            transactionId: result?.transaction?.id || null,
            email: form?.shipping_email || "",
            firstName: form?.shipping_first_name || "",
            lastName: form?.shipping_last_name || "",
            items: cartItems.map((item) => ({
              title: item.title,
              quantity: item.quantity,
              price: item?.variants?.[0]?.price,
              image: item.images?.find((img) => img.position === 1)?.src || null,
            })),
            cartTotal,
            shipping: {
              name: `${form.shipping_first_name} ${form.shipping_last_name}`.trim(),
              address: form.shipping_address,
              city: form.shipping_city,
              state: form.shipping_province,
              zip: form.shipping_zip_code,
              country: form.shipping_country,
            },
            isLoggedIn,
          };
          sessionStorage.setItem("order_summary", JSON.stringify(orderSummary));
          instance.teardown();
          setInstance(null);
          clearCartItems();
          saveInformation(form?.save_information);
          router.push(`${BASE_URL}/payment_success`);
        } else {
          alert("Something went wrong! Please try again.");
        }
      } else {
        alert(`Payment failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  useEffect(() => {
    if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
      const newForm = { ...form, items: cartItems };
      setForm(newForm);
      getOrderTotal(newForm);
    }
  }, [cartItems]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let mounted = true;
    import("@/app/lib/localForage").then((module) => {
      if (!mounted) return;
      setForage(module);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const fillGuestInfo = async () => {
      const checkout_info = await forage.getItem("checkout_info");
      setForm((prev) => {
        const updated = {
          ...prev,
          ...checkout_info,
          is_valid_shipping_zip: false,
          is_valid_billing_zip: false,
          newsletter: false,
          save_information: false,
          shipping_to_billing: true,
        };
        debouncedZipQuery(updated.shipping_zip_code, (result) =>
          updateOnZipChange("shipping_zip_code", result)
        );
        return updated;
      });
    };

    if (loading && !forage) return;

    if (isLoggedIn) {
      fillUserToForm(user);
    } else {
      fillGuestInfo();
    }

    loadCart();
  }, [loading, forage, isLoggedIn, user]);

  useEffect(() => {
    async function initializeDropIn() {
      if (loading || !dropinContainer.current) return;

      try {
        const res = await fetch("/api/braintree_token");
        const data = await res.json();

        if (!data.clientToken) {
          alert("Error: No client token received");
          return;
        }

        if (instance) {
          await instance.teardown();
          setInstance(null);
        }

        const dropinInstance = await dropin.create({
          authorization: data.clientToken,
          container: dropinContainer.current,
          vaultManager: false,
          card: {
            cardholderName: { required: true },
            overrides: {
              fields: {
                number: { placeholder: "4111 1111 1111 1111" },
                cvv: { required: true, placeholder: "123" },
                expirationDate: { placeholder: "MM/YY" },
              },
            },
          },
        });

        setInstance(dropinInstance);
      } catch (error) {
        console.log("[BRAINTREEINIT] ERROR", error);
      }
    }

    initializeDropIn();
  }, [loading]);

  const ref_number = useMemo(() => {
    if (loading) return null;
    return isLoggedIn
      ? cartObject?.cart_id ? "CI-" + cartObject?.cart_id : null
      : cartObject?.reference_number;
  }, [loading, isLoggedIn, cartObject]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

          {/* ── Left: Form ── */}
          <div>
            {loading ? (
              <FormLoader />
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* Auth buttons (guest only) */}
                {!isLoggedIn && (
                  <div className={cardCls}>
                    <AuthButtons />
                  </div>
                )}

                {/* Contact */}
                <div className={cardCls}>
                  {isLoggedIn ? (
                    user && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none">
                            {user.name_initials}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-charcoal dark:text-white">
                              {user.email}
                            </p>
                            <p className="text-[10px] text-stone-400 dark:text-stone-500">
                              Logged in
                            </p>
                          </div>
                        </div>
                        <LogoutButton />
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider">
                        Contact
                      </p>
                      <input
                        type="email"
                        name="shipping_email"
                        placeholder="Email"
                        value={form?.shipping_email || ""}
                        onChange={handleChange}
                        required
                        className={inputCls}
                      />
                      <label className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 cursor-pointer select-none">
                        <input
                          id="newsletter"
                          name="newsletter"
                          type="checkbox"
                          checked={form?.newsletter}
                          onChange={handleChange}
                          className="rounded border-stone-300 text-fire focus:ring-orange-300 h-3.5 w-3.5"
                        />
                        Email me with news and offers
                      </label>
                    </div>
                  )}
                </div>

                {/* Shipping Address */}
                <div className={cardCls}>
                  <p className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider mb-4">
                    Shipping Address
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" name="shipping_first_name" placeholder="First Name" value={form?.shipping_first_name || ""} onChange={handleChange} required className={inputCls} />
                      <input type="text" name="shipping_last_name" placeholder="Last Name" value={form?.shipping_last_name || ""} onChange={handleChange} required className={inputCls} />
                    </div>
                    <input type="text" name="shipping_address" placeholder="Address" value={form?.shipping_address || ""} onChange={handleChange} required className={inputCls} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" name="shipping_zip_code" placeholder="Postal code" value={form?.shipping_zip_code || ""} onChange={handleChange} required className={inputCls} />
                      <AutoInput name="shipping_country" placeholder="Country" value={form?.shipping_country} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <AutoInput name="shipping_city" placeholder="City" value={form?.shipping_city} onChange={handleChange} required />
                      <AutoInput name="shipping_province" placeholder="State" value={form?.shipping_province} onChange={handleChange} required />
                    </div>
                    <input type="text" name="shipping_phone" placeholder="Phone" value={form?.shipping_phone || ""} onChange={handleChange} required className={inputCls} />
                    <input type="text" name="notes" placeholder="Notes (optional)" value={form?.notes || ""} onChange={handleChange} className={inputCls} />
                    <label className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 cursor-pointer select-none mt-1">
                      <input
                        id="save_information"
                        name="save_information"
                        type="checkbox"
                        checked={form?.save_information}
                        onChange={handleChange}
                        className="rounded border-stone-300 text-fire focus:ring-orange-300 h-3.5 w-3.5"
                      />
                      Save this information for next time
                    </label>
                  </div>
                </div>

                {/* Payment */}
                <div className={cardCls}>
                  <p className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider mb-4">
                    Payment
                  </p>
                  <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 min-h-[330px]">
                    <div ref={dropinContainer} />
                  </div>
                </div>

                {/* Billing Address */}
                <div className={cardCls}>
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-300 cursor-pointer select-none">
                    <input
                      id="shipping_to_billing"
                      name="shipping_to_billing"
                      type="checkbox"
                      checked={form?.shipping_to_billing}
                      onChange={handleChange}
                      className="rounded border-stone-300 text-fire focus:ring-orange-300 h-3.5 w-3.5"
                    />
                    Use shipping address as billing address
                  </label>

                  {!form?.shipping_to_billing && (
                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                      <p className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider">
                        Billing Address
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" name="billing_first_name" placeholder="First Name" value={form?.billing_first_name || ""} onChange={handleChange} required className={inputCls} />
                        <input type="text" name="billing_last_name" placeholder="Last Name" value={form?.billing_last_name || ""} onChange={handleChange} required className={inputCls} />
                      </div>
                      <input type="text" name="billing_address" placeholder="Address" value={form?.billing_address || ""} onChange={handleChange} required className={inputCls} />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" name="billing_zip_code" placeholder="Postal code" value={form?.billing_zip_code || ""} onChange={handleChange} required className={inputCls} />
                        <AutoInput name="billing_country" placeholder="Country" value={form?.billing_country} onChange={handleChange} required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <AutoInput name="billing_city" placeholder="City" value={form?.billing_city} onChange={handleChange} required />
                        <AutoInput name="billing_province" placeholder="State" value={form?.billing_province} onChange={handleChange} required />
                      </div>
                      <input type="text" name="billing_phone" placeholder="Phone" value={form?.billing_phone || ""} onChange={handleChange} required className={inputCls} />
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!cartItems?.length}
                  className="w-full py-3.5 bg-fire hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Complete Payment
                </button>
              </form>
            )}
          </div>

          {/* ── Col 2: Order Summary ── */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6">
            {!loading && (
              <div className={cardCls}>
                <p className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider mb-4">
                  Order Summary
                </p>
                <ItemsList items={cartItems} />
                <ComputationSection data={cartTotal} items={cartItems} />
              </div>
            )}
            <OrderQuerySection reference_number={ref_number} />
          </div>

        </div>

      </div>

      <style jsx>{`
        :global(.braintree-placeholder) { display: none !important; }
        :global(.braintree-sheet__container.braintree-sheet--active) { margin: 0px; }
      `}</style>
    </div>
  );
}

export default CheckoutComponent;
