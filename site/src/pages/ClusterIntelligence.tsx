import { useEffect, useMemo, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import DashboardDataStatus from "../components/DashboardDataStatus";
import SiteHeader from "../components/SiteHeader";
import PageSeo from "../components/seo/PageSeo";
import audienceIntentRows from "../data/cluster_audience_intent_v4_0.json";
import fallbackClusterTimeseriesRows from "../data/cluster_timeseries_v3_3.json";
import fallbackLeaderboardRows from "../data/leaderboard_v3_3.json";
import { useDashboardExportData } from "../hooks/useDashboardExportData";
import { getTaxonomyDisplayLanguage } from "../lib/dashboardLanguage";
import { getClusterTaxonomy, type ClusterTaxonomy } from "../lib/clusterTaxonomy";

type Tone = "positive" | "watch" | "risk" | "neutral";
type IntelligenceTab =
  | "Overview"
  | "Momentum"
  | "Micro-Niches"
  | "Divergence"
  | "Failure Risk"
  | "Audience Intent"
  | "Content Opportunities"
  | "Breaking Out"
  | "Audience";

type LeaderboardRow = {
  cluster_id?: string;
  rank: number;
  display_topic_title: string;
  display_title?: string;
  title?: string;
  topic_subtitle?: string;
  cluster_label?: string;
  trend_strength_score: number;
  trend_confidence?: number | null;
  decision_label?: string;
  trend_summary?: string;
  opportunity_summary?: string;
  risk_summary?: string;
  growth_since_freeze_pct?: number | null;
  absolute_growth?: number | null;
  latest_n_videos?: number | null;
  freeze_n_videos?: number | null;
  weeks_observed?: number | null;
  consecutive_up_weeks?: number | null;
  score_anchor?: string;
  trend_direction?: string;
  t60_is_winner?: boolean | number;
  latest_snapshot_date?: string;
  failure_risk_level?: string | null;
  failure_risk_score?: number | null;
  failure_risk_reason_code?: string | null;
  failure_risk_reason_label?: string | null;
  short_video_share?: number | null;
  midform_video_share?: number | null;
  long_video_share?: number | null;
  format_strategy_label?: string | null;
  format_strategy_summary?: string | null;
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
  trend_strength_score?: number | null;
  normalized_score?: number | null;
};

type MicroNicheRow = {
  cluster_id?: string;
  subcluster_id?: string;
  subcluster_label?: string;
  canonical_subcluster_label?: string | null;
  semantic_label_status?: string | null;
  display_label?: string | null;
  assigned_video_count?: number | null;
  micro_emergence_score?: number | null;
  stability_label?: string | null;
  stability_score?: number | null;
  snapshot_date?: string;
  representative_titles?: string[] | string | null;
  evidence_titles?: string[] | string | null;
  top_titles?: string[] | string | null;
  top_20_titles?: string[] | string | null;
};

type OpportunityRow = {
  cluster_id?: string;
  opportunity_id?: string;
  opportunity_name?: string;
  opportunity_status?: "READY" | "NEEDS_REVIEW" | "REJECTED" | string;
  interest_level?: string;
  videos_tracked?: number | null;
  evidence_titles?: string[] | string | null;
  evidence_status?: "AVAILABLE" | "LIMITED" | "MISSING" | string;
  reason?: string;
  rejection_reason?: string;
};

type DivergenceRow = {
  cluster_id?: string;
  subcluster_id?: string;
  subcluster_label?: string;
  divergence_label?: string | null;
  divergence_score?: number | null;
  share_delta?: number | null;
  relative_growth_spread?: number | null;
  micro_wow_pct?: number | null;
  parent_wow_pct?: number | null;
  snapshot_date?: string;
};

type AudienceIntentRow = {
  cluster_id?: string;
  intent_label?: string;
  intent_score?: number | null;
  example_queries?: string[] | null;
  recommended_content_angles?: string[] | string | null;
  source_type?: string | null;
};

const fallbackLeaderboard = fallbackLeaderboardRows as LeaderboardRow[];
const fallbackClusterTimeseries = fallbackClusterTimeseriesRows as ClusterTimeseriesRow[];
const audienceIntents = asArray<AudienceIntentRow>(audienceIntentRows);

const DECISION_LABEL_MAP: Record<string, string> = {
  STRONG_TREND: "Sustained Growth",
  EARLY_TREND: "Early Opportunity",
  EMERGING: "Watch closely",
  WEAK_OR_RISK: "High Risk",
};

const STABLE_SNAPSHOT_CHANGE_THRESHOLD = 0.05;
const TEMPORAL_DEBUG_CLUSTER_IDS = ["SC002", "SC161", "SC006"];

const tabs: IntelligenceTab[] = ["Overview", "Content Opportunities", "Breaking Out", "Audience"];

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export default function ClusterIntelligence() {
  const { clusterId } = useParams();
  const dashboardData = useDashboardExportData();
  const leaderboard = useMemo(() => {
    const rows = asArray<LeaderboardRow>(dashboardData.data.dashboard);
    return rows.length > 0 ? rows : fallbackLeaderboard;
  }, [dashboardData.data.dashboard]);
  const clusterTimeseries = useMemo(() => {
    const rows = asArray<ClusterTimeseriesRow>(dashboardData.data.timeseries);
    return rows.length > 0 ? rows : fallbackClusterTimeseries;
  }, [dashboardData.data.timeseries]);
  useEffect(() => {
    logTemporalDebugChecks(clusterTimeseries, {
      phase: "detail-data-resolved",
      source: dashboardData.source,
    });
  }, [clusterTimeseries, dashboardData.source]);
  const microNiches = asArray<MicroNicheRow>(dashboardData.data.microNiches);
  const opportunities = asArray<OpportunityRow>(dashboardData.data.opportunities);
  const divergences = asArray<DivergenceRow>(dashboardData.data.divergence);
  const normalizedRouteClusterId = normalizeClusterId(clusterId);
  const cluster = leaderboard.find((row) => normalizeClusterId(row.cluster_id) === normalizedRouteClusterId);

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <PageSeo
        title={cluster ? `${getTopicTitle(cluster)} | VidCluster` : "Topic Details | VidCluster"}
        description="A closer look at this topic's recent movement and content opportunity."
        url={clusterId ? `/dashboard/cluster/${clusterId}` : "/dashboard"}
      />
      <SiteHeader />

      <main className="bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.065),transparent_28%),linear-gradient(180deg,#0b0f16_0%,#05070a_100%)] px-4 py-6 lg:px-6">
        <div className="mx-auto max-w-[1420px]">
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/62 transition hover:border-white/18 hover:text-white"
          >
            Back to Dashboard
          </Link>

          <div className="mt-4">
            <DashboardDataStatus state={dashboardData} />
          </div>

          {!cluster ? (
            <ClusterNotFound />
          ) : (
            <ClusterReport
              cluster={cluster}
              clusterTimeseries={clusterTimeseries}
              microNiches={microNiches}
              opportunities={opportunities}
              divergences={divergences}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function ClusterReport({
  cluster,
  clusterTimeseries,
  microNiches,
  opportunities,
  divergences,
}: {
  cluster: LeaderboardRow;
  clusterTimeseries: ClusterTimeseriesRow[];
  microNiches: MicroNicheRow[];
  opportunities: OpportunityRow[];
  divergences: DivergenceRow[];
}) {
  const confidence = getConfidenceValue(cluster);
  const timeseries = getClusterTimeseries(clusterTimeseries, cluster.cluster_id);
  const clusterMicroNiches = getClusterMicroNiches(microNiches, cluster.cluster_id);
  const clusterOpportunities = getClusterOpportunities(opportunities, cluster.cluster_id);
  const clusterDivergences = getClusterDivergences(divergences, cluster.cluster_id);
  const clusterAudienceIntents = getClusterAudienceIntents(cluster.cluster_id);
  const snapshotComparison = getSnapshotComparison(cluster, timeseries);
  const trendInterpretation = getTrendInterpretation(cluster, timeseries);
  const latestSnapshotChange = getLatestSnapshotChange(timeseries);
  const displayTitle = getTopicTitle(cluster);
  const displaySubtitle = getTopicSubtitle(cluster, displayTitle);
  const clusterTaxonomy = getClusterTaxonomy(cluster.cluster_id ?? "");

  return (
    <>
      <section id="overview" className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.024)_58%,rgba(16,185,129,0.035))] p-5 shadow-[0_22px_80px_rgba(0,0,0,0.32)] md:p-6">
        <div className="grid items-end gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge>Rank #{cluster.rank}</Badge>
              <Badge>{mapDecisionLabel(cluster.decision_label)}</Badge>
              <Badge>Updated {formatSnapshotDate(cluster.latest_snapshot_date)}</Badge>
            </div>
            <h1
              className="mt-4 max-w-5xl text-3xl font-semibold leading-[1.02] tracking-[-0.04em] text-white md:text-5xl"
              title={getRawTopicTitle(cluster)}
            >
              {displayTitle}
            </h1>
            {displaySubtitle ? (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200/64 md:text-base">{displaySubtitle}</p>
            ) : null}
            <p className="mt-4 max-w-4xl text-sm leading-6 text-white/70 md:text-base">{getIntelligenceSummary(cluster)}</p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-emerald-300/16 bg-black/18 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:grid-cols-2 xl:grid-cols-1">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/56">Current growth</div>
              <div className="mt-1.5 text-3xl font-semibold leading-none tracking-[-0.045em] text-emerald-100">
                {formatWholePercent(cluster.growth_since_freeze_pct)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">Latest video count</div>
              <div className="mt-1.5 text-2xl font-semibold leading-none tracking-[-0.035em] text-white/84">
                {cluster.latest_n_videos ? cluster.latest_n_videos.toLocaleString() : "Not available yet"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionNav />

      <section className="mt-4 rounded-2xl border border-white/10 bg-[#05090e] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] md:p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Evidence" value={mapConfidence(cluster)} helper={formatScore(confidence)} tone={getConfidenceTone(cluster)} />
          <MetricCard label="Stage" value={mapWillLast(cluster)} tone="neutral" />
          <MetricCard label="Latest change" value={latestSnapshotChange.value} helper="since last update" tone={latestSnapshotChange.tone} />
          <MetricCard label="Trend Risk" value={formatFailureRiskLevel(cluster.failure_risk_level)} tone={getFailureRiskTone(cluster)} />
        </div>
      </section>

      <ClusterInterpretationCard taxonomy={clusterTaxonomy} />

      <CreatorSection id="content-opportunities" eyebrow="Content Opportunities" title="Content Opportunities">
        <OpportunitiesPanel rows={clusterOpportunities} />
      </CreatorSection>

      <CreatorSection id="breaking-out" eyebrow="Breaking Out" title="Breaking Out">
        <DivergencePanel rows={clusterDivergences} microNiches={clusterMicroNiches} />
      </CreatorSection>

      <CreatorSection id="audience" eyebrow="Audience" title="Audience">
        <AudienceIntentPanel rows={clusterAudienceIntents} />
      </CreatorSection>

      <section id="history" className="mt-4 rounded-2xl border border-white/10 bg-[#05090e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/34">Recent movement</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Recent Topic Movement</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{formatWholePercent(cluster.growth_since_freeze_pct)}</Badge>
            <Badge>{mapConfidence(cluster)}</Badge>
          </div>
        </div>

        <TrendInterpretationPanel interpretation={trendInterpretation} />

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-h-[330px] rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] p-5">
            <TrendCurveChart rows={timeseries} />
          </div>
          <AtAGlancePanel
            cluster={cluster}
            timeseries={timeseries}
            latestSnapshotChange={latestSnapshotChange}
          />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.032] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/34">Latest update</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">This update vs last update</h2>
          </div>
          <DirectionBadge direction={snapshotComparison.direction} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Current value" value={snapshotComparison.currentValue} helper={snapshotComparison.currentLabel} tone={getGrowthTone(cluster)} />
          <MetricCard label="Previous update" value={snapshotComparison.previousValue} helper={snapshotComparison.previousLabel} tone="neutral" />
          <MetricCard label="Change in videos" value={snapshotComparison.absoluteDelta} helper={snapshotComparison.deltaLabel} tone={snapshotComparison.tone} />
          <MetricCard label="Percent change" value={snapshotComparison.percentDelta} helper={snapshotComparison.deltaLabel} tone={snapshotComparison.tone} />
        </div>
        {snapshotComparison.isReal ? null : (
          <p className="mt-4 rounded-xl border border-amber-300/14 bg-amber-300/[0.045] px-4 py-3 text-xs leading-5 text-amber-50/62">
            We need one more update before comparing this topic over time.
          </p>
        )}
      </section>

      <section id="watchouts" className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid gap-4">
          <NarrativeCard title="Watchouts" body={getWhyTrendNarrative(cluster)} />
          <NarrativeCard title="Recommended action" body={cluster.opportunity_summary || getRecommendedAction(cluster)} />
          <NarrativeCard title="Trend Risk explanation" body={cluster.risk_summary || cluster.failure_risk_reason_label || "Early observations only; additional updates will make the risk picture clearer."} />
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.032] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/34">Format fit</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{formatStrategyLabel(cluster.format_strategy_label)}</h2>
          <p className="mt-3 text-base leading-7 text-white/62">
            {cluster.format_strategy_summary || "Format share data is not available for this topic yet."}
          </p>
          <p className="mt-4 rounded-xl border border-emerald-300/14 bg-emerald-300/[0.045] px-3 py-2 text-sm leading-6 text-emerald-50/68">
            {getFormatImplication(cluster)}
          </p>
          <div className="mt-5 space-y-5">
            <FormatShare label="Short" value={cluster.short_video_share} />
            <FormatShare label="Mid" value={cluster.midform_video_share} />
            <FormatShare label="Long" value={cluster.long_video_share} />
          </div>
        </section>
      </section>
    </>
  );
}

