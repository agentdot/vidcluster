# V3.3 Freeze Rules (Non-Negotiable)

These rules enforce preregistration discipline and prevent post-hoc manipulation.
Violation of any rule automatically INVALIDATES the run and results in FAIL.

---

## 1. Global Rules

- All artifacts are append-only unless explicitly stated.
- No file may be overwritten after its freeze point.
- Any re-run requires a new run_id and new output folders.
- Any code change after a freeze point INVALIDATES the run.

---

## 2. Phase Freeze Points

### CP0 — Preregistration Freeze
Triggered when:
- v3_3_preregistration.yaml is committed
- SCHEMA.md is committed

Rules:
- No edits allowed to preregistration files
- No parameter tuning allowed afterward

Violation → INVALID RUN

---

### CP1 — Cluster Freeze
Triggered when:
- clusters_frozen.csv is exported
- clusters_frozen.hash is generated and saved

Rules:
- cluster_id list is immutable
- No clusters may be added, removed, merged, or split
- included_in_gates flag may not change

Violation → INVALID RUN

---

### CP2 — Gate Freeze
Triggered when:
- gate_summary.csv is written

Rules:
- Gate pass/fail results are final
- Excluded clusters must remain excluded
- No re-rating or rater substitution allowed

Violation → INVALID RUN

---

### CP3 — Prediction Freeze
Triggered when:
- predictions_frozen.csv is exported
- predictions_frozen.hash is generated and saved

Rules:
- Predictions (labels, scores, reasons) are immutable
- No overrides, no reclassification
- No model, rule, or threshold changes allowed

Violation → INVALID RUN

---

### CP4 — Outcome Freeze
Triggered separately for each window:
- outcomes_t60.csv export
- outcomes_t90.csv export

Rules:
- Outcomes may only be appended once per window
- No outcome relabeling allowed
- Missing data handled strictly per prereg policy

Violation → INVALID RUN

---

### CP5 — Evaluation Freeze
Triggered when:
- evaluation_metrics.csv is written
- verdict.txt is written

Rules:
- Metrics are final
- PASS / FAIL verdict is final
- No reinterpretation, smoothing, or narrative adjustment allowed

Violation → INVALID RUN

---

## 3. Hash Integrity Rules

- All frozen CSV artifacts must have a corresponding `.hash` file
- Hash algorithm: SHA-256
- Hash mismatch INVALIDATES the run

---

## 4. Human Intervention Rules

- Humans may only interact via:
  - coherence_ratings.csv
  - actionability_ratings.csv
- Humans may not:
  - rename clusters
  - edit summaries post-freeze
  - influence predictions

Violation → INVALID RUN

---

## 5. Failure Handling

- INVALID runs are recorded as FAIL
- No retries without new preregistration
- Failures are not hidden, merged, or discarded

---

## 6. Final Enforcement Statement

This document supersedes convenience, intuition, or optimism.
If these rules are inconvenient, the experiment should not be run.
