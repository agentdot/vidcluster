import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { Lock, Star } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import DashboardDataStatus from "../components/DashboardDataStatus";
import SiteHeader from "../components/SiteHeader";
import PageSeo from "../components/seo/PageSeo";
import fallbackClusterTimeseriesRows from "../data/cluster_timeseries_v3_3.json";
import fallbackLeaderboardRows from "../data/leaderboard_v3_3.json";
import clusterInsightRows from "../data/v4_0_cluster_insights.json";
import { useDashboardExportData } from "../hooks/useDashboardExportData";
import { useDiscoveryOpportunities, type DiscoveryOpportunity } from "../hooks/useDiscoveryOpportunities";
import { useInsightClusters, type Insight, type InsightCluster, type InsightType } from "../hooks/useInsightClusters";
import { useWatchlist } from "../hooks/useWatchlist";
import { cn } from "../lib/utils";

type LeaderboardRow = {
  cluster_id?: string;
  rank: number;
  display_topic_title: string;
  display_title?: string;
  title?: string;
  topic_subtitle: string;
  cluster_label?: string;
  trend_strength_score: number;
  decision_label: string;
  trend_summary: string;
  opportunity_summary: string;
  risk_summary: string;
  growth_since_freeze_pct: number | null;
  topic_growth_pct?: number | null;
  previous_n_videos?: number | null;
  video_delta_abs?: number | null;
  video_delta_pct?: number | null;
  video_delta_direction?: "up" | "flat" | "down" | "unknown" | string | null;
  comparison_window?: string | null;
  comparison_previous_date?: string | null;
  comparison_latest_date?: string | null;
  growth_pct?: number | null;
  since_first_pct?: number | null;
  latest_growth_pct?: number | null;
  wow_abs?: number | null;
  normalized_score?: number | null;
  opportunity_score_v3?: number | null;
  latest_n_videos: number;
  t60_is_winner: boolean;
  weeks_observed: number | null;
  consecutive_up_weeks: number | null;
  score_anchor: string;
  trend_state?: string;
  trend_confidence?: number;
  trend_direction?: string;
  opportunity_tier?: string;
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
  health_label?: string;
  drift_alert?: string;
  score_method?: string;
  visual_state_override?: "HOT" | "WARM" | "COLD" | "DECAY" | "BREAKOUT";
  liveCluster?: InsightCluster;
};

type ClusterTimeseriesRow = {
  cluster_id?: string;
  snapshot_date?: string;
  tracked_video_count?: number | null;
  n_videos_current?: number | null;
  n_videos?: number | null;
  n_videos_prev?: number | null;
  wow_abs?: number | null;
  topic_growth_pct?: number | null;
  latest_n_videos?: number | null;
  previous_n_videos?: number | null;
  video_delta_abs?: number | null;
  video_delta_pct?: number | null;
  video_delta_direction?: "up" | "flat" | "down" | "unknown" | string | null;
  comparison_window?: string | null;
  comparison_previous_date?: string | null;
  comparison_latest_date?: string | null;
  growth_pct?: number | null;
  since_first_pct?: number | null;
  latest_growth_pct?: number | null;
  trend_strength_score?: number | null;
};

function buildLatestTimeseriesByClusterId(rows: ClusterTimeseriesRow[]) {
  return new Map(
    rows
    .filter((row) => row.cluster_id)
    .sort((a, b) => String(a.snapshot_date ?? "").localeCompare(String(b.snapshot_date ?? "")))
    .map((row) => [normalizeClusterId(row.cluster_id), row]),
  );
}