function ClusterNotFound() {
  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-200/78">Topic not found</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">No matching topic found</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
        This topic is not available in the latest dashboard data.
      </p>
    </section>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-white/62">
      {children}
    </span>
  );
}

function MetricCard({ label, value, helper, tone }: { label: string; value: string; helper?: string; tone: Tone }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">{label}</div>
      <div className={`mt-2 truncate text-lg font-semibold ${getToneClass(tone)}`}>{value}</div>
      {helper ? <div className="mt-1 text-xs text-white/38">{helper}</div> : null}
    </div>
  );
}

function DirectionBadge({ direction }: { direction: "up" | "down" | "flat" | "unknown" }) {
  const label = direction === "up" ? "Up" : direction === "down" ? "Down" : direction === "flat" ? "Flat" : "Previous update not available";
  const className =
    direction === "up"
      ? "border-emerald-300/24 bg-emerald-300/[0.08] text-emerald-100"
      : direction === "down"
        ? "border-rose-300/26 bg-rose-300/[0.08] text-rose-100"
        : "border-slate-300/16 bg-slate-300/[0.055] text-slate-200/68";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] ${className}`}>
      {label}
    </span>
  );
}

function TrendInterpretationPanel({
  interpretation,
}: {
  interpretation: { body: string; chips: Array<{ label: string; tone: Tone }> };
}) {
  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.032] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.16)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/34">What changed</p>
          <p className="mt-3 text-sm leading-6 text-white/70 md:text-base">{interpretation.body}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {interpretation.chips.map((chip) => (
            <span
              key={chip.label}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getChipClass(chip.tone)}`}
            >
              {chip.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionNav() {
  const links = [
    { label: "Overview", href: "#overview" },
    { label: "Cluster Interpretation", href: "#cluster-interpretation" },
    { label: "Content Opportunities", href: "#content-opportunities" },
    { label: "Audience", href: "#audience" },
    { label: "Breaking Out", href: "#breaking-out" },
    { label: "Risks & Watchouts", href: "#watchouts" },
    { label: "History", href: "#history" },
  ];

  return (
    <nav className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
      <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-7">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-xl px-3 py-2 text-center text-xs font-semibold text-white/58 transition hover:bg-white/[0.055] hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function ClusterInterpretationCard({ taxonomy }: { taxonomy?: ClusterTaxonomy | null }) {
  const displayLanguage = taxonomy ? getTaxonomyDisplayLanguage(taxonomy.cluster_type) : null;

  return (
    <section
      id="cluster-interpretation"
      className="mt-4 scroll-mt-24 rounded-2xl border border-white/10 bg-[#05090e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] md:p-6"
    >
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/34">Human Read</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">How To Read This Cluster</h2>
      </div>

      {taxonomy && displayLanguage ? (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <InterpretationField label="Verdict" value={displayLanguage.verdict} />
            <InterpretationField label="Why This Matters" value={displayLanguage.why} />
            <InterpretationField label="What You Should Do Next" value={displayLanguage.suggestion} />
            <InterpretationField label="How Sure We Are" value={taxonomy.confidence || "Needs more review"} />
          </div>
        </>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <InterpretationField label="Verdict" value="Needs More Review" />
          <InterpretationField
            label="Why This Matters"
            value="VidCluster has found movement here, but this cluster has not been manually reviewed yet."
          />
          <InterpretationField
            label="What You Should Do Next"
            value="Use the evidence, audience, and risk sections before making a content decision."
          />
          <InterpretationField label="How Sure We Are" value="Not reviewed yet" />
        </div>
      )}
    </section>
  );
}

function InterpretationField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">{label}</p>
      <p className="mt-2 text-lg font-semibold leading-6 text-white/86">{value || "Not available yet"}</p>
    </div>
  );
}

