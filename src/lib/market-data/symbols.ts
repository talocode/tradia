import type { MarketSymbol } from './types';

/** MVP allowlist — server validates all incoming symbol requests against this list. */
export const MVP_MARKET_SYMBOLS: MarketSymbol[] = [
  {
    symbol: 'OANDA:EUR_USD',
    displayName: 'EUR/USD',
    assetClass: 'forex',
    providerSymbol: 'OANDA:EUR_USD',
  },
  {
    symbol: 'OANDA:GBP_USD',
    displayName: 'GBP/USD',
    assetClass: 'forex',
    providerSymbol: 'OANDA:GBP_USD',
  },
  {
    symbol: 'OANDA:USD_JPY',
    displayName: 'USD/JPY',
    assetClass: 'forex',
    providerSymbol: 'OANDA:USD_JPY',
  },
  {
    symbol: 'BINANCE:BTCUSDT',
    displayName: 'BTC/USDT',
    assetClass: 'crypto',
    providerSymbol: 'BINANCE:BTCUSDT',
  },
  {
    symbol: 'AAPL',
    displayName: 'Apple Inc.',
    assetClass: 'stock',
    providerSymbol: 'AAPL',
  },
];

const SYMBOL_LOOKUP = new Map(
  MVP_MARKET_SYMBOLS.map((entry) => [entry.symbol.toUpperCase(), entry])
);

/** Normalize trade journal symbols (e.g. EURUSD) to Finnhub format when possible. */
const TRADE_SYMBOL_ALIASES: Record<string, string> = {
  EURUSD: 'OANDA:EUR_USD',
  'EUR/USD': 'OANDA:EUR_USD',
  GBPUSD: 'OANDA:GBP_USD',
  'GBP/USD': 'OANDA:GBP_USD',
  USDJPY: 'OANDA:USD_JPY',
  'USD/JPY': 'OANDA:USD_JPY',
  BTCUSDT: 'BINANCE:BTCUSDT',
  'BTC/USDT': 'BINANCE:BTCUSDT',
  BTCUSD: 'BINANCE:BTCUSDT',
};

export function isAllowedMarketSymbol(symbol: string): boolean {
  return SYMBOL_LOOKUP.has(symbol.trim().toUpperCase());
}

export function getMarketSymbol(symbol: string): MarketSymbol | undefined {
  const normalized = symbol.trim().toUpperCase();
  return SYMBOL_LOOKUP.get(normalized);
}

export function resolveMarketSymbol(symbol: string): string {
  const trimmed = symbol.trim();
  const upper = trimmed.toUpperCase();
  if (SYMBOL_LOOKUP.has(upper)) {
    return SYMBOL_LOOKUP.get(upper)!.symbol;
  }
  return TRADE_SYMBOL_ALIASES[trimmed] ?? TRADE_SYMBOL_ALIASES[upper] ?? trimmed;
}

export function tradeSymbolMatchesMarket(tradeSymbol: string, marketSymbol: string): boolean {
  return resolveMarketSymbol(tradeSymbol) === resolveMarketSymbol(marketSymbol);
}

export function getAssetClass(symbol: string): MarketSymbol['assetClass'] | null {
  const entry = getMarketSymbol(resolveMarketSymbol(symbol));
  return entry?.assetClass ?? null;
}