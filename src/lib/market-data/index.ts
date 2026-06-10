import type { MarketDataMeta, MarketDataProvider, MarketProviderName } from './types';
import { createFinnhubProvider } from './providers/finnhub';
import { mockMarketDataProvider } from './providers/mock';

export * from './types';
export * from './symbols';
export * from './validation';
export * from './rate-limit';
export { mockMarketDataProvider } from './providers/mock';
export { createFinnhubProvider } from './providers/finnhub';

export interface ResolvedMarketProvider {
  provider: MarketDataProvider;
  meta: MarketDataMeta;
}

function normalizeProviderName(value: string | undefined): MarketProviderName {
  const normalized = (value ?? 'finnhub').trim().toLowerCase();
  if (normalized === 'mock') return 'mock';
  return 'finnhub';
}

/**
 * Resolves the active market data provider from environment configuration.
 * Falls back to mock when Finnhub is selected but FINNHUB_API_KEY is missing.
 */
export function getMarketDataProvider(): ResolvedMarketProvider {
  const configured = normalizeProviderName(process.env.MARKET_DATA_PROVIDER);
  const apiKey = process.env.FINNHUB_API_KEY?.trim();

  if (configured === 'mock') {
    return {
      provider: mockMarketDataProvider,
      meta: { provider: 'mock', degraded: false },
    };
  }

  if (!apiKey) {
    return {
      provider: mockMarketDataProvider,
      meta: {
        provider: 'mock',
        degraded: true,
        message:
          'FINNHUB_API_KEY is not configured. Serving MVP mock data until a provider key is set.',
      },
    };
  }

  return {
    provider: createFinnhubProvider(apiKey),
    meta: { provider: 'finnhub', degraded: false },
  };
}