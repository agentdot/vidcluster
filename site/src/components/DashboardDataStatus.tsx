import type { DashboardDataState } from "../lib/dashboardData";

export default function DashboardDataStatus({ state }: { state: DashboardDataState }) {
  const snapshotDate = state.data.manifest?.snapshot_date;
  const generatedAt = state.data.manifest?.generated_at_utc;
  const sourceLabel = state.source === "r2" ? "Live R2 export" : "Bundled fallback";
  const className =
    state.source === "r2" && !state.error
      ? "border-emerald-300/18 bg-emerald-300/[0.055] text-emerald-50/72"
      : "border-amber-300/18 bg-amber-300/[0.055] text-amber-50/72";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-xs leading-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold uppercase tracking-[0.14em]">
          {state.isLoading ? "Loading live dashboard export" : sourceLabel}
        </span>
        <span className="text-white/48">
          Snapshot {snapshotDate ? formatSnapshotDate(snapshotDate) : "unknown"}
          {generatedAt ? ` - generated ${formatSnapshotDate(generatedAt.slice(0, 10))}` : ""}
        </span>
      </div>
      {state.error ? <p className="mt-1 text-white/56">{state.error}</p> : null}
    </div>
  );
}

function formatSnapshotDate(value?: string) {
  if (!value) return "unknown";
  return value.slice(0, 10);
}
