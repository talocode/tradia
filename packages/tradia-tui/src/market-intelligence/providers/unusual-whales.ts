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

const API_ORIGIN = 'https://api.unusualwhales.com';

export class UnusualWhalesConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnusualWhalesConfigError';
  }
}

interface UwClientOptions {
  apiKey: string;
}

async function uwFetch<T>(
  apiKey: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const url = new URL(path, API_ORIGIN);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Unusual Whales API error (${response.status}): ${body.slice(0, 200) || response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && Array.isArray((value as { data?: unknown }).data)) {
    return (value as { data: T[] }).data;
  }
  return [];
}

function formatPremium(value: unknown): number | undefined {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function sentimentFromPremium(
  bull?: number,
  bear?: number
): 'bullish' | 'bearish' | 'neutral' | 'mixed' {
  if (bull === undefined && bear === undefined) return 'neutral';
  const b = bull ?? 0;
  const be = bear ?? 0;
  if (b > be * 1.5) return 'bullish';
  if (be > b * 1.5) return 'bearish';
  if (b > 0 && be > 0) return 'mixed';
  return 'neutral';
}

export function createUnusualWhalesProvider(
  options: UwClientOptions
): MarketIntelligenceProvider {
  const { apiKey } = options;

  if (!apiKey?.trim()) {
    throw new UnusualWhalesConfigError(
      'UNUSUAL_WHALES_API_KEY is required for the unusual_whales provider'
    );
  }

  const key = apiKey.trim();

  return {
    name: 'unusual_whales',

    async getMorningBrief(input?: MorningBriefInput): Promise<MorningBrief> {
      const [tide, topImpact, calendar] = await Promise.all([
        uwFetch<unknown>(key, '/api/market/market-tide', { date: input?.date }),
        uwFetch<unknown>(key, '/api/market/top-net-impact', { limit: 8 }),
        uwFetch<unknown>(key, '/api/market/economic-calendar'),
      ]);

      const topRows = asArray<Record<string, unknown>>(topImpact);
      const keyTickers = topRows
        .map((row) => String(row.ticker ?? row.ticker_symbol ?? ''))
        .filter(Boolean)
        .slice(0, 6);

      const calendarRows = asArray<Record<string, unknown>>(calendar).slice(0, 5);
      const risksAndEvents = calendarRows.map(
        (row) =>
          `${row.event ?? row.title ?? 'Event'}${row.date ? ` (${row.date})` : ''}`
      );

      const tideRow = asArray<Record<string, unknown>>(tide)[0] ?? {};
      const netPremium = formatPremium(tideRow.net_premium ?? tideRow.net_call_premium);
      const sentiment =
        netPremium === undefined
          ? 'mixed'
          : netPremium > 0
            ? 'bullish'
            : netPremium < 0
              ? 'bearish'
              : 'neutral';

      return {
        generatedAt: new Date().toISOString(),
        provider: 'unusual_whales',
        overview: `Market tide net premium: ${netPremium ?? 'n/a'}. Top impact tickers: ${keyTickers.join(', ') || 'none'}.`,
        keyTickers,
        unusualActivity: topRows.slice(0, 5).map((row) => {
          const ticker = String(row.ticker ?? row.ticker_symbol ?? '—');
          const impact = formatPremium(row.net_premium ?? row.premium);
          return `${ticker}: net premium ${impact ?? 'n/a'}`;
        }),
        risksAndEvents: risksAndEvents.length
          ? risksAndEvents
          : ['No major economic events returned for this window'],
        sentiment,
      };
    },

    async analyzeTicker(input: { symbol: string }): Promise<TickerAnalysis> {
      const symbol = input.symbol;
      const [flow, darkPool, insider] = await Promise.all([
        uwFetch<unknown>(key, '/api/option-trades/flow-alerts', {
          ticker_symbol: symbol,
          limit: 10,
        }),
        uwFetch<unknown>(key, `/api/darkpool/${symbol}`, { limit: 10 }),
        uwFetch<unknown>(key, `/api/insider/${symbol}/ticker-flow`),
      ]);

      const flowRows = asArray<Record<string, unknown>>(flow);
      const darkRows = asArray<Record<string, unknown>>(darkPool);
      const insiderRow = (insider as Record<string, unknown>) ?? {};

      const bullPremium = flowRows.reduce(
        (sum, row) => sum + (Number(row.bullish_premium ?? row.premium) || 0),
        0
      );
      const bearPremium = flowRows.reduce(
        (sum, row) => sum + (Number(row.bearish_premium ?? 0) || 0),
        0
      );
      const sentiment = sentimentFromPremium(bullPremium, bearPremium);

      return {
        symbol,
        provider: 'unusual_whales',
        summary: `${symbol}: ${flowRows.length} recent flow alerts, ${darkRows.length} dark pool prints, insider flow available.`,
        sentiment,
        highlights: [
          `Flow alerts: ${flowRows.length}`,
          `Dark pool prints: ${darkRows.length}`,
          `Insider buys: ${insiderRow.buys ?? insiderRow.buy_count ?? 'n/a'}`,
          `Insider sells: ${insiderRow.sells ?? insiderRow.sell_count ?? 'n/a'}`,
        ],
        catalysts: flowRows.slice(0, 3).map((row) => {
          const strike = row.strike ?? row.strike_price ?? '—';
          const expiry = row.expiry ?? row.expiration ?? '—';
          return `Flow: ${row.put_call ?? row.type ?? 'option'} ${strike} exp ${expiry}`;
        }),
        risks: ['Live data — verify before acting', 'Options positioning can shift quickly'],
      };
    },

    async getUnusualFlow(input: { symbol: string }): Promise<FlowSummary> {
      const data = await uwFetch<unknown>(key, '/api/option-trades/flow-alerts', {
        ticker_symbol: input.symbol,
        limit: 25,
      });
      const rows = asArray<Record<string, unknown>>(data);

      let bullTotal = 0;
      let bearTotal = 0;
      const events = rows.map((row) => {
        const premium = formatPremium(row.premium ?? row.total_premium);
        const sentiment =
          row.sentiment === 'bullish' || row.is_bullish
            ? 'bullish'
            : row.sentiment === 'bearish' || row.is_bearish
              ? 'bearish'
              : 'neutral';
        if (sentiment === 'bullish') bullTotal += premium ?? 0;
        if (sentiment === 'bearish') bearTotal += premium ?? 0;
        return {
          timestamp: String(row.created_at ?? row.executed_at ?? new Date().toISOString()),
          description: `${row.put_call ?? row.type ?? 'flow'} ${row.strike ?? ''} ${row.expiry ?? ''}`.trim(),
          premium,
          sentiment: sentiment as 'bullish' | 'bearish' | 'neutral',
        };
      });

      return {
        symbol: input.symbol,
        provider: 'unusual_whales',
        netSentiment: sentimentFromPremium(bullTotal, bearTotal),
        totalPremium: bullTotal + bearTotal,
        events,
        summary: `${rows.length} unusual flow events for ${input.symbol}.`,
      };
    },

    async getDarkPoolContext(input: { symbol: string }): Promise<DarkPoolSummary> {
      const data = await uwFetch<unknown>(key, `/api/darkpool/${input.symbol}`, { limit: 25 });
      const rows = asArray<Record<string, unknown>>(data);

      const prints = rows.map((row) => ({
        timestamp: String(row.executed_at ?? row.created_at ?? new Date().toISOString()),
        price: Number(row.price ?? row.avg_price ?? 0),
        size: Number(row.size ?? row.volume ?? 0),
        premium: formatPremium(row.premium ?? row.notional),
      }));

      const totalVolume = prints.reduce((sum, p) => sum + p.size, 0);
      const totalPremium = prints.reduce((sum, p) => sum + (p.premium ?? 0), 0);

      return {
        symbol: input.symbol,
        provider: 'unusual_whales',
        totalVolume,
        totalPremium,
        prints,
        summary: `${prints.length} dark pool prints for ${input.symbol}.`,
      };
    },

    async getCongressTrades(input: { symbol: string }): Promise<CongressTradeSummary> {
      const data = await uwFetch<unknown>(key, '/api/congress/recent-trades', {
        ticker: input.symbol,
        limit: 25,
      });
      const rows = asArray<Record<string, unknown>>(data);

      const trades = rows.map((row) => ({
        politician: String(row.representative ?? row.politician ?? row.name ?? 'Unknown'),
        ticker: String(row.ticker ?? input.symbol),
        transactionType: String(row.transaction_type ?? row.type ?? 'Unknown'),
        amount: row.amount_range
          ? String(row.amount_range)
          : row.amount
            ? String(row.amount)
            : undefined,
        filedAt: String(row.filed_at ?? row.disclosure_date ?? row.transaction_date ?? ''),
      }));

      return {
        symbol: input.symbol,
        provider: 'unusual_whales',
        trades,
        summary: `${trades.length} congressional trades involving ${input.symbol}.`,
      };
    },

    async getInsiderActivity(input: { symbol: string }): Promise<InsiderActivitySummary> {
      const [flow, transactions] = await Promise.all([
        uwFetch<unknown>(key, `/api/insider/${input.symbol}/ticker-flow`),
        uwFetch<unknown>(key, '/api/insider/transactions', {
          ticker_symbol: input.symbol,
          limit: 15,
        }),
      ]);

      const flowRow = (flow as Record<string, unknown>) ?? {};
      const rows = asArray<Record<string, unknown>>(transactions);
      const buys = Number(flowRow.buys ?? flowRow.buy_count ?? 0);
      const sells = Number(flowRow.sells ?? flowRow.sell_count ?? 0);

      let netActivity: InsiderActivitySummary['netActivity'] = 'none';
      if (buys > sells) netActivity = 'buying';
      else if (sells > buys) netActivity = 'selling';
      else if (buys > 0 && sells > 0) netActivity = 'mixed';

      const txns = rows.map((row) => ({
        insider: String(row.insider_name ?? row.owner_name ?? 'Unknown'),
        transactionType: String(row.transaction_code ?? row.type ?? 'Unknown'),
        shares: formatPremium(row.amount ?? row.shares),
        value: formatPremium(row.value ?? row.total_value),
        filedAt: String(row.filing_date ?? row.transaction_date ?? ''),
      }));

      return {
        symbol: input.symbol,
        provider: 'unusual_whales',
        netActivity,
        transactions: txns,
        summary: `Insider activity for ${input.symbol}: ${buys} buys, ${sells} sells.`,
      };
    },

    async getConfluence(input: {
      symbol: string;
      direction?: 'bullish' | 'bearish';
    }): Promise<ConfluenceSummary> {
      const symbol = input.symbol;
      const [flow, darkPool, insider, congress] = await Promise.all([
        this.getUnusualFlow({ symbol }),
        this.getDarkPoolContext({ symbol }),
        this.getInsiderActivity({ symbol }),
        this.getCongressTrades({ symbol }),
      ]);

      const signals: ConfluenceSummary['signals'] = [
        {
          source: 'flow',
          direction:
            flow.netSentiment === 'bearish'
              ? 'bearish'
              : flow.netSentiment === 'bullish'
                ? 'bullish'
                : 'neutral',
          detail: flow.summary,
        },
        {
          source: 'dark_pool',
          direction: (darkPool.totalPremium ?? 0) > 0 ? 'bullish' : 'neutral',
          detail: darkPool.summary,
        },
        {
          source: 'insider',
          direction:
            insider.netActivity === 'buying'
              ? 'bullish'
              : insider.netActivity === 'selling'
                ? 'bearish'
                : 'neutral',
          detail: insider.summary,
        },
        {
          source: 'congress',
          direction: 'neutral',
          detail: congress.summary,
        },
      ];

      const bullishCount = signals.filter((s) => s.direction === 'bullish').length;
      const bearishCount = signals.filter((s) => s.direction === 'bearish').length;
      const resolvedDirection =
        input.direction ??
        (bullishCount > bearishCount
          ? 'bullish'
          : bearishCount > bullishCount
            ? 'bearish'
            : 'mixed');

      const aligned =
        resolvedDirection === 'bullish'
          ? bullishCount
          : resolvedDirection === 'bearish'
            ? bearishCount
            : Math.max(bullishCount, bearishCount);
      const score = Math.min(100, Math.round((aligned / signals.length) * 100));

      return {
        symbol,
        provider: 'unusual_whales',
        direction: resolvedDirection,
        score,
        signals,
        summary: `${resolvedDirection} confluence score ${score}/100 for ${symbol} across flow, dark pool, insider, and congress signals.`,
      };
    },
  };
}