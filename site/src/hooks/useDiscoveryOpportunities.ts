import { useEffect, useState } from "react";

export type DiscoveryLabel = "EARLY_BREAKOUT" | "EMERGING_SIGNAL" | "WATCHLIST_SIGNAL";
export type SignalSource = "MARKET" | "ENTITY_DRIVEN" | "EVENT_DRIVEN" | "UNKNOWN";
export type OutcomeStatus = "ACTIVE" | "FAILED" | "WEAKENING" | "PENDING" | "UNKNOWN";

export type DiscoveryOpportunity = {
  experiment_id: string;
  snapshot_date: string;
  cluster_id: string;
  subcluster_id: string;
  subcluster_label: string;
  canonical_subcluster_label?: string | null;
  semantic_label_status?: string | null;
  display_label?: string | null;
  intent_label: string;
  raw_label: string;
  intent_type: string;
  intent_confidence?: number | null;
  signal_source: SignalSource;
  divergence_label: string;
  discovery_label: DiscoveryLabel;
  discovery_score: number;
  micro_emergence_score: number;
  divergence_score: number;
  share_delta: number;
  relative_growth_spread: number;
  micro_n_videos: number;
  parent_n_videos: number;
  micro_wow_pct?: number;
  parent_wow_pct?: number;
  created_at_utc?: string;
  detected_snapshot_date?: string;
  outcome_snapshot_date?: string;
  latest_snapshot_date?: string;
  outcome_label?: string;
  outcome_status?: OutcomeStatus;
  outcome_metric?: number;
  lifecycle_stage?: string;
  lifecycle_summary?: string;
  latest_divergence_label?: string;
  latest_divergence_score?: number;
  latest_share_delta?: number;
  latest_micro_wow_pct?: number;
  latest_parent_wow_pct?: number;
  latest_micro_n_videos?: number;
  latest_parent_n_videos?: number;
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

export function useDiscoveryOpportunities() {
  const [opportunities, setOpportunities] = useState<DiscoveryOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDiscovery() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:8000/discovery", {
          signal: controller.signal,
        });
        const data: unknown = await response.json();

        if (isApiError(data)) {
          setError(data.error);
          setOpportunities([]);
          return;
        }

        if (!response.ok) {
          setError(`Request failed with status ${response.status}`);
          setOpportunities([]);
          return;
        }

        setOpportunities(Array.isArray(data) ? (data as DiscoveryOpportunity[]) : []);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        setError(caughtError instanceof Error ? caughtError.message : "Unable to load discovery opportunities");
        setOpportunities([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDiscovery();

    return () => controller.abort();
  }, []);

  return { opportunities, loading, error };
}
