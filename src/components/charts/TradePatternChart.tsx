// src/components/charts/TradePatternChart.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import Spinner from "@/components/ui/spinner";

const PieChartWrapper = dynamic(
  () => import("@/components/charts/PieChartWrapper"),
  { 
    ssr: false,
    loading: () => <div className="h-96 flex items-center justify-center"><Spinner /></div>
  }
);

type TradeForPattern = {
  profit?: number | string;
};

interface TradePatternChartProps {
  trades?: ReadonlyArray<TradeForPattern>;
}

export default function TradePatternChart({
  trades = [],
}: TradePatternChartProps): React.ReactElement {
  if (!Array.isArray(trades) || trades.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No trade data to analyze patterns.
      </div>
    );
  }

  return <PieChartWrapper trades={trades} />;
}