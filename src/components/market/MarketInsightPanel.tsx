'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Brain, Clock, TrendingUp } from 'lucide-react';
import type { MarketQuote } from '@/lib/market-data/types';

interface MarketInsightPanelProps {
  symbol: string;
  quote: MarketQuote | null;
  providerLabel: string;
  degraded?: boolean;
}

function getSessionContext(): { label: string; note: string } {
  const hour = new Date().getUTCHours();
  if (hour >= 0 && hour < 8) {
    return { label: 'Asia session', note: 'Lower liquidity — widen stops and reduce size.' };
  }
  if (hour >= 8 && hour < 13) {
    return { label: 'London session', note: 'Major FX pairs typically see higher volume.' };
  }
  if (hour >= 13 && hour < 17) {
    return { label: 'London / NY overlap', note: 'Peak volatility window — respect drawdown limits.' };
  }
  if (hour >= 13 && hour < 22) {
    return { label: 'New York session', note: 'US equities and indices often drive risk sentiment.' };
  }
  return { label: 'Off-hours', note: 'Thinner markets — avoid chasing breakouts without confirmation.' };
}

function getVolatilityContext(quote: MarketQuote | null): string {
  if (!quote) {
    return 'Volatility context will appear once live quote data is available.';
  }

  const range = quote.high - quote.low;
  const rangePct = quote.price > 0 ? (range / quote.price) * 100 : 0;

  if (rangePct > 1.5) {
    return `Elevated intraday range (~${rangePct.toFixed(2)}%). Consider smaller position size.`;
  }
  if (rangePct > 0.5) {
    return `Moderate intraday range (~${rangePct.toFixed(2)}%). Standard risk rules apply.`;
  }
  return `Compressed intraday range (~${rangePct.toFixed(2)}%). Watch for expansion near session opens.`;
}

export default function MarketInsightPanel({
  symbol,
  quote,
  providerLabel,
  degraded = false,
}: MarketInsightPanelProps): React.ReactElement {
  const session = getSessionContext();

  return (
    <Card className="border-gray-200 dark:border-[#2a2f3a] bg-white dark:bg-[#161B22]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
            <Brain className="w-4 h-4" />
            Trade Intelligence
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {providerLabel}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Placeholder insights — not live AI analysis. Connected to your journal in future releases.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {degraded && (
          <div className="rounded-lg border border-amber-300/40 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
            MVP data feed active. Configure FINNHUB_API_KEY for live market data.
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
            <TrendingUp className="w-4 h-4" />
            Volatility context
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{getVolatilityContext(quote)}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
            <Clock className="w-4 h-4" />
            Session context
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{session.label}:</span> {session.note}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
            <AlertTriangle className="w-4 h-4" />
            Risk reminder
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Review your prop firm drawdown and recent {symbol.split(':').pop()} journal performance
            before adding size. TradiaAI charts support decisions — they do not replace your plan.
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
          Trade markers coming soon — entry, exit, stop loss, and take profit overlays from your journal.
        </div>
      </CardContent>
    </Card>
  );
}