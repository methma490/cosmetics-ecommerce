import type { Product } from "./product";

export type PaymentMethod = "payhere" | "whatsapp";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  postalCode?: string;
  country: string;
}

export interface OrderItem {
  product: Product | { _id: string; name: string; slug: string; images?: string[] } | string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: { _id: string; email: string; role?: string } | string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  payHerePaymentId?: string;
  inventoryDeducted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  items: { product: string; quantity: number }[];
  customer: OrderCustomer;
  paymentMethod: PaymentMethod;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  order: Order;
}

export interface OrdersResponse {
  success: boolean;
  count: number;
  orders: Order[];
}

export interface SingleOrderResponse {
  success: boolean;
  order: Order;
}

export interface WhatsAppOrderResponse {
  success: boolean;
  orderNumber: string;
  message: string;
  whatsappUrl: string;
}

export interface PayHereInitiateResponse {
  success: boolean;
  message: string;
  order: {
    _id: string;
    orderNumber: string;
    total: number;
    paymentStatus: string;
    orderStatus: string;
  };
  payment: {
    sandbox: boolean;
    checkout_url: string;
    merchant_id: string;
    return_url: string;
    cancel_url: string;
    notify_url: string;
    order_id: string;
    items: string;
    currency: string;
    amount: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    hash: string;
  };
}

export interface PaymentStatusResponse {
  success: boolean;
  orderId: string;
  orderNumber: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  total: number;
  currency?: string;
}
