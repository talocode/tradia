/**
 * Forex Market Intelligence - Mock Data
 * 
 * This file contains typed mock data for the Forex Market Intelligence page.
 * Data is structured to be easily replaced with real API providers later.
 */

// Currency strength data for heatmap
export interface CurrencyStrength {
  currency: string;
  strength: number; // -100 to +100 scale
  change24h: number;
  trend: 'strong' | 'weak' | 'neutral';
}

// Forex pair data
export interface ForexPair {
  symbol: string;
  displayName: string;
  baseCurrency: string;
  quoteCurrency: string;
  price: number;
  change24h: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volatility: 'low' | 'medium' | 'high' | 'extreme';
  trend: 'bullish' | 'bearish' | 'sideways';
  sessionNote: string;
  spread: number;
}

// Trading session data
export interface TradingSession {
  id: string;
  name: string;
  city: string;
  localStartTime: string; // HH:mm format
  localEndTime: string;
  utcOffset: number;
  status: 'active' | 'upcoming' | 'closed';
  typicalPairs: string[];
  volatilityLevel: 'low' | 'medium' | 'high';
  cautionNote: string;
}

// Watchlist item
export interface WatchlistItem {
  symbol: string;
  displayName: string;
  trendState: 'uptrend' | 'downtrend' | 'ranging' | 'breakout';
  volatility: 'low' | 'medium' | 'high';
  riskLabel: 'safe' | 'caution' | 'danger';
  alertLevel?: 'none' | 'watch' | 'alert';
}

// Risk brief item
export interface RiskBriefItem {
  id: string;
  type: 'strength' | 'volatility' | 'session' | 'general';
  priority: 'high' | 'medium' | 'low';
  message: string;
  symbol?: string;
}

// News event placeholder
export interface NewsEvent {
  id: string;
  title: string;
  impact: 'high' | 'medium' | 'low';
  time: string;
  currency: string;
  type: 'CPI' | 'FOMC' | 'NFP' | 'GDP' | 'Other';
}

// TradingView symbol mapping
export interface TradingViewSymbol {
  symbol: string;
  displayName: string;
  category: 'major' | 'minor' | 'commodity' | 'index';
}

// Mock currency strength data
export const mockCurrencyStrengths: CurrencyStrength[] = [
  { currency: 'USD', strength: 65, change24h: 0.45, trend: 'strong' },
  { currency: 'EUR', strength: -25, change24h: -0.32, trend: 'weak' },
  { currency: 'GBP', strength: 15, change24h: 0.12, trend: 'neutral' },
  { currency: 'JPY', strength: -55, change24h: -0.68, trend: 'weak' },
  { currency: 'AUD', strength: 35, change24h: 0.28, trend: 'strong' },
  { currency: 'NZD', strength: 20, change24h: 0.15, trend: 'neutral' },
  { currency: 'CAD', strength: -10, change24h: -0.08, trend: 'neutral' },
  { currency: 'CHF', strength: -35, change24h: -0.22, trend: 'weak' },
];

