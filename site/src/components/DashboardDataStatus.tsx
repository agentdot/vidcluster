import type { DashboardDataState } from "../lib/dashboardData";

export default function DashboardDataStatus({ state }: { state: DashboardDataState }) {
  const snapshotDate = state.data?.manifest?.snapshot_date;
  const generatedAt = state.data?.manifest?.generated_at_utc;
  const sourceLabel = getSourceLabel(state);
  const className = getSourceClassName(state);

  return (
    <div className={`rounded-2xl border px-4 py-3 text-xs leading-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold uppercase tracking-[0.14em]">
          {state.isLoading ? "Loading canonical dashboard export" : sourceLabel}
        </span>
        <span className="text-white/48">
          Snapshot {snapshotDate ? formatSnapshotDate(snapshotDate) : "unknown"}
          {generatedAt ? ` - generated ${formatSnapshotDate(generatedAt.slice(0, 10))}` : ""}
        </span>
      </div>
      {state.error ? <p className="mt-1 text-white/56">{state.error}</p> : null}
      {state.source === "unavailable" ? (
        <p className="mt-1 text-white/56">Production fallback is disabled, so bundled dashboard data is not being used.</p>
      ) : null}
    </div>
  );
}

function getSourceLabel(state: DashboardDataState) {
  if (state.source === "canonical_remote") return "Canonical dashboard bundle";
  if (state.source === "bundled_fallback") return "Local bundled fallback";
  return "Dashboard data unavailable";
}

function getSourceClassName(state: DashboardDataState) {
  if (state.source === "canonical_remote" && !state.error) {
    return "border-emerald-300/18 bg-emerald-300/[0.055] text-emerald-50/72";
  }
  if (state.source === "unavailable") {
    return "border-rose-300/22 bg-rose-300/[0.06] text-rose-50/78";
  }
  return "border-amber-300/18 bg-amber-300/[0.055] text-amber-50/72";
}

function formatSnapshotDate(value?: string) {
  if (!value) return "unknown";
  return value.slice(0, 10);
}
