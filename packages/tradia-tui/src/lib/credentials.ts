import { loadConfig } from './config.js';
import type { IntelligenceProviderName } from '../market-intelligence/types.js';

export type KeySource = 'environment' | 'local' | 'none';

export interface ResolvedCredentials {
  provider: IntelligenceProviderName;
  configuredProvider: IntelligenceProviderName;
  apiKey: string | undefined;
  keySource: KeySource;
  configPath: string;
  mockMode: boolean;
}

let cachedConfig: Awaited<ReturnType<typeof loadConfig>> | undefined;
let configLoaded = false;

export function resetCredentialsCache(): void {
  cachedConfig = undefined;
  configLoaded = false;
}

async function getLocalConfig() {
  if (!configLoaded) {
    cachedConfig = await loadConfig();
    configLoaded = true;
  }
  return cachedConfig;
}

function normalizeProvider(value: string | undefined): IntelligenceProviderName {
  const normalized = (value ?? 'mock').trim().toLowerCase();
  if (normalized === 'unusual_whales' || normalized === 'unusual-whales') {
    return 'unusual_whales';
  }
  return 'mock';
}

export async function resolveCredentials(): Promise<ResolvedCredentials> {
  const { getConfigPath } = await import('./config.js');
  const local = await getLocalConfig();

  const envKey = process.env.UNUSUAL_WHALES_API_KEY?.trim() || undefined;
  const localKey = local?.unusualWhalesApiKey?.trim() || undefined;

  let apiKey: string | undefined;
  let keySource: KeySource = 'none';

  if (envKey) {
    apiKey = envKey;
    keySource = 'environment';
  } else if (localKey) {
    apiKey = localKey;
    keySource = 'local';
  }

  const configuredProvider = process.env.MARKET_INTELLIGENCE_PROVIDER
    ? normalizeProvider(process.env.MARKET_INTELLIGENCE_PROVIDER)
    : local?.provider
      ? normalizeProvider(local.provider)
      : 'mock';

  const wantsLive = configuredProvider === 'unusual_whales';
  const activeProvider: IntelligenceProviderName =
    wantsLive && apiKey ? 'unusual_whales' : 'mock';

  return {
    provider: activeProvider,
    configuredProvider,
    apiKey,
    keySource,
    configPath: getConfigPath(),
    mockMode: activeProvider === 'mock',
  };
}

export async function hasAnyApiKey(): Promise<boolean> {
  const creds = await resolveCredentials();
  return Boolean(creds.apiKey);
}

export async function isFirstRun(): Promise<boolean> {
  const { configFileExists } = await import('./config.js');
  const hasEnvKey = Boolean(process.env.UNUSUAL_WHALES_API_KEY?.trim());
  if (hasEnvKey) {
    return false;
  }
  return !(await configFileExists());
}