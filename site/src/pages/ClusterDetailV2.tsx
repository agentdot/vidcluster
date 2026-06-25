import { Link, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import DashboardDataStatus from "../components/DashboardDataStatus";
import SiteHeader from "../components/SiteHeader";
import PageSeo from "../components/seo/PageSeo";
import audienceIntentRows from "../data/cluster_audience_intent_v4_0.json";
import { useDashboardExportData } from "../hooks/useDashboardExportData";

type Tone = "good" | "watch" | "risk" | "quiet";

type LeaderboardRow = {
  cluster_id?: string;
  rank?: number | null;
  display_topic_title?: string;
  display_title?: string;
  title?: string;
  topic_subtitle?: string | null;
  cluster_label?: string | null;
  trend_strength_score?: number | null;
  trend_confidence?: number | null;
  decision_label?: string | null;
  trend_summary?: string | null;
  opportunity_summary?: string | null;
  risk_summary?: string | null;
  growth_since_freeze_pct?: number | null;
  latest_n_videos?: number | null;
  previous_n_videos?: number | null;
  video_delta_abs?: number | null;
  video_delta_pct?: number | null;
  video_delta_direction?: "up" | "flat" | "down" | "unknown" | string | null;
  comparison_window?: string | null;
  comparison_previous_date?: string | null;
  comparison_latest_date?: string | null;
  latest_snapshot_date?: string | null;
  failure_risk_level?: string | null;
  failure_risk_reason_label?: string | null;
};

type ClusterTimeseriesRow = {
  cluster_id?: string;
  snapshot_date?: string | null;
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
};

type OpportunityRow = {
  cluster_id?: string;
  opportunity_id?: string;
  opportunity_name?: string;
  opportunity_status?: string | null;
  interest_level?: string | null;
  videos_tracked?: number | null;
  evidence_titles?: string[] | string | null;
  evidence_status?: string | null;
  reason?: string | null;
};

type DivergenceRow = {
  cluster_id?: string;
  subcluster_id?: string;
  subcluster_label?: string | null;
  divergence_label?: string | null;
  divergence_score?: number | null;
  share_delta?: number | null;
  relative_growth_spread?: number | null;
  micro_wow_pct?: number | null;
  parent_wow_pct?: number | null;
  snapshot_date?: string | null;
};

type AudienceIntentRow = {
  cluster_id?: string;
  intent_label?: string | null;
  intent_score?: number | null;
  example_queries?: string[] | string | null;
  recommended_content_angles?: string[] | string | null;
};

const audienceIntents = asArray<AudienceIntentRow>(audienceIntentRows);

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export default function ClusterDetailV2() {
  const { clusterId } = useParams();
  const dashboardData = useDashboardExportData();
  const normalizedClusterId = normalizeClusterId(clusterId);
  const activeDashboardData = dashboardData.data;

  const leaderboard = asArray<LeaderboardRow>(activeDashboardData?.dashboard);
  const timeseriesRows = asArray<ClusterTimeseriesRow>(activeDashboardData?.timeseries);
  const opportunityRows = asArray<OpportunityRow>(activeDashboardData?.opportunities);
  const divergenceRows = asArray<DivergenceRow>(activeDashboardData?.divergence);

  const cluster = leaderboard.find((row) => normalizeClusterId(row.cluster_id) === normalizedClusterId);
  const timeseries = getClusterTimeseries(timeseriesRows, normalizedClusterId);
  const opportunities = getReadyOpportunities(opportunityRows, normalizedClusterId);
  const divergences = getClusterDivergences(divergenceRows, normalizedClusterId);
  const audience = getClusterAudienceIntents(normalizedClusterId);
  const contentIdeas = getContentIdeas(opportunities);
  const movement = getMovementSummary(cluster, timeseries);

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <PageSeo
        title={cluster ? `${getTopicTitle(cluster)} | VidCluster` : "Topic Details | VidCluster"}
        description="A creator-focused read on topic movement, opportunities, audience, and risk."
        url={clusterId ? `/dashboard/cluster-v2/${clusterId}` : "/dashboard"}
      />
      <SiteHeader />

      <main className="bg-[radial-gradient(circle_at_18%_0%,rgba(22,163,74,0.12),transparent_32%),radial-gradient(circle_at_92%_8%,rgba(56,189,248,0.08),transparent_30%),linear-gradient(180deg,#0b1118_0%,#05070a_52%,#05070a_100%)] px-4 py-6 lg:px-6">
        <div className="mx-auto max-w-[1360px]">
          <Link
            to="/dashboard"
            className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/62 transition hover:border-white/20 hover:text-white"
          >
            Back to all topics
          </Link>

          <div className="mt-4">
            <DashboardDataStatus state={dashboardData} />
          </div>

          {!cluster ? (
            <EmptyShell title="Topic not found" body="This topic is not available in the latest dashboard data." />
          ) : (
            <>
              <HeaderSection
                cluster={cluster}
                snapshotCount={timeseries.length}
                latestMovement={movement.latestChange}
              />

              <BottomNav />

              <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="grid gap-4">
                  <CreatorSection id="content-opportunities" title="Content Opportunities" kicker="Where creators can look first">
                    <OpportunitiesPanel rows={opportunities} />
                  </CreatorSection>

                  <CreatorSection id="audience" title="Audience Intent" kicker="What viewers seem to want">
                    <AudienceIntentPanel rows={audience} />
                  </CreatorSection>

                  <CreatorSection id="breaking-out" title="Breaking Out" kicker="Areas moving inside this topic">
                    <BreakingOutPanel rows={divergences} />
                  </CreatorSection>

                  <CreatorSection id="content-ideas" title="Content Ideas" kicker="Pulled only from real example titles">
                    <ContentIdeasPanel rows={contentIdeas} />
                  </CreatorSection>

                  <CreatorSection id="recent-movement" title="Recent Movement" kicker="How the topic has changed">
                    <RecentMovementPanel rows={timeseries} movement={movement} />
                  </CreatorSection>

                  <CreatorSection id="watchouts" title="Risks & Watchouts" kicker="Before you make the video">
                    <RiskPanel cluster={cluster} />
                  </CreatorSection>
                </div>

                <aside className="grid content-start gap-4 xl:sticky xl:top-5">
                  <AtAGlancePanel cluster={cluster} movement={movement} snapshotCount={timeseries.length} />
                  <CreatorReadPanel cluster={cluster} />
                </aside>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function HeaderSection({
  cluster,
  snapshotCount,
  latestMovement,
}: {
  cluster: LeaderboardRow;
  snapshotCount: number;
  latestMovement: string;
}) {
  const title = getTopicTitle(cluster);
  const category = getTopicCategory(cluster, title);

  return (
    <section id="overview" className="mt-4 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.32)] md:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="quiet">{cluster.cluster_id ?? "Cluster"}</Pill>
            {category ? <Pill tone="quiet">{category}</Pill> : null}
            <Pill tone={getEvidenceTone(cluster)}>{getEvidenceStrength(cluster)}</Pill>
            <Pill tone="watch">{getStage(cluster)}</Pill>
          </div>
          <h1 className="mt-5 max-w-5xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-white md:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/64">
            {cluster.trend_summary || cluster.opportunity_summary || "A creator-focused read on what is moving, what viewers may want, and where to look next."}
          </p>
        </div>

        <div className="grid min-w-[260px] gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <HeaderStat label="Updates" value={snapshotCount > 0 ? snapshotCount.toString() : "Not enough data yet"} />
          <HeaderStat label="Last updated" value={formatDate(cluster.latest_snapshot_date)} />
          <HeaderStat label="Latest change" value={latestMovement} />
        </div>
      </div>
    </section>
  );
}

function BottomNav() {
  const links = [
    { label: "Overview", href: "#overview" },
    { label: "Content Opportunities", href: "#content-opportunities" },
    { label: "Audience", href: "#audience" },
    { label: "Breaking Out", href: "#breaking-out" },
    { label: "Risks & Watchouts", href: "#watchouts" },
  ];

  return (
    <nav className="mt-4 rounded-2xl border border-white/10 bg-[#071018]/90 p-1.5">
      <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-5">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-xl px-3 py-2 text-center text-xs font-semibold text-white/56 transition hover:bg-white/[0.06] hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function CreatorSection({ id, kicker, title, children }: { id: string; kicker: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-[24px] border border-white/10 bg-[#071018]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_20px_70px_rgba(0,0,0,0.2)] md:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/42">{kicker}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function OpportunitiesPanel({ rows }: { rows?: OpportunityRow[] | null }) {
  const safeRows = asArray<OpportunityRow>(rows);

  if (safeRows.length === 0) {
    return (
      <EmptyState
        title="No approved opportunities yet."
        body="We found possible areas, but they need clearer labels before showing them here."
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {safeRows.slice(0, 8).map((row, index) => {
        const titles = parseTextList(row.evidence_titles).slice(0, 4);
        return (
          <article key={row.opportunity_id || `${row.cluster_id ?? "opportunity"}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/36">Opportunity</p>
                <h3 className="mt-2 text-xl font-semibold leading-6 text-white/90">{row.opportunity_name || "Untitled opportunity"}</h3>
              </div>
              <Pill tone={getInterestTone(row.interest_level)}>{formatValue(row.interest_level)}</Pill>
            </div>
            {row.reason ? <p className="mt-3 text-sm leading-6 text-white/58">{row.reason}</p> : null}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MiniStat label="Videos tracked" value={formatNumber(row.videos_tracked)} />
              <MiniStat label="Evidence" value={formatEvidenceStatus(row.evidence_status)} />
            </div>
            <EvidenceTitles titles={titles} />
          </article>
        );
      })}
    </div>
  );
}

function BreakingOutPanel({ rows }: { rows?: DivergenceRow[] | null }) {
  const usefulRows = asArray<DivergenceRow>(rows)
    .filter((row) => hasMovement(row))
    .slice(0, 6);

  if (usefulRows.length === 0) {
    return (
      <EmptyState
        title="No clear breakout yet."
        body="We'll highlight areas that begin growing faster than the rest of the topic."
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {usefulRows.map((row, index) => (
        <article key={`${row.subcluster_id ?? "breakout"}-${row.snapshot_date ?? index}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-lg font-semibold text-white/88">{getBreakoutName(row)}</p>
          <p className="mt-3 text-sm leading-6 text-white/58">{getBreakoutCopy(row)}</p>
          <div className="mt-4 grid gap-2">
            <MiniStat label="Growth" value={formatPercent(row.micro_wow_pct ?? row.relative_growth_spread)} />
            <MiniStat label="Share move" value={formatPoints(row.share_delta)} />
            <MiniStat label="Signal" value={formatDecimal(row.divergence_score)} />
          </div>
        </article>
      ))}
    </div>
  );
}

function AudienceIntentPanel({ rows }: { rows?: AudienceIntentRow[] | null }) {
  const safeRows = asArray<AudienceIntentRow>(rows);

  if (safeRows.length === 0) {
    return <EmptyState title="Audience details are not available yet." body="This topic needs more audience data before we can explain what viewers seem to want." />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {safeRows.slice(0, 6).map((row, index) => {
        const examples = parseTextList(row.example_queries).slice(0, 4);
        return (
          <article key={`${row.intent_label ?? "audience"}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-lg font-semibold text-white/88">{titleCase(row.intent_label || "Viewer group")}</p>
            <p className="mt-2 text-sm leading-6 text-white/58">These viewers are likely looking for clear examples and useful next steps.</p>
            {examples.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {examples.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-white/64">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300/80" />
                    <span>{cleanTitle(item)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function ContentIdeasPanel({ rows }: { rows?: Array<{ title: string; source: string }> | null }) {
  const safeRows = asArray<{ title: string; source: string }>(rows);

  if (safeRows.length === 0) {
    return <EmptyState title="No content ideas available yet." body="Approved opportunities need example titles before ideas can be listed here." />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {safeRows.slice(0, 8).map((row) => (
        <article key={`${row.source}-${row.title}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/36">Real example title</p>
          <p className="mt-2 text-lg font-semibold leading-6 text-white/88">{row.title}</p>
          <p className="mt-3 text-sm leading-6 text-white/48">Source: {row.source}</p>
        </article>
      ))}
    </div>
  );
}

function RecentMovementPanel({ rows, movement }: { rows?: ClusterTimeseriesRow[] | null; movement: ReturnType<typeof getMovementSummary> }) {
  const chartRows = asArray<ClusterTimeseriesRow>(rows)
    .filter((row) => row.snapshot_date)
    .map((row) => ({
      snapshot_date: row.snapshot_date,
      videos: resolveVideoCount(row) ?? 0,
      change: resolveGrowthPct(row) ?? 0,
    }));

  if (chartRows.length < 2) {
    return (
      <div className="grid gap-3 md:grid-cols-3">
        <MiniStat label="Latest videos" value={movement.latestVideos} />
        <MiniStat label="Latest change" value={movement.latestChange} />
        <MiniStat label="Updates" value={chartRows.length > 0 ? chartRows.length.toString() : "Not enough data yet"} />
      </div>
    );
  }

  return (
    <div className="h-[280px] rounded-2xl border border-white/10 bg-[#03070c] p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartRows} margin={{ top: 16, right: 18, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="snapshot_date" stroke="rgba(255,255,255,0.38)" tickLine={false} axisLine={false} tickFormatter={formatShortDate} />
          <YAxis stroke="rgba(255,255,255,0.38)" tickLine={false} axisLine={false} width={42} />
          <Tooltip content={<MovementTooltip />} />
          <Line type="monotone" dataKey="videos" stroke="#6ee7b7" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MovementTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const videos = payload[0]?.value;
  return (
    <div className="rounded-xl border border-white/12 bg-[#03070c] px-3 py-2 text-xs text-white shadow-xl">
      <p className="font-semibold text-white/86">{formatDate(label)}</p>
      <p className="mt-1 text-white/62">Videos: {typeof videos === "number" ? videos.toLocaleString() : "Not available yet"}</p>
    </div>
  );
}

function AtAGlancePanel({
  cluster,
  movement,
  snapshotCount,
}: {
  cluster: LeaderboardRow;
  movement: ReturnType<typeof getMovementSummary>;
  snapshotCount: number;
}) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[#071018]/90 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/42">At A Glance</p>
      <div className="mt-4 grid gap-3">
        <MiniStat label="Videos in topic" value={movement.latestVideos} />
        <MiniStat label="Latest change" value={movement.latestChange} />
        <MiniStat label="Evidence strength" value={getEvidenceStrength(cluster)} />
        <MiniStat label="Stage" value={getStage(cluster)} />
        <MiniStat label="Updates tracked" value={snapshotCount > 0 ? snapshotCount.toString() : "Not enough data yet"} />
      </div>
    </section>
  );
}

function CreatorReadPanel({ cluster }: { cluster: LeaderboardRow }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/42">Creator read</p>
      <p className="mt-3 text-sm leading-6 text-white/64">
        {cluster.opportunity_summary || "Use the opportunities, audience notes, and watchouts before deciding what to test."}
      </p>
    </section>
  );
}

function RiskPanel({ cluster }: { cluster: LeaderboardRow }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <InfoCard title="Watchout" body={cluster.risk_summary || cluster.failure_risk_reason_label || "No major watchout is available yet."} />
      <InfoCard title="Suggested next step" body={getSuggestedNextStep(cluster)} />
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/36">{title}</p>
      <p className="mt-3 text-sm leading-6 text-white/62">{body}</p>
    </article>
  );
}

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#03070c]/70 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white/86">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/34">{label}</p>
      <p className="mt-1.5 text-sm font-semibold leading-5 text-white/76">{value}</p>
    </div>
  );
}

function EvidenceTitles({ titles }: { titles?: string[] | null }) {
  const safeTitles = asArray<string>(titles).map(cleanTitle).filter(Boolean);
  if (safeTitles.length === 0) return null;

  return (
    <div className="mt-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/34">Recent example titles</p>
      <ul className="mt-2 space-y-2">
        {safeTitles.map((title) => (
          <li key={title} className="flex gap-2 text-sm leading-6 text-white/64">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300/80" />
            <span>{title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.025] p-5">
      <p className="text-lg font-semibold text-white/82">{title}</p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/52">{body}</p>
    </div>
  );
}

function EmptyShell({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-8">
      <p className="text-2xl font-semibold text-white">{title}</p>
      <p className="mt-3 text-sm leading-6 text-white/58">{body}</p>
    </section>
  );
}

function Pill({ children, tone }: { children: string; tone: Tone }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getPillClass(tone)}`}>
      {children}
    </span>
  );
}

function getPillClass(tone: Tone) {
  if (tone === "good") return "border-emerald-300/24 bg-emerald-300/[0.08] text-emerald-100";
  if (tone === "watch") return "border-amber-300/24 bg-amber-300/[0.08] text-amber-100";
  if (tone === "risk") return "border-rose-300/26 bg-rose-300/[0.08] text-rose-100";
  return "border-slate-300/16 bg-slate-300/[0.055] text-slate-200/68";
}

function getClusterTimeseries(rows: ClusterTimeseriesRow[], clusterId: string) {
  if (!clusterId) return [];
  return asArray<ClusterTimeseriesRow>(rows)
    .filter((row) => normalizeClusterId(row.cluster_id) === clusterId && row.snapshot_date)
    .sort((a, b) => String(a.snapshot_date ?? "").localeCompare(String(b.snapshot_date ?? "")));
}

function getReadyOpportunities(rows: OpportunityRow[], clusterId: string) {
  if (!clusterId) return [];
  return asArray<OpportunityRow>(rows)
    .filter((row) => normalizeClusterId(row.cluster_id) === clusterId)
    .filter((row) => String(row.opportunity_status ?? "").toUpperCase() === "READY")
    .sort((a, b) => {
      const interestDelta = getInterestRank(b.interest_level) - getInterestRank(a.interest_level);
      if (interestDelta !== 0) return interestDelta;
      return (finiteNumber(b.videos_tracked) ?? -1) - (finiteNumber(a.videos_tracked) ?? -1);
    });
}

function getClusterDivergences(rows: DivergenceRow[], clusterId: string) {
  if (!clusterId) return [];
  return asArray<DivergenceRow>(rows)
    .filter((row) => normalizeClusterId(row.cluster_id) === clusterId)
    .sort((a, b) => Math.abs(finiteNumber(b.divergence_score) ?? 0) - Math.abs(finiteNumber(a.divergence_score) ?? 0));
}

function getClusterAudienceIntents(clusterId: string) {
  if (!clusterId) return [];
  return asArray<AudienceIntentRow>(audienceIntents)
    .filter((row) => normalizeClusterId(row.cluster_id) === clusterId)
    .sort((a, b) => (finiteNumber(b.intent_score) ?? -1) - (finiteNumber(a.intent_score) ?? -1));
}

function getContentIdeas(rows: OpportunityRow[]) {
  const ideas: Array<{ title: string; source: string }> = [];
  for (const row of asArray<OpportunityRow>(rows)) {
    for (const title of parseTextList(row.evidence_titles)) {
      const cleaned = cleanTitle(title);
      if (cleaned) ideas.push({ title: cleaned, source: row.opportunity_name || "Approved opportunity" });
    }
  }
  return dedupeIdeas(ideas);
}

function dedupeIdeas(rows: Array<{ title: string; source: string }>) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = row.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function hasMovement(row: DivergenceRow) {
  return Boolean(
    finiteNumber(row.divergence_score) ||
    finiteNumber(row.share_delta) ||
    finiteNumber(row.relative_growth_spread) ||
    finiteNumber(row.micro_wow_pct),
  );
}

function getMovementSummary(cluster: LeaderboardRow | undefined, rows: ClusterTimeseriesRow[]) {
  const latest = rows[rows.length - 1];
  const latestVideos = resolveVideoCount(latest) ?? finiteNumber(cluster?.latest_n_videos);
  const delta = getCanonicalDeltaAbs(latest) ?? getCanonicalDeltaAbs(cluster);
  const growth = resolveGrowthPct(latest) ?? getCanonicalDeltaDisplayPct(cluster);

  if (delta !== null) {
    return {
      latestVideos: latestVideos === null ? "Not enough data yet" : latestVideos.toLocaleString(),
      latestChange: `${delta >= 0 ? "+" : ""}${delta.toLocaleString()}`,
    };
  }

  return {
    latestVideos: latestVideos === null ? "Not enough data yet" : latestVideos.toLocaleString(),
    latestChange: growth === null ? "Limited history" : formatPercent(growth),
  };
}

function getTopicTitle(topic: LeaderboardRow) {
  return truncateTitle(topic.display_topic_title || topic.display_title || topic.cluster_label || topic.title || topic.cluster_id || "Untitled topic");
}

function getTopicCategory(topic: LeaderboardRow, title: string) {
  const candidate = topic.topic_subtitle || topic.cluster_label || "";
  if (!candidate.trim() || candidate.trim().toLowerCase() === title.toLowerCase()) return "";
  return truncateTitle(candidate.trim(), 54);
}

function getEvidenceStrength(topic: LeaderboardRow) {
  const confidence = getConfidence(topic);
  if (confidence >= 0.72) return "Strong evidence";
  if (confidence >= 0.48) return "Moderate evidence";
  return "Limited evidence";
}

function getEvidenceTone(topic: LeaderboardRow): Tone {
  const confidence = getConfidence(topic);
  if (confidence >= 0.72) return "good";
  if (confidence >= 0.48) return "watch";
  return "risk";
}

function getConfidence(topic: LeaderboardRow) {
  const value = finiteNumber(topic.trend_confidence) ?? finiteNumber(topic.trend_strength_score) ?? 0;
  return Math.max(0, Math.min(1, value > 1 ? value / 100 : value));
}

function getStage(topic: LeaderboardRow) {
  const label = String(topic.decision_label ?? "").toUpperCase();
  if (label === "ESTABLISHED") return "Established";
  if (label === "WATCHLIST") return "Developing";
  if (label === "EMERGING") return "Watch closely";
  if (label === "WEAK_OR_RISK") return "High risk";
  if (label === "INSUFFICIENT_DATA") return "Not enough data";
  return "Developing";
}

function getSuggestedNextStep(topic: LeaderboardRow) {
  const label = String(topic.decision_label ?? "").toUpperCase();
  if (label === "ESTABLISHED") return "Turn the strongest opportunity into a repeatable video series.";
  if (label === "WEAK_OR_RISK") return "Wait for clearer movement before putting serious production time here.";
  if (label === "INSUFFICIENT_DATA") return "Wait for more signal before treating this as a production opportunity.";
  return "Run a small test video and watch the next update.";
}

function getInterestRank(value?: string | null) {
  const text = value?.trim().toLowerCase() ?? "";
  if (text === "high") return 3;
  if (text === "moderate") return 2;
  if (text === "early") return 1;
  return 0;
}

function getInterestTone(value?: string | null): Tone {
  const text = value?.trim().toLowerCase() ?? "";
  if (text === "high") return "good";
  if (text === "moderate") return "watch";
  return "quiet";
}

function getBreakoutName(row: DivergenceRow) {
  return cleanTitle(row.divergence_label || row.subcluster_label || row.subcluster_id || "Area needs clearer label");
}

function getBreakoutCopy(row: DivergenceRow) {
  const spread = finiteNumber(row.relative_growth_spread) ?? 0;
  const share = finiteNumber(row.share_delta) ?? 0;
  if (spread > 0 || share > 0) return "This area is moving faster than the rest of the topic.";
  if (spread < 0 || share < 0) return "This area is changing, but momentum may be softening.";
  return "This area is moving close to the overall topic.";
}

function parseTextList(value?: string[] | string | null) {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value.replace(/'/g, '"'));
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  } catch {
    // Use a conservative split for simple exported strings.
  }

  return value
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(/,\s*/)
    .map((item) => item.replace(/^["']|["']$/g, "").trim())
    .filter(Boolean);
}

function cleanTitle(value: string) {
  const cleaned = value
    .replace(/#[\p{L}\p{N}_-]+/gu, " ")
    .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, " ")
    .replace(/\uFFFC/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  return cleaned.length > 96 ? `${cleaned.slice(0, 93).trim()}...` : cleaned;
}

function resolveVideoCount(row?: ClusterTimeseriesRow) {
  if (!row) return null;
  return finiteNumber(row.n_videos) ?? finiteNumber(row.n_videos_current) ?? finiteNumber(row.tracked_video_count);
}

function resolveGrowthPct(row?: ClusterTimeseriesRow) {
  return getCanonicalDeltaDisplayPct(row);
}

function getCanonicalDeltaDisplayPct(row?: Pick<LeaderboardRow, "video_delta_pct" | "growth_since_freeze_pct"> | ClusterTimeseriesRow | null) {
  if (!row) return null;
  const canonical = finiteNumber(row.video_delta_pct);
  if (canonical !== null) return canonical * 100;
  const legacy = "growth_since_freeze_pct" in row ? finiteNumber(row.growth_since_freeze_pct) : finiteNumber(row.topic_growth_pct);
  if (legacy === null) return null;
  return Math.abs(legacy) > 1 ? legacy : legacy * 100;
}

function getCanonicalDeltaAbs(row?: Pick<LeaderboardRow, "video_delta_abs"> | ClusterTimeseriesRow | null) {
  if (!row) return null;
  return finiteNumber(row.video_delta_abs);
}

function finiteNumber(value?: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeClusterId(value?: string | null) {
  return value?.trim().toUpperCase() ?? "";
}

function formatValue(value?: string | null) {
  if (!value) return "Not available yet";
  return titleCase(value);
}

function formatEvidenceStatus(value?: string | null) {
  if (!value) return "Not available yet";
  return titleCase(value);
}

function formatNumber(value?: number | null) {
  const number = finiteNumber(value);
  return number === null ? "Not available yet" : number.toLocaleString();
}

function formatDecimal(value?: number | null) {
  const number = finiteNumber(value);
  return number === null ? "Not available yet" : number.toFixed(2);
}

function formatPoints(value?: number | null) {
  const number = finiteNumber(value);
  if (number === null) return "Not available yet";
  const points = Math.abs(number) <= 1 ? number * 100 : number;
  return `${points >= 0 ? "+" : ""}${points.toFixed(1)} pts`;
}

function formatPercent(value?: number | null) {
  const number = finiteNumber(value);
  if (number === null) return "Not available yet";
  const percent = Math.abs(number) <= 1 ? number * 100 : number;
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`;
}

function formatDate(value?: string | null) {
  if (!value) return "Not available yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatShortDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function truncateTitle(value: string, max = 78) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 3).trim()}...`;
}

function titleCase(value: string) {
  return value
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
