import { MOCK_MODE_MESSAGE } from '../lib/disclaimer.js';
import { resolveCredentials } from '../lib/credentials.js';
import { MISSING_KEY_MESSAGE, SetupRequiredError } from '../lib/setup-messages.js';
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

export async function getMarketIntelligenceProvider(): Promise<ResolvedIntelligenceProvider> {
  const creds = await resolveCredentials();

  if (creds.configuredProvider === 'unusual_whales' && !creds.apiKey) {
    throw new SetupRequiredError(MISSING_KEY_MESSAGE);
  }

  if (creds.provider === 'mock') {
    return {
      provider: mockMarketIntelligenceProvider,
      meta: {
        configured: creds.configuredProvider,
        active: 'mock',
        apiKeyConfigured: Boolean(creds.apiKey),
        degraded: creds.configuredProvider === 'unusual_whales' && !creds.apiKey,
        message: creds.apiKey ? undefined : MOCK_MODE_MESSAGE,
        keySource: creds.keySource,
        configPath: creds.configPath,
        mockMode: true,
      },
    };
  }

  return {
    provider: createUnusualWhalesProvider({
      apiKey: creds.apiKey!,
    }),
    meta: {
      configured: creds.configuredProvider,
      active: 'unusual_whales',
      apiKeyConfigured: true,
      degraded: false,
      keySource: creds.keySource,
      configPath: creds.configPath,
      mockMode: false,
    },
  };
}

export async function getProviderStatus(): Promise<ProviderStatus> {
  const creds = await resolveCredentials();

  if (creds.configuredProvider === 'unusual_whales' && !creds.apiKey) {
    return {
      provider: 'mock',
      configuredProvider: creds.configuredProvider,
      apiKeyConfigured: false,
      degraded: true,
      message: MISSING_KEY_MESSAGE,
      keySource: creds.keySource,
      configPath: creds.configPath,
      mockMode: true,
    };
  }

  return {
    provider: creds.provider,
    configuredProvider: creds.configuredProvider,
    apiKeyConfigured: Boolean(creds.apiKey),
    degraded: creds.configuredProvider === 'unusual_whales' && !creds.apiKey,
    message: creds.mockMode ? MOCK_MODE_MESSAGE : undefined,
    keySource: creds.keySource,
    configPath: creds.configPath,
    mockMode: creds.mockMode,
  };
}

export function normalizeProviderName(
  value: string | undefined
): IntelligenceProviderName {
  const normalized = (value ?? 'mock').trim().toLowerCase();
  if (normalized === 'unusual_whales' || normalized === 'unusual-whales') {
    return 'unusual_whales';
  }
  return 'mock';
}