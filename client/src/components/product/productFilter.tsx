import React from "react";
import type { Category } from "../../types/category";
import { Filter, X, RotateCcw } from "lucide-react";

interface ProductFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (val: string) => void;
  onMaxPriceChange: (val: string) => void;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
  sort: string;
  onSortChange: (sortVal: string) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  inStockOnly,
  onToggleInStock,
  sort,
  onSortChange,
  onResetFilters,
  activeFilterCount,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const filterContent = (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h4 className="font-serif-luxury text-sm font-semibold text-[#252223] mb-3">
          Categories
        </h4>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onSelectCategory("")}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
              selectedCategory === ""
                ? "bg-[#C85C7A] text-white"
                : "text-[#756D70] hover:bg-[#FBECEF] hover:text-[#252223]"
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                selectedCategory === cat.slug
                  ? "bg-[#C85C7A] text-white"
                  : "text-[#756D70] hover:bg-[#FBECEF] hover:text-[#252223]"
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="font-serif-luxury text-sm font-semibold text-[#252223] mb-3">
          Price Range (Rs.)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-[#756D70] mb-1">Min</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-[#E8DADD] text-xs bg-white text-[#252223] focus:outline-hidden focus:border-[#C85C7A]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#756D70] mb-1">Max</label>
            <input
              type="number"
              placeholder="20,000"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-[#E8DADD] text-xs bg-white text-[#252223] focus:outline-hidden focus:border-[#C85C7A]"
            />
          </div>
        </div>
      </div>

      {/* Availability Filter */}
      <div>
        <h4 className="font-serif-luxury text-sm font-semibold text-[#252223] mb-3">
          Availability
        </h4>
        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#252223]">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggleInStock(e.target.checked)}
            className="w-4 h-4 rounded-sm border-[#E8DADD] text-[#C85C7A] focus:ring-[#C85C7A]"
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Reset Button */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={onResetFilters}
          className="w-full py-2 px-3 rounded-lg border border-[#E8DADD] text-[#756D70] hover:text-[#B33A3A] hover:border-[#B33A3A]/40 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters ({activeFilterCount})</span>
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Top Filter Bar with Sort and Mobile Filter Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E8DADD]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpenMobile(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-[#E8DADD] bg-white text-xs font-semibold text-[#252223] hover:border-[#C85C7A]"
          >
            <Filter className="w-3.5 h-3.5 text-[#C85C7A]" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#C85C7A] text-white text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#756D70] hidden sm:inline">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E8DADD] bg-white text-[#252223] text-xs font-medium focus:outline-hidden focus:border-[#C85C7A]"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Desktop Sidebar Filter */}
      <aside className="hidden lg:block w-64 flex-shrink-0 bg-white rounded-2xl border border-[#E8DADD] p-6 shadow-xs h-fit sticky top-28">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E8DADD]/60">
          <h3 className="font-serif-luxury text-base font-semibold text-[#252223] flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#C85C7A]" />
            <span>Refine By</span>
          </h3>
          {activeFilterCount > 0 && (
            <span className="text-[11px] text-[#C85C7A] font-semibold">
              {activeFilterCount} Active
            </span>
          )}
        </div>
        {filterContent}
      </aside>

      {/* Mobile Drawer Filter */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsOpenMobile(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E8DADD]">
              <h3 className="font-serif-luxury text-base font-semibold text-[#252223]">
                Filter Formulations
              </h3>
              <button
                type="button"
                onClick={() => setIsOpenMobile(false)}
                className="p-1 rounded-full text-[#756D70] hover:text-[#252223]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterContent}
            <div className="mt-8 pt-4 border-t border-[#E8DADD]">
              <button
                type="button"
                onClick={() => setIsOpenMobile(false)}
                className="w-full py-3 rounded-full bg-[#C85C7A] text-white text-xs font-semibold hover:bg-[#A84462] transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductFilter;
