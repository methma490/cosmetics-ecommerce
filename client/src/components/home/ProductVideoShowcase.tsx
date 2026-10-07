import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Star,
  MessageCircle,
  CheckCircle2,
  Droplets,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import type { Product } from "../../types/product";
import toast from "react-hot-toast";

interface ProductVideoItem {
  id: string;
  badge: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  price: number;
  priceFormatted: string;
  rating: number;
  reviewCount: number;
  description: string;
  videoSrc: string;
  altVideoSrc: string;
  posterSrc: string;
  productImage: string;
  actives: { name: string; benefit: string }[];
  specs: string[];
}

const SHOWCASE_ITEMS: ProductVideoItem[] = [
  {
    id: "serum-dropper-showcase",
    badge: "Most Celebrated Formula",
    title: "Luminous Botanical Radiance Serum",
    categorySlug: "skincare",
    categoryName: "Skincare • Facial Elixir",
    price: 4850,
    priceFormatted: "LKR 4,850",
    rating: 5.0,
    reviewCount: 148,
    description:
      "A golden restorative face serum infused with botanical antioxidants, niacinamide, and 24K peptide micro-droplets. Restores youthful radiance and deep hydration without residual stickiness.",
    videoSrc: "/videos/luxury-serum-dropper.mp4",
    altVideoSrc: "https://cdn.coverr.co/videos/user-ai-generation-MzMzhNLHP3yP/1080p.mp4",
    posterSrc: "/videos/luxury-serum-dropper-poster.jpg",
    productImage: "/images/showcase/serum-showcase.jpg",
    actives: [
      { name: "Niacinamide 5%", benefit: "Refines pores & balances natural sebum" },
      { name: "Botanical Squalane", benefit: "Deep lipid barrier restoration" },
      { name: "Hyaluronic Acid", benefit: "Multi-depth moisture retention" },
    ],
    specs: ["Dermatologically Tested", "Cold-Pressed Actives", "100% Vegan & Cruelty-Free"],
  },
  {
    id: "parfum-showcase",
    badge: "Haute Parfumerie",
    title: "Maison Fleur Eau De Parfum",
    categorySlug: "fragrance",
    categoryName: "Fragrance • Extrait de Parfum",
    price: 14500,
    priceFormatted: "LKR 14,500",
    rating: 4.9,
    reviewCount: 92,
    description:
      "An evocative artisanal fragrance housed in a faceted crystal flacon. Features top notes of French peony and bergamot, melting into creamy Mysore sandalwood and pure white musk.",
    videoSrc: "/videos/crystal-perfume-bottle.mp4",
    altVideoSrc: "https://cdn.coverr.co/videos/user-ai-generation-YTy6BsKIEgr9/1080p.mp4",
    posterSrc: "/videos/crystal-perfume-bottle-poster.jpg",
    productImage: "/images/showcase/fragrance-showcase.jpg",
    actives: [
      { name: "French Peony Petals", benefit: "Delicate and luminous floral bouquet" },
      { name: "Calabrian Bergamot", benefit: "Crisp and uplifting citrus top notes" },
      { name: "Aged White Musk", benefit: "Long-lasting intimate skin sillage" },
    ],
    specs: ["8-12 Hour Sillage", "Hand-Blown Crystal Bottle", "Zero Synthetic Phthalates"],
  },
  {
    id: "cream-showcase",
    badge: "Barrier Architecture",
    title: "Velvet Rose Hydrating Day Cream",
    categorySlug: "skincare",
    categoryName: "Skincare • Daily Moisturizer",
    price: 5200,
    priceFormatted: "LKR 5,200",
    rating: 5.0,
    reviewCount: 116,
    description:
      "Ultra-hydrating daily moisturizer formulated with Damask rose water and triple bio-identical ceramides. Shields against moisture loss while delivering a velvety soft-focus finish.",
    videoSrc: "/videos/skincare-serum-bottle.mp4",
    altVideoSrc: "https://cdn.coverr.co/videos/user-ai-generation-0IwhHACz2N6l/1080p.mp4",
    posterSrc: "/videos/skincare-serum-bottle-poster.jpg",
    productImage: "/images/showcase/cream-showcase.jpg",
    actives: [
      { name: "Damask Rose Distillate", benefit: "Soothes redness and restores pH" },
      { name: "Triple Ceramides (NP, AP, EOP)", benefit: "Reinforces delicate lipid barrier" },
      { name: "Shea & Jojoba Esters", benefit: "Weightless velvet touch finish" },
    ],
    specs: ["Non-Comedogenic", "Ideal Under Makeup", "Eco-Glass Container"],
  },
];

