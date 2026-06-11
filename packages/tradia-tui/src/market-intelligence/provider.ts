import { MOCK_MODE_MESSAGE } from '../lib/disclaimer.js';
import type {
  IntelligenceProviderMeta,
  IntelligenceProviderName,
  MarketIntelligenceProvider,
  ProviderStatus,
} from './types.js';
import { mockMarketIntelligenceProvider } from './providers/mock.js';
import { createUnusualWhalesProvider } from './providers/unusual-whales.js';

export interface ResolvedIntelligenceProvider {
  provider: MarketIntelligenceProvider;
  meta: IntelligenceProviderMeta;
}

function normalizeProviderName(
  value: string | undefined
): IntelligenceProviderName {
  const normalized = (value ?? 'mock').trim().toLowerCase();
  if (normalized === 'unusual_whales' || normalized === 'unusual-whales') {
    return 'unusual_whales';
  }
  return 'mock';
}

function hasApiKey(): boolean {
  return Boolean(process.env.UNUSUAL_WHALES_API_KEY?.trim());
}

export function getMarketIntelligenceProvider(): ResolvedIntelligenceProvider {
  const configured = normalizeProviderName(process.env.MARKET_INTELLIGENCE_PROVIDER);
  const apiKeyConfigured = hasApiKey();

  if (configured === 'mock') {
    return {
      provider: mockMarketIntelligenceProvider,
      meta: {
        configured,
        active: 'mock',
        apiKeyConfigured,
        degraded: false,
        message: apiKeyConfigured ? undefined : MOCK_MODE_MESSAGE,
      },
    };
  }

  if (!apiKeyConfigured) {
    return {
      provider: mockMarketIntelligenceProvider,
      meta: {
        configured,
        active: 'mock',
        apiKeyConfigured: false,
        degraded: true,
        message: MOCK_MODE_MESSAGE,
      },
    };
  }

  return {
    provider: createUnusualWhalesProvider({
      apiKey: process.env.UNUSUAL_WHALES_API_KEY!.trim(),
    }),
    meta: {
      configured,
      active: 'unusual_whales',
      apiKeyConfigured: true,
      degraded: false,
    },
  };
}

export function getProviderStatus(): ProviderStatus {
  const { meta } = getMarketIntelligenceProvider();
  return {
    provider: meta.active,
    apiKeyConfigured: meta.apiKeyConfigured,
    degraded: meta.degraded,
    message: meta.message,
  };
}