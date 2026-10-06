import React from "react";
import type { Product } from "../../types/product";
import ProductCard from "./productCard";
import { Sparkles, RefreshCw } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onClearFilters?: () => void;
  skeletonCount?: number;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  onClearFilters,
  skeletonCount = 8,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-[#E8DADD]/60 overflow-hidden p-3 animate-pulse"
          >
            <div className="aspect-4/5 bg-[#FBECEF]/60 rounded-xl mb-3" />
            <div className="h-3 bg-[#E8DADD]/60 rounded-sm w-1/3 mb-2" />
            <div className="h-4 bg-[#E8DADD] rounded-sm w-3/4 mb-3" />
            <div className="flex justify-between items-center pt-2 border-t border-[#E8DADD]/30">
              <div className="h-4 bg-[#E8DADD] rounded-sm w-1/4" />
              <div className="h-3 bg-[#E8DADD]/60 rounded-sm w-1/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8DADD] p-12 text-center my-6">
        <div className="w-16 h-16 rounded-full bg-[#FBECEF] text-[#C85C7A] flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="font-serif-luxury text-xl font-semibold text-[#252223] mb-2">
          No formulations found
        </h3>
        <p className="text-sm text-[#756D70] max-w-md mx-auto mb-6">
          We couldn't find any products matching your selected criteria. Try adjusting your filters or search keywords.
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C85C7A] text-white text-xs font-semibold hover:bg-[#A84462] transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
