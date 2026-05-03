from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INSIGHTS_PATH = Path(
    r"D:\Projects\vidcluster\vidcluster_engine\automation-data\experiments\v4_0\derived\insights\v4_0_cluster_insights.parquet"
)
DISCOVERY_PATH = Path(
    r"D:\Projects\vidcluster\vidcluster_engine\automation-data\experiments\v4_0\derived\discovery\v4_0_micro_niche_discovery.parquet"
)
INTENT_MAPPING_PATH = Path(
    r"D:\Projects\vidcluster\vidcluster_engine\automation-data\experiments\v4_0\derived\intent\v4_0_micro_intent_mapping.parquet"
)
DIVERGENCE_PATH = Path(
    r"D:\Projects\vidcluster\vidcluster_engine\automation-data\experiments\v4_0\derived\microstructure\divergence\v4_0_micro_divergence.parquet"
)

LIFECYCLE_SUMMARIES = {
    "ACTIVE": "Signal is still active in the latest snapshot.",
    "FAILED": "This signal was detected early but later failed to sustain.",
    "WEAKENING": "This signal is losing share relative to its parent topic.",
    "PENDING": "This signal is newly detected and awaiting confirmation.",
    "UNKNOWN": "Outcome has not been classified yet.",
}


def serialize_value(value):
    if pd.isna(value):
        return None
    if isinstance(value, pd.Timestamp):
        return value.isoformat()
    if hasattr(value, "item"):
        return value.item()
    return value


def serialize_record(record):
    return {key: serialize_value(value) for key, value in record.items()}


def normalize_datetime_col(df, col="snapshot_date"):
    if df is not None and col in df.columns:
        df[col] = pd.to_datetime(df[col], utc=True, errors="coerce")
    return df


def stringify_datetime_cols(df, columns):
    out = df.copy()
    for column in columns:
        if column in out.columns:
            out[column] = out[column].apply(
                lambda value: value.isoformat() if isinstance(value, pd.Timestamp) and pd.notna(value) else None
            )
    return out


def apply_intent_fallbacks(df):
    out = df.copy()
    mapping = {
        "raw_label": out.get("subcluster_label"),
        "intent_label": out.get("subcluster_label"),
        "intent_type": "generic_topic",
        "signal_source": "UNKNOWN",
    }

    for column, fallback in mapping.items():
        intent_column = f"{column}_intent"
        if intent_column in out.columns:
            out[column] = out[intent_column].fillna(fallback)
        elif column not in out.columns:
            out[column] = fallback
        else:
            out[column] = out[column].fillna(fallback)

    if "intent_confidence_intent" in out.columns:
        out["intent_confidence"] = out["intent_confidence_intent"]
    elif "intent_confidence" not in out.columns:
        out["intent_confidence"] = pd.NA

    drop_columns = [column for column in out.columns if column.endswith("_intent")]
    return out.drop(columns=drop_columns)


def enrich_discovery_with_intent(discovery_df):
    out = discovery_df.copy()
    out["raw_label"] = out.get("subcluster_label")
    out["intent_label"] = out.get("subcluster_label")
    out["intent_type"] = "generic_topic"
    out["intent_confidence"] = pd.NA
    out["signal_source"] = "UNKNOWN"

    if not INTENT_MAPPING_PATH.exists():
        return out

    intent_df = normalize_datetime_col(pd.read_parquet(INTENT_MAPPING_PATH))
    required = {
        "cluster_id",
        "subcluster_id",
        "intent_label",
        "intent_type",
        "intent_confidence",
        "signal_source",
    }
    if not required.issubset(intent_df.columns):
        return out

    intent_df = intent_df.copy()

    join_keys = ["cluster_id", "subcluster_id"]
    if "snapshot_date" in intent_df.columns and out["snapshot_date"].notna().any():
        dated_intent = intent_df[intent_df["snapshot_date"].notna()].copy()
        exact = out.merge(
            dated_intent,
            on=["cluster_id", "subcluster_id", "snapshot_date"],
            how="left",
            suffixes=("", "_intent"),
        )
        intent_label_column = (
            "intent_label_intent"
            if "intent_label_intent" in exact.columns
            else "intent_label"
        )
        if exact[intent_label_column].notna().any():
            return apply_intent_fallbacks(exact)

    if "snapshot_date" in intent_df.columns:
        intent_df = intent_df.sort_values(
            ["cluster_id", "subcluster_id", "snapshot_date"],
            ascending=[True, True, False],
        )
    latest_intent = intent_df.drop_duplicates(join_keys, keep="first")

    merged = out.merge(
        latest_intent,
        on=join_keys,
        how="left",
        suffixes=("", "_intent"),
    )
    return apply_intent_fallbacks(merged)


