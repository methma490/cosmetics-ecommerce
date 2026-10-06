import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatPrice";
import { ShieldCheck, Truck, ArrowRight, Sparkles } from "lucide-react";

interface CartSummaryProps {
  onCheckoutClick?: () => void;
  showCheckoutBtn?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  onCheckoutClick,
  showCheckoutBtn = true,
}) => {
  const { subtotal, shippingFee, total, items } = useCart();

  const FREE_SHIPPING_THRESHOLD = 8000;
  const progressToFreeShipping = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] p-6 sm:p-7 shadow-xs space-y-4">
      <h3 className="font-serif-luxury text-xl text-[#211A1C] pb-4 border-b border-[#F0DFD8]">
        Order Summary
      </h3>

      {/* Free Shipping Progress bar */}
      <div className="py-2 border-b border-[#F0DFD8] space-y-2">
        {remainingForFreeShipping > 0 ? (
          <p className="text-xs text-[#7D7275]">
            Add{" "}
            <span className="font-semibold text-[#B87D4B]">
              {formatPrice(remainingForFreeShipping)}
            </span>{" "}
            more to unlock <strong className="text-[#211A1C]">Complimentary Express Delivery</strong>.
          </p>
        ) : (
          <p className="text-xs text-[#56805D] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Complimentary island-wide express delivery unlocked!</span>
          </p>
        )}
        <div className="w-full h-1.5 bg-[#F0DFD8] rounded-full overflow-hidden">
          <div
            className="h-full bg-gold-metallic transition-all duration-500 rounded-full"
            style={{ width: `${progressToFreeShipping}%` }}
          />
        </div>
      </div>

      {/* Cost Rows */}
      <div className="py-2 space-y-2.5 text-xs text-[#7D7275] border-b border-[#F0DFD8]">
        <div className="flex justify-between">
          <span>Catalog Subtotal</span>
          <span className="font-semibold text-[#211A1C]">
            {formatPrice(subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Island-wide Courier Shipping</span>
          <span className="font-semibold text-[#211A1C]">
            {shippingFee === 0 ? (
              <span className="text-[#56805D]">Free Express</span>
            ) : (
              formatPrice(shippingFee)
            )}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="pt-2 pb-4 flex justify-between items-baseline">
        <div>
          <span className="text-base font-medium text-[#211A1C]">Estimated Total</span>
          <p className="text-[10px] text-[#7D7275]">Taxes & luxury packaging included</p>
        </div>
        <span className="font-serif-luxury text-2xl font-bold text-[#B87D4B]">
          {formatPrice(total)}
        </span>
      </div>

      {/* Checkout Action */}
      {showCheckoutBtn && (
        <div className="pt-2">
          <Link
            to="/checkout"
            onClick={onCheckoutClick}
            className={`w-full py-4 px-6 rounded-full font-semibold text-xs uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-all shadow-md ${
              items.length === 0
                ? "bg-[#F0DFD8] text-[#7D7275] pointer-events-none cursor-not-allowed"
                : "bg-[#B87D4B] text-white hover:bg-[#9E6536] hover:shadow-lg cursor-pointer border border-[#B87D4B]"
            }`}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Security assurances */}
      <div className="pt-4 border-t border-[#F0DFD8] space-y-2 text-[11px] text-[#7D7275]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#8F6B00]" />
          <span>PayHere Sandbox verified with SHA-256/MD5 hashing</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#B87D4B]" />
          <span>Dispatched within 24 hours in sealed tamper-proof packaging</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
