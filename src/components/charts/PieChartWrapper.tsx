// src/components/charts/PieChartWrapper.tsx
"use client";

import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

type TradeForPattern = {
  profit?: number | string;
};

interface TradePatternChartProps {
  trades: TradeForPattern[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2", "#D65DB1"];

export default function PieChartWrapper({
  trades = [],
}: TradePatternChartProps): React.ReactElement {
  if (!Array.isArray(trades) || trades.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No trade data to analyze patterns.
      </div>
    );
  }

  const toNumber = (v: number | string | undefined): number =>
    typeof v === "number" ? v : Number(v ?? 0);

  const winLossData = [
    { name: "Wins", value: trades.filter((t) => toNumber(t.profit) > 0).length },
    { name: "Losses", value: trades.filter((t) => toNumber(t.profit) <= 0).length },
  ];

  return (
    <div className="w-full h-96">
      <h2 className="text-xl font-semibold mb-4">Trade Pattern Analysis</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={winLossData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }): string =>
              `${name}: ${percent !== undefined ? (percent * 100).toFixed(0) : "0"}%`
            }
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {winLossData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}