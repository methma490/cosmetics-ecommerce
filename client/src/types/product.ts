import type { Category } from "./category";

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brand?: string;
  category: Category | { _id: string; name: string; slug: string };
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
  pages: number;
  products: Product[];
}

export interface ProductResponse {
  success: boolean;
  product: Product;
  message?: string;
}

export interface ProductFilterParams {
  search?: string;
  category?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  inStock?: boolean | string;
  sort?: string;
  page?: number;
  limit?: number;
  includeInactive?: boolean;
  isActive?: boolean;
}

export interface CreateProductInput {
  name: string;
  description: string;
  brand?: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  isActive?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  brand?: string;
  category?: string;
  price?: number;
  stock?: number;
  images?: string[];
  isActive?: boolean;
}
