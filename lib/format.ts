const LOCALE = 'en-US';

/**
 * Formats money with an explicit locale so that server and client markup match.
 * Values are plain decimal amounts (not cents) because the mock data is static.
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
