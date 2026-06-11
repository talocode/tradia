export type IntelligenceProviderName = 'mock' | 'unusual_whales';

export interface MorningBriefInput {
  date?: string;
}

export interface MorningBrief {
  generatedAt: string;
  provider: IntelligenceProviderName;
  overview: string;
  keyTickers: string[];
  unusualActivity: string[];
  risksAndEvents: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral' | 'mixed';
}

export interface TickerAnalysis {
  symbol: string;
  provider: IntelligenceProviderName;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  highlights: string[];
  catalysts: string[];
  risks: string[];
}

export interface FlowEvent {
  timestamp: string;
  description: string;
  premium?: number;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
}

export interface FlowSummary {
  symbol: string;
  provider: IntelligenceProviderName;
  netSentiment: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  totalPremium?: number;
  events: FlowEvent[];
  summary: string;
}

export interface DarkPoolPrint {
  timestamp: string;
  price: number;
  size: number;
  premium?: number;
}

export interface DarkPoolSummary {
  symbol: string;
  provider: IntelligenceProviderName;
  totalVolume?: number;
  totalPremium?: number;
  prints: DarkPoolPrint[];
  summary: string;
}

export interface CongressTrade {
  politician: string;
  ticker: string;
  transactionType: string;
  amount?: string;
  filedAt: string;
}

export interface CongressTradeSummary {
  symbol: string;
  provider: IntelligenceProviderName;
  trades: CongressTrade[];
  summary: string;
}

export interface InsiderTransaction {
  insider: string;
  transactionType: string;
  shares?: number;
  value?: number;
  filedAt: string;
}

export interface InsiderActivitySummary {
  symbol: string;
  provider: IntelligenceProviderName;
  netActivity: 'buying' | 'selling' | 'mixed' | 'none';
  transactions: InsiderTransaction[];
  summary: string;
}

export interface ConfluenceSignal {
  source: 'flow' | 'dark_pool' | 'insider' | 'congress' | 'market';
  direction: 'bullish' | 'bearish' | 'neutral';
  detail: string;
}

export interface ConfluenceSummary {
  symbol: string;
  provider: IntelligenceProviderName;
  direction: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  score: number;
  signals: ConfluenceSignal[];
  summary: string;
}

export interface MarketIntelligenceProvider {
  readonly name: IntelligenceProviderName;
  getMorningBrief(input?: MorningBriefInput): Promise<MorningBrief>;
  analyzeTicker(input: { symbol: string }): Promise<TickerAnalysis>;
  getUnusualFlow(input: { symbol: string }): Promise<FlowSummary>;
  getDarkPoolContext(input: { symbol: string }): Promise<DarkPoolSummary>;
  getCongressTrades(input: { symbol: string }): Promise<CongressTradeSummary>;
  getInsiderActivity(input: { symbol: string }): Promise<InsiderActivitySummary>;
  getConfluence(input: {
    symbol: string;
    direction?: 'bullish' | 'bearish';
  }): Promise<ConfluenceSummary>;
}

export interface IntelligenceProviderMeta {
  configured: IntelligenceProviderName;
  active: IntelligenceProviderName;
  apiKeyConfigured: boolean;
  degraded: boolean;
  message?: string;
}

export interface ProviderStatus {
  provider: IntelligenceProviderName;
  apiKeyConfigured: boolean;
  degraded: boolean;
  message?: string;
}