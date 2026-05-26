import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import SiteHeader from "../components/SiteHeader";
import PageSeo from "../components/seo/PageSeo";
import audienceIntentRows from "../data/cluster_audience_intent_v4_0.json";
import divergenceRows from "../data/cluster_divergence_latest_v4_0.json";
import microNicheRows from "../data/cluster_micro_niches_latest_v4_0.json";
import clusterTimeseriesRows from "../data/cluster_timeseries_v4_0.json";
import leaderboardRows from "../data/dashboard_latest_v4_0.json";
import fallbackClusterTimeseriesRows from "../data/cluster_timeseries_v3_3.json";
import fallbackLeaderboardRows from "../data/leaderboard_v3_3.json";

type Tone = "positive" | "watch" | "risk" | "neutral";
type IntelligenceTab = "Overview" | "Momentum" | "Micro-Niches" | "Divergence" | "Failure Risk" | "Audience Intent";

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
  assigned_video_count?: number | null;
  micro_emergence_score?: number | null;
  stability_label?: string | null;
  stability_score?: number | null;
  snapshot_date?: string;
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

const leaderboard = ((leaderboardRows as LeaderboardRow[]).length > 0 ? leaderboardRows : fallbackLeaderboardRows) as LeaderboardRow[];
const clusterTimeseries = ((clusterTimeseriesRows as ClusterTimeseriesRow[]).length > 0
  ? clusterTimeseriesRows
  : fallbackClusterTimeseriesRows) as ClusterTimeseriesRow[];
const microNiches = microNicheRows as MicroNicheRow[];
const divergences = divergenceRows as DivergenceRow[];
const audienceIntents = audienceIntentRows as AudienceIntentRow[];

const DECISION_LABEL_MAP: Record<string, string> = {
  STRONG_TREND: "Sustained Growth",
  EARLY_TREND: "Early Opportunity",
  EMERGING: "Watch closely",
  WEAK_OR_RISK: "High Risk",
};

const STABLE_SNAPSHOT_CHANGE_THRESHOLD = 0.05;

const tabs: IntelligenceTab[] = ["Overview", "Momentum", "Micro-Niches", "Divergence", "Failure Risk", "Audience Intent"];

export default function ClusterIntelligence() {
  const { clusterId } = useParams();
  const normalizedRouteClusterId = normalizeClusterId(clusterId);
  const cluster = leaderboard.find((row) => normalizeClusterId(row.cluster_id) === normalizedRouteClusterId);

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <PageSeo
        title={cluster ? `${getTopicTitle(cluster)} | VidCluster` : "Cluster Intelligence | VidCluster"}
        description="Dedicated VidCluster topic intelligence workspace."
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

          {!cluster ? <ClusterNotFound /> : <ClusterReport cluster={cluster} />}
        </div>
      </main>
    </div>
  );
}

