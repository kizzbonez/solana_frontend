"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useAuth } from "@/app/context/auth";
import { getProductsByIds, getReviewsByProductId } from "@/app/lib/api";
import { BASE_URL, createSlug, formatPrice } from "@/app/lib/helpers";
import AddToCartButtonWrap from "@/app/components/atom/AddToCartButtonWrap";
import { CartIcon } from "@/app/components/icons/lib";
import { Rating } from "@smastrom/react-rating";
import { useCart } from "@/app/context/cart";
import { STORE_CONTACT } from "@/app/lib/store_constants";

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusConfig = {
  pending:   { bg: "bg-yellow-50 dark:bg-yellow-900/20",   text: "text-yellow-700 dark:text-yellow-400",   label: "Pending"   },
  paid:      { bg: "bg-green-50 dark:bg-green-900/20",     text: "text-green-700 dark:text-green-400",     label: "Paid"      },
  shipped:   { bg: "bg-sky-50 dark:bg-sky-900/20",         text: "text-sky-700 dark:text-sky-400",         label: "Shipped"   },
  delivered: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", label: "Delivered" },
  cancelled: { bg: "bg-red-50 dark:bg-red-900/20",         text: "text-red-700 dark:text-red-400",         label: "Cancelled" },
  refunded:  { bg: "bg-stone-100 dark:bg-stone-800",       text: "text-stone-600 dark:text-stone-400",     label: "Refunded"  },
};

const VALID_STATUSES = Object.keys(statusConfig);

const OrderStatusBadge = ({ status }) => {
  const config = statusConfig[status];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// ─── Skeletons ────────────────────────────────────────────────────────────────

const OrderSkeleton = () => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-5 w-20 bg-stone-200 dark:bg-stone-700 rounded-full" />
      <div className="h-4 w-32 bg-stone-200 dark:bg-stone-700 rounded-full" />
    </div>
    <div className="flex gap-4 pt-4 border-t border-stone-100 dark:border-stone-800">
      <div className="w-20 h-20 bg-stone-200 dark:bg-stone-700 rounded-xl flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2.5 py-1">
        <div className="h-3.5 w-full bg-stone-200 dark:bg-stone-700 rounded-full" />
        <div className="h-3.5 w-2/3 bg-stone-200 dark:bg-stone-700 rounded-full" />
        <div className="h-3 w-24 bg-stone-200 dark:bg-stone-700 rounded-full mt-1" />
      </div>
    </div>
  </div>
);

// ─── Review form modal ────────────────────────────────────────────────────────

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-charcoal dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-fire focus:ring-2 focus:ring-fire/20 transition-colors";

const labelClass = "block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5";

const ReviewForm = ({ product, onClose, initForm, action }) => {
  const { user, userReviewCreate, userReviewUpdate } = useAuth();
  const [toggle, setToggle] = useState(false);
  const inputRef = useRef(null);
  const [form, setForm] = useState({
    id: null,
    product: product?.product_id,
    rating: 4,
    title: "Good value for the price",
    comment: "A few scratches on the exterior but nothing major. Still a great deal for the price.",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = action === "update"
        ? await userReviewUpdate(form)
        : await userReviewCreate(form);
      const data = await response.json();
      if (!response?.ok) {
        console.warn("[ReviewForm] submission failed", data);
        return;
      }
      setToggle(false);
    } catch (err) {
      console.warn("[ReviewForm]", err);
    } finally {
      setLoading(false);
    }
  };

  const productImage = useMemo(() => {
    if (!product?.images?.length) return null;
    return product.images.find((img) => img?.position === 1)?.src ?? null;
  }, [product]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    setToggle(!!product);
    if (product?.product_id)
      setForm((prev) => ({ ...prev, product: product.product_id }));
  }, [product]);

  useEffect(() => {
    setForm((prev) => ({ ...initForm } || { ...prev, rating: 3, title: "", comment: "", id: null }));
  }, [initForm, user]);

  return (
    <Dialog open={toggle} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/40 dark:bg-black/60 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-lg relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-charcoal dark:text-white">Write a Review</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Product preview */}
              <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-xl mb-5">
                <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-white dark:bg-stone-700">
                  {productImage && (
                    <Image
                      src={productImage}
                      alt={createSlug(product?.title || "")}
                      fill
                      className="object-contain"
                      sizes="56px"
                    />
                  )}
                </div>
                <p className="text-xs font-semibold text-charcoal dark:text-white line-clamp-2">
                  {product?.title}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className={labelClass}>Rating <span className="text-fire">*</span></label>
                  <Rating
                    value={form?.rating || 3}
                    onChange={(val) => handleChange({ target: { name: "rating", value: val } })}
                    style={{ maxWidth: 140 }}
                  />
                </div>

                <div>
                  <label className={labelClass}>Title <span className="text-fire">*</span></label>
                  <input
                    ref={inputRef}
                    name="title"
                    value={form?.title || ""}
                    onChange={handleChange}
                    required
                    placeholder="Summarise your experience"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Comment <span className="text-fire">*</span></label>
                  <textarea
                    name="comment"
                    value={form?.comment || ""}
                    onChange={handleChange}
                    rows={4}
                    required
                    placeholder="Tell others what you think…"
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="text-xs font-semibold text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-fire hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting…" : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

// ─── Review button ────────────────────────────────────────────────────────────

const ReviewButton = ({ product, toggleForm }) => {
  const { loading, user } = useAuth();
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    const product_id = product?.product_id;
    if (!product_id || loading) return;

    const fetchReviews = async () => {
      const response = await getReviewsByProductId(product_id);
      if (!response?.ok) { setUserReview(null); return; }
      const data = await response.json();
      const found = data?.results?.find((r) => r?.user?.email === user?.email);
      if (found) {
        setUserReview({ product: found.product?.id, rating: found.rating, title: found.title, comment: found.comment, id: found.id });
      }
    };

    fetchReviews();
  }, [product, user, loading]);

  const sharedClass =
    "px-3 py-1.5 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:border-fire hover:text-fire dark:hover:text-orange-400 rounded-lg transition-colors";

  if (!userReview)
    return (
      <button onClick={() => toggleForm({ action: "create", form: null, product })} className={sharedClass}>
        Write Review
      </button>
    );

  return (
    <button onClick={() => toggleForm({ action: "update", form: userReview, product })} className={sharedClass}>
      Edit Review
    </button>
  );
};