function CreatorSection({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-4 scroll-mt-24 rounded-2xl border border-white/10 bg-[#05090e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] md:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/34">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function AtAGlancePanel({
  cluster,
  timeseries,
  latestSnapshotChange,
}: {
  cluster: LeaderboardRow;
  timeseries: ClusterTimeseriesRow[];
  latestSnapshotChange: { value: string; tone: Tone };
}) {
  const latest = timeseries[timeseries.length - 1];
  const latestVideos = finiteNumber(latest?.n_videos) ?? finiteNumber(cluster.latest_n_videos);

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/34">At a glance</p>
      <div className="mt-4 grid gap-3">
        <MetricCard label="Videos tracked" value={latestVideos === null ? "Not available yet" : latestVideos.toLocaleString()} tone="neutral" />
        <MetricCard label="Latest change" value={latestSnapshotChange.value} helper="since last update" tone={latestSnapshotChange.tone} />
        <MetricCard label="Evidence" value={mapConfidence(cluster)} tone={getConfidenceTone(cluster)} />
        <MetricCard label="Stage" value={mapWillLast(cluster)} tone="neutral" />
      </div>
    </aside>
  );
}

function TabContentPanel({
  activeTab,
  cluster,
  timeseries,
  microNiches,
  divergences,
  audienceIntents,
  snapshotComparison,
}: {
  activeTab: IntelligenceTab;
  cluster: LeaderboardRow;
  timeseries: ClusterTimeseriesRow[];
  microNiches: MicroNicheRow[];
  divergences: DivergenceRow[];
  audienceIntents: AudienceIntentRow[];
  snapshotComparison: ReturnType<typeof getSnapshotComparison>;
}) {
  const first = timeseries[0];
  const latest = timeseries[timeseries.length - 1];

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-[#05090e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      {activeTab === "Overview" ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/34">Current read</p>
            <p className="mt-3 text-sm leading-6 text-white/68">{getIntelligenceSummary(cluster)}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <TabStat label="Growth" value={formatWholePercent(cluster.growth_since_freeze_pct)} tone={getGrowthTone(cluster)} />
            <TabStat label="Evidence" value={mapConfidence(cluster)} tone={getConfidenceTone(cluster)} />
            <TabStat label="Latest videos" value={latest?.n_videos?.toLocaleString() ?? formatNumber(cluster.latest_n_videos)} tone="neutral" />
            <TabStat label="Trend Risk" value={formatFailureRiskLevel(cluster.failure_risk_level)} tone={getFailureRiskTone(cluster)} />
          </div>
        </div>
      ) : null}

      {activeTab === "Momentum" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <TabStat label="Latest delta" value={snapshotComparison.absoluteDelta} helper={snapshotComparison.deltaLabel} tone={snapshotComparison.tone} />
          <TabStat label="Percent change" value={snapshotComparison.percentDelta} helper="since last update" tone={snapshotComparison.tone} />
          <TabStat label="Direction" value={titleCase(snapshotComparison.direction)} tone={snapshotComparison.tone} />
          <TabStat label="Updates tracked" value={timeseries.length.toString()} tone="neutral" />
          <TabStat
            label="First to latest"
            value={first && latest ? `${formatNumber(first.n_videos)} → ${formatNumber(latest.n_videos)}` : "Not enough data yet"}
            helper={first?.snapshot_date && latest?.snapshot_date ? `${formatShortDate(first.snapshot_date)} to ${formatShortDate(latest.snapshot_date)}` : undefined}
            tone="neutral"
          />
        </div>
      ) : null}

      {activeTab === "Micro-Niches" ? (
        <MicroNichesPanel rows={microNiches} />
      ) : null}

      {activeTab === "Divergence" ? (
        <DivergencePanel rows={divergences} microNiches={microNiches} />
      ) : null}

      {activeTab === "Failure Risk" ? (
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="grid gap-3">
            <TabStat label="Risk level" value={formatFailureRiskLevel(cluster.failure_risk_level)} tone={getFailureRiskTone(cluster)} />
            <TabStat label="Risk note" value={formatFailureRiskReason(cluster.failure_risk_reason_code)} tone={getFailureRiskTone(cluster)} />
            <TabStat label="Risk score" value={formatRiskScore(cluster.failure_risk_score)} tone={getFailureRiskTone(cluster)} />
          </div>
          <NarrativeCard
            title="Risk note"
            body={cluster.risk_summary || cluster.failure_risk_reason_label || "Early observations only; additional updates will make the risk picture clearer."}
          />
        </div>
      ) : null}

      {activeTab === "Audience Intent" ? (
        <AudienceIntentPanel rows={audienceIntents} />
      ) : null}
    </div>
  );
}

function TabStat({ label, value, helper, tone }: { label: string; value: string; helper?: string; tone: Tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">{label}</p>
      <p className={`mt-2 truncate text-lg font-semibold ${getToneClass(tone)}`}>{value}</p>
      {helper ? <p className="mt-1 text-xs text-white/38">{helper}</p> : null}
    </div>
  );
}

function OpportunitiesPanel({ rows }: { rows?: OpportunityRow[] | null }) {
  const safeRows = asArray<OpportunityRow>(rows);

  if (safeRows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.025] p-5">
        <p className="text-lg font-semibold text-white/82">No approved opportunities yet.</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/52">
          We found possible areas, but they need clearer labels before showing them here.
        </p>
      </div>
    );
  }

  const opportunityRows = safeRows.slice(0, 8);

  return (
    <div className="space-y-4">
      <p className="text-base leading-7 text-white/68">High-potential angles creators can explore inside this topic.</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {opportunityRows.map((row, index) => {
          const evidence = getLayerOpportunityEvidence(row);
          const interest = formatSelectedValue(row.interest_level);

          return (
            <div
              key={row.opportunity_id || `${row.cluster_id ?? "opportunity"}-${index}`}
              className={
                "rounded-2xl border p-5 shadow-[0_18px_60px_rgba(0,0,0,0.16)] " +
                (index === 0
                  ? "border-emerald-300/28 bg-[linear-gradient(180deg,rgba(16,185,129,0.095),rgba(255,255,255,0.035))]"
                  : "border-white/10 bg-white/[0.035]")
              }
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/46">
                  {index === 0 ? "Top opportunity" : "Opportunity"}
                </p>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getChipClass(getInterestTone(interest))}`}>
                  {interest}
                </span>
              </div>
              <p className="mt-3 min-h-[52px] text-lg font-semibold leading-6 text-white/90">
                {row.opportunity_name || "Untitled opportunity"}
              </p>
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <OpportunityField label="Interest Level" value={interest} />
                  <OpportunityField label="Videos Tracked" value={formatNumber(row.videos_tracked)} />
                </div>
                <OpportunityEvidenceList evidence={evidence} />
                {row.reason ? <p className="text-xs leading-5 text-white/42">{row.reason}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OpportunityField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/34">{label}</p>
      <p className="mt-1.5 text-sm leading-6 text-white/66">{value}</p>
    </div>
  );
}

function OpportunityEvidenceList({
  evidence,
}: {
  evidence?: { titles?: string[]; label?: string; tone?: Tone; note?: string; emptyMessage?: string };
}) {
  const titles = asArray<string>(evidence?.titles);
  const label = evidence?.label || "No title evidence yet";
  const tone = evidence?.tone || "neutral";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/34">Recent examples</p>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getChipClass(tone)}`}>
          {label}
        </span>
      </div>
      {titles.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {titles.map((title) => (
            <li key={title} className="flex gap-2 text-sm leading-6 text-white/68">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300/80" />
              <span>{title}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm leading-6 text-white/52">{evidence?.emptyMessage ?? "No example titles available yet."}</p>
      )}
      {evidence?.note ? <p className="mt-2 text-xs leading-5 text-white/42">{evidence.note}</p> : null}
    </div>
  );
}

function DivergencePanel({ rows, microNiches }: { rows: DivergenceRow[]; microNiches: MicroNicheRow[] }) {
  const safeRows = asArray<DivergenceRow>(rows);
  const safeMicroNiches = asArray<MicroNicheRow>(microNiches);

  if (safeRows.length === 0) {
    return <BreakoutEmptyState />;
  }

  const labelsBySubclusterId = new Map(safeMicroNiches.map((row) => [row.subcluster_id, row.subcluster_label]));
  const enrichedRows = safeRows.map((row) => ({ ...row, subcluster_label: row.subcluster_label || labelsBySubclusterId.get(row.subcluster_id) }));
  const usefulRows = enrichedRows
    .filter((row) => (row.divergence_score ?? 0) !== 0 || (row.share_delta ?? 0) !== 0 || (row.relative_growth_spread ?? 0) !== 0)
    .sort((a, b) => {
      const divergenceDelta = Math.abs(b.divergence_score ?? 0) - Math.abs(a.divergence_score ?? 0);
      if (divergenceDelta !== 0) return divergenceDelta;
      const shareDelta = Math.abs(b.share_delta ?? 0) - Math.abs(a.share_delta ?? 0);
      if (shareDelta !== 0) return shareDelta;
      return String(a.subcluster_label ?? "").localeCompare(String(b.subcluster_label ?? ""));
    });

  if (usefulRows.length === 0) {
    return <BreakoutEmptyState />;
  }

  return (
    <div className="space-y-5">
      <p className="text-base leading-7 text-white/68">Topics growing faster than the rest of this category.</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {usefulRows.slice(0, 9).map((row, index) => (
          <BreakoutCard key={`${row.subcluster_id}-${row.snapshot_date}-${index}`} row={row} />
        ))}
      </div>
    </div>
  );
}

function BreakoutEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.025] p-5">
      <p className="text-lg font-semibold text-white/82">No clear breakout yet</p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/52">
        We'll highlight areas that begin growing faster than the rest of the topic.
      </p>
    </div>
  );
}

