import api from "./api";
import type {
  CategoriesResponse,
  CategoryResponse,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types/category";

export const categoryService = {
  getCategories: async (includeInactive = false): Promise<CategoriesResponse> => {
    const params = includeInactive ? { includeInactive: true } : undefined;
    const response = await api.get<CategoriesResponse>("/categories", { params });
    return response.data;
  },

  getCategoryBySlug: async (slug: string): Promise<CategoryResponse> => {
    const response = await api.get<CategoryResponse>(`/categories/${slug}`);
    return response.data;
  },

  createCategory: async (data: CreateCategoryInput): Promise<CategoryResponse> => {
    const response = await api.post<CategoryResponse>("/categories", data);
    return response.data;
  },

  updateCategory: async (
    id: string,
    data: UpdateCategoryInput
  ): Promise<CategoryResponse> => {
    const response = await api.patch<CategoryResponse>(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/categories/${id}`
    );
    return response.data;
  },
};

export default categoryService;
