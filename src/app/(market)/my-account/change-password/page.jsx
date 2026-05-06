"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/auth";
import { isValidPassword } from "@/app/lib/helpers";

const inputClass =
  "w-full px-3.5 py-2.5 pr-11 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-charcoal dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-fire focus:ring-2 focus:ring-fire/20 transition-colors";

const labelClass =
  "block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5";

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

const PasswordField = ({ id, name, label, value, onChange, show, onToggle }) => (
  <div>
    <label htmlFor={id} className={labelClass}>
      {label} <span className="text-fire">*</span>
    </label>
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        required
        className={inputClass}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
      >
        <EyeIcon open={show} />
      </button>
    </div>
  </div>
);

export default function ChangePasswordPage() {
  const { isLoggedIn, changePassword } = useAuth();
  const [form, setForm] = useState({ old_password: "", new_password: "", new_password2: "" });
  const [notif, setNotif] = useState({ status: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({ old: false, new: false, confirm: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShow = (field) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotif({ status: "", message: "" });

    const validatePassword = isValidPassword(form.new_password);
    if (!validatePassword?.valid) {
      setNotif({ status: "error", message: validatePassword.message });
      return;
    }

    if (form.new_password.trim() !== form.new_password2.trim()) {
      setNotif({ status: "error", message: "New passwords don't match." });
      return;
    }

    setLoading(true);
    try {
      const response = await changePassword(form);
      const data = await response.json();

      if (!response.ok) {
        const field = Object.keys(data)[0];
        const msg = Array.isArray(data[field]) ? data[field][0] : data[field];
        setNotif({ status: "error", message: msg || "Something went wrong." });
        return;
      }

      setNotif({ status: "success", message: "Password updated successfully." });
      setForm({ old_password: "", new_password: "", new_password2: "" });
    } catch {
      setNotif({ status: "error", message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 sm:p-8">
      <h2 className="text-lg font-bold text-charcoal dark:text-white tracking-tight mb-1">
        Change Password
      </h2>
      <p className="text-sm text-stone-500 dark:text-stone-400 mb-7">
        Choose a strong password you haven't used before.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-sm">
        <PasswordField
          id="old_password"
          name="old_password"
          label="Current password"
          value={form.old_password}
          onChange={handleChange}
          show={show.old}
          onToggle={() => toggleShow("old")}
        />
        <PasswordField
          id="new_password"
          name="new_password"
          label="New password"
          value={form.new_password}
          onChange={handleChange}
          show={show.new}
          onToggle={() => toggleShow("new")}
        />
        <PasswordField
          id="new_password2"
          name="new_password2"
          label="Confirm new password"
          value={form.new_password2}
          onChange={handleChange}
          show={show.confirm}
          onToggle={() => toggleShow("confirm")}
        />

        {notif.message && (
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
            <p
              className={`text-xs font-medium ${
                notif.status === "success"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {notif.message}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-fire hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}
