import { useEffect, useState } from "react";

import {
  bundledDashboardData,
  createDashboardSourceMetadata,
  emptyDashboardData,
  fetchCanonicalDashboardExport,
  getDashboardR2BaseUrl,
  getDashboardRuntimeMode,
  isBundledDashboardFallbackAllowed,
  type DashboardDataState,
} from "../lib/dashboardData";

export function useDashboardExportData(): DashboardDataState {
  const runtimeMode = getDashboardRuntimeMode();
  const isFallbackAllowed = isBundledDashboardFallbackAllowed(runtimeMode);
  const initialBaseUrl = getDashboardR2BaseUrl();
  const [state, setState] = useState<DashboardDataState>(() => ({
    data: isFallbackAllowed ? bundledDashboardData : null,
    source: isFallbackAllowed ? "bundled_fallback" : "unavailable",
    sourceMetadata: isFallbackAllowed
      ? bundledDashboardData.sourceMetadata
      : createDashboardSourceMetadata("unavailable"),
    runtimeMode,
    isFallbackAllowed,
    isLoading: Boolean(initialBaseUrl),
    error: null,
    r2BaseUrl: initialBaseUrl,
  }));

  useEffect(() => {
    const baseUrl = getDashboardR2BaseUrl();
    const runtimeMode = getDashboardRuntimeMode();
    const isFallbackAllowed = isBundledDashboardFallbackAllowed(runtimeMode);
    if (!baseUrl) {
      setState({
        data: isFallbackAllowed ? bundledDashboardData : emptyDashboardData,
        source: isFallbackAllowed ? "bundled_fallback" : "unavailable",
        sourceMetadata: isFallbackAllowed
          ? bundledDashboardData.sourceMetadata
          : emptyDashboardData.sourceMetadata,
        runtimeMode,
        isFallbackAllowed,
        isLoading: false,
        error: isFallbackAllowed
          ? "Canonical dashboard export URL is not configured; using explicit local bundled fallback."
          : "Canonical dashboard export URL is not configured. Production dashboard data is unavailable.",
        r2BaseUrl: null,
      });
      return;
    }

    let cancelled = false;
    setState((current) => ({
      ...current,
      runtimeMode,
      isFallbackAllowed,
      isLoading: true,
      error: null,
      r2BaseUrl: baseUrl,
    }));

    fetchCanonicalDashboardExport(baseUrl)
      .then((data) => {
        if (cancelled) return;
        setState({
          data,
          source: "canonical_remote",
          sourceMetadata: data.sourceMetadata,
          runtimeMode,
          isFallbackAllowed,
          isLoading: false,
          error: null,
          r2BaseUrl: baseUrl,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : String(error);
        setState({
          data: isFallbackAllowed ? bundledDashboardData : emptyDashboardData,
          source: isFallbackAllowed ? "bundled_fallback" : "unavailable",
          sourceMetadata: isFallbackAllowed
            ? bundledDashboardData.sourceMetadata
            : emptyDashboardData.sourceMetadata,
          runtimeMode,
          isFallbackAllowed,
          isLoading: false,
          error: isFallbackAllowed
            ? `Canonical dashboard export unavailable; using explicit local bundled fallback. ${message}`
            : `Canonical dashboard export unavailable. Production dashboard data is unavailable. ${message}`,
          r2BaseUrl: baseUrl,
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
