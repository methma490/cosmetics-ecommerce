import React, { useState } from "react";
import type { Category } from "../../types/category";
import { ChevronDown, X, Check } from "lucide-react";

export interface ProductFilterProps {
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
  // Additional attribute filters matching Image 2
  skinType?: string;
  onSkinTypeChange?: (val: string) => void;
  skinConcern?: string;
  onSkinConcernChange?: (val: string) => void;
  form?: string;
  onFormChange?: (val: string) => void;
  ingredient?: string;
  onIngredientChange?: (val: string) => void;
  aroma?: string;
  onAromaChange?: (val: string) => void;
  onApplyFilters?: () => void;
}

const SKIN_TYPES = [
  { label: "All Skin Types", value: "" },
  { label: "Sensitive", value: "sensitive" },
  { label: "Dry & Dehydrated", value: "dry" },
  { label: "Oily & Blemish-Prone", value: "oily" },
  { label: "Combination", value: "combination" },
  { label: "Normal", value: "normal" },
  { label: "Mature", value: "mature" },
];

const SKIN_CONCERNS = [
  { label: "All Concerns", value: "" },
  { label: "Deep Hydration & Moisture", value: "hydration" },
  { label: "Radiance & Brightening", value: "radiance" },
  { label: "Anti-Aging & Fine Lines", value: "anti-aging" },
  { label: "Blemish & Clarifying", value: "blemish" },
  { label: "Firming & Elasticity", value: "firming" },
  { label: "Soothing & Calming", value: "soothing" },
];

const PRODUCT_FORMS = [
  { label: "All Forms", value: "" },
  { label: "Serum & Elixir", value: "serum" },
  { label: "Cream & Moisturizer", value: "cream" },
  { label: "Cleanser & Polish", value: "cleanser" },
  { label: "Oil & Balm", value: "oil" },
  { label: "Mask & Treatment", value: "mask" },
  { label: "Lotion & Mist", value: "lotion" },
];

const INGREDIENTS = [
  { label: "All Ingredients", value: "" },
  { label: "Hyaluronic Acid", value: "hyaluronic" },
  { label: "Niacinamide", value: "niacinamide" },
  { label: "Botanical Squalane", value: "squalane" },
  { label: "Vitamin C", value: "vitamin-c" },
  { label: "Organic Argan Oil", value: "argan" },
  { label: "Rose & Botanical Water", value: "rose" },
  { label: "Shea & Almond Butter", value: "shea" },
];

const AROMAS = [
  { label: "All Aromas", value: "" },
  { label: "Floral Rose", value: "rose" },
  { label: "Citrus & Bergamot", value: "citrus" },
  { label: "Warm Amber & Vanilla", value: "amber" },
  { label: "Fresh Botanical", value: "botanical" },
  { label: "Herbaceous", value: "herbaceous" },
  { label: "100% Fragrance-Free", value: "fragrance-free" },
];

const PRICE_PRESETS = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under LKR 3,500", min: "", max: "3500" },
  { label: "LKR 3,500 – 6,000", min: "3500", max: "6000" },
  { label: "LKR 6,000 – 10,000", min: "6000", max: "10000" },
  { label: "Over LKR 10,000", min: "10000", max: "" },
];

