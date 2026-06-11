import chalk from 'chalk';
import type {
  CongressTradeSummary,
  ConfluenceSummary,
  DarkPoolSummary,
  FlowSummary,
  InsiderActivitySummary,
  MorningBrief,
  ProviderStatus,
  TickerAnalysis,
} from '../market-intelligence/types.js';
import { DISCLAIMER } from './disclaimer.js';

export function formatHeader(title: string): string {
  const line = '─'.repeat(Math.max(title.length + 4, 40));
  return `\n${chalk.cyan(line)}\n  ${chalk.bold(title)}\n${chalk.cyan(line)}`;
}

export function formatDisclaimer(): string {
  return chalk.dim(DISCLAIMER);
}

export function formatMorningBrief(brief: MorningBrief): string {
  const sections = [
    formatHeader('Morning Brief'),
    `Generated: ${brief.generatedAt}`,
    `Provider: ${formatProviderLabel(brief.provider)}`,
    `Sentiment: ${formatSentiment(brief.sentiment)}`,
    '',
    chalk.bold('Overview'),
    brief.overview,
    '',
    chalk.bold('Key Tickers'),
    ...brief.keyTickers.map((t) => `  • ${t}`),
    '',
    chalk.bold('Unusual Activity'),
    ...brief.unusualActivity.map((a) => `  • ${a}`),
    '',
    chalk.bold('Risks & Events'),
    ...brief.risksAndEvents.map((r) => `  • ${r}`),
    '',
    formatDisclaimer(),
  ];
  return sections.join('\n');
}

export function formatTickerAnalysis(analysis: TickerAnalysis): string {
  return [
    formatHeader(`Ticker Analysis: ${analysis.symbol}`),
    `Provider: ${formatProviderLabel(analysis.provider)}`,
    `Sentiment: ${formatSentiment(analysis.sentiment)}`,
    '',
    analysis.summary,
    '',
    chalk.bold('Highlights'),
    ...analysis.highlights.map((h) => `  • ${h}`),
    '',
    chalk.bold('Catalysts'),
    ...analysis.catalysts.map((c) => `  • ${c}`),
    '',
    chalk.bold('Risks'),
    ...analysis.risks.map((r) => `  • ${r}`),
    '',
    formatDisclaimer(),
  ].join('\n');
}

export function formatFlow(flow: FlowSummary): string {
  const lines = [
    formatHeader(`Unusual Flow: ${flow.symbol}`),
    `Provider: ${formatProviderLabel(flow.provider)}`,
    `Net sentiment: ${formatSentiment(flow.netSentiment)}`,
    flow.totalPremium !== undefined
      ? `Total premium: $${flow.totalPremium.toLocaleString()}`
      : '',
    '',
    flow.summary,
    '',
    chalk.bold('Events'),
  ];

  for (const event of flow.events) {
    const premium = event.premium ? ` ($${event.premium.toLocaleString()})` : '';
    const sentiment = event.sentiment ? ` [${event.sentiment}]` : '';
    lines.push(`  • ${event.timestamp} — ${event.description}${premium}${sentiment}`);
  }

  lines.push('', formatDisclaimer());
  return lines.filter(Boolean).join('\n');
}

export function formatDarkPool(dark: DarkPoolSummary): string {
  const lines = [
    formatHeader(`Dark Pool: ${dark.symbol}`),
    `Provider: ${formatProviderLabel(dark.provider)}`,
    dark.totalVolume !== undefined
      ? `Total volume: ${dark.totalVolume.toLocaleString()}`
      : '',
    dark.totalPremium !== undefined
      ? `Total premium: $${dark.totalPremium.toLocaleString()}`
      : '',
    '',
    dark.summary,
    '',
    chalk.bold('Prints'),
  ];

  for (const print of dark.prints) {
    lines.push(
      `  • ${print.timestamp} — ${print.size.toLocaleString()} @ $${print.price}${print.premium ? ` ($${print.premium.toLocaleString()})` : ''}`
    );
  }

  lines.push('', formatDisclaimer());
  return lines.filter(Boolean).join('\n');
}

