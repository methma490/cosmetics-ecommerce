import React from "react";
import { Sparkles } from "lucide-react";

interface PageLoaderProps {
  message?: string;
}

/**
 * Luxury page loading screen used during route transitions and lazy-load suspenses.
 */
export const PageLoader: React.FC<PageLoaderProps> = ({
  message = "Loading Atelier...",
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 page-transition">
      <div className="relative flex items-center justify-center mb-6">
        {/* Soft background pulse aura */}
        <div className="absolute w-20 h-20 rounded-full bg-[#D4AF37]/15 blur-xl animate-pulse" />

        {/* Outer spinning gold ring */}
        <div className="w-14 h-14 rounded-full border-2 border-[#F0DFD8] border-t-[#D4AF37] border-r-[#B87D4B] animate-spin" />

        {/* Center luxury emblem */}
        <div className="absolute flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF9F5] shadow-xs">
          <Sparkles className="w-4 h-4 text-[#B87D4B] animate-pulse" />
        </div>
      </div>

      <div className="text-center space-y-1">
        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8F6B00] block">
          AURA BOTANICA
        </span>
        <p className="font-serif-luxury text-sm font-medium text-[#211A1C] tracking-wide">
          {message}
        </p>
      </div>
    </div>
  );
};

export default PageLoader;
