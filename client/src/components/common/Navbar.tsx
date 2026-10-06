import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  User as UserIcon,
  Search,
  Menu,
  X,
  Sparkles,
  LogOut,
  LayoutDashboard,
  Package,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import SearchBar from "../product/searchBar";
import categoryService from "../../services/categoryService";
import type { Category } from "../../types/category";

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    categoryService
      .getCategories()
      .then((res) => {
        if (res.success) setCategories(res.categories);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate("/");
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#252223] text-white text-[11px] py-2 px-4 text-center tracking-wider font-light flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 text-[#F3D6DE]" />
        <span>Complimentary islandwide delivery on orders over Rs. 15,000</span>
        <span className="hidden sm:inline">| Order directly via WhatsApp</span>
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-xs border-b border-[#E8DADD]"
            : "bg-[#FAF8F3] border-b border-[#E8DADD]/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#252223] hover:text-[#C85C7A]"
                title="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8 text-xs font-medium uppercase tracking-widest text-[#252223]">
              <Link
                to="/"
                className={`hover:text-[#C85C7A] transition-colors py-1 ${
                  location.pathname === "/"
                    ? "text-[#C85C7A] border-b-2 border-[#C85C7A]"
                    : ""
                }`}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className={`hover:text-[#C85C7A] transition-colors py-1 ${
                  location.pathname === "/shop"
                    ? "text-[#C85C7A] border-b-2 border-[#C85C7A]"
                    : ""
                }`}
              >
                Shop All
              </Link>

              {/* Categories hover preview */}
              <div className="relative group py-1 cursor-pointer">
                <span className="hover:text-[#C85C7A] transition-colors flex items-center gap-1">
                  Categories
                </span>
                <div className="absolute top-full left-0 w-48 bg-white rounded-xl shadow-xl border border-[#E8DADD] p-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/shop?category=${cat.slug}`}
                      className="block px-3 py-2 rounded-lg text-xs font-normal text-[#252223] hover:bg-[#FBECEF] hover:text-[#C85C7A] transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-[#C85C7A] hover:text-[#A84462] flex items-center gap-1.5 font-semibold"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>

            {/* Brand Logo (Centered) */}
            <div className="text-center">
              <Link to="/" className="inline-block group">
                <span className="font-serif-luxury text-2xl sm:text-3xl tracking-[0.25em] text-[#252223] group-hover:text-[#C85C7A] transition-colors font-medium">
                  AURA
                </span>
                <span className="block text-[9px] uppercase tracking-[0.4em] text-[#756D70] font-light -mt-1">
                  Botanical Luxury
                </span>
              </Link>
            </div>

            {/* Right Actions: Search, Account, Cart */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-[#252223] hover:text-[#C85C7A] transition-colors"
                title="Search products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* User Account Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="p-2 text-[#252223] hover:text-[#C85C7A] transition-colors flex items-center gap-1"
                  title="Account"
                >
                  <UserIcon className="w-5 h-5" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E8DADD] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {user ? (
                      <div>
                        <div className="px-3 py-2 border-b border-[#E8DADD]/60 mb-1">
                          <p className="text-xs font-semibold text-[#252223] truncate">
                            {user.profile?.firstName
                              ? `${user.profile.firstName} ${user.profile.lastName}`
                              : user.email}
                          </p>
                          <p className="text-[10px] text-[#756D70] capitalize">
                            {user.role} Account
                          </p>
                        </div>

                        <Link
                          to="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-[#252223] hover:bg-[#FBECEF] rounded-lg transition-colors"
                        >
                          <Package className="w-4 h-4 text-[#C85C7A]" />
                          <span>My Orders</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-[#C85C7A] font-medium hover:bg-[#FBECEF] rounded-lg transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#B33A3A] hover:bg-[#FBECEF] rounded-lg transition-colors mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 space-y-2">
                        <p className="text-xs text-[#756D70] mb-2 px-1">
                          Welcome to AURA
                        </p>
                        <Link
                          to="/login"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block w-full text-center py-2 rounded-full bg-[#C85C7A] text-white text-xs font-semibold hover:bg-[#A84462] transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block w-full text-center py-2 rounded-full border border-[#E8DADD] text-xs font-medium text-[#252223] hover:bg-[#FAF8F3] transition-colors"
                        >
                          Create Account
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Button with Animated Counter Badge */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-2 text-[#252223] hover:text-[#C85C7A] transition-colors"
                title="View bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C85C7A] text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Search Bar Area */}
        {searchOpen && (
          <div className="py-4 px-4 bg-white border-t border-[#E8DADD] shadow-xs flex justify-center animate-in slide-in-from-top-2 duration-200">
            <SearchBar onClose={() => setSearchOpen(false)} autoFocus />
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E8DADD] bg-white px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <nav className="space-y-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium uppercase tracking-wider text-[#252223] hover:text-[#C85C7A]"
              >
                Home
              </Link>
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium uppercase tracking-wider text-[#252223] hover:text-[#C85C7A]"
              >
                Shop All Products
              </Link>

              <div className="pt-2 border-t border-[#E8DADD]/60">
                <span className="text-[11px] uppercase tracking-wider text-[#756D70] font-semibold">
                  Categories
                </span>
                <div className="mt-2 space-y-2 pl-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/shop?category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-xs text-[#252223] hover:text-[#C85C7A]"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {isAdmin && (
                <div className="pt-2 border-t border-[#E8DADD]/60">
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm text-[#C85C7A] font-semibold"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