def get_lifecycle_status(latest_label, detected_date, outcome_date, failed_after_detected):
    if failed_after_detected:
        return "FAILED", "FAILED_BREAKOUT"

    if pd.notna(detected_date) and pd.notna(outcome_date) and outcome_date == detected_date:
        return "PENDING", "AWAITING_CONFIRMATION"

    if latest_label == "DECLINING_WITHIN_CLUSTER":
        return "WEAKENING", "LOST_MOMENTUM"

    if latest_label in ["EMERGING_WITHIN_CLUSTER", "OUTPERFORMING_MICRO"]:
        return "ACTIVE", "ACTIVE_SIGNAL"

    return "UNKNOWN", "UNKNOWN"


def enrich_discovery_with_outcomes(discovery_df):
    out = discovery_df.copy()
    out["detected_snapshot_date"] = out["snapshot_date"]
    out["outcome_snapshot_date"] = pd.NA
    out["latest_snapshot_date"] = pd.NA
    out["outcome_label"] = pd.NA
    out["outcome_status"] = "UNKNOWN"
    out["outcome_metric"] = pd.NA
    out["lifecycle_stage"] = "UNKNOWN"
    out["lifecycle_summary"] = LIFECYCLE_SUMMARIES["UNKNOWN"]

    latest_columns = {
        "latest_divergence_label": "divergence_label",
        "latest_divergence_score": "divergence_score",
        "latest_share_delta": "share_delta",
        "latest_micro_wow_pct": "micro_wow_pct",
        "latest_parent_wow_pct": "parent_wow_pct",
        "latest_micro_n_videos": "micro_n_videos",
        "latest_parent_n_videos": "parent_n_videos",
    }
    for output_column in latest_columns:
        out[output_column] = pd.NA

    divergence_df = pd.DataFrame()
    if DIVERGENCE_PATH.exists():
        divergence_df = normalize_datetime_col(pd.read_parquet(DIVERGENCE_PATH))
        divergence_df = divergence_df.copy()

    failed_insights_df = pd.DataFrame()
    if INSIGHTS_PATH.exists():
        insights_df = normalize_datetime_col(pd.read_parquet(INSIGHTS_PATH))
        insights_df = insights_df.copy()
        failed_insights_df = insights_df[insights_df["insight_type"] == "FAILED_BREAKOUT"]

    for index, row in out.iterrows():
        cluster_id = row.get("cluster_id")
        subcluster_id = row.get("subcluster_id")
        detected_date = row.get("snapshot_date")

        latest_row = None
        if not divergence_df.empty and pd.notna(detected_date):
            candidates = divergence_df[
                (divergence_df["cluster_id"] == cluster_id)
                & (divergence_df["subcluster_id"] == subcluster_id)
                & (divergence_df["snapshot_date"] >= detected_date)
            ].sort_values("snapshot_date", ascending=False)
            if not candidates.empty:
                latest_row = candidates.iloc[0]

        failed_after_detected = False
        latest_failed_insight = None
        if not failed_insights_df.empty and pd.notna(detected_date):
            matching_failed = failed_insights_df[
                (failed_insights_df["cluster_id"] == cluster_id)
                & (failed_insights_df["subcluster_id"] == subcluster_id)
                & (failed_insights_df["snapshot_date"] >= detected_date)
            ].sort_values("snapshot_date", ascending=False)
            failed_after_detected = not matching_failed.empty
            if failed_after_detected:
                latest_failed_insight = matching_failed.iloc[0]

        latest_label = None
        outcome_date = pd.NaT
        if latest_row is not None:
            outcome_date = latest_row.get("snapshot_date")
            latest_label = latest_row.get("divergence_label")
            out.at[index, "outcome_snapshot_date"] = outcome_date
            out.at[index, "latest_snapshot_date"] = outcome_date
            out.at[index, "outcome_label"] = latest_label
            out.at[index, "outcome_metric"] = latest_row.get("share_delta")

            for output_column, source_column in latest_columns.items():
                if source_column in latest_row:
                    out.at[index, output_column] = latest_row.get(source_column)
        else:
            outcome_date = detected_date
            latest_label = row.get("divergence_label")
            out.at[index, "outcome_snapshot_date"] = detected_date
            out.at[index, "latest_snapshot_date"] = detected_date
            out.at[index, "outcome_label"] = latest_label
            out.at[index, "outcome_metric"] = row.get("share_delta")

        if latest_failed_insight is not None:
            outcome_date = latest_failed_insight.get("snapshot_date")
            latest_label = "FAILED_BREAKOUT"
            out.at[index, "outcome_snapshot_date"] = outcome_date
            out.at[index, "latest_snapshot_date"] = outcome_date
            out.at[index, "outcome_label"] = latest_label
            out.at[index, "outcome_metric"] = latest_failed_insight.get("share_delta")

        status, stage = get_lifecycle_status(
            latest_label,
            detected_date,
            outcome_date,
            failed_after_detected,
        )
        out.at[index, "outcome_status"] = status
        out.at[index, "lifecycle_stage"] = stage
        out.at[index, "lifecycle_summary"] = LIFECYCLE_SUMMARIES[status]

    return out


