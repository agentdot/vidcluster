import bundledDivergenceRows from "../data/cluster_divergence_latest_v4_0.json";
import bundledMicroNicheRows from "../data/cluster_micro_niches_latest_v4_0.json";
import bundledOpportunityRows from "../data/cluster_opportunities_v1.json";
import bundledTimeseriesRows from "../data/cluster_timeseries_v4_0.json";
import bundledLeaderboardRows from "../data/dashboard_latest_v4_0.json";
import bundledManifest from "../data/dashboard_manifest_v4_0.json";
import bundledObservabilityStatus from "../data/observability_status_v4_0.json";

const DASHBOARD_FILES = {
  dashboard: "dashboard_latest_v4_0.json",
  timeseries: "cluster_timeseries_v4_0.json",
  microNiches: "cluster_micro_niches_latest_v4_0.json",
  opportunities: "cluster_opportunities_v1.json",
  divergence: "cluster_divergence_latest_v4_0.json",
  observability: "observability_status_v4_0.json",
  manifest: "dashboard_manifest_v4_0.json",
} as const;

const DASHBOARD_LATEST_POINTER_FILE = "latest_pointer.json";
const REQUIRED_BUNDLE_FILES = [
  DASHBOARD_FILES.dashboard,
  DASHBOARD_FILES.timeseries,
  DASHBOARD_FILES.microNiches,
  DASHBOARD_FILES.divergence,
  DASHBOARD_FILES.observability,
  DASHBOARD_FILES.manifest,
] as const;

export type DashboardExportBundle = {
  dashboard: unknown[];
  timeseries: unknown[];
  microNiches: unknown[];
  opportunities: unknown[];
  divergence: unknown[];
  observability: unknown;
  manifest: DashboardManifest;
  sourceMetadata: DashboardSourceMetadata;
};

export type DashboardManifest = {
  snapshot_date?: string;
  experiment_id?: string;
  generated_at_utc?: string;
  row_counts?: Record<string, number>;
  upstream_validation?: Record<string, string>;
};

export type DashboardDataSource = "canonical_remote" | "bundled_fallback" | "unavailable";
export type DashboardRuntimeMode = "production" | "local_dev";
export type DashboardSourceMetadata = {
  dashboardSource: DashboardDataSource;
  timeseriesSource: DashboardDataSource;
  timeseriesSourceMatchesDashboard: boolean;
  bundleSnapshotDate?: string | null;
  bundleRunId?: string | null;
  bundlePath?: string | null;
  bundleManifestPath?: string | null;
  timeseriesFile?: string | null;
};

export type DashboardDataState = {
  data: DashboardExportBundle | null;
  source: DashboardDataSource;
  sourceMetadata: DashboardSourceMetadata;
  runtimeMode: DashboardRuntimeMode;
  isFallbackAllowed: boolean;
  isLoading: boolean;
  error: string | null;
  r2BaseUrl: string | null;
};

type DashboardLatestPointer = {
  schema_version?: string;
  experiment_id?: string;
  snapshot_date?: string;
  run_id?: string;
  bundle_path?: string;
  bundle_manifest_path?: string;
  bundle_manifest_sha256?: string;
  validation_status?: string;
};

type DashboardBundleManifest = {
  schema_version?: string;
  experiment_id?: string;
  snapshot_date?: string;
  run_id?: string;
  validation_status?: string;
  files?: Record<string, { size_bytes?: number; sha256?: string }>;
};

function safeArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function safeManifest(value: unknown): DashboardManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as DashboardManifest;
}

export const bundledDashboardData: DashboardExportBundle = {
  dashboard: safeArray(bundledLeaderboardRows),
  timeseries: safeArray(bundledTimeseriesRows),
  microNiches: safeArray(bundledMicroNicheRows),
  opportunities: safeArray(bundledOpportunityRows),
  divergence: safeArray(bundledDivergenceRows),
  observability: bundledObservabilityStatus as unknown,
  manifest: safeManifest(bundledManifest),
  sourceMetadata: createDashboardSourceMetadata("bundled_fallback"),
};

export const emptyDashboardData: DashboardExportBundle = {
  dashboard: [],
  timeseries: [],
  microNiches: [],
  opportunities: [],
  divergence: [],
  observability: {},
  manifest: {},
  sourceMetadata: createDashboardSourceMetadata("unavailable"),
};

export function createDashboardSourceMetadata(
  source: DashboardDataSource,
  overrides: Partial<DashboardSourceMetadata> = {},
): DashboardSourceMetadata {
  return {
    dashboardSource: source,
    timeseriesSource: source,
    timeseriesSourceMatchesDashboard: source !== "unavailable",
    bundleSnapshotDate: null,
    bundleRunId: null,
    bundlePath: null,
    bundleManifestPath: null,
    timeseriesFile: source === "unavailable" ? null : DASHBOARD_FILES.timeseries,
    ...overrides,
  };
}

