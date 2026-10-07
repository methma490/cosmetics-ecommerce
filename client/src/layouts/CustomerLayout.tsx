import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import CartDrawer from "../components/cart/CartDrawer";
import PageLoader from "../components/common/PageLoader";

export const CustomerLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F5] text-[#211A1C]">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
