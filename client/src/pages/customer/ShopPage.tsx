import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import type { Product, ProductFilterParams } from "../../types/product";
import type { Category } from "../../types/category";
import ProductGrid from "../../components/product/productGrid";
import ProductFilter from "../../components/product/productFilter";
import { Sparkles, X, SlidersHorizontal, RotateCcw } from "lucide-react";

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from URL
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const inStock = searchParams.get("inStock") === "true";
  const skinType = searchParams.get("skinType") || "";
  const skinConcern = searchParams.get("skinConcern") || "";
  const form = searchParams.get("form") || "";
  const ingredient = searchParams.get("ingredient") || "";
  const aroma = searchParams.get("aroma") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Fetch Categories
  useEffect(() => {
    categoryService
      .getCategories()
      .then((res) => {
        if (res.success) setCategories(res.categories);
      })
      .catch((err) => console.error("Categories error:", err));
  }, []);

  // Fetch Products based on searchParams
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const params: ProductFilterParams = {
        page,
        limit: 24, // Generous limit to display boutique formulations
        sort,
      };

      if (search.trim()) params.search = search.trim();
      if (category.trim()) params.category = category.trim();
      if (minPrice && !isNaN(Number(minPrice))) params.minPrice = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) params.maxPrice = Number(maxPrice);
      if (inStock) params.inStock = true;

      const data = await productService.getProducts(params);

      if (data.success) {
        setProducts(data.products);
        setTotalCount(data.total);
        setTotalPages(data.pages || 1);
      }
    } catch (err) {
      console.error("Products error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, minPrice, maxPrice, inStock, page]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  // URL State updaters
  const updateQuery = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val);
      }
    });
    // Reset page to 1 when filters change (unless updating page itself)
    if (!("page" in updates)) {
      nextParams.delete("page");
    }
    setSearchParams(nextParams);
  };

  const handleSelectCategory = (catSlug: string) => {
    updateQuery({ category: catSlug || null });
  };

  const handleMinPrice = (val: string) => {
    updateQuery({ minPrice: val || null });
  };

  const handleMaxPrice = (val: string) => {
    updateQuery({ maxPrice: val || null });
  };

  const handleToggleInStock = (checked: boolean) => {
    updateQuery({ inStock: checked ? "true" : null });
  };

  const handleSortChange = (newSort: string) => {
    updateQuery({ sort: newSort });
  };

  const handleSkinType = (val: string) => {
    updateQuery({ skinType: val || null });
  };

  const handleSkinConcern = (val: string) => {
    updateQuery({ skinConcern: val || null });
  };

  const handleForm = (val: string) => {
    updateQuery({ form: val || null });
  };

  const handleIngredient = (val: string) => {
    updateQuery({ ingredient: val || null });
  };

  const handleAroma = (val: string) => {
    updateQuery({ aroma: val || null });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Client-side intelligent refinement on attributes for instant interactive feel
  const displayedProducts = useMemo(() => {
    return products.filter((p) => {
      const fullText = `${p.name} ${p.description || ""} ${p.brand || ""}`.toLowerCase();

      if (skinType) {
        const typeKeywords: Record<string, string[]> = {
          sensitive: ["gentle", "calm", "sooth", "sensitive", "pure"],
          dry: ["dry", "hydrat", "moistur", "nourish", "butter", "cream"],
          oily: ["oil", "matte", "blemish", "pore", "clarif", "cleanser"],
          combination: ["balanc", "cleanser", "serum", "hydrat"],
          normal: ["daily", "gentle", "smooth", "soft"],
          mature: ["anti-age", "wrinkle", "firm", "lift", "repair", "youth", "elixir"],
        };
        const words = typeKeywords[skinType] || [skinType];
        if (!words.some((w) => fullText.includes(w))) return false;
      }

      if (skinConcern) {
        const concernKeywords: Record<string, string[]> = {
          hydration: ["hydrat", "moistur", "dew", "hyaluronic", "replenish", "butter"],
          radiance: ["radiance", "glow", "bright", "luminous", "vitamin c", "highlighter"],
          "anti-aging": ["anti-age", "repair", "youth", "retinol", "peptide", "firm"],
          blemish: ["blemish", "clarif", "acne", "detox", "purif", "scrub", "polish"],
          firming: ["firm", "lift", "elastic", "keratin", "collagen", "elixir"],
          soothing: ["sooth", "calm", "gentle", "rose", "aloe", "chamomile"],
        };
        const words = concernKeywords[skinConcern] || [skinConcern];
        if (!words.some((w) => fullText.includes(w))) return false;
      }

      if (form) {
        const formKeywords: Record<string, string[]> = {
          serum: ["serum", "elixir", "concentrate"],
          cream: ["cream", "soufflé", "butter", "moisturizer"],
          cleanser: ["cleanser", "wash", "polish", "scrub", "foam"],
          oil: ["oil", "elixir"],
          mask: ["mask", "treatment"],
          lotion: ["lotion", "gel", "mist", "sunscreen"],
        };
        const words = formKeywords[form] || [form];
        if (!words.some((w) => fullText.includes(w))) return false;
      }

      if (ingredient) {
        const ingKeywords: Record<string, string[]> = {
          hyaluronic: ["hyaluronic", "acid"],
          niacinamide: ["niacinamide"],
          squalane: ["squalane", "botanical"],
          "vitamin-c": ["vitamin c", "brightening"],
          argan: ["argan", "moroccan"],
          rose: ["rose", "botanical"],
          shea: ["shea", "almond"],
        };
        const words = ingKeywords[ingredient] || [ingredient];
        if (!words.some((w) => fullText.includes(w))) return false;
      }

      if (aroma) {
        const aromaKeywords: Record<string, string[]> = {
          rose: ["rose", "floral", "petal"],
          citrus: ["citrus", "bergamot", "lemon", "orange"],
          amber: ["amber", "vanilla", "orchid", "twilight"],
          botanical: ["botanical", "herb", "aloe"],
          herbaceous: ["herb", "lavender", "sage"],
          "fragrance-free": ["fragrance free", "unscented", "pure"],
        };
        const words = aromaKeywords[aroma] || [aroma];
        if (!words.some((w) => fullText.includes(w))) return false;
      }

      return true;
    });
  }, [products, skinType, skinConcern, form, ingredient, aroma]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (category) count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (inStock) count++;
    if (search) count++;
    if (skinType) count++;
    if (skinConcern) count++;
    if (form) count++;
    if (ingredient) count++;
    if (aroma) count++;
    return count;
  }, [category, minPrice, maxPrice, inStock, search, skinType, skinConcern, form, ingredient, aroma]);

  const activeCategoryName = useMemo(() => {
    if (!category) return null;
    const cat = categories.find((c) => c.slug === category);
    return cat ? cat.name : category;
  }, [category, categories]);

  return (
    <div className="min-h-screen bg-[#FFF9F5] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* =========================================================================
            CLEAN EDITORIAL HEADER (Without redundant duplicate search bar)
           ========================================================================= */}
        <div className="pb-6 border-b border-[#EFE7DE]">
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#B87D4B] uppercase tracking-[0.25em] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#B87D4B]" />
            <span>Haute Beauté Catalog</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif-luxury text-3xl sm:text-5xl font-normal text-[#211A1C] tracking-tight">
                {activeCategoryName ? activeCategoryName : "All Formulations"}
              </h1>
              <p className="text-xs text-[#7D7275] mt-1.5 font-light">
                Curated apothecary formulations handcrafted with cold-pressed botanicals & peptides.
              </p>
            </div>

            <p className="text-xs text-[#7D7275] shrink-0 font-medium">
              Presenting{" "}
              <strong className="text-[#211A1C] font-semibold">
                {loading ? "..." : displayedProducts.length}
              </strong>{" "}
              botanical creations
            </p>
          </div>
        </div>

        {/* =========================================================================
            ACTIVE REFINEMENTS (Sleek, subtle pill tags)
           ========================================================================= */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 py-2">
            <span className="text-xs font-medium text-[#7D7275]">Active refinements:</span>

            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EFE7DE] text-xs font-medium text-[#211A1C] shadow-2xs">
                <span>Search: "{search}"</span>
                <button
                  type="button"
                  onClick={() => updateQuery({ search: null })}
                  className="text-[#8A7E81] hover:text-[#B33A3A] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EFE7DE] text-xs font-medium text-[#211A1C] shadow-2xs">
                <span>Category: {activeCategoryName}</span>
                <button
                  type="button"
                  onClick={() => updateQuery({ category: null })}
                  className="text-[#8A7E81] hover:text-[#B33A3A] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EFE7DE] text-xs font-medium text-[#211A1C] shadow-2xs">
                <span>
                  LKR {minPrice || "0"} – {maxPrice || "Any"}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuery({ minPrice: null, maxPrice: null })}
                  className="text-[#8A7E81] hover:text-[#B33A3A] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {skinType && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EFE7DE] text-xs font-medium text-[#211A1C] shadow-2xs capitalize">
                <span>Skin: {skinType}</span>
                <button
                  type="button"
                  onClick={() => updateQuery({ skinType: null })}
                  className="text-[#8A7E81] hover:text-[#B33A3A] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {skinConcern && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EFE7DE] text-xs font-medium text-[#211A1C] shadow-2xs capitalize">
                <span>Concern: {skinConcern}</span>
                <button
                  type="button"
                  onClick={() => updateQuery({ skinConcern: null })}
                  className="text-[#8A7E81] hover:text-[#B33A3A] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {form && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EFE7DE] text-xs font-medium text-[#211A1C] shadow-2xs capitalize">
                <span>Form: {form}</span>
                <button
                  type="button"
                  onClick={() => updateQuery({ form: null })}
                  className="text-[#8A7E81] hover:text-[#B33A3A] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {ingredient && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EFE7DE] text-xs font-medium text-[#211A1C] shadow-2xs capitalize">
                <span>Ingredient: {ingredient}</span>
                <button
                  type="button"
                  onClick={() => updateQuery({ ingredient: null })}
                  className="text-[#8A7E81] hover:text-[#B33A3A] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {aroma && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EFE7DE] text-xs font-medium text-[#211A1C] shadow-2xs capitalize">
                <span>Aroma: {aroma}</span>
                <button
                  type="button"
                  onClick={() => updateQuery({ aroma: null })}
                  className="text-[#8A7E81] hover:text-[#B33A3A] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {inStock && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EFE7DE] text-xs font-medium text-[#211A1C] shadow-2xs">
                <span>In Stock Only</span>
                <button
                  type="button"
                  onClick={() => updateQuery({ inStock: null })}
                  className="text-[#8A7E81] hover:text-[#B33A3A] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-[#B87D4B] hover:text-[#9E6536] hover:underline font-bold ml-1.5"
            >
              Clear all
            </button>
          </div>
        )}

        {/* =========================================================================
            CATALOG CONTROLS: Mobile Filter Trigger & Sort Order
           ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#EFE7DE]">
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-[#D8CEC4] bg-white text-xs font-semibold text-[#211A1C] hover:border-[#B87D4B] shadow-2xs transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#B87D4B]" />
              <span>Filter by</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#B87D4B] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs ml-auto">
            <span className="text-[#7D7275] hidden sm:inline font-medium">Sort Order:</span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-[#EFE7DE] bg-white text-[#211A1C] text-xs font-medium focus:outline-none focus:border-[#B87D4B] shadow-2xs cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Alphabetical: A to Z</option>
              <option value="name-desc">Alphabetical: Z to A</option>
              <option value="oldest">Earliest Formulations</option>
            </select>
          </div>
        </div>

        {/* =========================================================================
            MAIN LAYOUT: SIDEBAR (Matching Screenshot 2) + PRODUCTS
           ========================================================================= */}
        <div className="flex gap-8 items-start">
          {/* Filter Sidebar */}
          <ProductFilter
            categories={categories}
            selectedCategory={category}
            onSelectCategory={handleSelectCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={handleMinPrice}
            onMaxPriceChange={handleMaxPrice}
            inStockOnly={inStock}
            onToggleInStock={handleToggleInStock}
            sort={sort}
            onSortChange={handleSortChange}
            onResetFilters={handleResetFilters}
            activeFilterCount={activeFilterCount}
            isOpenMobile={mobileFilterOpen}
            setIsOpenMobile={setMobileFilterOpen}
            skinType={skinType}
            onSkinTypeChange={handleSkinType}
            skinConcern={skinConcern}
            onSkinConcernChange={handleSkinConcern}
            form={form}
            onFormChange={handleForm}
            ingredient={ingredient}
            onIngredientChange={handleIngredient}
            aroma={aroma}
            onAromaChange={handleAroma}
            onApplyFilters={() => {
              // Filters are reactive in state
            }}
          />

          {/* Product Grid Area */}
          <div className="flex-1 min-w-0">
            {displayedProducts.length > 0 ? (
              <ProductGrid
                products={displayedProducts}
                loading={loading}
                onClearFilters={handleResetFilters}
              />
            ) : (
              /* High-End Luxury Empty State */
              <div className="bg-white rounded-3xl border border-[#EFE7DE] p-12 text-center max-w-lg mx-auto shadow-xs space-y-5">
                <div className="w-14 h-14 rounded-full bg-[#F7EFE9] text-[#B87D4B] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif-luxury text-2xl font-normal text-[#211A1C]">
                    No Formulations Found
                  </h3>
                  <p className="text-xs text-[#7D7275] leading-relaxed">
                    No botanical creations currently match your active refinements.
                    Reset your filters to explore our full collection.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#211A1C] hover:bg-[#B87D4B] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Explore All Formulations</span>
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && displayedProducts.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-[#EFE7DE]">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => updateQuery({ page: String(pageNum) })}
                      className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                        page === pageNum
                          ? "bg-[#B87D4B] text-white shadow-xs"
                          : "bg-white border border-[#EFE7DE] text-[#211A1C] hover:bg-[#F7EFE9]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
