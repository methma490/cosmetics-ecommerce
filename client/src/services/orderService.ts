import api from "./api";
import type {
  CreateOrderInput,
  CreateOrderResponse,
  OrderStatus,
  OrdersResponse,
  PaymentStatus,
  SingleOrderResponse,
  WhatsAppOrderResponse,
} from "../types/order";

export const orderService = {
  createOrder: async (data: CreateOrderInput): Promise<CreateOrderResponse> => {
    const response = await api.post<CreateOrderResponse>("/orders", data);
    return response.data;
  },

  getMyOrders: async (): Promise<OrdersResponse> => {
    const response = await api.get<OrdersResponse>("/orders/my-orders");
    return response.data;
  },

  getOrderById: async (id: string): Promise<SingleOrderResponse> => {
    const response = await api.get<SingleOrderResponse>(`/orders/${id}`);
    return response.data;
  },

  getAllOrders: async (filters?: {
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
  }): Promise<OrdersResponse> => {
    const response = await api.get<OrdersResponse>("/orders/admin/all", {
      params: filters,
    });
    return response.data;
  },

  updateOrderStatus: async (
    id: string,
    orderStatus: OrderStatus
  ): Promise<SingleOrderResponse> => {
    const response = await api.patch<SingleOrderResponse>(
      `/orders/admin/${id}/status`,
      { orderStatus }
    );
    return response.data;
  },

  updatePaymentStatus: async (
    id: string,
    paymentStatus: PaymentStatus
  ): Promise<SingleOrderResponse> => {
    const response = await api.patch<SingleOrderResponse>(
      `/orders/admin/${id}/payment-status`,
      { paymentStatus }
    );
    return response.data;
  },

  getWhatsAppOrder: async (id: string): Promise<WhatsAppOrderResponse> => {
    const response = await api.get<WhatsAppOrderResponse>(
      `/orders/${id}/whatsapp`
    );
    return response.data;
  },
};

export default orderService;
