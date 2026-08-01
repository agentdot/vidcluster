export type TrendChartSourceRow = {
  snapshot_date?: string;
  tracked_video_count?: number | string | null;
  n_videos_current?: number | string | null;
  n_videos?: number | string | null;
  topic_growth_pct?: number | string | null;
  growth_since_freeze_pct?: number | string | null;
  video_delta_pct?: number | string | null;
};

export type TrendChartRow<T extends TrendChartSourceRow = TrendChartSourceRow> = T & {
  chart_growth_pct: number;
  growth_available: boolean;
  chart_video_count: number | null;
};

function finiteNumber(value: unknown) {
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

export function resolveTrendChartGrowthPct(row?: TrendChartSourceRow | null) {
  if (!row) return null;
  const canonical = finiteNumber(row.video_delta_pct);
  if (canonical !== null) return canonical * 100;
  const legacy = finiteNumber(row.growth_since_freeze_pct) ?? finiteNumber(row.topic_growth_pct);
  return legacy === null ? null : pctToDisplayPercent(legacy);
}

export function resolveTrendChartVideoCount(row: TrendChartSourceRow) {
  return finiteNumber(row.n_videos) ?? finiteNumber(row.n_videos_current) ?? finiteNumber(row.tracked_video_count);
}

export function buildTrendChartRows<T extends TrendChartSourceRow>(rows: T[]): Array<TrendChartRow<T>> {
  return rows
    .filter((row) => row.snapshot_date)
    .sort((a, b) => String(a.snapshot_date).localeCompare(String(b.snapshot_date)))
    .map((row) => {
      const growth = resolveTrendChartGrowthPct(row);
      const videoCount = resolveTrendChartVideoCount(row);
      return {
        ...row,
        chart_growth_pct: growth ?? 0,
        growth_available: growth !== null,
        chart_video_count: videoCount,
      };
    });
}
