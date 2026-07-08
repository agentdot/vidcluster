export const UNVALIDATED_SUBTOPIC_LABEL = "Subtopic not yet validated";
const BREAKING_OUT_DIVERGENCE_LABELS = new Set([
  "EMERGING_WITHIN_CLUSTER",
  "OUTPERFORMING_MICRO",
]);

export type CleanedSubtopicLabelRow = {
  canonical_subcluster_label?: string | null;
  clean_micro_niche_label?: string | null;
  display_label?: string | null;
  subcluster_label?: string | null;
  assigned_video_count?: number | null;
};

function isSupportedLabel(value?: string | null) {
  const label = value?.trim();
  if (!label) return false;

  const normalized = label.toLowerCase();
  return (
    normalized !== "needs review" &&
    normalized !== "area needs clearer label" &&
    !/\bsegment\s+\d+\b/.test(normalized) &&
    !normalized.endsWith(" segment")
  );
}

export function getValidatedSubtopicLabel(row?: CleanedSubtopicLabelRow | null) {
  if (!row) return UNVALIDATED_SUBTOPIC_LABEL;

  const evidenceCount = Number(row.assigned_video_count);
  if (!Number.isFinite(evidenceCount) || evidenceCount <= 0) {
    return UNVALIDATED_SUBTOPIC_LABEL;
  }

  const candidates = [
    row.canonical_subcluster_label,
    row.clean_micro_niche_label,
    row.display_label,
    row.subcluster_label,
  ];
  const label = candidates.find(isSupportedLabel);
  return label?.trim() || UNVALIDATED_SUBTOPIC_LABEL;
}

export function isBreakingOutDivergence(label?: string | null) {
  return BREAKING_OUT_DIVERGENCE_LABELS.has(label?.trim().toUpperCase() ?? "");
}