export function formatCongress(congress: CongressTradeSummary): string {
  const lines = [
    formatHeader(`Congress Trades: ${congress.symbol}`),
    `Provider: ${formatProviderLabel(congress.provider)}`,
    '',
    congress.summary,
    '',
    chalk.bold('Trades'),
  ];

  for (const trade of congress.trades) {
    const amount = trade.amount ? ` (${trade.amount})` : '';
    lines.push(
      `  • ${trade.politician}: ${trade.transactionType} ${trade.ticker}${amount} — filed ${trade.filedAt}`
    );
  }

  if (congress.trades.length === 0) {
    lines.push('  (no trades returned)');
  }

  lines.push('', formatDisclaimer());
  return lines.join('\n');
}

export function formatInsider(insider: InsiderActivitySummary): string {
  const lines = [
    formatHeader(`Insider Activity: ${insider.symbol}`),
    `Provider: ${formatProviderLabel(insider.provider)}`,
    `Net activity: ${insider.netActivity}`,
    '',
    insider.summary,
    '',
    chalk.bold('Transactions'),
  ];

  for (const txn of insider.transactions) {
    const shares = txn.shares ? `${txn.shares.toLocaleString()} shares` : '';
    const value = txn.value ? `$${txn.value.toLocaleString()}` : '';
    const detail = [shares, value].filter(Boolean).join(', ');
    lines.push(
      `  • ${txn.insider}: ${txn.transactionType}${detail ? ` — ${detail}` : ''} (${txn.filedAt})`
    );
  }

  if (insider.transactions.length === 0) {
    lines.push('  (no transactions returned)');
  }

  lines.push('', formatDisclaimer());
  return lines.join('\n');
}

export function formatConfluence(confluence: ConfluenceSummary): string {
  const lines = [
    formatHeader(`Confluence: ${confluence.symbol}`),
    `Provider: ${formatProviderLabel(confluence.provider)}`,
    `Direction: ${formatSentiment(confluence.direction)}`,
    `Score: ${confluence.score}/100`,
    '',
    confluence.summary,
    '',
    chalk.bold('Signals'),
  ];

  for (const signal of confluence.signals) {
    lines.push(`  • [${signal.source}] ${signal.direction}: ${signal.detail}`);
  }

  lines.push('', formatDisclaimer());
  return lines.join('\n');
}

export function formatProviderStatus(status: ProviderStatus): string {
  return [
    formatHeader('Provider Status'),
    `Provider: ${formatProviderLabel(status.provider)}`,
    `API key configured: ${status.apiKeyConfigured ? chalk.green('yes') : chalk.yellow('no')}`,
    `Degraded (mock fallback): ${status.degraded ? chalk.yellow('yes') : chalk.green('no')}`,
    status.message ? chalk.yellow(`Note: ${status.message}`) : '',
    '',
    formatDisclaimer(),
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatHomeMenu(): string {
  return [
    formatHeader('TradiaAI TUI'),
    '',
    '  1. Morning brief',
    '  2. Analyze ticker',
    '  3. Unusual flow',
    '  4. Dark pool context',
    '  5. Congress trades',
    '  6. Insider activity',
    '  7. Bullish/bearish confluence',
    '  8. Provider status',
    '  9. Exit',
    '',
    'Enter a number (1-9) or press Ctrl+C to quit.',
  ].join('\n');
}

function formatProviderLabel(provider: string): string {
  return provider === 'mock' ? chalk.yellow('mock') : chalk.green(provider);
}

function formatSentiment(sentiment: string): string {
  switch (sentiment) {
    case 'bullish':
    case 'buying':
      return chalk.green(sentiment);
    case 'bearish':
    case 'selling':
      return chalk.red(sentiment);
    case 'mixed':
      return chalk.yellow(sentiment);
    default:
      return chalk.dim(sentiment);
  }
}