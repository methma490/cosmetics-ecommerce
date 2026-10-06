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
      <div className="text-center space-y-4 bg-white rounded-3xl border border-[#E8DADD] p-8 sm:p-12 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-[#56805D]/10 text-[#56805D] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-xs uppercase tracking-widest text-[#C85C7A] font-semibold">
          Order Confirmed
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#252223] font-normal">
          Thank you for choosing AURA
        </h1>
        <p className="text-sm text-[#756D70] max-w-md mx-auto font-light">
          Your order has been registered in our boutique system. An email confirmation has been sent to{" "}
          <strong className="text-[#252223] font-medium">{order.customer.email}</strong>.
        </p>

        <div className="pt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF8F3] border border-[#E8DADD] text-xs">
          <span className="text-[#756D70]">Order Number:</span>
          <span className="font-mono font-bold text-[#252223]">{order.orderNumber}</span>
        </div>
      </div>

      {/* Order Details Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Items */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-[#E8DADD] p-6 space-y-4 shadow-xs">
          <h3 className="font-serif-luxury text-base font-semibold text-[#252223] pb-3 border-b border-[#E8DADD]/60 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#C85C7A]" />
            <span>Ordered Formulations ({order.items.length})</span>
          </h3>

          <div className="divide-y divide-[#E8DADD]/40">
            {order.items.map((item, i) => (
              <div key={i} className="py-3 flex items-center gap-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-14 object-cover rounded-lg bg-[#FBECEF] border border-[#E8DADD]/50"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#252223] truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-[#756D70]">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#252223]">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E8DADD]/60 space-y-1.5 text-xs text-[#756D70]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-[#252223]">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-medium text-[#252223]">
                {order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#252223] pt-2 border-t border-[#E8DADD]">
              <span>Total Paid / Due</span>
              <span className="font-serif-luxury text-base text-[#C85C7A]">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Delivery Meta */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E8DADD] p-6 shadow-xs space-y-4 text-xs">
            <h3 className="font-serif-luxury text-base font-semibold text-[#252223] pb-3 border-b border-[#E8DADD]/60 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C85C7A]" />
              <span>Delivery Address</span>
            </h3>

            <div className="space-y-1 text-[#756D70]">
              <p className="font-semibold text-[#252223]">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <p>{order.customer.address}</p>
              {order.customer.apartment && <p>{order.customer.apartment}</p>}
              <p>
                {order.customer.city}
                {order.customer.postalCode ? ` - ${order.customer.postalCode}` : ""}
              </p>
              <p>{order.customer.country}</p>
              <p className="pt-2 text-[#252223]">Phone: {order.customer.phone}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DADD] p-6 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#756D70]">Payment Method:</span>
              <span className="font-semibold text-[#252223] capitalize flex items-center gap-1.5">
                {order.paymentMethod === "whatsapp" ? (
                  <>
                    <MessageCircle className="w-3.5 h-3.5 text-[#56805D]" />
                    <span>WhatsApp Order</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5 text-[#C85C7A]" />
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
              <span className="font-semibold text-[#252223] capitalize px-2 py-0.5 rounded-full bg-[#FAF8F3] border border-[#E8DADD]">
                {order.orderStatus}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/account"
              className="w-full py-3.5 px-4 rounded-full bg-[#C85C7A] text-white text-xs font-semibold uppercase tracking-wider text-center hover:bg-[#A84462] transition-colors shadow-xs"
            >
              View in My Orders
            </Link>
            <Link
              to="/shop"
              className="w-full py-3 px-4 rounded-full border border-[#E8DADD] text-xs font-medium text-[#252223] text-center hover:bg-[#FAF8F3] transition-colors"
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
