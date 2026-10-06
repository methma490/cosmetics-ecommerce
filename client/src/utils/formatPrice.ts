export const formatPrice = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null) return 'Rs. 0.00';
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return 'Rs. 0.00';
  return `Rs. ${numeric.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default formatPrice;
