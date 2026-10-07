import { formatPrice } from "./formatPrice";

export interface CartItemWhatsApp {
  name?: string;
  price?: number;
  quantity: number;
  product?: {
    name: string;
    price: number;
  };
}

export const generateClientWhatsAppMessage = (
  items: CartItemWhatsApp[],
  subtotal: number,
  shippingFee: number,
  total: number
): string => {
  const itemLines = items
    .map((item, idx) => {
      const name = item.product?.name || item.name || "Formulation";
      const price = item.product?.price ?? item.price ?? 0;
      return `${idx + 1}. ${name}\n   Qty: ${item.quantity} | ${formatPrice(price)}`;
    })
    .join("\n\n");

  return [
    "*NEW COSMETICS INQUIRY / ORDER*",
    "",
    "*ITEMS*",
    itemLines,
    "",
    `Subtotal: ${formatPrice(subtotal)}`,
    `Shipping: ${shippingFee === 0 ? "Complimentary (FREE)" : formatPrice(shippingFee)}`,
    `Total: ${formatPrice(total)}`,
    "",
    "Hello! I would like to place this order via WhatsApp. Please advise.",
  ].join("\n");
};

export const generateWhatsAppMessage = generateClientWhatsAppMessage;
