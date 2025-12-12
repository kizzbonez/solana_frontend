"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { useCart } from "@/app/context/cart";
import { Eos3DotsLoading } from "../icons/lib";

const AddToCartWidget = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [ATCLoading, setATCLoading] = useState(false);

  const handleQuantityChange = (e) => {
    const { value } = e.target;
    setQuantity((prev) => {
      if (value === "") {
        return 0;
      } else {
        return parseInt(value);
      }
    });
  };

  const handleQuantityButtons = (direction) => {
    setQuantity((prev) => {
      let newQuantity = typeof prev === "number" ? prev : 0;
      if (direction === "inc") {
        newQuantity = newQuantity + 1;
      } else if (direction === "dec") {
        if (newQuantity > 1) {
          newQuantity = newQuantity - 1;
        }
      }
      return newQuantity;
    });
  };

  const handleAddToCart = async (item) => {
    setATCLoading(true);
    const response = await addToCart({ ...item, quantity: quantity });
    setATCLoading(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-5 items-center border-t border-neutral-200 py-[10px]">
      {/* QTY Section */}
      <div className="flex items-center gap-1 flex-col">
        <div className="font-bold text-base md:text-base text-stone-700">
          Quantity
        </div>
        <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden">
          <button
            onClick={() => handleQuantityButtons("dec")}
            type="button"
            id="decrement-button"
            data-input-counter-decrement="counter-input"
            className="inline-flex h-9 w-9 items-center justify-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
          >
            <svg
              className="h-3 w-3 text-gray-700"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 2"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h16"
              />
            </svg>
          </button>
          <input
            value={quantity}
            onChange={handleQuantityChange}
            readOnly
            min={1}
            type="text"
            id="counter-input"
            data-input-counter
            className="w-12 h-9 border-0 bg-transparent text-center text-base font-semibold text-gray-900 focus:outline-none focus:ring-0"
            placeholder=""
            required
          />
          <button
            onClick={() => handleQuantityButtons("inc")}
            type="button"
            id="increment-button"
            data-input-counter-increment="counter-input"
            className="inline-flex h-9 w-9 items-center justify-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
          >
            <svg
              className="h-3 w-3 text-gray-700"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 18"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 1v16M1 9h16"
              />
            </svg>
          </button>
        </div>
      </div>
      {/* Add to Cart Button */}
      <div className="font-bold text-white">
        <button
          className={`w-full md:w-auto bg-pallete-green hover:bg-green-700 transition-colors rounded-full py-3 px-8 shadow-md hover:shadow-lg ${
            ATCLoading ? "pointer-events-none relative" : "pointer-events-auto"
          }`}
          onClick={() => handleAddToCart(product)}
          disabled={ATCLoading}
        >
          {ATCLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Eos3DotsLoading width={48} height={48} />
            </div>
          )}
          <div
            className={`flex items-center justify-center gap-2 ${
              ATCLoading ? "opacity-0" : "opacity-100"
            }`}
          >
            <Icon
              icon="ph:shopping-cart-simple-bold"
              className="text-xl md:text-2xl"
            />
            <span className="font-bold uppercase text-base md:text-lg tracking-wide">
              add to cart
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AddToCartWidget;