// Mock forex pairs data
export const mockForexPairs: ForexPair[] = [
  {
    symbol: 'EURUSD',
    displayName: 'Euro / US Dollar',
    baseCurrency: 'EUR',
    quoteCurrency: 'USD',
    price: 1.0842,
    change24h: 0.0018,
    changePercent: 0.18,
    high24h: 1.0865,
    low24h: 1.0812,
    volatility: 'medium',
    trend: 'sideways',
    sessionNote: 'London active',
    spread: 0.0001,
  },
  {
    symbol: 'GBPUSD',
    displayName: 'British Pound / US Dollar',
    baseCurrency: 'GBP',
    quoteCurrency: 'USD',
    price: 1.2735,
    change24h: 0.0042,
    changePercent: 0.33,
    high24h: 1.2780,
    low24h: 1.2680,
    volatility: 'high',
    trend: 'bullish',
    sessionNote: 'Volatile - BoE news',
    spread: 0.0002,
  },
  {
    symbol: 'USDJPY',
    displayName: 'US Dollar / Japanese Yen',
    baseCurrency: 'USD',
    quoteCurrency: 'JPY',
    price: 151.42,
    change24h: 0.85,
    changePercent: 0.56,
    high24h: 152.10,
    low24h: 150.65,
    volatility: 'high',
    trend: 'bullish',
    sessionNote: 'Asian session quiet',
    spread: 0.02,
  },
  {
    symbol: 'XAUUSD',
    displayName: 'Gold / US Dollar',
    baseCurrency: 'XAU',
    quoteCurrency: 'USD',
    price: 2345.80,
    change24h: 12.40,
    changePercent: 0.53,
    high24h: 2360.00,
    low24h: 2328.50,
    volatility: 'extreme',
    trend: 'bullish',
    sessionNote: 'High volatility period',
    spread: 0.15,
  },
  {
    symbol: 'US30',
    displayName: 'US Wall Street 30',
    baseCurrency: 'US30',
    quoteCurrency: 'USD',
    price: 39850.00,
    change24h: 125.00,
    changePercent: 0.31,
    high24h: 40100.00,
    low24h: 39600.00,
    volatility: 'medium',
    trend: 'bullish',
    sessionNote: 'Pre-market calm',
    spread: 1.5,
  },
  {
    symbol: 'NAS100',
    displayName: 'US Tech 100',
    baseCurrency: 'NAS',
    quoteCurrency: 'USD',
    price: 18520.00,
    change24h: 85.50,
    changePercent: 0.46,
    high24h: 18650.00,
    low24h: 18400.00,
    volatility: 'high',
    trend: 'bullish',
    sessionNote: 'Tech earnings week',
    spread: 1.0,
  },
];

// Mock trading sessions
export const mockTradingSessions: TradingSession[] = [
  {
    id: 'asia',
    name: 'Asia Session',
    city: 'Tokyo / Sydney',
    localStartTime: '00:00',
    localEndTime: '09:00',
    utcOffset: 0,
    status: 'closed',
    typicalPairs: ['USDJPY', 'AUDUSD', 'NZDUSD'],
    volatilityLevel: 'low',
    cautionNote: 'Lower liquidity, wider spreads',
  },
  {
    id: 'london',
    name: 'London Session',
    city: 'London',
    localStartTime: '08:00',
    localEndTime: '17:00',
    utcOffset: 0,
    status: 'active',
    typicalPairs: ['EURUSD', 'GBPUSD', 'USDCHF'],
    volatilityLevel: 'high',
    cautionNote: 'High liquidity, best for majors',
  },
  {
    id: 'newyork',
    name: 'New York Session',
    city: 'New York',
    localStartTime: '13:00',
    localEndTime: '22:00',
    utcOffset: 0,
    status: 'upcoming',
    typicalPairs: ['US30', 'NAS100', 'XAUUSD'],
    volatilityLevel: 'high',
    cautionNote: 'News events can spike volatility',
  },
  {
    id: 'overlap',
    name: 'London / NY Overlap',
    city: 'London / New York',
    localStartTime: '13:00',
    localEndTime: '17:00',
    utcOffset: 0,
    status: 'upcoming',
    typicalPairs: ['EURUSD', 'GBPUSD', 'XAUUSD'],
    volatilityLevel: 'high',
    cautionNote: 'Most volatile period - use caution',
  },
];

// Mock watchlist data
export const mockWatchlist: WatchlistItem[] = [
  { symbol: 'EURUSD', displayName: 'Euro / US Dollar', trendState: 'ranging', volatility: 'medium', riskLabel: 'safe' },
  { symbol: 'GBPUSD', displayName: 'British Pound / US Dollar', trendState: 'uptrend', volatility: 'high', riskLabel: 'caution' },
  { symbol: 'USDJPY', displayName: 'US Dollar / Japanese Yen', trendState: 'uptrend', volatility: 'medium', riskLabel: 'safe', alertLevel: 'watch' },
  { symbol: 'XAUUSD', displayName: 'Gold / US Dollar', trendState: 'breakout', volatility: 'high', riskLabel: 'danger' },
  { symbol: 'NAS100', displayName: 'US Tech 100', trendState: 'uptrend', volatility: 'high', riskLabel: 'caution' },
  { symbol: 'US30', displayName: 'US Wall Street 30', trendState: 'sideways', volatility: 'medium', riskLabel: 'safe' },
  { symbol: 'GBPJPY', displayName: 'British Pound / Japanese Yen', trendState: 'downtrend', volatility: 'high', riskLabel: 'danger', alertLevel: 'alert' },
];

