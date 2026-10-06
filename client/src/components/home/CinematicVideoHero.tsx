import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  ChevronDown,
  Play,
  Pause,
  Eye,
  CheckCircle2,
} from "lucide-react";

export interface HeroScene {
  id: string;
  tabLabel: string;
  ritualName: string;
  productName: string;
  productTagline: string;
  categorySlug: string;
  categoryLabel: string;
  priceFormatted: string;
  videoSrc: string;
  altVideoSrc: string;
  posterSrc: string;
  productImage: string;
  keyActives: string[];
}

export const HERO_SCENES: HeroScene[] = [
  {
    id: "serum-dropper",
    tabLabel: "Botanical Serum",
    ritualName: "01 • Macro Actives In Motion",
    productName: "Luminous Botanical Radiance Serum",
    productTagline: "Cold-pressed antioxidants, niacinamide & golden peptide droplets",
    categorySlug: "skincare",
    categoryLabel: "Skincare • Haute Actives",
    priceFormatted: "LKR 4,850",
    videoSrc: "/videos/luxury-serum-dropper.mp4",
    altVideoSrc: "https://cdn.coverr.co/videos/user-ai-generation-MzMzhNLHP3yP/1080p.mp4",
    posterSrc: "/videos/luxury-serum-dropper-poster.jpg",
    productImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
    keyActives: ["Niacinamide 5%", "Botanical Squalane", "24K Golden Actives"],
  },
  {
    id: "crystal-fragrance",
    tabLabel: "Crystal Parfum",
    ritualName: "02 • Couture Amber Fragrance",
    productName: "Maison Fleur Eau De Parfum",
    productTagline: "Faceted crystal flacon with French peony, bergamot & warm musk",
    categorySlug: "fragrance",
    categoryLabel: "Fragrance • Haute Parfumerie",
    priceFormatted: "LKR 14,500",
    videoSrc: "/videos/crystal-perfume-bottle.mp4",
    altVideoSrc: "https://cdn.coverr.co/videos/user-ai-generation-YTy6BsKIEgr9/1080p.mp4",
    posterSrc: "/videos/crystal-perfume-bottle-poster.jpg",
    productImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80",
    keyActives: ["French Peony Extract", "Calabrian Bergamot", "Sandalwood Essence"],
  },
  {
    id: "morning-skincare",
    tabLabel: "Day Elixir",
    ritualName: "03 • Barrier Hydration Ritual",
    productName: "Velvet Rose Hydrating Day Cream",
    productTagline: "Ultra-hydrating floral veil with pure Damask rose water & ceramides",
    categorySlug: "skincare",
    categoryLabel: "Skincare • Moisture Barrier",
    priceFormatted: "LKR 5,200",
    videoSrc: "/videos/skincare-serum-bottle.mp4",
    altVideoSrc: "https://cdn.coverr.co/videos/user-ai-generation-0IwhHACz2N6l/1080p.mp4",
    posterSrc: "/videos/skincare-serum-bottle-poster.jpg",
    productImage: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80",
    keyActives: ["Damask Rose Water", "Triple Ceramides", "Hyaluronic Acid"],
  },
];

const HIGHLIGHTS = [
  { k: "Craftsmanship", v: "100% Authentic Actives" },
  { k: "Sri Lanka", v: "Island-wide Express Care" },
  { k: "Checkout", v: "PayHere & WhatsApp" },
  { k: "Ethos", v: "Cruelty-Free Botanicals" },
];

