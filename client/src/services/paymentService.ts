import api from "./api";
import type {
  PayHereInitiateResponse,
  PaymentStatusResponse,
} from "../types/order";

export const paymentService = {
  initiatePayHere: async (
    orderId: string
  ): Promise<PayHereInitiateResponse> => {
    const response = await api.post<PayHereInitiateResponse>(
      `/payments/payhere/initiate/${orderId}`
    );
    return response.data;
  },

  getPaymentStatus: async (
    orderId: string
  ): Promise<PaymentStatusResponse> => {
    const response = await api.get<PaymentStatusResponse>(
      `/payments/${orderId}/status`
    );
    return response.data;
  },
};

export default paymentService;
