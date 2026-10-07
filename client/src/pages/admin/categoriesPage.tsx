import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Layers,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import categoryService from "../../services/categoryService";
import type { Category } from "../../types/category";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteCandidate, setDeleteCandidate] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lock background scrolling when either modal is open
  useBodyScrollLock(modalOpen || Boolean(deleteCandidate));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (deleteCandidate) setDeleteCandidate(null);
        else if (modalOpen) setModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteCandidate, modalOpen]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories(true);
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error("Categories load error:", err);
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setIsActive(cat.isActive);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        const res = await categoryService.updateCategory(editingCategory._id, {
          name: name.trim(),
          description: description.trim() || undefined,
          isActive,
        });
        if (res.success) {
          toast.success(`Category "${name}" updated.`);
          setModalOpen(false);
          void loadCategories();
        }
      } else {
        const res = await categoryService.createCategory({
          name: name.trim(),
          description: description.trim() || undefined,
        });
        if (res.success) {
          toast.success(`Category "${name}" created.`);
          setModalOpen(false);
          void loadCategories();
        }
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save category."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      setIsDeleting(true);
      const res = await categoryService.deleteCategory(deleteCandidate._id);
      if (res.success) {
        toast.success(`Category "${deleteCandidate.name}" deleted.`);
        setDeleteCandidate(null);
        void loadCategories();
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete category."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0DFD8]">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold-metallic block">
            Taxonomy Management
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#211A1C]">
            Product Categories
          </h1>
          <p className="text-xs text-[#756D70] mt-1">
            Organize formulations into intuitive boutique departments.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B87D4B] hover:bg-[#9E6536] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Table / List */}
      {loading ? (
        <Loader text="Loading categories..." />
      ) : categories.length === 0 ? (
        <div className="bg-[#FFFCFA] rounded-2xl border border-[#F0DFD8] p-12 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-[#F7EFE9] text-[#B87D4B] flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="font-serif-luxury text-lg text-[#211A1C]">
            No categories yet
          </h3>
          <p className="text-xs text-[#756D70]">
            Create categories such as Skincare, Makeup, or Fragrance.
          </p>
        </div>
      ) : (
        <div className="bg-[#FFFCFA] rounded-2xl border border-[#F0DFD8] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF9F5] border-b border-[#F0DFD8] text-[#756D70] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0DFD8]">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-[#FFF9F5]/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#211A1C]">
                      {cat.name}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#756D70]">
                      {cat.slug}
                    </td>

                    <td className="py-3.5 px-4 text-[#756D70] max-w-sm truncate">
                      {cat.description || "—"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          cat.isActive
                            ? "bg-[#56805D]/10 text-[#56805D]"
                            : "bg-[#756D70]/10 text-[#756D70]"
                        }`}
                      >
                        {cat.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-[#756D70] hover:text-[#B87D4B] cursor-pointer"
                          title="Edit category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(cat)}
                          className="p-1.5 text-[#756D70] hover:text-[#B33A3A]"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
        >
          <div className="bg-white rounded-3xl border border-[#E8DADD] p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DADD]/60">
              <h3 className="font-serif-luxury text-lg font-semibold text-[#252223]">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#756D70] hover:text-[#252223]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#252223] mb-1.5">
                  Category Name <span className="text-[#B33A3A]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Body Care"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DADD] text-xs sm:text-sm text-[#252223] bg-white focus:outline-hidden focus:border-[#C85C7A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#252223] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this collection..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DADD] text-xs sm:text-sm text-[#252223] bg-white focus:outline-hidden focus:border-[#C85C7A]"
                />
              </div>

              {editingCategory && (
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded-sm border-[#E8DADD] text-[#C85C7A] focus:ring-[#C85C7A]"
                    />
                    <span className="text-xs font-medium text-[#252223]">
                      Active (Visible in storefront)
                    </span>
                  </label>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8DADD]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2 rounded-full border border-[#E8DADD] text-xs font-semibold text-[#756D70] hover:bg-[#FAF8F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-full bg-[#C85C7A] text-white text-xs font-semibold hover:bg-[#A84462] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Save Category</span>
                  )}
                </button>
              </div>
            </form>
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
                Delete Category?
              </h3>
              <p className="text-xs text-[#756D70]">
                Are you sure you wish to delete{" "}
                <strong className="text-[#252223]">
                  "{deleteCandidate.name}"
                </strong>
                ? If products are linked to this category, deletion will be blocked by system safety rules.
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

export default CategoriesPage;
