import { mkdtemp, readFile, rm, stat } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  clearApiKey,
  configFileExists,
  getConfigPath,
  loadConfig,
  saveConfig,
  setApiKey,
  setConfigPathForTests,
  setProvider,
} from '../src/lib/config.js';
import {
  isFirstRun,
  resetCredentialsCache,
  resolveCredentials,
} from '../src/lib/credentials.js';
import { containsFullApiKey, maskApiKey } from '../src/lib/key-mask.js';
import { getMarketIntelligenceProvider } from '../src/market-intelligence/provider.js';
import { SetupRequiredError } from '../src/lib/setup-messages.js';
import { runClearKey, runDoctor } from '../src/commands/setup.js';

describe('BYOK config', () => {
  const originalEnv = process.env;
  let tempDir = '';

  beforeEach(async () => {
    process.env = { ...originalEnv };
    delete process.env.UNUSUAL_WHALES_API_KEY;
    delete process.env.MARKET_INTELLIGENCE_PROVIDER;
    resetCredentialsCache();
    tempDir = await mkdtemp(join(tmpdir(), 'tradia-config-test-'));
    setConfigPathForTests(join(tempDir, 'config.json'));
  });

  afterEach(async () => {
    process.env = originalEnv;
    setConfigPathForTests(undefined);
    resetCredentialsCache();
    await rm(tempDir, { recursive: true, force: true });
  });

  it('uses mock mode when no config exists', async () => {
    const creds = await resolveCredentials();
    expect(creds.mockMode).toBe(true);
    expect(creds.apiKey).toBeUndefined();
    expect(await isFirstRun()).toBe(true);
  });

  it('detects env var key over local config', async () => {
    await saveConfig({
      provider: 'mock',
      unusualWhalesApiKey: 'local-secret-key-abcdef12',
    });
    process.env.UNUSUAL_WHALES_API_KEY = 'env-secret-key-abcdef12';
    process.env.MARKET_INTELLIGENCE_PROVIDER = 'unusual_whales';
    resetCredentialsCache();

    const creds = await resolveCredentials();
    expect(creds.keySource).toBe('environment');
    expect(creds.apiKey).toBe('env-secret-key-abcdef12');
    expect(creds.provider).toBe('unusual_whales');
  });

  it('detects local config key', async () => {
    await setApiKey('uw_local_secret_key_12345678');
    await setProvider('unusual_whales');
    resetCredentialsCache();

    const creds = await resolveCredentials();
    expect(creds.keySource).toBe('local');
    expect(creds.provider).toBe('unusual_whales');
    expect(creds.mockMode).toBe(false);
  });

  it('masks keys without revealing full value', () => {
    const masked = maskApiKey('uw_super_secret_key_abcd');
    expect(masked).toBe('uw_****abcd');
    expect(masked).not.toContain('super_secret_key');
  });

  it('throws clean error when unusual_whales has no key', async () => {
    await setProvider('unusual_whales');
    resetCredentialsCache();

    await expect(getMarketIntelligenceProvider()).rejects.toBeInstanceOf(SetupRequiredError);
  });

  it('clear-key removes stored key', async () => {
    await setApiKey('uw_clear_me_key_12345678');
    resetCredentialsCache();
    expect((await loadConfig())?.unusualWhalesApiKey).toBeTruthy();

    await runClearKey();
    resetCredentialsCache();
    const config = await loadConfig();
    expect(config?.unusualWhalesApiKey).toBeUndefined();
  });

  it('doctor output never prints full secret', async () => {
    const secret = 'uw_doctor_secret_key_9999';
    process.env.UNUSUAL_WHALES_API_KEY = secret;
    process.env.MARKET_INTELLIGENCE_PROVIDER = 'unusual_whales';
    resetCredentialsCache();

    const output = await runDoctor();
    expect(containsFullApiKey(output, secret)).toBe(false);
    expect(output).toContain('uw_****9999');
  });

  it('creates config file with safe permissions when possible', async () => {
    await saveConfig({ provider: 'mock' });
    expect(await configFileExists()).toBe(true);
    const fileStat = await stat(getConfigPath());
    const mode = fileStat.mode & 0o777;
    expect(mode).toBe(0o600);

    const raw = await readFile(getConfigPath(), 'utf8');
    const parsed = JSON.parse(raw) as { provider: string };
    expect(parsed.provider).toBe('mock');
  });
});