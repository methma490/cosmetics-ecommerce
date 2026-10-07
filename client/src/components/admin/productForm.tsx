import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import categoryService from "../../services/categoryService";
import type { Category } from "../../types/category";
import type { CreateProductInput, Product } from "../../types/product";
import toast from "react-hot-toast";

interface ProductFormProps {
  initialProduct?: Product;
  onSubmit: (data: CreateProductInput) => Promise<void>;
  isSubmitting?: boolean;
  title: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  onSubmit,
  isSubmitting = false,
  title,
}) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);

  const [name, setName] = useState(initialProduct?.name || "");
  const [brand, setBrand] = useState(initialProduct?.brand || "");
  const [categoryId, setCategoryId] = useState(
    typeof initialProduct?.category === "object" && initialProduct?.category !== null
      ? (initialProduct.category as { _id: string })._id
      : ((initialProduct?.category as unknown as string) || "")
  );
  const [price, setPrice] = useState(
    initialProduct?.price !== undefined ? String(initialProduct.price) : ""
  );
  const [stock, setStock] = useState(
    initialProduct?.stock !== undefined ? String(initialProduct.stock) : "10"
  );
  const [description, setDescription] = useState(
    initialProduct?.description || ""
  );
  const [images, setImages] = useState<string[]>(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images
      : [""]
  );
  const [isActive, setIsActive] = useState(
    initialProduct?.isActive !== undefined ? initialProduct.isActive : true
  );

  useEffect(() => {
    categoryService
      .getCategories(true)
      .then((res) => {
        if (res.success && res.categories) {
          setCategories(res.categories);
          if (!categoryId && res.categories.length > 0) {
            setCategoryId(res.categories[0]._id);
          }
        }
      })
      .catch((err) => console.error("Error loading categories:", err))
      .finally(() => setLoadingCategories(false));
  }, [categoryId]);

  const handleImageChange = (index: number, val: string) => {
    const updated = [...images];
    updated[index] = val;
    setImages(updated);
  };

  const handleAddImageField = () => {
    setImages([...images, ""]);
  };

  const handleRemoveImageField = (index: number) => {
    if (images.length === 1) {
      setImages([""]);
      return;
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    const numericStock = parseInt(stock, 10);
    if (isNaN(numericStock) || numericStock < 0) {
      toast.error("Please enter a valid whole number for stock.");
      return;
    }

    if (!description.trim()) {
      toast.error("Description is required.");
      return;
    }

    const cleanImages = images
      .map((img) => img.trim())
      .filter((img) => img.length > 0);

    const payload: CreateProductInput = {
      name: name.trim(),
      brand: brand.trim() || undefined,
      category: categoryId,
      price: numericPrice,
      stock: numericStock,
      description: description.trim(),
      images: cleanImages,
      isActive,
    };

    await onSubmit(payload);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/products"
          className="p-2 rounded-xl border border-[#E8DADD] hover:bg-white text-[#756D70] hover:text-[#252223] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#252223]">
            {title}
          </h1>
          <p className="text-xs text-[#756D70]">
            Fill in the details to update your boutique inventory.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] p-6 sm:p-10 shadow-2xs space-y-8"
      >
        {/* Core Info */}
        <div className="space-y-4">
          <h2 className="text-[10px] uppercase tracking-[0.25em] text-gold-metallic font-bold border-b border-[#F0DFD8] pb-2">
            General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#211A1C] mb-1.5">
                Product Name <span className="text-[#B33A3A]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Luminous Botanical Serum"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0DFD8] text-xs sm:text-sm text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#211A1C] mb-1.5">
                Brand Name
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Lumière Botanique"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0DFD8] text-xs sm:text-sm text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#211A1C] mb-1.5">
                Category <span className="text-[#B33A3A]">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                disabled={loadingCategories}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0DFD8] text-xs sm:text-sm text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#211A1C] mb-1.5">
                Price (LKR) <span className="text-[#B33A3A]">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="any"
                placeholder="4850"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0DFD8] text-xs sm:text-sm text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#211A1C] mb-1.5">
                Stock Units <span className="text-[#B33A3A]">*</span>
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                min="0"
                step="1"
                placeholder="20"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0DFD8] text-xs sm:text-sm text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#211A1C] mb-1.5">
              Description <span className="text-[#B33A3A]">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe the product benefits, active botanicals, and texture..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0DFD8] text-xs sm:text-sm text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20"
            />
          </div>
        </div>

        {/* Product Images Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0DFD8] pb-2">
            <h2 className="text-[10px] uppercase tracking-[0.25em] text-[#B87D4B] font-bold">
              Product Images (URLs)
            </h2>
            <button
              type="button"
              onClick={handleAddImageField}
              className="text-xs text-[#B87D4B] hover:text-[#9E6536] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add URL</span>
            </button>
          </div>

          <div className="space-y-3">
            {images.map((imgUrl, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="url"
                  value={imgUrl}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  placeholder="https://res.cloudinary.com/... or /images/..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#F0DFD8] text-xs text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B] focus:ring-1 focus:ring-[#B87D4B]/20"
                />
                {imgUrl && (
                  <img
                    src={imgUrl}
                    alt="Preview"
                    className="w-9 h-9 rounded-lg object-cover bg-[#F7EFE9] border border-[#F0DFD8]"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/placeholders/product-placeholder.jpg";
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImageField(idx)}
                  className="p-2 text-[#756D70] hover:text-[#B33A3A] cursor-pointer"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Status Toggle */}
        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded-sm border-[#F0DFD8] text-[#B87D4B] focus:ring-[#B87D4B]"
            />
            <span className="text-xs font-semibold text-[#211A1C]">
              Active in Storefront (Visible to Customers)
            </span>
          </label>
        </div>

        {/* Submit Actions */}
        <div className="pt-6 border-t border-[#F0DFD8] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-6 py-2.5 rounded-full border border-[#D4AF37]/40 text-xs font-semibold text-[#756D70] hover:bg-[#FFF9F5] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-full bg-[#B87D4B] hover:bg-[#9E6536] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Formulation</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
