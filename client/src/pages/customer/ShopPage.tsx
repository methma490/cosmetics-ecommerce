import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import type { Product, ProductFilterParams } from "../../types/product";
import type { Category } from "../../types/category";
import ProductGrid from "../../components/product/productGrid";
import ProductFilter from "../../components/product/productFilter";
import { Sparkles, X } from "lucide-react";

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from URL
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const inStock = searchParams.get("inStock") === "true";
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
        limit: 12,
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

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (category) count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (inStock) count++;
    if (search) count++;
    return count;
  }, [category, minPrice, maxPrice, inStock, search]);

  const activeCategoryName = useMemo(() => {
    if (!category) return null;
    const cat = categories.find((c) => c.slug === category);
    return cat ? cat.name : category;
  }, [category, categories]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Editorial Header */}
      <div className="space-y-3 pb-6 border-b border-[#E8DADD]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#C85C7A] uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Botanical Catalog</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="font-serif-luxury text-3xl sm:text-5xl font-normal text-[#252223]">
            {activeCategoryName ? activeCategoryName : "All Formulations"}
          </h1>
          <p className="text-xs text-[#756D70]">
            Showing <strong className="text-[#252223]">{totalCount}</strong> exquisite products
          </p>
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-[#756D70]">Active filters:</span>
          {search && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8DADD] text-xs text-[#252223]">
              <span>Search: "{search}"</span>
              <button
                type="button"
                onClick={() => updateQuery({ search: null })}
                className="hover:text-[#B33A3A]"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8DADD] text-xs text-[#252223]">
              <span>Category: {activeCategoryName}</span>
              <button
                type="button"
                onClick={() => updateQuery({ category: null })}
                className="hover:text-[#B33A3A]"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8DADD] text-xs text-[#252223]">
              <span>
                Rs. {minPrice || "0"} – {maxPrice || "Any"}
              </span>
              <button
                type="button"
                onClick={() => updateQuery({ minPrice: null, maxPrice: null })}
                className="hover:text-[#B33A3A]"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {inStock && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8DADD] text-xs text-[#252223]">
              <span>In Stock Only</span>
              <button
                type="button"
                onClick={() => updateQuery({ inStock: null })}
                className="hover:text-[#B33A3A]"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-[#C85C7A] hover:underline font-medium ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Layout: Sidebar + Product Grid */}
      <div className="flex gap-8 items-start">
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
        />

        <div className="flex-1 min-w-0">
          <ProductGrid
            products={products}
            loading={loading}
            onClearFilters={handleResetFilters}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-[#E8DADD]">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => updateQuery({ page: String(pageNum) })}
                    className={`w-9 h-9 rounded-full text-xs font-semibold transition-all ${
                      page === pageNum
                        ? "bg-[#C85C7A] text-white shadow-xs"
                        : "bg-white border border-[#E8DADD] text-[#252223] hover:bg-[#FBECEF]"
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
  );
};

export default ShopPage;
