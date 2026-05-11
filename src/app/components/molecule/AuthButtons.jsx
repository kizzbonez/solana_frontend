import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BASE_URL } from "@/app/lib/helpers";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import LoginForm from "@/app/components/form/Login";

const LoginModal = ({ isOpen, setOpen }) => {
  const handleSuccessLogin = (data) => {
    setOpen(false);
  };
  return (
    <Dialog open={isOpen} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto overflow-x-hidden">
        <div className="w-screen h-full relative">
          <div className="absolute top-10 left-0 right-0 flex items-end justify-center md:p-4 text-center sm:items-center sm:p-[10px]">
            <DialogPanel
              transition
              className="w-full relative transform overflow-hidden bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-[500px] data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 overflow-y-auto rounded-lg"
            >
              <div className=" flex items-center justify-center p-5">
                <LoginForm successLogin={handleSuccessLogin} />
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

function AuthButtons({ uiVersion = 1 }) {
  const [openLogin, setOpenLogin] = useState(false);

  if (uiVersion === 2) {
    return (
      <>
        <div>
          <button
            type="button"
            onClick={() => setOpenLogin(true)}
            className=" text-xs font-semibold underline"
          >
            Sign In
          </button>
          <span className="text-xs font-light">{" "}OR{" "}</span>
          <Link
            href={`${BASE_URL}/login`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-theme-600 hover:text-theme-700 text-xs font-semibold underline"
          >
            No account yet? Register here!
          </Link>
        </div>
        <LoginModal isOpen={openLogin} setOpen={setOpenLogin} />
      </>
    );
  }

  // uiVersion 1 is used in checkout page
  return (
    <>
      <div className="w-full flex flex-col gap-[20px] items-center">
        <button
          type="button"
          onClick={() => setOpenLogin(true)}
          className="w-full text-fire border border-fire rounded-xl p-3 text-xs font-semibold"
        >
          Sign In
        </button>
        <Link
          href={`${BASE_URL}/login`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-theme-600 hover:text-theme-700 text-xs font-semibold"
        >
          No account yet? Register here!
        </Link>
      </div>
      <LoginModal isOpen={openLogin} setOpen={setOpenLogin} />
    </>
  );
}

export default AuthButtons;
