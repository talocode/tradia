import {
  getMarketDataProvider,
  validateSymbolParam,
  validateCandlesParams,
  mockMarketDataProvider,
  createFinnhubProvider,
} from '@/lib/market-data';
import { resetRateLimitStore } from '@/lib/market-data/rate-limit';

describe('market data provider selection', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('selects mock provider when MARKET_DATA_PROVIDER=mock', () => {
    process.env.MARKET_DATA_PROVIDER = 'mock';
    delete process.env.FINNHUB_API_KEY;

    const { provider, meta } = getMarketDataProvider();
    expect(provider.name).toBe('mock');
    expect(meta.degraded).toBe(false);
  });

  it('falls back to mock when Finnhub is configured without API key', () => {
    process.env.MARKET_DATA_PROVIDER = 'finnhub';
    delete process.env.FINNHUB_API_KEY;

    const { provider, meta } = getMarketDataProvider();
    expect(provider.name).toBe('mock');
    expect(meta.degraded).toBe(true);
    expect(meta.message).toMatch(/FINNHUB_API_KEY/);
  });

  it('selects finnhub provider when API key is present', () => {
    process.env.MARKET_DATA_PROVIDER = 'finnhub';
    process.env.FINNHUB_API_KEY = 'test-key';

    const { provider, meta } = getMarketDataProvider();
    expect(provider.name).toBe('finnhub');
    expect(meta.degraded).toBe(false);
  });
});

describe('symbol validation', () => {
  it('accepts MVP allowlisted symbols', () => {
    const result = validateSymbolParam('OANDA:EUR_USD');
    expect(result.valid).toBe(true);
    expect(result.symbol).toBe('OANDA:EUR_USD');
  });

  it('rejects unsupported symbols', () => {
    const result = validateSymbolParam('FAKE:PAIR');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/not supported/i);
  });

  it('requires symbol parameter', () => {
    const result = validateSymbolParam(null);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/required/i);
  });
});

describe('candles validation', () => {
  const now = Math.floor(Date.now() / 1000);

  it('validates resolution and time range', () => {
    const result = validateCandlesParams(
      'AAPL',
      '5',
      String(now - 3600),
      String(now)
    );
    expect(result.valid).toBe(true);
    expect(result.resolution).toBe('5');
  });

  it('rejects invalid resolution', () => {
    const result = validateCandlesParams('AAPL', '2h', String(now - 3600), String(now));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Resolution/);
  });

  it('rejects ranges over 90 days', () => {
    const result = validateCandlesParams(
      'AAPL',
      'D',
      String(now - 60 * 60 * 24 * 120),
      String(now)
    );
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/90-day/);
  });
});

describe('mock provider responses', () => {
  it('returns quote and candles', async () => {
    const quote = await mockMarketDataProvider.getQuote('AAPL');
    expect(quote.symbol).toBe('AAPL');
    expect(quote.price).toBeGreaterThan(0);

    const now = Math.floor(Date.now() / 1000);
    const candles = await mockMarketDataProvider.getCandles('AAPL', '5', now - 3600, now);
    expect(candles.length).toBeGreaterThan(0);
    expect(candles[0]).toHaveProperty('open');
  });
});

describe('finnhub provider (mocked fetch)', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('maps quote response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        c: 200,
        d: 1.2,
        dp: 0.6,
        h: 201,
        l: 198,
        o: 199,
        pc: 198.8,
        t: 1710000000,
      }),
    });

    const provider = createFinnhubProvider('test-key');
    const quote = await provider.getQuote('AAPL');
    expect(quote.price).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('token=test-key'),
      expect.any(Object)
    );
  });
});

describe('rate limiting', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it('blocks after max requests', async () => {
    const { checkRateLimit } = await import('@/lib/market-data/rate-limit');
    let blocked = false;
    for (let i = 0; i < 65; i += 1) {
      const result = checkRateLimit('test-user', 60, 60_000);
      if (!result.allowed) {
        blocked = true;
        break;
      }
    }
    expect(blocked).toBe(true);
  });
});