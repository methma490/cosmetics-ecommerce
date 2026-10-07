import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  MessageCircle,
  CreditCard,
  MapPin,
} from "lucide-react";
import orderService from "../../services/orderService";
import type { Order } from "../../types/order";
import { formatPrice } from "../../utils/formatPrice";
import Loader from "../../components/common/Loader";

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadOrder = async () => {
      try {
        setLoading(true);
        const res = await orderService.getOrderById(id);
        if (res.success && res.order) {
          setOrder(res.order);
        } else {
          setError("Order not found.");
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Unable to retrieve order details"
        );
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [id]);

  if (loading) {
    return <Loader fullScreen text="Confirming your order..." />;
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif-luxury text-2xl text-[#252223]">Order Placed</h2>
        <p className="text-sm text-[#756D70]">{error || "Your order was created successfully."}</p>
        <Link
          to="/shop"
          className="inline-block px-6 py-2.5 rounded-full bg-[#C85C7A] text-white text-xs font-semibold hover:bg-[#A84462] transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      {/* Top Banner */}
      <div className="text-center space-y-4 bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] p-8 sm:p-12 shadow-[0_10px_35px_-10px_rgba(217,108,133,0.12)] relative overflow-hidden">
        {/* Subtle decorative gold top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gold-metallic" />

        <div className="w-16 h-16 rounded-full bg-[#56805D]/10 text-[#56805D] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-metallic font-bold block">
          Order Confirmed
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#211A1C] font-normal">
          Thank you for choosing AURA
        </h1>
        <p className="text-sm text-[#756D70] max-w-md mx-auto font-light">
          Your order has been registered in our boutique system. An email confirmation has been sent to{" "}
          <strong className="text-[#211A1C] font-medium">{order.customer.email}</strong>.
        </p>

        <div className="pt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF9F5] border border-gold-metallic/40 text-xs shadow-2xs">
          <span className="text-[#756D70]">Order Reference:</span>
          <span className="font-mono font-bold text-gold-metallic">{order.orderNumber}</span>
        </div>
      </div>

      {/* Order Details Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Items */}
        <div className="md:col-span-7 bg-[#FFFCFA] rounded-2xl border border-[#F0DFD8] p-6 space-y-4 shadow-xs">
          <h3 className="font-serif-luxury text-base font-semibold text-[#211A1C] pb-3 border-b border-[#F0DFD8] flex items-center gap-2">
            <Package className="w-4 h-4 text-[#B87D4B]" />
            <span>Ordered Formulations ({order.items.length})</span>
          </h3>

          <div className="divide-y divide-[#F0DFD8]">
            {order.items.map((item, i) => (
              <div key={i} className="py-3 flex items-center gap-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-14 object-cover rounded-lg bg-[#F7EFE9] border border-[#F0DFD8]"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#211A1C] truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-[#756D70]">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#211A1C]">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#F0DFD8] space-y-1.5 text-xs text-[#756D70]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-[#211A1C]">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-medium text-[#211A1C]">
                {order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#211A1C] pt-2 border-t border-[#F0DFD8]">
              <span>Total Paid / Due</span>
              <span className="font-serif-luxury text-base text-[#B87D4B]">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Delivery Meta */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#FFFCFA] rounded-2xl border border-[#F0DFD8] p-6 shadow-xs space-y-4 text-xs">
            <h3 className="font-serif-luxury text-base font-semibold text-[#211A1C] pb-3 border-b border-[#F0DFD8] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#B87D4B]" />
              <span>Delivery Address</span>
            </h3>

            <div className="space-y-1 text-[#756D70]">
              <p className="font-semibold text-[#211A1C]">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <p>{order.customer.address}</p>
              {order.customer.apartment && <p>{order.customer.apartment}</p>}
              <p>
                {order.customer.city}
                {order.customer.postalCode ? ` - ${order.customer.postalCode}` : ""}
              </p>
              <p>{order.customer.country}</p>
              <p className="pt-2 text-[#211A1C]">Phone: {order.customer.phone}</p>
            </div>
          </div>

          <div className="bg-[#FFFCFA] rounded-2xl border border-[#F0DFD8] p-6 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#756D70]">Payment Method:</span>
              <span className="font-semibold text-[#211A1C] capitalize flex items-center gap-1.5">
                {order.paymentMethod === "whatsapp" ? (
                  <>
                    <MessageCircle className="w-3.5 h-3.5 text-[#56805D]" />
                    <span>WhatsApp Order</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5 text-[#B87D4B]" />
                    <span>PayHere Sandbox</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#756D70]">Payment Status:</span>
              <span
                className={`font-semibold capitalize px-2 py-0.5 rounded-full text-[11px] ${
                  order.paymentStatus === "paid"
                    ? "bg-[#56805D]/10 text-[#56805D]"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#756D70]">Order Status:</span>
              <span className="font-semibold text-[#211A1C] capitalize px-2 py-0.5 rounded-full bg-[#FFF9F5] border border-gold-metallic/40 text-gold-metallic">
                {order.orderStatus}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {order.paymentMethod === "whatsapp" && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const wa = await orderService.getWhatsAppOrder(order._id);
                    if (wa.whatsappUrl) window.open(wa.whatsappUrl, "_blank");
                  } catch {
                    // Fallback direct WhatsApp link
                    const msg = `Hello AURA Haute Beauté! Here is my confirmed order: ${order.orderNumber} (Total: ${formatPrice(order.total)}).`;
                    window.open(`https://wa.me/94743301490?text=${encodeURIComponent(msg)}`, "_blank");
                  }
                }}
                className="w-full py-3.5 px-4 rounded-full bg-[#56805D] hover:bg-[#436449] text-white text-xs font-semibold uppercase tracking-wider text-center transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp Concierge</span>
              </button>
            )}
            <Link
              to="/account"
              className="w-full py-3.5 px-4 rounded-full bg-[#B87D4B] hover:bg-[#9E6536] text-white text-xs font-semibold uppercase tracking-wider text-center transition-all shadow-xs"
            >
              View in My Orders
            </Link>
            <Link
              to="/shop"
              className="w-full py-3 px-4 rounded-full border border-gold-metallic/40 text-xs font-medium text-[#211A1C] text-center hover:bg-[#FFF9F5] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
