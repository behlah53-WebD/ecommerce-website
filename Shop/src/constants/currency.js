export const CURRENCY_SYMBOL = '₹';

export const formatPrice = (price, currencySymbol = CURRENCY_SYMBOL) => {
  const numericPrice = Number(price) || 0;
  const formatted = numericPrice.toFixed(2);
  return `${currencySymbol}${formatted}`;
};

export const formatPriceRange = (min, max, currencySymbol = CURRENCY_SYMBOL) => {
  return `${currencySymbol}${Number(min || 0).toFixed(2)} - ${currencySymbol}${Number(max || 0).toFixed(2)}`;
};

export const SHOCKING_DEAL_PRICE_MULTIPLIER = 1.2;
export const FALLBACK_ORIGINAL_PRICE = 99;
