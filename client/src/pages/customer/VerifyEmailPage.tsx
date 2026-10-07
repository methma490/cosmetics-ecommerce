import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  ArrowRight,
  Loader2,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification } = useAuth();

  const state = location.state as
    | { email?: string; firstName?: string; devCode?: string }
    | undefined;

  const [email, setEmail] = useState<string>(state?.email || "");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [devCode, setDevCode] = useState<string | undefined>(state?.devCode);
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for resending verification code
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Focus the first empty digit on initial load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/[^0-9]/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits filled
    if (char && index === 5 && newDigits.every((d) => d !== "")) {
      void submitVerification(newDigits.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      if (pasteData[i]) {
        newDigits[i] = pasteData[i];
      }
    }
    setDigits(newDigits);

    const focusIndex = Math.min(5, pasteData.length);
    inputRefs.current[focusIndex]?.focus();

    if (newDigits.every((d) => d !== "")) {
      void submitVerification(newDigits.join(""));
    }
  };

  const submitVerification = async (codeToVerify?: string) => {
    const code = codeToVerify || digits.join("");
    if (!email.trim()) {
      toast.error("Please provide your email address.");
      return;
    }

    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      setSubmitting(true);
      await verifyEmail(email.trim(), code);
      setVerifiedSuccess(true);
      toast.success("Account successfully verified! Welcome to AURA Atelier.");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Invalid or expired verification code.";
      toast.error(msg);
      // Focus on first box to re-try
      inputRefs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitVerification();
  };

  const handleResendCode = async () => {
    if (!email.trim() || !canResend || resending) return;

    try {
      setResending(true);
      const res = await resendVerification(email.trim());
      toast.success("A fresh verification code has been dispatched to your email.");
      if (res.devCode) {
        setDevCode(res.devCode);
      }
      setCountdown(60);
      setCanResend(false);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Unable to resend verification code.";
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  const handleApplyDevCode = () => {
    if (!devCode || devCode.length !== 6) return;
    const split = devCode.split("");
    setDigits(split);
    void submitVerification(devCode);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] p-8 sm:p-10 shadow-[0_12px_40px_-15px_rgba(217,108,133,0.15)] space-y-6 relative overflow-hidden">
        {/* Subtle decorative gold top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#B87D4B] to-[#9E6536]" />

        {/* Header Icon & Title */}
        <div className="text-center space-y-2.5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F7EFE9] to-[#EFE1D6] text-[#B87D4B] border border-[#D4AF37]/35 flex items-center justify-center mx-auto shadow-xs">
            {verifiedSuccess ? (
              <CheckCircle2 className="w-8 h-8 text-[#56805D] animate-in zoom-in-75 duration-300" />
            ) : (
              <Mail className="w-7 h-7 text-[#B87D4B]" />
            )}
          </div>

          <span className="inline-block text-[10px] tracking-[0.25em] uppercase font-bold text-gold-metallic">
            Email Verification
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#211A1C] font-normal">
            {verifiedSuccess ? "Account Verified!" : "Verify Your Account"}
          </h1>
          <p className="text-xs text-[#756D70] max-w-xs mx-auto leading-relaxed">
            {verifiedSuccess
              ? "Your personal atelier account is now activated. Welcome to AURA."
              : "We have dispatched a 6-digit security code to your registered email address:"}
          </p>

          {/* Email Pill / Input */}
          {!verifiedSuccess && (
            <div className="pt-1">
              {!state?.email ? (
                <div className="text-left">
                  <label className="block text-[11px] font-medium text-[#756D70] mb-1">
                    Email Address to Verify
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#F0DFD8] text-xs text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B]"
                  />
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF9F5] border border-[#F0DFD8] text-xs font-semibold text-[#211A1C]">
                  <span>{email}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Verification Form */}
        {!verifiedSuccess && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 6-Digit Boxes */}
            <div className="space-y-2">
              <label className="block text-center text-xs font-medium text-[#756D70]">
                Enter 6-Digit Security Code
              </label>
              <div className="flex justify-between gap-2 sm:gap-2.5">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    aria-label={`Digit ${idx + 1}`}
                    className="w-11 sm:w-12 h-14 text-center text-xl sm:text-2xl font-mono font-bold text-[#211A1C] bg-white rounded-2xl border border-[#F0DFD8] focus:border-[#B87D4B] focus:ring-2 focus:ring-[#B87D4B]/20 outline-hidden transition-all shadow-2xs"
                  />
                ))}
              </div>
            </div>

            {/* Developer/Testing Convenience Pill (Visible if devCode is returned) */}
            {devCode && (
              <div className="p-3 bg-[#FFF9F5] rounded-xl border border-amber-300/60 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-amber-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Development Test Code: <strong className="font-mono text-xs">{devCode}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyDevCode}
                  className="text-[11px] text-[#B87D4B] hover:text-[#9E6536] font-semibold underline cursor-pointer"
                >
                  Click to Auto-Fill & Verify
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || digits.some((d) => d === "")}
              className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#B87D4B] to-[#9E6536] text-white text-xs font-semibold uppercase tracking-widest hover:brightness-105 flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(184,125,75,0.25)] cursor-pointer disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Activate My Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Resend and Navigation Footer */}
        {!verifiedSuccess && (
          <div className="pt-4 border-t border-[#F0DFD8] text-center space-y-3 text-xs text-[#756D70]">
            <div>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="font-semibold text-[#B87D4B] hover:text-[#9E6536] flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                  <span>Resend Verification Code</span>
                </button>
              ) : (
                <p>
                  Resend code in{" "}
                  <span className="font-mono font-semibold text-[#211A1C]">
                    {countdown}s
                  </span>
                </p>
              )}
            </div>

            <div>
              <Link
                to="/register"
                className="text-[11px] text-[#756D70] hover:text-[#211A1C] inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Return to registration</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
