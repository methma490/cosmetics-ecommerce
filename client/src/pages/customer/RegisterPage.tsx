import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      toast.success("Security code sent! Please verify your email.");
      navigate("/verify-email", {
        state: {
          email: formData.email.trim(),
          firstName: formData.firstName.trim(),
          devCode: res.devCode,
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#211A1C] mb-1.5">
                First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Kasun"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#F0DFD8] text-xs sm:text-sm text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20 transition-all"
                />
                <User className="w-3.5 h-3.5 text-[#756D70] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#211A1C] mb-1.5">
                Last Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Perera"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#F0DFD8] text-xs sm:text-sm text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20 transition-all"
                />
                <User className="w-3.5 h-3.5 text-[#756D70] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#211A1C] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#F0DFD8] text-xs sm:text-sm text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20 transition-all"
              />
              <Mail className="w-3.5 h-3.5 text-[#756D70] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#211A1C] mb-1.5">
              Password <span className="text-[#756D70] text-[10px] font-normal">(8+ characters)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#F0DFD8] text-xs sm:text-sm text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20 transition-all"
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
