import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validation State
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as
    | {
        from?: { pathname: string };
        notification?: string;
      }
    | undefined;
  const from = locationState?.from?.pathname || "/";

  useEffect(() => {
    if (!locationState?.notification) {
      return;
    }

    toast.error(locationState.notification, {
      id: "authentication-required",
    });
    navigate(location.pathname, {
      replace: true,
      state: { from: locationState.from },
    });
  }, [location.pathname, locationState, navigate]);

  const validateField = (name: string, value: string): string => {
    const val = value.trim();
    if (name === "email") {
      if (!val) return "Email address is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        return "Please enter a valid email address (e.g. name@domain.com)";
      }
      return "";
    }
    if (name === "password") {
      if (!value) return "Password is required";
      if (value.length < 6) return "Password must be at least 6 characters";
      return "";
    }
    return "";
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, field === "email" ? email : password);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateField("email", val) }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validateField("password", val) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateField("email", email);
    const passErr = validateField("password", password);

    setTouched({ email: true, password: true });
    setErrors({ email: emailErr, password: passErr });

    if (emailErr || passErr) {
      toast.error("Please provide valid login credentials.");
      return;
    }

    try {
      setSubmitting(true);
      const user = await login({ email: email.trim(), password });
      toast.success(`Welcome back, ${user.profile?.firstName || user.email}!`);

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          data?: {
            requiresVerification?: boolean;
            email?: string;
            message?: string;
          };
        };
      };

      if (axiosErr.response?.data?.requiresVerification) {
        toast.error("Please verify your email address to continue.");
        navigate("/verify-email", {
          state: {
            email: axiosErr.response.data.email || email.trim(),
          },
        });
        return;
      }

      toast.error(
        axiosErr.response?.data?.message ||
          (err instanceof Error ? err.message : "Invalid email or password.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] p-8 sm:p-10 shadow-[0_12px_40px_-15px_rgba(217,108,133,0.15)] space-y-6 relative overflow-hidden">
        {/* Subtle decorative gold top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gold-metallic" />

        <div className="text-center space-y-2">
          <span className="font-serif-luxury text-2xl tracking-[0.2em] text-[#211A1C] block">
            AURA
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#211A1C] font-normal">
            Welcome Back
          </h1>
          <p className="text-xs text-[#756D70]">
            Sign in to access your orders, saved rituals, and beauty profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-medium text-[#211A1C] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => handleBlur("email")}
                placeholder="name@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm text-[#211A1C] bg-white transition-all focus:outline-hidden ${
                  touched.email && errors.email
                    ? "border-[#B33A3A] bg-[#FFFBFB] ring-1 ring-[#B33A3A]/20"
                    : "border-[#F0DFD8] focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20"
                }`}
              />
              <Mail className="w-4 h-4 text-[#756D70] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {touched.email && errors.email && (
              <p className="mt-1 text-[11px] text-[#B33A3A] flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#211A1C] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur("password")}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm text-[#211A1C] bg-white transition-all focus:outline-hidden ${
                  touched.password && errors.password
                    ? "border-[#B33A3A] bg-[#FFFBFB] ring-1 ring-[#B33A3A]/20"
                    : "border-[#F0DFD8] focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20"
                }`}
              />
              <Lock className="w-4 h-4 text-[#756D70] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-[#756D70] hover:text-[#211A1C] absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="mt-1 text-[11px] text-[#B33A3A] flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#B87D4B] to-[#9E6536] text-white text-xs font-semibold uppercase tracking-widest hover:brightness-105 flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(184,125,75,0.25)] cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#F0DFD8] text-center text-xs text-[#756D70]">
          Don't have an account yet?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#B87D4B] hover:text-[#9E6536] underline underline-offset-2"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
