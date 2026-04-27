import { useMemo, useState } from "react";
import { ArrowUpRight, Check, ShieldCheck } from "lucide-react";

import PageShell from "../components/layout/PageShell";
import Section from "../components/layout/Section";
import PageSeo from "../components/seo/PageSeo";
import leaderboardRows from "../data/leaderboard_v3_3.json";
import { cn } from "../lib/utils";

type LeaderboardRow = {
  rank: number;
  display_topic_title: string;
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

const leaderboard = leaderboardRows as LeaderboardRow[];

function formatDecision(label: string) {
  return label
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatScore(score: number) {
  return `${Math.round(score * 100)}`;
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${Math.round(value)}%`;
}

function getDecisionClass(label: string) {
  if (label === "STRONG_TREND") {
    return "border-emerald-300/22 bg-emerald-300/[0.08] text-emerald-100/86";
  }

  if (label === "EARLY_TREND") {
    return "border-amber-300/22 bg-amber-300/[0.08] text-amber-100/86";
  }

  if (label === "EMERGING") {
    return "border-sky-300/20 bg-sky-300/[0.07] text-sky-100/82";
  }

  return "border-white/10 bg-white/[0.035] text-white/56";
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

export default function Dashboard() {
  const [selectedRank, setSelectedRank] = useState(leaderboard[0]?.rank ?? 1);

  const selectedTopic =
    leaderboard.find((topic) => topic.rank === selectedRank) ?? leaderboard[0];

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

          <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.025] px-4 py-3 text-sm text-white/52">
            Snapshot: V3.3 leaderboard
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

        <div className="grid gap-4 lg:grid-cols-5">
          {topOpportunities.map((topic) => {
            const isSelected = selectedTopic.rank === topic.rank;

            return (
              <button
                key={topic.rank}
                type="button"
                onClick={() => setSelectedRank(topic.rank)}
                className={cn(
                  "min-h-[220px] rounded-[1.55rem] border p-5 text-left transition",
                  isSelected
                    ? "border-emerald-300/26 bg-emerald-300/[0.065] shadow-[0_22px_80px_rgba(80,200,140,0.10)]"
                    : "border-white/8 bg-white/[0.025] hover:border-white/14 hover:bg-white/[0.04]",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/36">
                    Rank {topic.rank}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/40" />
                </div>
                <h3 className="mt-5 text-lg font-medium leading-6 tracking-[-0.03em] text-white/92">
                  {topic.display_topic_title}
                </h3>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/34">
                      Score
                    </div>
                    <div className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-white">
                      {formatScore(topic.trend_strength_score)}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.14em]",
                      getDecisionClass(topic.decision_label),
                    )}
                  >
                    {formatDecision(topic.decision_label)}
                  </span>
                </div>
                <div className="mt-4 text-sm text-white/52">
                  {formatPercent(topic.growth_since_freeze_pct)} growth
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
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
              Compact cluster ranking
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-white/8 text-[11px] uppercase tracking-[0.18em] text-white/34">
                <tr>
                  <th className="px-5 py-4 font-medium">Rank</th>
                  <th className="px-5 py-4 font-medium">Topic</th>
                  <th className="px-5 py-4 font-medium">Score</th>
                  <th className="px-5 py-4 font-medium">Decision</th>
                  <th className="px-5 py-4 font-medium">Growth</th>
                  <th className="px-5 py-4 font-medium">Latest videos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/7">
                {leaderboard.map((topic) => {
                  const isSelected = selectedTopic.rank === topic.rank;

                  return (
                    <tr
                      key={topic.rank}
                      onClick={() => setSelectedRank(topic.rank)}
                      className={cn(
                        "cursor-pointer transition",
                        isSelected ? "bg-emerald-300/[0.055]" : "hover:bg-white/[0.025]",
                      )}
                    >
                      <td className="px-5 py-4 text-sm text-white/50">{topic.rank}</td>
                      <td className="px-5 py-4 text-sm font-medium text-white/86">
                        {topic.display_topic_title}
                      </td>
                      <td className="px-5 py-4 text-sm text-white/74">
                        {formatScore(topic.trend_strength_score)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.14em]",
                            getDecisionClass(topic.decision_label),
                          )}
                        >
                          {formatDecision(topic.decision_label)}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "px-5 py-4 text-sm",
                          topic.growth_since_freeze_pct >= 0
                            ? "text-emerald-200/78"
                            : "text-red-100/62",
                        )}
                      >
                        {formatPercent(topic.growth_since_freeze_pct)}
                      </td>
                      <td className="px-5 py-4 text-sm text-white/62">
                        {topic.latest_n_videos}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.14em]",
                getDecisionClass(selectedTopic.decision_label),
              )}
            >
              {formatDecision(selectedTopic.decision_label)}
            </span>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3">
            {[
              ["Score", formatScore(selectedTopic.trend_strength_score)],
              ["Growth", formatPercent(selectedTopic.growth_since_freeze_pct)],
              [
                "Confidence",
                selectedTopic.trend_confidence === undefined
                  ? "Unavailable"
                  : `${Math.round(selectedTopic.trend_confidence * 100)}%`,
              ],
              ["Latest videos", selectedTopic.latest_n_videos.toString()],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.1rem] border border-white/8 bg-black/18 p-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/34">
                  {label}
                </div>
                <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                  {value}
                </div>
              </div>
            ))}
          </div>

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
            <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.025] p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/38">
                <ShieldCheck className="h-4 w-4 text-emerald-200/70" />
                Evidence
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/58">
                <li className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-200/70" />
                  {selectedTopic.opportunity_summary}
                </li>
                <li className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-200/70" />
                  T+60 winner: {selectedTopic.t60_is_winner ? "Yes" : "No"}
                  {selectedTopic.t60_actual_rank
                    ? `, actual rank ${selectedTopic.t60_actual_rank}`
                    : ""}
                </li>
                <li className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-200/70" />
                  {selectedTopic.risk_summary}
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </Section>
    </PageShell>
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
