/**
 * Market Overview Cards
 * 
 * Displays key forex pairs with price, change, and session info.
 * Monochrome design following TradiaAI theme.
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ForexPair, getVolatilityColor, getTrendBadgeColor } from '@/lib/market/forex-market-data';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketOverviewCardsProps {
  pairs: ForexPair[];
  onSelectPair?: (symbol: string) => void;
  selectedPair?: string;
}

export default function MarketOverviewCards({ 
  pairs, 
  onSelectPair,
  selectedPair 
}: MarketOverviewCardsProps): React.ReactElement {
  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toFixed(5);
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {pairs.map((pair) => {
        const isPositive = pair.changePercent >= 0;
        const isSelected = selectedPair === pair.symbol;

        return (
          <Card
            key={pair.symbol}
            onClick={() => onSelectPair?.(pair.symbol)}
            className={`
              border-none cursor-pointer transition-all duration-200
              ${isSelected 
                ? 'bg-white text-black dark:bg-white dark:text-black shadow-lg ring-2 ring-white' 
                : 'bg-[#161B22] hover:bg-[#1c2128] ring-1 ring-gray-800'
              }
            `}
          >
            <CardContent className="p-4">
              {/* Symbol and Trend Icon */}
              <div className="flex items-center justify-between mb-2">
                <span className={`font-bold text-sm ${isSelected ? 'text-black' : 'text-white'}`}>
                  {pair.symbol}
                </span>
                <div className={`flex items-center gap-1 ${isSelected ? 'text-black' : 'text-gray-400'}`}>
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                </div>
              </div>

              {/* Display Name */}
              <p className={`text-xs mb-3 truncate ${isSelected ? 'text-gray-600' : 'text-gray-400'}`}>
                {pair.displayName}
              </p>

              {/* Price */}
              <div className="mb-2">
                <span className={`text-lg font-mono font-bold ${isSelected ? 'text-black' : 'text-white'}`}>
                  {formatPrice(pair.price)}
                </span>
              </div>

              {/* Change Percent */}
              <div className="flex items-center gap-2 mb-3">
                <Badge 
                  variant="secondary"
                  className={`
                    text-xs px-1.5 py-0.5
                    ${isPositive 
                      ? (isSelected ? 'bg-gray-200 text-black' : 'bg-gray-700 text-white') 
                      : (isSelected ? 'bg-gray-400 text-white' : 'bg-gray-500 text-white')
                    }
                  `}
                >
                  {formatChange(pair.changePercent)}
                </Badge>
              </div>

              {/* Session Note */}
              <div className="flex items-center gap-1.5">
                <Activity className={`w-3 h-3 ${isSelected ? 'text-gray-500' : 'text-gray-500'}`} />
                <span className={`text-xs truncate ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                  {pair.sessionNote}
                </span>
              </div>

              {/* Volatility Badge */}
              <div className="mt-3">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${isSelected ? 'border-gray-400 text-gray-600' : 'border-gray-700 text-gray-400'}`}
                >
                  {pair.volatility} vol
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
