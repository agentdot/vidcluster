import bundledDivergenceRows from "../data/cluster_divergence_latest_v4_0.json";
import bundledMicroNicheRows from "../data/cluster_micro_niches_latest_v4_0.json";
import bundledTimeseriesRows from "../data/cluster_timeseries_v4_0.json";
import bundledLeaderboardRows from "../data/dashboard_latest_v4_0.json";
import bundledManifest from "../data/dashboard_manifest_v4_0.json";
import bundledObservabilityStatus from "../data/observability_status_v4_0.json";

const DASHBOARD_FILES = {
  dashboard: "dashboard_latest_v4_0.json",
  timeseries: "cluster_timeseries_v4_0.json",
  microNiches: "cluster_micro_niches_latest_v4_0.json",
  divergence: "cluster_divergence_latest_v4_0.json",
  observability: "observability_status_v4_0.json",
  manifest: "dashboard_manifest_v4_0.json",
} as const;

export type DashboardExportBundle = {
  dashboard: unknown[];
  timeseries: unknown[];
  microNiches: unknown[];
  divergence: unknown[];
  observability: unknown;
  manifest: DashboardManifest;
};

export type DashboardManifest = {
  snapshot_date?: string;
  experiment_id?: string;
  generated_at_utc?: string;
  row_counts?: Record<string, number>;
  upstream_validation?: Record<string, string>;
};

export type DashboardDataState = {
  data: DashboardExportBundle;
  source: "bundled" | "r2";
  isLoading: boolean;
  error: string | null;
  r2BaseUrl: string | null;
};

export const bundledDashboardData: DashboardExportBundle = {
  dashboard: bundledLeaderboardRows as unknown[],
  timeseries: bundledTimeseriesRows as unknown[],
  microNiches: bundledMicroNicheRows as unknown[],
  divergence: bundledDivergenceRows as unknown[],
  observability: bundledObservabilityStatus as unknown,
  manifest: bundledManifest as DashboardManifest,
};

export function getDashboardR2BaseUrl(): string | null {
  const configured = import.meta.env.VITE_R2_DASHBOARD_EXPORT_BASE_URL;
  if (!configured || typeof configured !== "string") return null;
  return configured.replace(/\/+$/, "");
}

export function getDashboardR2LatestUrl(fileName: string, baseUrl = getDashboardR2BaseUrl()) {
  if (!baseUrl) return null;
  return `${baseUrl}/latest/${fileName}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`.trim());
  }
  return (await response.json()) as T;
}

export async function fetchLatestDashboardExport(baseUrl = getDashboardR2BaseUrl()) {
  if (!baseUrl) {
    throw new Error("VITE_R2_DASHBOARD_EXPORT_BASE_URL is not configured");
  }

  const manifestUrl = getDashboardR2LatestUrl(DASHBOARD_FILES.manifest, baseUrl);
  if (!manifestUrl) {
    throw new Error("R2 dashboard manifest URL could not be resolved");
  }

  const manifest = await fetchJson<DashboardManifest>(manifestUrl);
  const [dashboard, timeseries, microNiches, divergence, observability] = await Promise.all([
    fetchJson<unknown[]>(`${baseUrl}/latest/${DASHBOARD_FILES.dashboard}`),
    fetchJson<unknown[]>(`${baseUrl}/latest/${DASHBOARD_FILES.timeseries}`),
    fetchJson<unknown[]>(`${baseUrl}/latest/${DASHBOARD_FILES.microNiches}`),
    fetchJson<unknown[]>(`${baseUrl}/latest/${DASHBOARD_FILES.divergence}`),
    fetchJson<unknown>(`${baseUrl}/latest/${DASHBOARD_FILES.observability}`),
  ]);

  return {
    dashboard,
    timeseries,
    microNiches,
    divergence,
    observability,
    manifest,
  } satisfies DashboardExportBundle;
}
