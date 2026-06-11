import { mkdir, readFile, writeFile, chmod, stat } from 'fs/promises';
import { homedir } from 'os';
import { dirname, join } from 'path';
import type { IntelligenceProviderName } from '../market-intelligence/types.js';

export interface TradiaConfig {
  provider: IntelligenceProviderName;
  unusualWhalesApiKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TradiaConfigPublic {
  provider: IntelligenceProviderName;
  hasUnusualWhalesKey: boolean;
  createdAt: string;
  updatedAt: string;
}

const CONFIG_DIR_NAME = '.tradia';
const CONFIG_FILE_NAME = 'config.json';

let configPathOverride: string | undefined;

export function getConfigDir(): string {
  if (process.env.TRADIA_CONFIG_DIR?.trim()) {
    return process.env.TRADIA_CONFIG_DIR.trim();
  }
  return join(homedir(), CONFIG_DIR_NAME);
}

export function getConfigPath(): string {
  if (configPathOverride) {
    return configPathOverride;
  }
  if (process.env.TRADIA_CONFIG_PATH?.trim()) {
    return process.env.TRADIA_CONFIG_PATH.trim();
  }
  return join(getConfigDir(), CONFIG_FILE_NAME);
}

export function setConfigPathForTests(path: string | undefined): void {
  configPathOverride = path;
}

export function toPublicConfig(config: TradiaConfig): TradiaConfigPublic {
  return {
    provider: config.provider,
    hasUnusualWhalesKey: Boolean(config.unusualWhalesApiKey?.trim()),
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
  };
}

export async function configFileExists(): Promise<boolean> {
  try {
    await stat(getConfigPath());
    return true;
  } catch {
    return false;
  }
}

export async function loadConfig(): Promise<TradiaConfig | null> {
  try {
    const raw = await readFile(getConfigPath(), 'utf8');
    const parsed = JSON.parse(raw) as Partial<TradiaConfig>;
    if (!parsed.provider || !parsed.createdAt || !parsed.updatedAt) {
      return null;
    }
    return {
      provider: normalizeProvider(parsed.provider),
      unusualWhalesApiKey: parsed.unusualWhalesApiKey?.trim() || undefined,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export async function saveConfig(
  input: Partial<TradiaConfig> & { provider: IntelligenceProviderName }
): Promise<TradiaConfig> {
  const existing = await loadConfig();
  const now = new Date().toISOString();
  const next: TradiaConfig = {
    provider: input.provider,
    unusualWhalesApiKey:
      input.unusualWhalesApiKey !== undefined
        ? input.unusualWhalesApiKey.trim() || undefined
        : existing?.unusualWhalesApiKey,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const configPath = getConfigPath();
  const configDir = dirname(configPath);
  await mkdir(configDir, { recursive: true, mode: 0o700 });
  try {
    await chmod(configDir, 0o700);
  } catch {
    // Best effort on platforms that restrict chmod.
  }

  await writeFile(configPath, `${JSON.stringify(next, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });

  try {
    await chmod(configPath, 0o600);
  } catch {
    // Best effort on platforms that restrict chmod.
  }

  return next;
}

export async function clearApiKey(): Promise<TradiaConfig | null> {
  const existing = await loadConfig();
  if (!existing) {
    return null;
  }
  return saveConfig({
    provider: existing.provider,
    unusualWhalesApiKey: '',
  });
}

export async function setProvider(
  provider: IntelligenceProviderName
): Promise<TradiaConfig> {
  const existing = await loadConfig();
  return saveConfig({
    provider,
    unusualWhalesApiKey: existing?.unusualWhalesApiKey,
  });
}

export async function setApiKey(apiKey: string): Promise<TradiaConfig> {
  const existing = await loadConfig();
  return saveConfig({
    provider: existing?.provider ?? 'unusual_whales',
    unusualWhalesApiKey: apiKey,
  });
}

function normalizeProvider(value: string): IntelligenceProviderName {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'unusual_whales' || normalized === 'unusual-whales') {
    return 'unusual_whales';
  }
  return 'mock';
}