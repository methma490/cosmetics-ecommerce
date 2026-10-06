import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductForm from "../../components/admin/productForm";
import productService from "../../services/productService";
import type { CreateProductInput, Product } from "../../types/product";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

export const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    productService
      .getProductBySlug(id)
      .then((res) => {
        if (res.success && res.product) {
          setProduct(res.product);
        } else {
          toast.error("Product not found");
          navigate("/admin/products");
        }
      })
      .catch(() => {
        toast.error("Failed to load product");
        navigate("/admin/products");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleUpdate = async (data: CreateProductInput) => {
    if (!id) return;
    try {
      setSubmitting(true);
      const res = await productService.updateProduct(id, data);
      if (res.success) {
        toast.success(`"${data.name}" updated successfully!`);
        navigate("/admin/products");
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update product."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading product formulation..." />;
  }

  if (!product) {
    return null;
  }

  return (
    <ProductForm
      title={`Edit: ${product.name}`}
      initialProduct={product}
      onSubmit={handleUpdate}
      isSubmitting={submitting}
    />
  );
};

export default EditProductPage;
