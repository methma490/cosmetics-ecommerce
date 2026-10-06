import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Package, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  ExternalLink,
  Plus
} from 'lucide-react';
import orderService from '../../services/orderService';
import productService from '../../services/productService';
import type { Order } from '../../types/order';
import type { Product } from '../../types/product';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';

const DashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordersRes, productsRes] = await Promise.all([
        orderService.getAllOrders(),
        productService.getProducts({ includeInactive: true, limit: 100 }),
      ]);

      if (ordersRes.success) {
        setOrders(ordersRes.orders || []);
      }
      if (productsRes.success) {
        setProducts(productsRes.products || []);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err?.response?.data?.message || 'Failed to load dashboard overview');
    } finally {
      setLoading(false);
    }
  };

  // Derive genuine stats
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingOrders = orders.filter(o => o.orderStatus === 'pending');
  const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered');
  const lowStockProducts = products.filter(p => p.stock <= 5);
  const recentOrders = [...orders].slice(0, 5);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader size="lg" text="Loading store metrics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-100 max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-[#B33A3A] mx-auto mb-3" />
        <h3 className="font-serif text-xl font-bold text-[#252223] mb-2">Error Loading Dashboard</h3>
        <p className="text-sm text-[#756D70] mb-6">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-6 py-2.5 bg-[#C85C7A] hover:bg-[#A84462] text-white text-sm font-semibold rounded-full transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8DADD]">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[#C85C7A]">Atelier Operations</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#252223]">Dashboard Overview</h1>
          <p className="text-xs sm:text-sm text-[#756D70] mt-0.5">Real-time performance snapshot and catalog vitals</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C85C7A] hover:bg-[#A84462] text-white text-xs sm:text-sm font-medium rounded-full shadow-sm hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            to="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-[#E8DADD] hover:border-[#C85C7A] text-[#252223] text-xs sm:text-sm font-medium rounded-full transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#756D70]" />
            <span>View Store</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DADD] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#756D70]">Paid Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#56805D] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#252223]">
            {formatPrice(totalRevenue)}
          </div>
          <p className="text-xs text-[#756D70] mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#56805D]" />
            <span>From verified completed transactions</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DADD] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#756D70]">Total Orders</span>
            <div className="w-10 h-10 rounded-xl bg-[#FBECEF] text-[#C85C7A] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#252223]">
            {orders.length}
          </div>
          <div className="flex items-center justify-between text-xs text-[#756D70] mt-2">
            <span className="text-amber-700 font-medium">{pendingOrders.length} pending</span>
            <span className="text-emerald-700 font-medium">{deliveredOrders.length} fulfilled</span>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DADD] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#756D70]">Catalog Items</span>
            <div className="w-10 h-10 rounded-xl bg-[#F3D6DE]/50 text-[#A84462] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#252223]">
            {products.length}
          </div>
          <p className="text-xs text-[#756D70] mt-2">
            {products.filter(p => p.isActive).length} active in public storefront
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DADD] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#756D70]">Inventory Vitals</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              lowStockProducts.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-[#56805D]'
            }`}>
              {lowStockProducts.length > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
          </div>
          <div className={`text-2xl font-serif font-bold ${lowStockProducts.length > 0 ? 'text-amber-600' : 'text-[#252223]'}`}>
            {lowStockProducts.length}
          </div>
          <p className="text-xs text-[#756D70] mt-2">
            {lowStockProducts.length > 0 ? 'Products with 5 or fewer items' : 'All products adequately stocked'}
          </p>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Low Stock Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8DADD] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#FAF8F3]">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#252223]">Recent Orders</h2>
              <p className="text-xs text-[#756D70]">Latest client acquisitions</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-[#C85C7A] hover:text-[#A84462] flex items-center gap-1 transition-colors"
            >
              <span>View all ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#756D70]">
              No orders have been recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#FAF8F3] text-[#756D70] uppercase tracking-wider font-semibold">
                    <th className="pb-3 font-semibold">Order</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Payment</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF8F3]">
                  {recentOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-[#FAF8F3]/50 transition-colors">
                      <td className="py-3 font-medium text-[#252223]">
                        <Link to={`/admin/orders`} className="hover:text-[#C85C7A] font-mono">
                          {ord.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 text-[#252223]">
                        {ord.customer?.firstName ? `${ord.customer.firstName} ${ord.customer.lastName || ''}`.trim() : 'Client'}
                      </td>
                      <td className="py-3 font-semibold text-[#252223]">
                        {formatPrice(ord.total)}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          ord.paymentStatus === 'paid' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : ord.paymentStatus === 'failed'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          ord.orderStatus === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700'
                            : ord.orderStatus === 'shipped'
                            ? 'bg-blue-50 text-blue-700'
                            : ord.orderStatus === 'processing'
                            ? 'bg-purple-50 text-purple-700'
                            : ord.orderStatus === 'cancelled'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts (1 Column) */}
        <div className="bg-white rounded-2xl border border-[#E8DADD] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#FAF8F3]">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#252223]">Low Inventory</h2>
                <p className="text-xs text-[#756D70]">Requires restocking</p>
              </div>
              <Link
                to="/admin/products"
                className="text-xs font-semibold text-[#C85C7A] hover:text-[#A84462] flex items-center gap-1 transition-colors"
              >
                <span>Inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="w-8 h-8 text-[#56805D] mx-auto mb-2 opacity-80" />
                <p className="text-xs text-[#56805D] font-medium">All items have healthy inventory levels.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((prod) => (
                  <div 
                    key={prod._id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#FAF8F3] hover:border-[#E8DADD] bg-[#FAF8F3]/30 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=150&q=80'} 
                        alt={prod.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-[#252223] truncate">{prod.name}</h4>
                        <span className="text-[10px] text-[#756D70]">{formatPrice(prod.price)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        prod.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {prod.stock} left
                      </span>
                      <Link
                        to={`/admin/products/${prod._id}/edit`}
                        className="text-xs text-[#C85C7A] hover:text-[#A84462] p-1 rounded hover:bg-white"
                        title="Edit stock"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-[#FAF8F3]">
            <Link
              to="/admin/products/new"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FAF8F3] hover:bg-[#FBECEF] text-[#252223] hover:text-[#C85C7A] text-xs font-semibold rounded-xl border border-[#E8DADD] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Catalog Entry</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
