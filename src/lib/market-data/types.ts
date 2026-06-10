export type MarketResolution = '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M';

export type MarketAssetClass = 'forex' | 'crypto' | 'stock';

export interface MarketSymbol {
  symbol: string;
  displayName: string;
  assetClass: MarketAssetClass;
  providerSymbol: string;
}

export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface MarketCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface MarketTradeTick {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
}

export interface MarketDataProvider {
  readonly name: string;
  getQuote(symbol: string): Promise<MarketQuote>;
  getCandles(
    symbol: string,
    resolution: MarketResolution,
    from: number,
    to: number
  ): Promise<MarketCandle[]>;
  getSupportedSymbols?(): Promise<MarketSymbol[]>;
}

export type MarketProviderName = 'finnhub' | 'mock';

export interface MarketDataMeta {
  provider: MarketProviderName;
  degraded: boolean;
  message?: string;
}