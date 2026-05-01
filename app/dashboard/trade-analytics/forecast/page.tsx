"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2, RefreshCcw, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type ForecastResponse = {
    pair: string;
    horizonHours: number;
    direction: "bullish" | "bearish" | "neutral";
    confidence: number;
    summary: string;
    metrics: {
        totalTrades: number;
        winRate: number;
        avgPnl: number;
        profitFactor: number;
        recentMomentum: number;
    };
    scenarios: {
        baseCase: string;
        upsideCase: string;
        downsideCase: string;
    };
    risks: string[];
    blend: {
        components: {
            tradeSignalScore: number;
            marketBiasScore: number;
            eventRiskPenalty: number;
        };
        weights: {
            tradeSignal: number;
            marketBias: number;
        };
        weightedScore: number;
        conflict: boolean;
        agreement: "aligned" | "conflict" | "partial" | "insufficient_data";
        eventRiskAction: "proceed" | "size_down" | "wait";
        eventRiskSummary: string;
        marketBiasDirection?: "bullish" | "bearish" | "neutral";
        marketBiasConfidence?: number;
        tradeDirection?: "bullish" | "bearish" | "neutral";
        confidenceAdjustments: {
            conflictPenalty: number;
            eventPenalty: number;
        };
    };
    symbols: string[];
    generatedAt: string;
};

export default function AnalyticsForecastPage() {
    const [pair, setPair] = useState("");
    const [horizon, setHorizon] = useState("24");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [forecast, setForecast] = useState<ForecastResponse | null>(null);

    const directionIcon = useMemo(() => {
        if (!forecast) return <Brain className="w-5 h-5 text-blue-500" />;
        if (forecast.direction === "bullish") return <TrendingUp className="w-5 h-5 text-green-500" />;
        if (forecast.direction === "bearish") return <TrendingDown className="w-5 h-5 text-red-500" />;
        return <Brain className="w-5 h-5 text-blue-500" />;
    }, [forecast]);

    const loadForecast = async (pairArg = pair, horizonArg = horizon) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (pairArg.trim()) params.set("pair", pairArg.trim().toUpperCase());
            params.set("horizon", horizonArg);

            const response = await fetch(`/api/trade-forecast?${params.toString()}`);
            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload?.error || "Failed to load forecast");
            }

            setForecast(payload as ForecastResponse);
            if (!pairArg && Array.isArray(payload?.symbols) && payload.symbols.length) {
                setPair(payload.symbols[0]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load forecast");
            setForecast(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadForecast();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {directionIcon}
                        AI Forecast Panel
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Pair</label>
                            <input
                                value={pair}
                                onChange={(e) => setPair(e.target.value)}
                                placeholder="e.g. EURUSD"
                                className="w-full rounded-md border px-3 py-2 bg-background"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Horizon</label>
                            <select
                                value={horizon}
                                onChange={(e) => setHorizon(e.target.value)}
                                className="w-full rounded-md border px-3 py-2 bg-background"
                            >
                                <option value="6">6h</option>
                                <option value="12">12h</option>
                                <option value="24">24h</option>
                                <option value="48">48h</option>
                                <option value="72">72h</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={() => void loadForecast()} className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    {loading && !forecast ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating personalized forecast...
                        </div>
                    ) : null}

                    {forecast ? (
                        <div className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">
                                    Pair: <span className="font-medium text-foreground">{forecast.pair}</span> | Direction:{" "}
                                    <span className="font-medium text-foreground capitalize">{forecast.direction}</span> | Confidence:{" "}
                                    <span className="font-medium text-foreground">{forecast.confidence}%</span>
                                </p>
                                <p className="mt-2 text-sm">{forecast.summary}</p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Generated: {new Date(forecast.generatedAt).toLocaleString()}
                                </p>
                            </div>

                            <div className="grid gap-3 md:grid-cols-5">
                                <Metric label="Trades" value={forecast.metrics.totalTrades} />
                                <Metric label="Win Rate" value={`${forecast.metrics.winRate}%`} />
                                <Metric label="Avg PnL" value={forecast.metrics.avgPnl} />
                                <Metric label="Profit Factor" value={forecast.metrics.profitFactor} />
                                <Metric label="Momentum" value={forecast.metrics.recentMomentum} />
                            </div>

                            <div className="rounded-lg border p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold">Signal Composition</p>
                                    <p className="text-xs text-muted-foreground">
                                        Agreement: <span className="capitalize">{forecast.blend.agreement.replace("_", " ")}</span>
                                    </p>
                                </div>
                                <div className="grid gap-3 md:grid-cols-4">
                                    <Metric label="Trade Signal" value={forecast.blend.components.tradeSignalScore} />
                                    <Metric label="Market Bias" value={forecast.blend.components.marketBiasScore} />
                                    <Metric label="Event Penalty" value={`-${forecast.blend.components.eventRiskPenalty}`} />
                                    <Metric label="Weighted Score" value={forecast.blend.weightedScore} />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Weights: Trade {forecast.blend.weights.tradeSignal} / Market {forecast.blend.weights.marketBias}
                                </p>
                                <p className="text-sm">{forecast.blend.eventRiskSummary}</p>
                            </div>

                            {forecast.blend.conflict ? (
                                <div className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                                    Signal conflict detected: trade direction and market-bias direction disagree. Confidence reduced by{" "}
                                    {forecast.blend.confidenceAdjustments.conflictPenalty} points.
                                </div>
                            ) : null}

                            {forecast.blend.eventRiskAction !== "proceed" ? (
                                <div className="rounded-md border border-orange-300 bg-orange-50 dark:bg-orange-950/30 px-3 py-2 text-sm text-orange-800 dark:text-orange-200">
                                    Event risk action: <span className="font-semibold">{forecast.blend.eventRiskAction}</span>. Confidence adjusted by{" "}
                                    {forecast.blend.confidenceAdjustments.eventPenalty} points.
                                </div>
                            ) : null}

                            <div className="grid gap-3 lg:grid-cols-3">
                                <Scenario title="Base Case" body={forecast.scenarios.baseCase} />
                                <Scenario title="Upside Case" body={forecast.scenarios.upsideCase} />
                                <Scenario title="Downside Case" body={forecast.scenarios.downsideCase} />
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-1">Risk Flags</p>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                    {forecast.risks.map((risk) => (
                                        <li key={risk}>{risk}</li>
                                    ))}
                                </ul>
                            </div>

                            {forecast.symbols.length ? (
                                <p className="text-xs text-muted-foreground">
                                    Available symbols from your history: {forecast.symbols.join(", ")}
                                </p>
                            ) : null}
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg border p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-lg font-semibold">{value}</p>
        </div>
    );
}

function Scenario({ title, body }: { title: string; body: string }) {
    return (
        <div className="rounded-lg border p-3">
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        </div>
    );
}
