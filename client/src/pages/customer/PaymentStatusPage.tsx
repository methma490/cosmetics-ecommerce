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
  // No order ID: nothing needs to be checked.
  // The component already renders the missing-order UI below.
  if (!orderId) {
    return;
  }

  let intervalId: ReturnType<typeof setInterval> | undefined;
  let cancelled = false;
  let attempts = 0;

  const checkStatus = async (): Promise<boolean> => {
    try {
      const res = await paymentService.getPaymentStatus(orderId);

      // Prevent state updates after unmount / route change
      if (cancelled) {
        return false;
      }

      if (res.success) {
        setPaymentData(res);

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

  const startChecking = async () => {
    const isPaid = await checkStatus();

    if (cancelled) {
      return;
    }

    // No polling needed for cancelled payment flow
    if (isPaid || statusType !== "success") {
      setLoading(false);
      return;
    }

    // PayHere webhook may arrive slightly after redirect,
    // so poll the backend every 3 seconds.
    intervalId = setInterval(async () => {
      attempts += 1;

      if (cancelled) {
        return;
      }

      setPollCount(attempts);

      const paid = await checkStatus();

      if (paid) {
        if (intervalId) {
          clearInterval(intervalId);
        }
        return;
      }

      // Initial request + 4 additional polling attempts = 5 checks
      if (attempts >= 4) {
        if (intervalId) {
          clearInterval(intervalId);
        }

        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 3000);
  };

  void startChecking();

  return () => {
    cancelled = true;

    if (intervalId) {
      clearInterval(intervalId);
    }
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
        <div className="bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] p-8 sm:p-12 shadow-[0_10px_35px_-10px_rgba(217,108,133,0.12)] space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-[#B33A3A]/10 text-[#B33A3A] flex items-center justify-center mx-auto">
            <XCircle className="w-9 h-9" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B33A3A] font-bold block">
            Payment Cancelled
          </span>
          <h1 className="font-serif-luxury text-3xl font-normal text-[#211A1C]">
            Payment Was Not Completed
          </h1>
          <p className="text-xs text-[#756D70] max-w-md mx-auto leading-relaxed">
            The transaction for order <strong className="text-[#211A1C] font-mono">{orderId}</strong> was cancelled. Your items remain safe in your bag and your card has not been charged.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/cart"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#B87D4B] hover:bg-[#9E6536] text-white text-xs font-semibold transition-all shadow-xs"
            >
              Review Shopping Bag
            </Link>
            <Link
              to="/shop"
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#D4AF37]/40 text-xs font-medium text-[#211A1C] hover:bg-[#FFF9F5] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success flow
  return (
    <div className="max-w-xl mx-auto px-4 py-16 space-y-8">
      {loading ? (
        <div className="bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] p-10 text-center space-y-4 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4AF37]" />
          <div className="w-16 h-16 rounded-full bg-[#F7EFE9] text-[#B87D4B] flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="font-serif-luxury text-2xl text-[#211A1C]">
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
        <div className="bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] p-8 sm:p-12 text-center space-y-6 shadow-[0_10px_35px_-10px_rgba(217,108,133,0.12)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gold-metallic" />

          <div className="w-16 h-16 rounded-full bg-[#56805D]/10 text-[#56805D] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold-metallic font-bold block">
              Payment Verified Authoritatively
            </span>
            <h1 className="font-serif-luxury text-3xl font-normal text-[#211A1C] mt-1">
              Payment Successful!
            </h1>
          </div>

          <p className="text-xs text-[#756D70] max-w-md mx-auto leading-relaxed">
            Your payment for order <strong className="font-mono text-[#211A1C]">{paymentData?.orderNumber || orderId}</strong> has been verified by the backend.
          </p>

          {/* Quick status card */}
          {paymentData && (
            <div className="p-4 rounded-2xl bg-[#FFF9F5] border border-gold-metallic/30 text-xs space-y-2 text-left shadow-2xs">
              <div className="flex justify-between">
                <span className="text-[#756D70]">Payment Status:</span>
                <span className="font-bold text-[#56805D] capitalize">
                  {paymentData.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#756D70]">Order Status:</span>
                <span className="font-bold text-[#211A1C] capitalize">
                  {paymentData.orderStatus}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#F0DFD8] pt-2 font-semibold">
                <span>Total Amount:</span>
                <span className="text-[#B87D4B]">{formatPrice(paymentData.total)}</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/account`)}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#B87D4B] hover:bg-[#9E6536] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              View in My Orders
            </button>
            <Link
              to="/shop"
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-gold-metallic/40 text-xs font-medium text-[#211A1C] hover:bg-[#FFF9F5] transition-colors"
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
