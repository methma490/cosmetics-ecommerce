import React from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import type { CartItem as CartItemType } from "../../context/CartContext";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatPrice";
import { Link } from "react-router-dom";

interface CartItemProps {
  item: CartItemType;
  onItemClick?: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onItemClick }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  const image =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80";

  const categoryName =
    typeof product.category === "object" && product.category !== null
      ? (product.category as { name: string }).name
      : "Beauty";

  return (
    <div className="flex gap-4 py-4 border-b border-[#E8DADD]/60 group">
      {/* Product Thumbnail */}
      <Link
        to={`/products/${product.slug || product._id}`}
        onClick={onItemClick}
        className="w-20 h-24 rounded-lg overflow-hidden bg-[#FBECEF] flex-shrink-0 relative border border-[#E8DADD]/40"
      >
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#C85C7A] font-medium">
                {categoryName}
              </span>
              <Link
                to={`/products/${product.slug || product._id}`}
                onClick={onItemClick}
                className="block text-sm font-medium text-[#252223] hover:text-[#C85C7A] transition-colors line-clamp-1"
              >
                {product.name}
              </Link>
            </div>
            <button
              type="button"
              onClick={() => removeFromCart(product._id)}
              className="text-[#756D70] hover:text-[#B33A3A] p-1 transition-colors"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#756D70] mt-1 font-medium">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Quantity Controls & Line Total */}
        <div className="flex items-center justify-between mt-2 pt-1">
          <div className="flex items-center border border-[#E8DADD] rounded-full bg-white px-2 py-0.5">
            <button
              type="button"
              onClick={() => updateQuantity(product._id, quantity - 1)}
              className="p-1 text-[#756D70] hover:text-[#252223] transition-colors disabled:opacity-30"
              title="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center text-xs font-semibold text-[#252223]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(product._id, quantity + 1)}
              disabled={quantity >= product.stock}
              className="p-1 text-[#756D70] hover:text-[#C85C7A] transition-colors disabled:opacity-30"
              title={
                quantity >= product.stock
                  ? "Maximum stock reached"
                  : "Increase quantity"
              }
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <span className="text-xs font-semibold text-[#252223]">
            {formatPrice(product.price * quantity)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
