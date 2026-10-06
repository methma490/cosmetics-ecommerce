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
              "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"
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
        <h2 className="font-serif-luxury text-2xl text-[#252223]">
          Product Unavailable
        </h2>
        <p className="text-sm text-[#756D70]">
          {error || "The formulation you are looking for does not exist."}
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-2.5 rounded-full bg-[#C85C7A] text-white text-xs font-semibold hover:bg-[#A84462] transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const categoryName =
    typeof product.category === "object" && product.category !== null
      ? (product.category as { name: string }).name
      : "Cosmetics";

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
      setTimeout(() => setAddedAnimation(false), 1500);
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
    const message = `Hello AURA! I'm interested in *${product.name}* (${formatPrice(product.price)}). Could you tell me more about availability and delivery?`;
    window.open(`https://wa.me/94771234567?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#756D70]">
        <Link to="/" className="hover:text-[#C85C7A]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#E8DADD]" />
        <Link to="/shop" className="hover:text-[#C85C7A]">Shop</Link>
        {categoryName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#E8DADD]" />
            <Link to={`/shop?category=${categorySlug}`} className="hover:text-[#C85C7A]">
              {categoryName}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-[#E8DADD]" />
        <span className="text-[#252223] font-medium truncate max-w-[200px]">{product.name}</span>
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
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img
                      ? "border-[#C85C7A] shadow-xs"
                      : "border-[#E8DADD]/60 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`${product.name} thumb ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Image */}
          <div className="flex-1 aspect-4/5 rounded-3xl overflow-hidden bg-white border border-[#E8DADD] shadow-sm relative group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                <span className="px-6 py-2 rounded-full bg-white text-[#252223] text-xs uppercase tracking-widest font-bold">
                  Sold Out
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Purchase Area */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-[#756D70] mb-2">
              <span className="font-semibold uppercase tracking-widest text-[#C85C7A]">
                {categoryName}
              </span>
              {product.brand && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F3] border border-[#E8DADD] text-[11px] font-medium text-[#252223]">
                  {product.brand}
                </span>
              )}
            </div>

            <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#252223] font-normal leading-tight">
              {product.name}
            </h1>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#252223]">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-[#756D70]">LKR, Taxes Included</span>
            </div>
          </div>

          {/* Stock state badge */}
          <div className="pt-2">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B33A3A]/10 text-[#B33A3A] text-xs font-semibold">
                Out of Stock
              </span>
            ) : product.stock <= 5 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
                Only {product.stock} units remaining in boutique stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#56805D]/10 text-[#56805D] text-xs font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>In Stock ({product.stock} units available)</span>
              </span>
            )}
          </div>

          {/* Short description */}
          <p className="text-sm text-[#756D70] font-light leading-relaxed">
            {product.description}
          </p>

          {/* Quantity selector & Actions */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-4 border-t border-[#E8DADD]/60">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-[#252223]">Quantity</span>
                <div className="flex items-center border border-[#E8DADD] rounded-full bg-white px-3 py-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-1 text-[#756D70] hover:text-[#252223] disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-[#252223]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="p-1 text-[#756D70] hover:text-[#C85C7A] disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-[#756D70]">
                  Line subtotal: <strong>{formatPrice(product.price * quantity)}</strong>
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
                      : "bg-[#C85C7A] text-white hover:bg-[#A84462] hover:shadow-md cursor-pointer"
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
                  className="py-3.5 px-6 rounded-full border border-[#252223] text-[#252223] hover:bg-[#252223] hover:text-white text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer"
                >
                  Buy Now
                </button>
              </div>

              {/* Direct WhatsApp Ordering */}
              <button
                type="button"
                onClick={handleWhatsAppInquiry}
                className="w-full py-3 px-4 rounded-full bg-[#FAF8F3] border border-[#E8DADD] hover:border-[#56805D] text-xs font-medium text-[#252223] hover:text-[#56805D] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#56805D]" />
                <span>Inquire or Order via WhatsApp</span>
              </button>
            </div>
          )}

          {/* Delivery & Trust highlights */}
          <div className="pt-4 border-t border-[#E8DADD]/60 space-y-2.5 text-xs text-[#756D70]">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#C85C7A]" />
              <span>Complimentary shipping on orders over Rs. 15,000</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#56805D]" />
              <span>100% Guaranteed Authentic Formulation</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-[#756D70]" />
              <span>Dispatched within 24-48 business hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Detailed Information */}
      <div className="bg-white rounded-3xl border border-[#E8DADD] p-6 sm:p-10 shadow-xs">
        <div className="flex border-b border-[#E8DADD] gap-8 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`pb-2 text-sm font-semibold uppercase tracking-wider transition-colors relative ${
              activeTab === "details"
                ? "text-[#C85C7A] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#C85C7A]"
                : "text-[#756D70] hover:text-[#252223]"
            }`}
          >
            Formulation & Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ritual")}
            className={`pb-2 text-sm font-semibold uppercase tracking-wider transition-colors relative ${
              activeTab === "ritual"
                ? "text-[#C85C7A] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#C85C7A]"
                : "text-[#756D70] hover:text-[#252223]"
            }`}
          >
            Ritual Application
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("shipping")}
            className={`pb-2 text-sm font-semibold uppercase tracking-wider transition-colors relative ${
              activeTab === "shipping"
                ? "text-[#C85C7A] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#C85C7A]"
                : "text-[#756D70] hover:text-[#252223]"
            }`}
          >
            Delivery & Authenticity
          </button>
        </div>

        <div className="pt-6 text-sm text-[#756D70] leading-relaxed font-light">
          {activeTab === "details" && (
            <div className="space-y-4">
              <p>{product.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E8DADD]/40 text-xs">
                <div>
                  <strong className="text-[#252223] block mb-1">Key Botanical Actives</strong>
                  <span>Cold-pressed oils, plant ceramides, botanical antioxidants.</span>
                </div>
                <div>
                  <strong className="text-[#252223] block mb-1">Formulated Without</strong>
                  <span>Parabens, sulfates, synthetic fillers, phthalates.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ritual" && (
            <div className="space-y-3">
              <p>
                Warm a small pearl-sized amount between clean fingertips to activate the botanical essences. Gently press and smooth into skin with upward motions.
              </p>
              <p>
                For best results, incorporate morning and evening into your mindful beauty ritual following gentle cleansing.
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
          <div className="flex items-baseline justify-between border-b border-[#E8DADD]/60 pb-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#C85C7A] font-semibold">
                Complementary Rituals
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#252223] mt-1">
                You May Also Adore
              </h2>
            </div>
            <Link
              to={`/shop?category=${categorySlug}`}
              className="text-xs font-semibold text-[#C85C7A] hover:underline"
            >
              View More in {categoryName}
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
