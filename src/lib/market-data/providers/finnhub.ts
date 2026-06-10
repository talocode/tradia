import type {
  MarketCandle,
  MarketDataProvider,
  MarketQuote,
  MarketResolution,
  MarketSymbol,
} from '../types';
import { getAssetClass } from '../symbols';
import { MVP_MARKET_SYMBOLS } from '../symbols';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

interface FinnhubQuoteResponse {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

interface FinnhubCandleResponse {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  s: string;
  t: number[];
  v: number[];
}

function getCandleEndpoint(symbol: string): string {
  const assetClass = getAssetClass(symbol);
  switch (assetClass) {
    case 'forex':
      return 'forex/candle';
    case 'crypto':
      return 'crypto/candle';
    case 'stock':
    default:
      return 'stock/candle';
  }
}

export class FinnhubMarketDataProvider implements MarketDataProvider {
  readonly name = 'finnhub';

  constructor(private readonly apiKey: string) {}

  private async fetchJson<T>(path: string, params: Record<string, string>): Promise<T> {
    const url = new URL(`${FINNHUB_BASE_URL}/${path}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    url.searchParams.set('token', this.apiKey);

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Finnhub request failed (${response.status}): ${body || response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    const data = await this.fetchJson<FinnhubQuoteResponse>('quote', { symbol });

    if (!data.c || data.c <= 0) {
      throw new Error(`No quote data available for ${symbol}`);
    }

    return {
      symbol,
      price: data.c,
      change: data.d ?? 0,
      changePercent: data.dp ?? 0,
      high: data.h ?? data.c,
      low: data.l ?? data.c,
      open: data.o ?? data.c,
      previousClose: data.pc ?? data.c,
      timestamp: data.t ?? Math.floor(Date.now() / 1000),
    };
  }

  async getCandles(
    symbol: string,
    resolution: MarketResolution,
    from: number,
    to: number
  ): Promise<MarketCandle[]> {
    const endpoint = getCandleEndpoint(symbol);
    const data = await this.fetchJson<FinnhubCandleResponse>(endpoint, {
      symbol,
      resolution,
      from: String(from),
      to: String(to),
    });

    if (data.s !== 'ok' || !data.t?.length) {
      throw new Error(`No candle data available for ${symbol}`);
    }

    return data.t.map((time, index) => ({
      time,
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: data.c[index],
      volume: data.v?.[index],
    }));
  }

  async getSupportedSymbols(): Promise<MarketSymbol[]> {
    return MVP_MARKET_SYMBOLS;
  }
}

export function createFinnhubProvider(apiKey: string): FinnhubMarketDataProvider {
  return new FinnhubMarketDataProvider(apiKey);
}