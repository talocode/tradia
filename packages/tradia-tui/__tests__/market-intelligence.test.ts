import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  createUnusualWhalesProvider,
  getMarketIntelligenceProvider,
  getProviderStatus,
  mockMarketIntelligenceProvider,
  UnusualWhalesConfigError,
  validateTickerSymbol,
} from '../src/market-intelligence/index.js';
import { formatProviderStatus } from '../src/lib/format.js';
import { MOCK_MODE_MESSAGE } from '../src/lib/disclaimer.js';
import { setConfigPathForTests, setProvider, setApiKey } from '../src/lib/config.js';
import { resetCredentialsCache } from '../src/lib/credentials.js';
import { maskApiKey } from '../src/lib/key-mask.js';
import { SetupRequiredError } from '../src/lib/setup-messages.js';

describe('market intelligence provider selection', () => {
  const originalEnv = process.env;
  let tempDir = '';

  beforeEach(async () => {
    process.env = { ...originalEnv };
    delete process.env.UNUSUAL_WHALES_API_KEY;
    delete process.env.MARKET_INTELLIGENCE_PROVIDER;
    resetCredentialsCache();
    tempDir = await mkdtemp(join(tmpdir(), 'tradia-provider-test-'));
    setConfigPathForTests(join(tempDir, 'config.json'));
  });

  afterEach(async () => {
    process.env = originalEnv;
    setConfigPathForTests(undefined);
    resetCredentialsCache();
    await rm(tempDir, { recursive: true, force: true });
  });

  it('selects mock provider when provider=mock', async () => {
    await setProvider('mock');
    resetCredentialsCache();

    const { provider, meta } = await getMarketIntelligenceProvider();
    expect(provider.name).toBe('mock');
    expect(meta.active).toBe('mock');
    expect(meta.degraded).toBe(false);
    expect(meta.message).toBe(MOCK_MODE_MESSAGE);
  });

  it('throws when unusual_whales is configured without API key', async () => {
    await setProvider('unusual_whales');
    resetCredentialsCache();

    await expect(getMarketIntelligenceProvider()).rejects.toBeInstanceOf(SetupRequiredError);
    const status = await getProviderStatus();
    expect(status.degraded).toBe(true);
    expect(status.message).toMatch(/tradia init/i);
  });

  it('selects unusual_whales provider when env API key is present', async () => {
    process.env.MARKET_INTELLIGENCE_PROVIDER = 'unusual_whales';
    process.env.UNUSUAL_WHALES_API_KEY = 'test-key';
    resetCredentialsCache();

    const { provider, meta } = await getMarketIntelligenceProvider();
    expect(provider.name).toBe('unusual_whales');
    expect(meta.degraded).toBe(false);
    expect(meta.apiKeyConfigured).toBe(true);
  });

  it('selects unusual_whales provider when local API key is present', async () => {
    await setApiKey('local-test-key-1234');
    await setProvider('unusual_whales');
    resetCredentialsCache();

    const { provider, meta } = await getMarketIntelligenceProvider();
    expect(provider.name).toBe('unusual_whales');
    expect(meta.keySource).toBe('local');
  });
});

describe('mock provider response shape', () => {
  it('returns a valid morning brief', async () => {
    const brief = await mockMarketIntelligenceProvider.getMorningBrief();
    expect(brief.provider).toBe('mock');
    expect(brief.overview).toMatch(/\[MOCK\]/);
    expect(brief.keyTickers.length).toBeGreaterThan(0);
    expect(brief.unusualActivity.length).toBeGreaterThan(0);
    expect(brief.risksAndEvents.length).toBeGreaterThan(0);
    expect(['bullish', 'bearish', 'neutral', 'mixed']).toContain(brief.sentiment);
  });

  it('returns valid ticker analysis', async () => {
    const analysis = await mockMarketIntelligenceProvider.analyzeTicker({ symbol: 'NVDA' });
    expect(analysis.symbol).toBe('NVDA');
    expect(analysis.provider).toBe('mock');
    expect(analysis.highlights.length).toBeGreaterThan(0);
  });

  it('returns valid flow summary', async () => {
    const flow = await mockMarketIntelligenceProvider.getUnusualFlow({ symbol: 'NVDA' });
    expect(flow.symbol).toBe('NVDA');
    expect(flow.events.length).toBeGreaterThan(0);
    expect(flow.summary).toMatch(/\[MOCK\]/);
  });

  it('returns valid confluence summary', async () => {
    const confluence = await mockMarketIntelligenceProvider.getConfluence({
      symbol: 'NVDA',
      direction: 'bullish',
    });
    expect(confluence.symbol).toBe('NVDA');
    expect(confluence.signals.length).toBeGreaterThan(0);
    expect(confluence.score).toBeGreaterThan(0);
  });
});

describe('missing API key behavior', () => {
  it('throws when creating unusual whales provider without key', () => {
    expect(() => createUnusualWhalesProvider({ apiKey: '' })).toThrow(
      UnusualWhalesConfigError
    );
  });
});

describe('symbol validation', () => {
  it('accepts valid tickers', () => {
    expect(validateTickerSymbol('NVDA').valid).toBe(true);
    expect(validateTickerSymbol('nvda').symbol).toBe('NVDA');
    expect(validateTickerSymbol('BRK.B').valid).toBe(true);
  });

  it('rejects invalid tickers', () => {
    expect(validateTickerSymbol('').valid).toBe(false);
    expect(validateTickerSymbol('NOT A TICKER').valid).toBe(false);
    expect(validateTickerSymbol(null).valid).toBe(false);
  });
});

describe('provider status output', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.MARKET_INTELLIGENCE_PROVIDER = 'unusual_whales';
    process.env.UNUSUAL_WHALES_API_KEY = 'super-secret-key-12345';
    resetCredentialsCache();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('does not expose API key in provider status output', async () => {
    const status = await getProviderStatus();
    const formatted = formatProviderStatus(status, maskApiKey(process.env.UNUSUAL_WHALES_API_KEY));

    expect(formatted).not.toContain('super-secret-key-12345');
    expect(formatted).toContain('API key configured:');
    expect(formatted).toContain('unusual_whales');
  });
});