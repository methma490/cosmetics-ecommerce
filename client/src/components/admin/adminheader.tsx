import React from "react";
import { Menu, LogOut, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E8DADD] px-4 sm:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-[#252223] hover:bg-[#FAF8F3]"
          title="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h1 className="font-serif-luxury text-lg sm:text-xl font-semibold text-[#252223]">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Admin profile pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#FAF8F3] border border-[#E8DADD]">
          <div className="w-6 h-6 rounded-full bg-[#C85C7A] text-white flex items-center justify-center text-xs font-bold">
            <Shield className="w-3 h-3" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-[#252223] leading-none">
              {user?.profile?.firstName
                ? `${user.profile.firstName} ${user.profile.lastName}`
                : "Administrator"}
            </p>
            <span className="text-[10px] text-[#C85C7A] font-semibold uppercase">
              Admin
            </span>
          </div>
        </div>

        {/* Logout action */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-lg text-[#756D70] hover:text-[#B33A3A] hover:bg-[#FBECEF] transition-colors"
          title="Sign out of admin"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
