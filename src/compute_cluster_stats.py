import os
import sys
import math
import pandas as pd
from datetime import datetime, timezone, timedelta

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.config import SHEET_ID, DRIVE_FOLDER_ID, DRIVE_ASSIGNMENTS
from src.google_clients import get_drive_service
from src.drive_store import find_file_in_folder, download_file, upload_or_update

DRIVE_CLUSTER_STATS = os.environ.get("DRIVE_CLUSTER_STATS", "cluster_stats.parquet")

ASSIGN_PATH = "/tmp/cluster_assignments.parquet"
STATS_PATH = "/tmp/cluster_stats.parquet"


def parse_ts(series: pd.Series) -> pd.Series:
    # Safe parse for ISO strings
    return pd.to_datetime(series, errors="coerce", utc=True)


def clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def main():
    print("STATS: compute_cluster_stats")
    drive = get_drive_service()

    # Load assignments
    fid = find_file_in_folder(drive, DRIVE_FOLDER_ID, DRIVE_ASSIGNMENTS)
    if not fid:
        print("🟡 No cluster_assignments.parquet found. Skipping stats.")
        return

    download_file(drive, fid, ASSIGN_PATH)
    df = pd.read_parquet(ASSIGN_PATH)

    if df.empty:
        print("🟡 cluster_assignments empty. Skipping stats.")
        return

    # Normalize
    for c in ["semantic_clusterID", "video_key", "created_at"]:
        if c not in df.columns:
            df[c] = ""
    df["semantic_clusterID"] = df["semantic_clusterID"].astype(str).str.strip()
    df["video_key"] = df["video_key"].astype(str).str.strip()
    df["created_at_ts"] = parse_ts(df["created_at"])

    # Drop invalid rows
    df = df[df["semantic_clusterID"] != ""].copy()
    df = df.dropna(subset=["created_at_ts"]).copy()

    now = datetime.now(timezone.utc)
    w7 = now - timedelta(days=7)
    w30 = now - timedelta(days=30)

    # Cluster aggregates
    g = df.groupby("semantic_clusterID", as_index=False)
    stats = g.agg(
        n_total=("video_key", "count"),
        last_seen=("created_at_ts", "max"),
    )

    # Window counts
    df_7 = df[df["created_at_ts"] >= w7].groupby("semantic_clusterID", as_index=False).agg(n_7d=("video_key", "count"))
    df_30 = df[df["created_at_ts"] >= w30].groupby("semantic_clusterID", as_index=False).agg(n_30d=("video_key", "count"))

    stats = stats.merge(df_7, on="semantic_clusterID", how="left").merge(df_30, on="semantic_clusterID", how="left")
    stats["n_7d"] = stats["n_7d"].fillna(0).astype(int)
    stats["n_30d"] = stats["n_30d"].fillna(0).astype(int)

    # Momentum ratio: compares last 7d intake vs expected weekly from last 30d
    # expected_week = n_30d / 4
    stats["expected_week"] = (stats["n_30d"] / 4.0).replace(0, 0.0)
    stats["momentum_ratio"] = stats.apply(
        lambda r: (r["n_7d"] / max(1.0, r["expected_week"])) if r["expected_week"] > 0 else (r["n_7d"] / 1.0),
        axis=1
    )

    # Momentum_Label (deterministic)
    def momentum_label(r):
        n7 = int(r["n_7d"])
        n30 = int(r["n_30d"])
        mr = float(r["momentum_ratio"])
        if n30 == 0 and n7 == 0:
            return "STALE"
        if n7 >= 10 or mr >= 3.0:
            return "HOT"
        if n7 >= 4 or mr >= 1.8:
            return "WARM"
        if n7 >= 1:
            return "COOL"
        return "STALE"

    stats["Momentum_Label"] = stats.apply(momentum_label, axis=1)

    # ConfidenceBand (size + recent activity)
    def confidence_band(r):
        n = int(r["n_total"])
        n30 = int(r["n_30d"])
        if n >= 30 and n30 >= 8:
            return "HIGH"
        if n >= 10:
            return "MEDIUM"
        return "LOW"

    stats["ConfidenceBand"] = stats.apply(confidence_band, axis=1)

    # OpportunityScore 0..100
    # components: momentum (0..1), size (0..1), confidence multiplier
    def opp_score(r):
        n = int(r["n_total"])
        mr = float(r["momentum_ratio"])
        mom = clamp01(mr / 3.0)                         # 1.0 at mr>=3
        size = clamp01(math.log1p(n) / math.log1p(50))  # 1.0 at ~50+
        base = 100.0 * (0.6 * mom + 0.4 * size)

        cb = r["ConfidenceBand"]
        mult = 1.0 if cb == "HIGH" else (0.85 if cb == "MEDIUM" else 0.7)
        return round(base * mult, 2)

    stats["OpportunityScore"] = stats.apply(opp_score, axis=1)

    # V8_State (simple, deterministic)
    def v8_state(r):
        n = int(r["n_total"])
        m = r["Momentum_Label"]
        if n >= 30 and m in ("WARM", "HOT", "COOL"):
            return "ESTABLISHED"
        if n >= 5 and m in ("WARM", "HOT"):
            return "EMERGING"
        return "WATCHLIST"

    stats["V8_State"] = stats.apply(v8_state, axis=1)

    # Final output
    out = stats[[
        "semantic_clusterID",
        "n_total", "n_7d", "n_30d",
        "momentum_ratio",
        "Momentum_Label",
        "ConfidenceBand",
        "OpportunityScore",
        "V8_State",
        "last_seen",
    ]].copy()

    out["run_ts"] = now.isoformat()
    out.to_parquet(STATS_PATH, index=False)
    upload_or_update(drive, DRIVE_FOLDER_ID, DRIVE_CLUSTER_STATS, STATS_PATH)
    print("✅ cluster_stats uploaded:", len(out), "| file:", DRIVE_CLUSTER_STATS)


if __name__ == "__main__":
    main()
