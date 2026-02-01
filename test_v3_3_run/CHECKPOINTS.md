# V3.3 Execution Checkpoints (CP0–CP5)

Each checkpoint is a hard gate.
Proceeding without satisfying a checkpoint INVALIDATES the run.

---

## CP0 — PREREGISTRATION LOCKED

Criteria:
- v3_3_preregistration.yaml committed
- SCHEMA.md committed
- Commit hashes recorded in RUNS table

Artifacts:
- test_v3_3_run/00_prereg/v3_3_preregistration.yaml
- test_v3_3_run/00_prereg/SCHEMA.md

Status Output:
- RUNS.phase_status = "A"

---

## CP1 — CLUSTERS FROZEN

Criteria:
- Automatic discovery completed
- clusters_frozen.csv exported
- clusters_frozen.hash generated
- CLUSTERS_FROZEN sheet populated

Artifacts:
- 03_outputs/clusters_frozen.csv
- 03_outputs/clusters_frozen.hash

Status Output:
- RUNS.phase_status = "B"

---

## CP2 — HUMAN GATES COMPLETE

Criteria:
- All coherence ratings recorded
- All actionability ratings recorded
- gate_summary.csv written
- Excluded clusters logged with reason

Artifacts:
- 04_human_gates/coherence_ratings.csv
- 04_human_gates/actionability_ratings.csv
- 04_human_gates/gate_summary.csv

Status Output:
- RUNS.phase_status = "C"

---

## CP3 — PREDICTIONS FROZEN

Criteria:
- V2 decision logic applied
- predictions_frozen.csv exported
- predictions_frozen.hash generated
- No manual overrides

Artifacts:
- 05_predictions/predictions_frozen.csv
- 05_predictions/predictions_frozen.hash

Status Output:
- RUNS.phase_status = "D"

---

## CP4 — OUTCOMES OBSERVED

Criteria:
- T+60 outcomes recorded
- T+90 outcomes recorded
- Ground truth assigned per V2 rules

Artifacts:
- 06_outcomes/outcomes_t60.csv
- 06_outcomes/outcomes_t90.csv

Status Output:
- RUNS.phase_status = "E"

---

## CP5 — FINAL EVALUATION

Criteria:
- Precision@SCALE computed
- Baseline comparison completed
- Stability checked across windows
- PASS / FAIL assigned

Artifacts:
- 07_eval/baseline_results.csv
- 07_eval/evaluation_metrics.csv
- 07_eval/verdict.txt

Status Output:
- RUNS.phase_status = "COMPLETE"

---

## FINAL RULE

If any checkpoint is skipped, partially completed, or retroactively modified:
→ RUN INVALID → V3.3 FAIL
