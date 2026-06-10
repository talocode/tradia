# Market Data Integration

TradiaAI uses a provider abstraction for market data so we can swap vendors without rewriting chart or API code. The first provider is **Finnhub**; the MVP also ships a **mock** fallback for local development and missing-key scenarios.

## Environment variables

Add these to `.env.local` (never commit real keys):

```bash
FINNHUB_API_KEY=your_finnhub_api_key
MARKET_DATA_PROVIDER=finnhub
```

| Variable | Required | Description |
|----------|----------|-------------|
| `FINNHUB_API_KEY` | For live data | Server-side Finnhub token. **Never expose to the browser.** |
| `MARKET_DATA_PROVIDER` | No | `finnhub` (default) or `mock` |

If `MARKET_DATA_PROVIDER=finnhub` but `FINNHUB_API_KEY` is missing, APIs automatically serve mock data with `meta.degraded: true`.

## Finnhub setup

1. Create a free account at [https://finnhub.io](https://finnhub.io).
2. Copy your API key from the dashboard.
3. Set `FINNHUB_API_KEY` in `.env.local` on the server only (Vercel/host env, not `NEXT_PUBLIC_*`).
4. Restart the dev server.

All Finnhub requests are made from Next.js API routes under `/api/market/*`. The browser never calls Finnhub directly.

## Supported MVP symbols

| Symbol | Display | Asset class |
|--------|---------|-------------|
| `OANDA:EUR_USD` | EUR/USD | Forex |
| `OANDA:GBP_USD` | GBP/USD | Forex |
| `OANDA:USD_JPY` | USD/JPY | Forex |
| `BINANCE:BTCUSDT` | BTC/USDT | Crypto |
| `AAPL` | Apple Inc. | Stock |

Symbol requests are validated server-side against this allowlist.

## Provider abstraction

```
src/lib/market-data/
├── types.ts              # MarketSymbol, MarketQuote, MarketCandle, MarketDataProvider
├── symbols.ts            # MVP allowlist + trade symbol normalization
├── validation.ts         # Request validation
├── rate-limit.ts         # Simple in-memory rate limiting
├── index.ts              # getMarketDataProvider()
└── providers/
    ├── finnhub.ts        # Finnhub REST implementation
    └── mock.ts           # Deterministic mock data
```

To add a new provider:

1. Implement `MarketDataProvider` in `src/lib/market-data/providers/<name>.ts`.
2. Register it in `getMarketDataProvider()` inside `index.ts`.
3. Extend `MARKET_DATA_PROVIDER` env handling.
4. Add tests with mocked HTTP — do not call live APIs in CI.

## API routes

| Route | Description |
|-------|-------------|
| `GET /api/market/quote?symbol=OANDA:EUR_USD` | Latest quote |
| `GET /api/market/candles?symbol=...&resolution=5&from=...&to=...` | OHLCV candles |
| `GET /api/market/symbols` | MVP symbol list |

All routes require authentication and apply per-user rate limiting.

## Chart UI

- Page: `/dashboard/markets`
- Components: `MarketChart`, `SymbolSelector`, `MarketInsightPanel`
- Library: [TradingView Lightweight Charts](https://www.tradingview.com/lightweight-charts/)
- Polling: 30s interval (conservative MVP; not an infinite tight loop)

Trade journal overlays: entry, exit, stop loss, and take profit price lines when trade symbols match the chart symbol.

## WebSocket roadmap

Finnhub supports `wss://ws.finnhub.io?token=API_KEY` for real-time trades/quotes. A future PR should add a **server-side WebSocket proxy** (or SSE bridge) so clients subscribe without receiving the secret key.

Planned approach:

1. Server opens authenticated Finnhub WebSocket.
2. Client connects to `/api/market/stream` (or dedicated WS server).
3. Server forwards normalized `MarketTradeTick` events.
4. Chart updates last candle or adds tick overlay.

MVP uses REST polling for quotes and candles.

## Licensing caution

Market data is subject to exchange and vendor licensing terms. Finnhub free tiers may have delayed data, usage caps, and redistribution limits. Before production launch:

- Review Finnhub's terms of service and display requirements.
- Confirm redistribution rights if showing data to end users.
- Plan for paid tiers if volume or asset coverage grows.
- Do not scrape or bypass provider limits.

TradiaAI charts are for trader context alongside journal and risk tools — not a standalone data terminal.