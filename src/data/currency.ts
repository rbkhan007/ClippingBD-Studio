// Currency Configuration
// This file contains all supported currencies with exchange rates

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  exchangeRate: number; // Base currency is USD
  decimalPlaces: number;
}

export const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', exchangeRate: 1, decimalPlaces: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', exchangeRate: 0.92, decimalPlaces: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', exchangeRate: 0.79, decimalPlaces: 2 },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', flag: '🇧🇩', exchangeRate: 110.5, decimalPlaces: 2 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', exchangeRate: 83.12, decimalPlaces: 2 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', exchangeRate: 1.53, decimalPlaces: 2 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', exchangeRate: 1.36, decimalPlaces: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', exchangeRate: 149.5, decimalPlaces: 0 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪', exchangeRate: 3.67, decimalPlaces: 2 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', exchangeRate: 1.34, decimalPlaces: 2 },
];

export const defaultCurrency = currencies[0]; // USD

// Format price with currency
export function formatPrice(
  priceInUSD: number,
  currency: Currency = defaultCurrency,
  options?: { showCode?: boolean; compact?: boolean }
): string {
  const convertedPrice = priceInUSD * currency.exchangeRate;
  
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  }).format(convertedPrice);
  
  if (options?.showCode) {
    return `${currency.symbol}${formatted} ${currency.code}`;
  }
  
  return `${currency.symbol}${formatted}`;
}

// Convert price from one currency to another
export function convertPrice(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  // Convert to USD first, then to target currency
  const inUSD = amount / fromCurrency.exchangeRate;
  return inUSD * toCurrency.exchangeRate;
}

// Get currency by code
export function getCurrencyByCode(code: string): Currency | undefined {
  return currencies.find(c => c.code === code);
}

// Popular currencies for quick selection
export const popularCurrencies = ['USD', 'EUR', 'GBP', 'BDT', 'INR'];
