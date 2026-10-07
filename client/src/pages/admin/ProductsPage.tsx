import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import type { Product } from "../../types/product";
import type { Category } from "../../types/category";
import { formatPrice } from "../../utils/formatPrice";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lock background scrolling when Delete confirmation modal is open
  useBodyScrollLock(Boolean(deleteCandidate));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && deleteCandidate) {
        setDeleteCandidate(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteCandidate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts({ includeInactive: true, limit: 50 }),
        categoryService.getCategories(true),
      ]);

      if (prodRes.success && prodRes.products) {
        setProducts(prodRes.products);
      }
      if (catRes.success && catRes.categories) {
        setCategories(catRes.categories);
      }
    } catch (err) {
      console.error("Admin products load error:", err);
      toast.error("Failed to load products list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleActive = async (product: Product) => {
    try {
      const updatedStatus = !product.isActive;
      const res = await productService.updateProduct(product._id, {
        isActive: updatedStatus,
      });
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === product._id ? { ...p, isActive: updatedStatus } : p
          )
        );
        toast.success(
          `Product is now ${updatedStatus ? "Active" : "Inactive"}`
        );
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to toggle status"
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      setIsDeleting(true);
      const res = await productService.deleteProduct(deleteCandidate._id);
      if (res.success) {
        setProducts((prev) =>
          prev.filter((p) => p._id !== deleteCandidate._id)
        );
        toast.success(`"${deleteCandidate.name}" removed from catalog.`);
        setDeleteCandidate(null);
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete product."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));

      const pCatSlug =
        typeof p.category === "object" && p.category !== null
          ? (p.category as { slug: string }).slug
          : "";

      const matchesCat =
        selectedCategory === "" || pCatSlug === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DADD]">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#252223]">
            Formulations & Catalog
          </h1>
          <p className="text-xs text-[#756D70] mt-1">
            Manage your boutique cosmetic products, stock inventory, and pricing.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B87D4B] hover:bg-[#9E6536] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Formulation</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#FFFCFA] rounded-2xl border border-[#F0DFD8] p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-2xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or brand..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#F0DFD8] text-xs text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20 transition-all"
          />
          <Search className="w-4 h-4 text-[#756D70] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 rounded-xl border border-[#F0DFD8] text-xs text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20 transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <span className="text-xs text-[#756D70] whitespace-nowrap">
            {filteredProducts.length} items
          </span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loader text="Loading catalog..." />
      ) : filteredProducts.length === 0 ? (
        <div className="bg-[#FFFCFA] rounded-2xl border border-[#F0DFD8] p-12 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-[#F7EFE9] text-[#B87D4B] flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="font-serif-luxury text-lg text-[#211A1C]">
            No products found
          </h3>
          <p className="text-xs text-[#756D70]">
            Try adjusting your search query or add your first product.
          </p>
        </div>
      ) : (
        <div className="bg-[#FFFCFA] rounded-2xl border border-[#F0DFD8] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF9F5] border-b border-[#F0DFD8] text-[#756D70] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0DFD8]">
                {filteredProducts.map((p) => {
                  const catName =
                    typeof p.category === "object" && p.category !== null
                      ? (p.category as { name: string }).name
                      : "Cosmetics";

                  const img =
                    p.images?.[0] ||
                    "/images/placeholders/product-placeholder.jpg";

                  return (
                    <tr key={p._id} className="hover:bg-[#FFF9F5]/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt={p.name}
                            className="w-10 h-12 object-cover rounded-lg bg-[#FBECEF] border border-[#E8DADD]/40 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/images/placeholders/product-placeholder.jpg";
                            }}
                          />
                          <div>
                            <p className="font-semibold text-[#252223] truncate max-w-xs">
                              {p.name}
                            </p>
                            {p.brand && (
                              <p className="text-[11px] text-[#756D70]">
                                {p.brand}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#756D70]">{catName}</td>

                      <td className="py-3 px-4 font-semibold text-[#252223]">
                        {formatPrice(p.price)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-medium ${
                            p.stock <= 0
                              ? "text-[#B33A3A]"
                              : p.stock < 5
                              ? "text-amber-700"
                              : "text-[#56805D]"
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            p.isActive
                              ? "bg-[#56805D]/10 text-[#56805D] hover:bg-[#56805D]/20"
                              : "bg-[#756D70]/10 text-[#756D70] hover:bg-[#756D70]/20"
                          }`}
                          title="Click to toggle active status"
                        >
                          {p.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${p.slug || p._id}`}
                            target="_blank"
                            className="p-1.5 text-[#756D70] hover:text-[#252223]"
                            title="Preview on storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/admin/products/${p._id}/edit`}
                            className="p-1.5 text-[#756D70] hover:text-[#C85C7A]"
                            title="Edit formulation"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(p)}
                            className="p-1.5 text-[#756D70] hover:text-[#B33A3A]"
                            title="Delete formulation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteCandidate(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
        >
          <div className="bg-white rounded-3xl border border-[#E8DADD] p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-[#B33A3A]/10 text-[#B33A3A] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif-luxury text-lg font-semibold text-[#252223]">
                Delete Formulation?
              </h3>
              <p className="text-xs text-[#756D70]">
                Are you sure you wish to delete{" "}
                <strong className="text-[#252223]">
                  "{deleteCandidate.name}"
                </strong>
                ? This action cannot be reversed.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2.5 rounded-full border border-[#E8DADD] text-xs font-semibold text-[#756D70] hover:bg-[#FAF8F3]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-full bg-[#B33A3A] text-white text-xs font-semibold hover:bg-[#8F2B2B] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
