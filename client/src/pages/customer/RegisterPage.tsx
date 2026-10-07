import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validation State
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register } = useAuth();
  const navigate = useNavigate();

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
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Check confirmPassword match if password changed
      if (name === "password" && touched.confirmPassword) {
        setErrors((errs) => ({
          ...errs,
          confirmPassword:
            next.confirmPassword && next.confirmPassword !== value
              ? "Passwords do not match"
              : "",
        }));
      }
      return next;
    });

    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, (formData as Record<string, string>)[field] || "");
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, text: "Weak", color: "bg-red-400" };
    if (score === 2) return { score: 2, text: "Fair", color: "bg-amber-400" };
    if (score === 3) return { score: 3, text: "Good", color: "bg-blue-400" };
    return { score: 4, text: "Strong", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {
      firstName: validateField("firstName", formData.firstName),
      lastName: validateField("lastName", formData.lastName),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword),
    };

    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    setErrors(newErrors);

    const errorKeys = Object.keys(newErrors).filter((k) => Boolean(newErrors[k]));
    if (errorKeys.length > 0) {
      toast.error("Please fill in all registration fields correctly.");
      const firstField = document.getElementsByName(errorKeys[0])[0];
      if (firstField) firstField.focus();
      return;
    }

    try {
      setSubmitting(true);
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      toast.success("Security code sent! Please check your email inbox.");
      navigate("/verify-email", {
        state: {
          email: formData.email.trim(),
          firstName: formData.firstName.trim(),
        },
      });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Unable to register account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getInputClassName = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs sm:text-sm text-[#211A1C] bg-white transition-all focus:outline-hidden ${
      hasError
        ? "border-[#B33A3A] bg-[#FFFBFB] ring-1 ring-[#B33A3A]/20"
        : "border-[#F0DFD8] focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20"
    }`;
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] p-8 sm:p-10 shadow-[0_12px_40px_-15px_rgba(217,108,133,0.15)] space-y-6 relative overflow-hidden">
        {/* Subtle decorative gold top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gold-metallic" />

        <div className="text-center space-y-2">
          <span className="inline-block text-[10px] tracking-[0.25em] uppercase font-bold text-gold-metallic">
            Exclusive Circle
          </span>
          <span className="font-serif-luxury text-2xl tracking-[0.2em] text-[#211A1C] block">
            AURA
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#211A1C] font-normal">
            Create an Account
          </h1>
          <p className="text-xs text-[#756D70]">
            Join our mindful beauty circle for saved rituals and tracked orders.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#211A1C] mb-1.5">
                First Name <span className="text-[#B33A3A]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={() => handleBlur("firstName")}
                  placeholder="Kasun"
                  className={getInputClassName("firstName")}
                />
                <User className="w-3.5 h-3.5 text-[#756D70] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {touched.firstName && errors.firstName && (
                <p className="mt-1 text-[10px] text-[#B33A3A] flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.firstName}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#211A1C] mb-1.5">
                Last Name <span className="text-[#B33A3A]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={() => handleBlur("lastName")}
                  placeholder="Perera"
                  className={getInputClassName("lastName")}
                />
                <User className="w-3.5 h-3.5 text-[#756D70] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {touched.lastName && errors.lastName && (
                <p className="mt-1 text-[10px] text-[#B33A3A] flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.lastName}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#211A1C] mb-1.5">
              Email Address <span className="text-[#B33A3A]">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                placeholder="name@example.com"
                className={getInputClassName("email")}
              />
              <Mail className="w-3.5 h-3.5 text-[#756D70] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {touched.email && errors.email && (
              <p className="mt-1 text-[11px] text-[#B33A3A] flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#211A1C]">
                Password <span className="text-[#B33A3A]">*</span>
              </label>
              {formData.password && (
                <span className="text-[10px] font-semibold text-[#756D70]">
                  Strength:{" "}
                  <span
                    className={
                      passwordStrength.score >= 3
                        ? "text-emerald-600 font-bold"
                        : passwordStrength.score === 2
                        ? "text-amber-600 font-bold"
                        : "text-red-600 font-bold"
                    }
                  >
                    {passwordStrength.text}
                  </span>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur("password")}
                placeholder="••••••••"
                className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm text-[#211A1C] bg-white transition-all focus:outline-hidden ${
                  touched.password && errors.password
                    ? "border-[#B33A3A] bg-[#FFFBFB] ring-1 ring-[#B33A3A]/20"
                    : "border-[#F0DFD8] focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20"
                }`}
              />
              <Lock className="w-3.5 h-3.5 text-[#756D70] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
            {/* Strength meter bar */}
            {formData.password && (
              <div className="mt-1.5 flex gap-1 h-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      step <= passwordStrength.score
                        ? passwordStrength.color
                        : "bg-[#F0DFD8]"
                    }`}
                  />
                ))}
              </div>
            )}
            {touched.password && errors.password && (
              <p className="mt-1 text-[11px] text-[#B33A3A] flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#211A1C] mb-1.5">
              Confirm Password <span className="text-[#B33A3A]">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur("confirmPassword")}
                placeholder="••••••••"
                className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm text-[#211A1C] bg-white transition-all focus:outline-hidden ${
                  touched.confirmPassword && errors.confirmPassword
                    ? "border-[#B33A3A] bg-[#FFFBFB] ring-1 ring-[#B33A3A]/20"
                    : "border-[#F0DFD8] focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20"
                }`}
              />
              <Lock className="w-3.5 h-3.5 text-[#756D70] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-1.5 text-[#756D70] hover:text-[#211A1C] absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-[11px] text-[#B33A3A] flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
            {formData.confirmPassword &&
              formData.password === formData.confirmPassword && (
                <p className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Passwords match</span>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#F0DFD8] text-center text-xs text-[#756D70]">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#B87D4B] hover:text-[#9E6536] underline underline-offset-2"
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
