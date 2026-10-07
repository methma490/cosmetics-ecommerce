import React, { useState, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/admin/adminSidebar";
import AdminHeader from "../components/admin/adminheader";
import AdminRoute from "../components/common/AdminRoute";
import PageLoader from "../components/common/PageLoader";

export const AdminLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <AdminRoute>
      <div className="min-h-screen flex bg-[#FFF9F5] text-[#211A1C]">
        <AdminSidebar
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />
          <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <Suspense
                fallback={<PageLoader message="Loading Operations..." />}
              >
                <div key={location.pathname} className="page-transition">
                  <Outlet />
                </div>
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminLayout;
