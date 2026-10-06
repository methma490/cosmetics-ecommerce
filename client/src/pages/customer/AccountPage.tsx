import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  CreditCard,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import orderService from "../../services/orderService";
import type { Order } from "../../types/order";
import { formatPrice } from "../../utils/formatPrice";
import Loader from "../../components/common/Loader";

export const AccountPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    orderService
      .getMyOrders()
      .then((res) => {
        if (res.success) setOrders(res.orders);
      })
      .catch((err) => console.error("Error loading orders:", err))
      .finally(() => setLoading(false));
  }, []);

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#56805D]/10 text-[#56805D]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
            <Truck className="w-3 h-3" />
            <span>Shipped</span>
          </span>
        );
      case "processing":
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F7EFE9] text-[#B87D4B]">
            <Clock className="w-3 h-3" />
            <span className="capitalize">{status}</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#B33A3A]/10 text-[#B33A3A]">
            <AlertCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Profile Summary */}
      <div className="bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative gold top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4AF37]" />

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F7EFE9] to-[#E8DDD4] text-[#B87D4B] border border-[#D4AF37]/30 flex items-center justify-center font-serif-luxury text-2xl font-bold shadow-xs">
            {user?.profile?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B87D4B] block">
              Client Profile
            </span>
            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-medium text-[#211A1C]">
              {user?.profile?.firstName
                ? `${user.profile.firstName} ${user.profile.lastName}`
                : "My Account"}
            </h1>
            <p className="text-xs text-[#756D70] mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-white border border-[#D4AF37]/40 text-[10px] uppercase font-semibold tracking-wider text-[#B87D4B]">
              {user?.role} Account
            </span>
          </div>
        </div>

        <Link
          to="/shop"
          className="px-6 py-2.5 rounded-full bg-[#B87D4B] hover:bg-[#9E6536] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
        >
          Explore Formulations
        </Link>
      </div>

      {/* Orders Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#F0DFD8] pb-4">
          <h2 className="font-serif-luxury text-2xl font-normal text-[#211A1C] flex items-center gap-2.5">
            <Package className="w-5 h-5 text-[#B87D4B]" />
            <span>My Orders ({orders.length})</span>
          </h2>
        </div>

        {loading ? (
          <Loader text="Loading your purchase history..." />
        ) : orders.length === 0 ? (
          <div className="bg-[#FFFCFA] rounded-2xl border border-[#F0DFD8] p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#F7EFE9] text-[#B87D4B] flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="font-serif-luxury text-xl text-[#211A1C]">
              No orders yet
            </h3>
            <p className="text-xs text-[#756D70] max-w-sm mx-auto">
              When you order with AURA, your order history, delivery tracking, and invoice details will appear here.
            </p>
            <Link
              to="/shop"
              className="inline-block px-6 py-2.5 rounded-full bg-[#B87D4B] hover:bg-[#9E6536] text-white text-xs font-semibold transition-all shadow-xs"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order._id;
              const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={order._id}
                  className="bg-[#FFFCFA] rounded-2xl border border-[#F0DFD8] overflow-hidden shadow-2xs transition-all hover:border-gold-metallic/50"
                >
                  {/* Order Card Header */}
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFF9F5]/80">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-[#252223]">
                          {order.orderNumber}
                        </span>
                        {getOrderStatusBadge(order.orderStatus)}
                      </div>
                      <p className="text-xs text-[#756D70]">
                        Placed on {dateStr} • {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <div className="text-right">
                        <p className="font-serif-luxury text-base font-bold text-[#252223]">
                          {formatPrice(order.total)}
                        </p>
                        <div className="flex items-center gap-1.5 justify-end mt-0.5">
                          <span className="text-[11px] text-[#756D70] capitalize flex items-center gap-1">
                            {order.paymentMethod === "whatsapp" ? (
                              <MessageCircle className="w-3 h-3 text-[#56805D]" />
                            ) : (
                              <CreditCard className="w-3 h-3 text-[#C85C7A]" />
                            )}
                            {order.paymentMethod}
                          </span>
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedOrderId(isExpanded ? null : order._id)
                        }
                        className="p-2 rounded-lg border border-[#E8DADD] hover:bg-white text-[#756D70] hover:text-[#252223] transition-colors"
                        title={isExpanded ? "Collapse details" : "Expand details"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Order Details */}
                  {isExpanded && (
                    <div className="p-6 border-t border-[#E8DADD]/60 space-y-6 animate-in slide-in-from-top-2 duration-150">
                      {/* Products */}
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-[#756D70] font-semibold mb-3">
                          Items in this Order
                        </h4>
                        <div className="divide-y divide-[#E8DADD]/30">
                          {order.items.map((item, i) => (
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
                                  <p className="font-medium text-[#252223]">{item.name}</p>
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

                      {/* Delivery Snapshot */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E8DADD]/40 text-xs text-[#756D70]">
                        <div>
                          <strong className="text-[#252223] block mb-1">
                            Shipping Destination
                          </strong>
                          <p>{order.customer.firstName} {order.customer.lastName}</p>
                          <p>{order.customer.address}</p>
                          {order.customer.apartment && <p>{order.customer.apartment}</p>}
                          <p>{order.customer.city}, {order.customer.country}</p>
                          <p className="mt-1">Phone: {order.customer.phone}</p>
                        </div>

                        <div>
                          <strong className="text-[#252223] block mb-1">
                            Payment Breakdown
                          </strong>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span className="text-[#252223] font-medium">{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shipping:</span>
                              <span className="text-[#252223] font-medium">
                                {order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold text-[#252223] pt-1 border-t border-[#E8DADD]/40">
                              <span>Total:</span>
                              <span className="text-[#C85C7A]">{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
