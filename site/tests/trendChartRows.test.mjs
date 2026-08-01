import assert from "node:assert/strict";
import test from "node:test";

import { buildTrendChartRows } from "../src/lib/trendChartRows.ts";

function chartPoint(row) {
  return {
    row_id: row.row_id,
    snapshot_date: row.snapshot_date,
    chart_growth_pct: Number(row.chart_growth_pct.toFixed(10)),
    chart_video_count: row.chart_video_count,
  };
}

test("trend chart rows sort chronologically and preserve tooltip fields from each matching source row", () => {
  const shuffledRows = [
    {
      row_id: "current",
      cluster_id: "SC021",
      snapshot_date: "2026-07-28",
      n_videos: 384,
      n_videos_current: 9999,
      tracked_video_count: 8888,
      video_delta_pct: 0.0378378378,
      topic_growth_pct: -999,
    },
    {
      row_id: "jul-03",
      cluster_id: "SC021",
      snapshot_date: "2026-07-03",
      n_videos: 346,
      n_videos_current: 1234,
      tracked_video_count: 5678,
      video_delta_pct: 0.023668639053,
      topic_growth_pct: -123,
    },
    {
      row_id: "jul-08",
      cluster_id: "SC021",
      snapshot_date: "2026-07-08",
      n_videos: 354,
      n_videos_current: 2222,
      tracked_video_count: 3333,
      video_delta_pct: 0.0143266476,
      topic_growth_pct: -777,
    },
    {
      row_id: "jul-06",
      cluster_id: "SC021",
      snapshot_date: "2026-07-06",
      n_videos: 349,
      n_videos_current: 4444,
      tracked_video_count: 5555,
      video_delta_pct: 0.008670520231,
      topic_growth_pct: -456,
    },
  ];

  const chartRows = buildTrendChartRows(shuffledRows);

  assert.deepEqual(
    chartRows.map((row) => row.snapshot_date),
    ["2026-07-03", "2026-07-06", "2026-07-08", "2026-07-28"],
  );

  assert.deepEqual(
    chartRows.map(chartPoint),
    [
      {
        row_id: "jul-03",
        snapshot_date: "2026-07-03",
        chart_growth_pct: 2.3668639053,
        chart_video_count: 346,
      },
      {
        row_id: "jul-06",
        snapshot_date: "2026-07-06",
        chart_growth_pct: 0.8670520231,
        chart_video_count: 349,
      },
      {
        row_id: "jul-08",
        snapshot_date: "2026-07-08",
        chart_growth_pct: 1.43266476,
        chart_video_count: 354,
      },
      {
        row_id: "current",
        snapshot_date: "2026-07-28",
        chart_growth_pct: 3.78378378,
        chart_video_count: 384,
      },
    ],
  );
});
