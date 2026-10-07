import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Thank you for joining the AURA Atelier Circle.");
    setEmail("");
  };

  return (
    <footer className="bg-[#211A1C] text-[#FFFCFA] pt-20 pb-12 border-t border-[#D4AF37]/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block group">
              <span className="font-serif-luxury text-2xl tracking-[0.25em] text-[#FFFCFA] group-hover:text-[#FFF1A8] transition-colors">
                AURA
              </span>
              <span className="block text-[8px] uppercase tracking-[0.4em] text-[#D4AF37] font-semibold -mt-0.5">
                Haute Beauté
              </span>
            </Link>
            <p className="text-xs text-[#EADCD2] leading-relaxed max-w-sm font-light">
              Crafting mindful, high-performance skincare and cosmetic rituals with pure botanicals, certified clinical actives, and timeless luxury.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-[#FFF1A8]">
              <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
              <a 
                href="https://wa.me/94743301490" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline text-xs"
              >
                WhatsApp Concierge: +94 74 330 1490
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury text-sm font-semibold tracking-wider text-[#FFFCFA] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>Collections</span>
            </h4>
            <ul className="space-y-2 text-xs text-[#EADCD2] font-light">
              <li>
                <Link to="/shop?category=skincare" className="hover:text-[#FFF1A8] transition-colors">
                  Skincare Rituals
                </Link>
              </li>
              <li>
                <Link to="/shop?category=makeup" className="hover:text-[#FFF1A8] transition-colors">
                  Couture Makeup
                </Link>
              </li>
              <li>
                <Link to="/shop?category=fragrance" className="hover:text-[#FFF1A8] transition-colors">
                  Artisan Fragrances
                </Link>
              </li>
              <li>
                <Link to="/shop?category=hair-care" className="hover:text-[#FFF1A8] transition-colors">
                  Botanical Hair Care
                </Link>
              </li>
              <li>
                <Link to="/shop?category=body-care" className="hover:text-[#FFF1A8] transition-colors">
                  Nourishing Body Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury text-sm font-semibold tracking-wider text-[#FFFCFA]">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-[#EADCD2] font-light">
              <li>
                <Link to="/account" className="hover:text-[#FFF1A8] transition-colors">
                  Client Account & Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#FFF1A8] transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <span className="text-white/50">Islandwide Express Courier</span>
              </li>
              <li>
                <span className="text-white/50">PayHere Sandbox Verified</span>
              </li>
              <li>
                <span className="text-white/50">Instant WhatsApp Ordering</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury text-sm font-semibold tracking-wider text-[#FFFCFA]">
              Privé Atelier
            </h4>
            <p className="text-xs text-[#EADCD2] leading-relaxed font-light">
              Private invitations, seasonal previews, and mindful beauty wisdom delivered discreetly.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="methmagk@gmail.com"
                  className="w-full px-4 py-2.5 rounded-full bg-white/10 border border-[#D4AF37]/40 text-xs text-white placeholder:text-white/40 focus:outline-hidden focus:border-[#FFF1A8]"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3.5 rounded-full bg-[#B87D4B] text-white hover:bg-[#9E6536] transition-colors flex items-center justify-center border border-[#B87D4B]"
                  title="Subscribe"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
