import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 text-center">
      <div className="max-w-md space-y-6">
        <span className="font-serif-luxury text-7xl font-bold text-[#B87D4B] block">
          404
        </span>
        <h1 className="font-serif-luxury text-3xl font-normal text-[#211A1C]">
          Page Not Found
        </h1>
        <p className="text-sm text-[#756D70] font-light leading-relaxed">
          The formulation, ritual, or page you are looking for does not exist or may have been relocated.
        </p>
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#B87D4B] hover:bg-[#9E6536] text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Boutique Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
