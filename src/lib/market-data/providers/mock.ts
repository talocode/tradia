import type {
  MarketCandle,
  MarketDataProvider,
  MarketQuote,
  MarketResolution,
  MarketSymbol,
} from '../types';
import { MVP_MARKET_SYMBOLS } from '../symbols';

const BASE_PRICES: Record<string, number> = {
  'OANDA:EUR_USD': 1.0842,
  'OANDA:GBP_USD': 1.2735,
  'OANDA:USD_JPY': 151.42,
  'BINANCE:BTCUSDT': 67250,
  AAPL: 198.5,
};

function resolutionToSeconds(resolution: MarketResolution): number {
  switch (resolution) {
    case '1':
      return 60;
    case '5':
      return 300;
    case '15':
      return 900;
    case '30':
      return 1800;
    case '60':
      return 3600;
    case 'D':
      return 86400;
    case 'W':
      return 604800;
    case 'M':
      return 2592000;
    default:
      return 300;
  }
}

function generateMockCandles(
  symbol: string,
  resolution: MarketResolution,
  from: number,
  to: number
): MarketCandle[] {
  const step = resolutionToSeconds(resolution);
  const base = BASE_PRICES[symbol] ?? 100;
  const candles: MarketCandle[] = [];
  let price = base;

  for (let t = from; t <= to; t += step) {
    const drift = (Math.sin(t / 3600) + Math.cos(t / 7200)) * base * 0.001;
    const open = price;
    const close = open + drift;
    const high = Math.max(open, close) + Math.abs(drift) * 0.5;
    const low = Math.min(open, close) - Math.abs(drift) * 0.5;
    candles.push({
      time: t,
      open,
      high,
      low,
      close,
      volume: 1000 + (t % 500),
    });
    price = close;
  }

  return candles;
}

export class MockMarketDataProvider implements MarketDataProvider {
  readonly name = 'mock';

  async getQuote(symbol: string): Promise<MarketQuote> {
    const base = BASE_PRICES[symbol] ?? 100;
    const change = base * 0.0012;
    const now = Math.floor(Date.now() / 1000);

    return {
      symbol,
      price: base + change,
      change,
      changePercent: 0.12,
      high: base + change * 2,
      low: base - change,
      open: base,
      previousClose: base - change * 0.5,
      timestamp: now,
    };
  }

  async getCandles(
    symbol: string,
    resolution: MarketResolution,
    from: number,
    to: number
  ): Promise<MarketCandle[]> {
    return generateMockCandles(symbol, resolution, from, to);
  }

  async getSupportedSymbols(): Promise<MarketSymbol[]> {
    return MVP_MARKET_SYMBOLS;
  }
}

export const mockMarketDataProvider = new MockMarketDataProvider();