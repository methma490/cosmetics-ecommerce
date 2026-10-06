import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { useCart } from "../../context/CartContext";
import CartItem from "../../components/cart/cartItem";
import CartSummary from "../../components/cart/cartSummary";

export const CartPage: React.FC = () => {
  const { items, itemCount, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6 bg-[#FFF9F5]">
        <div className="w-20 h-20 rounded-3xl bg-[#F7EFE9] border border-[#D4AF37]/40 text-[#B87D4B] flex items-center justify-center mx-auto shadow-xs">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#211A1C]">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-[#7D7275] max-w-md mx-auto font-light leading-relaxed">
          Your botanical self-care journey awaits. Explore our collection of clean cosmetics, potent serums, and artisanal perfumes.
        </p>
        <div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#B87D4B] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#9E6536] transition-colors shadow-sm border border-[#D4AF37]/40"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 bg-[#FFF9F5]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-6 border-b border-[#F0DFD8] gap-4">
        <div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#211A1C]">
            Shopping Bag
          </h1>
          <p className="text-xs text-[#7D7275] mt-1">
            You have selected <strong className="text-[#211A1C]">{itemCount}</strong> exquisite formulations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/shop"
            className="text-xs font-medium text-[#7D7275] hover:text-[#B87D4B] flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-medium text-[#B33A3A] hover:underline flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear Bag</span>
          </button>
        </div>
      </div>

      {/* Bag Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Items list */}
        <div className="lg:col-span-7 bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] p-6 shadow-xs divide-y divide-[#F0DFD8]">
          {items.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-5 sticky top-28">
          <CartSummary />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
