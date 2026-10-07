import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ConfirmProvider } from './context/ConfirmContext';

// Layouts & Utility
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/adminLayout';
import ScrollToTop from './components/common/ScrollToTop';
import NavigationProgressBar from './components/common/NavigationProgressBar';
import GlobalScrollLock from './components/common/GlobalScrollLock';
import ProtectedRoute from './components/common/ProtectedRoute';
import PageLoader from './components/common/PageLoader';

// Customer Pages (Lazy loaded with smooth transition fallbacks)
const HomePage = lazy(() => import('./pages/customer/HomePage'));
const ShopPage = lazy(() => import('./pages/customer/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/customer/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/customer/cartPage'));
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/customer/LoginPage'));
const RegisterPage = lazy(() => import('./pages/customer/RegisterPage'));
const VerifyEmailPage = lazy(() => import('./pages/customer/VerifyEmailPage'));
const AccountPage = lazy(() => import('./pages/customer/AccountPage'));
const OrderSuccessPage = lazy(() => import('./pages/customer/OrderSuccessPage'));
const PaymentStatusPage = lazy(() => import('./pages/customer/PaymentStatusPage'));
const NotFoundPage = lazy(() => import('./pages/customer/NotFoundPage'));

// Admin Pages (Lazy loaded with smooth transition fallbacks)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/admin/ProductsPage'));
const AddProductPage = lazy(() => import('./pages/admin/AddProductPage'));
const EditProductPage = lazy(() => import('./pages/admin/EditProductPage'));
const CategoriesPage = lazy(() => import('./pages/admin/categoriesPage'));
const OrdersPage = lazy(() => import('./pages/admin/OrdersPage'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ConfirmProvider>
            <NavigationProgressBar />
            <ScrollToTop />
            <GlobalScrollLock />
            <Toaster
              position="top-right"
              gutter={10}
              containerStyle={{
                top: 24,
                right: 24,
              }}
              toastOptions={{
              duration: 3500,
              style: {
                background: '#FFFCFA',
                color: '#211A1C',
                border: '1px solid #F0DFD8',
                borderRadius: '16px',
                fontSize: '13px',
                boxShadow: '0 12px 32px -4px rgba(184, 125, 75, 0.15)',
                padding: '12px 18px',
              },
              success: {
                iconTheme: {
                  primary: '#B87D4B',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#B33A3A',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />

          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Customer Storefront Routes */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                
                {/* Authenticated Customer Routes */}
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <AccountPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/orders"
                  element={
                    <ProtectedRoute>
                      <AccountPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/orders/:id"
                  element={
                    <ProtectedRoute>
                      <AccountPage />
                    </ProtectedRoute>
                  }
                />

                {/* Order & Payment Confirmation */}
                <Route path="/order-success/:id" element={<OrderSuccessPage />} />
                <Route path="/payment/success" element={<PaymentStatusPage statusType="success" />} />
                <Route path="/payment/cancel" element={<PaymentStatusPage statusType="cancel" />} />
              </Route>

              {/* Admin Authentication */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Admin Management Dashboard */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/new" element={<AddProductPage />} />
                <Route path="products/:id/edit" element={<EditProductPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:id" element={<OrdersPage />} />
              </Route>

              {/* Fallbacks */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          </ConfirmProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
