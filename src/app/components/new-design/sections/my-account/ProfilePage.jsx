"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/auth";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-charcoal dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-fire focus:ring-2 focus:ring-fire/20 transition-colors";

const labelClass = "block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5";

const InputField = ({ label, name, value, onChange, type = "text", required = true }) => (
  <div>
    <label className={labelClass}>
      {label} {required && <span className="text-fire">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={inputClass}
    />
  </div>
);

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-stone-100 dark:border-stone-800">
    <span className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 flex-shrink-0">
      {icon}
    </span>
    <h3 className="text-sm font-bold text-charcoal dark:text-white">{title}</h3>
  </div>
);

export default function ProfilePage() {
  const { isLoggedIn, user, updateProfile } = useAuth();
  const [form, setForm] = useState(user || {});
  const [notif, setNotif] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(user);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const rootFields = ["first_name", "last_name"];
    setForm((prev) => {
      if (!prev) return prev;
      return rootFields.includes(name)
        ? { ...prev, [name]: value }
        : { ...prev, profile: { ...prev.profile, [name]: value } };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotif(null);
    setLoading(true);
    try {
      const response = await updateProfile(form);
      if (!response?.ok) {
        setNotif({ status: "error", message: "Not saved. Something went wrong." });
        return;
      }
      setNotif({ status: "success", message: "Profile updated successfully." });
    } catch (err) {
      setNotif({ status: "error", message: err?.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn && !user) return null;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 sm:p-8">
      <h2 className="text-lg font-bold text-charcoal dark:text-white tracking-tight mb-1">
        Profile
      </h2>
      <p className="text-sm text-stone-500 dark:text-stone-400 mb-7">
        Manage your personal info and address book.
      </p>

      {form && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Personal info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField
              label="First Name"
              name="first_name"
              value={form?.first_name || ""}
              onChange={handleChange}
            />
            <InputField
              label="Last Name"
              name="last_name"
              value={form?.last_name || ""}
              onChange={handleChange}
            />
            <InputField
              label="Phone"
              name="phone"
              type="tel"
              value={form?.profile?.phone || ""}
              onChange={handleChange}
            />
          </div>

          {/* Billing & Shipping */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Billing */}
            <div>
              <SectionHeader
                title="Billing Address"
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                }
              />
              <div className="flex flex-col gap-4">
                <InputField label="Address" name="billing_address" value={form?.profile?.billing_address || ""} onChange={handleChange} />
                <InputField label="Country" name="billing_country" value={form?.profile?.billing_country || ""} onChange={handleChange} />
                <InputField label="City" name="billing_city" value={form?.profile?.billing_city || ""} onChange={handleChange} />
                <InputField label="State" name="billing_state" value={form?.profile?.billing_state || ""} onChange={handleChange} />
                <InputField label="Zip Code" name="billing_zip" value={form?.profile?.billing_zip || ""} onChange={handleChange} />
              </div>
            </div>

            {/* Shipping */}
            <div>
              <SectionHeader
                title="Shipping Address"
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                }
              />
              <div className="flex flex-col gap-4">
                <InputField label="Address" name="shipping_address" value={form?.profile?.shipping_address || ""} onChange={handleChange} />
                <InputField label="Country" name="shipping_country" value={form?.profile?.shipping_country || ""} onChange={handleChange} />
                <InputField label="City" name="shipping_city" value={form?.profile?.shipping_city || ""} onChange={handleChange} />
                <InputField label="State" name="shipping_state" value={form?.profile?.shipping_state || ""} onChange={handleChange} />
                <InputField label="Zip Code" name="shipping_zip" value={form?.profile?.shipping_zip || ""} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Notification + Submit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            {notif ? (
              <div
                className={`flex items-start gap-2.5 px-3.5 py-3 rounded-lg border ${
                  notif.status === "success"
                    ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50"
                    : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50"
                }`}
              >
                {notif.status === "success" ? (
                  <svg className="w-4 h-4 text-green-500 shrink-0 mt-px" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-500 shrink-0 mt-px" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                )}
                <p className={`text-xs font-medium ${notif.status === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {notif.message}
                </p>
              </div>
            ) : (
              <div />
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-fire hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed sm:flex-shrink-0"
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
