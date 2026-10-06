import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import paymentService from "../../services/paymentService";
import type { PaymentStatusResponse } from "../../types/order";
import { formatPrice } from "../../utils/formatPrice";

interface PaymentStatusPageProps {
  statusType: "success" | "cancel";
}

export const PaymentStatusPage: React.FC<PaymentStatusPageProps> = ({
  statusType,
}) => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const navigate = useNavigate();

  const [paymentData, setPaymentData] = useState<PaymentStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pollCount, setPollCount] = useState<number>(0);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let intervalId: ReturnType<typeof setInterval>;

    const checkStatus = async () => {
      try {
        const res = await paymentService.getPaymentStatus(orderId);
        if (res.success) {
          setPaymentData(res);

          // If payment verified as paid, stop polling
          if (res.paymentStatus === "paid") {
            setLoading(false);
            return true;
          }
        }
      } catch (err: unknown) {
        console.error("Payment status check error:", err);
      }
      return false;
    };

    // Immediate check
    void checkStatus().then((isPaid) => {
      if (!isPaid && statusType === "success") {
        // Poll every 3 seconds up to 5 times to await webhook callback verification
        intervalId = setInterval(async () => {
          setPollCount((prev) => {
            if (prev >= 4) {
              clearInterval(intervalId);
              setLoading(false);
              return prev;
            }
            return prev + 1;
          });

          const paid = await checkStatus();
          if (paid) {
            clearInterval(intervalId);
          }
        }, 3000);
      } else {
        setLoading(false);
      }
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderId, statusType]);

  if (!orderId) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif-luxury text-2xl text-[#252223]">
          Order Information Missing
        </h2>
        <p className="text-xs text-[#756D70]">
          No order identifier was received from the payment gateway.
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-2.5 rounded-full bg-[#C85C7A] text-white text-xs font-semibold hover:bg-[#A84462] transition-colors"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  // Cancelled flow
  if (statusType === "cancel") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#B33A3A]/10 text-[#B33A3A] flex items-center justify-center mx-auto">
          <XCircle className="w-9 h-9" />
        </div>
        <span className="text-xs uppercase tracking-widest text-[#B33A3A] font-semibold">
          Payment Cancelled
        </span>
        <h1 className="font-serif-luxury text-3xl font-normal text-[#252223]">
          Payment Was Not Completed
        </h1>
        <p className="text-xs text-[#756D70] max-w-md mx-auto leading-relaxed">
          The transaction for order <strong className="text-[#252223] font-mono">{orderId}</strong> was cancelled. Your items remain safe and your card has not been charged.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/cart"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#C85C7A] text-white text-xs font-semibold hover:bg-[#A84462] transition-colors shadow-xs"
          >
            Review Shopping Bag
          </Link>
          <Link
            to="/shop"
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#E8DADD] text-xs font-medium text-[#252223] hover:bg-[#FAF8F3] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Success flow
  return (
    <div className="max-w-xl mx-auto px-4 py-16 space-y-8">
      {loading ? (
        <div className="bg-white rounded-3xl border border-[#E8DADD] p-10 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#FBECEF] text-[#C85C7A] flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="font-serif-luxury text-2xl text-[#252223]">
            Verifying Signature with PayHere...
          </h2>
          <p className="text-xs text-[#756D70] max-w-sm mx-auto leading-relaxed">
            Please hold on while our secure backend verifies PayHere's cryptographic callback signature and updates stock inventory.
          </p>
          <span className="text-[11px] text-[#756D70] block">
            Verification attempt {pollCount + 1} of 5
          </span>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E8DADD] p-8 sm:p-12 text-center space-y-6 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#56805D]/10 text-[#56805D] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-[#56805D] font-semibold">
              Payment Verified Authoritatively
            </span>
            <h1 className="font-serif-luxury text-3xl font-normal text-[#252223] mt-1">
              Payment Successful!
            </h1>
          </div>

          <p className="text-xs text-[#756D70] max-w-md mx-auto leading-relaxed">
            Your payment for order <strong className="font-mono text-[#252223]">{paymentData?.orderNumber || orderId}</strong> has been verified by the backend.
          </p>

          {/* Quick status card */}
          {paymentData && (
            <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E8DADD] text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-[#756D70]">Payment Status:</span>
                <span className="font-bold text-[#56805D] capitalize">
                  {paymentData.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#756D70]">Order Status:</span>
                <span className="font-bold text-[#252223] capitalize">
                  {paymentData.orderStatus}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#E8DADD]/60 pt-2 font-semibold">
                <span>Total Amount:</span>
                <span className="text-[#C85C7A]">{formatPrice(paymentData.total)}</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/account`)}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#C85C7A] text-white text-xs font-semibold hover:bg-[#A84462] transition-colors shadow-xs"
            >
              View in My Orders
            </button>
            <Link
              to="/shop"
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#E8DADD] text-xs font-medium text-[#252223] hover:bg-[#FAF8F3] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatusPage;
