'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type IPriceLine,
  type CandlestickData,
  type Time,
} from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import type { MarketCandle, MarketQuote, MarketResolution } from '@/lib/market-data/types';
import type { Trade } from '@/types/trade';
import { tradeSymbolMatchesMarket } from '@/lib/market-data/symbols';

const TIMEFRAMES: { label: string; resolution: MarketResolution; seconds: number }[] = [
  { label: '1m', resolution: '1', seconds: 60 * 60 * 6 },
  { label: '5m', resolution: '5', seconds: 60 * 60 * 24 },
  { label: '15m', resolution: '15', seconds: 60 * 60 * 24 * 3 },
  { label: '1H', resolution: '60', seconds: 60 * 60 * 24 * 7 },
  { label: '1D', resolution: 'D', seconds: 60 * 60 * 24 * 30 },
];

const POLL_INTERVAL_MS = 30_000;

interface MarketChartProps {
  symbol: string;
  providerLabel: string;
  degraded?: boolean;
  trades?: Trade[];
}

interface MarketApiMeta {
  provider: string;
  degraded: boolean;
  message?: string;
}

function toChartCandles(candles: MarketCandle[]): CandlestickData<Time>[] {
  return candles.map((candle) => ({
    time: candle.time as Time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  }));
}

export default function MarketChart({
  symbol,
  providerLabel,
  degraded = false,
  trades = [],
}: MarketChartProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);

  const [timeframe, setTimeframe] = useState(TIMEFRAMES[1]);
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [meta, setMeta] = useState<MarketApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMarketData = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const now = Math.floor(Date.now() / 1000);
        const from = now - timeframe.seconds;

        const [quoteRes, candlesRes] = await Promise.all([
          fetch(`/api/market/quote?symbol=${encodeURIComponent(symbol)}`),
          fetch(
            `/api/market/candles?symbol=${encodeURIComponent(symbol)}&resolution=${timeframe.resolution}&from=${from}&to=${now}`
          ),
        ]);

        if (!quoteRes.ok) {
          const body = await quoteRes.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to load quote');
        }
        if (!candlesRes.ok) {
          const body = await candlesRes.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to load candles');
        }

        const quotePayload = await quoteRes.json();
        const candlesPayload = await candlesRes.json();

        setQuote(quotePayload.quote);
        setMeta(quotePayload.meta ?? candlesPayload.meta ?? null);

        const chartData = toChartCandles(candlesPayload.candles ?? []);
        if (seriesRef.current) {
          if (chartData.length === 0) {
            seriesRef.current.setData([]);
          } else {
            seriesRef.current.setData(chartData);
            chartRef.current?.timeScale().fitContent();
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load market data');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [symbol, timeframe.resolution, timeframe.seconds]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(148, 163, 184, 0.15)' },
        horzLines: { color: 'rgba(148, 163, 184, 0.15)' },
      },
      rightPriceScale: { borderColor: 'rgba(148, 163, 184, 0.2)' },
      timeScale: { borderColor: 'rgba(148, 163, 184, 0.2)' },
      autoSize: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        chart.applyOptions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    fetchMarketData();
    const interval = window.setInterval(() => fetchMarketData(true), POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [fetchMarketData]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    priceLinesRef.current.forEach((line) => {
      try {
        series.removePriceLine(line);
      } catch {
        // ignore stale lines after chart rebuild
      }
    });
    priceLinesRef.current = [];

    const matchingTrades = trades.filter((trade) =>
      tradeSymbolMatchesMarket(trade.symbol, symbol)
    );

    matchingTrades.slice(0, 5).forEach((trade) => {
      const entry = trade.entryPrice ?? trade.entry_price;
      const exit = trade.exitPrice ?? trade.exit_price;
      const stop = trade.stopLossPrice ?? trade.stop_loss_price;
      const target = trade.takeProfitPrice ?? trade.take_profit_price;

      if (typeof entry === 'number') {
        const line = series.createPriceLine({
          price: entry,
          color: '#3b82f6',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: 'Entry',
        });
        priceLinesRef.current.push(line);
      }
      if (typeof exit === 'number') {
        const line = series.createPriceLine({
          price: exit,
          color: '#a855f7',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: 'Exit',
        });
        priceLinesRef.current.push(line);
      }
      if (typeof stop === 'number') {
        const line = series.createPriceLine({
          price: stop,
          color: '#ef4444',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: 'SL',
        });
        priceLinesRef.current.push(line);
      }
      if (typeof target === 'number') {
        const line = series.createPriceLine({
          price: target,
          color: '#22c55e',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: 'TP',
        });
        priceLinesRef.current.push(line);
      }
    });
  }, [trades, symbol, loading]);

  const formatPrice = (value: number) => {
    if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (value >= 10) return value.toFixed(2);
    return value.toFixed(4);
  };

  return (
    <Card className="border-gray-200 dark:border-[#2a2f3a] bg-white dark:bg-[#161B22]">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base text-gray-900 dark:text-white">{symbol}</CardTitle>
            {quote ? (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatPrice(quote.price)}
                </span>
                <span
                  className={`text-sm font-medium ${
                    quote.change >= 0 ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {quote.change >= 0 ? '+' : ''}
                  {quote.changePercent.toFixed(2)}%
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Awaiting quote…</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{providerLabel}</Badge>
            {(degraded || meta?.degraded) && (
              <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-400/30">
                MVP data feed
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMarketData(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {TIMEFRAMES.map((frame) => (
            <Button
              key={frame.label}
              size="sm"
              variant={timeframe.label === frame.label ? 'default' : 'outline'}
              onClick={() => setTimeframe(frame)}
            >
              {frame.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative min-h-[420px] w-full">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-[#161B22]/70 rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          )}

          {error && !loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50/80 dark:bg-red-950/20 p-6 text-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <Button size="sm" variant="outline" onClick={() => fetchMarketData()}>
                Retry
              </Button>
            </div>
          )}

          <div ref={containerRef} className="h-[420px] w-full" />
        </div>

        {meta?.message && (
          <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">{meta.message}</p>
        )}
      </CardContent>
    </Card>
  );
}