export const CinematicVideoHero: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const activeScene = HERO_SCENES[activeSceneIndex];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const fn = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  // When scene changes, reset ready state and play
  useEffect(() => {
    setVideoReady(false);
    setVideoFailed(false);
    const v = videoRef.current;
    if (v) {
      v.load();
      if (!paused) {
        v.play().catch(() => {});
      }
    }
  }, [activeSceneIndex]);

  // Pause video when hero is off-screen (performance)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        el.dataset.visible = entry.isIntersecting ? "1" : "0";
        const v = videoRef.current;
        if (v) {
          if (entry.isIntersecting && !paused) {
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [paused]);

  const onMove = (e: React.MouseEvent) => {
    if (reducedMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    setParallax({
      x: ((e.clientX - r.left) / r.width - 0.5) * 2,
      y: ((e.clientY - r.top) / r.height - 0.5) * 2,
    });
  };

  const togglePause = () => {
    const next = !paused;
    setPaused(next);
    const v = videoRef.current;
    if (v) {
      if (next) v.pause();
      else v.play().catch(() => {});
    }
  };

  const handleVideoError = () => {
    const v = videoRef.current;
    // Try fallback online URL if local failed
    if (v && v.src !== activeScene.altVideoSrc) {
      v.src = activeScene.altVideoSrc;
      v.load();
      v.play().catch(() => setVideoFailed(true));
    } else {
      setVideoFailed(true);
    }
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      data-paused={paused ? "1" : "0"}
      className="aura-hero relative w-full min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-[#140e11]"
    >
      <style>{`
        @keyframes auraFadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes auraLineUp { from{transform:translateY(110%)} to{transform:translateY(0)} }
        @keyframes auraGrow { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes auraShimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes auraIn { from{opacity:0} to{opacity:1} }
        @keyframes auraPulseWave { 0%,100%{height:4px} 50%{height:16px} }

        .aura-reveal{opacity:0;animation:auraFadeUp 1s cubic-bezier(.22,1,.36,1) forwards;animation-delay:var(--d,0s)}
        .aura-mask{display:block;overflow:hidden;padding-bottom:.08em}
        .aura-mask>span{display:block;transform:translateY(110%);animation:auraLineUp 1.1s cubic-bezier(.22,1,.36,1) forwards;animation-delay:var(--d,0s)}
        .aura-rule{transform-origin:center;transform:scaleX(0);animation:auraGrow 1.3s cubic-bezier(.22,1,.36,1) forwards;animation-delay:var(--d,0s)}
        .aura-gold{background:linear-gradient(100deg,#C59B27 0%,#FFF4BD 25%,#E5C158 50%,#FFF4BD 75%,#C59B27 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;animation:auraShimmer 6s linear infinite}
        .aura-fadein{opacity:0;animation:auraIn 1.3s ease-out forwards;animation-delay:var(--d,0s)}

        @media (prefers-reduced-motion: reduce){
          .aura-gold{animation:none!important}
          .aura-reveal,.aura-mask>span,.aura-rule,.aura-fadein{animation-duration:.01s!important;animation-delay:0s!important}
        }
      `}</style>

      {/* ===== HIGH QUALITY PRODUCT VIDEO BACKGROUND ===== */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Poster / Fallback backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url('${activeScene.posterSrc}')`,
            opacity: videoReady ? 0 : 0.75,
          }}
        />

        {/* Real 1080p video showing product in motion */}
        {!videoFailed && (
          <video
            ref={videoRef}
            poster={activeScene.posterSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            onLoadedData={() => setVideoReady(true)}
            onError={handleVideoError}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              videoReady ? "opacity-90" : "opacity-0"
            }`}
          >
            <source src={activeScene.videoSrc} type="video/mp4" />
            <source src={activeScene.altVideoSrc} type="video/mp4" />
          </video>
        )}

        {/* Balanced Cinematic Overlays - calibrated so product remains luminous and visible */}
        <div className="absolute inset-0 bg-radial from-[#140e11]/20 via-[#140e11]/60 to-[#140e11]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140e11] via-transparent to-[#140e11]/65 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#140e11]/70 via-transparent to-[#140e11]/45 pointer-events-none" />

        {/* Fade into page bottom */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-[#FFF9F5] pointer-events-none" />
      </div>

      {/* ===== VIDEO SCENE & PLAYBACK CONTROLS (Top right / bottom right) ===== */}
      <div className="absolute top-24 right-4 sm:right-8 z-20 flex items-center gap-2">
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e1518]/70 border border-[#D4AF37]/40 backdrop-blur-md text-[10px] uppercase tracking-wider text-[#FFF1A8]">
          <span className="w-2 h-2 rounded-full bg-[#56805D] animate-ping" />
          <span>Cinematic 1080p Product Reel</span>
        </div>
        <button
          onClick={togglePause}
          aria-label={paused ? "Play video" : "Pause video"}
          title={paused ? "Play video" : "Pause video"}
          className="p-2.5 rounded-full bg-[#1e1518]/80 hover:bg-[#1e1518] text-[#FFF1A8] border border-[#D4AF37]/50 backdrop-blur-md transition-all hover:scale-105 shadow-lg"
        >
          {paused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ===== HERO CONTENT CONTAINER ===== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 w-full">
        {/* Interactive Scene Switcher Pills */}
        <div className="aura-reveal flex justify-center mb-6" style={{ ["--d" as string]: "0.15s" }}>
          <div className="inline-flex p-1 rounded-full bg-[#1e1518]/80 border border-[#D4AF37]/40 backdrop-blur-md shadow-xl gap-1 max-w-full overflow-x-auto">
            {HERO_SCENES.map((scene, idx) => {
              const isActive = idx === activeSceneIndex;
              return (
                <button
                  key={scene.id}
                  onClick={() => setActiveSceneIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? "bg-gradient-to-r from-[#B87D4B] to-[#9E6536] text-white shadow-md border border-[#FFF1A8]/30"
                      : "text-[#F7EFE9]/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Sparkles className={`w-3 h-3 ${isActive ? "text-[#FFF1A8]" : "text-[#D4AF37]"}`} />
                  <span>{scene.tabLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Headline on left/center, Product In Video Card on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left / Center Column: Typography & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div
              className="aura-reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1518]/70 border border-[#D4AF37]/60 text-[#FFF1A8] text-[11px] uppercase tracking-[0.22em] font-semibold backdrop-blur-md"
              style={{ ["--d" as string]: "0.3s" }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{activeScene.ritualName}</span>
            </div>

            <h1 className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-normal text-[#FFFCFA] leading-[1.04] tracking-tight">
              <span className="aura-mask">
                <span style={{ ["--d" as string]: "0.45s" }}>BEAUTY,</span>
              </span>
              <span className="aura-mask">
                <span style={{ ["--d" as string]: "0.65s" }} className="italic font-light">
                  <span className="aura-gold">ELEVATED.</span>
                </span>
              </span>
            </h1>

            <div className="flex justify-center lg:justify-start">
              <div
                className="aura-rule h-px w-28 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent lg:from-[#D4AF37] lg:to-transparent"
                style={{ ["--d" as string]: "0.9s" }}
              />
            </div>

            <p
              className="aura-reveal text-sm sm:text-base md:text-lg text-[#F7EFE9] max-w-xl mx-auto lg:mx-0 font-light leading-relaxed tracking-wide"
              style={{ ["--d" as string]: "1s" }}
            >
              Experience the visual purity of our botanical formulations. Every droplet and crystal flacon is crafted with pure active ingredients for extraordinary daily radiance.
            </p>

            <div
              className="aura-reveal flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              style={{ ["--d" as string]: "1.2s" }}
            >
              <Link
                to={`/shop?category=${activeScene.categorySlug}`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#B87D4B] hover:bg-[#9E6536] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 shadow-xl hover:shadow-[0_10px_35px_-8px_rgba(184,125,75,0.7)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group border border-[#D4AF37]/50"
              >
                <span>Shop Featured Product</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FFFCFA] border border-[#D4AF37]/50 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-md transition-all duration-300 text-center hover:border-[#FFF1A8] hover:-translate-y-0.5"
              >
                Browse All Formulations
              </Link>
            </div>
          </div>

          {/* Right Column: FLOATING "PRODUCT IN VIDEO" SPOTLIGHT CARD */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div
              className="aura-reveal w-full max-w-sm rounded-3xl bg-[#1e1518]/85 border border-[#D4AF37]/50 p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-[#FFF1A8]/80 transition-all duration-500"
              style={{ ["--d" as string]: "0.8s" }}
            >
              {/* Subtle gold sheen */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#FFF1A8] font-bold">
                    Product In Video
                  </span>
                </div>
                <span className="text-[10px] text-[#F7EFE9]/70 font-medium">
                  {activeScene.categoryLabel}
                </span>
              </div>

              {/* Product Mini Showcase */}
              <div className="flex gap-4 pt-4 items-center">
                <div className="w-20 h-24 rounded-2xl overflow-hidden bg-black/40 border border-[#D4AF37]/40 shrink-0 relative">
                  <img
                    src={activeScene.productImage}
                    alt={activeScene.productName}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-1 right-1 p-1 rounded-full bg-black/60 text-[#FFF1A8]">
                    <Eye className="w-2.5 h-2.5" />
                  </div>
                </div>

                <div className="space-y-1 min-w-0">
                  <h3 className="font-serif-luxury text-base sm:text-lg font-medium text-[#FFFCFA] leading-tight line-clamp-2">
                    {activeScene.productName}
                  </h3>
                  <p className="text-[11px] text-[#F7EFE9]/80 font-light line-clamp-2 leading-relaxed">
                    {activeScene.productTagline}
                  </p>
                  <div className="pt-1 flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-[#FFF1A8] tracking-wide">
                      {activeScene.priceFormatted}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-[#56805D] font-medium bg-[#56805D]/15 px-1.5 py-0.5 rounded">
                      In Stock
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Botanical Key Highlights */}
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
                {activeScene.keyActives.map((active, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#F7EFE9]"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-[#D4AF37]" />
                    <span>{active}</span>
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-2">
                <Link
                  to={`/shop?category=${activeScene.categorySlug}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#B87D4B] to-[#9E6536] hover:brightness-110 text-white text-xs font-semibold uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 shadow-md border border-[#D4AF37]/40"
                >
                  <span>Explore in Boutique</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Excellence */}
        <div
          className="aura-reveal mt-12 pt-8 grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto text-left border-t border-white/10"
          style={{ ["--d" as string]: "1.4s" }}
        >
          {HIGHLIGHTS.map((h) => (
            <div key={h.k} className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold block">
                {h.k}
              </span>
              <p className="text-xs text-[#FFFCFA] font-medium">{h.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Down Scroll Arrow */}
      <a
        href="#formulations-in-motion"
        aria-label="Scroll to collection"
        className="aura-fadein absolute bottom-5 left-1/2 -translate-x-1/2 z-20 text-[#D4AF37] hover:text-[#FFF1A8] transition-colors flex flex-col items-center gap-1 group"
        style={{ ["--d" as string]: "1.8s" }}
      >
        <span className="text-[10px] uppercase tracking-widest font-medium opacity-80 group-hover:opacity-100">
          Explore
        </span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </a>
    </section>
  );
};

export default CinematicVideoHero;