# TradiaAI TUI

TradiaAI TUI is a local-first terminal app for smart money market intelligence. It helps traders inspect unusual flow, dark pool activity, congressional trades, insider activity, and bullish/bearish confluence from the command line.

**No auto-trading.** TradiaAI TUI does not execute trades, connect broker accounts, or place orders.

**Not financial advice.** All output is for informational purposes only.

## Why local-first?

The hosted TradiaAI app (`tradiaai.app`) depended on Render. When that service was suspended, users lost access to smart money tooling. The TUI runs entirely on your machine with your own API keys — no Render, no hosted dashboard required.

## Install

### NPM (recommended)

Run without installing:

```bash
npx tradia
```

Install globally:

```bash
npm install -g tradia
tradia
```

### From source (monorepo)

```bash
git clone https://github.com/talocode/tradia.git
cd tradia
pnpm install
cd packages/tradia-tui
pnpm run build
node dist/index.js --help
```

## Run

Interactive home menu:

```bash
npx tradia
```

Direct commands:

```bash
tradia brief
tradia ticker NVDA
tradia flow NVDA
tradia dark-pool NVDA
tradia congress NVDA
tradia insider NVDA
tradia confluence NVDA
tradia confluence NVDA --direction bullish
tradia config
tradia --version
tradia --help
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MARKET_INTELLIGENCE_PROVIDER` | `mock` | `mock` or `unusual_whales` |
| `UNUSUAL_WHALES_API_KEY` | _(empty)_ | Unusual Whales API key (local env only) |

Example:

```bash
export MARKET_INTELLIGENCE_PROVIDER=mock
export UNUSUAL_WHALES_API_KEY=
```

## Mock mode (no API key)

Mock mode works out of the box. All responses are clearly labeled `[MOCK]` and are not presented as live market data.

When no API key is configured, the TUI shows:

> Mock provider active. Set UNUSUAL_WHALES_API_KEY for live market intelligence.

```bash
MARKET_INTELLIGENCE_PROVIDER=mock tradia brief
```

## Unusual Whales setup

1. Get an API key at [unusualwhales.com/settings/api-dashboard](https://unusualwhales.com/settings/api-dashboard).
2. Set environment variables:

```bash
export MARKET_INTELLIGENCE_PROVIDER=unusual_whales
export UNUSUAL_WHALES_API_KEY=your_key_here
tradia config
```

The TUI uses the Unusual Whales REST API (`https://api.unusualwhales.com`) via a provider abstraction layer. It does **not** expose your API key in output. If the key is missing while `unusual_whales` is configured, the app falls back to mock mode with a clear degraded notice.

Reference: [unusual-whales/unusual-whales-official-mcp](https://github.com/unusual-whales/unusual-whales-official-mcp)

### Rate limits

Unusual Whales default rate limit is ~120 requests/minute. The provider uses direct REST calls with a 30s timeout per request.

## Architecture

```
packages/tradia-tui/              Publishable NPM CLI package
  src/cli.ts                      Commander CLI entry
  src/menu.ts                     Interactive menu
  src/market-intelligence/        Provider abstraction
    providers/mock.ts             Works without API key
    providers/unusual-whales.ts   Live data via REST API
```

The TUI never calls Unusual Whales directly — all data flows through `MarketIntelligenceProvider`.

## Examples

Morning brief in mock mode:

```bash
tradia brief
```

Ticker analysis with live data:

```bash
MARKET_INTELLIGENCE_PROVIDER=unusual_whales UNUSUAL_WHALES_API_KEY=xxx tradia ticker NVDA
```

Check provider status (no secrets shown):

```bash
tradia config
```

## Policy

- No auto-trading
- No broker connections
- No order placement
- API keys stay in local/server environment only
- Mock data is never presented as live data
- Does not depend on `tradiaai.app` or Render