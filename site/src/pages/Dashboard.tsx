import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { Lock, Star } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import SiteHeader from "../components/SiteHeader";
import PageSeo from "../components/seo/PageSeo";
import leaderboardRows from "../data/leaderboard_v3_3.json";
import clusterInsightRows from "../data/v4_0_cluster_insights.json";
import { useDiscoveryOpportunities, type DiscoveryOpportunity } from "../hooks/useDiscoveryOpportunities";
import { useInsightClusters, type Insight, type InsightCluster, type InsightType } from "../hooks/useInsightClusters";
import { useWatchlist } from "../hooks/useWatchlist";
import { cn } from "../lib/utils";

type LeaderboardRow = {
  cluster_id?: string;
  rank: number;
  display_topic_title: string;
  topic_subtitle: string;
  cluster_label?: string;
  trend_strength_score: number;
  decision_label: string;
  trend_summary: string;
  opportunity_summary: string;
  risk_summary: string;
  growth_since_freeze_pct: number;
  latest_n_videos: number;
  t60_is_winner: boolean;
  weeks_observed: number | null;
  consecutive_up_weeks: number | null;
  score_anchor: string;
  trend_confidence?: number;
  trend_direction?: string;
  latest_snapshot_date?: string;
  t60_actual_rank?: number | null;
  t60_growth_pct?: number | null;
  failure_risk_score?: number | null;
  failure_risk_level?: string;
  failure_risk_reason_code?: string;
  dominant_video_format?: string;
  short_video_share?: number | null;
  midform_video_share?: number | null;
  long_video_share?: number | null;
  format_strategy_label?: string;
  format_strategy_confidence?: number | null;
  format_strategy_reason_code?: string;
  format_strategy_summary?: string;
  liveCluster?: InsightCluster;
};

type UserPlan = "explorer" | "pro" | "advanced";
type Tone = "neutral" | "positive" | "watch" | "risk";
type PillFamily = "growth" | "format" | "risk" | "neutral";
type RawLeaderboardRow = Omit<LeaderboardRow, "topic_subtitle" | "cluster_label">;
type SignalState = "Emerging" | "Failed breakout" | "Weakening";
type ClusterInsight = Partial<Insight> & {
  cluster_id?: string;
  cluster_rank?: number;
  cluster_label?: string;
  subcluster_label: string;
  insight_text: string;
  insight_score: number;
  insight_type?: InsightType;
  signal_state?: SignalState | string;
  observed_at?: string;
  snapshot_date?: string;
  share_delta?: number;
  relative_growth_spread?: number;
};

const topicPresentationByRank: Record<
  number,
  { display_topic_title: string; topic_subtitle: string }
> = {
  1: {
    display_topic_title: "Recession Risk and Market Commentary",
    topic_subtitle: "Macroeconomic explainers gaining sustained finance audience interest.",
  },
  2: {
    display_topic_title: "Budget Policy and Stock Market Reactions",
    topic_subtitle: "Fiscal policy coverage tied to market interpretation and investor response.",
  },
  3: {
    display_topic_title: "Investor Positioning Around the Economy",
    topic_subtitle: "Personal finance creators explaining where investors are moving next.",
  },
  4: {
    display_topic_title: "Retirement Account Strategy",
    topic_subtitle: "401k, IRA, and ETF education with strong evergreen growth potential.",
  },
  5: {
    display_topic_title: "Small-Cap and Undervalued Stock Ideas",
    topic_subtitle: "Stock-picking themes focused on smaller names and undercovered opportunities.",
  },
  6: {
    display_topic_title: "ETF-First Investing Playbooks",
    topic_subtitle: "Low-complexity investing guidance centered on ETF allocation decisions.",
  },
  7: {
    display_topic_title: "Index Fund and ETF Comparisons",
    topic_subtitle: "Fund selection topics where creators compare passive investing choices.",
  },
  8: {
    display_topic_title: "Practical Side Hustle Validation",
    topic_subtitle: "Creator-led tests of side hustles that appear realistic and repeatable.",
  },
  9: {
    display_topic_title: "Retail Stock Warnings and Watchlists",
    topic_subtitle: "Audience demand around which stocks to avoid, hold, or revisit.",
  },
  10: {
    display_topic_title: "Housing Prices and Mortgage Pressure",
    topic_subtitle: "Property-market explainers focused on affordability, rates, and timing.",
  },
  11: {
    display_topic_title: "Passive Income Idea Research",
    topic_subtitle: "Idea-led income content where audiences compare realistic options.",
  },
  12: {
    display_topic_title: "Trump Policy Coverage and Full-Speech Clips",
    topic_subtitle: "Political coverage clustered around long-form excerpts and explanation.",
  },
  13: {
    display_topic_title: "Best Investments for New Investors",
    topic_subtitle: "Beginner-friendly investing topics with broad discovery intent.",
  },
  14: {
    display_topic_title: "Online Earning Apps and Tool Reviews",
    topic_subtitle: "App-based earning claims where audiences seek proof and risk signals.",
  },
  15: {
    display_topic_title: "Daily S&P 500 Trading Plans",
    topic_subtitle: "Short-horizon market planning content for active traders.",
  },
  16: {
    display_topic_title: "Gold, Silver, and Hard-Money Narratives",
    topic_subtitle: "Precious-metal commentary tied to inflation, savings, and market anxiety.",
  },
  17: {
    display_topic_title: "Side Hustle Reality Checks",
    topic_subtitle: "Skeptical side-hustle content testing whether ideas actually work.",
  },
  18: {
    display_topic_title: "India Budget and Fiscal Policy Commentary",
    topic_subtitle: "Budget coverage centered on policy announcements and public figures.",
  },
  19: {
    display_topic_title: "Property Market Crash Signals",
    topic_subtitle: "Risk-led housing content tracking crash narratives and market stress.",
  },
  20: {
    display_topic_title: "Debt Payoff Strategy",
    topic_subtitle: "Household finance guidance around repayment sequencing and motivation.",
  },
  21: {
    display_topic_title: "Top Stocks to Buy Watchlists",
    topic_subtitle: "Ranked stock ideas competing for retail investor attention.",
  },
  22: {
    display_topic_title: "Budgeting App Comparisons",
    topic_subtitle: "Consumer finance tool reviews for spending control and planning.",
  },
  23: {
    display_topic_title: "IRA Choice and Retirement Account Decisions",
    topic_subtitle: "Decision content helping viewers choose between account types.",
  },
  24: {
    display_topic_title: "High-Yield Savings Account Research",
    topic_subtitle: "Banking comparison topics focused on rates, safety, and switching.",
  },
  25: {
    display_topic_title: "Mortgage Rate Forecasting",
    topic_subtitle: "Rate-watch content focused on whether borrowing costs are about to fall.",
  },
  26: {
    display_topic_title: "UK Tax Change Explainers",
    topic_subtitle: "HMRC and tax-policy explainers for viewers tracking rule changes.",
  },
  27: {
    display_topic_title: "Options Trading Education",
    topic_subtitle: "Explainer-led trading content for viewers learning derivatives basics.",
  },
  28: {
    display_topic_title: "Accessible Side Hustle Ideas",
    topic_subtitle: "Entry-level income ideas positioned around what viewers can start now.",
  },
  29: {
    display_topic_title: "Best Stocks to Buy Research",
    topic_subtitle: "Broad stock discovery content competing on conviction and timing.",
  },
  30: {
    display_topic_title: "Personal Finance Need-to-Know Updates",
    topic_subtitle: "General finance updates packaged as essential viewer guidance.",
  },
};

const leaderboard = (leaderboardRows as unknown as RawLeaderboardRow[]).map((topic) => {
  const presentation = topicPresentationByRank[topic.rank];

  return {
    ...topic,
    cluster_label: topic.display_topic_title,
    topic_subtitle:
      presentation?.topic_subtitle ?? "Research theme generated from related content movement.",
    display_topic_title: presentation?.display_topic_title ?? topic.display_topic_title,
  };
}) as LeaderboardRow[];

const failureRiskByClusterId = new Map(
  leaderboard
    .filter((topic) => topic.cluster_id)
    .map((topic) => [
      topic.cluster_id,
      {
        failure_risk_level: topic.failure_risk_level,
        failure_risk_reason_code: topic.failure_risk_reason_code,
        failure_risk_score: topic.failure_risk_score,
      },
    ]),
);

const clusterInsights = clusterInsightRows as ClusterInsight[];

function getMockUserPlan(): UserPlan {
  return "explorer";
}

const userPlan = getMockUserPlan();
const hasPremiumAccess = userPlan === "pro" || userPlan === "advanced";
const EXPLORER_WATCHLIST_LIMIT = 2;
const ALL_CATEGORIES = "All topics";
const DECISION_LABEL_MAP: Record<string, string> = {
  STRONG_TREND: "Sustained Growth",
  EARLY_TREND: "Early Opportunity",
  EMERGING: "Watch closely",
  WEAK_OR_RISK: "High Risk",
};

function mapDecisionLabel(label?: string) {
  if (!label) return "Signal Unknown";
  return DECISION_LABEL_MAP[label] ?? formatSelectedLabel(label);
}

function mapConfidence(topic: LeaderboardRow) {
  const confidence = topic.trend_confidence ?? topic.trend_strength_score;
  if (confidence === null || confidence === undefined) return "Unavailable";
  const normalized = getConfidenceValue(topic);

  if (normalized >= 0.72) return "High Confidence";
  if (normalized >= 0.48) return "Moderate Confidence";
  return "Low Confidence";
}