// ─── Orders page ──────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { addToCartLoading } = useCart();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [products, setProducts] = useState([]);
  const { loading, isLoggedIn, user, userOrdersGet } = useAuth();
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState(null);
  const [reviewAction, setReviewAction] = useState("create");

  const handleToggleForm = ({ action, form, product }) => {
    setReviewAction(action);
    setReviewProduct(product);
    setReviewForm(form);
  };

  const handleCloseReviewForm = () => {
    setReviewAction("create");
    setReviewProduct(null);
    setReviewForm(null);
  };

  const mergedOrders = useMemo(() => {
    if (products.length === 0 || orders.length === 0) return null;
    return orders.map((order) => ({
      ...order,
      items: order.items.map((item) => {
        const product = products.find((p) => p.product_id == item.product_id) || null;
        const img = product?.images?.find(({ position }) => position == 1)?.src || null;
        const url = `${BASE_URL}/${createSlug(product?.brand)}/product/${product?.handle}`;
        const compare_at_price = product?.variants?.[0]?.compare_at_price;
        return { ...item, title: product?.title, image: img, url, compare_at_price, product };
      }),
    }));
  }, [products, orders]);

  useEffect(() => {
    if (loading || !user) return;
    const getOrders = async () => {
      const _orders = await userOrdersGet();
      if (_orders.length === 0) setLoadingOrders(false);
      setOrders(_orders);
    };
    getOrders();
  }, [loading, user]);

  useEffect(() => {
    if (!orders || orders.length === 0) return;
    const productIds = [...new Set(orders.flatMap((o) => o.items.map((i) => i.product_id)))];
    const fetchRelatedProducts = async () => {
      try {
        const response = await getProductsByIds(productIds);
        if (!response?.ok) { setProducts(null); return; }
        const { data } = await response.json();
        setProducts(data);
      } catch {
        // silent
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchRelatedProducts();
  }, [orders]);

  if (!isLoggedIn) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-sm font-bold text-charcoal dark:text-white">My Orders</h2>
        <Link
          prefetch={false}
          href={`tel:${STORE_CONTACT}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-fire hover:text-orange-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
          Need help? {STORE_CONTACT}
        </Link>
      </div>

      {/* Loading */}
      {loadingOrders && (
        <div className="flex flex-col gap-3">
          <OrderSkeleton />
          <OrderSkeleton />
        </div>
      )}

      {/* Empty state */}
      {!loadingOrders && !mergedOrders && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 py-16 flex flex-col items-center text-center px-4">
          <span className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-800 flex items-center justify-center text-stone-300 dark:text-stone-600 mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </span>
          <p className="text-sm font-semibold text-charcoal dark:text-white mb-1">No orders yet</p>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            You haven't placed any orders so far.
          </p>
        </div>
      )}

      {/* Order list */}
      {!loadingOrders && mergedOrders && mergedOrders.length > 0 && (
        <div className="flex flex-col gap-4">
          {mergedOrders.map((order) => (
            <div
              key={`order-${order?.order_number}`}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden"
            >
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <OrderStatusBadge status={order?.status} />
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    Order <span className="font-bold text-charcoal dark:text-white">#{order?.order_number}</span>
                  </span>
                </div>
                <span className="text-xs font-bold text-charcoal dark:text-white">
                  ${formatPrice(order?.total_price)}
                </span>
              </div>

              {/* Order items */}
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {order?.items?.map((item) => (
                  <div
                    key={`${order?.order_number}-item-${item.product_id}`}
                    className="flex gap-4 p-5"
                  >
                    {/* Image */}
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-stone-50 dark:bg-stone-800">
                      {item?.image && (
                        <Image
                          src={item.image}
                          alt={createSlug(item?.title || "")}
                          fill
                          className="object-contain"
                          sizes="80px"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                        <p className="text-sm font-semibold text-charcoal dark:text-white line-clamp-2 leading-snug">
                          {item?.title}
                        </p>
                        <div className="flex flex-col items-start sm:items-end flex-shrink-0">
                          <span className="text-sm font-bold text-charcoal dark:text-white">
                            ${formatPrice(parseFloat(item?.price) * item?.quantity)}
                          </span>
                          {item?.compare_at_price && item.compare_at_price !== "0" && item.compare_at_price > 0 && (
                            <span className="text-xs text-stone-400 line-through">
                              ${formatPrice(item.compare_at_price * item?.quantity)}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-stone-400 dark:text-stone-500">Qty: {item?.quantity}</p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-auto pt-1 flex-wrap">
                        {order?.status === "delivered" && (
                          <ReviewButton product={item?.product} toggleForm={handleToggleForm} />
                        )}
                        {["delivered", "cancelled", "refunded"].includes(order?.status) && (
                          <AddToCartButtonWrap product={item?.product}>
                            <button
                              disabled={addToCartLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-fire hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <CartIcon />
                              Buy Again
                            </button>
                          </AddToCartButtonWrap>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ReviewForm
        product={reviewProduct}
        onClose={handleCloseReviewForm}
        initForm={reviewForm}
        action={reviewAction}
      />
    </div>
  );
}
