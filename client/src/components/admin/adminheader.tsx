import React from "react";
import { Menu, LogOut, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import { useConfirm } from "../../hooks/useConfirm";
import toast from "react-hot-toast";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  title,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: "Sign Out of Admin Atelier?",
      message: "Are you sure you want to end your administrative session?",
      confirmText: "Sign Out",
      confirmVariant: "danger",
      iconType: "logout",
    });

    if (isConfirmed) {
      await logout();
      toast.success("Administrator session closed.", { id: "admin-logout" });
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FFFCFA] border-b border-[#F0DFD8] px-4 sm:px-8 py-4 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-[#211A1C] hover:bg-[#FFF9F5] cursor-pointer"
          title="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h1 className="font-serif-luxury text-lg sm:text-xl font-semibold text-[#211A1C]">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Admin profile pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#FFF9F5] border border-gold-metallic/30 shadow-2xs">
          <div className="w-6 h-6 rounded-full bg-[#B87D4B] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            <Shield className="w-3 h-3" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-[#211A1C] leading-none">
              {user?.profile?.firstName
                ? `${user.profile.firstName} ${user.profile.lastName}`
                : "Administrator"}
            </p>
            <span className="text-[10px] text-gold-metallic font-bold uppercase">
              Admin
            </span>
          </div>
        </div>

        {/* Logout action */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-lg text-[#756D70] hover:text-[#B33A3A] hover:bg-[#F7EFE9] transition-colors cursor-pointer"
          title="Sign out of admin"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