function getConfidenceValue(topic: LeaderboardRow) {
  const confidence = topic.trend_confidence ?? topic.trend_strength_score;
  if (confidence === null || confidence === undefined) return 0;
  return Math.max(0, Math.min(1, confidence > 1 ? confidence / 100 : confidence));
}

function getConfidenceTone(topic: LeaderboardRow): Tone {
  const confidence = getConfidenceValue(topic);
  if (confidence >= 0.72) return "positive";
  if (confidence >= 0.48) return "watch";
  return "risk";
}

function mapOpportunityState(topic: LeaderboardRow) {
  const growth = getGrowthFraction(topic);
  const confidence = topic.trend_confidence ?? topic.trend_strength_score;
  const normalizedConfidence = confidence > 1 ? confidence / 100 : confidence;

  if (topic.decision_label === "WEAK_OR_RISK") return "Late / risky";
  if (topic.decision_label === "STRONG_TREND" && normalizedConfidence >= 0.68) return "Scaling";
  if (topic.decision_label === "EARLY_TREND" || topic.decision_label === "EMERGING" || growth < 0.18) {
    return "Early";
  }

  return "Scaling";
}

function getOpportunityTone(topic: LeaderboardRow): Tone {
  const state = mapOpportunityState(topic);
  if (state === "Early") return "watch";
  if (state === "Scaling") return "positive";
  return "risk";
}

function mapWillLast(topic: LeaderboardRow) {
  if (topic.decision_label === "STRONG_TREND") return "Likely to sustain";
  if (topic.decision_label === "EARLY_TREND") return "Promising, validate";
  if (topic.decision_label === "EMERGING") return "Too early to call";
  if (topic.t60_is_winner) return "Held up before";
  return "Not stable yet";
}

function mapCompactWillLast(topic: LeaderboardRow) {
  if (topic.decision_label === "STRONG_TREND") return "Sustain";
  if (topic.decision_label === "EARLY_TREND") return "Validate";
  if (topic.decision_label === "EMERGING") return "Early";
  if (topic.t60_is_winner) return "Held";
  return "Unstable";
}

function mapCategory(topic: LeaderboardRow) {
  const title = `${topic.display_topic_title} ${topic.cluster_label ?? ""}`.toLowerCase();

  if (title.includes("stock") || title.includes("market") || title.includes("invest")) return "Markets";
  if (title.includes("retirement") || title.includes("ira") || title.includes("401k")) return "Retirement";
  if (title.includes("side hustle") || title.includes("income") || title.includes("earning")) return "Income";
  if (title.includes("housing") || title.includes("mortgage") || title.includes("property")) return "Housing";
  if (title.includes("tax") || title.includes("budget") || title.includes("policy")) return "Policy";

  return "Personal Finance";
}

function getRecommendedActionPlaceholder(topic: LeaderboardRow) {
  if (topic.decision_label === "STRONG_TREND") {
    return "Scale this now: turn the topic into a repeatable series, refresh winning angles, and protect quality while demand is still active.";
  }

  if (topic.decision_label === "EARLY_TREND" || topic.decision_label === "EMERGING") {
    return "Run a focused test: publish one sharp angle, watch early response, then scale only if the signal keeps improving.";
  }

  if (topic.decision_label === "WEAK_OR_RISK") {
    return "Hold back: monitor for a cleaner proof point before committing a full production cycle.";
  }

  return "Use the evidence below to decide whether this topic deserves production time.";
}

function getRecommendedActionBullets(topic: LeaderboardRow) {
  if (topic.decision_label === "STRONG_TREND") {
    return [
      "Scale this topic into a short repeatable series.",
      "Refresh the strongest angle while topic growth is still active.",
      "Use adjacent titles to defend quality as competition rises.",
    ];
  }

  if (topic.decision_label === "EARLY_TREND") {
    return [
      "Run one focused test before committing a full series.",
      "Look for another positive week before scaling production.",
      "Keep the angle specific so the signal is easy to validate.",
    ];
  }

  if (topic.decision_label === "EMERGING") {
    return [
      "Add this to monitoring and collect more examples.",
      "Test only if it matches an existing audience lane.",
      "Wait for confidence to improve before scaling.",
    ];
  }

  if (topic.decision_label === "WEAK_OR_RISK") {
    return [
      "Do not prioritize new production yet.",
      "Watch for stability before re-entering the topic.",
      "Use this mainly as a risk signal for planning.",
    ];
  }

  return ["Review the evidence before committing production time.", "Use a small test before scaling."];
}

function getTopicCardHoverInsights(topic: LeaderboardRow) {
  return [
    `${mapDecisionLabel(topic.decision_label)} with ${mapConfidence(topic).toLowerCase()}.`,
    `${mapOpportunityState(topic)} opportunity; stability is ${mapWillLast(topic).toLowerCase()}.`,
    topic.opportunity_summary || topic.trend_summary || "Open the detail panel for supporting evidence.",
  ]
    .map((insight) => summarizeInsight(insight))
    .slice(0, 3);
}

function getSystemStatus(topics: LeaderboardRow[]) {
  if (topics.length === 0) {
    return {
      confidence: "Unavailable",
      confidenceValue: 0,
      lastUpdated: "No snapshot",
    };
  }

  const confidenceValue =
    topics.reduce((total, topic) => total + getConfidenceValue(topic), 0) / Math.max(1, topics.length);
  const latestTimestamp = Math.max(...topics.map((topic) => getDateTime(topic.latest_snapshot_date)));
  const latestTopic = topics.find((topic) => getDateTime(topic.latest_snapshot_date) === latestTimestamp);

  return {
    confidence:
      confidenceValue >= 0.72 ? "High system confidence" : confidenceValue >= 0.48 ? "Moderate system confidence" : "Low system confidence",
    confidenceValue,
    lastUpdated: latestTopic?.latest_snapshot_date ? formatSnapshotDate(latestTopic.latest_snapshot_date) : "Preview snapshot",
  };
}

function getTopicTitle(topic: LeaderboardRow) {
  return topic.display_topic_title || topic.cluster_label || "Untitled topic";
}

function formatScore(score: number) {
  return `${Math.round(score * 100)}`;
}