function AudienceIntentPanel({ rows }: { rows: AudienceIntentRow[] }) {
  const safeRows = asArray<AudienceIntentRow>(rows);

  if (safeRows.length === 0) {
    return <EmptyTabPanel title="Audience details are not available for this topic yet." />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {safeRows.slice(0, 9).map((row, index) => {
        const audience = getAudienceUnderstanding(row);
        return (
          <div key={`${row.intent_label}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-lg font-semibold text-white/88">{audience.name}</p>
            <div className="mt-5 space-y-4">
              <AudienceField label="Audience" value={audience.who} />
              <AudienceField label="Why they watch" value={audience.whyTheyWatch} />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/34">What they care about</p>
                <ul className="mt-2 space-y-2">
                  {audience.caresAbout.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-white/68">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300/80" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <AudienceField label="Creator opportunity" value={audience.creatorOpportunity} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AudienceField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/34">{label}</p>
      <p className="mt-1.5 text-sm leading-6 text-white/66">{value}</p>
    </div>
  );
}

function BreakoutCard({ row }: { row: DivergenceRow }) {
  const name = getVisibleMicroNicheLabel(row) || "Needs clearer label";
  const tone = getBreakoutTone(row);

  return (
    <article className="flex min-h-[270px] flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.16)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/46">Opportunity</p>
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getChipClass(tone)}`}>
          {getBreakoutConfidence(row)}
        </span>
      </div>
      <p className="mt-3 text-lg font-semibold leading-6 text-white/88">{name}</p>
      <div className="mt-5 space-y-4">
        <BreakoutField label="Relative Growth" value={getRelativeGrowthCopy(row)} />
        <BreakoutField label="Why it matters" value={getBreakoutWhyItMatters(row)} />
        <BreakoutField label="Creator Opportunity" value="Consider testing a focused video around this subject before it becomes crowded." />
      </div>
    </article>
  );
}

function BreakoutField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/34">{label}</p>
      <p className="mt-1.5 text-sm leading-6 text-white/66">{value}</p>
    </div>
  );
}

function MiniStat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/32">{label}</p>
      <p className={`mt-1 truncate font-semibold text-white/76 ${strong ? "text-base" : "text-sm"}`}>{value}</p>
    </div>
  );
}

function EmptyTabPanel({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.025] p-5">
      <p className="text-sm font-semibold text-white/74">{title}</p>
    </div>
  );
}

function TrendCurveChart({ rows }: { rows: ClusterTimeseriesRow[] }) {
  const chartRows = asArray<ClusterTimeseriesRow>(rows)
    .filter((row) => row.snapshot_date)
    .map((row) => {
      const growth = resolveTimeseriesGrowthPct(row);
      const videoCount = resolveTimeseriesVideoCount(row);
      return {
        ...row,
        chart_growth_pct: growth ?? 0,
        growth_available: growth !== null,
        chart_video_count: videoCount,
      };
    });
  const current = chartRows[chartRows.length - 1];
  const yDomain = getTrendChartDomain(chartRows.map((row) => row.chart_growth_pct));
  const lineType = chartRows.length >= 5 ? "monotone" : "linear";

  if (import.meta.env.DEV) {
    console.table(
      chartRows.map((row) => ({
        date: row.snapshot_date,
        raw: row.topic_growth_pct,
        chart: row.chart_growth_pct,
      })),
    );
  }

  if (!current) {
    return (
      <div className="relative min-h-[270px] overflow-hidden rounded-xl border border-dashed border-white/12 bg-[#03060a]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="mx-5 max-w-xl rounded-2xl border border-white/10 bg-black/52 px-5 py-4 text-center shadow-[0_18px_60px_rgba(0,0,0,0.42)]">
            <p className="text-sm font-semibold text-white/78">History is not available for this topic yet</p>
            <p className="mt-2 text-xs leading-5 text-white/44">
              We could not load enough history for this topic.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#03060a] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <LegendDot color="bg-emerald-300" label="Growth" />
          <LegendDot color="bg-slate-400" label="Previous" />
          <LegendDot color="bg-amber-300" label="Current" />
        </div>
        <div className="text-xs text-white/42">
          {chartRows.length} {chartRows.length === 1 ? "update" : "updates"} ·{" "}
          {current.chart_video_count?.toLocaleString() ?? "Video count unavailable"} videos now
        </div>
      </div>

      <div className="h-[330px]">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/32">
          {chartRows.some((row) => row.growth_available) ? "Topic growth %" : "Needs one more update"}
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartRows} margin={{ top: 36, right: 34, bottom: 8, left: 8 }}>
            <defs>
              <linearGradient id="detailTrendAreaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgb(110 231 183)" stopOpacity="0.20" />
                <stop offset="100%" stopColor="rgb(110 231 183)" stopOpacity="0.02" />
              </linearGradient>
              <filter id="detailTrendLineGlow" x="-20%" y="-30%" width="140%" height="160%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="snapshot_date"
              tick={{ fill: "rgba(226,232,240,0.55)", fontSize: 12 }}
              tickFormatter={formatShortDate}
              tickLine={false}
              axisLine={{ stroke: "rgba(148,163,184,0.18)" }}
            />
            <YAxis
              domain={yDomain}
              tick={{ fill: "rgba(226,232,240,0.55)", fontSize: 12 }}
              tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
              tickLine={false}
              axisLine={false}
              width={58}
            />
            <Tooltip content={<DetailTrendTooltip />} />
            <Area
              type={lineType}
              dataKey="chart_growth_pct"
              fill="url(#detailTrendAreaGradient)"
              stroke="none"
              fillOpacity={0.82}
              activeDot={false}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type={lineType}
              dataKey="chart_growth_pct"
              name="Growth"
              stroke="rgb(110 231 183)"
              strokeWidth={8}
              strokeOpacity={0.22}
              dot={false}
              activeDot={false}
              filter="url(#detailTrendLineGlow)"
              isAnimationActive={false}
            />
            <Line
              type={lineType}
              dataKey="chart_growth_pct"
              name="Growth"
              stroke="#f8fafc"
              strokeWidth={4.5}
              strokeOpacity={1}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={{
                r: 3.5,
                strokeWidth: 1.5,
                fill: "#03060a",
                stroke: "rgba(110,231,183,0.88)",
              }}
              connectNulls
              isAnimationActive={false}
              activeDot={{ r: 7, strokeWidth: 2, fill: "rgb(110 231 183)", stroke: "rgba(248,250,252,0.95)" }}
            />
            {chartRows[0] ? (
              <ReferenceDot
                x={chartRows[0].snapshot_date}
                y={chartRows[0].chart_growth_pct}
                r={7}
                fill="#03060a"
                stroke="rgba(110,231,183,0.82)"
                strokeWidth={2}
              />
            ) : null}
            <ReferenceDot
              x={current.snapshot_date}
              y={current.chart_growth_pct}
              r={10}
              fill="rgb(251 191 36)"
              stroke="rgba(248,250,252,0.96)"
              strokeWidth={3}
              label={{ value: "Current", position: "top", fill: "rgba(254,243,199,0.9)", fontSize: 12 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DetailTrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload?: ClusterTimeseriesRow & { chart_growth_pct?: number; chart_video_count?: number | null } }>;
  label?: string | number;
}) {
  if (!active) return null;

  const row = payload?.find((item) => item.payload)?.payload;
  if (!row) return null;

  const growth = finiteNumber(row.chart_growth_pct);
  const videos = finiteNumber(row.chart_video_count);
  const date = formatSnapshotDate(String(label ?? row.snapshot_date ?? ""));

  return (
    <div className="rounded-xl border border-white/12 bg-[#03060a]/95 px-3 py-2 text-xs text-white shadow-[0_16px_45px_rgba(0,0,0,0.35)]">
      <div className="font-semibold text-white/86">{date}</div>
      <div className="mt-2 space-y-1 text-white/66">
        <div>Growth: {growth === null ? "Not available" : `${growth.toFixed(1)}%`}</div>
        <div>Videos: {videos === null ? "Not available" : videos.toLocaleString()}</div>
      </div>
    </div>
  );
}

function getTrendChartDomain(values: Array<number | null | undefined>): [number, number] {
  const finiteValues = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (finiteValues.length === 0) return [-1, 1];

  const min = Math.min(...finiteValues);
  const max = Math.max(...finiteValues);
  if (min === max) {
    const padding = Math.max(1, Math.abs(min) * 0.35);
    return [min - padding, max + padding];
  }

  const range = max - min;
  const padding = Math.max(0.75, range * 0.22);
  return [min - padding, max + padding];
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/56">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function NarrativeCard({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.032] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/34">{title}</p>
      <p className="mt-3 text-sm leading-6 text-white/66">{body}</p>
    </section>
  );
}

