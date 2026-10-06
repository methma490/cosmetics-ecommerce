import { formatPrice } from "./formatPrice";

export interface CartItemWhatsApp {
  name: string;
  quantity: number;
  price: number;
}

export const generateClientWhatsAppMessage = (
  items: CartItemWhatsApp[],
  subtotal: number,
  shippingFee: number,
  total: number
): string => {
  const itemLines = items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.name}\n   Qty: ${item.quantity} | ${formatPrice(item.price)}`
    )
    .join("\n\n");

  return [
    "*NEW COSMETICS INQUIRY / ORDER*",
    "",
    "*ITEMS*",
    itemLines,
    "",
    `Subtotal: ${formatPrice(subtotal)}`,
    `Shipping: ${formatPrice(shippingFee)}`,
    `Total: ${formatPrice(total)}`,
    "",
    "Hello! I would like to place this order via WhatsApp. Please advise.",
  ].join("\n");
};