function formatPercent(value?: number | null) {
  if (value === null || value === undefined) return "—";
  const percent = value * 100;
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`;
}

function formatPP(value?: number | null) {
  if (value === null || value === undefined) return "—";
  const points = value * 100;
  return `${points >= 0 ? "+" : ""}${points.toFixed(1)}pp`;
}

const FORMAT_STRATEGY_LABELS: Record<string, string> = {
  SHORT_HEAVY: "Shorts-heavy",
  MIDFORM_HEAVY: "Mid-form heavy",
  LONG_HEAVY: "Long-form heavy",
  HYBRID_FORMAT: "Hybrid demand",
  UNKNOWN_FORMAT: "Format unknown",
};

function getFormatStrategyLabel(topic: LeaderboardRow) {
  return FORMAT_STRATEGY_LABELS[topic.format_strategy_label ?? "UNKNOWN_FORMAT"] ?? "Format unknown";
}

function getCompactFormatStrategyLabel(topic: LeaderboardRow) {
  const label = topic.format_strategy_label;
  if (label === "SHORT_HEAVY") return "Shorts";
  if (label === "MIDFORM_HEAVY") return "Mid-form";
  if (label === "LONG_HEAVY") return "Long";
  if (label === "HYBRID_FORMAT") return "Hybrid";
  return "Unknown";
}

function getFormatTone(topic: LeaderboardRow): Tone {
  const label = topic.format_strategy_label;
  if (label === "SHORT_HEAVY" || label === "LONG_HEAVY") return "positive";
  if (label === "MIDFORM_HEAVY" || label === "HYBRID_FORMAT") return "watch";
  return "neutral";
}

function formatShare(value?: number | null) {
  if (value === null || value === undefined) return "0%";
  const normalized = Math.max(0, Math.min(1, value));
  return `${Math.round(normalized * 100)}%`;
}

function normalizeShare(value?: number | null) {
  if (value === null || value === undefined) return 0;
  return Math.max(0, Math.min(1, value));
}

function getInsightVisual(insightType?: InsightType | string) {
  if (insightType === "INTERNAL_OUTPERFORMER") {
    return {
      label: "Outperforming",
      color: "text-cyan-200",
      icon: "↗",
      tone: "positive" as Tone,
    };
  }

  if (insightType === "WEAKENING_SEGMENT") {
    return {
      label: "Weakening",
      color: "text-amber-200",
      icon: "⚠",
      tone: "watch" as Tone,
    };
  }

  if (insightType === "FAILED_BREAKOUT") {
    return {
      label: "Failed breakout",
      color: "text-rose-200",
      icon: "✕",
      tone: "risk" as Tone,
    };
  }

  return {
    label: "Emerging",
    color: "text-emerald-200",
    icon: "🔥",
    tone: "positive" as Tone,
  };
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => {
      if (word === "—") return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function formatSelectedLabel(value: string) {
  return /^[A-Z0-9_]+$/.test(value) ? value : titleCase(value);
}

function formatOutcomeStatus(value: string) {
  if (value === "ACTIVE") return "Active";
  if (value === "PENDING") return "Awaiting confirmation";
  if (value === "FAILED") return "Failed";
  if (value === "WEAKENING") return "Weakening";
  return "Unknown";
}

function getDateTime(value?: string) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getInsightTitle(label?: string) {
  if (!label) return "No Primary Signal";
  return `${titleCase(label)} Signals`;
}

function getClusterDisplayTitle(topic: LeaderboardRow, primaryInsight?: ClusterInsight) {
  if (primaryInsight?.subcluster_label) {
    return getInsightTitle(primaryInsight.subcluster_label);
  }

  return topic.display_topic_title;
}

function getInsightMetric(insight?: ClusterInsight) {
  if (!insight) {
    return {
      value: "—",
      helper: "No metric available",
      compact: "—",
    };
  }

  if (insight.insight_type === "WEAKENING_SEGMENT" || insight.insight_type === "FAILED_BREAKOUT") {
    return {
      value: formatPP(insight.share_delta),
      helper: insight.share_delta !== undefined && insight.share_delta < 0 ? "share decline" : "share change",
      compact: formatPP(insight.share_delta),
    };
  }

  return {
    value: formatPercent(insight.relative_growth_spread),
    helper: "vs cluster",
    compact: `${formatPercent(insight.relative_growth_spread)} vs cluster`,
  };
}

function getPrimaryInsightClass(insight?: ClusterInsight) {
  const visual = getInsightVisualForInsight(insight);

  if (visual.tone === "risk") {
    return "border-rose-300/16 bg-rose-300/[0.055]";
  }

  if (visual.tone === "watch") {
    return "border-amber-300/16 bg-amber-300/[0.055]";
  }

  return "border-emerald-300/16 bg-emerald-300/[0.055]";
}

function getTopicId(topic: LeaderboardRow) {
  return topic.cluster_id ?? topic.display_topic_title;
}

function getDecisionTone(label: string): Tone {
  if (label === "STRONG_TREND" || label === "EMERGING") return "positive";
  if (label === "EARLY_TREND") return "watch";
  if (label === "WEAK_OR_RISK") return "risk";
  return "neutral";
}

function hasFailureRiskSignal(topic: LeaderboardRow) {
  return Boolean(
    topic.failure_risk_level ||
      topic.failure_risk_reason_code ||
      (topic.failure_risk_score !== null && topic.failure_risk_score !== undefined),
  );
}

function getFailureRiskTone(topic: LeaderboardRow): Tone {
  const level = topic.failure_risk_level?.toUpperCase();
  if (level === "LOW") return "positive";
  if (level === "MEDIUM" || level === "MODERATE") return "watch";
  if (level === "HIGH" || level === "CRITICAL") return "risk";

  const score = topic.failure_risk_score;
  if (typeof score === "number") {
    if (score >= 0.6) return "risk";
    if (score >= 0.3) return "watch";
    return "positive";
  }

  return "neutral";
}

function formatFailureRiskValue(value?: string | null) {
  if (!value) return "Unavailable";
  return formatSelectedLabel(value.split("_").join(" "));
}

function formatCompactFailureRiskValue(value?: string | null) {
  if (!value) return "Unknown";
  return formatFailureRiskValue(value);
}

function formatFailureRiskScore(score?: number | null) {
  if (score === null || score === undefined) return "Unavailable";
  return `${Math.round(score * 100)}%`;
}

function PillFrame({
  children,
  family = "neutral",
  className = "",
}: {
  children: ReactNode;
  family?: PillFamily;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]",
        family === "growth" && "border-emerald-300/24 bg-emerald-300/[0.075] text-emerald-100",
        family === "format" && "border-violet-300/24 bg-violet-300/[0.075] text-violet-100",
        family === "risk" && "border-amber-300/24 bg-amber-300/[0.075] text-amber-100",
        family === "neutral" && "border-slate-200/10 bg-slate-200/[0.038] text-slate-200/62",
        className,
      )}
    >
      {children}
    </span>
  );
}

function FormatStrategyPill({ topic }: { topic: LeaderboardRow }) {
  const tone = getFormatTone(topic);

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em]",
        tone === "positive" && "border-cyan-300/28 bg-cyan-300/10 text-cyan-100",
        tone === "watch" && "border-violet-300/28 bg-violet-300/10 text-violet-100",
        tone === "neutral" && "border-white/10 bg-white/[0.035] text-white/58",
      )}
    >
      {getFormatStrategyLabel(topic)}
    </span>
  );
}

function PrimaryIntelligencePill({ topic }: { topic: LeaderboardRow }) {
  if (topic.format_strategy_label) {
    return <PillFrame family="format">{getFormatStrategyLabel(topic)}</PillFrame>;
  }

  if (topic.decision_label) {
    return <PillFrame family="growth">{mapDecisionLabel(topic.decision_label)}</PillFrame>;
  }

  if (hasFailureRiskSignal(topic)) {
    return <PillFrame family="risk">Risk {formatFailureRiskValue(topic.failure_risk_level)}</PillFrame>;
  }

  return <PillFrame>Signal pending</PillFrame>;
}

function PlanPill({ plan }: { plan: UserPlan }) {
  const label = plan === "explorer" ? "Explorer Preview" : plan === "advanced" ? "Advanced" : "Pro";

  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[10px] font-medium text-white/58">
      {label}
    </span>
  );
}

function SignalPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white/54">
      {children}
    </span>
  );
}

function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: Tone;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/8 bg-black/18 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/34">{label}</div>
      <div
        className={cn(
          "mt-2 truncate text-xl font-semibold tracking-[-0.03em]",
          tone === "positive" && "text-emerald-200",
          tone === "watch" && "text-amber-200",
          tone === "risk" && "text-rose-200",
          tone === "neutral" && "text-white",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ConfidenceMeter({ value, tone }: { value: number; tone: Tone }) {
  const percent = Math.round(value * 100);

  return (
    <div className="mt-2">
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            tone === "positive" && "bg-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.44)]",
            tone === "watch" && "bg-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.34)]",
            tone === "risk" && "bg-rose-300 shadow-[0_0_16px_rgba(251,113,133,0.34)]",
            tone === "neutral" && "bg-white/50",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function WatchStarButton({
  active,
  onClick,
  ariaLabel,
}: {
  active: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full border transition",
        active
          ? "border-amber-300/35 bg-amber-300/12 text-amber-200"
          : "border-white/10 bg-white/[0.03] text-white/38 hover:border-amber-300/22 hover:text-amber-100",
      )}
    >
      <Star className={cn("h-3.5 w-3.5", active ? "fill-current" : "")} />
    </button>
  );
}

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const requestedClusterId = searchParams.get("cluster")?.trim() || null;
  const requestedSubclusterId = searchParams.get("subcluster")?.trim() || null;
  const openedFromDiscovery = searchParams.get("from") === "discovery";
  const [selectedRank, setSelectedRank] = useState(leaderboard[0]?.rank ?? 1);
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [watchlistLimitMessage, setWatchlistLimitMessage] = useState("");
  const { watchedTopicIds, isWatched, addTopic, removeTopic } = useWatchlist();
  const { clusters: insightClusters, loading: clustersLoading, error: clustersError } = useInsightClusters();
  const { opportunities: discoveryOpportunities } = useDiscoveryOpportunities();
  const hasLiveClusters = insightClusters.length > 0 && !clustersError;
  const dashboardLeaderboard = useMemo(
    () => (hasLiveClusters ? mapClustersToLeaderboard(insightClusters) : leaderboard),
    [hasLiveClusters, insightClusters],
  );
  const requestedDiscoveryOpportunity = useMemo(
    () => {
      if (!requestedClusterId) return undefined;

      return discoveryOpportunities
        .filter(
          (opportunity) =>
            opportunity.cluster_id === requestedClusterId &&
            (!requestedSubclusterId || opportunity.subcluster_id === requestedSubclusterId),
        )
        .sort(
          (a, b) =>
            getDateTime(b.detected_snapshot_date ?? b.snapshot_date) -
            getDateTime(a.detected_snapshot_date ?? a.snapshot_date),
        )[0];
    },
    [discoveryOpportunities, requestedClusterId, requestedSubclusterId],
  );
  const requestedClusterTopic = useMemo(
    () =>
      requestedClusterId
        ? dashboardLeaderboard.find((topic) => topic.cluster_id === requestedClusterId)
        : undefined,
    [dashboardLeaderboard, requestedClusterId],
  );
  const requestedClusterMissing = Boolean(requestedClusterId && !requestedClusterTopic);
  const selectedSubclusterLabel =
    requestedDiscoveryOpportunity?.intent_label ||
    requestedDiscoveryOpportunity?.subcluster_label ||
    requestedSubclusterId;

  useEffect(() => {
    if (requestedClusterTopic) {
      setSelectedRank(requestedClusterTopic.rank);
      return;
    }

    if (!requestedClusterId && hasLiveClusters) {
      setSelectedRank(dashboardLeaderboard[0]?.rank ?? 1);
    }
  }, [dashboardLeaderboard, hasLiveClusters, requestedClusterId, requestedClusterTopic]);

  const selectedTopic = requestedClusterMissing
    ? getDiscoveryFallbackTopic(requestedClusterId, requestedSubclusterId, requestedDiscoveryOpportunity)
    : requestedClusterTopic ?? dashboardLeaderboard.find((topic) => topic.rank === selectedRank) ?? dashboardLeaderboard[0];
  const selectedFromDeepLink = requestedClusterId === selectedTopic.cluster_id;
  const activeSubclusterLabel = selectedFromDeepLink ? selectedSubclusterLabel : null;
  const selectedTopicId = getTopicId(selectedTopic);
  const selectedTopicIsWatched = isWatched(selectedTopicId);
  const selectedInsights = useMemo(
    () => prioritizeSubclusterInsights(getClusterInsights(selectedTopic), requestedSubclusterId),
    [requestedSubclusterId, selectedTopic],
  );
  const primaryInsight = selectedInsights[0];
  const visibleInsights = hasPremiumAccess ? selectedInsights.slice(0, 3) : selectedInsights.slice(0, 1);
  const lockedInsightCount = hasPremiumAccess ? 0 : Math.max(0, 3 - visibleInsights.length);
  const watchedTopics = dashboardLeaderboard.filter((topic) => isWatched(getTopicId(topic)));
  const planLimitedLeaderboard = hasPremiumAccess ? dashboardLeaderboard : dashboardLeaderboard.slice(0, 5);
  const planVisibleLeaderboard = getLeaderboardWithRequestedTopic(planLimitedLeaderboard, selectedTopic, requestedClusterId);
  const availableCategories = useMemo(
    () => [ALL_CATEGORIES, ...Array.from(new Set(planVisibleLeaderboard.map(mapCategory)))],
    [planVisibleLeaderboard],
  );
  const visibleLeaderboard = planVisibleLeaderboard.filter((topic) => {
    const topicText = `${getTopicTitle(topic)} ${topic.topic_subtitle} ${topic.cluster_label ?? ""}`.toLowerCase();
    const matchesSearch = topicText.includes(searchQuery.trim().toLowerCase());
    const matchesCategory = activeCategory === ALL_CATEGORIES || mapCategory(topic) === activeCategory;
    const matchesWatchlist = !showWatchlistOnly || isWatched(getTopicId(topic)) || topic.cluster_id === requestedClusterId;

    return matchesSearch && matchesCategory && matchesWatchlist;
  });
  const topSignals = useMemo(() => getTopSignals(planVisibleLeaderboard), [planVisibleLeaderboard]);
  const systemStatus = useMemo(() => getSystemStatus(planVisibleLeaderboard), [planVisibleLeaderboard]);
  const renderEmptyLeaderboard = visibleLeaderboard.length === 0;

  const handleAddTopic = (topic: LeaderboardRow) => {
    const topicId = getTopicId(topic);

    if (!hasPremiumAccess && !isWatched(topicId) && watchedTopicIds.length >= EXPLORER_WATCHLIST_LIMIT) {
      setWatchlistLimitMessage("Upgrade to Pro to track unlimited topics.");
      return;
    }

    addTopic(topicId);
    setWatchlistLimitMessage("");
  };

  const handleToggleTopic = (topic: LeaderboardRow) => {
    const topicId = getTopicId(topic);

    if (isWatched(topicId)) {
      removeTopic(topicId);
      setWatchlistLimitMessage("");
      return;
    }

    handleAddTopic(topic);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <PageSeo
        title="VidCluster Dashboard"
        description="Your VidCluster early topic intelligence dashboard."
        url="/dashboard"
      />
      <SiteHeader />

      <main className="relative bg-[radial-gradient(circle_at_52%_0%,rgba(255,255,255,0.055),transparent_26%),linear-gradient(180deg,#0b0f16_0%,#05070a_100%)] px-4 py-5 lg:px-6">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-4">
          <DashboardHeader
            totalTopics={planVisibleLeaderboard.length}
            watchedTopics={watchedTopics.length}
            hasPremiumAccess={hasPremiumAccess}
            clustersLoading={clustersLoading}
            clustersError={clustersError}
          />
          <CategoryStrip categories={availableCategories} activeCategory={activeCategory} onChange={setActiveCategory} />
          <DashboardControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showWatchlistOnly={showWatchlistOnly}
            onWatchlistOnlyChange={setShowWatchlistOnly}
            scanMode={scanMode}
            onScanModeChange={setScanMode}
            watchlistLimitMessage={watchlistLimitMessage}
            hasPremiumAccess={hasPremiumAccess}
            watchedCount={watchedTopics.length}
          />

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
            <section className="min-h-[620px] rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.052),rgba(255,255,255,0.022))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
              {requestedClusterMissing ? (
                <DiscoveryFallbackPanel
                  clusterId={requestedClusterId}
                  subclusterId={requestedSubclusterId}
                  subclusterLabel={activeSubclusterLabel}
                  openedFromDiscovery={openedFromDiscovery}
                  outcomeStatus={requestedDiscoveryOpportunity?.outcome_status}
                />
              ) : (
                <>
                  {openedFromDiscovery ? (
                    <DiscoveryContextBanner outcomeStatus={requestedDiscoveryOpportunity?.outcome_status} />
                  ) : null}
                  <TopSignalStrip signals={topSignals} />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <SignalPill>{!hasPremiumAccess ? "Starter view" : "All tracked topics"}</SignalPill>
                        <PlanPill plan={userPlan} />
                        {activeSubclusterLabel ? <SignalPill>{formatSelectedLabel(activeSubclusterLabel)}</SignalPill> : null}
                      </div>
                      <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Signal Explorer</h1>
                    </div>
                    <div className="text-sm text-white/46">
                      {visibleLeaderboard.length} of {planVisibleLeaderboard.length} topics
                    </div>
                  </div>

                  {renderEmptyLeaderboard ? (
                    <EmptyTopicState showWatchlistOnly={showWatchlistOnly} />
                  ) : (
                    <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                      {visibleLeaderboard.map((topic) => (
                        <TopicCard
                          key={`${topic.rank}-${getTopicId(topic)}`}
                          topic={topic}
                          selected={selectedTopic.rank === topic.rank}
                          watched={isWatched(getTopicId(topic))}
                          scanMode={scanMode}
                          onSelect={() => setSelectedRank(topic.rank)}
                          onToggleWatch={(event) => {
                            event.stopPropagation();
                            handleToggleTopic(topic);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>

            <TopicDetail
              topic={selectedTopic}
              primaryInsight={primaryInsight}
              insights={selectedInsights}
              visibleInsights={visibleInsights}
              lockedInsightCount={lockedInsightCount}
              hasPremiumAccess={hasPremiumAccess}
              watched={selectedTopicIsWatched}
              systemStatus={systemStatus}
              onToggleWatch={() =>
                selectedTopicIsWatched ? removeTopic(selectedTopicId) : handleAddTopic(selectedTopic)
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardHeader({
  totalTopics,
  watchedTopics,
  hasPremiumAccess,
  clustersLoading,
  clustersError,
}: {
  totalTopics: number;
  watchedTopics: number;
  hasPremiumAccess: boolean;
  clustersLoading: boolean;
  clustersError?: string | null;
}) {
  return (
    <header className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SignalPill>Topic decisions</SignalPill>
            <SignalPill>{hasPremiumAccess ? "All insights" : "Starter access"}</SignalPill>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-white">
            Topic Intelligence Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/56">
            Scan the strongest signals, judge confidence quickly, and open a topic for deeper signal analysis.
          </p>
          {clustersLoading ? <p className="mt-2 text-xs text-white/40">Loading live insights...</p> : null}
          {clustersError ? (
            <p className="mt-2 text-xs text-amber-100/62">Live insights unavailable. Showing preview data.</p>
          ) : null}
        </div>
        <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:min-w-[280px]">
          <MetricCard label="Topics" value={totalTopics.toString()} />
          <MetricCard label="Watching" value={watchedTopics.toString()} tone={watchedTopics > 0 ? "positive" : "neutral"} />
        </div>
      </div>
    </header>
  );
}

function CategoryStrip({
  categories,
  activeCategory,
  onChange,
}: {
  categories: string[];
  activeCategory: string;
  onChange: (category: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
            activeCategory === category
              ? "border-emerald-300/35 bg-emerald-300/12 text-emerald-100"
              : "border-white/10 bg-white/[0.035] text-white/58 hover:border-white/18 hover:text-white/80",
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

function DashboardControls({
  searchQuery,
  onSearchChange,
  showWatchlistOnly,
  onWatchlistOnlyChange,
  scanMode,
  onScanModeChange,
  watchlistLimitMessage,
  hasPremiumAccess,
  watchedCount,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showWatchlistOnly: boolean;
  onWatchlistOnlyChange: (value: boolean) => void;
  scanMode: boolean;
  onScanModeChange: (value: boolean) => void;
  watchlistLimitMessage: string;
  hasPremiumAccess: boolean;
  watchedCount: number;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.026] p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search topics, clusters, or decisions"
          className="min-h-11 flex-1 rounded-full border border-white/10 bg-black/24 px-4 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-emerald-300/35"
        />
        <div className="flex flex-col gap-2 sm:flex-row">
        <label
          className={cn(
            "flex cursor-pointer items-center justify-between gap-3 rounded-full border px-4 py-2.5 text-sm transition",
            showWatchlistOnly
              ? "border-amber-300/28 bg-amber-300/10 text-amber-100"
              : "border-white/10 bg-black/16 text-white/62 hover:border-white/16 hover:text-white/82",
          )}
        >
          <span>Watchlist {watchedCount > 0 ? `(${watchedCount})` : ""}</span>
          <input
            type="checkbox"
            checked={showWatchlistOnly}
            onChange={(event) => onWatchlistOnlyChange(event.target.checked)}
            className="h-4 w-4 accent-emerald-300"
          />
        </label>
        <label
          className={cn(
            "flex cursor-pointer items-center justify-between gap-3 rounded-full border px-4 py-2.5 text-sm transition",
            scanMode
              ? "border-cyan-300/28 bg-cyan-300/10 text-cyan-100"
              : "border-white/10 bg-black/16 text-white/62 hover:border-white/16 hover:text-white/82",
          )}
        >
          <span>Scan Mode</span>
          <input
            type="checkbox"
            checked={scanMode}
            onChange={(event) => onScanModeChange(event.target.checked)}
            className="h-4 w-4 accent-cyan-300"
          />
        </label>
        </div>
      </div>
      {watchlistLimitMessage ? (
        <div className="mt-3 rounded-xl border border-amber-300/18 bg-amber-300/[0.06] px-3 py-2 text-xs leading-5 text-amber-100/78">
          {watchlistLimitMessage}
        </div>
      ) : null}
      {!hasPremiumAccess ? (
        <div className="mt-3">
          <UpgradeMiniCard copy="Unlock all ranked topics." />
        </div>
      ) : null}
    </div>
  );
}

type TopSignal = {
  label: string;
  topic: LeaderboardRow;
  helper: string;
  tone: "positive" | "watch" | "risk";
};

function TopSignalStrip({ signals }: { signals: TopSignal[] }) {
  return (
    <div className="mb-4 rounded-2xl border border-white/8 bg-black/16 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/38">
          3 Key Signals
        </div>
        <div className="text-xs text-white/36">Fast scan summary</div>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {signals.map((signal) => (
          <div
            key={`${signal.label}-${getTopicId(signal.topic)}`}
            className={cn(
              "rounded-xl border bg-white/[0.022] p-3",
              signal.tone === "positive" && "border-emerald-300/20",
              signal.tone === "watch" && "border-amber-300/18",
              signal.tone === "risk" && "border-rose-300/18",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  signal.tone === "positive" && "bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.32)]",
                  signal.tone === "watch" && "bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.24)]",
                  signal.tone === "risk" && "bg-rose-300 shadow-[0_0_18px_rgba(251,113,133,0.24)]",
                )}
              />
              <div
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.16em]",
                  signal.tone === "positive" && "text-emerald-200",
                  signal.tone === "watch" && "text-amber-200",
                  signal.tone === "risk" && "text-rose-200",
                )}
              >
                {signal.label}
              </div>
            </div>
            <div className="mt-2 truncate text-sm font-semibold text-white">{getTopicTitle(signal.topic)}</div>
            <div className="mt-1 flex items-center justify-between gap-3 text-xs text-white/48">
              <span>{signal.helper}</span>
              <span
                className={cn(
                  "font-semibold",
                  getGrowthFraction(signal.topic) >= 0 ? "text-emerald-200/82" : "text-rose-200/82",
                )}
              >
                {formatPercent(getGrowthFraction(signal.topic))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignalSparkline({ topic }: { topic: LeaderboardRow }) {
  const growth = getGrowthFraction(topic);
  const points = getSparklinePoints(topic);
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${path} L 100 100 L 0 100 Z`;
  const isPositive = growth >= 0;
  const stroke = isPositive ? "rgb(94 234 212)" : "rgb(253 164 175)";
  const gradientId = `sparkline-gradient-${topic.rank}`;
  const glowId = `sparkline-glow-${topic.rank}`;

  return (
    <div className="relative mt-5 h-[110px] overflow-hidden rounded-xl border border-slate-200/10 bg-[#060a0f] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.032),transparent_44%),radial-gradient(circle_at_82%_16%,rgba(125,211,252,0.07),transparent_34%)]" />
      <svg
        className="absolute inset-x-4 bottom-3 top-3 h-[86px] w-[calc(100%-32px)]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
            <stop offset="72%" stopColor={stroke} stopOpacity="0.03" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="1.35" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d="M 0 72 L 100 72" stroke="rgba(148,163,184,0.13)" strokeDasharray="3 5" strokeWidth="0.8" />
        <path d={path} fill="none" filter={`url(#${glowId})`} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.35" />
      </svg>
      <div className="absolute left-3 top-3 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-200/34">
        Trend
      </div>
      <div
        className={cn(
          "absolute bottom-3 right-3 text-lg font-semibold tracking-[-0.035em]",
          isPositive ? "text-emerald-100" : "text-rose-100",
        )}
      >
        {formatPercent(growth)}
      </div>
    </div>
  );
}

