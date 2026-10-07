import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Check, Sparkles } from "lucide-react";
import type { Product } from "../../types/product";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatPrice";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, openCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "/images/placeholders/product-placeholder.jpg";

  const secondaryImage =
    product.images && product.images.length > 1
      ? product.images[1]
      : primaryImage;

  const categoryName =
    typeof product.category === "object" && product.category !== null
      ? (product.category as { name: string }).name
      : "Haute Beauté";

  const isOutOfStock = product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    const added = addToCart(product, 1);
    if (added) {
      setJustAdded(true);
      setTimeout(() => {
        setJustAdded(false);
        openCart();
      }, 700);
    }
    setIsAdding(false);
  };

  return (
    <div className="group relative bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] overflow-hidden flex flex-col transition-all duration-500 hover:shadow-xl hover:border-[#D4AF37]/60 hover:-translate-y-1">
      {/* Product Image Area */}
      <Link
        to={`/products/${product.slug || product._id}`}
        className="block relative aspect-4/5 bg-[#FFF9F5] overflow-hidden"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/placeholders/product-placeholder.jpg";
          }}
        />

        {/* Alternate Image on Hover if available */}
        {product.images && product.images.length > 1 && (
          <img
            src={secondaryImage}
            alt={`${product.name} editorial angle`}
            className="w-full h-full object-cover object-center absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/placeholders/product-placeholder.jpg";
            }}
          />
        )}

        {/* Subtle top gold reflection gradient */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/15 to-transparent pointer-events-none" />

        {/* Stock status badge */}
        {isOutOfStock ? (
          <span className="absolute top-3 left-3 bg-[#211A1C]/85 backdrop-blur-md text-[#FFFCFA] text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full border border-white/20 shadow-xs">
            Sold Out
          </span>
        ) : product.stock <= 5 ? (
          <span className="absolute top-3 left-3 bg-[#8F6B00]/90 backdrop-blur-md text-[#FFF1A8] text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full border border-[#D4AF37]/50 shadow-xs">
            Only {product.stock} Left
          </span>
        ) : null}

        {/* Quick Add Button Overlay */}
        {!isOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isAdding}
              className={`w-full py-3 px-4 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md flex items-center justify-center gap-2 shadow-lg transition-all ${
                justAdded
                  ? "bg-[#56805D] text-white border border-[#56805D]"
                  : "bg-[#FFFCFA]/95 text-[#211A1C] hover:bg-[#B87D4B] hover:text-white border border-[#D4AF37]/40 hover:border-[#B87D4B]"
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37] group-hover:text-white transition-colors" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="font-semibold tracking-[0.16em] uppercase text-[#B87D4B]">
              {categoryName}
            </span>
            {product.brand && (
              <span className="text-[#7D7275] font-light truncate max-w-[110px] flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                <span>{product.brand}</span>
              </span>
            )}
          </div>

          <Link
            to={`/products/${product.slug || product._id}`}
            className="block font-medium text-sm sm:text-base text-[#211A1C] hover:text-[#B87D4B] transition-colors line-clamp-1 mb-1 font-serif-luxury"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        <div className="flex items-baseline justify-between pt-3 border-t border-[#F0DFD8]">
          <span className="font-serif-luxury text-base sm:text-lg font-bold text-[#211A1C]">
            {formatPrice(product.price)}
          </span>
          <span
            className={`text-[10px] uppercase tracking-wider font-semibold ${
              isOutOfStock
                ? "text-[#B33A3A]"
                : product.stock < 5
                ? "text-[#8F6B00]"
                : "text-[#56805D]"
            }`}
          >
            {isOutOfStock ? "Out of Stock" : "In Stock"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