@app.get("/insights")
def get_insights():
    try:
        df = normalize_datetime_col(pd.read_parquet(INSIGHTS_PATH))

        data = df.sort_values(
            ["snapshot_date", "cluster_id", "insight_score"],
            ascending=[False, True, False],
        ).to_dict(orient="records")

        return [serialize_record(record) for record in data]

    except Exception as e:
        return {
            "error": str(e),
            "path": str(INSIGHTS_PATH),
            "exists": INSIGHTS_PATH.exists(),
        }


@app.get("/clusters")
def get_clusters():
    try:
        df = normalize_datetime_col(pd.read_parquet(INSIGHTS_PATH))

        df = df.sort_values(
            ["snapshot_date", "cluster_id", "insight_score"],
            ascending=[False, True, False],
        )

        clusters = []

        for cluster_id, group in df.groupby("cluster_id"):
            latest_date = group["snapshot_date"].max()

            latest_group = group[group["snapshot_date"] == latest_date].sort_values(
                ["insight_score"],
                ascending=[False],
            )
            insights = [
                serialize_record(record)
                for record in latest_group.to_dict(orient="records")
            ]
            top_insight = insights[0] if insights else {}

            clusters.append({
                "clusterId": str(cluster_id),
                "clusterName": str(cluster_id),
                "snapshotDate": serialize_value(latest_date),
                "topInsightType": top_insight.get("insight_type"),
                "topInsightLabel": top_insight.get("subcluster_label"),
                "topInsightScore": top_insight.get("insight_score"),
                "insights": insights,
            })

        return clusters

    except Exception as e:
        return {
            "error": str(e),
            "exists": INSIGHTS_PATH.exists(),
            "path": str(INSIGHTS_PATH),
        }


@app.get("/discovery")
def get_discovery():
    try:
        df = normalize_datetime_col(pd.read_parquet(DISCOVERY_PATH))

        enriched_df = enrich_discovery_with_intent(df)
        enriched_df = enrich_discovery_with_outcomes(enriched_df)
        enriched_df = stringify_datetime_cols(
            enriched_df,
            ["snapshot_date", "detected_snapshot_date", "outcome_snapshot_date", "latest_snapshot_date"],
        )
        enriched_df = enriched_df.sort_values(
            ["outcome_status", "discovery_score", "snapshot_date", "cluster_id", "subcluster_id"],
            ascending=[True, False, False, True, True],
        )

        return [
            serialize_record(record)
            for record in enriched_df.to_dict(orient="records")
        ]

    except Exception as e:
        return {
            "error": str(e),
            "exists": DISCOVERY_PATH.exists(),
            "path": str(DISCOVERY_PATH),
            "intent_exists": INTENT_MAPPING_PATH.exists(),
            "intent_path": str(INTENT_MAPPING_PATH),
            "divergence_exists": DIVERGENCE_PATH.exists(),
            "divergence_path": str(DIVERGENCE_PATH),
            "insights_exists": INSIGHTS_PATH.exists(),
            "insights_path": str(INSIGHTS_PATH),
        }
