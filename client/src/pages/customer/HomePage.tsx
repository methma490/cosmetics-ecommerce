import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  MessageCircle,
  CreditCard,
} from "lucide-react";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import type { Product } from "../../types/product";
import type { Category } from "../../types/category";
import ProductCard from "../../components/product/productCard";
import CinematicVideoHero from "../../components/home/CinematicVideoHero";
import ProductVideoShowcase from "../../components/home/ProductVideoShowcase";
import toast from "react-hot-toast";

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          productService.getProducts({ limit: 12 }),
          categoryService.getCategories(),
        ]);

        if (prodRes.success && prodRes.products) {
          setFeaturedProducts(prodRes.products.slice(0, 4));
          setBestSellers(prodRes.products.slice(4, 8));
        }

        if (catRes.success && catRes.categories) {
          setCategories(catRes.categories);
        }
      } catch (err) {
        console.error("Home page load error:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes("@")) {
      toast.error("Please provide a valid email address");
      return;
    }
    toast.success("Welcome to the AURA Atelier Circle");
    setNewsletterEmail("");
  };

  const categoryImages: Record<string, string> = {
    skincare: "/images/categories/skincare.jpg",
    "skin-care": "/images/categories/skincare.jpg",
    makeup: "/images/categories/makeup.jpg",
    fragrance: "/images/categories/fragrance.jpg",
    "hair-care": "/images/categories/haircare.jpg",
    "body-care": "/images/categories/bodycare.jpg",
    "sun-care": "/images/categories/suncare.jpg",
  };

  return (
    <div className="space-y-24 pb-24 overflow-hidden bg-brand-bg">
      {/* 1. Cinematic Full-Width Video Hero */}
      <CinematicVideoHero />

      {/* 2. Formulations in Motion: High Quality Video with Product */}
      <ProductVideoShowcase realProducts={[...featuredProducts, ...bestSellers]} />

      {/* 3. Featured Categories Section */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-surface border border-brand-gold/40 shadow-xs">
            <Sparkles className="w-3 h-3 text-brand-gold" />
            <span className="text-[10px] uppercase tracking-[0.24em] text-brand-gold font-semibold">
              Curated Rituals
            </span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-5xl font-normal text-[#211A1C]">
            Explore by Beauty Discipline
          </h2>
          <p className="text-sm text-brand-text-muted font-light leading-relaxed max-w-lg mx-auto">
            Meticulously calibrated botanical formulations designed to elevate and harmonize every step of your daily beauty routine.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const img =
              categoryImages[cat.slug] ||
              "/images/categories/default.jpg";

            return (
              <Link
                key={cat._id}
                to={`/shop?category=${cat.slug}`}
                className="group relative rounded-3xl overflow-hidden aspect-3/4 border border-[#F0DFD8] bg-brand-surface shadow-xs hover:shadow-xl hover:border-brand-gold/60 transition-all duration-500"
              >
                <img
                  src={img}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/categories/default.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#211A1C]/85 via-[#211A1C]/25 to-transparent group-hover:from-[#B87D4B]/85 transition-colors duration-500" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-brand-gold-bright block mb-1">
                    Atelier Collection
                  </span>
                  <h3 className="font-serif-luxury text-base sm:text-lg font-medium leading-tight text-brand-surface">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider text-brand-gold-bright opacity-0 group-hover:opacity-100 transition-opacity mt-1.5 inline-flex items-center gap-1 font-semibold">
                    <span>Discover</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. New Arrivals / Seasonal Formulations (REAL BACKEND DATA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#F0DFD8] gap-4">
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-brand-gold font-semibold mb-1">
              <span>Haute Nouveautés</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#211A1C]">
              New Arrivals & Seasonal Formulations
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold text-[#B87D4B] hover:text-brand-primary-hover uppercase tracking-[0.18em] flex items-center gap-2 group transition-colors"
          >
            <span>View Complete Boutique ({featuredProducts.length + bestSellers.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-3/4 bg-brand-surface rounded-3xl border border-[#F0DFD8]"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Brand Editorial Storytelling Section */}
      <section className="bg-brand-surface border-y border-[#F0DFD8] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 relative">
            <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-[#F0DFD8] group">
              <img
                src="/images/editorial/botanical-alchemy.jpg"
                alt="AURA Botanical Formulation Alchemy"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/categories/default.jpg";
                }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Floating Luxury Editorial Badge */}
            <div className="absolute -bottom-6 -right-4 sm:right-6 bg-brand-surface border border-brand-gold/50 p-6 rounded-3xl shadow-xl max-w-xs hidden sm:block">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-4 h-4 text-brand-gold" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold-deep">
                  Atelier Guarantee
                </span>
              </div>
              <p className="text-xs text-[#211A1C] font-serif-luxury font-medium leading-relaxed">
                100% Certified botanical actives directly from audited ethical distillers.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-bg border border-brand-gold/35 text-[10px] uppercase tracking-[0.22em] text-brand-gold-deep font-semibold">
              <span>The Alchemy of Radiance</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal text-[#211A1C] leading-[1.18]">
              Where Botanical Purity Meets Couture Precision
            </h2>
            <p className="text-sm text-brand-text-muted font-light leading-relaxed">
              At AURA, we believe that radiant skin begins in harmony. Every formulation in our catalog is thoughtfully researched to safeguard your skin’s delicate lipid barrier while creating a sensory experience of pure indulgence.
            </p>
            <p className="text-sm text-brand-text-muted font-light leading-relaxed">
              From cold-pressed floral oils and peptide-infused serums to velvety day elixirs, our collections are created without compromises—free from parabens, synthetic fillers, or animal testing.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#211A1C] hover:text-[#B87D4B] pb-1 border-b border-brand-gold hover:border-[#B87D4B] transition-all"
              >
                <span>Explore the formulation catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Best Sellers Section (REAL BACKEND DATA) */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-[10px] uppercase tracking-[0.22em] text-brand-gold font-semibold block">
              Cult Classics
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#211A1C]">
              Cherished by Our Clients
            </h2>
            <p className="text-sm text-brand-text-muted font-light">
              Our most celebrated skin formulas and signature fragrances.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Promotional Luxury Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-radial from-[#F7EFE9] via-brand-surface to-brand-bg border border-brand-gold/40 p-8 sm:p-16 text-center relative overflow-hidden shadow-sm">
          <div className="max-w-2xl mx-auto space-y-5">
            <span className="text-[10px] uppercase tracking-[0.25em] text-brand-gold-deep font-bold block">
              The Bespoke Experience
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-5xl font-normal text-[#211A1C]">
              Your Everyday Beauty Ritual, Reimagined
            </h2>
            <p className="text-sm text-brand-text-muted font-light max-w-lg mx-auto leading-relaxed">
              Complimentary express island-wide delivery on orders over LKR 8,000. Enjoy seamless verified checkout via PayHere Sandbox or order directly via WhatsApp Concierge.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/shop"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#B87D4B] hover:bg-brand-primary-hover text-white text-xs font-semibold uppercase tracking-[0.2em] transition-all shadow-md hover:shadow-lg border border-brand-gold/40"
              >
                <span>Discover All Formulations</span>
              </Link>
              <a
                href="https://wa.me/94743301490?text=Hello%20AURA!%20I'd%20like%20to%20learn%20more%20about%20your%20bespoke%20beauty%20collection."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-brand-surface hover:bg-white text-[#211A1C] border border-brand-gold/50 text-xs font-semibold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5 text-brand-success" />
                <span>WhatsApp Concierge</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Benefits / Pillars of Excellence */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-brand-surface rounded-3xl border border-[#F0DFD8] p-6 text-center space-y-3 shadow-xs hover:border-brand-gold/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-brand-gold/40 text-brand-gold-deep flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif-luxury text-base font-semibold text-[#211A1C]">
              100% Authentic Actives
            </h4>
            <p className="text-xs text-brand-text-muted leading-relaxed font-light">
              Guaranteed genuine formulations with verified laboratory quality standards and sealed packaging.
            </p>
          </div>

          <div className="bg-brand-surface rounded-3xl border border-[#F0DFD8] p-6 text-center space-y-3 shadow-xs hover:border-brand-gold/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-brand-gold/40 text-brand-gold-deep flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-serif-luxury text-base font-semibold text-[#211A1C]">
              Island-wide Express Care
            </h4>
            <p className="text-xs text-brand-text-muted leading-relaxed font-light">
              Tracked, temperature-sensitive courier delivery directly to your door anywhere in Sri Lanka.
            </p>
          </div>

          <div className="bg-brand-surface rounded-3xl border border-[#F0DFD8] p-6 text-center space-y-3 shadow-xs hover:border-brand-gold/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-brand-gold/40 text-brand-gold-deep flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="font-serif-luxury text-base font-semibold text-[#211A1C]">
              Cryptographic PayHere
            </h4>
            <p className="text-xs text-brand-text-muted leading-relaxed font-light">
              Secure payments verified cryptographically by backend with strict single-deduction inventory locks.
            </p>
          </div>

          <div className="bg-brand-surface rounded-3xl border border-[#F0DFD8] p-6 text-center space-y-3 shadow-xs hover:border-brand-gold/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-brand-gold/40 text-brand-gold-deep flex items-center justify-center mx-auto">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h4 className="font-serif-luxury text-base font-semibold text-[#211A1C]">
              WhatsApp Direct Order
            </h4>
            <p className="text-xs text-brand-text-muted leading-relaxed font-light">
              Send your entire shopping cart to our beauty advisor for custom advice or fast ordering.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Newsletter & Atelier Circle */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#211A1C] text-brand-surface rounded-3xl p-8 sm:p-14 border border-brand-gold/35 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-brand-gold/50 text-[10px] uppercase tracking-[0.25em] text-brand-gold-bright">
              <Sparkles className="w-3 h-3 text-brand-gold" />
              <span>Privé Circle</span>
            </div>
            <h3 className="font-serif-luxury text-2xl sm:text-4xl font-normal text-brand-surface">
              Receive Invitations to Private Drops & Ritual Guides
            </h3>
            <p className="text-xs sm:text-sm text-[#EADCD2] font-light leading-relaxed">
              Join our beauty circle for exclusive previews of rare botanical vintages and seasonal skincare formulations.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="pt-2 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3.5 rounded-full bg-white/10 border border-brand-gold/40 text-xs text-brand-surface placeholder-[#EADCD2]/60 focus:outline-none focus:border-brand-gold-bright focus:bg-white/15 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-7 py-3.5 rounded-full bg-[#B87D4B] hover:bg-brand-primary-hover text-white text-xs font-semibold uppercase tracking-[0.18em] transition-all shadow-md hover:shadow-xl border border-brand-gold/40 flex items-center justify-center gap-2"
              >
                <span>Join</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
