import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createClient } from "@/utils/supabase/server";
import { evaluateEventRisk } from "@/lib/forex/eventAwarenessService";
import type { EconomicEvent, EventRiskAction } from "@/types/eventAwareness";
import type { BiasDirection } from "@/types/marketBias";

export const dynamic = "force-dynamic";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeOutcome = (value: unknown) => String(value || "").trim().toLowerCase();
const mapImpact = (value: unknown): EconomicEvent["impact"] => {
  const candidate = String(value || "").trim().toLowerCase();
  if (candidate === "high" || candidate === "medium" || candidate === "low") return candidate;
  return "medium";
};

const directionToScore = (value: BiasDirection | "neutral"): number => {
  if (value === "bullish") return 1;
  if (value === "bearish") return -1;
  return 0;
};

const scoreToDirection = (value: number): "bullish" | "bearish" | "neutral" => {
  if (value > 0.2) return "bullish";
  if (value < -0.2) return "bearish";
  return "neutral";
};

const riskPenaltyMap: Record<EventRiskAction, number> = {
  proceed: 0,
  size_down: 0.55,
  wait: 1.1,
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pair = request.nextUrl.searchParams.get("pair")?.trim().toUpperCase() || null;
    const horizonRaw = Number(request.nextUrl.searchParams.get("horizon") || "24");
    const horizonHours = clamp(Number.isFinite(horizonRaw) ? horizonRaw : 24, 1, 72);

    const supabase = createClient();
    let query = supabase
      .from("trades")
      .select("symbol, pnl, outcome, closeTime, closetime, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(300);

    if (pair) {
      query = query.ilike("symbol", pair);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const trades = data || [];
    const tradeSymbolCounts = new Map<string, number>();
    const symbols = Array.from(
      new Set(
        trades
          .map((trade) => String(trade.symbol || "").toUpperCase().trim())
          .filter(Boolean)
      )
    ).slice(0, 20);

    for (const symbol of trades.map((trade) => String(trade.symbol || "").toUpperCase().trim()).filter(Boolean)) {
      tradeSymbolCounts.set(symbol, (tradeSymbolCounts.get(symbol) || 0) + 1);
    }

    const inferredPair =
      pair ||
      Array.from(tradeSymbolCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      null;

    const nowIso = new Date().toISOString();

    if (!trades.length) {
      return NextResponse.json({
        pair: pair || "ALL",
        horizonHours,
        direction: "neutral",
        confidence: 40,
        summary: "Not enough trades yet. Log more history to unlock a personalized forecast.",
        metrics: {
          totalTrades: 0,
          winRate: 0,
          avgPnl: 0,
          profitFactor: 0,
          recentMomentum: 0,
        },
        scenarios: {
          baseCase: "Start with one setup and review outcomes after each session.",
          upsideCase: "Consistency can improve quickly once enough data is collected.",
          downsideCase: "Low sample size increases variance and overfitting risk.",
        },
        risks: ["Insufficient sample size"],
        blend: {
          components: {
            tradeSignalScore: 0,
            marketBiasScore: 0,
            eventRiskPenalty: 0,
          },
          weights: {
            tradeSignal: 0.6,
            marketBias: 0.4,
          },
          weightedScore: 0,
          conflict: false,
          agreement: "insufficient_data",
          eventRiskAction: "proceed",
          eventRiskSummary: "No event context available yet.",
          confidenceAdjustments: {
            conflictPenalty: 0,
            eventPenalty: 0,
          },
        },
        symbols,
        generatedAt: nowIso,
      });
    }

    const totalTrades = trades.length;
    const winningTrades = trades.filter((trade) => normalizeOutcome(trade.outcome) === "win");
    const losingTrades = trades.filter((trade) => normalizeOutcome(trade.outcome) === "loss");

    const winRate = totalTrades ? (winningTrades.length / totalTrades) * 100 : 0;
    const totalPnl = trades.reduce((sum, trade) => sum + toNumber(trade.pnl), 0);
    const avgPnl = totalTrades ? totalPnl / totalTrades : 0;

    const grossProfit = winningTrades.reduce((sum, trade) => sum + Math.max(0, toNumber(trade.pnl)), 0);
    const grossLoss = Math.abs(
      losingTrades.reduce((sum, trade) => sum + Math.min(0, toNumber(trade.pnl)), 0)
    );
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 3 : 0;

    const recentWindow = trades.slice(0, 20);
    const priorWindow = trades.slice(20, 40);
    const recentAvg = recentWindow.length
      ? recentWindow.reduce((sum, trade) => sum + toNumber(trade.pnl), 0) / recentWindow.length
      : 0;
    const priorAvg = priorWindow.length
      ? priorWindow.reduce((sum, trade) => sum + toNumber(trade.pnl), 0) / priorWindow.length
      : 0;
    const recentMomentum = recentAvg - priorAvg;

    const winRateScore = (winRate - 50) / 10;
    const pfScore = (profitFactor - 1.1) * 2;
    const pnlScore = avgPnl >= 0 ? 1 : -1;
    const momentumScore = recentMomentum >= 0 ? 1 : -1;
    const composite = winRateScore + pfScore + pnlScore + momentumScore;
    const normalizedTradeSignal = clamp(composite / 4, -1, 1);
    const tradeDirection = scoreToDirection(normalizedTradeSignal);
    const consistencyBoost = clamp(totalTrades / 6, 0, 20);
    let confidenceBase = 45 + Math.abs(composite) * 8 + consistencyBoost;

    let marketBiasScore = 0;
    let marketBiasDirection: "bullish" | "bearish" | "neutral" = "neutral";
    let marketBiasConfidence = 0;

    if (inferredPair) {
      const { data: biasData } = await supabase
        .from("market_bias_reports")
        .select("bias_direction, confidence_score, created_at")
        .eq("user_id", userId)
        .eq("pair_symbol_snapshot", inferredPair)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (biasData) {
        marketBiasDirection = (String(biasData.bias_direction || "neutral").toLowerCase() as
          | "bullish"
          | "bearish"
          | "neutral");
        marketBiasConfidence = clamp(toNumber(biasData.confidence_score), 0, 100);
        marketBiasScore = directionToScore(marketBiasDirection) * (marketBiasConfidence / 100);
      }
    }

    let eventRiskAction: EventRiskAction = "proceed";
    let eventRiskSummary = "No critical event conflicts detected in the planned execution window.";
    let eventPenalty = 0;
    const plannedAt = nowIso;

    if (inferredPair) {
      const { data: pairData } = await supabase
        .from("forex_pairs")
        .select("base_currency, quote_currency")
        .eq("symbol", inferredPair)
        .eq("is_active", true)
        .maybeSingle();

      if (pairData?.base_currency && pairData?.quote_currency) {
        const plannedDate = new Date(plannedAt);
        const windowStart = new Date(plannedDate.getTime() - 2 * 60 * 60 * 1000).toISOString();
        const windowEnd = new Date(plannedDate.getTime() + horizonHours * 60 * 60 * 1000).toISOString();

        const eventsResult = await supabase
          .from("economic_events")
          .select("id, title, currency, country, impact, scheduled_at")
          .in("currency", [pairData.base_currency, pairData.quote_currency])
          .gte("scheduled_at", windowStart)
          .lte("scheduled_at", windowEnd)
          .order("scheduled_at", { ascending: true });

        const mappedEvents: EconomicEvent[] = eventsResult.error
          ? []
          : (eventsResult.data || []).map((event) => ({
              id: String(event.id),
              title: String(event.title || "Untitled event"),
              currency: String(event.currency || "").toUpperCase(),
              country: event.country ? String(event.country) : null,
              impact: mapImpact(event.impact),
              scheduled_at: String(event.scheduled_at),
            }));

        const eventRisk = evaluateEventRisk(mappedEvents, plannedAt, inferredPair);
        eventRiskAction = eventRisk.action;
        eventRiskSummary = eventRisk.summary;
        eventPenalty = riskPenaltyMap[eventRiskAction];
      }
    }

    const weights = {
      tradeSignal: 0.6,
      marketBias: 0.4,
    } as const;
    const weightedScoreRaw =
      normalizedTradeSignal * weights.tradeSignal + marketBiasScore * weights.marketBias - eventPenalty;
    const weightedScore = clamp(weightedScoreRaw, -1, 1);
    const direction = scoreToDirection(weightedScore);

    const conflict =
      tradeDirection !== "neutral" &&
      marketBiasDirection !== "neutral" &&
      tradeDirection !== marketBiasDirection;
    const agreement =
      tradeDirection === "neutral" || marketBiasDirection === "neutral"
        ? "partial"
        : conflict
          ? "conflict"
          : "aligned";
    const conflictPenalty = conflict ? 10 : 0;

    confidenceBase -= conflictPenalty;
    confidenceBase -= eventPenalty * 12;
    if (eventRiskAction === "wait") {
      confidenceBase = Math.min(confidenceBase, 62);
    }
    const confidence = Math.round(clamp(confidenceBase, 30, 92));

    const risks: string[] = [];
    if (totalTrades < 30) risks.push("Low sample size (<30 trades)");
    if (profitFactor < 1) risks.push("Profit factor below 1.0");
    if (winRate < 45) risks.push("Win rate below 45%");
    if (recentMomentum < 0) risks.push("Recent momentum weakening");
    if (conflict) risks.push("Trade signal conflicts with latest market bias report");
    if (eventRiskAction === "size_down") risks.push("Elevated event risk: consider reduced position size");
    if (eventRiskAction === "wait") risks.push("High-impact event risk: wait before execution");
    if (!risks.length) risks.push("Market regime shifts can invalidate historical patterns");

    const summary =
      direction === "bullish"
        ? `Bias is bullish over the next ${horizonHours}h after blending performance, market bias, and event-risk context.`
        : direction === "bearish"
          ? `Bias is bearish over the next ${horizonHours}h after blending performance, market bias, and event-risk context.`
          : `Bias is neutral over the next ${horizonHours}h. Blended context is mixed, so prioritize selective setups.`;

    return NextResponse.json({
      pair: inferredPair || "ALL",
      horizonHours,
      direction,
      confidence,
      summary,
      metrics: {
        totalTrades,
        winRate: Number(winRate.toFixed(1)),
        avgPnl: Number(avgPnl.toFixed(2)),
        profitFactor: Number(profitFactor.toFixed(2)),
        recentMomentum: Number(recentMomentum.toFixed(2)),
      },
      scenarios: {
        baseCase:
          direction === "bullish"
            ? "Maintain current risk and focus on A+ setups in trend direction."
            : direction === "bearish"
              ? "Cut size by 25-50% and trade only clear confirmations."
              : "Trade reduced frequency until a stronger directional edge appears.",
        upsideCase:
          direction === "bullish"
            ? "If win rate holds above 55%, gradual scale-up is justified."
            : "If momentum flips positive for two sessions, confidence can recover.",
        downsideCase:
          direction === "bearish"
            ? "Further drawdown likely if revenge trades continue."
            : "Ignoring risk limits can turn neutral expectancy negative quickly.",
      },
      risks,
      blend: {
        components: {
          tradeSignalScore: Number(normalizedTradeSignal.toFixed(2)),
          marketBiasScore: Number(marketBiasScore.toFixed(2)),
          eventRiskPenalty: Number(eventPenalty.toFixed(2)),
        },
        weights,
        weightedScore: Number(weightedScore.toFixed(2)),
        conflict,
        agreement,
        eventRiskAction,
        eventRiskSummary,
        marketBiasDirection,
        marketBiasConfidence: Number(marketBiasConfidence.toFixed(1)),
        tradeDirection,
        confidenceAdjustments: {
          conflictPenalty,
          eventPenalty: Number((eventPenalty * 12).toFixed(1)),
        },
      },
      symbols,
      generatedAt: nowIso,
    });
  } catch (error) {
    console.error("GET /api/trade-forecast failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
