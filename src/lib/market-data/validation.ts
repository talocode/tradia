import type { MarketResolution } from './types';
import { getMarketSymbol, isAllowedMarketSymbol } from './symbols';

const VALID_RESOLUTIONS: MarketResolution[] = ['1', '5', '15', '30', '60', 'D', 'W', 'M'];

export interface SymbolValidationResult {
  valid: boolean;
  symbol?: string;
  error?: string;
}

export interface CandlesValidationResult {
  valid: boolean;
  symbol?: string;
  resolution?: MarketResolution;
  from?: number;
  to?: number;
  error?: string;
}

export function validateSymbolParam(symbol: string | null): SymbolValidationResult {
  if (!symbol || !symbol.trim()) {
    return { valid: false, error: 'Symbol is required' };
  }

  const normalized = symbol.trim().toUpperCase();
  if (!isAllowedMarketSymbol(normalized)) {
    return {
      valid: false,
      error: `Symbol "${symbol}" is not supported in the MVP allowlist`,
    };
  }

  return { valid: true, symbol: getMarketSymbol(normalized)!.symbol };
}

export function validateCandlesParams(
  symbol: string | null,
  resolution: string | null,
  from: string | null,
  to: string | null
): CandlesValidationResult {
  const symbolResult = validateSymbolParam(symbol);
  if (!symbolResult.valid) {
    return symbolResult;
  }

  if (!resolution || !VALID_RESOLUTIONS.includes(resolution as MarketResolution)) {
    return {
      valid: false,
      error: `Resolution must be one of: ${VALID_RESOLUTIONS.join(', ')}`,
    };
  }

  const fromTs = from ? Number(from) : NaN;
  const toTs = to ? Number(to) : NaN;

  if (!Number.isFinite(fromTs) || !Number.isFinite(toTs)) {
    return { valid: false, error: 'from and to must be valid Unix timestamps' };
  }

  if (fromTs >= toTs) {
    return { valid: false, error: 'from must be earlier than to' };
  }

  const maxRangeSeconds = 60 * 60 * 24 * 90;
  if (toTs - fromTs > maxRangeSeconds) {
    return { valid: false, error: 'Requested range exceeds 90-day MVP limit' };
  }

  return {
    valid: true,
    symbol: symbolResult.symbol,
    resolution: resolution as MarketResolution,
    from: fromTs,
    to: toTs,
  };
}