import { useEffect, useState } from "react";

export type InsightType =
  | "EMERGING_DRIVER"
  | "INTERNAL_OUTPERFORMER"
  | "WEAKENING_SEGMENT"
  | "FAILED_BREAKOUT";

export type Insight = {
  experiment_id?: string;
  cluster_id: string;
  snapshot_date: string;
  insight_type: InsightType;
  insight_text: string;
  subcluster_id: string;
  subcluster_label: string;
  divergence_label?: string;
  divergence_score?: number;
  micro_emergence_score?: number;
  micro_wow_pct?: number;
  parent_wow_pct?: number;
  share_delta?: number;
  relative_growth_spread?: number;
  insight_score: number;
  rank_within_cluster?: number;
};

export type InsightCluster = {
  clusterId: string;
  clusterName: string;
  snapshotDate: string;
  topInsightType?: InsightType;
  topInsightLabel?: string;
  topInsightScore?: number;
  insights: Insight[];
};

type ApiError = {
  error: string;
};

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiError).error === "string"
  );
}

export function useInsightClusters() {
  const [clusters, setClusters] = useState<InsightCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadClusters() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:8000/clusters", {
          signal: controller.signal,
        });
        const data: unknown = await response.json();

        if (isApiError(data)) {
          setError(data.error);
          setClusters([]);
          return;
        }

        if (!response.ok) {
          setError(`Request failed with status ${response.status}`);
          setClusters([]);
          return;
        }

        setClusters(Array.isArray(data) ? (data as InsightCluster[]) : []);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        setError(caughtError instanceof Error ? caughtError.message : "Unable to load insight clusters");
        setClusters([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadClusters();

    return () => controller.abort();
  }, []);

  return { clusters, loading, error };
}