interface ProductVideoShowcaseProps {
  realProducts?: Product[];
}

export const ProductVideoShowcase: React.FC<ProductVideoShowcaseProps> = ({ realProducts = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { addToCart, openCart } = useCart();
  const currentItem = SHOWCASE_ITEMS[selectedIndex];

  // Try to find matching real product from backend for robust add-to-cart
  const matchedBackendProduct = realProducts.find(
    (p) =>
      p.name.toLowerCase().includes(currentItem.title.toLowerCase().split(" ")[0]) ||
      p.slug.includes(currentItem.categorySlug)
  );

  // Switch video when selected index changes
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.load();
      if (isPlaying) {
        v.play().catch(() => {});
      }
    }
    setProgress(0);
  }, [selectedIndex]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
    } else {
      v.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.duration) {
      setProgress((v.currentTime / v.duration) * 100);
    }
  };

  const handleAddToCart = () => {
    // If we have a matched product from DB, use it
    if (matchedBackendProduct) {
      const added = addToCart(matchedBackendProduct, 1);
      if (added) {
        toast.success(`Added ${matchedBackendProduct.name} to bag`);
        openCart();
      }
    } else {
      // Create a compatible product object matching the showcase item
      const fallbackProduct: Product = {
        _id: currentItem.id,
        name: currentItem.title,
        slug: currentItem.id,
        description: currentItem.description,
        price: currentItem.price,
        stock: 20,
        images: [currentItem.productImage],
        isActive: true,
        category: {
          _id: currentItem.categorySlug,
          name: currentItem.categoryName.split("•")[0].trim(),
          slug: currentItem.categorySlug,
        },
      };
      addToCart(fallbackProduct, 1);
      toast.success(`Added ${currentItem.title} to bag`);
      openCart();
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello AURA Atelier! I watched the video for "${currentItem.title}" and would like to order it (${currentItem.priceFormatted}). Can you assist me?`
  );

  return (
    <section id="formulations-in-motion" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFFCFA] border border-[#D4AF37]/50 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-[10px] uppercase tracking-[0.24em] text-[#8F6B00] font-semibold">
            In The Atelier • Formulations in Motion
          </span>
        </div>
        <h2 className="font-serif-luxury text-3xl sm:text-5xl font-normal text-[#211A1C]">
          See Our Formulations Up Close
        </h2>
        <p className="text-sm sm:text-base text-[#7D7275] font-light leading-relaxed max-w-xl mx-auto">
          Watch the macro texture, pipette precision, and radiant packaging of our iconic products before making them part of your daily beauty ritual.
        </p>

        {/* Product Switcher Tabs */}
        <div className="pt-4 flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#FFFCFA] border border-[#F0DFD8] shadow-sm gap-1.5 max-w-full overflow-x-auto">
            {SHOWCASE_ITEMS.map((item, idx) => {
              const active = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${
                    active
                      ? "bg-[#211A1C] text-[#FFF1A8] shadow-md border border-[#D4AF37]/40"
                      : "text-[#7D7275] hover:text-[#211A1C] hover:bg-[#FFF9F5]"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-[#D4AF37]" : "bg-transparent"}`} />
                  <span>{item.title.split(" ")[0]} {item.title.split(" ")[1]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Showcase Grid: Video on Left, Product on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-[#FFFCFA] border border-[#F0DFD8] rounded-[2.5rem] p-6 sm:p-10 shadow-xl">
        {/* Left Column: CINEMATIC VIDEO PLAYER */}
        <div className="lg:col-span-7">
          <div className="relative aspect-4/3 sm:aspect-16/10 rounded-3xl overflow-hidden bg-[#140e11] border border-[#D4AF37]/35 shadow-2xl group">
            {/* The Video Element */}
            <video
              ref={videoRef}
              poster={currentItem.posterSrc}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-cover object-center"
            >
              <source src={currentItem.videoSrc} type="video/mp4" />
              <source src={currentItem.altVideoSrc} type="video/mp4" />
            </video>

            {/* Subtle luxury vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 text-[#FFF1A8] text-[10px] uppercase tracking-wider font-semibold">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>1080p Ultra HD Texture</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] text-white/90">
                <span>{currentItem.badge}</span>
              </span>
            </div>

            {/* Video Player Floating Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 bg-black/50 backdrop-blur-md p-2.5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-[#FFF1A8] transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="text-[11px] text-white/80 hidden sm:block font-medium pl-1">
                  <span>{currentItem.title}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 max-w-[120px] sm:max-w-[180px] h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#B87D4B] to-[#D4AF37] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: PRODUCT COMPANION DETAILS */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header & Category */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8F6B00] font-bold">
                {currentItem.categoryName}
              </span>
              <div className="flex items-center gap-1 text-[#D4AF37]">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-bold text-[#211A1C]">{currentItem.rating}</span>
                <span className="text-[11px] text-[#7D7275]">({currentItem.reviewCount})</span>
              </div>
            </div>

            <h3 className="font-serif-luxury text-2xl sm:text-3xl font-medium text-[#211A1C] leading-snug">
              {currentItem.title}
            </h3>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl font-semibold text-[#211A1C] tracking-tight">
                {currentItem.priceFormatted}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#56805D] font-semibold bg-[#56805D]/10 px-2.5 py-0.5 rounded-full border border-[#56805D]/20">
                In Stock & Verified
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#7D7275] font-light leading-relaxed">
            {currentItem.description}
          </p>

          {/* Key Actives Pills */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] uppercase tracking-wider text-[#211A1C] font-semibold flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-[#B87D4B]" />
              <span>Key Botanical Actives</span>
            </span>
            <div className="space-y-1.5">
              {currentItem.actives.map((act, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-[#FFF9F5] border border-[#F0DFD8]"
                >
                  <span className="font-medium text-[#211A1C]">{act.name}</span>
                  <span className="text-[11px] text-[#7D7275] font-light">{act.benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Guarantees */}
          <div className="pt-2 flex flex-wrap gap-2">
            {currentItem.specs.map((spec, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-[#FFFCFA] border border-[#D4AF37]/40 text-[#8F6B00] font-medium"
              >
                <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />
                <span>{spec}</span>
              </span>
            ))}
          </div>

          {/* CTAs: Add to Bag & WhatsApp Concierge */}
          <div className="pt-4 space-y-3">
            <button
              onClick={handleAddToCart}
              className="w-full py-4 px-6 rounded-2xl bg-[#B87D4B] hover:bg-[#9E6536] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg hover:shadow-[0_10px_35px_-8px_rgba(184,125,75,0.6)] hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-[#B87D4B]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Bag • {currentItem.priceFormatted}</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to={`/shop?category=${currentItem.categorySlug}`}
                className="py-3 px-4 rounded-xl bg-[#FFF9F5] hover:bg-[#F7EFE9] text-[#211A1C] text-center border border-[#F0DFD8] text-xs font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 hover:border-[#D4AF37]/50"
              >
                <span>View In Shop</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B87D4B]" />
              </Link>
              <a
                href={`https://wa.me/94743301490?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-[#56805D]/10 hover:bg-[#56805D]/20 text-[#56805D] text-center border border-[#56805D]/30 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Order</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductVideoShowcase;
