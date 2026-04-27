import { useMemo, useState, type MouseEvent } from "react";
import { ArrowUpRight, Check, Lock, ShieldCheck, Star } from "lucide-react";

import PageShell from "../components/layout/PageShell";
import Section from "../components/layout/Section";
import PageSeo from "../components/seo/PageSeo";
import { useWatchlist } from "../hooks/useWatchlist";
import leaderboardRows from "../data/leaderboard_v3_3.json";
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
};

type UserPlan = "explorer" | "pro" | "advanced";

type RawLeaderboardRow = Omit<LeaderboardRow, "topic_subtitle" | "cluster_label">;

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

const leaderboard = (leaderboardRows as RawLeaderboardRow[]).map((topic) => {
  const presentation = topicPresentationByRank[topic.rank];

  return {
    ...topic,
    cluster_label: topic.display_topic_title,
    topic_subtitle:
      presentation?.topic_subtitle ?? "Research theme generated from related content movement.",
    display_topic_title: presentation?.display_topic_title ?? topic.display_topic_title,
  };
}) as LeaderboardRow[];
function getMockUserPlan(): UserPlan {
  return "explorer";
}

const userPlan = getMockUserPlan();
const hasPremiumAccess = userPlan === "pro" || userPlan === "advanced";
const EXPLORER_WATCHLIST_LIMIT = 2;

function formatDecision(label: string) {
  if (label === "STRONG_TREND") return "Strong Trend";
  if (label === "EARLY_TREND") return "Early Trend";
  if (label === "EMERGING") return "Emerging";
  if (label === "WEAK_OR_RISK") return "Monitor Only";

  return label;
}