export function getDashboardR2BaseUrl(): string | null {
  const configured = import.meta.env.VITE_R2_DASHBOARD_EXPORT_BASE_URL;
  if (!configured || typeof configured !== "string") return null;
  return configured.replace(/\/+$/, "");
}

export function getDashboardRuntimeMode(): DashboardRuntimeMode {
  return import.meta.env.PROD ? "production" : "local_dev";
}

export function isBundledDashboardFallbackAllowed(runtimeMode = getDashboardRuntimeMode()) {
  return runtimeMode !== "production";
}

function getDashboardLatestPointerUrl(baseUrl = getDashboardR2BaseUrl()) {
  if (!baseUrl) return null;
  return `${baseUrl}/${DASHBOARD_LATEST_POINTER_FILE}`;
}

function resolveDashboardExportUrl(baseUrl: string, remotePath: string) {
  const trimmedPath = remotePath.trim();
  if (/^https?:\/\//i.test(trimmedPath)) return trimmedPath;

  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = trimmedPath.replace(/^\/+/, "");
  const markerWithVersion = "dashboard_exports/v4_0/";
  const marker = "dashboard_exports/";

  if (cleanBase.endsWith("/v4_0")) {
    const versionedIndex = cleanPath.indexOf(markerWithVersion);
    if (versionedIndex >= 0) {
      return `${cleanBase}/${cleanPath.slice(versionedIndex + markerWithVersion.length)}`;
    }
  }

  const dashboardIndex = cleanPath.indexOf(marker);
  if (dashboardIndex >= 0) {
    return `${cleanBase}/${cleanPath.slice(dashboardIndex + marker.length)}`;
  }

  return `${cleanBase}/${cleanPath}`;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`.trim());
  }
  return response.text();
}

async function sha256Text(value: string) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Browser crypto.subtle is unavailable; cannot verify dashboard bundle hashes");
  }
  const encoded = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function parseJsonText<T>(text: string, label: string): T {
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error(`Invalid JSON in ${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function validatePointer(pointer: DashboardLatestPointer) {
  if (!pointer || typeof pointer !== "object") {
    throw new Error("latest_pointer.json is not a JSON object");
  }
  if (pointer.validation_status !== "PASS") {
    throw new Error(`latest_pointer validation_status is not PASS: ${pointer.validation_status ?? "missing"}`);
  }
  if (pointer.schema_version !== "dashboard_latest_pointer_v1") {
    throw new Error(`latest_pointer schema_version is invalid: ${pointer.schema_version ?? "missing"}`);
  }
  if (!pointer.bundle_path || !pointer.bundle_manifest_path) {
    throw new Error("latest_pointer is missing bundle_path or bundle_manifest_path");
  }
  if (!pointer.bundle_manifest_sha256) {
    throw new Error("latest_pointer is missing bundle_manifest_sha256");
  }
}

function validateBundleManifest(manifest: DashboardBundleManifest, pointer: DashboardLatestPointer) {
  if (!manifest || typeof manifest !== "object") {
    throw new Error("bundle_manifest.json is not a JSON object");
  }
  if (manifest.validation_status !== "PASS") {
    throw new Error(`bundle_manifest validation_status is not PASS: ${manifest.validation_status ?? "missing"}`);
  }
  if (manifest.schema_version !== "dashboard_bundle_manifest_v1") {
    throw new Error(`bundle_manifest schema_version is invalid: ${manifest.schema_version ?? "missing"}`);
  }
  if (pointer.snapshot_date && manifest.snapshot_date !== pointer.snapshot_date) {
    throw new Error(`bundle_manifest snapshot_date does not match latest_pointer: ${manifest.snapshot_date} != ${pointer.snapshot_date}`);
  }
  if (pointer.run_id && String(manifest.run_id) !== String(pointer.run_id)) {
    throw new Error(`bundle_manifest run_id does not match latest_pointer: ${manifest.run_id} != ${pointer.run_id}`);
  }
  if (!manifest.files || typeof manifest.files !== "object") {
    throw new Error("bundle_manifest.files is missing");
  }
  const missingFiles = REQUIRED_BUNDLE_FILES.filter((fileName) => !manifest.files?.[fileName]);
  if (missingFiles.length > 0) {
    throw new Error(`bundle_manifest.files missing required files: ${missingFiles.join(", ")}`);
  }
}

async function fetchVerifiedBundlePayload<T>(
  fileName: string,
  fileUrl: string,
  manifest: DashboardBundleManifest,
): Promise<T> {
  const text = await fetchText(fileUrl);
  const fileManifest = manifest.files?.[fileName];
  if (!fileManifest) {
    throw new Error(`bundle_manifest does not list ${fileName}`);
  }
  const sizeBytes = new TextEncoder().encode(text).byteLength;
  if (typeof fileManifest.size_bytes !== "number") {
    throw new Error(`bundle_manifest ${fileName} is missing size_bytes`);
  }
  if (fileManifest.size_bytes !== sizeBytes) {
    throw new Error(`${fileName} size mismatch: ${sizeBytes} != ${fileManifest.size_bytes}`);
  }
  if (!fileManifest.sha256) {
    throw new Error(`bundle_manifest ${fileName} is missing sha256`);
  }
  const actualSha = await sha256Text(text);
  if (actualSha !== fileManifest.sha256) {
    throw new Error(`${fileName} sha256 mismatch`);
  }
  return parseJsonText<T>(text, fileName);
}

export async function fetchCanonicalDashboardExport(baseUrl = getDashboardR2BaseUrl()) {
  if (!baseUrl) {
    throw new Error("VITE_R2_DASHBOARD_EXPORT_BASE_URL is not configured");
  }

  const pointerUrl = getDashboardLatestPointerUrl(baseUrl);
  if (!pointerUrl) {
    throw new Error("Dashboard latest pointer URL could not be resolved");
  }

  const pointerText = await fetchText(pointerUrl);
  const pointer = parseJsonText<DashboardLatestPointer>(pointerText, DASHBOARD_LATEST_POINTER_FILE);
  validatePointer(pointer);

  const manifestUrl = resolveDashboardExportUrl(baseUrl, pointer.bundle_manifest_path ?? "");
  const manifestText = await fetchText(manifestUrl);
  const actualManifestSha = await sha256Text(manifestText);
  if (actualManifestSha !== pointer.bundle_manifest_sha256) {
    throw new Error("bundle_manifest sha256 does not match latest_pointer");
  }
  const bundleManifest = parseJsonText<DashboardBundleManifest>(manifestText, "bundle_manifest.json");
  validateBundleManifest(bundleManifest, pointer);

  const bundleBaseUrl = resolveDashboardExportUrl(baseUrl, pointer.bundle_path ?? "").replace(/\/+$/, "");
  const [dashboard, timeseries, microNiches, divergence, observability, manifest] = await Promise.all([
    fetchVerifiedBundlePayload<unknown>(DASHBOARD_FILES.dashboard, `${bundleBaseUrl}/${DASHBOARD_FILES.dashboard}`, bundleManifest),
    fetchVerifiedBundlePayload<unknown>(DASHBOARD_FILES.timeseries, `${bundleBaseUrl}/${DASHBOARD_FILES.timeseries}`, bundleManifest),
    fetchVerifiedBundlePayload<unknown>(DASHBOARD_FILES.microNiches, `${bundleBaseUrl}/${DASHBOARD_FILES.microNiches}`, bundleManifest),
    fetchVerifiedBundlePayload<unknown>(DASHBOARD_FILES.divergence, `${bundleBaseUrl}/${DASHBOARD_FILES.divergence}`, bundleManifest),
    fetchVerifiedBundlePayload<unknown>(DASHBOARD_FILES.observability, `${bundleBaseUrl}/${DASHBOARD_FILES.observability}`, bundleManifest),
    fetchVerifiedBundlePayload<unknown>(DASHBOARD_FILES.manifest, `${bundleBaseUrl}/${DASHBOARD_FILES.manifest}`, bundleManifest),
  ]);

  return {
    dashboard: safeArray(dashboard),
    timeseries: safeArray(timeseries),
    microNiches: safeArray(microNiches),
    opportunities: [],
    divergence: safeArray(divergence),
    observability,
    manifest: safeManifest(manifest),
    sourceMetadata: getCanonicalDashboardSourceMetadata(pointer),
  } satisfies DashboardExportBundle;
}

export function getCanonicalDashboardSourceMetadata(
  pointer: DashboardLatestPointer,
): DashboardSourceMetadata {
  return createDashboardSourceMetadata("canonical_remote", {
    bundleSnapshotDate: pointer.snapshot_date ?? null,
    bundleRunId: pointer.run_id ?? null,
    bundlePath: pointer.bundle_path ?? null,
    bundleManifestPath: pointer.bundle_manifest_path ?? null,
    timeseriesFile: DASHBOARD_FILES.timeseries,
    timeseriesSourceMatchesDashboard: true,
  });
}

export const fetchLatestDashboardExport = fetchCanonicalDashboardExport;
