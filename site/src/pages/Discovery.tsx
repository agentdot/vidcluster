import { useEffect, useMemo, useState } from "react";
import { Lock, Sparkles, TrendingUp } from "lucide-react";

import SiteHeader from "../components/SiteHeader";
import PageSeo from "../components/seo/PageSeo";
import {
  useDiscoveryOpportunities,
  type DiscoveryLabel,
  type DiscoveryOpportunity,
  type SignalSource,
} from "../hooks/useDiscoveryOpportunities";
import { cn } from "../lib/utils";

type UserPlan = "explorer" | "pro" | "advanced";
type DiscoveryTab = "active" | "all" | "failed";

const EXPLORER_UNLOCKED_MARKET_COUNT = 1;

function getMockUserPlan(): UserPlan {
  return "explorer";
}

const userPlan = getMockUserPlan();
const hasPremiumAccess = userPlan === "pro" || userPlan === "advanced";

export default function Discovery() {
  const [selectedTab, setSelectedTab] = useState<DiscoveryTab>("active");
  const { opportunities, loading, error } = useDiscoveryOpportunities();
  const latestSnapshot = getLatestSnapshot(opportunities);
  const signalStats = useMemo(() => getSignalStats(opportunities), [opportunities]);
  const visibleOpportunities = useMemo(
    () => getVisibleOpportunities(opportunities, selectedTab),
    [opportunities, selectedTab],
  );

  useEffect(() => {
    if (loading || error || selectedTab !== "active" || signalStats.active > 0 || signalStats.total === 0) {
      return;
    }

    setSelectedTab(signalStats.failed > 0 ? "failed" : "all");
  }, [error, loading, selectedTab, signalStats]);

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <PageSeo
        title="Micro-Niche Discovery | VidCluster"
        description="Latest VidCluster micro-niche discovery opportunities."
        url="/discovery"
      />
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6">
        <section className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.022))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/[0.055] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100/76">
                <Sparkles className="h-3.5 w-3.5" />
                Layer 4.4 Discovery
              </div>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-white">
                Micro-Niche Opportunities
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/54">
                Early signals tracked through outcome — see what is active, weakening, or failed.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-white/46">
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5">
                Snapshot {latestSnapshot ?? "Loading"}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5">
                {userPlan === "explorer" ? "Explorer Preview" : userPlan === "advanced" ? "Advanced" : "Pro"}
              </span>
            </div>
          </div>

          <div className="mt-5 text-xs font-medium text-white/48">
            Active: {signalStats.active} | Failed: {signalStats.failed} | Total: {signalStats.total}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { id: "active", label: "Active opportunities" },
              { id: "all", label: "All signals" },
              { id: "failed", label: "Failed / lost momentum" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id as DiscoveryTab)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  selectedTab === tab.id
                    ? "border-emerald-300/28 bg-emerald-300/10 text-emerald-100"
                    : "border-white/10 bg-white/[0.035] text-white/52 hover:border-white/18 hover:text-white/76",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <StatusPanel text="Loading discovery opportunities..." />
        ) : error ? (
          <StatusPanel tone="warning" text="Discovery API unavailable." detail={error} />
        ) : visibleOpportunities.length === 0 ? (
          <DiscoveryEmptyState selectedTab={selectedTab} />
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleOpportunities.map((opportunity, index) => {
              const marketOpportunityIndex = visibleOpportunities
                .slice(0, index)
                .filter((item) => isActiveMarketOpportunity(item)).length;
              const locked =
                !hasPremiumAccess &&
                isActiveMarketOpportunity(opportunity) &&
                marketOpportunityIndex >= EXPLORER_UNLOCKED_MARKET_COUNT;

              return (
                <OpportunityCard
                  key={`${opportunity.cluster_id}-${opportunity.subcluster_id}-${opportunity.snapshot_date}`}
                  opportunity={opportunity}
                  rank={index + 1}
                  locked={locked}
                />
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

function OpportunityCard({
  opportunity,
  rank,
  locked,
}: {
  opportunity: DiscoveryOpportunity;
  rank: number;
  locked: boolean;
}) {
  const visual = getDiscoveryVisual(opportunity.discovery_label);
  const sourceVisual = getSignalSourceVisual(opportunity.signal_source);
  const lifecycleVisual = getLifecycleVisual(opportunity);
  const confidence = getConfidence(opportunity.discovery_score);
  const isEntityDriven = opportunity.signal_source === "ENTITY_DRIVEN";
  const ctaLabel =
    opportunity.outcome_status === "FAILED" || opportunity.outcome_status === "WEAKENING"
      ? "Review Outcome →"
      : isEntityDriven
        ? "Review Signal"
        : "Explore Opportunity →";

  return (
    <article
      className={cn(
        "relative min-h-[360px] overflow-hidden rounded-2xl border p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)]",
        lifecycleVisual.cardClass,
      )}
    >
      {locked ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#05070a]/78 px-6 text-center backdrop-blur-md">
          <Lock className="h-6 w-6 text-amber-100/80" />
          <div className="mt-3 text-sm font-semibold text-white">See more opportunities like this</div>
          <p className="mt-2 text-xs leading-5 text-white/48">
            Unlock the next early niches before they become crowded topics.
          </p>
          <a
            href="/signup?plan=pro"
            className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition hover:bg-white/90"
          >
            Upgrade to Pro
          </a>
        </div>
      ) : null}

      <div className={cn("flex items-start justify-between gap-3", locked && "blur-[2px]")}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("text-base", visual.textClass)}>{visual.icon}</span>
            <span className={cn("text-[10px] font-semibold uppercase tracking-[0.16em]", visual.textClass)}>
              {getCardHeadline(opportunity)}
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]",
                lifecycleVisual.badgeClass,
              )}
            >
              {lifecycleVisual.label}
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]",
                sourceVisual.className,
              )}
            >
              {sourceVisual.label}
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.045em] text-white">
            {opportunity.intent_label || titleCase(opportunity.subcluster_label)}
          </h2>
          <div className="mt-2 text-xs leading-5 text-white/42">
            Based on: {opportunity.raw_label || opportunity.subcluster_label}
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-black/18 px-3 py-1.5 text-xs text-white/56">
          #{rank}
        </div>
      </div>

      <div className={cn("mt-5 grid grid-cols-3 gap-2", locked && "blur-[2px]")}>
        <Metric label="Demand" value={formatDemand(opportunity.share_delta)} tone={lifecycleVisual.tone} />
        <Metric label="Confidence" value={confidence.label} tone={confidence.tone} />
        <Metric label="Videos" value={Math.round(opportunity.micro_n_videos).toString()} />
      </div>

      <div className={cn("mt-4 space-y-4", locked && "blur-[2px]")}>
        <LifecycleTimeline opportunity={opportunity} />
        <p className="min-h-[48px] text-sm leading-6 text-white/62">
          {getOpportunityExplanation(opportunity)}
        </p>
        <div className={cn("rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em]", lifecycleVisual.badgeClass)}>
          {getRecommendation(opportunity)}
        </div>
        <a
          href={`/dashboard?cluster=${encodeURIComponent(opportunity.cluster_id)}&subcluster=${encodeURIComponent(opportunity.subcluster_id)}&from=discovery`}
          className="inline-flex w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.055] px-4 py-2.5 text-sm font-medium text-white/86 transition hover:border-white/22 hover:bg-white/[0.085]"
        >
          {ctaLabel}
        </a>
      </div>
    </article>
  );
}