function ClusterReport({ cluster }: { cluster: LeaderboardRow }) {
  const [activeTab, setActiveTab] = useState<IntelligenceTab>("Overview");
  const confidence = getConfidenceValue(cluster);
  const timeseries = getClusterTimeseries(cluster.cluster_id);
  const clusterMicroNiches = getClusterMicroNiches(cluster.cluster_id);
  const clusterDivergences = getClusterDivergences(cluster.cluster_id);
  const clusterAudienceIntents = getClusterAudienceIntents(cluster.cluster_id);
  const snapshotComparison = getSnapshotComparison(cluster, timeseries);
  const trendInterpretation = getTrendInterpretation(cluster, timeseries);
  const latestSnapshotChange = getLatestSnapshotChange(timeseries);
  const displayTitle = getTopicTitle(cluster);
  const displaySubtitle = getTopicSubtitle(cluster, displayTitle);

  return (
    <>
      <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.024)_58%,rgba(16,185,129,0.035))] p-6 shadow-[0_28px_110px_rgba(0,0,0,0.38)] md:p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_270px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge>Rank #{cluster.rank}</Badge>
              <Badge>{mapDecisionLabel(cluster.decision_label)}</Badge>
              <Badge>Updated {formatSnapshotDate(cluster.latest_snapshot_date)}</Badge>
            </div>
            <h1
              className="mt-7 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-white md:text-6xl"
              title={getRawTopicTitle(cluster)}
            >
              {displayTitle}
            </h1>
            {displaySubtitle ? (
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200/64 md:text-lg">{displaySubtitle}</p>
            ) : null}
            <div className="mt-7 max-w-4xl rounded-2xl border border-emerald-300/16 bg-emerald-300/[0.05] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/48">Intelligence read</p>
              <p className="mt-2 text-sm leading-6 text-emerald-50/80 md:text-base">{getIntelligenceSummary(cluster)}</p>
            </div>
          </div>

          <div className="flex min-w-[230px] flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_35%,rgba(251,191,36,0.18),rgba(15,23,42,0.22)_42%,rgba(0,0,0,0.34))] p-4">
              <div className="flex aspect-video items-center justify-center rounded-xl border border-white/10 bg-black/24">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white/[0.055] text-amber-100/72">
                  <span className="ml-0.5 text-sm">▶</span>
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.13em] text-white/58">Representative video coming soon</p>
            </div>
            <div className="rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.06] px-5 py-5 text-right shadow-[0_18px_60px_rgba(16,185,129,0.07)]">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/56">Current growth</div>
              <div className="mt-3 text-5xl font-semibold leading-none tracking-[-0.055em] text-emerald-100">
                {formatWholePercent(cluster.growth_since_freeze_pct)}
              </div>
              <div className="mt-3 text-xs leading-5 text-emerald-50/46">
                {cluster.latest_n_videos ? `${cluster.latest_n_videos.toLocaleString()} latest videos` : "Latest volume unavailable"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Latest snapshot change" value={latestSnapshotChange.value} helper="vs previous snapshot" tone={latestSnapshotChange.tone} />
        <MetricCard label="Confidence" value={mapConfidence(cluster)} helper={formatScore(confidence)} tone={getConfidenceTone(cluster)} />
        <MetricCard label="Stability" value={mapWillLast(cluster)} tone="neutral" />
        <MetricCard label="Opportunity" value={mapOpportunityState(cluster)} tone={getOpportunityTone(cluster)} />
        <MetricCard label="Failure risk" value={formatFailureRiskLevel(cluster.failure_risk_level)} tone={getFailureRiskTone(cluster)} />
        <MetricCard label="Risk reason" value={formatFailureRiskReason(cluster.failure_risk_reason_code)} tone={getFailureRiskTone(cluster)} />
      </section>

      <section className="mt-4 rounded-2xl border border-white/10 bg-[#05090e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/34">Trend intelligence</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Temporal Signal Analysis</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{formatWholePercent(cluster.growth_since_freeze_pct)}</Badge>
            <Badge>{mapConfidence(cluster)}</Badge>
          </div>
        </div>

        <TrendInterpretationPanel interpretation={trendInterpretation} />

        <div className="mt-5 min-h-[330px] rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] p-5">
          <TrendCurveChart rows={timeseries} />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.032] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/34">Snapshot comparison</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Current vs previous snapshot</h2>
          </div>
          <DirectionBadge direction={snapshotComparison.direction} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Current value" value={snapshotComparison.currentValue} helper={snapshotComparison.currentLabel} tone={getGrowthTone(cluster)} />
          <MetricCard label="Previous snapshot" value={snapshotComparison.previousValue} helper={snapshotComparison.previousLabel} tone="neutral" />
          <MetricCard label="Absolute delta" value={snapshotComparison.absoluteDelta} helper={snapshotComparison.deltaLabel} tone={snapshotComparison.tone} />
          <MetricCard label="Percentage delta" value={snapshotComparison.percentDelta} helper={snapshotComparison.deltaLabel} tone={snapshotComparison.tone} />
        </div>
        {snapshotComparison.isReal ? null : (
          <p className="mt-4 rounded-xl border border-amber-300/14 bg-amber-300/[0.045] px-4 py-3 text-xs leading-5 text-amber-50/62">
            Previous snapshot comparison needs at least two time-series rows for this cluster.
          </p>
        )}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid gap-4">
          <NarrativeCard title="Why this trend?" body={getWhyTrendNarrative(cluster)} />
          <NarrativeCard title="Recommended action" body={cluster.opportunity_summary || getRecommendedAction(cluster)} />
          <NarrativeCard title="Failure risk explanation" body={cluster.risk_summary || cluster.failure_risk_reason_label || "Risk evaluation needs more history for this snapshot."} />
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.032] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/34">Format fit</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{formatStrategyLabel(cluster.format_strategy_label)}</h2>
          <p className="mt-3 text-base leading-7 text-white/62">
            {cluster.format_strategy_summary || "Format share data is not available for this cluster yet."}
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

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:border-white/18 hover:text-white/78 " +
                (activeTab === tab
                  ? "border-emerald-300/28 bg-emerald-300/[0.095] text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.08)]"
                  : "border-white/10 bg-white/[0.035] text-white/58")
              }
            >
              {tab}
            </button>
          ))}
        </div>
        <TabContentPanel
          activeTab={activeTab}
          cluster={cluster}
          timeseries={timeseries}
          microNiches={clusterMicroNiches}
          divergences={clusterDivergences}
          audienceIntents={clusterAudienceIntents}
          snapshotComparison={snapshotComparison}
        />
      </section>
    </>
  );
}

