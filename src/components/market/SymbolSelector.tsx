'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MarketSymbol } from '@/lib/market-data/types';

interface SymbolSelectorProps {
  symbols: MarketSymbol[];
  value: string;
  onChange: (symbol: string) => void;
  disabled?: boolean;
}

export default function SymbolSelector({
  symbols,
  value,
  onChange,
  disabled = false,
}: SymbolSelectorProps): React.ReactElement {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[220px] bg-white dark:bg-[#161B22] border-gray-200 dark:border-[#2a2f3a]">
        <SelectValue placeholder="Select symbol" />
      </SelectTrigger>
      <SelectContent>
        {symbols.map((entry) => (
          <SelectItem key={entry.symbol} value={entry.symbol}>
            {entry.displayName} ({entry.symbol})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}