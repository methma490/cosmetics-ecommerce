import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated as admin, redirect immediately
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both administrative email and password');
      return;
    }

    try {
      setLoading(true);
      const loggedUser = await login({ email, password });
      if (loggedUser.role !== 'admin') {
        setError('Access denied: This account does not possess administrative privileges.');
        toast.error('Unauthorized account role');
        return;
      }
      toast.success('Welcome back to the Admin Atelier');
      navigate('/admin');
    } catch (err: any) {
      console.error('Admin login error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Authentication failed. Please verify credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F7EFE9] text-[#B87D4B] mb-4 border border-[#D4AF37]/30 shadow-xs">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#B87D4B] uppercase block">
          L’Étoile Atelier
        </span>
        <h2 className="mt-2 text-3xl font-serif-luxury font-bold text-[#211A1C] tracking-tight">
          Administrative Portal
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#756D70]">
          Restricted access for catalog and store management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFCFA] py-8 px-6 shadow-xs border border-[#F0DFD8] sm:rounded-3xl sm:px-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4AF37]" />

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#211A1C] uppercase tracking-wider mb-2">
                Staff Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756D70]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@cosmetics.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#F0DFD8] rounded-xl text-sm text-[#211A1C] placeholder-[#756D70]/50 focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#211A1C] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756D70]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white border border-[#F0DFD8] rounded-xl text-sm text-[#211A1C] placeholder-[#756D70]/50 focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#756D70] hover:text-[#211A1C] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#B87D4B] hover:bg-[#9E6536] shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter Management Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-[#F0DFD8] text-center">
            <a
              href="/"
              className="text-xs text-[#756D70] hover:text-[#B87D4B] transition-colors"
            >
              ← Return to Customer Storefront
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