function ClusterNotFound() {
  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-200/78">Cluster not found</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">No matching cluster found</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
        This intelligence workspace is ready, but the requested cluster is not present in the current leaderboard snapshot.
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
  const label = direction === "up" ? "Up" : direction === "down" ? "Down" : direction === "flat" ? "Flat" : "Previous unavailable";
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
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/34">Trend interpretation</p>
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
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/34">Current signal</p>
            <p className="mt-3 text-sm leading-6 text-white/68">{getIntelligenceSummary(cluster)}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <TabStat label="Growth" value={formatWholePercent(cluster.growth_since_freeze_pct)} tone={getGrowthTone(cluster)} />
            <TabStat label="Confidence" value={mapConfidence(cluster)} tone={getConfidenceTone(cluster)} />
            <TabStat label="Latest videos" value={latest?.n_videos?.toLocaleString() ?? formatNumber(cluster.latest_n_videos)} tone="neutral" />
            <TabStat label="Risk" value={formatFailureRiskLevel(cluster.failure_risk_level)} tone={getFailureRiskTone(cluster)} />
          </div>
        </div>
      ) : null}

      {activeTab === "Momentum" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <TabStat label="Latest delta" value={snapshotComparison.absoluteDelta} helper={snapshotComparison.deltaLabel} tone={snapshotComparison.tone} />
          <TabStat label="Percent delta" value={snapshotComparison.percentDelta} helper="vs previous snapshot" tone={snapshotComparison.tone} />
          <TabStat label="Direction" value={titleCase(snapshotComparison.direction)} tone={snapshotComparison.tone} />
          <TabStat label="Snapshots" value={timeseries.length.toString()} tone="neutral" />
          <TabStat
            label="First to latest"
            value={first && latest ? `${formatNumber(first.n_videos)} → ${formatNumber(latest.n_videos)}` : "Unavailable"}
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
            <TabStat label="Risk reason" value={formatFailureRiskReason(cluster.failure_risk_reason_code)} tone={getFailureRiskTone(cluster)} />
            <TabStat label="Risk score" value={formatRiskScore(cluster.failure_risk_score)} tone={getFailureRiskTone(cluster)} />
          </div>
          <NarrativeCard
            title="Risk interpretation"
            body={cluster.risk_summary || cluster.failure_risk_reason_label || "Risk evaluation is still pending while this cluster builds more history."}
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

function MicroNichesPanel({ rows }: { rows: MicroNicheRow[] }) {
  if (rows.length === 0) {
    return <EmptyTabPanel title="No micro-niche rows are available for this cluster yet." />;
  }

  const [leader, ...supportingRows] = rows;

  return (
    <div className="space-y-5">
      <p className="text-base leading-7 text-white/68">These are the sub-niches currently driving or forming inside this topic.</p>
      <div className="rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.045] p-5 shadow-[0_18px_60px_rgba(16,185,129,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/52">Leading emerging micro-niche</p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">{leader.subcluster_label || leader.subcluster_id || "Unnamed sub-niche"}</h3>
            <p className="mt-2 text-sm text-white/44">{leader.subcluster_id}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Emergence" value={formatDecimal(leader.micro_emergence_score)} strong />
            <MiniStat label="Videos" value={formatNumber(leader.assigned_video_count)} strong />
            <MiniStat label="Stability" value={formatSelectedValue(leader.stability_label)} strong />
          </div>
        </div>
        <p className="mt-5 rounded-xl border border-white/10 bg-black/18 px-4 py-3 text-sm leading-6 text-white/62">
          Why this matters: {leader.subcluster_label || "this sub-niche"} has {formatNumber(leader.assigned_video_count)} assigned videos,
          an emergence score of {formatDecimal(leader.micro_emergence_score)}, and {formatSelectedValue(leader.stability_label).toLowerCase()} stability.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {supportingRows.slice(0, 8).map((row) => (
          <div key={row.subcluster_id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-lg font-semibold text-white/84">{row.subcluster_label || row.subcluster_id || "Unnamed sub-niche"}</p>
            <p className="mt-1 text-xs text-white/34">{row.subcluster_id}</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <MiniStat label="Emergence" value={formatDecimal(row.micro_emergence_score)} />
              <MiniStat label="Videos" value={formatNumber(row.assigned_video_count)} />
              <MiniStat label="Stability" value={formatSelectedValue(row.stability_label)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DivergencePanel({ rows, microNiches }: { rows: DivergenceRow[]; microNiches: MicroNicheRow[] }) {
  if (rows.length === 0) {
    return <EmptyTabPanel title="No divergence rows are available for this cluster yet." />;
  }

  const labelsBySubclusterId = new Map(microNiches.map((row) => [row.subcluster_id, row.subcluster_label]));
  const enrichedRows = rows.map((row) => ({ ...row, subcluster_label: row.subcluster_label || labelsBySubclusterId.get(row.subcluster_id) }));
  const usefulRows = enrichedRows.filter((row) => (row.divergence_score ?? 0) !== 0 || (row.share_delta ?? 0) !== 0 || (row.relative_growth_spread ?? 0) !== 0);
  const stableRows = enrichedRows.filter((row) => !usefulRows.includes(row));
  const outperformingRows = usefulRows.filter((row) => (row.relative_growth_spread ?? 0) > 0 || (row.share_delta ?? 0) > 0);
  const weakeningRows = usefulRows.filter((row) => (row.relative_growth_spread ?? 0) < 0 || (row.share_delta ?? 0) < 0);
  const neutralUsefulRows = usefulRows.filter((row) => !outperformingRows.includes(row) && !weakeningRows.includes(row));

  return (
    <div className="space-y-5">
      <p className="text-base leading-7 text-white/68">
        Divergence shows which internal segments are outperforming or weakening versus the parent topic.
      </p>
      <DivergenceGroup title="Outperforming" rows={outperformingRows} tone="positive" />
      <DivergenceGroup title="Weakening" rows={weakeningRows} tone="risk" />
      <DivergenceGroup title="Stable / no signal" rows={[...neutralUsefulRows, ...stableRows].slice(0, 6)} tone="neutral" compact />
    </div>
  );
}

function AudienceIntentPanel({ rows }: { rows: AudienceIntentRow[] }) {
  if (rows.length === 0) {
    return <EmptyTabPanel title="No audience intent rows are available for this cluster yet." />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.slice(0, 9).map((row, index) => {
        const exampleQueries = row.example_queries ?? [];
        return (
        <div key={`${row.intent_label}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-lg font-semibold text-white/86">{row.intent_label || "Unlabeled intent"}</p>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.075] px-2.5 py-1 text-xs font-semibold text-emerald-100/78">
              {formatDecimal(row.intent_score)}
            </span>
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.13em] text-white/38">{formatSelectedValue(row.source_type)}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {exampleQueries.slice(0, 6).map((query) => (
              <span key={query} className="rounded-full border border-white/10 bg-white/[0.052] px-2.5 py-1 text-sm text-white/64">
                {query}
              </span>
            ))}
          </div>
          <p className="mt-5 rounded-xl border border-white/10 bg-black/18 px-3 py-2 text-sm leading-6 text-white/58">
            {formatContentAngles(row.recommended_content_angles, row.intent_label, exampleQueries)}
          </p>
        </div>
      )})}
    </div>
  );
}

function DivergenceGroup({ title, rows, tone, compact = false }: { title: string; rows: DivergenceRow[]; tone: Tone; compact?: boolean }) {
  if (rows.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getChipClass(tone)}`}>{title}</span>
        <span className="text-xs text-white/36">{rows.length} segment{rows.length === 1 ? "" : "s"}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.slice(0, compact ? 6 : 9).map((row, index) => (
          <div key={`${row.subcluster_id}-${row.snapshot_date}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-lg font-semibold text-white/84">{row.subcluster_label || "Unnamed segment"}</p>
            <p className="mt-1 text-xs text-white/34">{row.subcluster_id}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.13em] text-white/40">{formatSelectedValue(row.divergence_label)}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MiniStat label="Score" value={formatDecimal(row.divergence_score)} />
              <MiniStat label="Share delta" value={formatPP(row.share_delta)} />
              <MiniStat label="Spread" value={formatPercentRatio(row.relative_growth_spread)} />
              <MiniStat label="Snapshot" value={formatShortDate(row.snapshot_date)} />
            </div>
            <p className="mt-4 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm leading-6 text-white/54">
              Micro {formatPercentRatio(row.micro_wow_pct)} vs parent {formatPercentRatio(row.parent_wow_pct)}
            </p>
            <p className="mt-2 text-xs leading-5 text-white/38">{getDivergenceMeaning(row)}</p>
          </div>
        ))}
      </div>
    </section>
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
  const chartRows = rows
    .filter((row) => row.snapshot_date && finiteNumber(row.n_videos) !== null)
    .map((row) => {
      const growth = resolveTimeseriesGrowthPct(row);
      return { ...row, topic_growth_pct: growth ?? 0, growth_available: growth !== null };
    });
  const previous = chartRows.length >= 2 ? chartRows[chartRows.length - 2] : undefined;
  const current = chartRows[chartRows.length - 1];

  if (!current) {
    return (
      <div className="relative min-h-[270px] overflow-hidden rounded-xl border border-dashed border-white/12 bg-[#03060a]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="mx-5 max-w-xl rounded-2xl border border-white/10 bg-black/52 px-5 py-4 text-center shadow-[0_18px_60px_rgba(0,0,0,0.42)]">
            <p className="text-sm font-semibold text-white/78">Time-series data not available for this cluster</p>
            <p className="mt-2 text-xs leading-5 text-white/44">
              Expected cluster_id, snapshot_date, and n_videos.
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
          {chartRows.length} {chartRows.length === 1 ? "snapshot" : "snapshots"} ·{" "}
          {current.n_videos?.toLocaleString() ?? "Unknown"} videos now
        </div>
      </div>

      <div className="h-[330px]">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/32">
          {chartRows.some((row) => row.growth_available) ? "Topic growth %" : "Topic growth % needs 2 snapshots"}
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartRows} margin={{ top: 28, right: 34, bottom: 8, left: 8 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="snapshot_date"
              tick={{ fill: "rgba(226,232,240,0.55)", fontSize: 12 }}
              tickFormatter={formatShortDate}
              tickLine={false}
              axisLine={{ stroke: "rgba(148,163,184,0.18)" }}
            />
            <YAxis
              tick={{ fill: "rgba(226,232,240,0.55)", fontSize: 12 }}
              tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
              tickLine={false}
              axisLine={false}
              width={58}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(3,6,10,0.94)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                color: "white",
              }}
              formatter={(value, name, item) => [
                item.payload.growth_available
                  ? `${Number(value).toFixed(1)}% growth · ${item.payload.n_videos?.toLocaleString() ?? "Unknown"} videos`
                  : `Growth needs 2 snapshots · ${item.payload.n_videos?.toLocaleString() ?? "Unknown"} videos`,
                name,
              ]}
              labelFormatter={(label) => formatSnapshotDate(String(label))}
            />
            <Line
              type="monotone"
              dataKey="topic_growth_pct"
              name="Growth"
              stroke="rgb(110 231 183)"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#03060a", stroke: "rgba(110,231,183,0.78)" }}
              activeDot={{ r: 7, strokeWidth: 2, fill: "rgb(110 231 183)", stroke: "rgba(248,250,252,0.95)" }}
            />
            {previous ? (
              <ReferenceDot
                x={previous.snapshot_date}
                y={previous.topic_growth_pct ?? 0}
                r={9}
                fill="#03060a"
                stroke="rgba(203,213,225,0.95)"
                strokeWidth={3}
                label={{ value: "Previous", position: "top", fill: "rgba(226,232,240,0.82)", fontSize: 12 }}
              />
            ) : null}
            <ReferenceDot
              x={current.snapshot_date}
              y={current.topic_growth_pct ?? 0}
              r={10}
              fill="rgb(251 191 36)"
              stroke="rgba(248,250,252,0.96)"
              strokeWidth={3}
              label={{ value: "Current", position: "top", fill: "rgba(254,243,199,0.9)", fontSize: 12 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
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
        <span className={hasValue ? "text-sm font-semibold text-white/78" : "text-sm text-white/32"}>{hasValue ? `${percent.toFixed(1)}%` : "Unavailable"}</span>
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
  return topic.display_topic_title || topic.cluster_label || topic.title || topic.cluster_id || "Untitled cluster";
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
    return `Observed across ${microSignalMatch[1]} related micro-signal${count === 1 ? "" : "s"}`;
  }

  return subtitle;
}

function truncateTitle(value: string) {
  if (value.length <= 72) return value;
  return `${value.slice(0, 69).trim()}...`;
}

function mapDecisionLabel(label?: string) {
  if (!label) return "Signal Unknown";
  return DECISION_LABEL_MAP[label] ?? titleCase(label);
}

function getConfidenceValue(topic: LeaderboardRow) {
  const confidence = topic.trend_confidence ?? topic.trend_strength_score;
  if (confidence === null || confidence === undefined) return 0;
  return Math.max(0, Math.min(1, confidence > 1 ? confidence / 100 : confidence));
}

function mapConfidence(topic: LeaderboardRow) {
  const normalized = getConfidenceValue(topic);
  if (normalized >= 0.72) return "High Confidence";
  if (normalized >= 0.48) return "Moderate Confidence";
  return "Low Confidence";
}

function mapWillLast(topic: LeaderboardRow) {
  if (topic.decision_label === "STRONG_TREND") return "Likely to sustain";
  if (topic.decision_label === "EARLY_TREND") return "Promising, validate";
  if (topic.decision_label === "EMERGING") return "Too early to call";
  if (Boolean(topic.t60_is_winner)) return "Held up before";
  return "Not stable yet";
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
  return "VidCluster is preparing a dedicated intelligence readout for this cluster.";
}

function getWhyTrendNarrative(topic: LeaderboardRow) {
  const trendSummary = topic.trend_summary?.trim();
  const scoreAnchor = topic.score_anchor?.trim();
  const confidence = mapConfidence(topic).toLowerCase();
  const risk = formatObservedFailureRisk(topic.failure_risk_level);

  if (scoreAnchor && scoreAnchor !== trendSummary) return scoreAnchor;

  return `The signal is supported by ${confidence}, ${risk}, and ${formatWholePercent(topic.growth_since_freeze_pct)} topic growth in the current export.`;
}

function getRecommendedAction(topic: LeaderboardRow) {
  if (topic.decision_label === "STRONG_TREND") return "Scale this topic into a repeatable series while the signal remains strong.";
  if (topic.decision_label === "WEAK_OR_RISK") return "Hold new production until a cleaner signal appears.";
  return "Run a small validation test and monitor whether the signal strengthens in the next snapshot.";
}

function getMovementInterpretation(direction: "growing" | "declining" | "flat", videoDeltaPct: number | null, rows: ClusterTimeseriesRow[]) {
  const priorGrowthValues = rows
    .slice(0, -1)
    .map(resolveTimeseriesGrowthPct)
    .filter((value): value is number => value !== null);
  const stableBeforeLatest = priorGrowthValues.length > 0 && priorGrowthValues.every((value) => Math.abs(value) <= 0.05);
  const absMove = Math.abs(videoDeltaPct ?? 0);

  if (direction === "flat") {
    return "Activity has remained broadly stable across recent observations, with limited expansion detected so far.";
  }

  if (direction === "declining") {
    if (videoDeltaPct === null || absMove < 2.5) {
      return stableBeforeLatest
        ? "Recent observations show mild contraction after a stable period."
        : "Recent observations show mild contraction, but the move remains limited.";
    }
    return "Recent observations show clearer contraction in activity, so the signal should be watched for further softening.";
  }

  if (videoDeltaPct === null || absMove < 2.5) {
    return stableBeforeLatest
      ? "Recent observations show mild expansion from a stable baseline."
      : "Recent observations show mild expansion, but the move remains limited.";
  }

  return "Recent observations show clearer expansion in activity, indicating the signal is strengthening.";
}

function getConfidenceSentenceLead(topic: LeaderboardRow) {
  const confidenceLabel = mapConfidence(topic);
  if (confidenceLabel === "High Confidence") return "Confidence remains high";
  if (confidenceLabel === "Moderate Confidence") return "Confidence is moderate";
  return "Confidence remains limited";
}

function getEvidenceInterpretation(topic: LeaderboardRow, rows: ClusterTimeseriesRow[]) {
  const confidenceLead = getConfidenceSentenceLead(topic);
  const decisionLabel = String(topic.decision_label ?? "").toUpperCase();
  const historyIsLimited = rows.length < 5;
  const riskTone = getFailureRiskTone(topic);

  if (riskTone === "risk") {
    return `${confidenceLead}, but risk signals keep this under review.`;
  }

  if (decisionLabel.includes("EMERGING") || decisionLabel.includes("EARLY")) {
    return historyIsLimited
      ? `${confidenceLead}, but the signal is still forming and needs more history before stronger conclusions can be drawn.`
      : `${confidenceLead}, and the signal is still forming across the available history.`;
  }

  if (historyIsLimited) {
    return `${confidenceLead}, but historical depth is still limited, so the signal remains under observation.`;
  }

  return `${confidenceLead}; additional snapshots will clarify whether this behavior persists.`;
}

function getTrendInterpretation(topic: LeaderboardRow, rows: ClusterTimeseriesRow[]) {
  const current = rows[rows.length - 1];
  const previous = rows.length >= 2 ? rows[rows.length - 2] : undefined;
  const confidenceLabel = mapConfidence(topic);

  if (!current || !previous || typeof current.n_videos !== "number" || typeof previous.n_videos !== "number") {
    return {
      body: "Trend interpretation requires at least two snapshots.",
      chips: [{ label: "Needs history", tone: "neutral" as Tone }],
    };
  }

  const videoDelta = current.n_videos - previous.n_videos;
  const videoDeltaPct = previous.n_videos === 0 ? null : (videoDelta / previous.n_videos) * 100;
  const direction = videoDelta > 0 ? "growing" : videoDelta < 0 ? "declining" : "flat";
  const movement = getMovementInterpretation(direction, videoDeltaPct, rows);
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

function getClusterTimeseries(clusterId?: string) {
  const normalizedClusterId = normalizeClusterId(clusterId);
  if (!normalizedClusterId) return [];

  return clusterTimeseries
    .filter((row) => normalizeClusterId(row.cluster_id) === normalizedClusterId && row.snapshot_date)
    .sort((a, b) => String(a.snapshot_date).localeCompare(String(b.snapshot_date)));
}

function formatSignedInteger(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toLocaleString()}`;
}

function getClusterMicroNiches(clusterId?: string) {
  const normalizedClusterId = normalizeClusterId(clusterId);
  if (!normalizedClusterId) return [];

  return microNiches
    .filter((row) => normalizeClusterId(row.cluster_id) === normalizedClusterId)
    .sort((a, b) => (b.micro_emergence_score ?? -1) - (a.micro_emergence_score ?? -1));
}

function getClusterDivergences(clusterId?: string) {
  const normalizedClusterId = normalizeClusterId(clusterId);
  if (!normalizedClusterId) return [];

  return divergences
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

  return audienceIntents
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
      percentDelta: percentDelta === null ? "Unavailable" : formatWholePercent(percentDelta),
      deltaLabel: "vs previous snapshot",
      direction,
      tone,
      isReal: true,
    };
  }

  const currentVideos = finiteNumber(current?.n_videos) ?? finiteNumber(topic.latest_n_videos);
  const currentGrowth = typeof topic.growth_since_freeze_pct === "number" ? topic.growth_since_freeze_pct : null;

  return {
    currentValue: currentVideos === null ? "Unavailable" : currentVideos.toLocaleString(),
    currentLabel: current?.snapshot_date
      ? formatSnapshotDate(current.snapshot_date)
      : currentGrowth === null
        ? "Latest snapshot videos"
        : `${formatWholePercent(currentGrowth)} growth`,
    previousValue: "Unavailable",
    previousLabel: "Need 2 snapshots",
    absoluteDelta: "Unavailable",
    percentDelta: "Unavailable",
    deltaLabel: "Previous unavailable",
    direction: "unknown" as const,
    tone: "neutral" as Tone,
    isReal: false,
  };
}

function formatFailureRiskValue(value?: string | null) {
  if (!value) return "Risk pending";
  return titleCase(value.split("_").join(" "));
}

function formatFailureRiskLevel(value?: string | null) {
  return formatFailureRiskValue(value);
}

function formatFailureRiskReason(value?: string | null) {
  if (!value) return "Needs more history";
  return formatFailureRiskValue(value);
}

function formatFailureRiskChip(value?: string | null) {
  if (!value) return "Risk pending";
  return `${formatFailureRiskLevel(value)} Risk`;
}

function formatObservedFailureRisk(value?: string | null) {
  if (!value) return "risk evaluation is still pending";
  return `${formatFailureRiskLevel(value).toLowerCase()} observed failure risk`;
}

function formatSelectedValue(value?: string | null) {
  if (!value) return "Unavailable";
  return titleCase(value);
}

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return "Unavailable";
  return value.toLocaleString();
}

function formatDecimal(value?: number | null) {
  if (value === null || value === undefined) return "Unavailable";
  return value.toFixed(2);
}

function formatPP(value?: number | null) {
  if (value === null || value === undefined) return "Unavailable";
  const points = value * 100;
  return `${points >= 0 ? "+" : ""}${points.toFixed(1)}pp`;
}

function formatPercentRatio(value?: number | null) {
  if (value === null || value === undefined) return "Unavailable";
  const percent = Math.abs(value) <= 10 ? value * 100 : value;
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`;
}

function formatContentAngles(value?: string[] | string | null, intentLabel?: string, exampleQueries: string[] = []) {
  if (Array.isArray(value) && value.length > 0) return value.join(", ");
  if (typeof value === "string" && value.trim()) return value;

  const terms = [intentLabel, ...exampleQueries].filter((term): term is string => Boolean(term?.trim())).slice(0, 4);
  if (terms.length > 0) return `Create content around: ${terms.join(", ")}.`;
  return "Recommended content angles not exported yet.";
}

function formatRiskScore(value?: number | null) {
  if (value === null || value === undefined) return "Unavailable";
  return `${Math.round(value * 100)}%`;
}

function formatStrategyLabel(value?: string | null) {
  if (!value) return "Format data pending";
  return titleCase(value);
}

function getFormatImplication(topic: LeaderboardRow) {
  const shares = [
    { label: "short-form", value: topic.short_video_share },
    { label: "mid-form", value: topic.midform_video_share },
    { label: "long-form", value: topic.long_video_share },
  ].filter((item): item is { label: string; value: number } => typeof item.value === "number");

  if (shares.length === 0) return "Creator implication is unavailable until format share data is exported.";

  const leader = shares.sort((a, b) => b.value - a.value)[0];
  return `Creator implication: prioritize ${leader.label} packaging first, then use the other formats as supporting tests if production capacity allows.`;
}

function getDivergenceMeaning(row: DivergenceRow) {
  const spread = row.relative_growth_spread ?? 0;
  const shareDelta = row.share_delta ?? 0;

  if (spread > 0 || shareDelta > 0) return "What this means: this segment is gaining ground inside the parent topic.";
  if (spread < 0 || shareDelta < 0) return "What this means: this segment is weakening relative to the parent topic.";
  return "What this means: no meaningful internal divergence is visible in this snapshot.";
}

function finiteNumber(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
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

function formatWholePercent(value?: number | null) {
  if (value === null || value === undefined) return "Unavailable";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatLatestSnapshotChange(value: number | null) {
  if (value === null) return "Needs more history";
  if (Math.abs(value) <= STABLE_SNAPSHOT_CHANGE_THRESHOLD) return "Stable";
  return `${value > 0 ? "+" : "−"}${Math.abs(value).toFixed(1)}%`;
}

function formatScore(value: number) {
  return `${Math.round(value * 100)}% score`;
}

function formatSnapshotDate(value?: string) {
  if (!value) return "Preview snapshot";
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