function LifecycleTimeline({ opportunity }: { opportunity: DiscoveryOpportunity }) {
  const visual = getLifecycleVisual(opportunity);
  const detectedDate = formatDate(opportunity.detected_snapshot_date ?? opportunity.snapshot_date);
  const outcomeDate = formatDate(opportunity.outcome_snapshot_date ?? opportunity.snapshot_date);
  const outcomeLabel = getOutcomeLabel(opportunity);

  return (
    <div className={cn("rounded-xl border bg-black/18 p-3", visual.timelineClass)}>
      <div className="grid grid-cols-[1fr_18px_1fr] items-center gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/34">Detected {detectedDate}</div>
          <div className="mt-1 text-sm font-medium text-white/78">
            {formatCompactDemand(opportunity.share_delta)}
            {opportunity.micro_n_videos !== undefined ? `, ${Math.round(opportunity.micro_n_videos)} videos` : ""}
          </div>
        </div>
        <div className={cn("text-center text-lg font-semibold", visual.textClass)}>↓</div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/34">Outcome {outcomeDate}</div>
          <div className={cn("mt-1 text-sm font-semibold", visual.textClass)}>{outcomeLabel}</div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-white/52">{getLifecycleText(opportunity)}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "watch" | "risk";
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/18 p-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/34">{label}</div>
      <div
        className={cn(
          "mt-1.5 truncate text-lg font-semibold tracking-[-0.04em]",
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

function StatusPanel({
  text,
  detail,
  tone = "neutral",
}: {
  text: string;
  detail?: string;
  tone?: "neutral" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-5 py-10 text-center",
        tone === "warning"
          ? "border-amber-300/16 bg-amber-300/[0.05] text-amber-100/76"
          : "border-white/8 bg-white/[0.025] text-white/54",
      )}
    >
      <div className="text-sm">{text}</div>
      {detail ? <div className="mt-2 text-xs opacity-70">{detail}</div> : null}
    </div>
  );
}

function DiscoveryEmptyState({ selectedTab }: { selectedTab: DiscoveryTab }) {
  if (selectedTab === "active") {
    return (
      <StatusPanel
        text="No active opportunities right now."
        detail="Recent signals have lost momentum or failed. Switch to 'Failed / Lost Momentum' to review outcomes."
      />
    );
  }

  if (selectedTab === "failed") {
    return (
      <StatusPanel
        text="No failed or weakening signals in this view."
        detail="Use All signals to review the full discovery history."
      />
    );
  }

  return <StatusPanel text="No discovery signals are available yet." />;
}

function getDiscoveryVisual(label: DiscoveryLabel) {
  if (label === "EARLY_BREAKOUT") {
    return {
      label: "Early breakout",
      icon: <TrendingUp className="h-4 w-4" />,
      textClass: "text-emerald-200",
      cardClass: "border-emerald-300/16 bg-emerald-300/[0.045]",
      tone: "positive" as const,
    };
  }

  if (label === "EMERGING_SIGNAL") {
    return {
      label: "Emerging signal",
      icon: <Sparkles className="h-4 w-4" />,
      textClass: "text-cyan-200",
      cardClass: "border-cyan-300/14 bg-cyan-300/[0.04]",
      tone: "positive" as const,
    };
  }

  return {
    label: "Watchlist signal",
    icon: <Sparkles className="h-4 w-4" />,
    textClass: "text-amber-200",
    cardClass: "border-amber-300/14 bg-amber-300/[0.04]",
    tone: "watch" as const,
  };
}

function getSignalSourceVisual(source: SignalSource) {
  if (source === "MARKET") {
    return {
      label: "Market signal",
      className: "border-emerald-300/16 bg-emerald-300/[0.06] text-emerald-100/70",
    };
  }

  if (source === "ENTITY_DRIVEN") {
    return {
      label: "Entity-driven spike",
      className: "border-violet-300/16 bg-violet-300/[0.06] text-violet-100/72",
    };
  }

  if (source === "EVENT_DRIVEN") {
    return {
      label: "Event-driven signal",
      className: "border-cyan-300/16 bg-cyan-300/[0.06] text-cyan-100/72",
    };
  }

  return {
    label: "Unverified signal",
    className: "border-white/10 bg-white/[0.04] text-white/48",
  };
}

function getVisibleOpportunities(opportunities: DiscoveryOpportunity[], selectedTab: DiscoveryTab) {
  const filtered = opportunities.filter((opportunity) => {
    if (selectedTab === "active") {
      return isActiveMarketOpportunity(opportunity);
    }

    if (selectedTab === "failed") {
      return opportunity.outcome_status === "FAILED" || opportunity.outcome_status === "WEAKENING";
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    if (selectedTab === "failed") {
      return getTime(b.detected_snapshot_date ?? b.snapshot_date) - getTime(a.detected_snapshot_date ?? a.snapshot_date);
    }

    const statusDelta = getStatusSortWeight(a) - getStatusSortWeight(b);
    if (statusDelta !== 0) return statusDelta;

    return b.discovery_score - a.discovery_score;
  });
}

function getSignalStats(opportunities: DiscoveryOpportunity[]) {
  const active = opportunities.filter(isActiveMarketOpportunity).length;
  const failed = opportunities.filter(
    (opportunity) => opportunity.outcome_status === "FAILED" || opportunity.outcome_status === "WEAKENING",
  ).length;

  return {
    active,
    failed,
    total: opportunities.length,
  };
}

function isActiveMarketOpportunity(opportunity: DiscoveryOpportunity) {
  return (
    opportunity.signal_source === "MARKET" &&
    (opportunity.outcome_status === "ACTIVE" || opportunity.outcome_status === "PENDING")
  );
}

function getStatusSortWeight(opportunity: DiscoveryOpportunity) {
  if (opportunity.outcome_status === "ACTIVE") return 0;
  if (opportunity.outcome_status === "PENDING") return 1;
  if (opportunity.outcome_status === "WEAKENING") return 2;
  if (opportunity.outcome_status === "FAILED") return 3;
  return 4;
}

function getLifecycleVisual(opportunity: DiscoveryOpportunity) {
  if (opportunity.signal_source === "ENTITY_DRIVEN") {
    return {
      label: "Entity-driven spike",
      textClass: "text-violet-100",
      badgeClass: "border-violet-300/16 bg-violet-300/[0.06] text-violet-100/72",
      cardClass: "border-violet-300/14 bg-violet-300/[0.04]",
      timelineClass: "border-violet-300/12",
      tone: "watch" as const,
    };
  }

  if (opportunity.outcome_status === "FAILED") {
    return {
      label: "Lost momentum",
      textClass: "text-rose-200",
      badgeClass: "border-rose-300/18 bg-rose-300/[0.07] text-rose-100/78",
      cardClass: "border-rose-300/16 bg-rose-300/[0.045]",
      timelineClass: "border-rose-300/14",
      tone: "risk" as const,
    };
  }

  if (opportunity.outcome_status === "WEAKENING") {
    return {
      label: "Weakening",
      textClass: "text-amber-200",
      badgeClass: "border-amber-300/18 bg-amber-300/[0.07] text-amber-100/78",
      cardClass: "border-amber-300/16 bg-amber-300/[0.045]",
      timelineClass: "border-amber-300/14",
      tone: "watch" as const,
    };
  }

  if (opportunity.outcome_status === "PENDING") {
    return {
      label: "Awaiting confirmation",
      textClass: "text-cyan-200",
      badgeClass: "border-cyan-300/18 bg-cyan-300/[0.07] text-cyan-100/78",
      cardClass: "border-cyan-300/16 bg-cyan-300/[0.045]",
      timelineClass: "border-cyan-300/14",
      tone: "neutral" as const,
    };
  }

  return {
    label: opportunity.outcome_status === "UNKNOWN" ? "Outcome unknown" : "Active signal",
    textClass: "text-emerald-200",
    badgeClass: "border-emerald-300/18 bg-emerald-300/[0.07] text-emerald-100/78",
    cardClass: "border-emerald-300/16 bg-emerald-300/[0.045]",
    timelineClass: "border-emerald-300/14",
    tone: "positive" as const,
  };
}

function getCardHeadline(opportunity: DiscoveryOpportunity) {
  if (opportunity.signal_source === "ENTITY_DRIVEN") return "Monitor only";
  if (opportunity.outcome_status === "FAILED") return "Not a current opportunity";
  if (opportunity.outcome_status === "WEAKENING") return "Momentum weakening";
  return "Opportunity forming before broader trend";
}

function getRecommendation(opportunity: DiscoveryOpportunity) {
  if (opportunity.signal_source === "ENTITY_DRIVEN") return "Recommendation: MONITOR";
  if (opportunity.outcome_status === "FAILED") return "Recommendation: AVOID / REVIEW";
  if (opportunity.outcome_status === "WEAKENING") return "Recommendation: MONITOR";
  return "Recommended: EXPLORE";
}

function getOutcomeLabel(opportunity: DiscoveryOpportunity) {
  if (opportunity.signal_source === "ENTITY_DRIVEN") return "Monitor only";
  if (opportunity.outcome_status === "FAILED") return "Lost momentum";
  if (opportunity.outcome_status === "WEAKENING") return "Losing momentum";
  if (opportunity.outcome_status === "PENDING") return "Awaiting confirmation";
  if (opportunity.outcome_status === "ACTIVE") return "Active";
  return "Unknown";
}

function getLifecycleText(opportunity: DiscoveryOpportunity) {
  if (opportunity.outcome_status === "FAILED") return "This signal did not sustain.";
  if (opportunity.outcome_status === "WEAKENING") return "This signal is losing share relative to its parent topic.";
  if (opportunity.outcome_status === "PENDING") return "Status: Awaiting confirmation";
  if (opportunity.outcome_status === "ACTIVE") return "Status: Active";
  return opportunity.lifecycle_summary ?? "Outcome has not been classified yet.";
}

function getLatestSnapshot(opportunities: DiscoveryOpportunity[]) {
  const snapshots = opportunities
    .map((opportunity) => formatDate(opportunity.snapshot_date))
    .filter(Boolean)
    .sort();

  return snapshots[snapshots.length - 1] ?? "";
}

function formatDate(value: string) {
  return value ? value.slice(0, 10) : "";
}

function formatDemand(value?: number | null) {
  if (value === null || value === undefined) return "-";
  const percent = value * 100;
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}% demand surge`;
}

function formatCompactDemand(value?: number | null) {
  if (value === null || value === undefined) return "-";
  const percent = value * 100;
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}% demand`;
}

function getTime(value?: string) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getConfidence(score: number) {
  if (score >= 0.6) {
    return { label: "High", tone: "positive" as const };
  }

  if (score >= 0.4) {
    return { label: "Medium", tone: "watch" as const };
  }

  return { label: "Early", tone: "neutral" as const };
}

function getOpportunityExplanation(opportunity: DiscoveryOpportunity) {
  if (opportunity.signal_source === "ENTITY_DRIVEN") {
    return "This appears linked to a specific creator, brand, or named entity. Monitor before building content.";
  }

  if (opportunity.outcome_status === "FAILED") {
    return "This signal was detected early but later failed to sustain.";
  }

  if (opportunity.outcome_status === "WEAKENING") {
    return "This signal is losing share relative to its parent topic.";
  }

  return "Demand is forming around this creator intent before the broader topic moves.";
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => {
      if (word === "-") return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