function formatScore(score: number) {
  return `${Math.round(score * 100)}`;
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${Math.round(value)}%`;
}

function getDecisionClass(label: string) {
  if (label === "STRONG_TREND") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }

  if (label === "EARLY_TREND") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-200";
  }

  if (label === "EMERGING") {
    return "border-sky-300/25 bg-sky-300/10 text-sky-200";
  }

  return "border-rose-300/25 bg-rose-300/10 text-rose-200";
}

function getPlanClass(plan: UserPlan) {
  if (plan === "pro") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }

  if (plan === "advanced") {
    return "border-violet-300/30 bg-violet-300/10 text-violet-200";
  }

  return "border-slate-300/18 bg-slate-300/[0.08] text-slate-200/80";
}

function formatPlan(plan: UserPlan) {
  if (plan === "explorer") return "Explorer Preview";
  if (plan === "advanced") return "Advanced";
  return "Pro";
}

function getRecommendedAction(topic: LeaderboardRow) {
  if (topic.decision_label === "STRONG_TREND") {
    return "Prioritize this cluster for near-term research, packaging, and creator angle testing.";
  }

  if (topic.decision_label === "EARLY_TREND") {
    return "Validate the audience angle now, then prepare a measured content test before the cluster gets crowded.";
  }

  if (topic.decision_label === "EMERGING") {
    return "Watch the cluster closely and gather more examples before committing a full production cycle.";
  }

  return "Treat this as a risk signal. Deprioritize unless it strongly matches an existing audience or thesis.";
}

function getTopicId(topic: LeaderboardRow) {
  return topic.cluster_id ?? topic.display_topic_title;
}

function DecisionPill({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.13em]",
        getDecisionClass(label),
        className,
      )}
    >
      {formatDecision(label)}
    </span>
  );
}

function PlanPill({ plan }: { plan: UserPlan }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        getPlanClass(plan),
      )}
    >
      {formatPlan(plan)}
    </span>
  );
}

function SignalPill({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs text-white/62">
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
  tone?: "neutral" | "positive" | "risk";
}) {
  return (
    <div className="rounded-[1.1rem] border border-white/8 bg-black/18 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/34">
        {label}
      </div>
      <div
        className={cn(
          "mt-2 text-xl font-semibold tracking-[-0.03em]",
          tone === "positive"
            ? "text-emerald-200"
            : tone === "risk"
              ? "text-rose-200"
              : "text-white",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function WatchStarButton({
  active,
  size = "md",
  onClick,
  ariaLabel,
}: {
  active: boolean;
  size?: "sm" | "md";
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center rounded-full border transition hover:scale-[1.03] hover:shadow-[0_12px_34px_rgba(245,158,11,0.16)]",
        size === "sm" ? "h-7 w-7" : "h-9 w-9",
        active
          ? "border-amber-300/35 bg-amber-300/12 text-amber-200 shadow-[0_0_24px_rgba(245,158,11,0.10)]"
          : "border-white/10 bg-white/[0.03] text-white/42 hover:border-amber-300/22 hover:text-amber-100",
      )}
    >
      <Star className={cn(size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4", active ? "fill-current" : "")} />
    </button>
  );
}

export default function Dashboard() {
  const [selectedRank, setSelectedRank] = useState(leaderboard[0]?.rank ?? 1);
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  const [watchlistLimitMessage, setWatchlistLimitMessage] = useState("");
  const { watchedTopicIds, isWatched, addTopic, removeTopic } = useWatchlist();

  const selectedTopic =
    leaderboard.find((topic) => topic.rank === selectedRank) ?? leaderboard[0];
  const selectedTopicId = getTopicId(selectedTopic);
  const selectedTopicIsWatched = isWatched(selectedTopicId);

  const metrics = useMemo(() => {
    const totalClusters = leaderboard.length;
    const strongEarlyCount = leaderboard.filter((topic) =>
      ["STRONG_TREND", "EARLY_TREND"].includes(topic.decision_label),
    ).length;
    const winners = leaderboard.filter((topic) => topic.t60_is_winner).length;
    const maxScore = Math.max(...leaderboard.map((topic) => topic.trend_strength_score));

    return [
      { label: "Total clusters", value: totalClusters.toString(), detail: "V3.3 app-ready rows" },
      { label: "Strong / early", value: strongEarlyCount.toString(), detail: "Actionable signals" },
      { label: "T+60 winners", value: winners.toString(), detail: "Validated after freeze" },
      { label: "Max score", value: formatScore(maxScore), detail: "Trend strength" },
    ];
  }, []);

  const topOpportunities = leaderboard.slice(0, 5);
  const watchedTopics = leaderboard.filter((topic) => isWatched(getTopicId(topic)));
  const planLimitedLeaderboard = hasPremiumAccess ? leaderboard : leaderboard.slice(0, 5);
  const visibleLeaderboard = showWatchlistOnly
    ? planLimitedLeaderboard.filter((topic) => isWatched(getTopicId(topic)))
    : planLimitedLeaderboard;
  const lockedLeaderboardPreview = hasPremiumAccess ? [] : leaderboard.slice(5, 8);

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

  const renderEmptyLeaderboard = visibleLeaderboard.length === 0;

  return (
    <PageShell
      backgroundLayers={
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.055),transparent_24%),radial-gradient(circle_at_65%_28%,rgba(80,200,140,0.09),transparent_24%),radial-gradient(circle_at_18%_70%,rgba(120,120,145,0.08),transparent_20%),linear-gradient(to_bottom,#0B0F17_0%,#07090d_48%,#050607_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.03]" />
        </>
      }
    >
      <PageSeo
        title="VidCluster Dashboard"
        description="Your VidCluster early topic intelligence dashboard."
        url="/dashboard"
      />

      <Section spacing="intro" containerClassName="max-w-[1304px]">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/56">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
              V3.3 Leaderboard
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.06em] text-white sm:text-6xl">
              Topic signals ready for creator decisions
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
              A frontend preview of the latest app-ready leaderboard generated by
              the VidCluster engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-[1.2rem] border border-white/8 bg-white/[0.025] px-4 py-3 text-sm text-white/52">
            <span>Snapshot: V3.3 leaderboard</span>
            <PlanPill plan={userPlan} />
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.032),rgba(255,255,255,0.014))] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)]"
            >
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
                {metric.label}
              </div>
              <div className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
                {metric.value}
              </div>
              <div className="mt-2 text-sm text-white/46">{metric.detail}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section spacing="standard" containerClassName="max-w-[1304px]">
        <div className="mb-12 rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.032),rgba(255,255,255,0.014))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-white/38">
                <Star className="h-4 w-4 text-emerald-200/70" />
                Watchlist
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                Topics you want to monitor
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/48">
                Save topics from the leaderboard and return to them as signals evolve.
              </p>
            </div>

            <label className="flex w-fit cursor-pointer items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/68 transition hover:border-white/16 hover:text-white">
              <input
                type="checkbox"
                checked={showWatchlistOnly}
                onChange={(event) => setShowWatchlistOnly(event.target.checked)}
                className="h-4 w-4 accent-emerald-300"
              />
              Show watchlist only
            </label>
          </div>

          {watchlistLimitMessage ? (
            <div className="mt-5 rounded-[1.1rem] border border-amber-300/20 bg-amber-300/[0.07] px-4 py-3 text-sm leading-6 text-amber-100/82">
              {watchlistLimitMessage}
            </div>
          ) : null}

          {watchedTopics.length === 0 ? (
            <div className="mt-6 rounded-[1.2rem] border border-white/8 bg-black/16 px-4 py-5 text-sm text-white/48">
              No topics saved yet. Add topics you want to monitor.
            </div>
          ) : (
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {watchedTopics.map((topic) => (
                <button
                  key={getTopicId(topic)}
                  type="button"
                  onClick={() => setSelectedRank(topic.rank)}
                  className="rounded-[1.25rem] border border-white/8 bg-black/16 p-4 text-left transition hover:border-emerald-400/30 hover:bg-emerald-400/5 hover:shadow-[0_18px_54px_rgba(16,185,129,0.10)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-medium leading-6 text-white/88">
                      {topic.display_topic_title}
                    </h3>
                    <Star className="h-4 w-4 shrink-0 fill-amber-300 text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]" />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <SignalPill>Score {formatScore(topic.trend_strength_score)}</SignalPill>
                    <DecisionPill label={topic.decision_label} className="px-2.5 py-1 text-[9px]" />
                  </div>
                  <div className="mt-3 text-xs text-white/46">
                    {formatPercent(topic.growth_since_freeze_pct)} growth ·{" "}
                    {topic.latest_n_videos} videos
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Top opportunities
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              Highest-ranked clusters by trend strength
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-white/48">
            Cards are ordered by engine rank. Select one to inspect the topic detail
            panel below.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {topOpportunities.map((topic) => {
            const isSelected = selectedTopic.rank === topic.rank;

            return (
              <button
                key={topic.rank}
                type="button"
                onClick={() => setSelectedRank(topic.rank)}
                className={cn(
                  "min-h-[250px] rounded-[1.65rem] border p-6 text-left transition",
                  isSelected
                    ? "border-emerald-400/35 bg-emerald-400/5 shadow-[0_22px_80px_rgba(16,185,129,0.12)]"
                    : "border-white/8 bg-white/[0.025] hover:border-white/14 hover:bg-white/[0.04]",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/36">
                    Rank {topic.rank}
                  </div>
                  <WatchStarButton
                    ariaLabel={
                      isWatched(getTopicId(topic))
                        ? "Remove from watchlist"
                        : "Add to watchlist"
                    }
                    active={isWatched(getTopicId(topic))}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleToggleTopic(topic);
                    }}
                  />
                </div>
                <h3 className="mt-7 min-h-[4rem] text-2xl font-semibold leading-8 tracking-[-0.045em] text-white/94">
                  {topic.display_topic_title}
                </h3>

                <div className="mt-8 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/34">
                      Score
                    </div>
                    <div className="mt-1 text-5xl font-semibold tracking-[-0.06em] text-white">
                      {formatScore(topic.trend_strength_score)}
                    </div>
                  </div>

                  <div className="text-right">
                    <DecisionPill label={topic.decision_label} />
                    <div
                      className={cn(
                        "mt-3 text-sm font-medium",
                        topic.growth_since_freeze_pct >= 0
                          ? "text-emerald-200/78"
                          : "text-red-100/62",
                      )}
                    >
                      {formatPercent(topic.growth_since_freeze_pct)} growth
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-1 text-sm text-white/44">
                  Inspect
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section spacing="standard" containerClassName="grid max-w-[1304px] gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.032),rgba(255,255,255,0.014))] shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
          <div className="border-b border-white/8 p-5 sm:p-6">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/38">
              Leaderboard
            </div>
            <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                Compact cluster ranking
              </h2>
              {!hasPremiumAccess ? (
                <div className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs text-white/52">
                  Explorer preview: top 5 rows
                </div>
              ) : null}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] table-fixed text-left">
              <colgroup>
                <col className="w-[56px]" />
                <col className="w-[64px]" />
                <col />
                <col className="w-[76px]" />
                <col className="w-[148px]" />
                <col className="w-[92px]" />
                <col className="w-[104px]" />
              </colgroup>
              <thead className="border-b border-white/8 text-[11px] uppercase tracking-[0.18em] text-white/34">
                <tr>
                  <th className="px-3 py-3 font-medium">Watch</th>
                  <th className="px-3 py-3 font-medium">Rank</th>
                  <th className="px-3 py-3 font-medium">Topic</th>
                  <th className="px-3 py-3 font-medium">Score</th>
                  <th className="px-3 py-3 font-medium">Signal</th>
                  <th className="px-3 py-3 font-medium">Growth</th>
                  <th className="px-3 py-3 font-medium">Videos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/7">
                {visibleLeaderboard.map((topic) => {
                  const isSelected = selectedTopic.rank === topic.rank;

                  return (
                    <tr
                      key={topic.rank}
                      onClick={() => setSelectedRank(topic.rank)}
                      className={cn(
                        "cursor-pointer transition",
                        isSelected
                          ? "bg-emerald-400/[0.065] shadow-[inset_3px_0_0_rgba(52,211,153,0.75)]"
                          : "hover:bg-white/[0.028]",
                      )}
                    >
                      <td className="px-3 py-2.5">
                        <WatchStarButton
                          ariaLabel={
                            isWatched(getTopicId(topic))
                              ? "Remove from watchlist"
                              : "Add to watchlist"
                          }
                          active={isWatched(getTopicId(topic))}
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleToggleTopic(topic);
                          }}
                        />
                      </td>
                      <td className="px-3 py-2.5 text-sm text-white/50">{topic.rank}</td>
                      <td className="px-3 py-2.5 text-sm font-medium text-white/86">
                        <div className="line-clamp-2 leading-5">
                          {topic.display_topic_title}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-white/74">
                        {formatScore(topic.trend_strength_score)}
                      </td>
                      <td className="px-3 py-2.5">
                        <DecisionPill label={topic.decision_label} className="px-2.5 py-1 text-[9px]" />
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2.5 text-sm",
                          topic.growth_since_freeze_pct >= 0
                            ? "text-emerald-200/78"
                            : "text-red-100/62",
                        )}
                      >
                        {formatPercent(topic.growth_since_freeze_pct)}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-white/62">
                        {topic.latest_n_videos}
                      </td>
                    </tr>
                  );
                })}
                {renderEmptyLeaderboard ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-white/48">
                      No watched topics in the current view. Add topics you want to monitor.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          {!hasPremiumAccess ? (
            <LockedLeaderboardPreview rows={lockedLeaderboardPreview} />
          ) : null}
        </div>

        <aside className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.038),rgba(255,255,255,0.016))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] xl:sticky xl:top-28 xl:self-start">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/38">
                Topic detail
              </div>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.05em] text-white">
                {selectedTopic.display_topic_title}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/48">
                {selectedTopic.topic_subtitle}
              </p>
            </div>
            <DecisionPill label={selectedTopic.decision_label} className="shrink-0" />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                selectedTopicIsWatched
                  ? removeTopic(selectedTopicId)
                  : handleAddTopic(selectedTopic)
              }
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition hover:shadow-[0_18px_48px_rgba(245,158,11,0.18)]",
                selectedTopicIsWatched
                  ? "border border-amber-300/30 bg-amber-300/10 text-amber-100 hover:bg-amber-300/[0.14]"
                  : "border border-white/10 bg-white/[0.03] text-white/82 hover:border-amber-300/22 hover:bg-white/[0.05] hover:text-white",
              )}
            >
              <Star
                className={cn("h-4 w-4", selectedTopicIsWatched ? "fill-current" : "")}
              />
              {selectedTopicIsWatched ? "Remove from Watchlist" : "Add to Watchlist"}
            </button>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3">
            {[
              ["Score", formatScore(selectedTopic.trend_strength_score), "neutral"],
              [
                "Growth",
                formatPercent(selectedTopic.growth_since_freeze_pct),
                selectedTopic.growth_since_freeze_pct >= 0 ? "positive" : "risk",
              ],
              [
                "Confidence",
                selectedTopic.trend_confidence === undefined
                  ? "Unavailable"
                  : `${Math.round(selectedTopic.trend_confidence * 100)}%`,
                "neutral",
              ],
              ["Latest videos", selectedTopic.latest_n_videos.toString(), "neutral"],
            ].map(([label, value, tone]) => (
              <MetricCard
                key={label}
                label={label}
                value={value}
                tone={tone as "neutral" | "positive" | "risk"}
              />
            ))}
          </div>

          {hasPremiumAccess ? (
            <div className="mt-7 space-y-4">
              <DetailBlock title="What is happening" text={selectedTopic.trend_summary} />
              <DetailBlock
                title="Why this score"
                text={`${selectedTopic.score_anchor
                  .toLowerCase()
                  .split("_")
                  .join(" ")}. The current decision label is ${formatDecision(
                  selectedTopic.decision_label,
                ).toLowerCase()}.`}
              />
              <DetailBlock title="Recommended action" text={getRecommendedAction(selectedTopic)} />
              <EvidenceBlock topic={selectedTopic} />
              <AuditBlock topic={selectedTopic} />
            </div>
          ) : (
            <div className="mt-7 space-y-4">
              <LockedDetailPreview topic={selectedTopic} />
              <LockedWhyScorePreview topic={selectedTopic} />
              <LockedRecommendedActionsPreview />
              <UpgradeCard
                title="Unlock complete topic intelligence"
                description="Pro opens full topic detail, score reasoning, recommended actions, and the complete leaderboard."
                cta="Upgrade to Pro"
                variant="detail"
              />
            </div>
          )}
        </aside>
      </Section>
      {!hasPremiumAccess ? <StickyUpgradeBar /> : null}
    </PageShell>
  );
}

function EvidenceBlock({ topic }: { topic: LeaderboardRow }) {
  return (
    <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.025] p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/38">
        <ShieldCheck className="h-4 w-4 text-emerald-200/70" />
        Evidence
      </div>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-white/58">
        <li className="flex gap-3">
          <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-200/70" />
          {topic.opportunity_summary}
        </li>
        <li className="flex gap-3">
          <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-200/70" />
          T+60 winner: {topic.t60_is_winner ? "Yes" : "No"}
          {topic.t60_actual_rank ? `, actual rank ${topic.t60_actual_rank}` : ""}
        </li>
        <li className="flex gap-3">
          <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-200/70" />
          {topic.risk_summary}
        </li>
      </ul>
    </div>
  );
}

function AuditBlock({ topic }: { topic: LeaderboardRow }) {
  return (
    <div className="rounded-[1.2rem] border border-white/8 bg-black/16 p-4">
      <div className="text-[11px] uppercase tracking-[0.2em] text-white/34">
        Audit / Internal
      </div>
      <div className="mt-3 grid gap-2 text-sm leading-6 text-white/50">
        <div>
          <span className="text-white/32">Raw cluster label: </span>
          {topic.cluster_label ?? "Unavailable"}
        </div>
        <div>
          <span className="text-white/32">Score anchor: </span>
          {topic.score_anchor}
        </div>
      </div>
    </div>
  );
}

function DetailBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.025] p-4">
      <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">{title}</div>
      <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
    </div>
  );
}

function UpgradeCard({
  title,
  description,
  cta,
  variant = "detail",
}: {
  title: string;
  description: string;
  cta: string;
  variant?: "leaderboard" | "detail" | "actions";
}) {
  const eyebrow =
    variant === "leaderboard"
      ? "Full universe locked"
      : variant === "actions"
        ? "Action layer locked"
        : "Insight locked";

  return (
    <div className="rounded-[1.35rem] border border-emerald-400/30 bg-emerald-400/5 p-5 shadow-[0_20px_70px_rgba(16,185,129,0.10)]">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-emerald-200/70">
        <Lock className="h-4 w-4" />
        {eyebrow}
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-white/56">
        {description}
      </p>
      <a
        href="/signup?plan=pro"
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-black shadow-[0_12px_34px_rgba(255,255,255,0.08)] transition hover:scale-[1.01] hover:bg-white/90 hover:shadow-[0_18px_48px_rgba(16,185,129,0.22)]"
      >
        {cta}
      </a>
    </div>
  );
}

function LockedLeaderboardPreview({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <div className="border-t border-white/8 bg-black/12 p-4 sm:p-5">
      {rows.length > 0 ? (
        <div className="overflow-hidden rounded-[1.1rem] border border-white/8 bg-white/[0.018]">
          <div className="divide-y divide-white/7 blur-[1.5px]">
            {rows.map((topic) => (
              <div
                key={topic.rank}
                className="grid grid-cols-[56px_64px_minmax(0,1fr)_76px_148px_92px_104px] items-center px-3 py-2.5 text-sm"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/30">
                  <Star className="h-3.5 w-3.5" />
                </div>
                <div className="text-white/38">{topic.rank}</div>
                <div className="line-clamp-1 pr-3 font-medium text-white/62">
                  {topic.display_topic_title}
                </div>
                <div className="text-white/48">{formatScore(topic.trend_strength_score)}</div>
                <div>
                  <DecisionPill label={topic.decision_label} className="px-2.5 py-1 text-[9px]" />
                </div>
                <div className="text-emerald-200/48">
                  {formatPercent(topic.growth_since_freeze_pct)}
                </div>
                <div className="text-white/42">{topic.latest_n_videos}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mx-auto mt-4 max-w-xl rounded-[1.2rem] border border-emerald-400/30 bg-emerald-400/5 p-5 text-center shadow-[0_18px_60px_rgba(16,185,129,0.10)] backdrop-blur-md">
        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100">
          <Lock className="h-4 w-4" />
        </div>
        <h3 className="mt-3 text-base font-semibold tracking-[-0.03em] text-white">
          You’re seeing 20% of the signal
        </h3>
        <p className="mt-2 text-sm leading-6 text-white/56">
          Explorer shows only the first five clusters. Upgrade to unlock the full
          ranked universe.
        </p>
        <p className="mt-2 text-xs leading-5 text-emerald-100/70">
          8 clusters were validated as T+60 winners in this run.
        </p>
        <a
          href="/signup?plan=pro"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:scale-[1.01] hover:bg-white/90 hover:shadow-[0_16px_42px_rgba(16,185,129,0.22)]"
        >
          Unlock full leaderboard
        </a>
      </div>
    </div>
  );
}

function LockedDetailPreview({ topic }: { topic: LeaderboardRow }) {
  const teaserStats = [
    ["Score", formatScore(topic.trend_strength_score)],
    ["Growth", formatPercent(topic.growth_since_freeze_pct)],
    topic.weeks_observed !== null ? ["Weeks observed", topic.weeks_observed.toString()] : null,
    topic.consecutive_up_weeks !== null
      ? ["Consecutive up weeks", topic.consecutive_up_weeks.toString()]
      : null,
    topic.latest_n_videos !== undefined ? ["Latest videos", topic.latest_n_videos.toString()] : null,
  ].filter((stat): stat is string[] => Boolean(stat));

  return (
    <div className="relative overflow-hidden rounded-[1.25rem] border border-white/8 bg-white/[0.025] p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {teaserStats.map(([label, value]) => (
          <div key={label} className="rounded-[1rem] border border-white/8 bg-black/18 p-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/34">
              {label}
            </div>
            <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[1rem] border border-white/8 bg-black/18 p-4 blur-[1.5px]">
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/34">
          Topic intelligence
        </div>
        <p className="mt-3 text-sm leading-6 text-white/56">
          {topic.trend_summary}
        </p>
      </div>

      <div className="mt-4 rounded-[1.15rem] border border-emerald-400/30 bg-emerald-400/5 p-4 shadow-[0_18px_60px_rgba(16,185,129,0.10)] backdrop-blur-md">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-emerald-200/70">
          <Lock className="h-4 w-4" />
          Full topic intelligence is locked
        </div>
        <p className="mt-3 text-sm leading-6 text-white/58">
          See why this topic is growing, what action to take, and the signals behind
          the score.
        </p>
        <a
          href="/signup?plan=pro"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:scale-[1.01] hover:bg-white/90 hover:shadow-[0_16px_42px_rgba(16,185,129,0.22)]"
        >
          Unlock full insight
        </a>
      </div>
    </div>
  );
}

function LockedWhyScorePreview({ topic }: { topic: LeaderboardRow }) {
  return (
    <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.025] p-4">
      <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">
        Why this score?
      </div>
      <div className="mt-4 space-y-3 text-sm leading-6">
        <LockedSignalRow
          label="Weeks observed"
          value={topic.weeks_observed === null ? "Not available in preview" : topic.weeks_observed.toString()}
          locked={false}
        />
        <LockedSignalRow label="Consecutive growth" value="Locked" locked />
        <LockedSignalRow label="Expansion trend" value="Locked" locked />
        <LockedSignalRow label="Stability signal" value="Locked" locked />
      </div>
      <a
        href="/signup?plan=pro"
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:scale-[1.01] hover:bg-white/90 hover:shadow-[0_16px_42px_rgba(16,185,129,0.22)]"
      >
        Unlock score breakdown
      </a>
    </div>
  );
}

function LockedRecommendedActionsPreview() {
  return (
    <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.025] p-4">
      <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">
        Recommended Action
      </div>
      <div className="mt-4 space-y-3 text-sm leading-6 text-white/58">
        <div className="flex items-center justify-between gap-4 rounded-[1rem] border border-white/8 bg-black/18 px-4 py-3">
          <span>Strategy identified</span>
          <Check className="h-4 w-4 text-emerald-200/70" />
        </div>
        <LockedSignalRow label="Execution plan available" value="Locked" locked />
        <LockedSignalRow label="Monetisation angles detected" value="Locked" locked />
      </div>
      <a
        href="/signup?plan=pro"
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:scale-[1.01] hover:bg-white/90 hover:shadow-[0_16px_42px_rgba(16,185,129,0.22)]"
      >
        See what to do next
      </a>
    </div>
  );
}

function LockedSignalRow({
  label,
  value,
  locked,
}: {
  label: string;
  value: string;
  locked: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-[1rem] border border-white/8 bg-black/18 px-4 py-3",
        locked ? "border-amber-300/14 bg-amber-300/[0.04] text-amber-100/58" : "text-white/68",
      )}
    >
      <span>{label}</span>
      <span className="inline-flex items-center gap-2">
        {locked ? <Lock className="h-3.5 w-3.5 text-amber-200/70" /> : null}
        {value}
      </span>
    </div>
  );
}

function StickyUpgradeBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-400/30 bg-[#07090d]/94 px-4 py-3 shadow-[0_-18px_60px_rgba(16,185,129,0.10)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1304px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium text-white">
            You’re in Explorer mode — limited access
          </div>
          <div className="mt-1 text-sm text-white/52">
            Unlock full topic intelligence and act early
          </div>
        </div>
        <a
          href="/signup?plan=pro"
          className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:scale-[1.01] hover:bg-white/90 hover:shadow-[0_16px_42px_rgba(16,185,129,0.22)]"
        >
          Upgrade to Pro
        </a>
      </div>
    </div>
  );
}
