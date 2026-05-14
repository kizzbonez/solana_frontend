"use client";
import React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Eos3DotsLoading } from "@/app/components/icons/lib";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import GuestModal from "@/app/components/new-design/ui/GuestModal";
import Image from "next/image";
import Link from "next/link";
import {
  BASE_URL,
  createSlug,
  formatPrice,
  parseRatingCount,
} from "@/app/lib/helpers";

function GuestEmailCaptureDialog() {
  const pathname = usePathname();
  const pathname_exclusion = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/cart",
    "/checkout",
    "/payment_success",
  ];
  const initial_info = {
    billing_first_name: null,
    billing_last_name: null,
    billing_email: null,
    billing_phone: null,
    billing_address: null,
    billing_city: null,
    billing_province: null,
    billing_zip_code: null,
    billing_country: null,
    shipping_first_name: null,
    shipping_last_name: null,
    shipping_email: null,
    shipping_phone: null,
    shipping_address: null,
    shipping_city: null,
    shipping_province: null,
    shipping_zip_code: null,
    shipping_country: null,
    notes: null,
    shipping_to_billing: true,
    store_domain: "https://www.solanafireplaces.com",
  };
  const router = useRouter();
  const [toggle, setToggle] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [forage, setForage] = useState(null);
  const [infoEmail, setInfoEmail] = useState(null);

  const handleLinkRedirect = (e) => {
    e.preventDefault();
    if (loading) return; // prevents redirecting when saving email is processing
    const link = e.target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href) return;
    router.push(href);
    setToggle(false);
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setEmail(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!forage) {
      console.warn("[forage]", `value is ${forage}`);
      return;
    }
    setLoading(true);

    try {
      await forage.setItem("checkout_info", {
        ...initial_info,
        billing_email: email,
        shipping_email: email,
      });
      setInfoEmail(email);
      setToggle(false);
    } catch (err) {
      console.warn("[forage]", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;

    import("@/app/lib/localForage").then(async (module) => {
      if (!mounted) return;
      const info = await module.getItem("checkout_info");
      setInfoEmail(info?.billing_email || null);
      setForage(module);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const handleClose = () => {
    if (!infoEmail) {
      sessionStorage.setItem("guest_dialog_dismissed", "1");
    }
    setToggle(false);
  };

  useEffect(() => {
    const handler = () => {
      const dismissed = sessionStorage.getItem("guest_dialog_dismissed");
      if (!infoEmail && !dismissed && !pathname_exclusion.includes(pathname)) {
        setToggle(true);
      }
    };
    window.addEventListener("guestEmailRequired", handler);
    return () => window.removeEventListener("guestEmailRequired", handler);
  }, [infoEmail, pathname]);

  return (
    <GuestModal isOpen={toggle} onClose={handleClose} />
    // <Dialog open={toggle} onClose={setToggle} className="relative z-10">
    //   <DialogBackdrop
    //     transition
    //     className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
    //   />

    //   <div className="fixed inset-0 z-10 w-screen overflow-y-auto overflow-x-hidden">
    //     <div className="w-screen h-full relative">
    //       <div className="absolute p-1  top-10 left-0 right-0 flex items-end justify-center md:p-4 text-center sm:items-center sm:p-[10px]">
    //         <DialogPanel
    //           transition
    //           className="w-full relative transform overflow-hidden bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-[800px] data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 overflow-y-auto rounded-lg"
    //         >
    //           <div className="flex flex-col sm:flex-row w-full overflow-hidden">
    //             <div className="w-full bg-neutral-300 flex items-center justify-center font-bold text-white relative">
    //               <Image
    //                 src={`/images/outdoor-kitchen-email-capture.webp`}
    //                 title={`Outdoor-Kitchen-Image`}
    //                 alt={`Outdoor-Kitchen-Image`}
    //                 fill
    //                 className="object-cover"
    //                 sizes="(max-width: 768px) 100vw, 300px"
    //               />
    //             </div>
    //             <div className="w-full p-3">
    //               <h2>Don’t lose your cart</h2>
    //               <p className="mt-5">
    //                 Enter your email to continue as a guest, or create an
    //                 account to save your cart across devices.
    //               </p>
    //               <div className="mt-5">
    //                 <form onSubmit={handleSubmit}>
    //                   <label htmlFor="email" className="text-xs font-bold">
    //                     <span className="text-red-600">*</span> Email
    //                   </label>
    //                   <div className="relative flex">
    //                     <input
    //                       name="email"
    //                       type="email"
    //                       placeholder="Email"
    //                       value={email || ""}
    //                       onChange={handleChange}
    //                       required
    //                       className="w-full px-4 py-2 border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
    //                     />
    //                     <button
    //                       disabled={loading}
    //                       className="relative w-[75px] h-[42px] flex items-center justify-center text-white bg-stone-800 hover:bg-stone-900 rounded-r"
    //                     >
    //                       <div
    //                         className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
    //                           loading === true ? "visible" : "invisible"
    //                         }`}
    //                       >
    //                         <Eos3DotsLoading width={50} height={50} />
    //                       </div>
    //                       <span
    //                         className={
    //                           loading === true ? "invisible" : "visible"
    //                         }
    //                       >
    //                         {/* flowbite:arrow-right-outline */}
    //                         <svg
    //                           className="h-5 w-5"
    //                           aria-hidden="true"
    //                           xmlns="http://www.w3.org/2000/svg"
    //                           fill="none"
    //                           viewBox="0 0 24 24"
    //                         >
    //                           <path
    //                             stroke="currentColor"
    //                             strokeLinecap="round"
    //                             strokeLinejoin="round"
    //                             strokeWidth="2"
    //                             d="M19 12H5m14 0-4 4m4-4-4-4"
    //                           />
    //                         </svg>
    //                       </span>
    //                     </button>
    //                   </div>
    //                 </form>
    //               </div>
    //               <div className="my-7 w-full relative flex items-center justify-center bg-white">
    //                 <div className="z-[10] font-light px-3 bg-white">OR</div>
    //                 <div className="border-t-[0.5px] border-dashed border-neutral-500 absolute top-1/2 -translate-y-1/2 w-full"></div>
    //               </div>
    //               <div className="mt-5 flex flex-col">
    //                 <Link
    //                   prefetch={false}
    //                   disabled={loading}
    //                   onClick={handleLinkRedirect}
    //                   href={`${BASE_URL}/login`}
    //                   className="text-center px-3 py-2 border-2 font-medium border-theme-600 bg-theme-600 text-white rounded hover:bg-theme-700 hover:shadow h-[44px] relative"
    //                 >
    //                   Signup
    //                 </Link>

    //                 <button
    //                   disabled={loading}
    //                   onClick={()=> setToggle(false)}
    //                   className="mt-5 text-center px-3 py-2 border-2 font-medium border-stone-600 bg-stone-600 text-white rounded hover:bg-stone-700 hover:shadow h-[44px] relative"
    //                 >
    //                   Continue Shopping
    //                 </button>
    //               </div>
    //             </div>
    //           </div>
    //         </DialogPanel>
    //       </div>
    //     </div>
    //   </div>
    // </Dialog>
  );
}

export default GuestEmailCaptureDialog;
