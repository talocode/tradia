/**
 * Market Watchlist
 *
 * Watchlist panel for prop firm instruments with trend and risk indicators.
 * Click to update TradingView chart symbol.
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WatchlistItem, getRiskLabelColor } from '@/lib/market/forex-market-data';
import { 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertCircle,
  BarChart3 
} from 'lucide-react';

interface MarketWatchlistProps {
  items: WatchlistItem[];
  selectedSymbol?: string;
  onSelectSymbol: (symbol: string) => void;
}

export default function MarketWatchlist({
  items,
  selectedSymbol,
  onSelectSymbol,
}: MarketWatchlistProps): React.ReactElement {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'uptrend':
        return <TrendingUp className="w-3 h-3" />;
      case 'downtrend':
        return <TrendingDown className="w-3 h-3" />;
      case 'breakout':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'uptrend':
        return 'text-white';
      case 'downtrend':
        return 'text-gray-400';
      case 'breakout':
        return 'text-white font-bold';
      default:
        return 'text-gray-500';
    }
  };

  const getVolatilityDots = (volatility: string): string => {
    switch (volatility) {
      case 'high':
        return '●●●';
      case 'medium':
        return '●●○';
      default:
        return '●○○';
    }
  };

  return (
    <Card className="border-none bg-[#161B22] shadow-sm ring-1 ring-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Watchlist
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-800">
          {items.map((item) => {
            const isSelected = selectedSymbol === item.symbol;

            return (
              <div
                key={item.symbol}
                onClick={() => onSelectSymbol(item.symbol)}
                className={`
                  p-3 cursor-pointer transition-all
                  ${isSelected 
                    ? 'bg-white dark:bg-white' 
                    : 'hover:bg-[#1c2128]'}
                `}
              >
                {/* Symbol and Alert */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${
                      isSelected ? 'text-black' : 'text-white'
                    }`}>
                      {item.symbol}
                    </span>
                    {item.alertLevel && item.alertLevel !== 'none' && (
                      <div className={`w-2 h-2 rounded-full ${
                        item.alertLevel === 'alert' 
                          ? 'bg-white animate-pulse' 
                          : 'bg-gray-400'
                      }`} />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSymbol(item.symbol);
                    }}
                    className={`
                      h-6 px-2 text-xs
                      ${isSelected 
                        ? 'text-black hover:bg-gray-200' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                    `}
                  >
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Chart
                  </Button>
                </div>

                {/* Display Name */}
                <p className={`text-xs mb-2 truncate ${
                  isSelected ? 'text-gray-600' : 'text-gray-500'
                }`}>
                  {item.displayName}
                </p>

                {/* Indicators Row */}
                <div className="flex items-center justify-between">
                  {/* Trend */}
                  <div className={`flex items-center gap-1 ${getTrendColor(item.trendState)}`}>
                    {getTrendIcon(item.trendState)}
                    <span className={`text-xs capitalize ${isSelected ? 'text-gray-700' : ''}`}>
                      {item.trendState}
                    </span>
                  </div>

                  {/* Volatility */}
                  <span className={`text-xs ${isSelected ? 'text-gray-500' : 'text-gray-600'}`}>
                    {getVolatilityDots(item.volatility)}
                  </span>

                  {/* Risk Label */}
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getRiskLabelColor(item.riskLabel)}`}
                  >
                    {item.riskLabel}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