// Mock prop firm risk brief
export const mockRiskBrief: RiskBriefItem[] = [
  {
    id: '1',
    type: 'strength',
    priority: 'medium',
    message: 'USD strength is mixed. Avoid forcing EURUSD if structure is unclear.',
    symbol: 'EURUSD',
  },
  {
    id: '2',
    type: 'volatility',
    priority: 'high',
    message: 'XAUUSD volatility is elevated. Reduce size around news windows.',
    symbol: 'XAUUSD',
  },
  {
    id: '3',
    type: 'session',
    priority: 'medium',
    message: 'London/New York overlap may create fakeouts. Wait for confirmation.',
  },
  {
    id: '4',
    type: 'general',
    priority: 'high',
    message: 'Respect daily drawdown before chasing high-volatility pairs.',
  },
];

// Mock news events
export const mockNewsEvents: NewsEvent[] = [
  { id: '1', title: 'US CPI Data Release', impact: 'high', time: '14:30', currency: 'USD', type: 'CPI' },
  { id: '2', title: 'FOMC Meeting Minutes', impact: 'high', time: '20:00', currency: 'USD', type: 'FOMC' },
  { id: '3', title: 'UK Employment Data', impact: 'medium', time: '08:00', currency: 'GBP', type: 'Other' },
];

// TradingView widget symbols
export const tradingViewSymbols: TradingViewSymbol[] = [
  { symbol: 'FX:EURUSD', displayName: 'EUR/USD', category: 'major' },
  { symbol: 'FX:GBPUSD', displayName: 'GBP/USD', category: 'major' },
  { symbol: 'FX:USDJPY', displayName: 'USD/JPY', category: 'major' },
  { symbol: 'OANDA:XAUUSD', displayName: 'Gold', category: 'commodity' },
  { symbol: 'CAPITALCOM:US30', displayName: 'US30', category: 'index' },
  { symbol: 'CAPITALCOM:US100', displayName: 'NAS100', category: 'index' },
];

// Helper functions
export function getCurrencyStrengthColor(strength: number): string {
  if (strength > 50) return 'bg-black dark:bg-white';
  if (strength > 0) return 'bg-gray-700 dark:bg-gray-300';
  if (strength > -50) return 'bg-gray-400 dark:bg-gray-600';
  return 'bg-gray-200 dark:bg-gray-800';
}

export function getVolatilityColor(volatility: string): string {
  switch (volatility) {
    case 'extreme':
      return 'bg-gray-900 text-white dark:bg-white dark:text-black';
    case 'high':
      return 'bg-gray-700 text-white dark:bg-gray-300 dark:text-black';
    case 'medium':
      return 'bg-gray-400 text-white dark:bg-gray-600 dark:text-white';
    default:
      return 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white';
  }
}

export function getTrendBadgeColor(trend: string): string {
  switch (trend) {
    case 'bullish':
    case 'strong':
      return 'bg-black text-white dark:bg-white dark:text-black';
    case 'bearish':
    case 'weak':
      return 'bg-gray-400 text-white dark:bg-gray-600 dark:text-white';
    default:
      return 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white';
  }
}

export function getRiskLabelColor(risk: string): string {
  switch (risk) {
    case 'danger':
      return 'bg-gray-900 text-white dark:bg-white dark:text-black';
    case 'caution':
      return 'bg-gray-500 text-white dark:bg-gray-500 dark:text-white';
    default:
      return 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white';
  }
}
