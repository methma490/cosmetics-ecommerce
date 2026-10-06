import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Check } from "lucide-react";
import type { Product } from "../../types/product";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatPrice";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80";

  const secondaryImage =
    product.images && product.images.length > 1
      ? product.images[1]
      : primaryImage;

  const categoryName =
    typeof product.category === "object" && product.category !== null
      ? (product.category as { name: string }).name
      : "Cosmetics";

  const isOutOfStock = product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    const added = addToCart(product, 1);
    if (added) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1600);
    }
    setIsAdding(false);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-[#E8DADD]/70 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:border-[#C85C7A]/40 hover:-translate-y-1">
      {/* Product Image Area */}
      <Link
        to={`/products/${product.slug || product._id}`}
        className="block relative aspect-4/5 bg-[#FBECEF]/40 overflow-hidden"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Alternate Image on Hover if available */}
        {product.images && product.images.length > 1 && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className="w-full h-full object-cover object-center absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            loading="lazy"
          />
        )}

        {/* Stock status badge */}
        {isOutOfStock ? (
          <span className="absolute top-3 left-3 bg-[#252223]/80 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full">
            Sold Out
          </span>
        ) : product.stock <= 5 ? (
          <span className="absolute top-3 left-3 bg-[#B33A3A]/90 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full">
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
              className={`w-full py-2.5 px-4 rounded-full text-xs font-semibold backdrop-blur-md flex items-center justify-center gap-2 shadow-md transition-all ${
                justAdded
                  ? "bg-[#56805D] text-white"
                  : "bg-white/95 text-[#252223] hover:bg-[#C85C7A] hover:text-white"
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#756D70] mb-1">
            <span className="font-medium tracking-wider uppercase text-[#C85C7A]">
              {categoryName}
            </span>
            {product.brand && (
              <span className="text-[#756D70] font-light truncate max-w-[100px]">
                {product.brand}
              </span>
            )}
          </div>

          <Link
            to={`/products/${product.slug || product._id}`}
            className="block font-medium text-sm text-[#252223] hover:text-[#C85C7A] transition-colors line-clamp-1 mb-1.5"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        <div className="flex items-baseline justify-between pt-2 border-t border-[#E8DADD]/40 mt-2">
          <span className="font-serif-luxury text-base font-bold text-[#252223]">
            {formatPrice(product.price)}
          </span>
          <span
            className={`text-[11px] font-medium ${
              isOutOfStock
                ? "text-[#B33A3A]"
                : product.stock < 5
                ? "text-amber-700"
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
