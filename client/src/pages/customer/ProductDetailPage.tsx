import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  MessageCircle,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";
import productService from "../../services/productService";
import type { Product } from "../../types/product";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatPrice";
import Loader from "../../components/common/Loader";
import ProductCard from "../../components/product/productCard";

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "ritual" | "shipping">("details");
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  const { addToCart, openCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductBySlug(id);

        if (data.success && data.product) {
          setProduct(data.product);
          setSelectedImage(
            data.product.images?.[0] ||
              "/images/placeholders/product-placeholder.jpg"
          );
          setQuantity(1);

          // Fetch related products from same category
          const categorySlug =
            typeof data.product.category === "object" && data.product.category !== null
              ? (data.product.category as { slug?: string }).slug
              : undefined;

          if (categorySlug) {
            productService
              .getProducts({ category: categorySlug, limit: 4 })
              .then((res) => {
                if (res.success) {
                  setRelatedProducts(
                    res.products.filter((p) => p._id !== data.product._id).slice(0, 4)
                  );
                }
              })
              .catch(() => {});
          }
        } else {
          setError("Product not found");
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load product details"
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) {
    return <Loader fullScreen text="Preparing product ritual..." />;
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif-luxury text-2xl text-[#211A1C]">
          Product Unavailable
        </h2>
        <p className="text-sm text-[#7D7275]">
          {error || "The formulation you are looking for does not exist."}
        </p>
        <Link
          to="/shop"
          className="inline-block px-8 py-3 rounded-full bg-[#B87D4B] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#9E6536] transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const categoryName =
    typeof product.category === "object" && product.category !== null
      ? (product.category as { name: string }).name
      : "Haute Beauté";

  const categorySlug =
    typeof product.category === "object" && product.category !== null
      ? (product.category as { slug: string }).slug
      : "";

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const added = addToCart(product, quantity);
    if (added) {
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1200);
      openCart();
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const added = addToCart(product, quantity);
    if (added) {
      navigate("/checkout");
    }
  };

  const handleWhatsAppInquiry = () => {
    const message = `Hello AURA Haute Beauté! I'm interested in *${product.name}* (${formatPrice(product.price)}). Could you tell me more about availability and express delivery?`;
    window.open(`https://wa.me/94743301490?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 bg-[#FFF9F5]">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#7D7275]">
        <Link to="/" className="hover:text-[#B87D4B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#F0DFD8]" />
        <Link to="/shop" className="hover:text-[#B87D4B]">Shop</Link>
        {categoryName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#F0DFD8]" />
            <Link to={`/shop?category=${categorySlug}`} className="hover:text-[#B87D4B]">
              {categoryName}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-[#F0DFD8]" />
        <span className="text-[#211A1C] font-semibold truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Hero Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Product Images */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img
                      ? "border-[#D4AF37] shadow-sm"
                      : "border-[#F0DFD8] opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumb ${i}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/placeholders/product-placeholder.jpg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Image */}
          <div className="flex-1 aspect-4/5 rounded-3xl overflow-hidden bg-[#FFFCFA] border border-[#F0DFD8] shadow-sm relative group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/placeholders/product-placeholder.jpg";
              }}
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-[#211A1C]/60 backdrop-blur-xs flex items-center justify-center">
                <span className="px-6 py-2 rounded-full bg-white text-[#211A1C] text-xs uppercase tracking-widest font-bold">
                  Sold Out
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Purchase Area */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold uppercase tracking-[0.2em] text-[#B87D4B]">
                {categoryName}
              </span>
              {product.brand && (
                <span className="px-3 py-0.5 rounded-full bg-[#FFFCFA] border border-[#D4AF37]/40 text-[11px] font-medium text-[#211A1C] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  <span>{product.brand}</span>
                </span>
              )}
            </div>

            <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#211A1C] font-normal leading-tight">
              {product.name}
            </h1>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#211A1C]">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-[#7D7275]">LKR, Taxes Included</span>
            </div>
          </div>

          {/* Stock state badge */}
          <div className="pt-1">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#B33A3A]/10 text-[#B33A3A] text-xs font-semibold">
                Out of Stock
              </span>
            ) : product.stock <= 5 ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-[#D4AF37]/50 text-xs font-medium">
                Only {product.stock} units remaining in boutique inventory
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-[#56805D] text-xs font-medium border border-emerald-100">
                <Check className="w-3.5 h-3.5" />
                <span>In Stock ({product.stock} units available)</span>
              </span>
            )}
          </div>

          {/* Short description */}
          <p className="text-sm text-[#7D7275] font-light leading-relaxed">
            {product.description}
          </p>

          {/* Quantity selector & Actions */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-4 border-t border-[#F0DFD8]">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-[#211A1C]">Quantity</span>
                <div className="flex items-center border border-[#F0DFD8] rounded-full bg-[#FFFCFA] px-3 py-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-1 text-[#7D7275] hover:text-[#211A1C] disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-[#211A1C]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="p-1 text-[#7D7275] hover:text-[#B87D4B] disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-[#7D7275]">
                  Subtotal: <strong className="text-[#211A1C]">{formatPrice(product.price * quantity)}</strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`py-3.5 px-6 rounded-full text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm ${
                    addedAnimation
                      ? "bg-[#56805D] text-white"
                      : "bg-[#B87D4B] text-white hover:bg-[#9E6536] hover:shadow-md cursor-pointer border border-[#B87D4B]"
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3.5 px-6 rounded-full border border-[#D4AF37]/60 text-[#211A1C] hover:bg-[#211A1C] hover:text-[#FFFCFA] text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer bg-[#FFFCFA]"
                >
                  Buy Now
                </button>
              </div>

              {/* Direct WhatsApp Ordering */}
              <button
                type="button"
                onClick={handleWhatsAppInquiry}
                className="w-full py-3 px-4 rounded-full bg-[#FFFCFA] border border-[#56805D]/40 hover:border-[#56805D] text-xs font-semibold text-[#211A1C] hover:text-[#56805D] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-[#56805D]" />
                <span>Inquire or Order Directly via WhatsApp</span>
              </button>
            </div>
          )}

          {/* Delivery & Trust highlights */}
          <div className="pt-4 border-t border-[#F0DFD8] space-y-2.5 text-xs text-[#7D7275]">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#B87D4B]" />
              <span>Complimentary express delivery on orders over LKR 8,000</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#8F6B00]" />
              <span>100% Guaranteed Authentic Formulation with Batch Certificate</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-[#7D7275]" />
              <span>Dispatched within 24 hours in luxury protective packaging</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Detailed Information */}
      <div className="bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] p-6 sm:p-10 shadow-xs">
        <div className="flex border-b border-[#F0DFD8] gap-8 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`pb-2 text-xs font-semibold uppercase tracking-widest transition-colors relative ${
              activeTab === "details"
                ? "text-[#B87D4B] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gold-metallic"
                : "text-[#7D7275] hover:text-[#211A1C]"
            }`}
          >
            Formulation & Actives
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ritual")}
            className={`pb-2 text-xs font-semibold uppercase tracking-widest transition-colors relative ${
              activeTab === "ritual"
                ? "text-[#B87D4B] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gold-metallic"
                : "text-[#7D7275] hover:text-[#211A1C]"
            }`}
          >
            The Daily Ritual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("shipping")}
            className={`pb-2 text-xs font-semibold uppercase tracking-widest transition-colors relative ${
              activeTab === "shipping"
                ? "text-[#B87D4B] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gold-metallic"
                : "text-[#7D7275] hover:text-[#211A1C]"
            }`}
          >
            Care & Shipping
          </button>
        </div>

        <div className="pt-6 text-sm text-[#7D7275] leading-relaxed font-light">
          {activeTab === "details" && (
            <div className="space-y-4">
              <p>{product.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#F0DFD8] text-xs">
                <div>
                  <strong className="text-[#211A1C] block mb-1">Key Botanical Actives</strong>
                  <span>Cold-pressed floral oils, bio-identical ceramides, botanical antioxidants.</span>
                </div>
                <div>
                  <strong className="text-[#211A1C] block mb-1">Consciously Formulated Without</strong>
                  <span>Parabens, sulfates, synthetic fillers, mineral oils, cruelty-free.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ritual" && (
            <div className="space-y-3">
              <p>
                Warm a small pearl-sized amount between clean fingertips to activate the botanical essences. Gently press and smooth into skin with upward sweeping motions.
              </p>
              <p>
                For best results, incorporate morning and evening into your mindful beauty ritual following gentle botanical cleansing.
              </p>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-3">
              <p>
                All orders are packaged in eco-conscious, recyclable luxury boxes with protective cushioning. Orders placed before 2:00 PM are processed the same business day.
              </p>
              <p>
                Express courier delivery across Colombo and suburbs within 24-48 hours. Islandwide regional delivery within 2-4 business days.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="flex items-baseline justify-between border-b border-[#F0DFD8] pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
                Complementary Rituals
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#211A1C] mt-1">
                You May Also Adore
              </h2>
            </div>
            <Link
              to={`/shop?category=${categorySlug}`}
              className="text-xs font-semibold text-[#B87D4B] hover:text-[#9E6536]"
            >
              View More in {categoryName} →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
