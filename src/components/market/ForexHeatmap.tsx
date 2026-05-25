/**
 * Forex Strength Heatmap
 * 
 * Visual heatmap showing currency strength/weakness.
 * Monochrome design with intensity-based shading.
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyStrength, ForexPair, getCurrencyStrengthColor } from '@/lib/market/forex-market-data';

interface ForexHeatmapProps {
  currencies: CurrencyStrength[];
  pairs: ForexPair[];
}

export default function ForexHeatmap({ 
  currencies,
  pairs 
}: ForexHeatmapProps): React.ReactElement {
  // Major currency pairs for the matrix
  const matrixPairs = [
    { base: 'EUR', quote: 'USD' },
    { base: 'GBP', quote: 'USD' },
    { base: 'USD', quote: 'JPY' },
    { base: 'AUD', quote: 'USD' },
    { base: 'USD', quote: 'CAD' },
    { base: 'USD', quote: 'CHF' },
    { base: 'NZD', quote: 'USD' },
    { base: 'GBP', quote: 'JPY' },
  ];

  const getStrengthForCurrency = (currency: string): CurrencyStrength | undefined => {
    return currencies.find(c => c.currency === currency);
  };

  const getStrengthIntensity = (strength: number): string => {
    // Normalize to 0-100 for opacity
    const normalized = Math.abs(strength);
    if (normalized > 70) return 'opacity-100';
    if (normalized > 40) return 'opacity-70';
    if (normalized > 20) return 'opacity-50';
    return 'opacity-30';
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength > 50) return 'Strong';
    if (strength > 20) return 'Firm';
    if (strength > -20) return 'Neutral';
    if (strength > -50) return 'Soft';
    return 'Weak';
  };

  return (
    <Card className="border-none bg-[#161B22] shadow-sm ring-1 ring-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base">Currency Strength Heatmap</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Currency Strength Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
          {currencies.map((currency) => {
            const strengthData = getStrengthForCurrency(currency.currency);
            const strength = strengthData?.strength || 0;
            
            return (
              <div
                key={currency.currency}
                className={`
                  relative p-3 rounded-lg text-center transition-all
                  ${strength > 0 ? 'bg-white' : 'bg-gray-700'}
                  ${getStrengthIntensity(strength)}
                `}
              >
                <div className={`font-bold text-sm ${strength > 0 ? 'text-black' : 'text-white'}`}>
                  {currency.currency}
                </div>
                <div className={`text-xs mt-1 ${strength > 0 ? 'text-gray-600' : 'text-gray-300'}`}>
                  {strength > 0 ? '+' : ''}{strength}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mb-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white opacity-100 rounded" />
            <span>Strong</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white opacity-50 rounded" />
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-700 opacity-100 rounded" />
            <span>Weak</span>
          </div>
        </div>

        {/* Pair Matrix */}
        <div className="border-t border-gray-800 pt-4">
          <h4 className="text-sm text-gray-400 mb-3">Pair Strength Matrix</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {matrixPairs.map((pair) => {
              const baseStrength = getStrengthForCurrency(pair.base)?.strength || 0;
              const quoteStrength = getStrengthForCurrency(pair.quote)?.strength || 0;
              const pairStrength = baseStrength - quoteStrength;
              
              return (
                <div
                  key={`${pair.base}${pair.quote}`}
                  className={`
                    p-2 rounded text-center text-xs
                    ${pairStrength > 20 ? 'bg-white text-black' : 
                      pairStrength < -20 ? 'bg-gray-600 text-white' : 
                      'bg-gray-800 text-gray-400'}
                  `}
                >
                  <div className="font-medium">{pair.base}{pair.quote}</div>
                  <div className="text-xs opacity-70 mt-0.5">
                    {pairStrength > 0 ? '+' : ''}{pairStrength}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
