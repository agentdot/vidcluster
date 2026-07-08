import assert from "node:assert/strict";
import test from "node:test";

import {
  getValidatedSubtopicLabel,
  isBreakingOutDivergence,
  UNVALIDATED_SUBTOPIC_LABEL,
} from "../src/lib/subtopicLabels.ts";

test("SC021 does not expose raw meal prep from divergence data", () => {
  const divergence = {
    subcluster_id: "SC021_SUB00",
    subcluster_label: "meal prep",
    divergence_label: "STABLE",
  };
  const cleanedMicroNiche = {
    subcluster_id: "SC021_SUB00",
    display_label: "Home Organization - Segment 1",
    subcluster_label: "Home Organization - Segment 1",
    assigned_video_count: 165,
  };

  assert.equal(getValidatedSubtopicLabel(cleanedMicroNiche), UNVALIDATED_SUBTOPIC_LABEL);
  assert.equal(getValidatedSubtopicLabel(divergence), UNVALIDATED_SUBTOPIC_LABEL);
  assert.notEqual(getValidatedSubtopicLabel(cleanedMicroNiche), divergence.subcluster_label);
});

test("raw divergence states are not accepted as titles", () => {
  for (const state of ["STABLE", "NO_SIGNAL", "EMERGING", "DECLINING"]) {
    const divergence = {
      divergence_label: state,
      subcluster_label: state,
    };
    assert.equal(getValidatedSubtopicLabel(divergence), UNVALIDATED_SUBTOPIC_LABEL);
    assert.notEqual(getValidatedSubtopicLabel(divergence), state);
  }
});

test("missing or unsupported cleaned labels use the honest fallback", () => {
  assert.equal(getValidatedSubtopicLabel(undefined), UNVALIDATED_SUBTOPIC_LABEL);
  assert.equal(
    getValidatedSubtopicLabel({
      display_label: "Home Organization - Organizing",
      assigned_video_count: 0,
    }),
    UNVALIDATED_SUBTOPIC_LABEL,
  );
  assert.equal(
    getValidatedSubtopicLabel({
      display_label: "Home Organization - Segment 1",
      assigned_video_count: 20,
    }),
    UNVALIDATED_SUBTOPIC_LABEL,
  );
});

test("cleaned evidence-backed labels remain visible", () => {
  assert.equal(
    getValidatedSubtopicLabel({
      display_label: "Home Organization - Organizing",
      subcluster_label: "meal prep",
      assigned_video_count: 71,
    }),
    "Home Organization - Organizing",
  );
});

test("only canonical breakout states enter Breaking Out", () => {
  assert.equal(isBreakingOutDivergence("EMERGING_WITHIN_CLUSTER"), true);
  assert.equal(isBreakingOutDivergence("OUTPERFORMING_MICRO"), true);
  assert.equal(isBreakingOutDivergence("STABLE"), false);
  assert.equal(isBreakingOutDivergence("DECLINING_WITHIN_CLUSTER"), false);
  assert.equal(isBreakingOutDivergence("NO_SIGNAL"), false);
  assert.equal(isBreakingOutDivergence(undefined), false);
});
