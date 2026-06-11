const TICKER_PATTERN = /^[A-Z][A-Z0-9.\-]{0,9}$/;

export interface SymbolValidationResult {
  valid: boolean;
  symbol?: string;
  error?: string;
}

export function validateTickerSymbol(
  symbol: string | null | undefined
): SymbolValidationResult {
  if (!symbol || !symbol.trim()) {
    return { valid: false, error: 'Symbol is required' };
  }

  const normalized = symbol.trim().toUpperCase();
  if (!TICKER_PATTERN.test(normalized)) {
    return {
      valid: false,
      error: `Symbol "${symbol}" is not a valid ticker (use 1-10 uppercase letters, e.g. NVDA)`,
    };
  }

  return { valid: true, symbol: normalized };
}