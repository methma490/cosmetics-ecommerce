import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  X,
} from "lucide-react";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  mobileOpen,
  setMobileOpen,
}) => {
  const location = useLocation();

  // Lock background scroll when mobile sidebar drawer is open
  useBodyScrollLock(Boolean(mobileOpen));

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && setMobileOpen) setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, setMobileOpen]);

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      exact: true,
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      path: "/admin/products",
      exact: false,
      icon: Package,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      exact: false,
      icon: Layers,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      exact: false,
      icon: ShoppingBag,
    },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  const content = (
    <div className="h-full flex flex-col justify-between p-4 bg-[#FFFCFA] border-r border-[#F0DFD8]">
      <div>
        {/* Brand header */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-[#F0DFD8] mb-6">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F7EFE9] to-[#E8DDD4] text-[#B87D4B] border border-[#D4AF37]/30 flex items-center justify-center font-bold font-serif-luxury shadow-2xs">
              A
            </div>
            <div>
              <span className="font-serif-luxury text-base font-semibold tracking-wider text-[#211A1C] block leading-none">
                AURA
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#B87D4B] font-bold">
                L’Étoile Atelier
              </span>
            </div>
          </Link>
          {setMobileOpen && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 text-[#756D70] hover:text-[#211A1C] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? "bg-[#B87D4B] text-white shadow-xs font-semibold"
                    : "text-[#756D70] hover:bg-[#F7EFE9] hover:text-[#211A1C]"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-[#B87D4B]"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Switcher */}
      <div className="pt-4 border-t border-[#F0DFD8] space-y-2">
        <Link
          to="/"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#211A1C] hover:bg-[#FFF9F5] transition-colors border border-gold-metallic/30 shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-metallic" />
            <span className="font-medium">Storefront</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-[#756D70]" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-xs h-full z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
