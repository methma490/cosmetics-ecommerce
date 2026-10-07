import api from "./api";
import type { CartItem } from "../context/CartContext";

export interface CartResponse {
  success: boolean;
  message?: string;
  items: CartItem[];
}

export const cartService = {
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get<CartResponse>("/cart");
    return response.data;
  },

  addToCart: async (productId: string, quantity = 1): Promise<CartResponse> => {
    const response = await api.post<CartResponse>("/cart/items", {
      productId,
      quantity,
    });
    return response.data;
  },

  updateQuantity: async (
    productId: string,
    quantity: number
  ): Promise<CartResponse> => {
    const response = await api.put<CartResponse>(`/cart/items/${productId}`, {
      quantity,
    });
    return response.data;
  },

  removeFromCart: async (productId: string): Promise<CartResponse> => {
    const response = await api.delete<CartResponse>(`/cart/items/${productId}`);
    return response.data;
  },

  clearCart: async (): Promise<CartResponse> => {
    const response = await api.delete<CartResponse>("/cart");
    return response.data;
  },

  mergeCart: async (
    items: Array<{ productId: string; quantity: number }>
  ): Promise<CartResponse> => {
    const response = await api.post<CartResponse>("/cart/merge", { items });
    return response.data;
  },
};

export default cartService;
