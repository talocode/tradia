import ora from 'ora';
import {
  getMarketIntelligenceProvider,
  getProviderStatus,
  validateTickerSymbol,
} from './market-intelligence/index.js';
import {
  formatConfluence,
  formatCongress,
  formatDarkPool,
  formatFlow,
  formatInsider,
  formatMorningBrief,
  formatProviderStatus,
  formatTickerAnalysis,
} from './lib/format.js';

async function withSpinner<T>(label: string, task: () => Promise<T>): Promise<T> {
  const spinner = ora(label).start();
  try {
    const result = await task();
    spinner.succeed();
    return result;
  } catch (error) {
    spinner.fail();
    throw error;
  }
}

export async function runBrief(): Promise<string> {
  const { provider } = getMarketIntelligenceProvider();
  const brief = await withSpinner('Fetching morning brief...', () =>
    provider.getMorningBrief()
  );
  return formatMorningBrief(brief);
}

export async function runTicker(symbol: string): Promise<string> {
  const validation = validateTickerSymbol(symbol);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const { provider } = getMarketIntelligenceProvider();
  const analysis = await withSpinner(`Analyzing ${validation.symbol}...`, () =>
    provider.analyzeTicker({ symbol: validation.symbol! })
  );
  return formatTickerAnalysis(analysis);
}

export async function runFlow(symbol: string): Promise<string> {
  const validation = validateTickerSymbol(symbol);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const { provider } = getMarketIntelligenceProvider();
  const flow = await withSpinner(`Fetching unusual flow for ${validation.symbol}...`, () =>
    provider.getUnusualFlow({ symbol: validation.symbol! })
  );
  return formatFlow(flow);
}

export async function runDarkPool(symbol: string): Promise<string> {
  const validation = validateTickerSymbol(symbol);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const { provider } = getMarketIntelligenceProvider();
  const dark = await withSpinner(`Fetching dark pool context for ${validation.symbol}...`, () =>
    provider.getDarkPoolContext({ symbol: validation.symbol! })
  );
  return formatDarkPool(dark);
}

export async function runCongress(symbol: string): Promise<string> {
  const validation = validateTickerSymbol(symbol);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const { provider } = getMarketIntelligenceProvider();
  const congress = await withSpinner(`Fetching congress trades for ${validation.symbol}...`, () =>
    provider.getCongressTrades({ symbol: validation.symbol! })
  );
  return formatCongress(congress);
}

export async function runInsider(symbol: string): Promise<string> {
  const validation = validateTickerSymbol(symbol);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const { provider } = getMarketIntelligenceProvider();
  const insider = await withSpinner(`Fetching insider activity for ${validation.symbol}...`, () =>
    provider.getInsiderActivity({ symbol: validation.symbol! })
  );
  return formatInsider(insider);
}

export async function runConfluence(
  symbol: string,
  direction?: 'bullish' | 'bearish'
): Promise<string> {
  const validation = validateTickerSymbol(symbol);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const { provider } = getMarketIntelligenceProvider();
  const confluence = await withSpinner(`Computing confluence for ${validation.symbol}...`, () =>
    provider.getConfluence({
      symbol: validation.symbol!,
      direction,
    })
  );
  return formatConfluence(confluence);
}

export function runConfig(): string {
  return formatProviderStatus(getProviderStatus());
}