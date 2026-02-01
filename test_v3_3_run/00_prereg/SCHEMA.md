VidCluster V3.3 — Artifact Schemas (LOCKED)

This document defines the required schemas for every artifact produced in V3.3.
Missing fields, renamed columns, or post-hoc edits invalidate the run.

All tables are append-only unless explicitly stated.

1. RUN METADATA (RUNS)

One row per V3.3 run

Column	Type	Description
run_id	string	Unique run identifier
prereg_commit_hash	string	Git hash of preregistration commit
code_commit_hash_at_run	string	Git hash at execution time
discovery_window_start_utc	datetime	Start of discovery window
discovery_window_end_utc	datetime	End of discovery window
created_utc	datetime	Run creation time
phase_status	enum	A / B / C / D / E / COMPLETE
notes	string	Optional operator notes

2. CLUSTERS (FROZEN UNIT OF ANALYSIS)

One row = one opportunity cluster (LOCKED UNIT)

Column	Type	Description
run_id	string	Run identifier
cluster_id	string	Stable cluster identifier
cluster_name	string	Short human-readable label
cluster_summary	string	1–2 line summary of intent
example_video_ids	string	Comma-separated
example_titles	string	Pipe-separated
n_videos	integer	Number of videos in cluster
frozen_utc	datetime	Timestamp when cluster froze
source_query_or_seed	string	Discovery origin
included_in_gates	boolean	TRUE if sent to gates

Once written → never edited.

3. COHERENCE GATE (V3.1)

Multiple rows per cluster (one per rater)

Column	Type	Description
run_id	string	Run identifier
cluster_id	string	Cluster being rated
rater_id	string	Anonymous rater ID
pass	boolean	YES / NO
notes	string	Optional rationale
rated_utc	datetime	Rating time

Derived metric (not edited manually):

coherence_pass = TRUE if agreement ≥ prereg threshold

4. ACTIONABILITY GATE (V3.2)

Multiple rows per cluster (one per rater)

Column	Type	Description
run_id	string	Run identifier
cluster_id	string	Cluster being rated
rater_id	string	Anonymous rater ID
pass	boolean	YES / NO
opportunity_question	string	Decision-shaped human question
notes	string	Optional rationale
rated_utc	datetime	Rating time

Derived metric:

actionability_pass = TRUE if agreement ≥ prereg threshold

5. GATE SUMMARY (DERIVED, OPTIONAL BUT RECOMMENDED)

One row per cluster

Column	Type	Description
run_id	string	Run identifier
cluster_id	string	Cluster ID
coherence_pass	boolean	Result
actionability_pass	boolean	Result
excluded	boolean	TRUE if failed any gate
exclusion_reason	string	COHERENCE / ACTIONABILITY
exclusion_utc	datetime	Time excluded
6. PREDICTIONS (FROZEN)

One row per surviving cluster

Column	Type	Description
run_id	string	Run identifier
cluster_id	string	Cluster ID
label	enum	SCALE / TEST / AVOID
score	float	Optional confidence
reason_codes	string	Comma-separated
predicted_utc	datetime	Prediction time
freeze_hash	string	Hash of exported predictions CSV

Once written → immutable.

7. OUTCOMES — T+60 and T+90

One row per cluster per window

Column	Type	Description
run_id	string	Run identifier
cluster_id	string	Cluster ID
observed_utc	datetime	Observation time
meets_viable	boolean	TRUE/FALSE
meets_crowded	boolean	TRUE/FALSE
ground_truth	enum	VIABLE / CROWDED / NONVIABLE
evidence_links	string	Optional
notes	string	Optional

Rules:

Ground truth must follow V2 definitions

Missing data handled per prereg policy

8. BASELINES (DERIVED)

One row per cluster per baseline

Column	Type	Description
run_id	string	Run identifier
cluster_id	string	Cluster ID
baseline_type	enum	UPLOAD_VELOCITY / VIEWS_ONLY / RANDOM
baseline_rank	integer	Rank within baseline
baseline_scale_flag	boolean	Selected as SCALE-equivalent
9. EVALUATION (FINAL VERDICT)

One row per run per window

Column	Type	Description
run_id	string	Run identifier
window	enum	T+60 / T+90
precision_at_scale	float	VidCluster precision
false_positive_rate_scale	float	% crowded among SCALE
baseline_upload_velocity_precision	float	Baseline
baseline_views_only_precision	float	Baseline
baseline_random_precision	float	Baseline
delta_vs_best_baseline_pp	float	Percentage points
pass_fail	enum	PASS / FAIL
verdict_notes	string	No reinterpretation
10. INVALIDATION CONDITIONS

A run is INVALID → FAIL if:

Any schema is altered post-freeze

Clusters removed after gates without logging

Predictions modified after freeze

Thresholds differ from prereg

Manual overrides occur
