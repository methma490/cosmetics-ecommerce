import api from "./api";
import type {
  CreateProductInput,
  ProductFilterParams,
  ProductResponse,
  ProductsResponse,
  UpdateProductInput,
} from "../types/product";

export const productService = {
  getProducts: async (
    params?: ProductFilterParams
  ): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>("/products", {
      params,
    });
    return response.data;
  },

  getProductBySlug: async (idOrSlug: string): Promise<ProductResponse> => {
    const response = await api.get<ProductResponse>(`/products/${idOrSlug}`);
    return response.data;
  },

  createProduct: async (
    data: CreateProductInput
  ): Promise<ProductResponse> => {
    const response = await api.post<ProductResponse>("/products", data);
    return response.data;
  },

  updateProduct: async (
    id: string,
    data: UpdateProductInput
  ): Promise<ProductResponse> => {
    const response = await api.patch<ProductResponse>(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/products/${id}`
    );
    return response.data;
  },
};

export default productService;
