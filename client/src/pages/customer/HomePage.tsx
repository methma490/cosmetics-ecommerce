import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  MessageCircle,
  Leaf,
  Clock,
} from "lucide-react";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import type { Product } from "../../types/product";
import type { Category } from "../../types/category";
import ProductCard from "../../components/product/productCard";

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  const categoryImages: Record<string, string> = {
    skincare:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
    makeup:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80",
    fragrance:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80",
    "hair-care":
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80",
    "body-care":
      "https://images.unsplash.com/photo-1556228722-d0b71e16f391?auto=format&fit=crop&w=600&q=80",
  };

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative min-h-[82vh] flex items-center justify-center bg-radial from-[#FAF8F3] via-[#FBECEF]/40 to-[#FAF8F3] pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#E8DADD]/40">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8DADD] text-xs font-medium text-[#C85C7A] shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Conscious Botanical Formulations</span>
            </div>

            <h1 className="font-serif-luxury text-4xl sm:text-6xl lg:text-7xl font-normal text-[#252223] leading-[1.12] tracking-tight">
              Beauty, Curated with <br />
              <span className="italic font-light text-[#C85C7A]">
                Pure Intention.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#756D70] max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
              Elevate your daily ritual with nutrient-dense botanicals, restorative skin actives, and couture pigments created for timeless radiance.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/shop"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#C85C7A] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#A84462] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#categories"
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-[#252223] text-[#252223] text-xs font-semibold uppercase tracking-widest hover:bg-white transition-all text-center"
              >
                Explore Categories
              </a>
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#756D70]">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-[#56805D]" />
                <span>100% Clean Actives</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C85C7A]" />
                <span>Express Islandwide Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#252223]" />
                <span>WhatsApp Ordering Available</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image Composition */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80"
                alt="AURA Botanical Formulations"
                className="w-full h-full object-cover object-center scale-102 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-[11px] uppercase tracking-widest font-semibold text-[#F3D6DE]">
                  Featured Ritual
                </p>
                <h3 className="font-serif-luxury text-xl font-medium">
                  Velvet Rose Hydrating Day Cream
                </h3>
              </div>
            </div>

            {/* Floating Editorial Badge */}
            <div className="absolute -bottom-6 -left-4 sm:left-4 bg-white/95 backdrop-blur-md border border-[#E8DADD] p-4 rounded-2xl shadow-xl max-w-[210px] hidden sm:block">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#56805D]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#756D70]">
                  Authentic Batch
                </span>
              </div>
              <p className="text-xs font-semibold text-[#252223]">
                Dermatologically Tested & Cruelty-Free
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#C85C7A] font-semibold">
            Curated Collections
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#252223] mt-2">
            Explore by Beauty Ritual
          </h2>
          <p className="text-sm text-[#756D70] mt-2 font-light">
            Formulations crafted to nurture every element of your personal self-care ritual.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const img =
              categoryImages[cat.slug] ||
              "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80";

            return (
              <Link
                key={cat._id}
                to={`/shop?category=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-3/4 border border-[#E8DADD]/60 bg-white shadow-xs hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={img}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#252223]/80 via-[#252223]/20 to-transparent group-hover:from-[#C85C7A]/80 transition-colors duration-300" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-serif-luxury text-base sm:text-lg font-medium leading-tight">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider text-[#F3D6DE] opacity-0 group-hover:opacity-100 transition-opacity mt-1 inline-block">
                    Explore →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. New Arrivals / Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#E8DADD]/60 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#C85C7A] font-semibold">
              New In
            </span>
            <h2 className="font-serif-luxury text-3xl font-normal text-[#252223] mt-1">
              Seasonal Formulations
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold text-[#C85C7A] hover:text-[#A84462] uppercase tracking-wider flex items-center gap-1.5"
          >
            <span>View All ({featuredProducts.length + bestSellers.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-3/4 bg-white rounded-2xl border border-[#E8DADD]"
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
      <section className="bg-white border-y border-[#E8DADD] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative">
            <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-[#E8DADD]">
              <img
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80"
                alt="Botanical Beauty Philosophy"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 sm:right-6 bg-[#FAF8F3] border border-[#E8DADD] p-6 rounded-2xl shadow-lg max-w-xs hidden sm:block">
              <span className="font-serif-luxury text-3xl font-bold text-[#C85C7A] block">
                100%
              </span>
              <p className="text-xs text-[#252223] font-medium mt-1">
                Authentic, sealed cosmetic formulations directly from authorized artisan houses.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-widest text-[#C85C7A] font-semibold">
              Our Philosophy
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#252223] leading-snug">
              The Harmony of Botanical Science & Mindful Luxury
            </h2>
            <p className="text-sm text-[#756D70] font-light leading-relaxed">
              At AURA, we believe that true luxury lies in simplicity, purity, and mindful ritual. Every formulation in our catalog is consciously selected to support your skin's natural barrier while elevating your senses.
            </p>
            <p className="text-sm text-[#756D70] font-light leading-relaxed">
              From hand-poured floral perfumes to clinical-grade plant serums, our products embody integrity, transparency, and exquisite aesthetic pleasure.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#252223] hover:text-[#C85C7A] pb-1 border-b border-[#252223] hover:border-[#C85C7A] transition-colors"
              >
                <span>Read the collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-widest text-[#C85C7A] font-semibold">
              Loved by Our Community
            </span>
            <h2 className="font-serif-luxury text-3xl font-normal text-[#252223] mt-2">
              Iconic Formulations
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Promotional Banner: Your Everyday Beauty Ritual */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-radial from-[#FBECEF] via-[#F3D6DE]/60 to-[#FAF8F3] border border-[#E8DADD] p-8 sm:p-14 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#C85C7A] font-semibold">
              Everyday Beauty Ritual
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-5xl font-normal text-[#252223]">
              Indulge in Mindful Radiance
            </h2>
            <p className="text-sm text-[#756D70] font-light max-w-lg mx-auto">
              Complimentary islandwide delivery on orders over Rs. 15,000. Seamless checkout with PayHere Sandbox or direct WhatsApp ordering.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#C85C7A] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#A84462] transition-colors shadow-md"
              >
                <span>Discover All Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Benefits / Trust Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-[#E8DADD] p-6 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FBECEF] text-[#C85C7A] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif-luxury text-base font-semibold text-[#252223]">
              100% Authentic
            </h4>
            <p className="text-xs text-[#756D70] leading-relaxed font-light">
              Guaranteed genuine formulations with verified quality ingredients and sealed packages.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DADD] p-6 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FBECEF] text-[#C85C7A] flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-serif-luxury text-base font-semibold text-[#252223]">
              Islandwide Express
            </h4>
            <p className="text-xs text-[#756D70] leading-relaxed font-light">
              Fast, tracked courier delivery directly to your door anywhere across Sri Lanka.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DADD] p-6 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FBECEF] text-[#C85C7A] flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="font-serif-luxury text-base font-semibold text-[#252223]">
              Secure PayHere
            </h4>
            <p className="text-xs text-[#756D70] leading-relaxed font-light">
              Pay securely via PayHere Sandbox with instant signature verification and inventory safety.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DADD] p-6 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FBECEF] text-[#C85C7A] flex items-center justify-center mx-auto">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h4 className="font-serif-luxury text-base font-semibold text-[#252223]">
              Order via WhatsApp
            </h4>
            <p className="text-xs text-[#756D70] leading-relaxed font-light">
              Send your full shopping bag directly to our concierge team with one click.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
