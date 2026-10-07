import React, { useEffect } from "react";
import { X, ShoppingBag, ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import CartItem from "./cartItem";
import { formatPrice } from "../../utils/formatPrice";
import { generateWhatsAppMessage } from "../../utils/generateWhatsAppMessage";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    closeCart,
    items,
    itemCount,
    subtotal,
    shippingFee,
    total,
    freeShippingThreshold,
  } = useCart();

  // Lock background scroll when shopping bag drawer is open
  useBodyScrollLock(isCartOpen);

  useEffect(() => {
    if (!isCartOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );
  const amountRemaining = Math.max(0, freeShippingThreshold - subtotal);

  const handleWhatsAppQuickOrder = () => {
    const formatted = items.map((i) => ({
      name: i.product.name,
      quantity: i.quantity,
      price: i.product.price,
    }));
    const text = generateWhatsAppMessage(formatted, subtotal, shippingFee, total);
    const waUrl = `https://wa.me/94743301490?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#211A1C]/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFFCFA] shadow-2xl flex flex-col border-l border-[#F0DFD8]">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#F0DFD8] flex items-center justify-between bg-[#FFF9F5]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#B87D4B]" />
              <h2 className="font-serif-luxury text-lg font-medium text-[#211A1C]">
                Shopping Bag ({itemCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 rounded-full hover:bg-[#F7EFE9] text-[#7D7275] hover:text-[#211A1C] transition-colors"
              title="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Progress Bar */}
          {items.length > 0 && (
            <div className="px-6 py-3.5 bg-[#FFF9F5]/70 border-b border-[#F0DFD8] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#211A1C] font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  {subtotal >= freeShippingThreshold ? (
                    <span className="text-[#56805D] font-semibold">Complimentary island-wide delivery unlocked!</span>
                  ) : (
                    <span>Add <strong className="text-[#B87D4B]">{formatPrice(amountRemaining)}</strong> for free delivery</span>
                  )}
                </span>
                <span className="text-[#8F6B00] font-bold text-[10px]">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#F0DFD8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B87D4B] transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-3 divide-y divide-[#F0DFD8]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-3xl bg-[#F7EFE9] border border-[#D4AF37]/30 flex items-center justify-center mb-4 text-[#B87D4B]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif-luxury text-lg text-[#211A1C] mb-1">
                  Your bag is empty
                </h3>
                <p className="text-xs text-[#7D7275] max-w-xs mb-6 font-light">
                  Explore our certified botanical formulations and begin your personal beauty ritual.
                </p>
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="px-6 py-3 rounded-full bg-[#B87D4B] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#9E6536] transition-colors shadow-sm"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <CartItem
                  key={item.product._id}
                  item={item}
                  onItemClick={closeCart}
                />
              ))
            )}
          </div>

          {/* Footer / Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#F0DFD8] bg-[#FFF9F5] space-y-3.5">
              <div className="space-y-1.5 text-xs text-[#7D7275]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#211A1C]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Courier Shipping</span>
                  <span className="font-medium text-[#211A1C]">
                    {shippingFee === 0 ? (
                      <span className="text-[#56805D] font-semibold">Free Express</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base pt-2.5 border-t border-[#F0DFD8] font-bold text-[#211A1C]">
                  <span>Total Due</span>
                  <span className="font-serif-luxury text-lg text-[#B87D4B]">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full py-3.5 px-4 rounded-full bg-[#B87D4B] hover:bg-[#9E6536] text-white text-xs font-semibold uppercase tracking-[0.16em] flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg border border-[#B87D4B]"
                >
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/cart"
                    onClick={closeCart}
                    className="py-2.5 px-3 rounded-full border border-[#F0DFD8] hover:border-[#D4AF37] text-[#211A1C] text-xs font-semibold text-center transition-colors bg-[#FFFCFA]"
                  >
                    View Bag
                  </Link>
                  <button
                    type="button"
                    onClick={handleWhatsAppQuickOrder}
                    className="py-2.5 px-3 rounded-full bg-[#56805D]/10 hover:bg-[#56805D]/20 text-[#56805D] border border-[#56805D]/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Order</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