function FormatShare({ label, value }: { label: string; value?: number | null }) {
  const hasValue = typeof value === "number";
  const percent = hasValue ? Math.max(0, Math.min(100, value * 100)) : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-base font-semibold text-white/72">{label}</span>
        <span className={hasValue ? "text-sm font-semibold text-white/78" : "text-sm text-white/32"}>{hasValue ? `${percent.toFixed(1)}%` : "Not available yet"}</span>
      </div>
      <div className="mt-2 h-3 rounded-full bg-white/[0.065]">
        <div
          className={hasValue ? "h-3 rounded-full bg-emerald-300/75 shadow-[0_0_18px_rgba(16,185,129,0.18)]" : "h-3 rounded-full bg-white/[0.08]"}
          style={{ width: `${hasValue ? percent : 100}%` }}
        />
      </div>
    </div>
  );
}

function isUsableSemanticLabel(value?: string | null) {
  return Boolean(value?.trim() && value.trim().toLowerCase() !== "needs review");
}

function getVisibleMicroNicheLabel(row?: MicroNicheRow | DivergenceRow) {
  if (!row) return undefined;
  const candidates = [
    "canonical_subcluster_label" in row ? row.canonical_subcluster_label : undefined,
    "clean_micro_niche_label" in row ? row.clean_micro_niche_label : undefined,
    "display_label" in row ? row.display_label : undefined,
    row.subcluster_label,
  ].filter(isUsableSemanticLabel) as string[];
  const stronger = candidates.find((candidate) => !isWeakOpportunityLabel(candidate));
  if (stronger) return stronger.trim();
  return candidates.length > 0 ? "Needs clearer label" : undefined;
}

function isWeakOpportunityLabel(value?: string | null) {
  const text = value?.trim().toLowerCase() ?? "";
  return !text || /\bsegment\s+\d+\b/.test(text) || text.endsWith(" segment");
}

function getCreatorOpportunityCopy(row: MicroNicheRow, label: string) {
  const videos = finiteNumber(row.assigned_video_count);
  const stage = formatSelectedValue(row.stability_label).toLowerCase();
  const strength = finiteNumber(row.micro_emergence_score);
  const attention = getOpportunityAttention(strength, videos, stage);

  return {
    interestLevel: attention.label,
    videosTracked: videos === null ? "Not available yet" : videos.toLocaleString(),
    evidence: getOpportunityEvidence(row),
    attention: attention.label,
    attentionTone: attention.tone,
  };
}

function getOpportunityAttention(strength: number | null, videos: number | null, stage: string) {
  if ((strength !== null && strength >= 0.7) || (videos !== null && videos >= 100)) {
    return { label: "High", tone: "positive" as Tone };
  }

  if ((strength !== null && strength >= 0.4) || (videos !== null && videos >= 40) || stage.includes("stable")) {
    return { label: "Medium", tone: "watch" as Tone };
  }

  return { label: "Watch", tone: "neutral" as Tone };
}

function getOpportunityEvidence(row: MicroNicheRow) {
  const status = String(row.evidence_status ?? "").toUpperCase();
  const allCleanTitles = getEvidenceTitles(row).map(cleanRepresentativeTitle).filter(Boolean);
  const englishReadableTitles = allCleanTitles.filter(isEnglishReadableTitle);
  const hiddenNonEnglishCount = Math.max(0, allCleanTitles.length - englishReadableTitles.length);
  const titles = englishReadableTitles.slice(0, 3);
  const note = hiddenNonEnglishCount > 0 && titles.length < 2
    ? titles.length > 0
      ? "More examples available, but not all are English."
      : "Limited English examples available."
    : undefined;
  const emptyMessage = hiddenNonEnglishCount > 0 && titles.length === 0
    ? "Limited English examples available."
    : undefined;
  if (status === "AVAILABLE") {
    return { titles, label: "Evidence available", tone: "positive" as Tone, note, emptyMessage };
  }
  if (status === "LIMITED") {
    return { titles, label: "Limited evidence", tone: "watch" as Tone, note, emptyMessage };
  }
  return { titles: [], label: "No title evidence yet", tone: "neutral" as Tone };
}

function getLayerOpportunityEvidence(row: OpportunityRow) {
  const status = String(row.evidence_status ?? "").toUpperCase();
  const titles = parseEvidenceTitleList(row.evidence_titles).map(cleanRepresentativeTitle).filter(Boolean).slice(0, 3);

  if (status === "AVAILABLE") {
    return { titles, label: "Evidence available", tone: "positive" as Tone };
  }
  if (status === "LIMITED") {
    return { titles, label: "Limited evidence", tone: "watch" as Tone };
  }
  return {
    titles: [],
    label: "No title evidence yet",
    tone: "neutral" as Tone,
    emptyMessage: "No example titles available yet.",
  };
}

function getInterestTone(value?: string | null): Tone {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (normalized === "high") return "positive";
  if (normalized === "moderate") return "watch";
  return "neutral";
}

function getEvidenceTitles(row: MicroNicheRow) {
  return [
    ...parseEvidenceTitleList(row.representative_titles),
    ...parseEvidenceTitleList(row.evidence_titles),
    ...parseEvidenceTitleList(row.top_titles),
    ...parseEvidenceTitleList(row.top_20_titles),
  ].slice(0, 20);
}

