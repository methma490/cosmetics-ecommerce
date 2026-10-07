import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Truck,
  Lock,
  Loader2,
  Sparkles,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import orderService from "../../services/orderService";
import paymentService from "../../services/paymentService";
import type { OrderCustomer, PaymentMethod } from "../../types/order";
import { formatPrice } from "../../utils/formatPrice";
import toast from "react-hot-toast";

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, shippingFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState<OrderCustomer>(() => ({
    firstName: user?.profile?.firstName || "",
    lastName: user?.profile?.lastName || "",
    email: user?.email || "",
    phone: user?.profile?.phone || "",
    address: user?.profile?.address || "",
    apartment: "",
    city: user?.profile?.city || "",
    postalCode: user?.profile?.postalCode || "",
    country: "Sri Lanka",
  }));

  // Validation State
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Autofill if user profile loads asynchronously
  useEffect(() => {
    if (user?.email) {
      const timer = setTimeout(() => {
        setFormData((prev) => {
          if (prev.email && prev.firstName) return prev;
          return {
            ...prev,
            firstName: prev.firstName || user.profile?.firstName || "",
            lastName: prev.lastName || user.profile?.lastName || "",
            email: prev.email || user.email || "",
            phone: prev.phone || user.profile?.phone || "",
            address: prev.address || user.profile?.address || "",
            city: prev.city || user.profile?.city || "",
            postalCode: prev.postalCode || user.profile?.postalCode || "",
          };
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("payhere");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Field validator helper
  const validateField = (name: string, value: string): string => {
    const val = value.trim();
    switch (name) {
      case "firstName":
        if (!val) return "First name is required";
        if (val.length < 2) return "First name must be at least 2 characters";
        if (!/^[a-zA-Z\s'-]+$/.test(val)) return "Please enter a valid first name";
        return "";
      case "lastName":
        if (!val) return "Last name is required";
        if (val.length < 2) return "Last name must be at least 2 characters";
        if (!/^[a-zA-Z\s'-]+$/.test(val)) return "Please enter a valid last name";
        return "";
      case "email":
        if (!val) return "Email address is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          return "Please enter a valid email address (e.g. name@domain.com)";
        }
        return "";
      case "phone": {
        if (!val) return "Mobile phone number is required";
        const cleanPhone = val.replace(/[\s-]/g, "");
        if (
          !/^(?:\+94|0)?7\d{8}$/.test(cleanPhone) &&
          !/^\+?\d{9,14}$/.test(cleanPhone)
        ) {
          return "Please enter a valid phone number (e.g. 0771234567 or +94771234567)";
        }
        return "";
      }
      case "address":
        if (!val) return "Street address is required";
        if (val.length < 5) return "Please enter complete street address (min 5 characters)";
        return "";
      case "city":
        if (!val) return "City is required";
        if (val.length < 2) return "Please enter a valid city name";
        return "";
      case "postalCode":
        if (val && !/^\d{4,6}$/.test(val)) {
          return "Postal code must be 4 to 6 digits";
        }
        return "";
      default:
        return "";
    }
  };

  // If bag is empty, redirect to shop
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4 bg-[#FFF9F5]">
        <h2 className="font-serif-luxury text-2xl text-[#211A1C]">
          Your bag is empty
        </h2>
        <p className="text-xs text-[#7D7275]">
          Please select formulations from our catalog before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="inline-block px-8 py-3 rounded-full bg-[#B87D4B] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#9E6536] transition-colors border border-[#D4AF37]/40"
        >
          Explore Boutique
        </Link>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, (formData as unknown as Record<string, string>)[field] || "");
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {
      firstName: validateField("firstName", formData.firstName),
      lastName: validateField("lastName", formData.lastName),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
      address: validateField("address", formData.address),
      city: validateField("city", formData.city),
      postalCode: validateField("postalCode", formData.postalCode || ""),
    };

    const allTouched: Record<string, boolean> = {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      postalCode: true,
    };
    setTouched(allTouched);
    setErrors(newErrors);

    const errorKeys = Object.keys(newErrors).filter((k) => Boolean(newErrors[k]));
    if (errorKeys.length > 0) {
      toast.error("Please correct the highlighted delivery fields.");
      const firstField = document.getElementsByName(errorKeys[0])[0];
      if (firstField) {
        firstField.focus();
        firstField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Prepare items payload
      const orderItems = items.map((i) => ({
        product: i.product._id,
        quantity: i.quantity,
      }));

      // 2. Create Order in backend
      const orderRes = await orderService.createOrder({
        items: orderItems,
        customer: formData,
        paymentMethod,
      });

      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.message || "Failed to create order");
      }

      const createdOrder = orderRes.order;

      // 3A. WhatsApp flow
      if (paymentMethod === "whatsapp") {
        toast.loading("Preparing WhatsApp order...", { duration: 1500 });
        try {
          const waRes = await orderService.getWhatsAppOrder(createdOrder._id);
          if (waRes.whatsappUrl) {
            clearCart();
            window.open(waRes.whatsappUrl, "_blank");
            navigate(`/order-success/${createdOrder._id}`);
            return;
          }
        } catch {
          // If WhatsApp endpoint fails, navigate to success anyway
          clearCart();
          navigate(`/order-success/${createdOrder._id}`);
          return;
        }
      }

      // 3B. PayHere Sandbox flow
      if (paymentMethod === "payhere") {
        toast.loading("Initiating PayHere Sandbox checkout...", {
          duration: 1500,
        });

        const payRes = await paymentService.initiatePayHere(createdOrder._id);

        if (!payRes.success || !payRes.payment) {
          throw new Error("Unable to generate PayHere payment parameters");
        }

        const payment = payRes.payment;

        // Create and auto-submit PayHere HTML POST Form
        const form = document.createElement("form");
        form.method = "POST";
        form.action = payment.checkout_url;
        form.style.display = "none";

        Object.entries(payment).forEach(([key, val]) => {
          if (typeof val === "string" || typeof val === "number") {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = String(val);
            form.appendChild(input);
          }
        });

        document.body.appendChild(form);
        clearCart();
        form.submit();
      }
    } catch (err: unknown) {
      console.error("Checkout submission error:", err);
      toast.error(
        err instanceof Error ? err.message : "Checkout failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#211A1C] transition-all focus:outline-hidden ${
      hasError
        ? "border-[#B33A3A] bg-[#FFFBFB] ring-1 ring-[#B33A3A]/20"
        : "border-[#F0DFD8] bg-[#FFFCFA] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
    }`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#FFF9F5]">
      {/* Checkout Title */}
      <div className="pb-4 border-b border-[#F0DFD8] flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.24em] text-[#D4AF37] font-bold mb-1">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>Secure Checkout</span>
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#211A1C]">
            Complete Your Ritual Order
          </h1>
          <p className="text-xs text-[#7D7275] mt-1">
            Choose between instant encrypted PayHere online payment or direct WhatsApp concierge assistance.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#56805D] font-medium bg-[#56805D]/10 px-3.5 py-1.5 rounded-full border border-[#56805D]/20">
          <Lock className="w-3.5 h-3.5" />
          <span>Encrypted Checkout</span>
        </div>
      </div>

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10" noValidate>
        {/* Left Columns: Customer Information & Payment Method */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Customer Contact & Delivery Details */}
          <div className="bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0DFD8]">
              <h2 className="font-serif-luxury text-lg font-semibold text-[#211A1C] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#FFF9F5] border border-[#D4AF37]/50 text-[#8F6B00] text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>Delivery Details</span>
              </h2>

              {/* Account Status Badge */}
              {user ? (
                <div className="inline-flex items-center gap-1.5 text-[11px] text-[#56805D] bg-[#56805D]/10 px-3 py-1 rounded-full font-medium">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>
                    Logged in as{" "}
                    <strong>
                      {user.profile?.firstName || user.email}
                    </strong>
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-[#7D7275] flex items-center gap-1">
                  <span>Guest Checkout</span>
                  <span>•</span>
                  <Link
                    to="/login"
                    state={{ from: { pathname: "/checkout" } }}
                    className="text-[#B87D4B] font-semibold hover:underline"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#211A1C] mb-1">
                  First Name <span className="text-[#B33A3A]">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={() => handleBlur("firstName")}
                  placeholder="e.g. Kasun"
                  className={getInputClassName("firstName")}
                />
                {touched.firstName && errors.firstName && (
                  <p className="mt-1 text-[11px] text-[#B33A3A] flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.firstName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#211A1C] mb-1">
                  Last Name <span className="text-[#B33A3A]">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={() => handleBlur("lastName")}
                  placeholder="e.g. Perera"
                  className={getInputClassName("lastName")}
                />
                {touched.lastName && errors.lastName && (
                  <p className="mt-1 text-[11px] text-[#B33A3A] flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.lastName}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#211A1C] mb-1">
                  Email Address <span className="text-[#B33A3A]">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  placeholder="kasun@example.com"
                  className={getInputClassName("email")}
                />
                {touched.email && errors.email && (
                  <p className="mt-1 text-[11px] text-[#B33A3A] flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#211A1C] mb-1">
                  Mobile Phone <span className="text-[#B33A3A]">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur("phone")}
                  placeholder="0771234567"
                  className={getInputClassName("phone")}
                />
                {touched.phone && errors.phone && (
                  <p className="mt-1 text-[11px] text-[#B33A3A] flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#211A1C] mb-1">
                Street Address <span className="text-[#B33A3A]">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={() => handleBlur("address")}
                placeholder="No. 45, Flower Road"
                className={getInputClassName("address")}
              />
              {touched.address && errors.address && (
                <p className="mt-1 text-[11px] text-[#B33A3A] flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.address}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#211A1C] mb-1">
                  Apartment / Suite <span className="text-[#7D7275] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleChange}
                  placeholder="Apt 4B"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0DFD8] text-xs sm:text-sm text-[#211A1C] bg-[#FFFCFA] focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#211A1C] mb-1">
                  City <span className="text-[#B33A3A]">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={() => handleBlur("city")}
                  placeholder="Colombo 07"
                  className={getInputClassName("city")}
                />
                {touched.city && errors.city && (
                  <p className="mt-1 text-[11px] text-[#B33A3A] flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.city}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#211A1C] mb-1">
                  Postal Code <span className="text-[#7D7275] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  onBlur={() => handleBlur("postalCode")}
                  placeholder="00700"
                  className={getInputClassName("postalCode")}
                />
                {touched.postalCode && errors.postalCode && (
                  <p className="mt-1 text-[11px] text-[#B33A3A] flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.postalCode}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#211A1C] mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0DFD8] text-xs sm:text-sm text-[#7D7275] bg-[#FFF9F5] cursor-not-allowed font-medium"
              />
            </div>
          </div>

          {/* Section 2: Payment Method Selector */}
          <div className="bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="font-serif-luxury text-lg font-semibold text-[#211A1C] pb-3 border-b border-[#F0DFD8] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FFF9F5] border border-[#D4AF37]/50 text-[#8F6B00] text-xs flex items-center justify-center font-bold">2</span>
              <span>Payment Method</span>
            </h2>

            <div className="space-y-4">
              {/* Option 1: PayHere */}
              <label
                className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "payhere"
                    ? "border-[#D4AF37] bg-[#FFF9F5] shadow-xs"
                    : "border-[#F0DFD8] hover:border-[#D4AF37]/50 bg-[#FFFCFA]"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="payhere"
                  checked={paymentMethod === "payhere"}
                  onChange={() => setPaymentMethod("payhere")}
                  className="mt-1 text-[#B87D4B] focus:ring-[#B87D4B]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#8F6B00]" />
                      <span className="font-semibold text-sm text-[#211A1C]">
                        PayHere Online Payment (Sandbox)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F6B00] bg-white border border-[#D4AF37]/40 px-2.5 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-[#7D7275] mt-1 leading-relaxed">
                    Pay securely using Visa, Mastercard, or local mobile wallets via PayHere Sandbox. Real-time signature authentication and inventory safety.
                  </p>
                </div>
              </label>

              {/* Option 2: WhatsApp */}
              <label
                className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "whatsapp"
                    ? "border-[#56805D] bg-[#56805D]/5 shadow-xs"
                    : "border-[#F0DFD8] hover:border-[#56805D]/50 bg-[#FFFCFA]"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="whatsapp"
                  checked={paymentMethod === "whatsapp"}
                  onChange={() => setPaymentMethod("whatsapp")}
                  className="mt-1 text-[#56805D] focus:ring-[#56805D]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-[#56805D]" />
                      <span className="font-semibold text-sm text-[#211A1C]">
                        Order via WhatsApp Concierge
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#56805D] bg-white border border-[#56805D]/40 px-2.5 py-0.5 rounded-full">
                      Direct Atelier
                    </span>
                  </div>
                  <p className="text-xs text-[#7D7275] mt-1 leading-relaxed">
                    Creates your verified order in our system and opens WhatsApp with your pre-formatted order summary to confirm payment & delivery details.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] p-6 shadow-xs sticky top-28 space-y-6">
            <h3 className="font-serif-luxury text-lg text-[#211A1C] pb-3 border-b border-[#F0DFD8] flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-[#7D7275] font-sans">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </h3>

            {/* Items list preview */}
            <div className="max-h-64 overflow-y-auto divide-y divide-[#F0DFD8] pr-1">
              {items.map((i) => (
                <div key={i.product._id} className="py-3 flex items-center gap-3">
                  <img
                    src={i.product.images?.[0] || ""}
                    alt={i.product.name}
                    className="w-12 h-14 object-cover rounded-xl bg-[#FFF9F5] border border-[#F0DFD8]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#211A1C] truncate">
                      {i.product.name}
                    </p>
                    <p className="text-[11px] text-[#7D7275]">
                      Qty: {i.quantity} × {formatPrice(i.product.price)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#211A1C]">
                    {formatPrice(i.product.price * i.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-[#F0DFD8] space-y-2 text-xs text-[#7D7275]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#211A1C]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-[#211A1C]">
                  {shippingFee === 0 ? (
                    <span className="text-[#56805D]">Free Express</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#211A1C] pt-3 border-t border-[#F0DFD8]">
                <span>Total Due</span>
                <span className="font-serif-luxury text-xl text-[#B87D4B]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-full text-xs font-semibold uppercase tracking-[0.16em] flex items-center justify-center gap-2 transition-all shadow-md ${
                isSubmitting
                  ? "bg-[#F0DFD8] text-[#7D7275] cursor-not-allowed"
                  : paymentMethod === "whatsapp"
                  ? "bg-[#56805D] text-white hover:bg-[#436449] hover:shadow-lg cursor-pointer border border-[#56805D]/40"
                  : "bg-[#B87D4B] text-white hover:bg-[#9E6536] hover:shadow-lg cursor-pointer border border-[#B87D4B]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : paymentMethod === "whatsapp" ? (
                <>
                  <MessageCircle className="w-4 h-4" />
                  <span>Confirm & Order on WhatsApp</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay Now via PayHere</span>
                </>
              )}
            </button>

            {/* Reassurance notes */}
            <div className="pt-2 text-[11px] text-[#7D7275] space-y-2 border-t border-[#F0DFD8]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8F6B00]" />
                <span>Backend inventory locked prior to payment execution</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#B87D4B]" />
                <span>Dispatched within 24 hours in protective luxury box</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
