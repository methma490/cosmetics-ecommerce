import type { IOrder } from "../models/order.js";

/*
|--------------------------------------------------------------------------
| Format currency
|--------------------------------------------------------------------------
*/

const formatCurrency = (amount: number): string => {
  return `Rs. ${amount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/*
|--------------------------------------------------------------------------
| Generate WhatsApp order message
|--------------------------------------------------------------------------
*/

export const generateWhatsAppOrderMessage = (
  order: IOrder
): string => {
  const itemLines = order.items
    .map((item, index) => {
      return [
        `${index + 1}. ${item.name}`,
        `   Qty: ${item.quantity}`,
        `   Price: ${formatCurrency(item.price)}`,
        `   Subtotal: ${formatCurrency(item.subtotal)}`,
      ].join("\n");
    })
    .join("\n\n");

  const customer = order.customer;

  return [
    "*NEW COSMETICS ORDER*",
    "",
    `Order Number: ${order.orderNumber}`,
    "",
    "*CUSTOMER DETAILS*",
    `Name: ${customer.firstName} ${customer.lastName}`,
    `Email: ${customer.email}`,
    `Phone: ${customer.phone}`,
    "",
    "*DELIVERY ADDRESS*",
    customer.address,
    customer.apartment
      ? customer.apartment
      : "",
    `${customer.city}${
      customer.postalCode
        ? ` - ${customer.postalCode}`
        : ""
    }`,
    customer.country,
    "",
    "*ORDER ITEMS*",
    "",
    itemLines,
    "",
    "*ORDER SUMMARY*",
    `Subtotal: ${formatCurrency(order.subtotal)}`,
    `Shipping: ${formatCurrency(order.shippingFee)}`,
    `Total: ${formatCurrency(order.total)}`,
    "",
    `Payment Method: WhatsApp Order`,
    `Order Status: ${order.orderStatus}`,
    "",
    "Please confirm my order. Thank you.",
  ]
    .filter((line) => line !== "")
    .join("\n");
};

/*
|--------------------------------------------------------------------------
| Generate WhatsApp URL
|--------------------------------------------------------------------------
*/

export const generateWhatsAppOrderUrl = (
  order: IOrder
): string => {
  const businessNumber =
    process.env.WHATSAPP_BUSINESS_NUMBER;

  if (!businessNumber) {
    throw new Error(
      "WHATSAPP_BUSINESS_NUMBER is not configured"
    );
  }

  const cleanNumber =
    businessNumber.replace(/\D/g, "");

  if (!cleanNumber) {
    throw new Error(
      "Invalid WhatsApp business number"
    );
  }

  const message =
    generateWhatsAppOrderMessage(order);

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    message
  )}`;
};