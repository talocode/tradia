import type {
  CongressTradeSummary,
  ConfluenceSummary,
  DarkPoolSummary,
  FlowSummary,
  InsiderActivitySummary,
  MarketIntelligenceProvider,
  MorningBrief,
  MorningBriefInput,
  TickerAnalysis,
} from '../types.js';

const MOCK_TICKERS = ['NVDA', 'AAPL', 'TSLA', 'SPY', 'AMD', 'MSFT', 'META', 'AMZN'];

function nowIso(): string {
  return new Date().toISOString();
}

function mockFlow(symbol: string): FlowSummary {
  return {
    symbol,
    provider: 'mock',
    netSentiment: 'bullish',
    totalPremium: 4_250_000,
    summary: `[MOCK] Elevated call sweeps in ${symbol} with above-average premium concentration.`,
    events: [
      {
        timestamp: nowIso(),
        description: 'Call sweep at $145 strike, 30 DTE',
        premium: 1_200_000,
        sentiment: 'bullish',
      },
      {
        timestamp: nowIso(),
        description: 'Block trade on weekly calls',
        premium: 850_000,
        sentiment: 'bullish',
      },
    ],
  };
}

function mockDarkPool(symbol: string): DarkPoolSummary {
  return {
    symbol,
    provider: 'mock',
    totalVolume: 2_400_000,
    totalPremium: 312_000_000,
    summary: `[MOCK] Institutional dark pool accumulation detected in ${symbol}.`,
    prints: [
      { timestamp: nowIso(), price: 142.5, size: 450_000, premium: 64_125_000 },
      { timestamp: nowIso(), price: 141.8, size: 280_000, premium: 39_704_000 },
    ],
  };
}

function mockCongress(symbol: string): CongressTradeSummary {
  return {
    symbol,
    provider: 'mock',
    summary: `[MOCK] Recent congressional activity in ${symbol} shows mixed positioning.`,
    trades: [
      {
        politician: 'Rep. Example',
        ticker: symbol,
        transactionType: 'Purchase',
        amount: '$15,001 - $50,000',
        filedAt: nowIso(),
      },
    ],
  };
}

function mockInsider(symbol: string): InsiderActivitySummary {
  return {
    symbol,
    provider: 'mock',
    netActivity: 'buying',
    summary: `[MOCK] Net insider buying in ${symbol} over the last 30 days.`,
    transactions: [
      {
        insider: 'CFO (Mock)',
        transactionType: 'Purchase',
        shares: 12_500,
        value: 1_750_000,
        filedAt: nowIso(),
      },
    ],
  };
}

function mockConfluence(
  symbol: string,
  direction?: 'bullish' | 'bearish'
): ConfluenceSummary {
  const resolvedDirection = direction ?? 'bullish';
  return {
    symbol,
    provider: 'mock',
    direction: resolvedDirection,
    score: resolvedDirection === 'bullish' ? 72 : 28,
    summary: `[MOCK] ${resolvedDirection === 'bullish' ? 'Bullish' : 'Bearish'} confluence for ${symbol} from flow, dark pool, and insider signals.`,
    signals: [
      { source: 'flow', direction: resolvedDirection, detail: 'Unusual call premium' },
      { source: 'dark_pool', direction: resolvedDirection, detail: 'Large block prints' },
      { source: 'insider', direction: 'neutral', detail: 'Limited insider filings' },
    ],
  };
}

export const mockMarketIntelligenceProvider: MarketIntelligenceProvider = {
  name: 'mock',

  async getMorningBrief(_input?: MorningBriefInput): Promise<MorningBrief> {
    return {
      generatedAt: nowIso(),
      provider: 'mock',
      overview:
        '[MOCK] Markets are mixed with tech leadership and elevated options activity in semiconductors.',
      keyTickers: MOCK_TICKERS.slice(0, 4),
      unusualActivity: [
        'NVDA: Large call sweeps ahead of earnings',
        'TSLA: Dark pool prints above VWAP',
        'SPY: Net put premium rising into macro data',
      ],
      risksAndEvents: [
        'CPI release Thursday',
        'FOMC minutes Friday',
        'NVDA earnings next week',
      ],
      sentiment: 'mixed',
    };
  },

  async analyzeTicker(input: { symbol: string }): Promise<TickerAnalysis> {
    const { symbol } = input;
    return {
      symbol,
      provider: 'mock',
      summary: `[MOCK] ${symbol} shows bullish smart-money positioning with elevated flow and institutional prints.`,
      sentiment: 'bullish',
      highlights: [
        'Call premium 2.3x 30-day average',
        'Dark pool activity above baseline',
        'Insider net buying last 30 days',
      ],
      catalysts: ['Upcoming earnings', 'Sector rotation into semis'],
      risks: ['Macro headline risk', 'Elevated IV into event'],
    };
  },

  async getUnusualFlow(input: { symbol: string }): Promise<FlowSummary> {
    return mockFlow(input.symbol);
  },

  async getDarkPoolContext(input: { symbol: string }): Promise<DarkPoolSummary> {
    return mockDarkPool(input.symbol);
  },

  async getCongressTrades(input: { symbol: string }): Promise<CongressTradeSummary> {
    return mockCongress(input.symbol);
  },

  async getInsiderActivity(input: { symbol: string }): Promise<InsiderActivitySummary> {
    return mockInsider(input.symbol);
  },

  async getConfluence(input: {
    symbol: string;
    direction?: 'bullish' | 'bearish';
  }): Promise<ConfluenceSummary> {
    return mockConfluence(input.symbol, input.direction);
  },
};