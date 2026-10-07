import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  LogOut,
  LayoutDashboard,
  Package,
  Loader2,
  ArrowRight,
  Phone,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../hooks/useCart";
import productService from "../../services/productService";
import type { Product } from "../../types/product";
import { formatPrice } from "../../utils/formatPrice";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import { useConfirm } from "../../hooks/useConfirm";
import toast from "react-hot-toast";

interface MegaMenuColumn {
  heading: string;
  items: { label: string; href: string }[];
}

interface MegaMenuConfig {
  id: string;
  label: string;
  columns: MegaMenuColumn[];
  featuredCard?: {
    tag: string;
    title: string;
    desc: string;
    image: string;
    href: string;
  };
}

const MEGA_MENUS: Record<string, MegaMenuConfig> = {
  women: {
    id: "women",
    label: "Women",
    columns: [
      {
        heading: "Face Care",
        items: [
          { label: "Day Cream", href: "/shop?search=Day%20Cream" },
          { label: "Night Cream", href: "/shop?search=Night%20Cream" },
          { label: "Fairness & Radiance", href: "/shop?search=Radiance" },
          { label: "Face Oils & Serums", href: "/shop?search=Serum" },
          { label: "Face Wash & Scrub", href: "/shop?search=Cleanser" },
          { label: "Cleansers & Toners", href: "/shop?search=Toner" },
          { label: "Face Packs & Masks", href: "/shop?search=Mask" },
          { label: "Exfoliators", href: "/shop?search=Exfoliator" },
          { label: "Moisturizers", href: "/shop?category=skincare" },
          { label: "Micellar Water", href: "/shop?search=Micellar" },
          { label: "Anti Ageing", href: "/shop?search=Anti%20Ageing" },
        ],
      },
      {
        heading: "Body Care",
        items: [
          { label: "Body Lotions", href: "/shop?category=body-care&search=Lotion" },
          { label: "Body Creams", href: "/shop?category=body-care&search=Cream" },
          { label: "Body Oils", href: "/shop?category=body-care&search=Oil" },
          { label: "Body Scrubs", href: "/shop?category=body-care&search=Scrub" },
          { label: "Body Wash & Shower Gel", href: "/shop?category=body-care&search=Wash" },
          { label: "Deodorants & Antiperspirants", href: "/shop?category=body-care&search=Deodorant" },
          { label: "Essential Oils", href: "/shop?category=body-care&search=Essential" },
        ],
      },
      {
        heading: "Hair Care",
        items: [
          { label: "Shampoo", href: "/shop?category=hair-care&search=Shampoo" },
          { label: "Conditioner", href: "/shop?category=hair-care&search=Conditioner" },
          { label: "Hair Cream & Lotion", href: "/shop?category=hair-care&search=Cream" },
          { label: "Hair Masks", href: "/shop?category=hair-care&search=Mask" },
          { label: "Hair Styling", href: "/shop?category=hair-care&search=Styling" },
          { label: "Treatments & Oils", href: "/shop?category=hair-care&search=Oil" },
          { label: "Accessories", href: "/shop?category=hair-care" },
        ],
      },
      {
        heading: "Toiletries & Rituals",
        items: [
          { label: "Bath & Shower", href: "/shop?search=Bath" },
          { label: "Soap & Cleansing Bars", href: "/shop?search=Soap" },
          { label: "Dental Care", href: "/shop?search=Dental" },
          { label: "Hand & Nail Creams", href: "/shop?search=Hand%20Cream" },
        ],
      },
    ],
    featuredCard: {
      tag: "Women's Atelier",
      title: "Botanical Radiance Serum",
      desc: "Niacinamide 5% & golden active peptides for an effortless daily glow.",
      image: "/images/navbar/featured-women.jpg",
      href: "/shop?category=skincare",
    },
  },
  men: {
    id: "men",
    label: "Men",
    columns: [
      {
        heading: "Face Care",
        items: [
          { label: "Men's Face Cleanser", href: "/shop?category=skincare&search=Cleanser" },
          { label: "Daily Moisturizer", href: "/shop?category=skincare&search=Cream" },
          { label: "Oil Control & Purifying", href: "/shop?category=skincare" },
          { label: "Exfoliating Face Polish", href: "/shop?category=body-care&search=Polish" },
          { label: "Anti-Ageing Face Serum", href: "/shop?category=skincare&search=Serum" },
        ],
      },
      {
        heading: "Shaving & Beard Care",
        items: [
          { label: "Gentle Cleansing Foam", href: "/shop?category=skincare&search=Cleanser" },
          { label: "Hydrating Post-Shave Balm", href: "/shop?category=skincare&search=Cream" },
          { label: "Beard & Hair Elixir Oils", href: "/shop?category=hair-care&search=Elixir" },
          { label: "Conditioning Beard Rinse", href: "/shop?category=hair-care&search=Conditioner" },
        ],
      },
      {
        heading: "Hair & Scalp",
        items: [
          { label: "Fortifying Shampoo", href: "/shop?category=hair-care&search=Shampoo" },
          { label: "Nourishing Conditioner", href: "/shop?category=hair-care&search=Conditioner" },
          { label: "Intensive Repair Mask", href: "/shop?category=hair-care&search=Mask" },
          { label: "Hair & Scalp Elixir", href: "/shop?category=hair-care&search=Elixir" },
        ],
      },
      {
        heading: "Body & Fragrance",
        items: [
          { label: "Refreshing Body Gel", href: "/shop?category=body-care&search=Gel" },
          { label: "Nourishing Body Lotion", href: "/shop?category=body-care&search=Lotion" },
          { label: "Artisanal Eau De Parfum", href: "/shop?category=fragrance" },
          { label: "Detox Body Polish", href: "/shop?category=body-care&search=Polish" },
        ],
      },
    ],
    featuredCard: {
      tag: "Men's Grooming",
      title: "Woody Bergamot Cologne",
      desc: "Crisp Italian citrus fused with warm Virginia cedarwood.",
      image: "/images/navbar/featured-men.jpg",
      href: "/shop?category=fragrance",
    },
  },
  makeup: {
    id: "makeup",
    label: "Makeup",
    columns: [
      {
        heading: "Face & Complexion",
        items: [
          { label: "Liquid Foundation", href: "/shop?category=makeup&search=Foundation" },
          { label: "Concealer", href: "/shop?category=makeup&search=Concealer" },
          { label: "Illuminating Primer", href: "/shop?category=makeup&search=Primer" },
          { label: "Mineral Face Powder", href: "/shop?category=makeup&search=Powder" },
          { label: "Blush & Bronzer", href: "/shop?category=makeup&search=Blush" },
          { label: "Liquid Highlighter", href: "/shop?category=makeup&search=Highlighter" },
        ],
      },
      {
        heading: "Eyes",
        items: [
          { label: "Lengthening Mascara", href: "/shop?category=makeup&search=Mascara" },
          { label: "Precision Eyeliner", href: "/shop?category=makeup&search=Eyeliner" },
          { label: "Mineral Eyeshadow Palettes", href: "/shop?category=makeup&search=Eyeshadow" },
          { label: "Eyebrow Pencils & Gels", href: "/shop?category=makeup&search=Eyebrow" },
        ],
      },
      {
        heading: "Lips",
        items: [
          { label: "Satin Matte Lipstick", href: "/shop?category=makeup&search=Lipstick" },
          { label: "Liquid Matte Lipsticks", href: "/shop?category=makeup&search=Liquid%20Lipstick" },
          { label: "Hydrating Lip Gloss", href: "/shop?category=makeup&search=Lip%20Gloss" },
          { label: "Nourishing Lip Oils", href: "/shop?category=makeup&search=Lip%20Oil" },
          { label: "Lip Liners", href: "/shop?category=makeup&search=Lip%20Liner" },
        ],
      },
      {
        heading: "Tools & Accessories",
        items: [
          { label: "Kabuki & Powder Brushes", href: "/shop?category=makeup&search=Brush" },
          { label: "Blending Sponges", href: "/shop?category=makeup&search=Sponge" },
          { label: "Eyelash Curlers", href: "/shop?category=makeup&search=Curler" },
          { label: "Brush Cleansers", href: "/shop?category=makeup" },
        ],
      },
    ],
    featuredCard: {
      tag: "Couture Lips",
      title: "Silk Petal Matte Lipstick",
      desc: "Rich botanical pigment infused with organic shea butter.",
      image: "/images/navbar/featured-makeup.jpg",
      href: "/shop?category=makeup",
    },
  },
  "mother-baby": {
    id: "mother-baby",
    label: "Mother & Baby",
    columns: [
      {
        heading: "Baby Skincare",
        items: [
          { label: "Gentle Baby Wash & Shampoo", href: "/shop?search=Baby%20Wash" },
          { label: "Calming Baby Lotion", href: "/shop?search=Baby%20Lotion" },
          { label: "Diaper Rash Barrier Cream", href: "/shop?search=Diaper%20Cream" },
          { label: "Pure Baby Massage Oil", href: "/shop?search=Baby%20Oil" },
        ],
      },
      {
        heading: "Maternity & Mother",
        items: [
          { label: "Stretch Mark Firming Oil", href: "/shop?search=Stretch%20Mark" },
          { label: "Velvet Belly Butter", href: "/shop?search=Butter" },
          { label: "Soothing Nipple Balm", href: "/shop?search=Balm" },
          { label: "Relaxing Bath Salts", href: "/shop?search=Bath" },
        ],
      },
      {
        heading: "Safe Botanicals",
        items: [
          { label: "Pediatrician Tested", href: "/shop?search=Gentle" },
          { label: "Pure Organic Chamomile", href: "/shop?search=Chamomile" },
          { label: "100% Fragrance Free", href: "/shop?search=Fragrance%20Free" },
        ],
      },
    ],
  },
  fragrance: {
    id: "fragrance",
    label: "Fragrance",
    columns: [
      {
        heading: "Women's Parfumerie",
        items: [
          { label: "Eau De Parfum", href: "/shop?category=fragrance&search=Eau%20De%20Parfum" },
          { label: "Floral & Peony Scents", href: "/shop?category=fragrance&search=Floral" },
          { label: "Warm Amber & Vanilla", href: "/shop?category=fragrance&search=Amber" },
          { label: "Fresh Citrus Notes", href: "/shop?category=fragrance&search=Citrus" },
        ],
      },
      {
        heading: "Men's Parfumerie",
        items: [
          { label: "Eau De Toilette", href: "/shop?category=fragrance&search=Eau%20De%20Toilette" },
          { label: "Woody & Cedar Musk", href: "/shop?category=fragrance&search=Woody" },
          { label: "Artisanal Colognes", href: "/shop?category=fragrance&search=Cologne" },
        ],
      },
      {
        heading: "Artisanal Extracts",
        items: [
          { label: "Concentrated Rollerball Oils", href: "/shop?category=fragrance&search=Oil" },
          { label: "Botanical Hair Mists", href: "/shop?category=fragrance&search=Mist" },
          { label: "Crystal Pocket Atomizers", href: "/shop?category=fragrance" },
        ],
      },
    ],
    featuredCard: {
      tag: "Master Perfumer",
      title: "Maison Fleur Eau De Parfum",
      desc: "French peony, bergamot & Mysore sandalwood in a crystal flacon.",
      image: "/images/navbar/featured-fragrance.jpg",
      href: "/shop?category=fragrance",
    },
  },
  brands: {
    id: "brands",
    label: "Brands",
    columns: [
      {
        heading: "Atelier Skincare",
        items: [
          { label: "Lumière Botanique", href: "/shop?search=Lumière" },
          { label: "Rose & Herb", href: "/shop?search=Rose%20%26%20Herb" },
          { label: "Aura Essentials", href: "/shop?search=Aura%20Essentials" },
        ],
      },
      {
        heading: "Haute Parfumerie",
        items: [
          { label: "Maison Fleur", href: "/shop?search=Maison%20Fleur" },
          { label: "Amber Twilight Collection", href: "/shop?search=Amber%20Twilight" },
        ],
      },
      {
        heading: "Couture Pigments",
        items: [
          { label: "Velour Paris", href: "/shop?search=Velour%20Paris" },
          { label: "Glow Atelier", href: "/shop?search=Glow%20Atelier" },
        ],
      },
      {
        heading: "Botanical Hair Care",
        items: [
          { label: "Botanique Botanicals", href: "/shop?search=Botanique" },
          { label: "Pure Dew Labs", href: "/shop?search=Pure%20Dew" },
        ],
      },
    ],
  },
  "deals-gifts": {
    id: "deals-gifts",
    label: "Deals & Gifts",
    columns: [
      {
        heading: "Curated Gift Sets",
        items: [
          { label: "Luxury Skincare Vault", href: "/shop?search=Gift" },
          { label: "Fragrance Discovery Coffret", href: "/shop?search=Discovery" },
          { label: "Bridal Glow Radiance Box", href: "/shop?search=Bridal" },
          { label: "Travel Ritual Minis", href: "/shop?search=Travel" },
        ],
      },
      {
        heading: "Exclusive Specials",
        items: [
          { label: "Botanical Bundles (Save 15%)", href: "/shop?search=Bundle" },
          { label: "Best Sellers Under LKR 5,000", href: "/shop?maxPrice=5000" },
          { label: "Complimentary Deluxe Samples", href: "/shop" },
        ],
      },
    ],
  },
};

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, openCart } = useCart();
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const location = useLocation();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Navigation hover & dropdown states
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lock background scroll when mobile menu drawer is open
  useBodyScrollLock(mobileMenuOpen);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveMegaMenu(null);
      setMobileMenuOpen(false);
      setUserDropdownOpen(false);
      setSearchOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  // Click outside search container
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      const timer = setTimeout(() => {
        setSearchResults([]);
        setSearchOpen(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await productService.getProducts({
          search: searchQuery.trim(),
          limit: 5,
        });
        setSearchResults(res.products || []);
        setSearchOpen(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);

    const confirmed = await confirm({
      title: "Sign Out of Atelier?",
      message: "Are you sure you wish to end your current session?",
      confirmText: "Sign Out",
      cancelText: "Stay Signed In",
      confirmVariant: "danger",
      iconType: "logout",
    });

    if (confirmed) {
      await logout();
      toast.success("Signed out successfully.", { id: "auth-status" });
      navigate("/");
    }
  };

  // Mega menu hover management with smooth delay
  const handleMenuEnter = (menuId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setActiveMegaMenu(menuId);
  };

  const handleMenuLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 180);
  };

  const toggleMobileAccordion = (key: string) => {
    setMobileExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#211A1C] text-[#FFF1A8] text-[11px] py-2 px-4 text-center tracking-[0.16em] font-medium flex items-center justify-center gap-2 border-b border-[#D4AF37]/25 z-50 relative">
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span className="uppercase">
          COMPLIMENTARY ISLAND-WIDE CONCIERGE ON ORDERS OVER LKR 8,000
        </span>
        <span className="hidden md:inline text-[#D4AF37] opacity-80">
          | WHATSAPP CONCIERGE: +94 74 330 1490
        </span>
      </div>

      {/* Main Sticky Header */}
      <header
        className="sticky top-0 z-40 w-full bg-[#FFFFFF] shadow-sm border-b border-[#EFE6DF] text-[#211A1C]"
        onMouseLeave={handleMenuLeave}
      >
        {/* ROW 1: Brand Logo + Wide Search Bar + Account & Cart */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#211A1C] hover:text-[#B87D4B] transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo (Left) */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              {/* Elegant Lotus / Botanical Emblem */}
              <div className="w-10 h-10 rounded-full bg-[#F7EFE9] border border-[#B87D4B]/40 flex items-center justify-center text-[#B87D4B] group-hover:scale-105 transition-transform shadow-xs">
                <svg
                  className="w-6 h-6 stroke-current"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2C12 2 7 7 7 12C7 16 10 19 12 22C14 19 17 16 17 12C17 7 12 2 12 2Z" />
                  <path d="M12 22C8 20 4 16 4 12C4 9 6 6 8 5" />
                  <path d="M12 22C16 20 20 16 20 12C20 9 18 6 16 5" />
                </svg>
              </div>

              <div>
                <span className="font-serif-luxury text-2xl sm:text-3xl font-medium tracking-[0.08em] text-[#211A1C] group-hover:text-[#B87D4B] transition-colors block leading-tight">
                  AURA
                </span>
                <span className="block text-[9px] uppercase tracking-[0.24em] text-[#8F6B00] font-semibold">
                  Haute Beauté • Cosmetics
                </span>
              </div>
            </Link>

            {/* Middle: Prominent Search Bar with Warm Cognac Bronze "Search" Button */}
            <div ref={searchContainerRef} className="flex-1 max-w-2xl hidden md:block relative">
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0) setSearchOpen(true);
                    }}
                    placeholder="Search for skincare, serums, makeup, perfumes..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-l-xl border border-r-0 border-[#D8CEC4] bg-[#FFFCFA] text-xs sm:text-sm text-[#211A1C] placeholder-[#94888B] focus:outline-hidden focus:border-[#B87D4B] focus:bg-white transition-all shadow-inner"
                  />
                  <Search className="w-4 h-4 text-[#8A7E81] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  {searchLoading && (
                    <Loader2 className="w-4 h-4 text-[#B87D4B] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                {/* Warm Cognac Bronze "Search" Button (like reference screenshot) */}
                <button
                  type="submit"
                  className="px-7 py-2.5 bg-[#B87D4B] hover:bg-[#9E6536] text-white text-xs sm:text-sm font-semibold tracking-wide rounded-r-xl transition-colors duration-200 shadow-sm border border-[#B87D4B] shrink-0"
                >
                  Search
                </button>
              </form>

              {/* Instant Search Suggestions Dropdown */}
              {searchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#EFE6DF] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 bg-[#FFF9F5] border-b border-[#EFE6DF] flex items-center justify-between text-xs text-[#7D7275]">
                    <span>Results for "{searchQuery}"</span>
                    <button
                      onClick={() => setSearchOpen(false)}
                      className="hover:text-[#211A1C]"
                    >
                      Close
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#F5ECE5]">
                    {searchResults.length > 0 ? (
                      searchResults.map((prod) => (
                        <Link
                          key={prod._id}
                          to={`/product/${prod.slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3.5 p-3 hover:bg-[#F7EFE9]/60 transition-colors group"
                        >
                          <img
                            src={prod.images?.[0] || "/images/placeholders/product-placeholder.jpg"}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#EFE6DF] group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/images/placeholders/product-placeholder.jpg";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-[#211A1C] group-hover:text-[#B87D4B] truncate">
                              {prod.name}
                            </h4>
                            <p className="text-[11px] text-[#7D7275] capitalize">
                              {typeof prod.category === "object" ? prod.category.name : "Cosmetics"}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-[#B87D4B]">
                            {formatPrice(prod.price)}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-[#7D7275]">
                        No direct matches found. Press Search to explore full catalog.
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 bg-[#FFF9F5] border-t border-[#EFE6DF] text-center">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-xs font-semibold text-[#B87D4B] hover:text-[#9E6536] inline-flex items-center gap-1"
                    >
                      <span>View All Matching Products</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Account & Shopping Bag */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              {/* Account Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 text-xs font-medium text-[#211A1C] hover:text-[#B87D4B] transition-colors p-1.5"
                  title="My Account"
                >
                  <UserIcon className="w-5 h-5 text-[#211A1C]" />
                  <div className="hidden sm:block text-left">
                    <span className="block text-[10px] text-[#8A7E81] uppercase tracking-wider font-semibold">
                      Welcome
                    </span>
                    <span className="block text-xs font-semibold leading-tight">
                      {user ? (user.profile?.firstName || "My Account") : "My Account"}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8A7E81] hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-[#EFE6DF] p-2.5 z-50 text-[#211A1C] animate-in fade-in zoom-in-95 duration-150">
                    {user ? (
                      <div>
                        <div className="px-3.5 py-2.5 border-b border-[#F0E6DF] mb-1">
                          <p className="text-xs font-bold text-[#211A1C] truncate">
                            {user.profile?.firstName
                              ? `${user.profile.firstName} ${user.profile.lastName}`
                              : user.email}
                          </p>
                          <p className="text-[10px] text-[#8F6B00] font-semibold capitalize flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B87D4B]" />
                            <span>{user.role} Atelier Member</span>
                          </p>
                        </div>

                        <Link
                          to="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#211A1C] hover:bg-[#F7EFE9] rounded-xl transition-colors"
                        >
                          <Package className="w-4 h-4 text-[#B87D4B]" />
                          <span>My Orders & History</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#8F6B00] font-semibold hover:bg-[#F7EFE9] rounded-xl transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Admin Management Atelier</span>
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#B33A3A] hover:bg-rose-50 rounded-xl transition-colors text-left mt-1 border-t border-[#F0E6DF] pt-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 space-y-2">
                        <Link
                          to="/login"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-4 py-2.5 text-xs font-semibold text-center rounded-xl bg-[#B87D4B] text-white hover:bg-[#9E6536] transition-colors shadow-sm"
                        >
                          Sign In / Register
                        </Link>
                        <p className="text-[11px] text-[#8A7E81] text-center">
                          Track orders & earn Atelier points
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Shopping Bag / Cart */}
              <button
                type="button"
                onClick={openCart}
                className="flex items-center gap-2 text-xs font-semibold text-[#211A1C] hover:text-[#B87D4B] transition-colors p-1.5 relative group"
                title="View Shopping Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-[#211A1C] group-hover:text-[#B87D4B] transition-colors" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#B87D4B] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                      {itemCount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-[10px] text-[#8A7E81] uppercase tracking-wider font-semibold">
                    My Bag
                  </span>
                  <span className="block text-xs font-bold leading-tight">
                    Cart ({itemCount})
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Search Input */}
          <div className="mt-3 md:hidden">
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-3 pr-3 py-2 rounded-l-xl border border-r-0 border-[#D8CEC4] bg-[#FFFCFA] text-xs text-[#211A1C]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#B87D4B] text-white text-xs font-semibold rounded-r-xl"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* ROW 2: CATEGORY NAVIGATION BAR WITH MEGA MENUS (As requested in screenshots) */}
        <nav className="border-t border-[#EFE6DF] bg-[#FFFFFF] hidden lg:block relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center justify-between text-[13px] font-medium text-[#211A1C]">
              {/* Show All */}
              <li className="py-3 cursor-pointer shrink-0">
                <Link
                  to="/shop"
                  className="flex items-center gap-1.5 font-semibold text-[#211A1C] hover:text-[#B87D4B] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#B87D4B]" />
                  <span>Show All</span>
                </Link>
              </li>

              {/* Women ▾ */}
              <li
                onMouseEnter={() => handleMenuEnter("women")}
                className="py-3 cursor-pointer group"
              >
                <Link
                  to="/shop?category=skincare"
                  className={`flex items-center gap-1 transition-colors ${
                    activeMegaMenu === "women" ? "text-[#B87D4B] font-semibold" : "hover:text-[#B87D4B]"
                  }`}
                >
                  <span>Women</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeMegaMenu === "women" ? "rotate-180 text-[#B87D4B]" : "text-[#7D7275]"
                    }`}
                  />
                </Link>
              </li>

              {/* Men ▾ */}
              <li
                onMouseEnter={() => handleMenuEnter("men")}
                className="py-3 cursor-pointer group"
              >
                <Link
                  to="/shop?search=Men"
                  className={`flex items-center gap-1 transition-colors ${
                    activeMegaMenu === "men" ? "text-[#B87D4B] font-semibold" : "hover:text-[#B87D4B]"
                  }`}
                >
                  <span>Men</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeMegaMenu === "men" ? "rotate-180 text-[#B87D4B]" : "text-[#7D7275]"
                    }`}
                  />
                </Link>
              </li>

              {/* K - Beauty */}
              <li className="py-3 cursor-pointer">
                <Link
                  to="/shop?search=Radiance"
                  className="hover:text-[#B87D4B] transition-colors"
                >
                  K - Beauty
                </Link>
              </li>

              {/* Makeup ▾ */}
              <li
                onMouseEnter={() => handleMenuEnter("makeup")}
                className="py-3 cursor-pointer group"
              >
                <Link
                  to="/shop?category=makeup"
                  className={`flex items-center gap-1 transition-colors ${
                    activeMegaMenu === "makeup" ? "text-[#B87D4B] font-semibold" : "hover:text-[#B87D4B]"
                  }`}
                >
                  <span>Makeup</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeMegaMenu === "makeup" ? "rotate-180 text-[#B87D4B]" : "text-[#7D7275]"
                    }`}
                  />
                </Link>
              </li>

              {/* Sun Protection */}
              <li className="py-3 cursor-pointer">
                <Link
                  to="/shop?category=sun-care"
                  className="hover:text-[#B87D4B] transition-colors"
                >
                  Sun Protection
                </Link>
              </li>

              {/* Mother & Baby ▾ */}
              <li
                onMouseEnter={() => handleMenuEnter("mother-baby")}
                className="py-3 cursor-pointer group"
              >
                <Link
                  to="/shop?search=Baby"
                  className={`flex items-center gap-1 transition-colors ${
                    activeMegaMenu === "mother-baby" ? "text-[#B87D4B] font-semibold" : "hover:text-[#B87D4B]"
                  }`}
                >
                  <span>Mother & Baby</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeMegaMenu === "mother-baby" ? "rotate-180 text-[#B87D4B]" : "text-[#7D7275]"
                    }`}
                  />
                </Link>
              </li>

              {/* Fragrance ▾ */}
              <li
                onMouseEnter={() => handleMenuEnter("fragrance")}
                className="py-3 cursor-pointer group"
              >
                <Link
                  to="/shop?category=fragrance"
                  className={`flex items-center gap-1 transition-colors ${
                    activeMegaMenu === "fragrance" ? "text-[#B87D4B] font-semibold" : "hover:text-[#B87D4B]"
                  }`}
                >
                  <span>Fragrance</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeMegaMenu === "fragrance" ? "rotate-180 text-[#B87D4B]" : "text-[#7D7275]"
                    }`}
                  />
                </Link>
              </li>

              {/* Brands ▾ */}
              <li
                onMouseEnter={() => handleMenuEnter("brands")}
                className="py-3 cursor-pointer group"
              >
                <Link
                  to="/shop"
                  className={`flex items-center gap-1 transition-colors ${
                    activeMegaMenu === "brands" ? "text-[#B87D4B] font-semibold" : "hover:text-[#B87D4B]"
                  }`}
                >
                  <span>Brands</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeMegaMenu === "brands" ? "rotate-180 text-[#B87D4B]" : "text-[#7D7275]"
                    }`}
                  />
                </Link>
              </li>

              {/* Deals & Gifts ▾ */}
              <li
                onMouseEnter={() => handleMenuEnter("deals-gifts")}
                className="py-3 cursor-pointer group"
              >
                <Link
                  to="/shop?search=Gift"
                  className={`flex items-center gap-1 transition-colors ${
                    activeMegaMenu === "deals-gifts" ? "text-[#B87D4B] font-semibold" : "hover:text-[#B87D4B]"
                  }`}
                >
                  <span>Deals & Gifts</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeMegaMenu === "deals-gifts" ? "rotate-180 text-[#B87D4B]" : "text-[#7D7275]"
                    }`}
                  />
                </Link>
              </li>

              {/* Outlets / Concierge */}
              <li className="py-3 cursor-pointer">
                <a
                  href="https://wa.me/94743301490?text=Hello%20AURA!%20I'd%20like%20to%20inquire%20about%20store%20outlets%20and%20products."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#B87D4B] transition-colors flex items-center gap-1 text-[#56805D]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Outlets & Concierge</span>
                </a>
              </li>

              {/* Admin Panel Quick Link */}
              {isAdmin && (
                <li className="py-3">
                  <Link
                    to="/admin"
                    className="text-[#8F6B00] hover:text-[#B87D4B] font-semibold flex items-center gap-1 text-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* ===== MEGA MENU PANEL (Appears on Hover, exactly like Screenshot 2) ===== */}
          {activeMegaMenu && MEGA_MENUS[activeMegaMenu] && (
            <div
              className="absolute top-full left-0 right-0 bg-white border-b border-[#EFE6DF] shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150"
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
              }}
              onMouseLeave={handleMenuLeave}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-12 gap-8">
                  {/* Category Columns (like Screenshot 2: Face Care, Body Care, Hair Care, Toiletries) */}
                  <div
                    className={
                      MEGA_MENUS[activeMegaMenu].featuredCard
                        ? "col-span-9 grid grid-cols-4 gap-8"
                        : "col-span-12 grid grid-cols-4 gap-8"
                    }
                  >
                    {MEGA_MENUS[activeMegaMenu].columns.map((col, idx) => (
                      <div key={idx} className="space-y-3">
                        <h4 className="font-semibold text-sm text-[#211A1C] pb-1.5 border-b border-[#F0E6DF] tracking-wide">
                          {col.heading}
                        </h4>
                        <ul className="space-y-2">
                          {col.items.map((item, itemIdx) => (
                            <li key={itemIdx}>
                              <Link
                                to={item.href}
                                className="text-xs text-[#5C5255] hover:text-[#B87D4B] hover:translate-x-1 transition-all block font-normal"
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Optional Featured Editorial Card (Right side) */}
                  {MEGA_MENUS[activeMegaMenu].featuredCard && (
                    <div className="col-span-3 border-l border-[#F0E6DF] pl-8">
                      <div className="rounded-2xl overflow-hidden bg-[#FFF9F5] border border-[#EFE6DF] p-3 shadow-xs group">
                        <div className="aspect-4/3 rounded-xl overflow-hidden mb-3 bg-black/10">
                          <img
                            src={MEGA_MENUS[activeMegaMenu].featuredCard?.image}
                            alt="Featured Formulation"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/images/placeholders/product-placeholder.jpg";
                            }}
                          />
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-[#8F6B00] font-bold block mb-1">
                          {MEGA_MENUS[activeMegaMenu].featuredCard?.tag}
                        </span>
                        <h5 className="font-serif-luxury text-sm font-semibold text-[#211A1C] leading-tight mb-1">
                          {MEGA_MENUS[activeMegaMenu].featuredCard?.title}
                        </h5>
                        <p className="text-[11px] text-[#7D7275] leading-relaxed mb-3">
                          {MEGA_MENUS[activeMegaMenu].featuredCard?.desc}
                        </p>
                        <Link
                          to={MEGA_MENUS[activeMegaMenu].featuredCard?.href || "/shop"}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#B87D4B] hover:underline"
                        >
                          <span>Discover Formulation</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* MOBILE NAVIGATION DRAWER */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#EFE6DF] bg-white px-4 pt-4 pb-8 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <nav className="flex flex-col space-y-2 text-sm text-[#211A1C]">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl font-semibold hover:bg-[#F7EFE9]"
              >
                Home
              </Link>
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-[#B87D4B] bg-[#F7EFE9] hover:bg-[#EFE5DC] transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#B87D4B]" />
                <span>Show All Formulations</span>
              </Link>

              {/* Accordions for Departments */}
              {Object.values(MEGA_MENUS).map((menu) => (
                <div key={menu.id} className="border-t border-[#F5ECE5] pt-1">
                  <button
                    onClick={() => toggleMobileAccordion(menu.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-left hover:bg-[#F7EFE9] rounded-xl"
                  >
                    <span>{menu.label}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        mobileExpanded[menu.id] ? "rotate-180 text-[#B87D4B]" : "text-[#7D7275]"
                      }`}
                    />
                  </button>

                  {mobileExpanded[menu.id] && (
                    <div className="pl-4 pr-2 py-2 space-y-3 bg-[#FFF9F5] rounded-xl my-1">
                      {menu.columns.map((col, idx) => (
                        <div key={idx} className="space-y-1">
                          <span className="text-[11px] font-bold text-[#8F6B00] uppercase tracking-wider block">
                            {col.heading}
                          </span>
                          <div className="grid grid-cols-2 gap-1 pl-1">
                            {col.items.map((it, i) => (
                              <Link
                                key={i}
                                to={it.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-xs text-[#5C5255] hover:text-[#B87D4B] py-1"
                              >
                                {it.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <Link
                to="/shop?category=sun-care"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl font-semibold hover:bg-[#F7EFE9] border-t border-[#F5ECE5]"
              >
                Sun Protection
              </Link>
              <a
                href="https://wa.me/94743301490"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl font-semibold text-[#56805D] hover:bg-[#56805D]/10 flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp Concierge & Outlets</span>
              </a>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-[#8F6B00] font-semibold bg-[#F7EFE9] flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Admin Atelier Management</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;