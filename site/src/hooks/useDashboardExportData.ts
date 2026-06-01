import { useEffect, useState } from "react";

import {
  bundledDashboardData,
  fetchLatestDashboardExport,
  getDashboardR2BaseUrl,
  type DashboardDataState,
} from "../lib/dashboardData";

export function useDashboardExportData(): DashboardDataState {
  const [state, setState] = useState<DashboardDataState>(() => ({
    data: bundledDashboardData,
    source: "bundled",
    isLoading: Boolean(getDashboardR2BaseUrl()),
    error: null,
    r2BaseUrl: getDashboardR2BaseUrl(),
  }));

  useEffect(() => {
    const baseUrl = getDashboardR2BaseUrl();
    if (!baseUrl) {
      setState((current) => ({
        ...current,
        isLoading: false,
        error: "R2 dashboard export URL is not configured; using bundled JSON.",
        r2BaseUrl: null,
      }));
      return;
    }

    let cancelled = false;
    setState((current) => ({ ...current, isLoading: true, error: null, r2BaseUrl: baseUrl }));

    fetchLatestDashboardExport(baseUrl)
      .then((data) => {
        if (cancelled) return;
        setState({
          data,
          source: "r2",
          isLoading: false,
          error: null,
          r2BaseUrl: baseUrl,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : String(error);
        setState({
          data: bundledDashboardData,
          source: "bundled",
          isLoading: false,
          error: `R2 dashboard export unavailable; using bundled JSON. ${message}`,
          r2BaseUrl: baseUrl,
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