const SORT_OPTIONS = [
  { label: "Newest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Alphabetical: A to Z", value: "name-asc" },
  { label: "Alphabetical: Z to A", value: "name-desc" },
  { label: "Earliest Formulations", value: "oldest" },
];

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
  sort = "newest",
  onSortChange,
  onResetFilters,
  activeFilterCount,
  isOpenMobile,
  setIsOpenMobile,
  skinType = "",
  onSkinTypeChange,
  skinConcern = "",
  onSkinConcernChange,
  form = "",
  onFormChange,
  ingredient = "",
  onIngredientChange,
  aroma = "",
  onAromaChange,
  onApplyFilters,
}) => {
  // Accordion open/close state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sort: false,
    price: true,
    filter: true,
    skinType: false,
    skinConcern: false,
    form: false,
    ingredients: false,
    aroma: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleApply = () => {
    if (onApplyFilters) onApplyFilters();
    if (isOpenMobile) setIsOpenMobile(false);
  };

  const filterAccordionContent = (
    <div className="divide-y divide-[#EFE7DE] text-[#211A1C]">
      {/* 1. PRICE ACCORDION */}
      <div className="py-3">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between py-1 text-sm font-semibold text-[#211A1C] hover:text-[#B87D4B] transition-colors text-left"
        >
          <span className="tracking-wide">Price</span>
          <ChevronDown
            className={`w-4 h-4 text-[#8A7E81] transition-transform duration-200 ${
              openSections.price ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.price && (
          <div className="pt-3 pb-2 space-y-3 animate-in fade-in duration-150">
            {/* Quick Price Ranges */}
            <div className="space-y-1">
              {PRICE_PRESETS.map((preset, idx) => {
                const isSelected =
                  minPrice === preset.min && maxPrice === preset.max;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onMinPriceChange(preset.min);
                      onMaxPriceChange(preset.max);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-[#F7EFE9] text-[#B87D4B] font-bold"
                        : "text-[#5C5255] hover:bg-[#FAF7F5] hover:text-[#211A1C]"
                    }`}
                  >
                    <span>{preset.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#B87D4B]" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Min / Max Price Inputs */}
            <div className="pt-2 border-t border-[#F5ECE5]">
              <span className="block text-[11px] font-semibold text-[#8A7E81] uppercase tracking-wider mb-1.5">
                Custom Range (LKR)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    placeholder="Min (0)"
                    value={minPrice}
                    onChange={(e) => onMinPriceChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#EFE7DE] text-xs bg-[#FFFCFA] text-[#211A1C] placeholder-[#A89C9F] focus:outline-none focus:border-[#B87D4B]"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => onMaxPriceChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#EFE7DE] text-xs bg-[#FFFCFA] text-[#211A1C] placeholder-[#A89C9F] focus:outline-none focus:border-[#B87D4B]"
                  />
                </div>
              </div>
            </div>

            {/* In Stock Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#5C5255] hover:text-[#211A1C] pt-1">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onToggleInStock(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#D8CEC4] text-[#B87D4B] focus:ring-[#B87D4B]"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        )}
      </div>

      {/* 2. FILTER / CATEGORY ACCORDION */}
      <div className="py-3">
        <button
          type="button"
          onClick={() => toggleSection("filter")}
          className="w-full flex items-center justify-between py-1 text-sm font-semibold text-[#211A1C] hover:text-[#B87D4B] transition-colors text-left"
        >
          <span className="tracking-wide">Category</span>
          <ChevronDown
            className={`w-4 h-4 text-[#8A7E81] transition-transform duration-200 ${
              openSections.filter ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.filter && (
          <div className="pt-2 pb-1 space-y-1 animate-in fade-in duration-150">
            <button
              type="button"
              onClick={() => onSelectCategory("")}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                selectedCategory === ""
                  ? "bg-[#F7EFE9] text-[#B87D4B] font-bold"
                  : "text-[#5C5255] hover:bg-[#FAF7F5] hover:text-[#211A1C]"
              }`}
            >
              <span>All Formulations</span>
              {selectedCategory === "" && (
                <Check className="w-3.5 h-3.5 text-[#B87D4B]" />
              )}
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-[#F7EFE9] text-[#B87D4B] font-bold"
                      : "text-[#5C5255] hover:bg-[#FAF7F5] hover:text-[#211A1C]"
                  }`}
                >
                  <span>{cat.name}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#B87D4B]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* SORT ORDER ACCORDION */}
      <div className="py-3">
        <button
          type="button"
          onClick={() => toggleSection("sort")}
          className="w-full flex items-center justify-between py-1 text-sm font-semibold text-[#211A1C] hover:text-[#B87D4B] transition-colors text-left"
        >
          <span className="tracking-wide">Sort order</span>
          <ChevronDown
            className={`w-4 h-4 text-[#8A7E81] transition-transform duration-200 ${
              openSections.sort ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.sort && (
          <div className="pt-2 pb-1 space-y-1 animate-in fade-in duration-150">
            {SORT_OPTIONS.map((item) => {
              const isSelected = sort === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onSortChange && onSortChange(item.value)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-[#F7EFE9] text-[#B87D4B] font-bold"
                      : "text-[#5C5255] hover:bg-[#FAF7F5] hover:text-[#211A1C]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#B87D4B]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. SKIN TYPE ACCORDION */}
      <div className="py-3">
        <button
          type="button"
          onClick={() => toggleSection("skinType")}
          className="w-full flex items-center justify-between py-1 text-sm font-semibold text-[#211A1C] hover:text-[#B87D4B] transition-colors text-left"
        >
          <span className="tracking-wide">Skin type</span>
          <ChevronDown
            className={`w-4 h-4 text-[#8A7E81] transition-transform duration-200 ${
              openSections.skinType ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.skinType && (
          <div className="pt-2 pb-1 space-y-1 animate-in fade-in duration-150">
            {SKIN_TYPES.map((item) => {
              const isSelected = skinType === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onSkinTypeChange && onSkinTypeChange(item.value)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-[#F7EFE9] text-[#B87D4B] font-bold"
                      : "text-[#5C5255] hover:bg-[#FAF7F5] hover:text-[#211A1C]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#B87D4B]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. SKIN CONCERN ACCORDION */}
      <div className="py-3">
        <button
          type="button"
          onClick={() => toggleSection("skinConcern")}
          className="w-full flex items-center justify-between py-1 text-sm font-semibold text-[#211A1C] hover:text-[#B87D4B] transition-colors text-left"
        >
          <span className="tracking-wide">Skin concern</span>
          <ChevronDown
            className={`w-4 h-4 text-[#8A7E81] transition-transform duration-200 ${
              openSections.skinConcern ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.skinConcern && (
          <div className="pt-2 pb-1 space-y-1 animate-in fade-in duration-150">
            {SKIN_CONCERNS.map((item) => {
              const isSelected = skinConcern === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    onSkinConcernChange && onSkinConcernChange(item.value)
                  }
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-[#F7EFE9] text-[#B87D4B] font-bold"
                      : "text-[#5C5255] hover:bg-[#FAF7F5] hover:text-[#211A1C]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#B87D4B]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. FORM ACCORDION */}
      <div className="py-3">
        <button
          type="button"
          onClick={() => toggleSection("form")}
          className="w-full flex items-center justify-between py-1 text-sm font-semibold text-[#211A1C] hover:text-[#B87D4B] transition-colors text-left"
        >
          <span className="tracking-wide">Form</span>
          <ChevronDown
            className={`w-4 h-4 text-[#8A7E81] transition-transform duration-200 ${
              openSections.form ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.form && (
          <div className="pt-2 pb-1 space-y-1 animate-in fade-in duration-150">
            {PRODUCT_FORMS.map((item) => {
              const isSelected = form === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onFormChange && onFormChange(item.value)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-[#F7EFE9] text-[#B87D4B] font-bold"
                      : "text-[#5C5255] hover:bg-[#FAF7F5] hover:text-[#211A1C]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#B87D4B]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. INGREDIENTS ACCORDION */}
      <div className="py-3">
        <button
          type="button"
          onClick={() => toggleSection("ingredients")}
          className="w-full flex items-center justify-between py-1 text-sm font-semibold text-[#211A1C] hover:text-[#B87D4B] transition-colors text-left"
        >
          <span className="tracking-wide">Ingredients</span>
          <ChevronDown
            className={`w-4 h-4 text-[#8A7E81] transition-transform duration-200 ${
              openSections.ingredients ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.ingredients && (
          <div className="pt-2 pb-1 space-y-1 animate-in fade-in duration-150">
            {INGREDIENTS.map((item) => {
              const isSelected = ingredient === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    onIngredientChange && onIngredientChange(item.value)
                  }
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-[#F7EFE9] text-[#B87D4B] font-bold"
                      : "text-[#5C5255] hover:bg-[#FAF7F5] hover:text-[#211A1C]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#B87D4B]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. AROMA ACCORDION */}
      <div className="py-3">
        <button
          type="button"
          onClick={() => toggleSection("aroma")}
          className="w-full flex items-center justify-between py-1 text-sm font-semibold text-[#211A1C] hover:text-[#B87D4B] transition-colors text-left"
        >
          <span className="tracking-wide">Aroma</span>
          <ChevronDown
            className={`w-4 h-4 text-[#8A7E81] transition-transform duration-200 ${
              openSections.aroma ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.aroma && (
          <div className="pt-2 pb-1 space-y-1 animate-in fade-in duration-150">
            {AROMAS.map((item) => {
              const isSelected = aroma === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onAromaChange && onAromaChange(item.value)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-[#F7EFE9] text-[#B87D4B] font-bold"
                      : "text-[#5C5255] hover:bg-[#FAF7F5] hover:text-[#211A1C]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#B87D4B]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* =========================================================================
          DESKTOP SIDEBAR (Styled exactly as in Screenshot 1, fixed to page)
         ========================================================================= */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-white border border-[#EFE7DE] rounded-2xl shadow-xs sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-hidden">
        {/* Header matching Image 1 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EFE7DE] bg-[#FCF9F7] shrink-0">
          <h3 className="font-serif-luxury text-base font-semibold text-[#211A1C]">
            Filter by
          </h3>
          {activeFilterCount > 0 && (
            <span className="text-[11px] font-bold text-[#B87D4B] bg-[#F7EFE9] px-2.5 py-0.5 rounded-full">
              {activeFilterCount} Active
            </span>
          )}
        </div>

        {/* Scrollable Accordions - Clean, smooth scrolling WITHOUT ugly browser scrollbar */}
        <div className="px-5 py-2 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {filterAccordionContent}
        </div>

        {/* Bottom Bar: RESET ALL and APPLY > matching Image 1 */}
        <div className="flex items-center justify-between border-t border-[#EFE7DE] bg-[#FCF9F7] px-5 py-3.5 shrink-0">
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-bold uppercase tracking-wider text-[#5C5255] hover:text-[#B33A3A] transition-colors"
          >
            RESET ALL
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#211A1C] hover:bg-[#B87D4B] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-xs"
          >
            <span>APPLY</span>
            <span className="text-sm">›</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MOBILE DRAWER (Exact structure with Cancel ✕)
         ========================================================================= */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#211A1C]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpenMobile(false)}
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10">
            {/* Header: "Filter by" and "Cancel ✕" */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#EFE7DE] bg-[#FCF9F7]">
              <h3 className="font-serif-luxury text-lg font-semibold text-[#211A1C]">
                Filter by
              </h3>
              <button
                type="button"
                onClick={() => setIsOpenMobile(false)}
                className="flex items-center gap-1 text-xs font-semibold text-[#5C5255] hover:text-[#211A1C] p-1"
              >
                <span>Cancel</span>
                <X className="w-4 h-4 ml-0.5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 px-5 py-2 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {filterAccordionContent}
            </div>

            {/* Sticky Footer: "RESET ALL" and "APPLY >" */}
            <div className="flex items-center justify-between border-t border-[#EFE7DE] bg-[#FCF9F7] px-5 py-3.5">
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-bold uppercase tracking-wider text-[#5C5255] hover:text-[#B33A3A] transition-colors"
              >
                RESET ALL
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#211A1C] hover:bg-[#B87D4B] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-xs"
              >
                <span>APPLY</span>
                <span className="text-sm">›</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductFilter;
