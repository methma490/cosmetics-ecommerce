import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import productService from "../../services/productService";
import type { Product } from "../../types/product";
import { formatPrice } from "../../utils/formatPrice";

interface SearchBarProps {
  onClose?: () => void;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onClose,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts({
          search: query.trim(),
          limit: 5,
        });
        setResults(data.products || []);
        setIsOpen(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    if (onClose) onClose();
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search serums, lipsticks, fragrances..."
          autoFocus={autoFocus}
          className="w-full pl-10 pr-10 py-2.5 rounded-full border border-[#E8DADD] bg-white text-xs sm:text-sm text-[#252223] placeholder:text-[#756D70] focus:outline-hidden focus:border-[#C85C7A] focus:ring-2 focus:ring-[#F3D6DE]/50 transition-all shadow-xs"
        />
        <Search className="w-4 h-4 text-[#756D70] absolute left-3.5 pointer-events-none" />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 p-1 text-[#756D70] hover:text-[#252223]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Live Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#E8DADD] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {loading ? (
            <div className="p-6 flex items-center justify-center gap-2 text-xs text-[#756D70]">
              <Loader2 className="w-4 h-4 animate-spin text-[#C85C7A]" />
              <span>Searching formulations...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-[#E8DADD]/40">
              <div className="px-4 py-2 bg-[#FAF8F3] text-[11px] font-semibold tracking-wider text-[#756D70] uppercase">
                Products ({results.length})
              </div>
              {results.map((product) => {
                const img =
                  product.images?.[0] ||
                  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=200&q=80";
                return (
                  <Link
                    key={product._id}
                    to={`/products/${product.slug || product._id}`}
                    onClick={() => {
                      setIsOpen(false);
                      if (onClose) onClose();
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-[#FBECEF]/40 transition-colors"
                  >
                    <img
                      src={img}
                      alt={product.name}
                      className="w-10 h-12 object-cover rounded-md bg-[#FBECEF] border border-[#E8DADD]/50"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#252223] truncate">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-[#C85C7A] font-semibold">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </Link>
                );
              })}
              <div className="p-2.5 bg-[#FAF8F3] text-center">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="text-xs font-semibold text-[#C85C7A] hover:text-[#A84462] transition-colors"
                >
                  View all results for "{query}" →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#756D70]">
              No products found matching "<strong className="text-[#252223]">{query}</strong>"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