function parseEvidenceTitleList(value?: string[] | string | null) {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value.replace(/'/g, '"'));
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  } catch {
    // Fall through to conservative splitting for CSV-style stringified arrays.
  }

  return value
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(/,\s*/)
    .map((item) => item.replace(/^["']|["']$/g, "").trim())
    .filter(Boolean);
}

function cleanRepresentativeTitle(title: string) {
  const withoutHashtags = title.replace(/#[\p{L}\p{N}_-]+/gu, " ");
  const withoutEmojiNoise = withoutHashtags.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, " ");
  const cleaned = withoutEmojiNoise
    .replace(/\uFFFC/g, " ")
    .replace(/[|—-]\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  return cleaned.length > 80 ? `${cleaned.slice(0, 77).trim()}...` : cleaned;
}

function isEnglishReadableTitle(title: string) {
  const lettersOnly = title.replace(/[^\p{L}]/gu, "");
  if (!lettersOnly) return true;
  const latinLetters = lettersOnly.match(/\p{Script=Latin}/gu)?.length ?? 0;
  return latinLetters / lettersOnly.length >= 0.6;
}

function getTopicTitle(topic: LeaderboardRow) {
  const rawTitle = getRawTopicTitle(topic);
  const subtitle = topic.topic_subtitle?.trim();

  if (rawTitle.includes(" — ")) {
    const [first, second] = rawTitle.split(" — ").map((part) => part.trim());
    if (subtitle && second && subtitle.toLowerCase() === second.toLowerCase()) return first;
  }

  return truncateTitle(rawTitle);
}

function getRawTopicTitle(topic: LeaderboardRow) {
  return topic.display_topic_title || topic.cluster_label || topic.title || topic.cluster_id || "Untitled topic";
}

function getTopicSubtitle(topic: LeaderboardRow, title: string) {
  const subtitle = topic.topic_subtitle?.trim() || topic.cluster_label?.trim();
  if (!subtitle || subtitle.toLowerCase() === title.toLowerCase()) return "";
  return formatTopicSubtitleForDisplay(subtitle);
}

function formatTopicSubtitleForDisplay(subtitle: string) {
  const microSignalMatch = subtitle.match(/^Derived from (\d+) canonical micro-niche labels$/i);
  if (microSignalMatch) {
    const count = Number(microSignalMatch[1]);
    return `Based on ${microSignalMatch[1]} related topic example${count === 1 ? "" : "s"}.`;
  }

  return subtitle;
}

function truncateTitle(value: string) {
  if (value.length <= 72) return value;
  return `${value.slice(0, 69).trim()}...`;
}

function mapDecisionLabel(label?: string) {
  if (!label) return "Status not available yet";
  return DECISION_LABEL_MAP[label] ?? titleCase(label);
}

function getConfidenceValue(topic: LeaderboardRow) {
  const confidence = topic.trend_confidence ?? topic.trend_strength_score;
  if (confidence === null || confidence === undefined) return 0;
  return Math.max(0, Math.min(1, confidence > 1 ? confidence / 100 : confidence));
}

function mapConfidence(topic: LeaderboardRow) {
  const normalized = getConfidenceValue(topic);
  if (normalized >= 0.72) return "Strong Evidence";
  if (normalized >= 0.48) return "Moderate Evidence";
  return "Limited Evidence";
}

function mapWillLast(topic: LeaderboardRow) {
  if (topic.decision_label === "STRONG_TREND") return "Established";
  if (topic.decision_label === "EARLY_TREND") return "Developing Signal";
  if (topic.decision_label === "EMERGING") return "Under Observation";
  if (Boolean(topic.t60_is_winner)) return "Established";
  return "Developing";
}

function mapOpportunityState(topic: LeaderboardRow) {
  const growth = (topic.growth_since_freeze_pct ?? 0) / 100;
  const confidence = topic.trend_confidence ?? topic.trend_strength_score;
  const normalizedConfidence = confidence > 1 ? confidence / 100 : confidence;

  if (topic.decision_label === "WEAK_OR_RISK") return "Late / risky";
  if (topic.decision_label === "STRONG_TREND" && normalizedConfidence >= 0.68) return "Scaling";
  if (topic.decision_label === "EARLY_TREND" || topic.decision_label === "EMERGING" || growth < 0.18) return "Early";
  return "Scaling";
}

function getOpportunityTone(topic: LeaderboardRow): Tone {
  const state = mapOpportunityState(topic);
  if (state === "Early") return "watch";
  if (state === "Scaling") return "positive";
  return "risk";
}

function getGrowthTone(topic: LeaderboardRow): Tone {
  const growth = topic.growth_since_freeze_pct ?? 0;
  if (growth > 0) return "positive";
  if (growth < 0) return "risk";
  return "neutral";
}

function getConfidenceTone(topic: LeaderboardRow): Tone {
  const confidence = getConfidenceValue(topic);
  if (confidence >= 0.72) return "positive";
  if (confidence >= 0.48) return "watch";
  return "risk";
}

function getFailureRiskTone(topic: LeaderboardRow): Tone {
  const level = topic.failure_risk_level?.toUpperCase();
  if (level === "LOW") return "positive";
  if (level === "MEDIUM" || level === "MODERATE") return "watch";
  if (level === "HIGH" || level === "CRITICAL") return "risk";
  return "neutral";
}

function getToneClass(tone: Tone) {
  if (tone === "positive") return "text-emerald-100";
  if (tone === "watch") return "text-amber-100";
  if (tone === "risk") return "text-rose-100";
  return "text-slate-100/76";
}

function getChipClass(tone: Tone) {
  if (tone === "positive") return "border-emerald-300/24 bg-emerald-300/[0.08] text-emerald-100";
  if (tone === "watch") return "border-amber-300/24 bg-amber-300/[0.08] text-amber-100";
  if (tone === "risk") return "border-rose-300/26 bg-rose-300/[0.08] text-rose-100";
  return "border-slate-300/16 bg-slate-300/[0.055] text-slate-200/68";
}

function getIntelligenceSummary(topic: LeaderboardRow) {
  if (topic.trend_summary) return topic.trend_summary;
  if (topic.opportunity_summary) return topic.opportunity_summary;
  return "Use recent movement, evidence, and video count to decide whether this topic deserves attention.";
}

function getWhyTrendNarrative(topic: LeaderboardRow) {
  const trendSummary = topic.trend_summary?.trim();
  const scoreAnchor = topic.score_anchor?.trim();
  const confidence = mapConfidence(topic).toLowerCase();
  const risk = formatObservedFailureRisk(topic.failure_risk_level);

  if (scoreAnchor && scoreAnchor !== trendSummary) return scoreAnchor;

  return `This topic is supported by ${confidence}, ${risk}, and ${formatWholePercent(topic.growth_since_freeze_pct)} topic growth in the current export.`;
}

function getRecommendedAction(topic: LeaderboardRow) {
  if (topic.decision_label === "STRONG_TREND") return "Scale this topic into a repeatable series while the topic remains strong.";
  if (topic.decision_label === "WEAK_OR_RISK") return "Hold new production until a clearer opportunity appears.";
  return "Run a small validation test and watch whether the topic strengthens in the next update.";
}

function getTopicMovementInterpretation(topic: LeaderboardRow, direction: "growing" | "declining" | "flat", videoDeltaPct: number | null, rows: ClusterTimeseriesRow[]) {
  const topicName = getTopicTitle(topic) || "This topic";
  const priorGrowthValues = rows
    .slice(0, -1)
    .map(resolveTimeseriesGrowthPct)
    .filter((value): value is number => value !== null);
  const stableBeforeLatest = priorGrowthValues.length > 0 && priorGrowthValues.every((value) => Math.abs(value) <= 0.05);
  const absMove = Math.abs(videoDeltaPct ?? 0);

  if (direction === "flat") {
    return `${topicName} has stayed broadly stable across recent updates, with limited expansion detected so far.`;
  }

  if (direction === "declining") {
    if (videoDeltaPct === null || absMove < 2.5) {
      return stableBeforeLatest
        ? `${topicName} remained stable through recent updates before showing a mild decline in the latest observation.`
        : `${topicName} shows mild contraction in the latest observation, but the move remains limited.`;
    }
    return `${topicName} shows clearer contraction in the latest observation, so it is worth watching for further softening.`;
  }

  if (videoDeltaPct === null || absMove < 2.5) {
    return stableBeforeLatest
      ? `${topicName} moved up slightly from a stable baseline in the latest observation.`
      : `${topicName} shows mild expansion in the latest observation, but the move remains limited.`;
  }

  return `${topicName} shows clearer expansion in recent observations, indicating the topic is strengthening.`;
}

function getConfidenceSentenceLead(topic: LeaderboardRow) {
  const confidenceLabel = mapConfidence(topic);
  if (confidenceLabel === "Strong Evidence") return "Evidence is strong";
  if (confidenceLabel === "Moderate Evidence") return "Evidence is moderate";
  return "Evidence is limited";
}

function getEvidenceInterpretation(topic: LeaderboardRow, rows: ClusterTimeseriesRow[]) {
  const confidenceLead = getConfidenceSentenceLead(topic);
  const decisionLabel = String(topic.decision_label ?? "").toUpperCase();
  const historyIsLimited = rows.length < 5;
  const riskTone = getFailureRiskTone(topic);

  if (riskTone === "risk") {
    return `${confidenceLead}, but risk indicators keep this under review.`;
  }

  if (decisionLabel.includes("EMERGING") || decisionLabel.includes("EARLY")) {
    return historyIsLimited
      ? `${confidenceLead}; this topic is still forming, so additional updates will make the read stronger.`
      : `${confidenceLead}, and the topic is still forming across the available history.`;
  }

  if (historyIsLimited) {
    return `${confidenceLead}, but historical depth is still limited, so the topic remains under observation.`;
  }

  return `${confidenceLead}; additional updates will clarify whether this behavior persists.`;
}

function getTrendInterpretation(topic: LeaderboardRow, rows: ClusterTimeseriesRow[]) {
  const current = rows[rows.length - 1];
  const previous = rows.length >= 2 ? rows[rows.length - 2] : undefined;
  const currentVideos = current ? finiteNumber(current.n_videos) : null;
  const previousVideos = previous ? finiteNumber(previous.n_videos) : null;
  const confidenceLabel = mapConfidence(topic);

  if (!current || !previous || currentVideos === null || previousVideos === null) {
    return {
      body: "This topic has limited update history, so the first read is directional rather than conclusive.",
      chips: [{ label: "Limited History", tone: "neutral" as Tone }],
    };
  }

  const videoDelta = currentVideos - previousVideos;
  const videoDeltaPct = previousVideos === 0 ? null : (videoDelta / previousVideos) * 100;
  const direction = videoDelta > 0 ? "growing" : videoDelta < 0 ? "declining" : "flat";
  const movement = getTopicMovementInterpretation(topic, direction, videoDeltaPct, rows);
  const evidence = getEvidenceInterpretation(topic, rows);

  return {
    body: `${movement} ${evidence}`,
    chips: [
      { label: direction === "growing" ? "Growing" : direction === "declining" ? "Declining" : "Flat", tone: direction === "growing" ? "positive" as Tone : direction === "declining" ? "risk" as Tone : "neutral" as Tone },
      { label: confidenceLabel, tone: getConfidenceTone(topic) },
      { label: formatFailureRiskChip(topic.failure_risk_level), tone: getFailureRiskTone(topic) },
      { label: videoDeltaPct === null ? `Latest ${formatSignedInteger(videoDelta)}` : `Latest ${formatWholePercent(videoDeltaPct)}`, tone: videoDelta > 0 ? "positive" as Tone : videoDelta < 0 ? "risk" as Tone : "neutral" as Tone },
    ],
  };
}

function getLatestSnapshotChange(rows: ClusterTimeseriesRow[]) {
  const latest = rows[rows.length - 1];
  const change = latest ? resolveTimeseriesGrowthPct(latest) : null;

  return {
    value: formatLatestSnapshotChange(change),
    tone: getSnapshotChangeTone(change),
  };
}

function getSnapshotChangeTone(value: number | null): Tone {
  if (value === null || Math.abs(value) <= STABLE_SNAPSHOT_CHANGE_THRESHOLD) return "neutral";
  return value > 0 ? "positive" : "risk";
}

function getClusterTimeseries(rows: ClusterTimeseriesRow[], clusterId?: string) {
  const normalizedClusterId = normalizeClusterId(clusterId);
  if (!normalizedClusterId) return [];

  return asArray<ClusterTimeseriesRow>(rows)
    .filter((row) => normalizeClusterId(row.cluster_id) === normalizedClusterId && row.snapshot_date)
    .sort((a, b) => String(a.snapshot_date).localeCompare(String(b.snapshot_date)));
}

function logTemporalDebugChecks(
  rows: ClusterTimeseriesRow[],
  context: { phase: string; source: string },
) {
  if (!import.meta.env.DEV) return;

  const summaries = TEMPORAL_DEBUG_CLUSTER_IDS.map((clusterId) => {
    const clusterRows = getClusterTimeseries(rows, clusterId);
    const values = clusterRows.map((row) => resolveTimeseriesGrowthPct(row) ?? 0);
    return {
      clusterId,
      phase: context.phase,
      source: context.source,
      matchedRows: clusterRows.length,
      metric: "topic_growth_pct",
      values,
      label: values.length < 2 ? "Limited History" : "History available",
    };
  });

  console.debug("Temporal trend validation", summaries);
}

function formatSignedInteger(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toLocaleString()}`;
}

function getClusterMicroNiches(rows: MicroNicheRow[], clusterId?: string) {
  const normalizedClusterId = normalizeClusterId(clusterId);
  if (!normalizedClusterId) return [];

  return asArray<MicroNicheRow>(rows)
    .filter((row) => normalizeClusterId(row.cluster_id) === normalizedClusterId)
    .sort((a, b) => (b.micro_emergence_score ?? -1) - (a.micro_emergence_score ?? -1));
}

function getClusterOpportunities(rows: OpportunityRow[], clusterId?: string) {
  const normalizedClusterId = normalizeClusterId(clusterId);
  if (!normalizedClusterId) return [];

  return asArray<OpportunityRow>(rows)
    .filter((row) => normalizeClusterId(row.cluster_id) === normalizedClusterId)
    .filter((row) => String(row.opportunity_status ?? "").toUpperCase() === "READY")
    .sort((a, b) => {
      const interestDelta = getInterestRank(b.interest_level) - getInterestRank(a.interest_level);
      if (interestDelta !== 0) return interestDelta;
      return (b.videos_tracked ?? -1) - (a.videos_tracked ?? -1);
    });
}

function getInterestRank(value?: string | null) {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (normalized === "high") return 3;
  if (normalized === "moderate") return 2;
  if (normalized === "early") return 1;
  return 0;
}

function getClusterDivergences(rows: DivergenceRow[], clusterId?: string) {
  const normalizedClusterId = normalizeClusterId(clusterId);
  if (!normalizedClusterId) return [];

  return asArray<DivergenceRow>(rows)
    .filter((row) => normalizeClusterId(row.cluster_id) === normalizedClusterId)
    .sort((a, b) => {
      const scoreDelta = (b.divergence_score ?? -1) - (a.divergence_score ?? -1);
      if (scoreDelta !== 0) return scoreDelta;
      return String(b.snapshot_date ?? "").localeCompare(String(a.snapshot_date ?? ""));
    });
}

function getClusterAudienceIntents(clusterId?: string) {
  const normalizedClusterId = normalizeClusterId(clusterId);
  if (!normalizedClusterId) return [];

  return asArray<AudienceIntentRow>(audienceIntents)
    .filter((row) => normalizeClusterId(row.cluster_id) === normalizedClusterId)
    .sort((a, b) => (b.intent_score ?? -1) - (a.intent_score ?? -1));
}

function getSnapshotComparison(topic: LeaderboardRow, rows: ClusterTimeseriesRow[]) {
  const current = rows[rows.length - 1];
  const previous = rows.length >= 2 ? rows[rows.length - 2] : undefined;

  if (current && previous && typeof current.n_videos === "number" && typeof previous.n_videos === "number") {
    const absoluteDelta = current.n_videos - previous.n_videos;
    const percentDelta = previous.n_videos === 0 ? null : (absoluteDelta / previous.n_videos) * 100;
    const direction = absoluteDelta > 0 ? "up" : absoluteDelta < 0 ? "down" : "flat";
    const tone: Tone = absoluteDelta > 0 ? "positive" : absoluteDelta < 0 ? "risk" : "neutral";

    return {
      currentValue: current.n_videos.toLocaleString(),
      currentLabel: formatSnapshotDate(current.snapshot_date),
      previousValue: previous.n_videos.toLocaleString(),
      previousLabel: formatSnapshotDate(previous.snapshot_date),
      absoluteDelta: `${absoluteDelta >= 0 ? "+" : ""}${absoluteDelta.toLocaleString()}`,
      percentDelta: percentDelta === null ? "Not enough data yet" : formatWholePercent(percentDelta),
      deltaLabel: "since last update",
      direction,
      tone,
      isReal: true,
    };
  }

  const currentVideos = finiteNumber(current?.n_videos) ?? finiteNumber(topic.latest_n_videos);
  const currentGrowth = typeof topic.growth_since_freeze_pct === "number" ? topic.growth_since_freeze_pct : null;

  return {
    currentValue: currentVideos === null ? "Not enough data yet" : currentVideos.toLocaleString(),
    currentLabel: current?.snapshot_date
      ? formatSnapshotDate(current.snapshot_date)
      : currentGrowth === null
        ? "Latest update videos"
        : `${formatWholePercent(currentGrowth)} growth`,
    previousValue: "Not enough data yet",
    previousLabel: "Needs another update",
    absoluteDelta: "Not enough data yet",
    percentDelta: "Not enough data yet",
    deltaLabel: "Previous update not available",
    direction: "unknown" as const,
    tone: "neutral" as Tone,
    isReal: false,
  };
}

function formatFailureRiskValue(value?: string | null) {
  if (!value) return "Limited History";
  return titleCase(value.split("_").join(" "));
}

function formatFailureRiskLevel(value?: string | null) {
  return formatFailureRiskValue(value);
}

function formatFailureRiskReason(value?: string | null) {
  if (!value) return "Early observations only";
  return formatFailureRiskValue(value);
}

function formatFailureRiskChip(value?: string | null) {
  if (!value) return "Limited History";
  return `${formatFailureRiskLevel(value)} Risk`;
}

function formatObservedFailureRisk(value?: string | null) {
  if (!value) return "limited risk history";
  return `${formatFailureRiskLevel(value).toLowerCase()} observed failure risk`;
}

function formatSelectedValue(value?: string | null) {
  if (!value) return "Not available yet";
  return titleCase(value);
}

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return "Not available yet";
  return value.toLocaleString();
}

function formatDecimal(value?: number | null) {
  if (value === null || value === undefined) return "Not available yet";
  return value.toFixed(2);
}

function formatPP(value?: number | null) {
  if (value === null || value === undefined) return "Not available yet";
  const points = value * 100;
  return `${points >= 0 ? "+" : ""}${points.toFixed(1)}pp`;
}

function formatPercentRatio(value?: number | null) {
  if (value === null || value === undefined) return "Not available yet";
  const percent = Math.abs(value) <= 10 ? value * 100 : value;
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`;
}

function getAudienceUnderstanding(row: AudienceIntentRow) {
  const signals = getAudienceSignals(row);
  const name = formatAudienceName(row.intent_label, signals);
  const caresAbout = getAudienceCareItems(signals, name);

  return {
    name,
    who: inferAudienceWho(name, signals),
    whyTheyWatch: inferAudienceWhy(name, signals),
    caresAbout,
    creatorOpportunity: inferAudienceCreatorOpportunity(name, caresAbout),
  };
}

function getAudienceSignals(row: AudienceIntentRow) {
  return dedupeTextItems([
    row.intent_label,
    ...arrayTextItems(row.example_queries),
    ...arrayTextItems(row.recommended_content_angles),
  ]).slice(0, 12);
}

function arrayTextItems(value?: string[] | string | null) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(/[,;|]/);
  return [];
}

function dedupeTextItems(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  return values
    .map((value) => value?.trim() ?? "")
    .filter(Boolean)
    .map(cleanAudiencePhrase)
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function cleanAudiencePhrase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^create content around:\s*/i, "")
    .replace(/^content angle:\s*/i, "")
    .trim();
}

function formatAudienceName(intentLabel?: string, signals: string[] = []) {
  const label = cleanAudiencePhrase(intentLabel ?? "");
  if (label) return titleCase(label);
  return signals[0] ? titleCase(signals[0]) : "Audience group";
}

function inferAudienceWho(name: string, signals: string[]) {
  const text = `${name} ${signals.join(" ")}`.toLowerCase();
  if (text.includes("islamic") || text.includes("muslim") || text.includes("faith")) return "Muslim parents looking for values-aligned guidance.";
  if (text.includes("baby") || text.includes("infant") || text.includes("toddler") || text.includes("newborn")) return "New parents navigating the first years of parenting.";
  if (text.includes("parent")) return "Parents looking for practical guidance they can use at home.";
  if (text.includes("budget") || text.includes("deal") || text.includes("save money") || text.includes("cheap")) return "Cost-conscious viewers comparing practical options.";
  if (text.includes("career") || text.includes("job") || text.includes("interview")) return "People trying to make a better career decision.";
  if (text.includes("travel") || text.includes("trip")) return "Travel planners looking for useful, low-friction advice.";
  return "Viewers looking for clear help with this topic.";
}

function inferAudienceWhy(name: string, signals: string[]) {
  const text = `${name} ${signals.join(" ")}`.toLowerCase();
  if (text.includes("islamic") || text.includes("muslim") || text.includes("faith")) return "They want advice that fits their values and family life.";
  if (text.includes("baby") || text.includes("infant") || text.includes("toddler") || text.includes("newborn")) return "They are looking for practical help during the early years.";
  if (text.includes("deal") || text.includes("save") || text.includes("budget") || text.includes("cheap")) return "They want to avoid wasting money and make smarter choices.";
  if (text.includes("career") || text.includes("job") || text.includes("interview")) return "They want confidence before making a work or career move.";
  if (text.includes("travel") || text.includes("trip")) return "They want realistic plans, costs, and tradeoffs before they go.";
  return "They want examples, clear tradeoffs, and next steps.";
}

function getAudienceCareItems(signals: string[], name: string) {
  const fromSignals = signals
    .map((signal) => titleCase(signal))
    .filter((signal) => signal.length <= 46)
    .slice(0, 4);
  if (fromSignals.length >= 3) return fromSignals;

  const text = `${name} ${signals.join(" ")}`.toLowerCase();
  if (text.includes("islamic") || text.includes("muslim") || text.includes("faith")) {
    return ["Family values", "Character development", "Early childhood teaching", "Faith-based parenting"];
  }
  if (text.includes("baby") || text.includes("infant") || text.includes("toddler") || text.includes("newborn")) {
    return ["Sleep", "Feeding", "Development milestones", "Infant behaviour"];
  }
  if (text.includes("budget") || text.includes("deal") || text.includes("save")) {
    return ["Saving money", "Best options", "Avoiding mistakes", "Step-by-step plans"];
  }
  return [...fromSignals, "Practical examples", "Common mistakes", "Clear next steps"].slice(0, 4);
}

function inferAudienceCreatorOpportunity(name: string, caresAbout: string[]) {
  const primaryCare = caresAbout[0]?.toLowerCase() ?? "their main question";
  return `Create practical content for ${name.toLowerCase()} around ${primaryCare}.`;
}

function formatRiskScore(value?: number | null) {
  if (value === null || value === undefined) return "Not enough data yet";
  return `${Math.round(value * 100)}%`;
}

function formatStrategyLabel(value?: string | null) {
  if (!value) return "Format not available yet";
  return titleCase(value);
}

function getFormatImplication(topic: LeaderboardRow) {
  const shares = [
    { label: "short-form", value: topic.short_video_share },
    { label: "mid-form", value: topic.midform_video_share },
    { label: "long-form", value: topic.long_video_share },
  ].filter((item): item is { label: string; value: number } => typeof item.value === "number");

  if (shares.length === 0) return "Creator implication is not available until format share data is ready.";

  const leader = shares.sort((a, b) => b.value - a.value)[0];
  return `Creator implication: prioritize ${leader.label} packaging first, then use the other formats as supporting tests if production capacity allows.`;
}

function getBreakoutTone(row: DivergenceRow): Tone {
  const spread = row.relative_growth_spread ?? 0;
  const shareDelta = row.share_delta ?? 0;
  if (spread > 0 || shareDelta > 0) return "positive";
  if (spread < 0 || shareDelta < 0) return "watch";
  return "neutral";
}

function getBreakoutConfidence(row: DivergenceRow) {
  const score = Math.abs(row.divergence_score ?? 0);
  const shareDelta = Math.abs(row.share_delta ?? 0);
  if (score >= 0.35 || shareDelta >= 0.08) return "Strong";
  if (score >= 0.15 || shareDelta >= 0.03) return "Moderate";
  return "Limited";
}

function getRelativeGrowthCopy(row: DivergenceRow) {
  const spread = row.relative_growth_spread ?? 0;
  const shareDelta = row.share_delta ?? 0;
  if (spread > 0 || shareDelta > 0) return "Growing faster than the overall topic.";
  if (spread < 0 || shareDelta < 0) return "Changing faster than the overall topic, but momentum is cooling.";
  return "Growing in line with the overall topic.";
}

function getBreakoutWhyItMatters(row: DivergenceRow) {
  const spread = row.relative_growth_spread ?? 0;
  const shareDelta = row.share_delta ?? 0;
  if (spread > 0 || shareDelta > 0) return "Interest in this area is increasing faster than the rest of the topic.";
  if (spread < 0 || shareDelta < 0) return "This area is changing quickly, but current movement suggests softer interest.";
  return "Interest is moving close to the rest of the topic right now.";
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

function pctToDisplayPercent(value: number) {
  return Math.abs(value) > 1 ? value : value * 100;
}

function normalizeClusterId(value?: string | null) {
  return value?.trim().toUpperCase() ?? "";
}

function resolveTimeseriesGrowthPct(row: ClusterTimeseriesRow) {
  const topicGrowth = finiteNumber(row.topic_growth_pct);
  if (topicGrowth !== null) return pctToDisplayPercent(topicGrowth);

  const wowAbs = finiteNumber(row.wow_abs);
  if (wowAbs !== null) {
    const previous = finiteNumber(row.n_videos_prev);
    if (previous !== null && previous !== 0) return (wowAbs / previous) * 100;

    const current = finiteNumber(row.n_videos);
    if (current !== null && current !== 0) return (wowAbs / current) * 100;
  }

  return null;
}

function resolveTimeseriesVideoCount(row: ClusterTimeseriesRow) {
  return finiteNumber(row.n_videos) ?? finiteNumber(row.n_videos_current) ?? finiteNumber(row.tracked_video_count);
}

function formatWholePercent(value?: number | null) {
  if (value === null || value === undefined) return "Not enough data yet";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatLatestSnapshotChange(value: number | null) {
  if (value === null) return "Limited History";
  if (Math.abs(value) <= STABLE_SNAPSHOT_CHANGE_THRESHOLD) return "Stable";
  return `${value > 0 ? "+" : "−"}${Math.abs(value).toFixed(1)}%`;
}

function formatScore(value: number) {
  return `${Math.round(value * 100)}% score`;
}

function formatSnapshotDate(value?: string) {
  if (!value) return "Preview update";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatShortDate(value?: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function titleCase(value: string) {
  return value
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
