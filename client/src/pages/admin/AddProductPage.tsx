import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "../../components/admin/productForm";
import productService from "../../services/productService";
import type { CreateProductInput } from "../../types/product";
import toast from "react-hot-toast";

export const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (data: CreateProductInput) => {
    try {
      setSubmitting(true);
      const res = await productService.createProduct(data);
      if (res.success) {
        toast.success(`"${data.name}" was added to the catalog!`);
        navigate("/admin/products");
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create product."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProductForm
      title="Add New Formulation"
      onSubmit={handleCreate}
      isSubmitting={submitting}
    />
  );
};

export default AddProductPage;
