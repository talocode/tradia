# TradiaAI TUI

Terminal AI market intelligence assistant for traders. Local-first, open source, and **bring your own API key (BYOK)**.

Tradia does **not** ship with an API key. Users who want live smart-money data must provide their own [Unusual Whales](https://unusualwhales.com) API key. Mock mode is available for testing without credentials.

## Install

```bash
npx tradia
```

Global install:

```bash
npm install -g tradia
tradia init
tradia brief
```

## BYOK setup

Interactive wizard:

```bash
tradia init
```

Or set environment variables:

```bash
export UNUSUAL_WHALES_API_KEY=your_key
export MARKET_INTELLIGENCE_PROVIDER=unusual_whales
tradia brief
```

Local config is stored at `~/.tradia/config.json` (mode `0600`). Your key never leaves your machine.

## Mock mode

```bash
tradia config provider mock
tradia brief
```

## Commands

```bash
tradia
tradia init
tradia doctor
tradia config
tradia config status
tradia config set-key
tradia config clear-key
tradia config provider mock
tradia config provider unusual_whales
tradia brief
tradia ticker NVDA
tradia flow NVDA
tradia dark-pool NVDA
```

## Policy

- No auto-trading
- No broker connections
- No order placement
- No hosted proxy — requests go directly from your machine to Unusual Whales
- API keys are never logged or sent to Talocode servers