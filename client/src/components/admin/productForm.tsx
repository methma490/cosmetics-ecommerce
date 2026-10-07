import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, Loader2, UploadCloud, Image as ImageIcon, Sparkles } from "lucide-react";
import categoryService from "../../services/categoryService";
import uploadService from "../../services/uploadService";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
      : []
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [manualUrlInput, setManualUrlInput] = useState<string>("");
  const [showManualUrl, setShowManualUrl] = useState<boolean>(false);
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

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    await uploadFiles(Array.from(files));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFiles = async (filesList: File[]) => {
    const validFiles = filesList.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      toast.error("Please select valid image files (JPG, PNG, WEBP, GIF, AVIF).");
      return;
    }

    try {
      setIsUploading(true);
      toast.loading("Uploading images to Cloudinary...", { id: "upload-toast" });
      const res = await uploadService.uploadImages(validFiles);
      if (res.success && res.urls.length > 0) {
        setImages((prev) => [...prev, ...res.urls]);
        toast.success(`Successfully uploaded ${res.urls.length} image(s) to Cloudinary!`, {
          id: "upload-toast",
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Upload failed";
      toast.error(`Cloudinary Upload: ${errMsg}`, { id: "upload-toast" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddManualUrl = () => {
    if (!manualUrlInput.trim()) return;
    setImages((prev) => [...prev, manualUrlInput.trim()]);
    setManualUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
    toast.success("Set as primary product photo");
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
            <div>
              <h2 className="text-[10px] uppercase tracking-[0.25em] text-[#B87D4B] font-bold flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Product Images (Cloudinary)</span>
              </h2>
              <p className="text-[11px] text-[#756D70] font-light mt-0.5">
                Upload image files directly to Cloudinary or link local assets.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowManualUrl(!showManualUrl)}
              className="text-xs text-[#B87D4B] hover:text-[#9E6536] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showManualUrl ? "Hide URL Input" : "Add by URL"}</span>
            </button>
          </div>

          {/* Hidden File Input for Native File Selection */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilesSelected}
            multiple
            accept="image/*"
            className="hidden"
          />

          {/* Cloudinary Drag & Drop / Click Upload Box */}
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (isUploading) return;
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                void uploadFiles(Array.from(e.dataTransfer.files));
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
              isUploading
                ? "bg-[#FFF9F5] border-[#B87D4B]/40 opacity-70 pointer-events-none"
                : "border-[#D4AF37]/50 hover:border-[#B87D4B] bg-[#FFFCFA] hover:bg-[#FFF9F5]/70"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#FFF9F5] border border-[#F0DFD8] flex items-center justify-center text-[#B87D4B]">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#B87D4B]" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#211A1C]">
                {isUploading ? (
                  "Uploading images to Cloudinary..."
                ) : (
                  <>
                    <span className="text-[#B87D4B] underline underline-offset-2">Click to select photos</span> or drag & drop here
                  </>
                )}
              </p>
              <p className="text-[11px] text-[#756D70] mt-1 font-light">
                PNG, JPG, WEBP, GIF up to 10MB • Automatically uploaded to Cloudinary
              </p>
            </div>
          </div>

          {/* Optional Manual URL input */}
          {showManualUrl && (
            <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-200">
              <input
                type="text"
                value={manualUrlInput}
                onChange={(e) => setManualUrlInput(e.target.value)}
                placeholder="https://res.cloudinary.com/... or /images/products/..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-[#F0DFD8] text-xs text-[#211A1C] bg-white focus:outline-hidden focus:border-[#B87D4B]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddManualUrl();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddManualUrl}
                className="px-4 py-2 rounded-xl bg-[#211A1C] text-[#FFF1A8] text-xs font-semibold hover:bg-black transition-colors"
              >
                Add
              </button>
            </div>
          )}

          {/* Uploaded Images Grid Preview */}
          {images.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-[10px] uppercase tracking-wider text-[#756D70] font-semibold flex items-center justify-between">
                <span>Product Photos ({images.length})</span>
                <span className="text-[10px] text-[#B87D4B] font-normal">
                  First photo is the storefront cover
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {images.map((imgUrl, idx) => {
                  const isCloudinary = imgUrl.includes("cloudinary.com");
                  const isPrimary = idx === 0;

                  return (
                    <div
                      key={idx}
                      className={`group relative rounded-2xl overflow-hidden border bg-[#FFF9F5] shadow-xs flex flex-col ${
                        isPrimary
                          ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30"
                          : "border-[#F0DFD8]"
                      }`}
                    >
                      {/* Image Preview */}
                      <div className="aspect-square relative overflow-hidden bg-white">
                        <img
                          src={imgUrl}
                          alt={`Product view ${idx + 1}`}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/placeholders/product-placeholder.jpg";
                          }}
                        />

                        {/* Primary Badge */}
                        {isPrimary && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#211A1C]/90 text-[#FFF1A8] text-[9px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                            <span>Cover</span>
                          </div>
                        )}

                        {/* Cloudinary Badge */}
                        {isCloudinary && (
                          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-[#1e40af]/90 text-white text-[9px] font-medium tracking-wide shadow-xs">
                            Cloudinary
                          </div>
                        )}

                        {/* Remove button */}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1.5 rounded-full bg-white/90 text-[#B33A3A] hover:bg-[#B33A3A] hover:text-white transition-colors shadow-xs"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Set as cover button */}
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          className="text-[10px] text-[#756D70] hover:text-[#B87D4B] py-1.5 px-2 text-center bg-white border-t border-[#F0DFD8] font-medium transition-colors cursor-pointer"
                        >
                          Make Cover Photo
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