type UserPlan = "explorer" | "pro" | "advanced";
type Tone = "neutral" | "positive" | "watch" | "risk";
type PillFamily = "growth" | "format" | "risk" | "neutral";
type SignalBriefState = "hot" | "warm" | "cold" | "decay" | "breakout";
type SnapshotDeltaState = "positive" | "negative" | "neutral" | "unknown";
type InterestPreviewStatus = "no_history" | "needs_history" | "steady" | "rising" | "cooling" | "mixed";
type InterestPreviewMetricKind = "topic_growth_pct" | "wow_abs" | "video_count";
type SparklinePoint = { x: number; y: number };
type SnapshotDeltaVisual = { label: string; state: SnapshotDeltaState; badgeClassName: string };
type RawLeaderboardRow = Partial<LeaderboardRow> & {
  rank: number;
};
type SignalState = "Emerging" | "Failed breakout" | "Weakening";
type ClusterInsight = Partial<Insight> & {
  cluster_id?: string;
  cluster_rank?: number;
  cluster_label?: string;
  subcluster_label: string;
  canonical_subcluster_label?: string | null;
  semantic_label_status?: string | null;
  display_label?: string | null;
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

function normalizeLeaderboardRow(topic: RawLeaderboardRow): LeaderboardRow {
  const presentation = topicPresentationByRank[topic.rank];
  const displayTitle = topic.display_topic_title || topic.cluster_label || topic.title || topic.cluster_id || `Cluster ${topic.rank}`;
  const topicSubtitle = getHumanTopicSubtitle(
    topic.topic_subtitle || presentation?.topic_subtitle || "Latest weekly topic signal.",
  );
  const growth = resolveGrowthFraction(topic);
  const decisionLabel = topic.decision_label || (growth !== null && growth < 0 ? "WEAK_OR_RISK" : "EMERGING");

  return {
    ...topic,
    cluster_label: topic.cluster_label ?? displayTitle,
    topic_subtitle: topicSubtitle,
    display_topic_title: displayTitle,
    display_title: topic.display_title ?? displayTitle,
    title: topic.title ?? displayTitle,
    trend_strength_score: topic.trend_strength_score ?? topic.trend_confidence ?? 0,
    decision_label: decisionLabel,
    trend_summary:
      topic.trend_summary ??
      `Canonical v4.0 ${topic.trend_direction?.toLowerCase() ?? "weekly"} signal for ${displayTitle}.`,
    opportunity_summary:
      topic.opportunity_summary ??
      `Latest snapshot has ${topic.latest_n_videos?.toLocaleString() ?? "unknown"} tracked videos.`,
    risk_summary:
      topic.risk_summary ??
      (topic.drift_alert && topic.drift_alert !== "NORMAL"
        ? `Observability drift alert: ${topic.drift_alert}.`
        : "No model-backed risk summary is available in this export yet."),
    growth_since_freeze_pct: growth === null ? null : growth * 100,
    latest_n_videos: topic.latest_n_videos ?? 0,
    t60_is_winner: topic.t60_is_winner ?? false,
    weeks_observed: topic.weeks_observed ?? null,
    consecutive_up_weeks: topic.consecutive_up_weeks ?? null,
    score_anchor: topic.score_anchor ?? topic.score_method ?? "v4_0_dashboard_export",
  };
}

function getHumanTopicSubtitle(value: string) {
  const canonicalMatch = value.trim().match(/^Derived from (\d+) canonical micro-niche labels$/i);
  if (canonicalMatch) {
    const count = canonicalMatch[1];
    return `Based on ${count} related topic example${count === "1" ? "" : "s"}.`;
  }

  return value;
}

const fallbackClusterTimeseries = fallbackClusterTimeseriesRows as ClusterTimeseriesRow[];
let activeClusterTimeseries = fallbackClusterTimeseries;
let activeLatestTimeseriesByClusterId = buildLatestTimeseriesByClusterId(fallbackClusterTimeseries);
let activeFailureRiskByClusterId = new Map<
  string | undefined,
  Pick<LeaderboardRow, "failure_risk_level" | "failure_risk_reason_code" | "failure_risk_score">
>();

function buildFailureRiskByClusterId(rows: LeaderboardRow[]) {
  return new Map(
    rows
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
}

const clusterInsights = clusterInsightRows as ClusterInsight[];
const SHOW_STATE_QA_CARDS = false;

const signalBriefQaFixtures: LeaderboardRow[] = [
  {
    rank: 1,
    cluster_id: "qa-hot-sustained",
    cluster_label: "QA Sustained Growth",
    display_topic_title: "Retirement Account Strategy Surge",
    topic_subtitle: "Evergreen finance demand compounding with strong week-to-week persistence.",
    trend_strength_score: 0.86,
    decision_label: "STRONG_TREND",
    trend_summary: "Sustained momentum with broad participation across adjacent retirement planning angles.",
    opportunity_summary: "Sustained momentum with broad participation across adjacent retirement planning angles.",
    risk_summary: "Low decay risk while confidence and format fit remain strong.",
    growth_since_freeze_pct: 38,
    latest_n_videos: 126,
    t60_is_winner: true,
    weeks_observed: 10,
    consecutive_up_weeks: 7,
    score_anchor: "STATE_QA_HOT",
    trend_confidence: 0.86,
    trend_direction: "UP",
    latest_snapshot_date: "2026-05-08",
    failure_risk_level: "LOW",
    failure_risk_score: 0.12,
    failure_risk_reason_code: "LOW_DECAY_RISK",
    dominant_video_format: "LONG",
    short_video_share: 0.14,
    midform_video_share: 0.22,
    long_video_share: 0.64,
    format_strategy_label: "LONG_HEAVY",
    format_strategy_summary: "Long-form explainers are carrying most of the durable demand.",
    visual_state_override: "HOT",
  },
  {
    rank: 2,
    cluster_id: "qa-breakout-hockey-stick",
    cluster_label: "QA Breakout",
    display_topic_title: "AI Budget Planner App Breakout",
    topic_subtitle: "Flat baseline turning sharply upward as new tool comparisons catch discovery.",
    trend_strength_score: 0.91,
    decision_label: "STRONG_TREND",
    trend_summary: "Breakout acceleration detected after several quiet weeks of baseline demand.",
    opportunity_summary: "Breakout acceleration detected after several quiet weeks of baseline demand.",
    risk_summary: "Execution window is active, but saturation has not arrived yet.",
    growth_since_freeze_pct: 64,
    latest_n_videos: 88,
    t60_is_winner: true,
    weeks_observed: 6,
    consecutive_up_weeks: 3,
    score_anchor: "STATE_QA_BREAKOUT",
    trend_confidence: 0.82,
    trend_direction: "UP",
    latest_snapshot_date: "2026-05-08",
    failure_risk_level: "LOW",
    failure_risk_score: 0.18,
    failure_risk_reason_code: "EARLY_BREAKOUT",
    dominant_video_format: "HYBRID",
    short_video_share: 0.35,
    midform_video_share: 0.25,
    long_video_share: 0.4,
    format_strategy_label: "HYBRID_FORMAT",
    format_strategy_summary: "Demand is split between fast comparison clips and deeper walkthroughs.",
    visual_state_override: "BREAKOUT",
  },
  {
    rank: 3,
    cluster_id: "qa-warm-emerging",
    cluster_label: "QA Warm Emerging",
    display_topic_title: "Beginner ETF Allocation Watchlist",
    topic_subtitle: "Early audience participation improving, but confidence still needs confirmation.",
    trend_strength_score: 0.61,
    decision_label: "EARLY_TREND",
    trend_summary: "Early signal building as beginner ETF questions spread across adjacent creator lanes.",
    opportunity_summary: "Early signal building as beginner ETF questions spread across adjacent creator lanes.",
    risk_summary: "Medium confidence means the signal should be tested before scaling.",
    growth_since_freeze_pct: 14,
    latest_n_videos: 54,
    t60_is_winner: false,
    weeks_observed: 5,
    consecutive_up_weeks: 2,
    score_anchor: "STATE_QA_WARM",
    trend_confidence: 0.58,
    trend_direction: "UP",
    latest_snapshot_date: "2026-05-08",
    failure_risk_level: "MEDIUM",
    failure_risk_score: 0.32,
    failure_risk_reason_code: "NEEDS_CONFIRMATION",
    dominant_video_format: "SHORT",
    short_video_share: 0.58,
    midform_video_share: 0.24,
    long_video_share: 0.18,
    format_strategy_label: "SHORT_HEAVY",
    format_strategy_summary: "Shorts are doing the early discovery work before deeper validation.",
    visual_state_override: "WARM",
  },
  {
    rank: 4,
    cluster_id: "qa-cold-plateau",
    cluster_label: "QA Cold Plateau",
    display_topic_title: "Budgeting Spreadsheet Template Plateau",
    topic_subtitle: "Mature search interest with stable demand but limited expansion pressure.",
    trend_strength_score: 0.39,
    decision_label: "EMERGING",
    trend_summary: "Interest is steady, but growth is limited.",
    opportunity_summary: "Interest is steady, but growth is limited.",
    risk_summary: "Flat participation suggests this is more maintenance topic than growth topic.",
    growth_since_freeze_pct: 2,
    latest_n_videos: 41,
    t60_is_winner: false,
    weeks_observed: 12,
    consecutive_up_weeks: 1,
    score_anchor: "STATE_QA_COLD",
    trend_confidence: 0.38,
    trend_direction: "FLAT",
    latest_snapshot_date: "2026-05-08",
    failure_risk_level: "MEDIUM",
    failure_risk_score: 0.42,
    failure_risk_reason_code: "FLAT_SATURATED",
    dominant_video_format: "MIDFORM",
    short_video_share: 0.22,
    midform_video_share: 0.56,
    long_video_share: 0.22,
    format_strategy_label: "MIDFORM_HEAVY",
    format_strategy_summary: "Mid-form tutorials fit the stable, utility-led demand profile.",
    visual_state_override: "COLD",
  },
  {
    rank: 5,
    cluster_id: "qa-decay-spike-fall",
    cluster_label: "QA Decay",
    display_topic_title: "Emergency Rate Cut Rumor Spike",
    topic_subtitle: "A sharp news-driven spike is rolling over as late-entry risk increases.",
    trend_strength_score: 0.48,
    decision_label: "WEAK_OR_RISK",
    trend_summary: "Peak likely passed after a short-lived rumor cycle and shrinking follow-on demand.",
    opportunity_summary: "Peak likely passed after a short-lived rumor cycle and shrinking follow-on demand.",
    risk_summary: "Failed breakout pattern with decay risk and weakening participation.",
    growth_since_freeze_pct: -18,
    latest_n_videos: 67,
    t60_is_winner: false,
    weeks_observed: 7,
    consecutive_up_weeks: 0,
    score_anchor: "STATE_QA_DECAY",
    trend_confidence: 0.46,
    trend_direction: "DOWN",
    latest_snapshot_date: "2026-05-08",
    failure_risk_level: "HIGH",
    failure_risk_score: 0.78,
    failure_risk_reason_code: "PEAK_PASSED_DECAY",
    dominant_video_format: "UNKNOWN",
    short_video_share: 0.18,
    midform_video_share: 0.26,
    long_video_share: 0.56,
    format_strategy_label: "UNKNOWN_FORMAT",
    format_strategy_summary: "Format fit is unclear because the spike was event-led rather than format-led.",
    visual_state_override: "DECAY",
  },
];

function getMockUserPlan(): UserPlan {
  return "explorer";
}

const userPlan = getMockUserPlan();
const hasPremiumAccess = userPlan === "pro" || userPlan === "advanced";
const EXPLORER_WATCHLIST_LIMIT = 2;
const STABLE_GROWTH_THRESHOLD = 0.0005;
const INTEREST_PREVIEW_DEBUG_CLUSTER_IDS = ["SC002", "SC161", "SC006"];
const ALL_SIGNALS_FILTER = "All Topics";
const STRONGEST_SIGNALS_FILTER = "Top Opportunities";
const EARLY_SIGNALS_FILTER = "New Interest";
const UNDER_OBSERVATION_FILTER = "Worth Watching";
const STABLE_PERSISTENT_FILTER = "Consistent Demand";
const SIGNAL_FILTERS = [
  ALL_SIGNALS_FILTER,
  STRONGEST_SIGNALS_FILTER,
  EARLY_SIGNALS_FILTER,
  UNDER_OBSERVATION_FILTER,
  STABLE_PERSISTENT_FILTER,
] as const;
type SignalFilter = (typeof SIGNAL_FILTERS)[number];
const DECISION_LABEL_MAP: Record<string, string> = {
  STRONG_TREND: "Sustained Growth",
  EARLY_TREND: "Early Opportunity",
  EMERGING: "Watch closely",
  WEAK_OR_RISK: "High Risk",
};

function mapDecisionLabel(label?: string) {
  if (!label) return "Not clear yet";
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

function mapEvidenceLabel(topic: LeaderboardRow) {
  const confidence = topic.trend_confidence ?? topic.trend_strength_score;
  if (confidence === null || confidence === undefined) return "Unavailable";
  const normalized = getConfidenceValue(topic);

  if (normalized >= 0.72) return "Strong";
  if (normalized >= 0.48) return "Moderate";
  return "Limited";
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
  const growth = getSortableGrowth(topic);
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
  return "Still developing";
}

function mapCompactWillLast(topic: LeaderboardRow) {
  if (topic.decision_label === "STRONG_TREND") return "Sustain";
  if (topic.decision_label === "EARLY_TREND") return "Validate";
  if (topic.decision_label === "EMERGING") return "Early";
  if (topic.t60_is_winner) return "Held";
  return "Developing";
}

function normalizeSignalToken(value?: string | null) {
  return value?.trim().toUpperCase().replace(/[\s-]+/g, "_") ?? "";
}

function hasSignalToken(fields: string[], tokens: string[]) {
  return tokens.some((token) => fields.includes(token));
}

function getSignalFields(topic: LeaderboardRow) {
  const trendState = normalizeSignalToken(topic.trend_state);
  const decision = normalizeSignalToken(topic.decision_label);
  const direction = normalizeSignalToken(topic.trend_direction);
  const opportunityTier = normalizeSignalToken(topic.opportunity_tier);
  const health = normalizeSignalToken(topic.health_label);
  const drift = normalizeSignalToken(topic.drift_alert);
  const scoreAnchor = normalizeSignalToken(topic.score_anchor);
  return { trendState, decision, direction, opportunityTier, health, drift, scoreAnchor };
}

function getSignalScore(topic: LeaderboardRow) {
  const candidates = [
    finiteNumber(topic.opportunity_score_v3),
    finiteNumber(topic.trend_strength_score),
    finiteNumber(topic.trend_confidence),
    finiteNumber(topic.normalized_score),
  ].filter((value): value is number => value !== null);

  if (candidates.length === 0) return null;

  const score = Math.max(...candidates);
  return score > 1 ? score / 100 : score;
}

function getStrongestSignalIds(topics: LeaderboardRow[]) {
  const scoredTopics = topics
    .map((topic) => ({ id: getTopicId(topic), score: getSignalScore(topic) }))
    .filter((topic): topic is { id: string; score: number } => topic.score !== null)
    .sort((a, b) => b.score - a.score);

  const strongestCount = Math.max(1, Math.ceil(scoredTopics.length * 0.2));
  return new Set(scoredTopics.slice(0, strongestCount).map((topic) => topic.id));
}

function getSignalFilters(topic: LeaderboardRow, strongestSignalIds: Set<string>) {
  const filters = new Set<SignalFilter>();
  const { trendState, decision, direction, opportunityTier, health, drift, scoreAnchor } = getSignalFields(topic);
  const fields = [trendState, decision, direction, opportunityTier, health, drift, scoreAnchor].filter(Boolean);
  const score = getSignalScore(topic);
  const isStrongest =
    strongestSignalIds.has(getTopicId(topic)) ||
    hasSignalToken(fields, [
      "HIGH",
      "TOP",
      "STRONG",
      "TIER_1",
      "STRONG_OPPORTUNITY",
      "ACCELERATING",
      "ACCELERATION",
      "BREAKOUT",
      "STRONG_TREND",
      "INTERNAL_OUTPERFORMER",
    ]);
  const isUnderObservation =
    hasSignalToken(fields, [
      "WATCHLIST",
      "WATCHLIST_SIGNAL",
      "UNDER_OBSERVATION",
      "INSUFFICIENT_DATA",
      "NEEDS_REVIEW",
      "WEAK_OR_RISK",
      "FAILED_BREAKOUT",
      "WEAKENING_SEGMENT",
      "UNSTABLE",
      "CAUTION",
      "WARNING",
      "ALERT",
    ]) ||
    (Boolean(drift) && drift !== "NORMAL") ||
    score === null ||
    score < 0.48;
  const isEarly = hasSignalToken(fields, ["EMERGING", "EARLY_TREND", "EARLY_BREAKOUT", "EMERGING_SIGNAL"]);
  const isStable =
    hasSignalToken(fields, ["STABLE", "PERSISTENT", "NORMAL", "HEALTHY"]) &&
    !isStrongest &&
    direction !== "UP";

  if (isStrongest) {
    filters.add(STRONGEST_SIGNALS_FILTER);
  }

  if (isEarly && !isStrongest) {
    filters.add(EARLY_SIGNALS_FILTER);
  }

  if (isUnderObservation) {
    filters.add(UNDER_OBSERVATION_FILTER);
  }

  if (isStable) {
    filters.add(STABLE_PERSISTENT_FILTER);
  }

  return filters;
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

function getSignalBriefState(topic: LeaderboardRow): SignalBriefState {
  if (SHOW_STATE_QA_CARDS && topic.visual_state_override) {
    if (topic.visual_state_override === "BREAKOUT") return "breakout";
    return topic.visual_state_override.toLowerCase() as SignalBriefState;
  }

  const decision = topic.decision_label.toUpperCase();
  const riskLevel = topic.failure_risk_level?.toUpperCase() ?? "";
  const riskReason = `${topic.failure_risk_reason_code ?? ""} ${topic.risk_summary ?? ""}`.toUpperCase();
  const riskScore = topic.failure_risk_score ?? 0;
  const confidence = getConfidenceValue(topic);
  const growth = getSortableGrowth(topic);
  const opportunityState = mapOpportunityState(topic);

  if (
    decision.includes("WEAK") ||
    riskLevel === "HIGH" ||
    riskLevel === "CRITICAL" ||
    riskScore >= 0.6 ||
    riskReason.includes("FAILED") ||
    riskReason.includes("DECAY") ||
    riskReason.includes("WEAKEN") ||
    riskReason.includes("PEAK") ||
    growth < -0.03
  ) {
    return "decay";
  }

  if (
    (decision.includes("STRONG") || decision.includes("SUSTAINED") || opportunityState === "Scaling") &&
    confidence >= 0.68 &&
    growth >= 0.12 &&
    riskLevel !== "MEDIUM" &&
    riskLevel !== "MODERATE"
  ) {
    return "hot";
  }

  if (confidence < 0.42 || growth < 0.04 || riskReason.includes("SATURATED") || riskReason.includes("FLAT")) {
    return "cold";
  }

  if (decision.includes("EARLY") || decision.includes("EMERGING") || confidence >= 0.48 || growth >= 0.08) {
    return "warm";
  }

  return "cold";
}

function getSignalBriefVisual(state: SignalBriefState) {
  if (state === "hot") {
    return {
      label: "HOT",
      accent: "bg-emerald-300",
      border: "border-emerald-300/22",
      bg: "bg-emerald-300/[0.035]",
      hoverBg: "hover:bg-emerald-300/[0.045]",
      ring: "ring-emerald-200/12",
      text: "text-emerald-100",
      badge: "border-emerald-300/26 bg-emerald-300/[0.08] text-emerald-100",
      read: "ring-emerald-300/16 bg-emerald-300/[0.035] shadow-[0_16px_40px_rgba(16,185,129,0.06)]",
      stroke: "rgb(110 231 183)",
      dash: "",
    };
  }

  if (state === "breakout") {
    return {
      label: "BREAKOUT",
      accent: "bg-[linear-gradient(180deg,rgb(250,204,21),rgb(52,211,153))]",
      border: "border-lime-300/24",
      bg: "bg-lime-300/[0.035]",
      hoverBg: "hover:bg-lime-300/[0.045]",
      ring: "ring-lime-200/12",
      text: "text-lime-100",
      badge: "border-lime-300/28 bg-lime-300/[0.085] text-lime-100",
      read: "ring-lime-300/18 bg-lime-300/[0.04] shadow-[0_16px_40px_rgba(132,204,22,0.07)]",
      stroke: "rgb(190 242 100)",
      dash: "",
    };
  }

  if (state === "warm") {
    return {
      label: "WARM",
      accent: "bg-sky-300",
      border: "border-sky-300/20",
      bg: "bg-sky-300/[0.03]",
      hoverBg: "hover:bg-sky-300/[0.04]",
      ring: "ring-sky-200/12",
      text: "text-sky-100",
      badge: "border-sky-300/24 bg-sky-300/[0.075] text-sky-100",
      read: "ring-sky-300/16 bg-sky-300/[0.03] shadow-[0_16px_40px_rgba(14,165,233,0.05)]",
      stroke: "rgb(125 211 252)",
      dash: "",
    };
  }

  if (state === "cold") {
    return {
      label: "Steady Interest",
      accent: "bg-violet-300",
      border: "border-violet-300/20",
      bg: "bg-violet-300/[0.028]",
      hoverBg: "hover:bg-violet-300/[0.038]",
      ring: "ring-violet-200/12",
      text: "text-violet-100",
      badge: "border-violet-300/24 bg-violet-300/[0.075] text-violet-100",
      read: "ring-violet-300/16 bg-violet-300/[0.03] shadow-[0_16px_40px_rgba(139,92,246,0.05)]",
      stroke: "rgb(196 181 253)",
      dash: "4 5",
    };
  }

  return {
    label: "DECAY",
    accent: "bg-rose-300",
    border: "border-rose-300/24",
    bg: "bg-rose-300/[0.035]",
    hoverBg: "hover:bg-rose-300/[0.045]",
    ring: "ring-rose-200/12",
    text: "text-rose-100",
    badge: "border-rose-300/26 bg-rose-300/[0.08] text-rose-100",
    read: "ring-rose-300/18 bg-rose-300/[0.04] shadow-[0_16px_40px_rgba(244,63,94,0.07)]",
    stroke: "rgb(253 164 175)",
    dash: "6 5",
  };
}

function getSignalRead(topic: LeaderboardRow, state: SignalBriefState) {
  if (state === "decay") return "Peak likely passed. Late-entry risk is increasing.";
  if (state === "breakout") return "Breakout acceleration detected in recent weeks.";
  if (state === "hot") return "Sustained momentum with strong persistence.";
  if (state === "warm") return "Early signal building with improving participation.";
  if (state === "cold") return "Interest is steady, but growth is limited.";

  return summarizeInsight(topic.opportunity_summary || topic.trend_summary || topic.topic_subtitle);
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
  return topic.display_topic_title || topic.cluster_label || topic.title || topic.cluster_id || "Untitled topic";
}

function formatScore(score: number) {
  return `${Math.round(score * 100)}`;
}

function finiteNumber(value?: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function pctToFraction(value: number) {
  return Math.abs(value) > 1 ? value / 100 : value;
}

function resolveGrowthFraction(topic: Partial<LeaderboardRow>) {
  const timeseries = topic.cluster_id ? activeLatestTimeseriesByClusterId.get(normalizeClusterId(topic.cluster_id)) : undefined;
  const canonicalGrowth =
    finiteNumber(topic.video_delta_pct) ??
    finiteNumber(timeseries?.video_delta_pct);

  if (canonicalGrowth !== null) return canonicalGrowth;

  const legacyGrowth =
    finiteNumber(topic.topic_growth_pct) ??
    finiteNumber(timeseries?.topic_growth_pct) ??
    finiteNumber(topic.growth_pct) ??
    finiteNumber(timeseries?.growth_pct) ??
    finiteNumber(topic.since_first_pct) ??
    finiteNumber(timeseries?.since_first_pct) ??
    finiteNumber(topic.latest_growth_pct) ??
    finiteNumber(timeseries?.latest_growth_pct) ??
    finiteNumber(topic.growth_since_freeze_pct);

  if (legacyGrowth !== null) return pctToFraction(legacyGrowth);

  return null;
}

function formatPercent(value?: number | null) {
  if (value === null || value === undefined) return "—";
  const percent = value * 100;
  if (percent === 0) return "0.0%";
  return `${percent > 0 ? "+" : "−"}${Math.abs(percent).toFixed(1)}%`;
}

function isStableGrowth(value?: number | null) {
  return value !== null && value !== undefined && Math.abs(value) <= STABLE_GROWTH_THRESHOLD;
}

function formatGrowthPercent(value?: number | null) {
  if (value === null || value === undefined) return "—";
  if (isStableGrowth(value)) return "Steady";
  return formatPercent(value);
}

function formatPP(value?: number | null) {
  if (value === null || value === undefined) return "—";
  const points = value * 100;
  return `${points >= 0 ? "+" : ""}${points.toFixed(1)}pp`;
}

const FORMAT_STRATEGY_LABELS: Record<string, string> = {
  SHORT_HEAVY: "Mostly short videos",
  MIDFORM_HEAVY: "Mostly mid-length videos",
  LONG_HEAVY: "Mostly long videos",
  HYBRID_FORMAT: "Mixed video lengths",
  UNKNOWN_FORMAT: "Not clear yet",
};

function getFormatStrategyLabel(topic: LeaderboardRow) {
  return FORMAT_STRATEGY_LABELS[topic.format_strategy_label ?? "UNKNOWN_FORMAT"] ?? "Not clear yet";
}

function getFormatVisual(topic: LeaderboardRow) {
  const label = topic.format_strategy_label;

  if (label === "SHORT_HEAVY") {
    return {
      value: "Shorts",
      text: "text-sky-100",
      dot: "bg-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.28)]",
    };
  }

  if (label === "MIDFORM_HEAVY") {
    return {
      value: "Mid-form",
      text: "text-violet-100",
      dot: "bg-violet-300 shadow-[0_0_12px_rgba(167,139,250,0.26)]",
    };
  }

  if (label === "LONG_HEAVY") {
    return {
      value: "Long",
      text: "text-emerald-100",
      dot: "bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.26)]",
    };
  }

  if (label === "HYBRID_FORMAT") {
    return {
      value: "Mixed",
      text: "text-cyan-100",
      dot: "bg-[linear-gradient(135deg,rgb(103,232,249),rgb(196,181,253))]",
    };
  }

  return {
    value: "Not clear yet",
    text: "text-slate-100/62",
    dot: "bg-slate-400/55",
  };
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
  return "Not clear yet";
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

type SemanticLabelLike = {
  subcluster_label?: string | null;
  canonical_subcluster_label?: string | null;
  display_label?: string | null;
};

function hasUsableLabel(value?: string | null) {
  return Boolean(value?.trim() && value.trim().toLowerCase() !== "needs review");
}

function getVisibleSubclusterLabel(row?: SemanticLabelLike) {
  if (!row) return undefined;
  if (hasUsableLabel(row.display_label)) return row.display_label?.trim();
  if (hasUsableLabel(row.canonical_subcluster_label)) return row.canonical_subcluster_label?.trim();
  return row.subcluster_label?.trim() || undefined;
}

function getClusterDisplayTitle(topic: LeaderboardRow, primaryInsight?: ClusterInsight) {
  const label = getVisibleSubclusterLabel(primaryInsight);
  if (label) {
    return getInsightTitle(label);
  }

  return getTopicTitle(topic);
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
  if (!value) return "Not assessed yet";
  return formatSelectedLabel(value.split("_").join(" "));
}

function formatCompactFailureRiskValue(value?: string | null) {
  if (!value) return "Not assessed yet";
  return formatFailureRiskValue(value);
}

function formatFailureRiskScore(score?: number | null) {
  if (score === null || score === undefined) return "Not assessed yet";
  return `${Math.round(score * 100)}%`;
}

function formatRiskAssessment(topic: LeaderboardRow) {
  if (!topic.failure_risk_level && topic.failure_risk_score === null) return "Not assessed yet";
  if (!topic.failure_risk_level && topic.failure_risk_score === undefined) return "Not assessed yet";
  return `${formatFailureRiskValue(topic.failure_risk_level)} / ${formatFailureRiskScore(topic.failure_risk_score)}`;
}

function getCompactRiskMetric(topic: LeaderboardRow) {
  if (!hasFailureRiskSignal(topic)) {
    return {
      label: "Trend Risk",
      value: "Coming Soon",
      tone: "neutral" as Tone,
    };
  }

  return {
    label: "Trend Risk",
    value: formatCompactFailureRiskValue(topic.failure_risk_level),
    tone: getFailureRiskTone(topic),
  };
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
  helper,
  tone = "neutral",
}: {
  label: string;
  value: string;
  helper?: string;
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
      {helper ? <div className="mt-1 truncate text-xs text-white/38">{helper}</div> : null}
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dashboardData = useDashboardExportData();
  const dashboardLeaderboardStatic = useMemo(() => {
    const timeseriesSource =
      (dashboardData.data.timeseries as ClusterTimeseriesRow[]).length > 0
        ? (dashboardData.data.timeseries as ClusterTimeseriesRow[])
        : fallbackClusterTimeseries;
    activeClusterTimeseries = timeseriesSource;
    activeLatestTimeseriesByClusterId = buildLatestTimeseriesByClusterId(timeseriesSource);
    logInterestPreviewDebugChecks(timeseriesSource, {
      phase: "dashboard-data-resolved",
      source: dashboardData.source,
    });

    const leaderboardSource =
      (dashboardData.data.dashboard as RawLeaderboardRow[]).length > 0
        ? (dashboardData.data.dashboard as RawLeaderboardRow[])
        : (fallbackLeaderboardRows as unknown as RawLeaderboardRow[]);
    const normalized = leaderboardSource.map(normalizeLeaderboardRow);
    activeFailureRiskByClusterId = buildFailureRiskByClusterId(normalized);
    return normalized;
  }, [dashboardData.data.dashboard, dashboardData.data.timeseries, dashboardData.source]);
  const requestedClusterId = searchParams.get("cluster")?.trim() || null;
  const requestedSubclusterId = searchParams.get("subcluster")?.trim() || null;
  const openedFromDiscovery = searchParams.get("from") === "discovery";
  const [selectedRank, setSelectedRank] = useState(dashboardLeaderboardStatic[0]?.rank ?? 1);
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSignalFilter, setActiveSignalFilter] = useState<SignalFilter>(ALL_SIGNALS_FILTER);
  const [watchlistLimitMessage, setWatchlistLimitMessage] = useState("");
  const { watchedTopicIds, isWatched, addTopic, removeTopic } = useWatchlist();
  const { clusters: insightClusters, loading: clustersLoading, error: clustersError } = useInsightClusters();
  const { opportunities: discoveryOpportunities } = useDiscoveryOpportunities();
  const hasLiveClusters = insightClusters.length > 0 && !clustersError;
  const dashboardLeaderboard = useMemo(
    () => {
      if (SHOW_STATE_QA_CARDS) return signalBriefQaFixtures;
      return hasLiveClusters ? mapClustersToLeaderboard(insightClusters) : dashboardLeaderboardStatic;
    },
    [dashboardLeaderboardStatic, hasLiveClusters, insightClusters],
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
    getVisibleSubclusterLabel(requestedDiscoveryOpportunity) ||
    requestedDiscoveryOpportunity?.intent_label ||
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
  const watchedTopics = dashboardLeaderboard.filter((topic) => isWatched(getTopicId(topic)));
  const planLimitedLeaderboard = hasPremiumAccess ? dashboardLeaderboard : dashboardLeaderboard.slice(0, 5);
  const planVisibleLeaderboard = getLeaderboardWithRequestedTopic(planLimitedLeaderboard, selectedTopic, requestedClusterId);
  const monitoredClusterCount = dashboardLeaderboardStatic.length;
  const highlightedSignalCount = planVisibleLeaderboard.length;
  const strongestSignalIds = useMemo(() => getStrongestSignalIds(planVisibleLeaderboard), [planVisibleLeaderboard]);
  const signalFilterCounts = useMemo(
    () =>
      SIGNAL_FILTERS.reduce(
        (counts, filter) => {
          counts[filter] =
            filter === ALL_SIGNALS_FILTER
              ? planVisibleLeaderboard.length
              : planVisibleLeaderboard.filter((topic) => getSignalFilters(topic, strongestSignalIds).has(filter)).length;
          return counts;
        },
        {} as Record<SignalFilter, number>,
      ),
    [planVisibleLeaderboard, strongestSignalIds],
  );

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.info("[Dashboard] signal filter counts", signalFilterCounts);
    }
  }, [signalFilterCounts]);

  const visibleLeaderboard = planVisibleLeaderboard.filter((topic) => {
    const topicText = `${getTopicTitle(topic)} ${topic.topic_subtitle} ${topic.cluster_label ?? ""}`.toLowerCase();
    const matchesSearch = topicText.includes(searchQuery.trim().toLowerCase());
    const signalFilters = getSignalFilters(topic, strongestSignalIds);
    const matchesSignalFilter = activeSignalFilter === ALL_SIGNALS_FILTER || signalFilters.has(activeSignalFilter);
    const matchesWatchlist = !showWatchlistOnly || isWatched(getTopicId(topic)) || topic.cluster_id === requestedClusterId;

    return matchesSearch && matchesSignalFilter && matchesWatchlist;
  });
  const topSignals = useMemo(() => getTopSignals(planVisibleLeaderboard), [planVisibleLeaderboard]);
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

  const handleOpenCluster = (topic: LeaderboardRow) => {
    setSelectedRank(topic.rank);

    if (topic.cluster_id) {
      // TODO: Move to human-readable slug routes, e.g. /dashboard/cluster/recession-risk-market-commentary.
      navigate(`/dashboard/cluster/${encodeURIComponent(topic.cluster_id)}`);
    }
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
            monitoredClusterCount={monitoredClusterCount}
            highlightedSignalCount={highlightedSignalCount}
            hasPremiumAccess={hasPremiumAccess}
            clustersLoading={clustersLoading}
            clustersError={clustersError}
          />
          <p className="text-sm text-white/48">
            Showing {highlightedSignalCount.toLocaleString()} visible signals from{" "}
            {monitoredClusterCount.toLocaleString()} tracked topics.
          </p>
          <DashboardDataStatus state={dashboardData} />
          <CategoryStrip
            categories={SIGNAL_FILTERS}
            activeCategory={activeSignalFilter}
            onChange={setActiveSignalFilter}
          />
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
                        onSelect={() => handleOpenCluster(topic)}
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
        </div>
      </main>
    </div>
  );
}

function DashboardHeader({
  monitoredClusterCount,
  highlightedSignalCount,
  hasPremiumAccess,
  clustersLoading,
  clustersError,
}: {
  monitoredClusterCount: number;
  highlightedSignalCount: number;
  hasPremiumAccess: boolean;
  clustersLoading: boolean;
  clustersError?: string | null;
}) {
  return (
    <header className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SignalPill>Signal radar</SignalPill>
            <SignalPill>{hasPremiumAccess ? "All insights" : "Research preview"}</SignalPill>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-white">
            Topic Opportunity Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/56">
            Track high-confidence YouTube topic signals, understand why they are moving, and decide what deserves deeper
            research.
          </p>
          {clustersLoading ? <p className="mt-2 text-xs text-white/40">Loading live insights...</p> : null}
          {clustersError ? (
            <p className="mt-2 text-xs text-amber-100/62">Showing the latest weekly topic view.</p>
          ) : null}
        </div>
        <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:min-w-[480px] sm:grid-cols-3">
          <MetricCard
            label="Topics tracked"
            value={monitoredClusterCount.toLocaleString()}
            helper="Current snapshot"
          />
          <MetricCard
            label="Visible signals"
            value={highlightedSignalCount.toLocaleString()}
            helper="Explorer preview"
            tone="positive"
          />
          <MetricCard
            label="Data status"
            value="Ready"
            helper="Latest snapshot checked"
            tone="positive"
          />
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
  categories: readonly SignalFilter[];
  activeCategory: SignalFilter;
  onChange: (category: SignalFilter) => void;
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
          placeholder="Search topics or opportunities"
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
          3 Topics Worth Attention
        </div>
        <div className="text-xs text-white/36">Quick Overview</div>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {signals.map((signal) => {
          const growth = getGrowthFraction(signal.topic);
          const stableGrowth = isStableGrowth(growth);
          return (
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
                  stableGrowth ? "text-slate-100/66" : getSortableGrowth(signal.topic) >= 0 ? "text-emerald-200/82" : "text-rose-200/82",
                )}
              >
                {formatGrowthPercent(growth)}
              </span>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

function SignalSparkline({
  topic,
  visual,
}: {
  topic: LeaderboardRow;
  visual: ReturnType<typeof getSignalBriefVisual>;
}) {
  const preview = getInterestPreview(topic);
  const points = preview.points;
  const hasTrendLine = points.length >= 2;
  const path = buildSparklinePath(points);
  const areaPath = hasTrendLine ? buildSparklineAreaPath(points, path, 88) : "";
  const stroke = visual.stroke;
  const gradientId = `sparkline-gradient-${topic.rank}`;
  const glowId = `sparkline-glow-${topic.rank}`;
  const startPoint = points[0];
  const currentPoint = points[points.length - 1];
  const hasHistory = preview.values.length > 0;

  return (
    <div className="relative mt-5 h-[148px] overflow-hidden rounded-xl border border-slate-200/10 bg-[#05090e] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.032),transparent_44%),radial-gradient(circle_at_78%_18%,rgba(125,211,252,0.055),transparent_34%)]" />
      <svg
        className="absolute inset-x-3 bottom-9 top-11 h-[86px] w-[calc(100%-24px)]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-30%" width="140%" height="160%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {areaPath ? <path d={areaPath} fill={`url(#${gradientId})`} /> : null}
        <path d="M 8 74 L 92 74" stroke="rgba(148,163,184,0.12)" strokeDasharray="3 5" strokeWidth="1" />
        {hasTrendLine ? (
          <>
            <path
              d={path}
              fill="none"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.30"
              strokeWidth="4"
              vectorEffect="non-scaling-stroke"
              filter={`url(#${glowId})`}
            />
            <path
              d={path}
              fill="none"
              stroke={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.96"
              strokeWidth="1.6"
              vectorEffect="non-scaling-stroke"
            />
          </>
        ) : null}

        {startPoint && hasTrendLine ? (
          <g>
            <circle cx={startPoint.x} cy={startPoint.y} fill={stroke} opacity="0.14" r="2" />
            <circle cx={startPoint.x} cy={startPoint.y} fill="#05090e" r="1.6" stroke={stroke} strokeOpacity="0.72" strokeWidth="0.65" />
          </g>
        ) : null}
        {currentPoint ? (
          <g>
            <circle cx={currentPoint.x} cy={currentPoint.y} fill={stroke} opacity="0.18" r={hasTrendLine ? "2" : "3.5"} />
            <circle cx={currentPoint.x} cy={currentPoint.y} fill={stroke} r="2" stroke="rgba(24, 177, 34, 0.90)" strokeWidth="0.5" />
          </g>
        ) : null}
      </svg>
      <div className="absolute left-3 top-3 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-200/34">
        {hasTrendLine ? preview.metric.label : "Recent Movement"}
      </div>
      <div className="absolute left-3 right-3 top-7 text-[11px] leading-4 text-slate-200/40">
        Based on recent topic growth where available.
      </div>
      <div
        className={cn(
          "absolute bottom-3 left-3 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
          getInterestPreviewBadgeClass(preview.status),
        )}
      >
        {preview.label}
      </div>
      {!hasHistory ? <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/42">No history yet</div> : null}
    </div>
  );
}

function buildLinearPath(points: SparklinePoint[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${roundPathNumber(point.x)} ${roundPathNumber(point.y)}`).join(" ");
}

function buildSparklinePath(points: SparklinePoint[]) {
  if (points.length < 3) return buildLinearPath(points);

  const slopes = points.slice(0, -1).map((point, index) => {
    const next = points[index + 1];
    const dx = next.x - point.x;
    return dx === 0 ? 0 : (next.y - point.y) / dx;
  });
  const tangents = points.map((_, index) => {
    if (index === 0) return slopes[0] ?? 0;
    if (index === points.length - 1) return slopes[slopes.length - 1] ?? 0;

    const previousSlope = slopes[index - 1] ?? 0;
    const nextSlope = slopes[index] ?? 0;
    if (previousSlope === 0 || nextSlope === 0 || Math.sign(previousSlope) !== Math.sign(nextSlope)) {
      return 0;
    }
    return (2 * previousSlope * nextSlope) / (previousSlope + nextSlope);
  });

  slopes.forEach((slope, index) => {
    if (slope === 0) {
      tangents[index] = 0;
      tangents[index + 1] = 0;
      return;
    }

    const a = tangents[index] / slope;
    const b = tangents[index + 1] / slope;
    const sum = a * a + b * b;
    if (sum > 9) {
      const scale = 3 / Math.sqrt(sum);
      tangents[index] = scale * a * slope;
      tangents[index + 1] = scale * b * slope;
    }
  });

  let path = `M ${roundPathNumber(points[0].x)} ${roundPathNumber(points[0].y)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const point = points[index];
    const next = points[index + 1];
    const dx = next.x - point.x;
    const cp1 = { x: point.x + dx / 3, y: point.y + (tangents[index] * dx) / 3 };
    const cp2 = { x: next.x - dx / 3, y: next.y - (tangents[index + 1] * dx) / 3 };
    path += ` C ${roundPathNumber(cp1.x)} ${roundPathNumber(cp1.y)}, ${roundPathNumber(cp2.x)} ${roundPathNumber(cp2.y)}, ${roundPathNumber(next.x)} ${roundPathNumber(next.y)}`;
  }
  return path;
}

function buildSparklineAreaPath(points: SparklinePoint[], linePath: string, baselineY: number) {
  if (points.length < 2) return "";
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath} L ${roundPathNumber(last.x)} ${baselineY} L ${roundPathNumber(first.x)} ${baselineY} Z`;
}

function roundPathNumber(value: number) {
  return Number(value.toFixed(2));
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

function FormatCompactMetric({ topic }: { topic: LeaderboardRow }) {
  const visual = getFormatVisual(topic);

  return (
    <div className="min-w-0">
      <div className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-300/34">Popular Format</div>
      <div className={cn("mt-1 flex min-w-0 items-center gap-1.5 truncate text-[13px] font-semibold leading-4", visual.text)}>
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", visual.dot)} />
        <span className="truncate">{visual.value}</span>
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
  const confidenceTone = getConfidenceTone(topic);
  const isTopRank = topic.rank === 1;
  const signalState = getSignalBriefState(topic);
  const signalVisual = getSignalBriefVisual(signalState);
  const interestPreview = getInterestPreview(topic);
  const riskMetric = getCompactRiskMetric(topic);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-4 pl-5 text-left transition duration-200 hover:-translate-y-0.5",
        scanMode ? "min-h-[326px]" : "min-h-[382px]",
        isTopRank && "shadow-[0_22px_90px_rgba(251,191,36,0.07)]",
        selected
          ? cn(signalVisual.border, signalVisual.bg, signalVisual.ring, "ring-1 shadow-[0_18px_60px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.055)]")
          : cn(signalVisual.border, "bg-black/18", signalVisual.hoverBg, "hover:border-opacity-80"),
      )}
    >
      <div className={cn("absolute bottom-0 left-0 top-0 w-1", signalVisual.accent)} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 text-xs font-semibold text-slate-200/42">#{topic.rank}</span>
            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]", signalVisual.badge)}>
              {interestPreview.label}
            </span>
            {isTopRank ? <PillFrame family="neutral" className="px-2 py-0.5">#1</PillFrame> : null}
          </div>
          <h2 className={cn("mt-3 line-clamp-2 font-semibold leading-tight tracking-[-0.035em] text-white", scanMode ? "text-lg" : "text-xl")}>
            {getTopicTitle(topic)}
          </h2>
        </div>
        <div className="shrink-0">
          <WatchStarButton
            ariaLabel={watched ? "Remove from watchlist" : "Add to watchlist"}
            active={watched}
            onClick={onToggleWatch}
          />
        </div>
      </div>

      {!scanMode ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-200/46">{topic.topic_subtitle}</p> : null}

      <SignalSparkline topic={topic} visual={signalVisual} />

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-200/8 pt-4 sm:grid-cols-4">
        <CompactMetric label="Evidence" value={mapEvidenceLabel(topic)} tone={confidenceTone} />
        <CompactMetric label="Stage" value={mapCompactWillLast(topic)} tone={getDecisionTone(topic.decision_label)} />
        <CompactMetric label={riskMetric.label} value={riskMetric.value} tone={riskMetric.tone} />
        <FormatCompactMetric topic={topic} />
      </div>

      <div className={cn("mt-4 rounded-xl px-3 py-2.5 ring-1", signalVisual.read)}>
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">Quick Read</div>
        <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-white/64">{getSignalRead(topic, signalState)}</p>
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
            <AssessmentRow label="Topic growth" value={formatPercent(growth)} tone={(growth ?? 0) >= 0 ? "positive" : "risk"} />
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
              <InsightRow
                key={`${getVisibleSubclusterLabel(insight) ?? insight.subcluster_label}-${insight.insight_score}`}
                insight={insight}
                locked={false}
              />
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
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/34">Topic Check</div>
          <div className="mt-1 truncate text-sm font-medium text-white/78">{systemStatus.confidence}</div>
        </div>
        <PillFrame>Updated {systemStatus.lastUpdated}</PillFrame>
      </div>
      <ConfidenceMeter value={systemStatus.confidenceValue} tone={confidenceTone} />
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <AssessmentRow label="Interest Growth" value={formatPercent(growth)} tone={(growth ?? 0) >= 0 ? "positive" : "risk"} />
        <AssessmentRow label="Evidence" value={mapEvidenceLabel(topic)} tone={confidenceTone} />
        <AssessmentRow label="Stage" value={mapWillLast(topic)} tone={getDecisionTone(topic.decision_label)} />
        <AssessmentRow label="Opportunity" value={mapOpportunityState(topic)} tone={getOpportunityTone(topic)} />
        <AssessmentRow
          label="Risk"
          value={formatRiskAssessment(topic)}
          tone={tone}
        />
        <AssessmentRow label="Why It Matters" value={formatFailureRiskValue(topic.failure_risk_reason_code)} tone={tone} />
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
          <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/50">Popular Format</div>
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
        {topic.format_strategy_summary || "There is not enough reliable video length data to suggest a content type."}
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
          <div>Topic: {clusterId}</div>
          {subclusterId ? <div>Topic area: {subclusterId}</div> : null}
        </div>
        {subclusterLabel ? (
          <p className="mt-2 text-sm font-medium text-amber-100/76">
            Selected topic area: {formatSelectedLabel(subclusterLabel)}
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
        {locked ? "Locked" : getVisibleSubclusterLabel(insight) ?? "Insight unavailable"}
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

  const byGrowthDesc = [...topics].sort((a, b) => getSortableGrowth(b) - getSortableGrowth(a));
  const positive = byGrowthDesc[0];
  const decline = [...topics]
    .filter((topic) => getSortableGrowth(topic) < 0)
    .sort((a, b) => getSortableGrowth(a) - getSortableGrowth(b))[0] ?? byGrowthDesc[byGrowthDesc.length - 1];
  const absoluteGrowth = topics.map((topic) => Math.abs(getSortableGrowth(topic))).sort((a, b) => a - b);
  const medianVolatility = absoluteGrowth[Math.floor(absoluteGrowth.length / 2)] ?? 0;
  const watch =
    [...topics]
      .filter((topic) => topic !== positive && topic !== decline)
      .sort(
        (a, b) =>
          Math.abs(Math.abs(getSortableGrowth(a)) - medianVolatility) -
          Math.abs(Math.abs(getSortableGrowth(b)) - medianVolatility),
      )[0] ?? positive;

  return [
    {
      label: "Top Opportunity",
      topic: positive,
      helper: "Leading topic this week",
      tone: "positive",
    },
    {
      label: "Worth Watching",
      topic: watch,
      helper: "Showing signs of interest",
      tone: "watch",
    },
    {
      label: "Emerging Topic",
      topic: decline,
      helper: "Worth tracking, but less active",
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
  const label =
    getVisibleSubclusterLabel(opportunity) ||
    opportunity?.intent_label ||
    subclusterId ||
    clusterId ||
    "Discovery signal";
  const score = opportunity?.discovery_score ?? 0;

  return {
    rank: 0,
    cluster_id: clusterId ?? undefined,
    cluster_label: clusterId ?? "Discovery signal",
    display_topic_title: `Discovery signal selected: ${clusterId ?? "Unknown"}`,
    topic_subtitle: opportunity
      ? `Selected topic area: ${formatSelectedLabel(label)}.`
      : "This topic is not available in the current dashboard view.",
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
    const staticFailureRisk = activeFailureRiskByClusterId.get(cluster.clusterId);

    return {
      rank: index + 1,
      cluster_id: cluster.clusterId,
      cluster_label: cluster.clusterName,
      display_topic_title: getInsightTitle(getVisibleSubclusterLabel(primary) ?? cluster.clusterName),
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
  return resolveGrowthFraction(topic);
}

function getSortableGrowth(topic: LeaderboardRow) {
  return getGrowthFraction(topic) ?? 0;
}

function getSnapshotDelta(topic: LeaderboardRow): SnapshotDeltaVisual {
  const direction = topic.trend_direction?.toUpperCase();
  let state: SnapshotDeltaState = "unknown";

  // TODO: Replace derived/synthetic snapshot delta with backend-provided real previous snapshot metrics once exported.
  if (topic.liveCluster || direction === "LIVE" || direction === "DISCOVERY") {
    state = "unknown";
  } else if (direction === "UP" || direction === "STRENGTHENING") {
    state = "positive";
  } else if (direction === "DOWN" || direction === "WEAKENING" || direction === "DECLINING") {
    state = "negative";
  } else if (direction === "FLAT" || direction === "STABLE") {
    state = "neutral";
  }

  if (state === "positive") {
    return {
      label: "↑ Strengthening",
      state,
      badgeClassName: "border-emerald-300/28 bg-emerald-300/[0.09] text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.08)]",
    };
  }

  if (state === "negative") {
    return {
      label: "↓ Weakening",
      state,
      badgeClassName: "border-rose-300/30 bg-rose-300/[0.09] text-rose-100 shadow-[0_0_18px_rgba(244,63,94,0.08)]",
    };
  }

  if (state === "neutral") {
    return {
      label: "Steady",
      state,
      badgeClassName: "border-slate-300/18 bg-slate-300/[0.06] text-slate-200/76",
    };
  }

  return {
    label: "Latest snapshot",
    state,
    badgeClassName: "border-slate-300/14 bg-slate-300/[0.045] text-slate-300/62",
  };
}

function normalizeClusterId(value?: string | null) {
  return value?.trim().toUpperCase() ?? "";
}

function getClusterTimeseries(clusterId?: string) {
  const normalizedClusterId = normalizeClusterId(clusterId);
  if (!normalizedClusterId) return [];

  return activeClusterTimeseries
    .filter((row) => normalizeClusterId(row.cluster_id) === normalizedClusterId && row.snapshot_date)
    .sort((a, b) => String(a.snapshot_date ?? "").localeCompare(String(b.snapshot_date ?? "")));
}

function getTimeseriesVideoCount(row: ClusterTimeseriesRow) {
  return finiteNumber(row.n_videos) ?? finiteNumber(row.n_videos_current) ?? finiteNumber(row.tracked_video_count);
}

function getInterestPreviewMetric(rows: ClusterTimeseriesRow[]) {
  // Preview metric order: weekly topic growth first, raw weekly change second, topic coverage last.
  // This keeps the card focused on movement when the export supports it, without inventing motion.
  const growthValues = rows.map((row) => finiteNumber(row.topic_growth_pct));
  if (growthValues.filter((value) => value !== null).length >= 2) {
    return {
      kind: "topic_growth_pct" as InterestPreviewMetricKind,
      label: "Recent Movement",
      values: growthValues.map((value) => value ?? 0),
    };
  }

  const absoluteChangeValues = rows.map((row) => finiteNumber(row.wow_abs));
  if (absoluteChangeValues.filter((value) => value !== null).length >= 2) {
    return {
      kind: "wow_abs" as InterestPreviewMetricKind,
      label: "Recent Movement",
      values: absoluteChangeValues.map((value) => value ?? 0),
    };
  }

  return {
    kind: "video_count" as InterestPreviewMetricKind,
    label: "Topic Coverage",
    values: rows.map(getTimeseriesVideoCount).filter((value): value is number => value !== null),
  };
}

function getInterestPreviewStatus(values: number[]): InterestPreviewStatus {
  if (values.length === 0) return "no_history";
  if (values.length === 1) return "needs_history";

  const deltas = values.slice(1).map((value, index) => value - values[index]);
  const hasIncrease = deltas.some((delta) => delta > 0);
  const hasDecrease = deltas.some((delta) => delta < 0);

  if (!hasIncrease && !hasDecrease) return "steady";
  if (hasIncrease && hasDecrease) return "mixed";
  return hasIncrease ? "rising" : "cooling";
}

function getInterestPreviewLabel(status: InterestPreviewStatus) {
  if (status === "no_history") return "No history yet";
  if (status === "needs_history") return "Needs History";
  if (status === "rising") return "Interest Rising";
  if (status === "cooling") return "Interest Cooling";
  if (status === "mixed") return "Mixed Movement";
  return "Steady Interest";
}

function getInterestPreviewTone(status: InterestPreviewStatus): Tone {
  if (status === "rising") return "positive";
  if (status === "cooling") return "risk";
  if (status === "mixed" || status === "needs_history") return "watch";
  return "neutral";
}

function getInterestPreviewBadgeClass(status: InterestPreviewStatus) {
  const tone = getInterestPreviewTone(status);
  if (tone === "positive") return "border-emerald-300/28 bg-emerald-300/[0.09] text-emerald-100";
  if (tone === "risk") return "border-rose-300/30 bg-rose-300/[0.09] text-rose-100";
  if (tone === "watch") return "border-amber-300/28 bg-amber-300/[0.08] text-amber-100";
  return "border-slate-300/18 bg-slate-300/[0.06] text-slate-200/76";
}

function logInterestPreviewDebugChecks(
  rows: ClusterTimeseriesRow[],
  context: { phase: string; source: string },
) {
  if (!import.meta.env.DEV) return;

  const summaries = INTEREST_PREVIEW_DEBUG_CLUSTER_IDS.map((clusterId) => {
    const clusterRows = rows
      .filter((row) => normalizeClusterId(row.cluster_id) === clusterId)
      .sort((a, b) => String(a.snapshot_date ?? "").localeCompare(String(b.snapshot_date ?? "")));
    const metric = getInterestPreviewMetric(clusterRows);
    const status = getInterestPreviewStatus(metric.values);
    return {
      clusterId,
      phase: context.phase,
      source: context.source,
      matchedRows: clusterRows.length,
      snapshots: metric.values.length,
      metric: metric.kind,
      values: metric.values,
      label: getInterestPreviewLabel(status),
    };
  });

  console.debug("Interest preview validation", summaries);
}

function getInterestPreview(topic: LeaderboardRow) {
  const rows = getClusterTimeseries(topic.cluster_id);
  const metric = getInterestPreviewMetric(rows);
  const values = metric.values;
  const status = getInterestPreviewStatus(values);
  const label = getInterestPreviewLabel(status);

  if (values.length === 0) {
    return { rows, values, points: [], status, label, metric };
  }

  if (values.length === 1) {
    return {
      rows,
      values,
      status,
      label,
      metric,
      points: [{ x: 50, y: 56 }],
    };
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  if (minValue === maxValue) {
    return {
      rows,
      values,
      status,
      label,
      metric,
      points: values.map((_, index) => ({
        x: values.length === 1 ? 50 : 6 + (index / (values.length - 1)) * 88,
        y: 56,
      })),
    };
  }

  const range = maxValue - minValue;
  const topPadding = 24;
  const bottomPadding = 74;

  const points = values.map((value, index) => {
    const x = values.length === 1 ? 50 : 6 + (index / (values.length - 1)) * 88;
    const y = bottomPadding - ((value - minValue) / range) * (bottomPadding - topPadding);
    return { x, y };
  });

  return { rows, values, points, status, label, metric };
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
      helper: `${getVisibleSubclusterLabel(insight) ?? insight.subcluster_label} · ${formatPP(metric)}`,
      tone: visual.tone,
    };
  });
}

function getMeaningfulInsightTimeline(insights: ClusterInsight[]) {
  const seen = new Set<string>();

  return insights
    .filter((insight) => {
      const metric = getInsightMetric(insight).value;
      const insightLabel = getVisibleSubclusterLabel(insight) ?? insight.subcluster_label;
      const key = `${insight.snapshot_date ?? insight.observed_at}-${insight.insight_type ?? insight.signal_state}-${insightLabel}-${metric}`;

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
        helper: getVisibleSubclusterLabel(insight) ?? insight.subcluster_label,
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