function CompactMetric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: Tone }) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-300/34">{label}</div>
      <div
        className={cn(
          "mt-1 truncate text-[13px] font-semibold leading-4",
          tone === "positive" && "text-emerald-100/88",
          tone === "watch" && "text-amber-100/88",
          tone === "risk" && "text-rose-100/88",
          tone === "neutral" && "text-slate-100/76",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function TopicCard({
  topic,
  selected,
  watched,
  scanMode,
  onSelect,
  onToggleWatch,
}: {
  topic: LeaderboardRow;
  selected: boolean;
  watched: boolean;
  scanMode: boolean;
  onSelect: () => void;
  onToggleWatch: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const growth = getGrowthFraction(topic);
  const hoverInsights = getTopicCardHoverInsights(topic);
  const confidenceTone = getConfidenceTone(topic);
  const isTopRank = topic.rank === 1;
  const riskTone = getFailureRiskTone(topic);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative overflow-visible rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5",
        scanMode ? "min-h-[246px]" : "min-h-[304px]",
        isTopRank && "shadow-[0_22px_90px_rgba(251,191,36,0.08)]",
        selected
          ? "border-emerald-300/34 bg-emerald-300/[0.052] ring-1 ring-emerald-200/12 shadow-[0_18px_60px_rgba(16,185,129,0.075),inset_0_1px_0_rgba(255,255,255,0.055)]"
          : isTopRank
            ? "border-amber-300/18 bg-amber-300/[0.03] hover:border-amber-300/28 hover:bg-amber-300/[0.04]"
            : watched
              ? "border-amber-300/14 bg-amber-300/[0.024] hover:border-amber-300/24 hover:bg-amber-300/[0.034]"
              : "border-slate-200/8 bg-black/18 hover:border-slate-200/14 hover:bg-white/[0.028]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-semibold text-slate-200/42">#{topic.rank}</span>
            {isTopRank ? <PillFrame family="risk" className="px-2 py-0.5">#1 Signal</PillFrame> : null}
            {watched ? <PillFrame className="px-2 py-0.5">Watching</PillFrame> : null}
          </div>
          <h2 className={cn("mt-3 line-clamp-2 font-semibold leading-tight tracking-[-0.035em] text-white", scanMode ? "text-lg" : "text-xl")}>
            {getTopicTitle(topic)}
          </h2>
        </div>
        <WatchStarButton
          ariaLabel={watched ? "Remove from watchlist" : "Add to watchlist"}
          active={watched}
          onClick={onToggleWatch}
        />
      </div>

      {!scanMode ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-200/46">{topic.topic_subtitle}</p> : null}

      <SignalSparkline topic={topic} />

      <div className="mt-3 flex items-center justify-between gap-3">
        <PrimaryIntelligencePill topic={topic} />
        <span className={cn("text-xs font-semibold", growth >= 0 ? "text-emerald-100/76" : "text-rose-100/76")}>
          {growth >= 0 ? "Growth" : "Decline"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-200/8 pt-4 sm:grid-cols-4">
        <CompactMetric label="Confidence" value={mapConfidence(topic).replace(" Confidence", "")} tone={confidenceTone} />
        <CompactMetric label="Stability" value={mapCompactWillLast(topic)} tone={getDecisionTone(topic.decision_label)} />
        <CompactMetric label="Risk" value={formatCompactFailureRiskValue(topic.failure_risk_level)} tone={riskTone} />
        <CompactMetric label="Format" value={getCompactFormatStrategyLabel(topic)} tone="neutral" />
      </div>

      <div className="pointer-events-none absolute left-4 right-4 top-4 z-20 translate-y-2 rounded-xl border border-white/12 bg-[#070b10]/95 p-3 opacity-0 shadow-[0_18px_70px_rgba(0,0,0,0.42)] backdrop-blur-xl transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">Quick insight</div>
        <ul className="mt-2 space-y-1.5 text-xs leading-5 text-white/72">
          {hoverInsights.map((insight) => (
            <li key={insight} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-300/80" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </button>
  );
}

function TopicDetail({
  topic,
  primaryInsight,
  insights,
  visibleInsights,
  lockedInsightCount,
  hasPremiumAccess,
  watched,
  systemStatus,
  onToggleWatch,
}: {
  topic: LeaderboardRow;
  primaryInsight?: ClusterInsight;
  insights: ClusterInsight[];
  visibleInsights: ClusterInsight[];
  lockedInsightCount: number;
  hasPremiumAccess: boolean;
  watched: boolean;
  systemStatus: ReturnType<typeof getSystemStatus>;
  onToggleWatch: () => void;
}) {
  const growth = getGrowthFraction(topic);

  return (
    <aside className="sticky top-5 h-fit rounded-2xl border border-white/8 bg-white/[0.028] shadow-[0_24px_80px_rgba(0,0,0,0.26)] xl:max-h-[calc(100vh-112px)] xl:overflow-y-auto">
      <div className="p-4">
        <SignalSummaryPanel
          topic={topic}
          primaryInsight={primaryInsight}
          watched={watched}
          onToggleWatch={onToggleWatch}
        />

        <SystemAssessmentPanel topic={topic} systemStatus={systemStatus} />

        <FormatFitPanel topic={topic} />

        <WhyTrendPanel topic={topic} primaryInsight={primaryInsight} />

        <div className="mt-3 rounded-2xl bg-black/14 p-4 ring-1 ring-white/[0.07]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/34">Supporting evidence</div>
            <span className="text-[10px] text-white/34">{formatScore(topic.trend_strength_score)} signal</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-white/64">
            <AssessmentRow
              label="Weeks observed"
              value={topic.weeks_observed === null ? "Unavailable" : topic.weeks_observed.toString()}
            />
            <AssessmentRow
              label="Positive weeks"
              value={topic.consecutive_up_weeks === null ? "Unavailable" : topic.consecutive_up_weeks.toString()}
            />
            <AssessmentRow label="Topic growth" value={formatPercent(growth)} tone={growth >= 0 ? "positive" : "risk"} />
            <AssessmentRow
              label="Model basis"
              value={hasPremiumAccess ? normalizeAnchor(topic.score_anchor) : "Locked"}
              locked={!hasPremiumAccess}
            />
          </div>
        </div>

        <div className="mt-3 rounded-2xl bg-white/[0.022] p-4 ring-1 ring-white/[0.07]">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/34">Recommended Action</div>
          <p className="mt-3 text-sm leading-6 text-white/66">{getRecommendedActionPlaceholder(topic)}</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-white/68">
            {getRecommendedActionBullets(topic).map((action) => (
              <li key={action} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300/70" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3 rounded-2xl bg-white/[0.022] p-4 ring-1 ring-white/[0.07]">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/34">Evidence readout</div>
          <div className="mt-3 space-y-3">
            {visibleInsights.map((insight) => (
              <InsightRow key={`${insight.subcluster_label}-${insight.insight_score}`} insight={insight} locked={false} />
            ))}
            {Array.from({ length: lockedInsightCount }).map((_, index) => (
              <InsightRow key={`locked-${index}`} insight={insights[index + 1]} locked />
            ))}
          </div>
          <SignalTimeline insights={insights} />
        </div>

        {!hasPremiumAccess ? (
          <div className="mt-3">
            <UpgradeCard
              title="Unlock complete intelligence"
              description="Pro opens the full topic universe, complete insight text, score reasoning, and execution actions."
              cta="Upgrade to Pro"
            />
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function SignalSummaryPanel({
  topic,
  primaryInsight,
  watched,
  onToggleWatch,
}: {
  topic: LeaderboardRow;
  primaryInsight?: ClusterInsight;
  watched: boolean;
  onToggleWatch: () => void;
}) {
  return (
    <section className={cn("rounded-2xl p-4 ring-1 ring-white/[0.07]", getPrimaryInsightClass(primaryInsight))}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <PrimaryIntelligencePill topic={topic} />
            <PillFrame>{formatSnapshotDate(topic.latest_snapshot_date)}</PillFrame>
            <span className="text-xs font-semibold text-white/38">Rank {topic.rank}</span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.035em] text-white">
            {getClusterDisplayTitle(topic, primaryInsight)}
          </h2>
        </div>
        <button
          type="button"
          onClick={onToggleWatch}
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition",
            watched
              ? "border-amber-300/28 bg-amber-300/10 text-amber-100"
              : "border-white/10 bg-white/[0.035] text-white/74 hover:border-amber-300/22 hover:text-white",
          )}
        >
          <Star className={cn("h-4 w-4", watched ? "fill-current" : "")} />
          {watched ? "Watching" : "Watch"}
        </button>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/58">{topic.topic_subtitle}</p>
    </section>
  );
}

function SystemAssessmentPanel({
  topic,
  systemStatus,
}: {
  topic: LeaderboardRow;
  systemStatus: ReturnType<typeof getSystemStatus>;
}) {
  const growth = getGrowthFraction(topic);
  const confidenceTone = getConfidenceTone(topic);
  const tone = getFailureRiskTone(topic);

  return (
    <section className="mt-3 rounded-2xl bg-black/14 p-4 ring-1 ring-white/[0.07]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/34">System Assessment</div>
          <div className="mt-1 truncate text-sm font-medium text-white/78">{systemStatus.confidence}</div>
        </div>
        <PillFrame>Updated {systemStatus.lastUpdated}</PillFrame>
      </div>
      <ConfidenceMeter value={systemStatus.confidenceValue} tone={confidenceTone} />
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <AssessmentRow label="Topic Growth" value={formatPercent(growth)} tone={growth >= 0 ? "positive" : "risk"} />
        <AssessmentRow label="Confidence" value={mapConfidence(topic)} tone={confidenceTone} />
        <AssessmentRow label="Stability" value={mapWillLast(topic)} tone={getDecisionTone(topic.decision_label)} />
        <AssessmentRow label="Opportunity" value={mapOpportunityState(topic)} tone={getOpportunityTone(topic)} />
        <AssessmentRow
          label="Failure Risk"
          value={`${formatFailureRiskValue(topic.failure_risk_level)} / ${formatFailureRiskScore(topic.failure_risk_score)}`}
          tone={tone}
        />
        <AssessmentRow label="Risk Reason" value={formatFailureRiskValue(topic.failure_risk_reason_code)} tone={tone} />
      </div>
    </section>
  );
}

function FormatFitPanel({ topic }: { topic: LeaderboardRow }) {
  const shortShare = normalizeShare(topic.short_video_share);
  const midShare = normalizeShare(topic.midform_video_share);
  const longShare = normalizeShare(topic.long_video_share);

  return (
    <section className="mt-3 rounded-2xl bg-[linear-gradient(180deg,rgba(125,211,252,0.046),rgba(255,255,255,0.016))] p-4 ring-1 ring-cyan-300/12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/50">Format fit</div>
          <div className="mt-1 text-lg font-semibold tracking-[-0.03em] text-white">{getFormatStrategyLabel(topic)}</div>
        </div>
        <FormatStrategyPill topic={topic} />
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.065]">
        <div className="flex h-full gap-px">
          <div className="bg-cyan-300/82" style={{ width: `${shortShare * 100}%` }} />
          <div className="bg-violet-300/82" style={{ width: `${midShare * 100}%` }} />
          <div className="bg-emerald-300/82" style={{ width: `${longShare * 100}%` }} />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
        <DistributionStat label="Short" value={formatShare(topic.short_video_share)} className="text-cyan-100" />
        <DistributionStat label="Mid" value={formatShare(topic.midform_video_share)} className="text-violet-100" />
        <DistributionStat label="Long" value={formatShare(topic.long_video_share)} className="text-emerald-100" />
      </div>
      <p className="mt-3 line-clamp-3 text-xs leading-5 text-white/58">
        {topic.format_strategy_summary || "There is not enough reliable duration data to determine format fit."}
      </p>
    </section>
  );
}

function WhyTrendPanel({ topic, primaryInsight }: { topic: LeaderboardRow; primaryInsight?: ClusterInsight }) {
  const trendPoints = getWhyTrendPoints(topic, primaryInsight);

  return (
    <section className="mt-3 rounded-2xl bg-white/[0.02] p-4 ring-1 ring-white/[0.07]">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/34">Why this trend?</div>
      <div className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white/88">
        {mapDecisionLabel(topic.decision_label)}
      </div>
      <div className="mt-3 space-y-2">
        {trendPoints.map((point) => (
          <div key={point} className="flex gap-2 rounded-xl bg-black/12 px-3 py-2 text-sm leading-5 text-white/64">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300/62" />
            <span>{point}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function AssessmentRow({
  label,
  value,
  tone = "neutral",
  locked = false,
}: {
  label: string;
  value: string;
  tone?: Tone;
  locked?: boolean;
}) {
  return (
    <div className="min-w-0 border-t border-white/8 pt-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/32">{label}</div>
      <div
        className={cn(
          "mt-1 flex items-center gap-1.5 truncate text-sm font-semibold",
          tone === "positive" && "text-emerald-100/88",
          tone === "watch" && "text-amber-100/88",
          tone === "risk" && "text-rose-100/88",
          tone === "neutral" && "text-white/78",
        )}
      >
        {locked ? <Lock className="h-3.5 w-3.5 shrink-0 text-amber-200/70" /> : null}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

function DistributionStat({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-[0.14em] text-white/34">{label}</div>
      <div className={cn("mt-1 text-sm font-semibold", className)}>{value}</div>
    </div>
  );
}

function EmptyTopicState({ showWatchlistOnly }: { showWatchlistOnly: boolean }) {
  return (
    <div className="mt-4 flex min-h-[360px] items-center justify-center rounded-2xl border border-white/8 bg-black/16 p-8 text-center">
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/34">No topics found</div>
        <p className="mt-3 max-w-sm text-sm leading-6 text-white/58">
          {showWatchlistOnly
            ? "No watched topics match the current filters."
            : "Try a broader search or a different category."}
        </p>
      </div>
    </div>
  );
}

function DiscoveryFallbackPanel({
  clusterId,
  subclusterId,
  subclusterLabel,
  openedFromDiscovery,
  outcomeStatus,
}: {
  clusterId: string | null;
  subclusterId?: string | null;
  subclusterLabel?: string | null;
  openedFromDiscovery?: boolean;
  outcomeStatus?: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-amber-300/18 bg-amber-300/[0.055] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100/68">
          {openedFromDiscovery ? "Opened from Discovery signal" : "Dashboard insight unavailable"}
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-white">
          Discovery signal selected
        </h1>
        <div className="mt-4 grid gap-2 text-sm text-white/70">
          <div>Cluster: {clusterId}</div>
          {subclusterId ? <div>Subcluster: {subclusterId}</div> : null}
        </div>
        {subclusterLabel ? (
          <p className="mt-2 text-sm font-medium text-amber-100/76">
            Selected subcluster: {formatSelectedLabel(subclusterLabel)}
          </p>
        ) : null}
        {outcomeStatus ? (
          <p className="mt-3 rounded-xl border border-white/8 bg-black/16 px-3 py-2 text-sm text-white/64">
            Initial signal detected earlier. Latest outcome: {formatOutcomeStatus(outcomeStatus)}.
          </p>
        ) : null}
        <p className="mt-4 text-base leading-7 text-white/68">
          This signal is not in the current dashboard top list.
        </p>
        <a
          href="/discovery"
          className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
        >
          Back to Discovery
        </a>
      </div>
    </div>
  );
}

function DiscoveryContextBanner({ outcomeStatus }: { outcomeStatus?: string }) {
  return (
    <div className="mb-4 rounded-2xl border border-cyan-300/16 bg-cyan-300/[0.055] px-4 py-3 text-sm text-cyan-50/76">
      <div className="font-medium text-white">Opened from Discovery signal</div>
      {outcomeStatus ? (
        <div className="mt-1 text-cyan-50/62">
          Initial signal detected earlier. Latest outcome: {formatOutcomeStatus(outcomeStatus)}.
        </div>
      ) : null}
    </div>
  );
}

function InsightRow({ insight, locked }: { insight?: ClusterInsight; locked: boolean }) {
  const visual = getInsightVisualForInsight(insight);
  const metric = getInsightMetric(insight);

  return (
    <div
      className={cn(
        "rounded-xl border border-white/8 bg-black/14 px-3 py-3 text-sm leading-5",
        locked ? "text-white/46" : "text-white/70",
      )}
    >
      <div className="flex items-center gap-2">
        {locked ? <Lock className="h-3.5 w-3.5 shrink-0 text-amber-200/72" /> : null}
        <span className={cn("shrink-0 text-sm", visual.color)}>{visual.icon}</span>
        <span className={cn("text-[10px] font-semibold uppercase tracking-[0.16em]", visual.color)}>
          {visual.label}
        </span>
      </div>
      <div className="mt-2 font-medium text-white/84">
        {locked ? "Locked" : insight?.subcluster_label ?? "Insight unavailable"}
      </div>
      <div className="mt-1 text-xs text-white/42">
        {locked ? "Upgrade to unlock this signal" : metric.compact}
      </div>
    </div>
  );
}

function SignalTimeline({ insights }: { insights: ClusterInsight[] }) {
  const steps = getInsightTimeline(insights);

  return (
    <div className="mt-5 space-y-4">
      {steps.length === 0 ? (
        <div className="text-xs leading-5 text-white/40">No signal timeline yet.</div>
      ) : null}
      {steps.map((step, index) => (
        <div key={`${step.label}-${index}`} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={cn("h-3 w-3 rounded-full border", getTimelineClass(step.tone))} />
            {index < steps.length - 1 ? <div className="h-9 w-px bg-white/10" /> : null}
          </div>
          <div>
            <div className="text-sm font-medium text-white/76">{step.label}</div>
            <div className="mt-1 text-xs leading-5 text-white/40">{step.helper}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UpgradeCard({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-400/24 bg-emerald-400/[0.055] p-4 shadow-[0_20px_70px_rgba(16,185,129,0.10)]">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-emerald-200/70">
        <Lock className="h-4 w-4" />
        Explorer upgrade
      </div>
      <h3 className="mt-3 text-lg font-semibold tracking-[-0.04em] text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/56">{description}</p>
      <a
        href="/signup?plan=pro"
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-black shadow-[0_12px_34px_rgba(255,255,255,0.08)] transition hover:scale-[1.01] hover:bg-white/90 hover:shadow-[0_18px_48px_rgba(16,185,129,0.22)]"
      >
        {cta}
      </a>
    </div>
  );
}

function UpgradeMiniCard({ copy }: { copy: string }) {
  return (
    <a
      href="/signup?plan=pro"
      className="flex items-center justify-between gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-2.5 text-xs font-medium text-emerald-100/78 transition hover:border-emerald-300/32 hover:bg-emerald-300/[0.085]"
    >
      <span>{copy}</span>
      <Lock className="h-3.5 w-3.5" />
    </a>
  );
}

function getClusterInsights(topic: LeaderboardRow): ClusterInsight[] {
  if (topic.liveCluster) {
    return topic.liveCluster.insights
      .map((insight) => ({ ...insight }))
      .sort((a, b) => b.insight_score - a.insight_score)
      .slice(0, 3);
  }

  const topicId = getTopicId(topic);
  const matchedInsights = clusterInsights
    .filter((insight) => {
      return (
        insight.cluster_rank === topic.rank ||
        insight.cluster_id === topicId ||
        insight.cluster_label === topic.cluster_label ||
        insight.cluster_label === topic.display_topic_title
      );
    })
    .sort((a, b) => b.insight_score - a.insight_score);

  if (matchedInsights.length > 0) {
    return ensureThreeInsights(matchedInsights, topic);
  }

  return ensureThreeInsights(
    [
      {
        cluster_rank: topic.rank,
        subcluster_label: `${topic.display_topic_title} demand pocket`,
        insight_text: topic.opportunity_summary,
        insight_score: topic.trend_strength_score,
        signal_state: topic.decision_label === "WEAK_OR_RISK" ? "Weakening" : "Emerging",
      },
      {
        cluster_rank: topic.rank,
        subcluster_label: `${topic.display_topic_title} risk pattern`,
        insight_text: topic.risk_summary,
        insight_score: Math.max(0.1, topic.trend_strength_score - 0.14),
        signal_state: topic.decision_label === "WEAK_OR_RISK" ? "Failed breakout" : "Weakening",
      },
      {
        cluster_rank: topic.rank,
        subcluster_label: "validation read",
        insight_text: topic.t60_is_winner
          ? `Validated as a T+60 winner${topic.t60_actual_rank ? ` at rank ${topic.t60_actual_rank}` : ""}.`
          : "T+60 validation is still mixed, so treat the read as conditional.",
        insight_score: Math.max(0.1, topic.trend_strength_score - 0.22),
        signal_state: topic.t60_is_winner ? "Emerging" : "Failed breakout",
      },
    ],
    topic,
  );
}

function getLeaderboardWithRequestedTopic(
  topics: LeaderboardRow[],
  selectedTopic: LeaderboardRow,
  requestedClusterId: string | null,
) {
  if (!requestedClusterId || topics.some((topic) => topic.cluster_id === requestedClusterId)) {
    return topics;
  }

  return [selectedTopic, ...topics];
}

function getTopSignals(topics: LeaderboardRow[]): TopSignal[] {
  if (topics.length === 0) return [];

  const byGrowthDesc = [...topics].sort((a, b) => getGrowthFraction(b) - getGrowthFraction(a));
  const positive = byGrowthDesc[0];
  const decline = [...topics]
    .filter((topic) => getGrowthFraction(topic) < 0)
    .sort((a, b) => getGrowthFraction(a) - getGrowthFraction(b))[0] ?? byGrowthDesc[byGrowthDesc.length - 1];
  const absoluteGrowth = topics.map((topic) => Math.abs(getGrowthFraction(topic))).sort((a, b) => a - b);
  const medianVolatility = absoluteGrowth[Math.floor(absoluteGrowth.length / 2)] ?? 0;
  const watch =
    [...topics]
      .filter((topic) => topic !== positive && topic !== decline)
      .sort(
        (a, b) =>
          Math.abs(Math.abs(getGrowthFraction(a)) - medianVolatility) -
          Math.abs(Math.abs(getGrowthFraction(b)) - medianVolatility),
      )[0] ?? positive;

  return [
    {
      label: "Top positive signal",
      topic: positive,
      helper: "Highest topic growth",
      tone: "positive",
    },
    {
      label: "Watch signal",
      topic: watch,
      helper: "Mid volatility",
      tone: "watch",
    },
    {
      label: "Negative signal",
      topic: decline,
      helper: getGrowthFraction(decline) < 0 ? "Decline detected" : "Lowest growth",
      tone: "risk",
    },
  ];
}

function prioritizeSubclusterInsights(insights: ClusterInsight[], requestedSubclusterId: string | null) {
  if (!requestedSubclusterId) return insights;

  return [...insights].sort((a, b) => {
    const aSelected = a.subcluster_id === requestedSubclusterId ? 1 : 0;
    const bSelected = b.subcluster_id === requestedSubclusterId ? 1 : 0;
    return bSelected - aSelected;
  });
}

function getDiscoveryFallbackTopic(
  clusterId: string | null,
  subclusterId: string | null,
  opportunity?: DiscoveryOpportunity,
): LeaderboardRow {
  const label = opportunity?.intent_label || opportunity?.subcluster_label || subclusterId || clusterId || "Discovery signal";
  const score = opportunity?.discovery_score ?? 0;

  return {
    rank: 0,
    cluster_id: clusterId ?? undefined,
    cluster_label: clusterId ?? "Discovery signal",
    display_topic_title: `Discovery signal selected: ${clusterId ?? "Unknown"}`,
    topic_subtitle: opportunity
      ? `Selected subcluster: ${formatSelectedLabel(label)}.`
      : "This cluster is not available in the current dashboard insight set.",
    trend_strength_score: score,
    decision_label: opportunity?.discovery_label === "WATCHLIST_SIGNAL" ? "EARLY_TREND" : "EMERGING",
    trend_summary: "This discovery signal is not available in the dashboard insight set.",
    opportunity_summary: "Open Discovery to review the current opportunity.",
    risk_summary: "Dashboard insight context is unavailable for this cluster.",
    growth_since_freeze_pct: opportunity?.share_delta ?? 0,
    latest_n_videos: Math.round(opportunity?.micro_n_videos ?? 0),
    t60_is_winner: false,
    weeks_observed: null,
    consecutive_up_weeks: null,
    score_anchor: "DISCOVERY_DEEP_LINK",
    trend_confidence: score,
    trend_direction: "DISCOVERY",
    latest_snapshot_date: opportunity?.snapshot_date,
  };
}

function mapClustersToLeaderboard(clusters: InsightCluster[]): LeaderboardRow[] {
  return clusters.map((cluster, index) => {
    const primary = cluster.insights[0];
    const metric =
      primary?.insight_type === "WEAKENING_SEGMENT" || primary?.insight_type === "FAILED_BREAKOUT"
        ? primary?.share_delta
        : primary?.relative_growth_spread;
    const staticFailureRisk = failureRiskByClusterId.get(cluster.clusterId);

    return {
      rank: index + 1,
      cluster_id: cluster.clusterId,
      cluster_label: cluster.clusterName,
      display_topic_title: getInsightTitle(primary?.subcluster_label ?? cluster.clusterName),
      topic_subtitle: cluster.topInsightLabel
        ? `Latest ${getInsightVisual(cluster.topInsightType).label.toLowerCase()} signal: ${cluster.topInsightLabel}.`
        : "Live v4.0 cluster insight.",
      trend_strength_score: cluster.topInsightScore ?? primary?.insight_score ?? 0,
      decision_label: getDecisionLabelFromInsightType(cluster.topInsightType ?? primary?.insight_type),
      trend_summary: primary?.insight_text ?? "Live insight loaded from the local API.",
      opportunity_summary: primary?.insight_text ?? "Live insight loaded from the local API.",
      risk_summary: primary?.insight_text ?? "Live insight loaded from the local API.",
      growth_since_freeze_pct: metric ?? 0,
      latest_n_videos: cluster.insights.length,
      t60_is_winner: true,
      weeks_observed: null,
      consecutive_up_weeks: null,
      score_anchor: cluster.topInsightType ?? "LIVE_INSIGHT",
      trend_confidence: cluster.topInsightScore ?? primary?.insight_score,
      trend_direction: metric === undefined ? "LIVE" : metric >= 0 ? "UP" : "DOWN",
      latest_snapshot_date: cluster.snapshotDate,
      t60_actual_rank: null,
      t60_growth_pct: null,
      failure_risk_level: staticFailureRisk?.failure_risk_level,
      failure_risk_reason_code: staticFailureRisk?.failure_risk_reason_code,
      failure_risk_score: staticFailureRisk?.failure_risk_score,
      liveCluster: cluster,
    };
  });
}

function getDecisionLabelFromInsightType(insightType?: InsightType) {
  if (insightType === "WEAKENING_SEGMENT" || insightType === "FAILED_BREAKOUT") {
    return "WEAK_OR_RISK";
  }

  if (insightType === "INTERNAL_OUTPERFORMER") {
    return "STRONG_TREND";
  }

  return "EMERGING";
}

function getGrowthFraction(topic: LeaderboardRow) {
  if (topic.liveCluster) {
    return topic.growth_since_freeze_pct;
  }

  return topic.growth_since_freeze_pct / 100;
}

function getSparklinePoints(topic: LeaderboardRow) {
  const growth = Math.max(-0.45, Math.min(0.75, getGrowthFraction(topic)));
  const confidence = getConfidenceValue(topic);
  const stability = topic.t60_is_winner ? 0.08 : -0.05;
  const weeks = Math.min(1, Math.max(0, (topic.weeks_observed ?? 4) / 12));
  const direction = growth >= 0 ? 1 : -1;
  const slope = growth * 54;
  const baseline = 62 - confidence * 18;
  const wave = (1 - weeks) * 7;
  const raw = [0, 0.14, 0.29, 0.45, 0.61, 0.78, 1].map((position, index) => {
    const drift = slope * position;
    const lift = index > 3 ? confidence * 7 + stability * 22 : 0;
    const wobble = Math.sin((position * Math.PI * 2) + topic.rank) * wave;
    const y = baseline - drift - lift + wobble * direction;

    return {
      x: Math.round(position * 100),
      y: Math.max(14, Math.min(86, y)),
    };
  });

  return raw;
}

function normalizeAnchor(anchor: string) {
  return anchor.toLowerCase().split("_").join(" ");
}

function ensureThreeInsights(insights: ClusterInsight[], topic: LeaderboardRow) {
  const padded = [...insights];

  while (padded.length < 3) {
    padded.push({
      cluster_rank: topic.rank,
      subcluster_label: "additional model insight",
      insight_text: "Additional v4.0 insight is not present in the local data export yet.",
      insight_score: Math.max(0.1, topic.trend_strength_score - padded.length * 0.1),
      signal_state: "Weakening",
    });
  }

  return padded.slice(0, 3);
}

function summarizeInsight(text: string) {
  const words = text.split(" ");
  if (words.length <= 24) return text;
  return `${words.slice(0, 24).join(" ")}.`;
}

function getWhyTrendPoints(topic: LeaderboardRow, primaryInsight?: ClusterInsight) {
  const evidence = summarizeInsight(primaryInsight?.insight_text || topic.trend_summary || topic.opportunity_summary);
  const risk = topic.risk_summary ? summarizeInsight(topic.risk_summary) : "";

  return [
    evidence,
    `${mapOpportunityState(topic)} opportunity with ${mapConfidence(topic).toLowerCase()}.`,
    risk || getRecommendedActionPlaceholder(topic),
  ].filter(Boolean);
}

function formatSnapshotDate(value?: string) {
  if (!value) return "V4.0";
  return value.slice(0, 10);
}

function getInsightVisualForInsight(insight?: ClusterInsight) {
  if (insight?.insight_type) {
    return getInsightVisual(insight.insight_type);
  }

  const signalState = normalizeSignalState(insight?.signal_state);
  if (signalState === "Failed breakout") return getInsightVisual("FAILED_BREAKOUT");
  if (signalState === "Weakening") return getInsightVisual("WEAKENING_SEGMENT");
  return getInsightVisual("EMERGING_DRIVER");
}

function normalizeSignalState(state: ClusterInsight["signal_state"]): SignalState {
  const normalized = state?.toLowerCase() ?? "";

  if (normalized.includes("failed")) return "Failed breakout";
  if (normalized.includes("weak")) return "Weakening";
  return "Emerging";
}

function getInsightTimeline(insights: ClusterInsight[]) {
  return getMeaningfulInsightTimeline(insights);

  return insights.map((insight) => {
    const visual = getInsightVisualForInsight(insight);
    const metric =
      insight.insight_type === "WEAKENING_SEGMENT" || insight.insight_type === "FAILED_BREAKOUT"
        ? insight.share_delta
        : insight.relative_growth_spread;

    return {
      label: `${formatSnapshotDate(insight.snapshot_date ?? insight.observed_at)} · ${visual.label}`,
      helper: `${insight.subcluster_label} · ${formatPP(metric)}`,
      tone: visual.tone,
    };
  });
}

function getMeaningfulInsightTimeline(insights: ClusterInsight[]) {
  const seen = new Set<string>();

  return insights
    .filter((insight) => {
      const metric = getInsightMetric(insight).value;
      const key = `${insight.snapshot_date ?? insight.observed_at}-${insight.insight_type ?? insight.signal_state}-${insight.subcluster_label}-${metric}`;

      if (metric === "—" || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, 3)
    .map((insight) => {
      const visual = getInsightVisualForInsight(insight);
      const metric = getInsightMetric(insight).value;

      return {
        label: `${formatSnapshotDate(insight.snapshot_date ?? insight.observed_at)} -> ${visual.label} (${metric})`,
        helper: insight.subcluster_label,
        tone: visual.tone,
      };
    });
}

function getTimelineClass(tone: Tone) {
  if (tone === "positive") {
    return "border-emerald-300/40 bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.28)]";
  }

  if (tone === "watch") {
    return "border-amber-300/40 bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.20)]";
  }

  if (tone === "risk") {
    return "border-rose-300/40 bg-rose-300 shadow-[0_0_18px_rgba(251,113,133,0.20)]";
  }

  return "border-white/20 bg-white/30";
}
