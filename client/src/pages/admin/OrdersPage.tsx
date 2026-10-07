import React, { useCallback, useEffect, useState } from "react";
import {
  ShoppingBag,
  CreditCard,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import orderService from "../../services/orderService";
import type { Order, OrderStatus, PaymentStatus } from "../../types/order";
import { formatPrice } from "../../utils/formatPrice";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import { useConfirm } from "../../hooks/useConfirm";

export const OrdersPage: React.FC = () => {
  const { confirm } = useConfirm();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("");

  // Inspect Modal
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Lock background scrolling when Inspect modal is open
  useBodyScrollLock(Boolean(inspectOrder));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && inspectOrder) {
        setInspectOrder(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inspectOrder]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const filters: Record<string, string> = {};
      if (statusFilter) filters.status = statusFilter;
      if (paymentStatusFilter) filters.paymentStatus = paymentStatusFilter;
      if (paymentMethodFilter) filters.paymentMethod = paymentMethodFilter;

      const res = await orderService.getAllOrders(filters);
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error("Orders load error:", err);
      toast.error("Failed to load orders list");
    } finally {
      setLoading(false);
    }
  }, [paymentMethodFilter, paymentStatusFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadOrders();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadOrders]);

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      setUpdatingStatus(true);
      const res = await orderService.updateOrderStatus(orderId, newStatus);
      if (res.success && res.order) {
        toast.success(`Order status updated to "${newStatus}".`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.order : o))
        );
        if (inspectOrder && inspectOrder._id === orderId) {
          setInspectOrder(res.order);
        }
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePaymentStatus = async (
    orderId: string,
    newStatus: PaymentStatus
  ) => {
    try {
      setUpdatingStatus(true);
      const res = await orderService.updatePaymentStatus(orderId, newStatus);
      if (res.success && res.order) {
        toast.success(`Payment status updated to "${newStatus}".`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.order : o))
        );
        if (inspectOrder && inspectOrder._id === orderId) {
          setInspectOrder(res.order);
        }
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update payment status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    const isConfirmed = await confirm({
      title: `Delete Order ${orderNumber}?`,
      message: "Are you sure you want to permanently delete this order record? This action cannot be reversed.",
      confirmText: "Delete Order",
      confirmVariant: "danger",
      iconType: "danger",
    });

    if (!isConfirmed) {
      return;
    }

    try {
      setUpdatingStatus(true);
      const res = await orderService.deleteOrder(orderId);
      if (res.success) {
        toast.success(`Order ${orderNumber} deleted successfully.`);
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        if (inspectOrder && inspectOrder._id === orderId) {
          setInspectOrder(null);
        }
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete order."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#56805D]/10 text-[#56805D]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
            <Truck className="w-3 h-3" />
            <span>Shipped</span>
          </span>
        );
      case "processing":
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FBECEF] text-[#C85C7A]">
            <Clock className="w-3 h-3" />
            <span className="capitalize">{status}</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#B33A3A]/10 text-[#B33A3A]">
            <AlertCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#56805D]/10 text-[#56805D]">
            Paid
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#B33A3A]/10 text-[#B33A3A]">
            Failed
          </span>
        );
      case "refunded":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700">
            Refunded
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#F0DFD8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold-metallic block">
            Fulfillment Center
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#211A1C]">
            Customer Orders
          </h1>
          <p className="text-xs text-[#756D70] mt-1">
            Track customer orders, verify PayHere status, and dispatch shipments.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#FFFCFA] rounded-2xl border border-[#F0DFD8] p-4 flex flex-wrap gap-4 items-center justify-between shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Order Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#F0DFD8] text-xs text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20"
          >
            <option value="">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Status */}
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#F0DFD8] text-xs text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20"
          >
            <option value="">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Payment Method */}
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#F0DFD8] text-xs text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20"
          >
            <option value="">All Methods</option>
            <option value="payhere">PayHere</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>

        <span className="text-xs text-[#756D70]">
          Total: <strong className="text-[#211A1C]">{orders.length}</strong> orders
        </span>
      </div>

      {/* Orders Table */}
      {loading ? (
        <Loader text="Loading orders..." />
      ) : orders.length === 0 ? (
        <div className="bg-[#FFFCFA] rounded-2xl border border-[#F0DFD8] p-12 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-[#F7EFE9] text-[#B87D4B] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="font-serif-luxury text-lg text-[#211A1C]">
            No orders found
          </h3>
          <p className="text-xs text-[#756D70]">
            Adjust your filter criteria or wait for customer checkouts.
          </p>
        </div>
      ) : (
        <div className="bg-[#FFFCFA] rounded-2xl border border-[#F0DFD8] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF9F5] border-b border-[#F0DFD8] text-[#756D70] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0DFD8]">
                {orders.map((o) => {
                  const dateStr = new Date(o.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  );

                  return (
                    <tr key={o._id} className="hover:bg-[#FFF9F5]/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#252223]">
                        {o.orderNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-medium text-[#252223]">
                          {o.customer.firstName} {o.customer.lastName}
                        </p>
                        <p className="text-[11px] text-[#756D70]">
                          {o.customer.city}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-[#756D70]">{dateStr}</td>

                      <td className="py-3.5 px-4 text-[#756D70]">
                        {o.items.length} {o.items.length === 1 ? "item" : "items"}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-[#252223]">
                        {formatPrice(o.total)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="capitalize flex items-center gap-1 text-[11px] text-[#756D70]">
                            {o.paymentMethod === "whatsapp" ? (
                              <MessageCircle className="w-3 h-3 text-[#56805D]" />
                            ) : (
                              <CreditCard className="w-3 h-3 text-[#C85C7A]" />
                            )}
                            {o.paymentMethod}
                          </span>
                          {getPaymentStatusBadge(o.paymentStatus)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {getOrderStatusBadge(o.orderStatus)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectOrder(o)}
                            className="p-1.5 rounded-lg border border-[#E8DADD] text-[#756D70] hover:text-[#C85C7A] hover:bg-white transition-colors"
                            title="Inspect full order"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(o._id, o.orderNumber)}
                            className="p-1.5 rounded-lg border border-[#F0DFD8] text-[#756D70] hover:text-[#DC2626] hover:bg-[#FEE2E2]/40 transition-colors"
                            title="Delete order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect & Manage Order Modal */}
      {inspectOrder && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectOrder(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
        >
          <div className="bg-white rounded-3xl border border-[#E8DADD] p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DADD]/60">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C85C7A]">
                  Order Details
                </span>
                <h3 className="font-mono text-base font-bold text-[#252223]">
                  {inspectOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectOrder(null)}
                className="p-1.5 text-[#756D70] hover:text-[#252223]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Modifiers */}
            <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E8DADD] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#252223] mb-1">
                  Update Order Status
                </label>
                <select
                  value={inspectOrder.orderStatus}
                  disabled={updatingStatus}
                  onChange={(e) =>
                    handleUpdateOrderStatus(
                      inspectOrder._id,
                      e.target.value as OrderStatus
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DADD] text-xs bg-white text-[#252223] focus:outline-hidden focus:border-[#C85C7A]"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252223] mb-1">
                  Update Payment Status
                </label>
                <select
                  value={inspectOrder.paymentStatus}
                  disabled={updatingStatus}
                  onChange={(e) =>
                    handleUpdatePaymentStatus(
                      inspectOrder._id,
                      e.target.value as PaymentStatus
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DADD] text-xs bg-white text-[#252223] focus:outline-hidden focus:border-[#C85C7A]"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Line items list */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-[#756D70] font-semibold mb-3">
                Items ({inspectOrder.items.length})
              </h4>
              <div className="divide-y divide-[#E8DADD]/40">
                {inspectOrder.items.map((item, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-12 object-cover rounded-md bg-[#FBECEF] border border-[#E8DADD]/40"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-[#252223]">{item.name}</p>
                        <p className="text-[#756D70]">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-[#252223]">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information & Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E8DADD]/60 text-xs text-[#756D70]">
              <div className="space-y-1">
                <strong className="text-[#252223] block mb-1">
                  Customer & Delivery
                </strong>
                <p className="text-[#252223] font-medium">
                  {inspectOrder.customer.firstName} {inspectOrder.customer.lastName}
                </p>
                <p>{inspectOrder.customer.email}</p>
                <p>{inspectOrder.customer.phone}</p>
                <p className="pt-1">{inspectOrder.customer.address}</p>
                {inspectOrder.customer.apartment && (
                  <p>{inspectOrder.customer.apartment}</p>
                )}
                <p>
                  {inspectOrder.customer.city},{" "}
                  {inspectOrder.customer.postalCode || ""},{" "}
                  {inspectOrder.customer.country}
                </p>
              </div>

              <div className="space-y-2">
                <strong className="text-[#252223] block mb-1">Financials</strong>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium text-[#252223]">
                    {formatPrice(inspectOrder.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-medium text-[#252223]">
                    {inspectOrder.shippingFee === 0
                      ? "Free"
                      : formatPrice(inspectOrder.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#252223] pt-2 border-t border-[#E8DADD]/60">
                  <span>Total:</span>
                  <span className="text-[#C85C7A]">
                    {formatPrice(inspectOrder.total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8DADD] flex items-center justify-between">
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() =>
                  handleDeleteOrder(inspectOrder._id, inspectOrder.orderNumber)
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Order
              </button>

              <button
                type="button"
                onClick={() => setInspectOrder(null)}
                className="px-6 py-2.5 rounded-full bg-[#252223] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
