import React from "react";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import CartItem from "./cartItem";
import { formatPrice } from "../../utils/formatPrice";

export const CartDrawer: React.FC = () => {
  const { isCartOpen, closeCart, items, itemCount, subtotal, shippingFee, total } =
    useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#E8DADD]">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E8DADD]/60 flex items-center justify-between bg-[#FAF8F3]/60">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#C85C7A]" />
              <h2 className="font-serif-luxury text-lg font-medium text-[#252223]">
                Shopping Bag ({itemCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 rounded-full hover:bg-[#FBECEF] text-[#756D70] hover:text-[#252223] transition-colors"
              title="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-[#E8DADD]/30">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-full bg-[#FBECEF] flex items-center justify-center mb-4 text-[#C85C7A]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif-luxury text-lg text-[#252223] mb-1">
                  Your bag is empty
                </h3>
                <p className="text-xs text-[#756D70] max-w-xs mb-6">
                  Discover our curated botanical formulations and find your new everyday ritual.
                </p>
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="px-6 py-2.5 rounded-full bg-[#C85C7A] text-white text-xs font-medium hover:bg-[#A84462] transition-colors shadow-xs"
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
            <div className="p-6 border-t border-[#E8DADD] bg-[#FAF8F3]/40 space-y-3">
              <div className="space-y-1.5 text-xs text-[#756D70]">
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
                <div className="flex justify-between text-sm pt-2 border-t border-[#E8DADD]/40 font-semibold text-[#252223]">
                  <span>Total</span>
                  <span className="text-[#C85C7A]">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2.5">
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="w-full py-3 px-4 rounded-full border border-[#C85C7A] text-[#C85C7A] text-xs font-semibold hover:bg-[#FBECEF] text-center transition-colors"
                >
                  View Bag
                </Link>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full py-3 px-4 rounded-full bg-[#C85C7A] text-white text-xs font-semibold hover:bg-[#A84462] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
