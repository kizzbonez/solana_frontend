"use client";

const normalizeSpecValue = (key, value) => {
  let result = value;
  switch (key) {
    case "bbq.number_of_main_burners":
      result = `${value
        ?.toLowerCase()
        ?.replace("burners", "")
        .replace("burner", "")} burner/s`;
      break;
    case "bbq.product_weight":
    case "bbq.shipping_weight":
      const unit = " lbs.";

      let formattedWeight;

      if (value % 1 !== 0) {
        // If the number has a fractional part (e.g., 490.5)
        formattedWeight = new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2, // Force two decimal places
          maximumFractionDigits: 2,
        }).format(value);
      } else {
        // If the number is an integer (e.g., 490.0)
        formattedWeight = new Intl.NumberFormat("en-US", {
          maximumFractionDigits: 0, // No decimal places
        }).format(value);
      }
      result = formattedWeight + unit;
      break;
    default:
      result = value;
      break;
  }
  return result;
};

const ProductShippingInformation = ({ product }) => {
  const shippingInfo = product?.product_shipping_info;

  if (!shippingInfo || !Array.isArray(shippingInfo) || shippingInfo.length === 0)
    return null;

  return (
    <div className="my-5">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Shipping Information
      </h3>
      <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[1fr_3fr] gap-y-1 text-sm">
        {shippingInfo
          .filter(({ value }) => value !== "")
          .map((item, index) => (
            <div
              key={`shipping-item-${index}`}
              className="contents border-b py-2 transition duration-150 group"
            >
              <div className="text-xs sm:text-base font-bold text-neutral-800 group-hover:bg-theme-100 group-hover:border-theme-100 border-[transparent] py-1 border-b">
                {item?.label}:
              </div>
              <div className="text-xs sm:text-base sm:pl-5 font-semibold text-theme-700 group-hover:underline group-hover:bg-theme-100 group-hover:border-theme-100 border-[transparent] py-1 border-b">
                {normalizeSpecValue(item?.key, item?.value)}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ProductShippingInformation;
