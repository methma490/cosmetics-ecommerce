import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, ShieldCheck, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Thank you for joining our beauty circle.");
    setEmail("");
  };

  return (
    <footer className="bg-[#252223] text-[#FAF8F3] pt-16 pb-12 border-t border-[#E8DADD]/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif-luxury text-2xl tracking-[0.25em] text-white">
                AURA
              </span>
              <span className="block text-[9px] uppercase tracking-[0.4em] text-[#F3D6DE] font-light">
                Botanical Luxury
              </span>
            </Link>
            <p className="text-xs text-[#FAF8F3]/70 leading-relaxed max-w-sm">
              Crafting mindful, high-performance skincare and cosmetic rituals with pure botanicals, certified actives, and timeless elegance.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-[#F3D6DE]">
              <MessageCircle className="w-4 h-4 text-[#C85C7A]" />
              <span>WhatsApp Concierge: +94 77 123 4567</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury text-sm font-semibold tracking-wider text-white">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F3]/70">
              <li>
                <Link to="/shop?category=skincare" className="hover:text-[#F3D6DE] transition-colors">
                  Skincare
                </Link>
              </li>
              <li>
                <Link to="/shop?category=makeup" className="hover:text-[#F3D6DE] transition-colors">
                  Makeup
                </Link>
              </li>
              <li>
                <Link to="/shop?category=fragrance" className="hover:text-[#F3D6DE] transition-colors">
                  Fragrances
                </Link>
              </li>
              <li>
                <Link to="/shop?category=hair-care" className="hover:text-[#F3D6DE] transition-colors">
                  Hair Care
                </Link>
              </li>
              <li>
                <Link to="/shop?category=body-care" className="hover:text-[#F3D6DE] transition-colors">
                  Body Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury text-sm font-semibold tracking-wider text-white">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F3]/70">
              <li>
                <Link to="/account" className="hover:text-[#F3D6DE] transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#F3D6DE] transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <span className="text-[#FAF8F3]/50">Islandwide Express Shipping</span>
              </li>
              <li>
                <span className="text-[#FAF8F3]/50">PayHere Sandbox Verified</span>
              </li>
              <li>
                <span className="text-[#FAF8F3]/50">WhatsApp Order Checkout</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury text-sm font-semibold tracking-wider text-white">
              Rituals & Musings
            </h4>
            <p className="text-xs text-[#FAF8F3]/70 leading-relaxed">
              Receive private invitations, seasonal previews, and mindful beauty wisdom.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3.5 py-2.5 rounded-full bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/40 focus:outline-hidden focus:border-[#F3D6DE]"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 rounded-full bg-[#C85C7A] text-white hover:bg-[#A84462] transition-colors flex items-center justify-center"
                  title="Subscribe"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#FAF8F3]/50 gap-4">
          <p>© {new Date().getFullYear()} AURA Cosmetics. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C85C7A]" />
              <span>Secure PayHere & WhatsApp Checkout</span>
            </div>
            <span>•</span>
            <span>Crafted with pure care</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
