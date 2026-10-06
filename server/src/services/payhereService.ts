import crypto from "crypto";

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
};

const md5 = (value: string): string => {
  return crypto
    .createHash("md5")
    .update(value)
    .digest("hex")
    .toUpperCase();
};

export const formatPayHereAmount = (
  amount: number
): string => {
  return Number(amount).toFixed(2);
};

export const generatePayHereHash = (
  orderId: string,
  amount: number,
  currency = "LKR"
): string => {
  const merchantId = getRequiredEnv(
    "PAYHERE_MERCHANT_ID"
  );

  const merchantSecret = getRequiredEnv(
    "PAYHERE_MERCHANT_SECRET"
  );

  const formattedAmount =
    formatPayHereAmount(amount);

  const hashedSecret = md5(merchantSecret);

  return md5(
    merchantId +
      orderId +
      formattedAmount +
      currency +
      hashedSecret
  );
};

export const verifyPayHereNotification = ({
  merchantId,
  orderId,
  amount,
  currency,
  statusCode,
  md5sig,
}: {
  merchantId: string;
  orderId: string;
  amount: string;
  currency: string;
  statusCode: string;
  md5sig: string;
}): boolean => {
  const configuredMerchantId =
    getRequiredEnv("PAYHERE_MERCHANT_ID");

  const merchantSecret =
    getRequiredEnv("PAYHERE_MERCHANT_SECRET");

  if (merchantId !== configuredMerchantId) {
    return false;
  }

  const hashedSecret = md5(merchantSecret);

  const localSignature = md5(
    merchantId +
      orderId +
      amount +
      currency +
      statusCode +
      hashedSecret
  );

  return (
    localSignature === md5sig.toUpperCase()
  );
};

export const getPayHereConfig = () => {
  return {
    merchantId: getRequiredEnv(
      "PAYHERE_MERCHANT_ID"
    ),

    currency:
      process.env.PAYHERE_CURRENCY || "LKR",

    sandboxUrl:
      process.env.PAYHERE_SANDBOX_URL ||
      "https://sandbox.payhere.lk/pay/checkout",

    returnUrl:
      process.env.PAYHERE_RETURN_URL ||
      "http://localhost:5173/payment/success",

    cancelUrl:
      process.env.PAYHERE_CANCEL_URL ||
      "http://localhost:5173/payment/cancel",

    notifyUrl:
      process.env.PAYHERE_NOTIFY_URL ||
      "http://localhost:5000/api/payments/payhere/notify",
  };
};