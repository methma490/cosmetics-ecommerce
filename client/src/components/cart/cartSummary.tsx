import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatPrice";
import { ShieldCheck, Truck, ArrowRight } from "lucide-react";

interface CartSummaryProps {
  onCheckoutClick?: () => void;
  showCheckoutBtn?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  onCheckoutClick,
  showCheckoutBtn = true,
}) => {
  const { subtotal, shippingFee, total, items } = useCart();

  const FREE_SHIPPING_THRESHOLD = 15000;
  const progressToFreeShipping = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100
  );
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="bg-white rounded-xl border border-[#E8DADD] p-6 shadow-xs">
      <h3 className="font-serif-luxury text-lg text-[#252223] pb-4 border-b border-[#E8DADD]/60">
        Order Summary
      </h3>

      {/* Free Shipping Progress bar */}
      <div className="py-4 border-b border-[#E8DADD]/60">
        {remainingForFreeShipping > 0 ? (
          <p className="text-xs text-[#756D70] mb-2">
            Add{" "}
            <span className="font-semibold text-[#C85C7A]">
              {formatPrice(remainingForFreeShipping)}
            </span>{" "}
            more to enjoy <strong className="text-[#252223]">Free Delivery</strong>.
          </p>
        ) : (
          <p className="text-xs text-[#56805D] font-medium mb-2 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            Congratulations! You have unlocked Free Delivery.
          </p>
        )}
        <div className="w-full h-1.5 bg-[#FBECEF] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C85C7A] transition-all duration-500 rounded-full"
            style={{ width: `${progressToFreeShipping}%` }}
          />
        </div>
      </div>

      {/* Cost Rows */}
      <div className="py-4 space-y-2.5 text-sm text-[#756D70] border-b border-[#E8DADD]/60">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-[#252223]">
            {formatPrice(subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Shipping</span>
          <span className="font-medium text-[#252223]">
            {shippingFee === 0 ? (
              <span className="text-[#56805D]">Free</span>
            ) : (
              formatPrice(shippingFee)
            )}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="pt-4 pb-6 flex justify-between items-baseline">
        <div>
          <span className="text-base font-medium text-[#252223]">Estimated Total</span>
          <p className="text-[11px] text-[#756D70]">Taxes and duties included</p>
        </div>
        <span className="font-serif-luxury text-xl font-bold text-[#C85C7A]">
          {formatPrice(total)}
        </span>
      </div>

      {/* Checkout Action */}
      {showCheckoutBtn && (
        <div>
          <Link
            to="/checkout"
            onClick={onCheckoutClick}
            className={`w-full py-3.5 px-6 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
              items.length === 0
                ? "bg-[#E8DADD] text-[#756D70] pointer-events-none cursor-not-allowed"
                : "bg-[#C85C7A] text-white hover:bg-[#A84462] hover:shadow-md cursor-pointer"
            }`}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Assurance Icons */}
      <div className="mt-6 pt-4 border-t border-[#E8DADD]/40 flex items-center justify-center gap-4 text-[11px] text-[#756D70]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#56805D]" />
          <span>100% Authentic</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-[#C85C7A]" />
          <span>Islandwide Delivery</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
