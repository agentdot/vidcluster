import os
import sys
import pandas as pd
from datetime import datetime, timezone
from typing import List, Dict

# Make sure src imports work when running as module
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.config import SHEET_ID, DRIVE_FOLDER_ID
from src.google_clients import get_gspread_client, get_drive_service
from src.drive_store import find_file_in_folder, download_file

# -----------------------------
# CONFIG
# -----------------------------
TAB_CLUSTERLOOKUP = os.environ.get("TAB_CLUSTERLOOKUP", "ClusterLookup")

DRIVE_CLUSTER_STATS = os.environ.get("DRIVE_CLUSTER_STATS", "cluster_stats.parquet")
DRIVE_ASSIGNMENTS = os.environ.get("DRIVE_ASSIGNMENTS", "cluster_assignments.parquet")
DRIVE_VIDEO_META = os.environ.get("DRIVE_VIDEO_META", "video_meta.parquet")

STATS_PATH = "/tmp/cluster_stats.parquet"
ASSIGN_PATH = "/tmp/cluster_assignments.parquet"
META_PATH = "/tmp/video_meta.parquet"

CLUSTERLOOKUP_MAX_ROWS = int(os.environ.get("CLUSTERLOOKUP_MAX_ROWS", "2000"))
SAMPLE_TITLES_N = int(os.environ.get("SAMPLE_TITLES_N", "5"))


def utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_parquet_from_drive(drive, folder_id: str, filename: str, local_path: str) -> pd.DataFrame:
    fid = find_file_in_folder(drive, folder_id, filename)
    if not fid:
        return pd.DataFrame()
    download_file(drive, fid, local_path)
    return pd.read_parquet(local_path)


def get_or_create_worksheet(sh, title: str, rows: int = 2000, cols: int = 20):
    """
    Create worksheet if missing. Keep dimensions SMALL to avoid 10M cell issues.
    """
    try:
        return sh.worksheet(title)
    except Exception:
        # If you're over the 10M cell limit, Google will reject this.
        return sh.add_worksheet(title=title, rows=rows, cols=cols)


def resize_worksheet(ws, rows: int, cols: int):
    rows = max(rows, 2)
    cols = max(cols, 1)
    ws.resize(rows=rows, cols=cols)


def write_df_to_sheet(ws, df: pd.DataFrame):
    """
    Overwrite the sheet with df content.
    Keeps sheet small, deterministic, and avoids append growth.
    """
    if df is None or df.empty:
        ws.clear()
        ws.update("A1", [["semantic_clusterID"]], value_input_option="RAW")
        resize_worksheet(ws, rows=50, cols=10)
        return

    out_df = df.copy().fillna("")
    values = [out_df.columns.tolist()] + out_df.astype(str).values.tolist()

    # Resize grid just slightly bigger than needed
    resize_worksheet(ws, rows=len(values) + 5, cols=len(out_df.columns) + 2)

    ws.clear()
    ws.update("A1", values, value_input_option="RAW")


def make_sample_titles(df_assign: pd.DataFrame, df_meta: pd.DataFrame, n: int) -> pd.DataFrame:
    """
    Returns dataframe with: semantic_clusterID, sample_titles (pipe-separated)
    Uses most recent assignments first.
    """
    if df_assign.empty or df_meta.empty:
        return pd.DataFrame(columns=["semantic_clusterID", "sample_titles"])

    a = df_assign.copy()
    m = df_meta.copy()

    a["video_key"] = a.get("video_key", "").astype(str).str.strip()
    a["semantic_clusterID"] = a.get("semantic_clusterID", "").astype(str).str.strip()
    a["created_at"] = a.get("created_at", "").astype(str)

    m["video_key"] = m.get("video_key", "").astype(str).str.strip()
    m["video_title"] = m.get("video_title", "").astype(str).str.strip()

    # Join titles onto assignments
    j = a.merge(m[["video_key", "video_title"]], on="video_key", how="left")

    # Sort recent first
    j = j.sort_values("created_at", ascending=False)

    # Build sample titles per cluster
    def collect_titles(rows: pd.DataFrame) -> str:
        titles = rows["video_title"].dropna().astype(str)
        titles = [t.strip() for t in titles.tolist() if t.strip()]
        # de-dupe while preserving order
        seen = set()
        uniq = []
        for t in titles:
            if t not in seen:
                seen.add(t)
                uniq.append(t)
            if len(uniq) >= n:
                break
        return " | ".join(uniq)

    out = (
        j.groupby("semantic_clusterID", as_index=False)
         .apply(lambda g: pd.Series({"sample_titles": collect_titles(g)}))
         .reset_index()
    )

    # groupby+apply produces columns: ["index","semantic_clusterID","sample_titles"] sometimes
    if "semantic_clusterID" not in out.columns and "level_1" in out.columns:
        out = out.rename(columns={"level_1": "semantic_clusterID"})
    if "semantic_clusterID" not in out.columns and "index" in out.columns:
        # last resort: try to find the cluster id column
        pass

    out = out[["semantic_clusterID", "sample_titles"]].copy()
    return out


def main():
    print("MATERIALIZE: ClusterLookup")
    print("TAB_CLUSTERLOOKUP:", TAB_CLUSTERLOOKUP)

    drive = get_drive_service()
    gc = get_gspread_client()
    sh = gc.open_by_key(SHEET_ID)

    # Try to create/open sheet (small grid)
    try:
        ws = get_or_create_worksheet(sh, TAB_CLUSTERLOOKUP, rows=2000, cols=20)
    except Exception as e:
        print("❌ Could not create/open ClusterLookup sheet.")
        print("   Likely cause: Google Sheets 10M cell limit.")
        print("   Fix: delete/shrink large legacy tabs, then rerun.")
        print("   Error:", e)
        return

    # Load cluster_stats (required)
    df_stats = load_parquet_from_drive(drive, DRIVE_FOLDER_ID, DRIVE_CLUSTER_STATS, STATS_PATH)
    if df_stats.empty:
        print("🟡 No cluster_stats.parquet found. Writing empty ClusterLookup.")
        write_df_to_sheet(ws, pd.DataFrame(columns=["semantic_clusterID"]))
        return

    # Normalize required stats columns
    required_stats = [
        "semantic_clusterID",
        "V8_State",
        "OpportunityScore",
        "Momentum_Label",
        "ConfidenceBand",
        "n_total", "n_7d", "n_30d",
        "momentum_ratio",
        "last_seen",
        "run_ts",
    ]
    for c in required_stats:
        if c not in df_stats.columns:
            df_stats[c] = ""

    df_stats["semantic_clusterID"] = df_stats["semantic_clusterID"].astype(str).str.strip()

    # Load assignments (optional) for video_count + samples
    df_assign = load_parquet_from_drive(drive, DRIVE_FOLDER_ID, DRIVE_ASSIGNMENTS, ASSIGN_PATH)
    if df_assign.empty:
        df_assign = pd.DataFrame(columns=["semantic_clusterID", "video_key", "created_at"])

    for c in ["semantic_clusterID", "video_key", "created_at"]:
        if c not in df_assign.columns:
            df_assign[c] = ""

    df_assign["semantic_clusterID"] = df_assign["semantic_clusterID"].astype(str).str.strip()
    df_assign["video_key"] = df_assign["video_key"].astype(str).str.strip()

    # video_count per cluster (from assignments)
    df_counts = (
        df_assign[df_assign["semantic_clusterID"] != ""]
        .groupby("semantic_clusterID", as_index=False)
        .agg(video_count=("video_key", "count"))
    )

    # Load meta (optional) for titles
    df_meta = load_parquet_from_drive(drive, DRIVE_FOLDER_ID, DRIVE_VIDEO_META, META_PATH)
    if df_meta.empty:
        df_meta = pd.DataFrame(columns=["video_key", "video_title"])

    if "video_key" not in df_meta.columns:
        df_meta["video_key"] = ""
    if "video_title" not in df_meta.columns:
        df_meta["video_title"] = ""

    df_meta["video_key"] = df_meta["video_key"].astype(str).str.strip()
    df_meta["video_title"] = df_meta["video_title"].astype(str).str.strip()

    df_samples = make_sample_titles(df_assign, df_meta, SAMPLE_TITLES_N)

    # Build ClusterLookup
    df_out = df_stats.merge(df_counts, on="semantic_clusterID", how="left")
    df_out = df_out.merge(df_samples, on="semantic_clusterID", how="left")

    df_out["video_count"] = df_out["video_count"].fillna(0).astype(int)
    if "sample_titles" not in df_out.columns:
        df_out["sample_titles"] = ""
    df_out["sample_titles"] = df_out["sample_titles"].fillna("")

    # Sort: OpportunityScore desc, then n_total desc (safe)
    # (strings sometimes, so coerce)
    def to_num(s):
        return pd.to_numeric(s, errors="coerce")

    df_out["_opp"] = to_num(df_out["OpportunityScore"])
    df_out["_nt"] = to_num(df_out["n_total"])
    df_out = df_out.sort_values(["_opp", "_nt"], ascending=[False, False]).drop(columns=["_opp", "_nt"])

    # Cap rows to keep Sheets small
    df_out = df_out.head(CLUSTERLOOKUP_MAX_ROWS).copy()

    # Column order (human-friendly)
    col_order = [
        "semantic_clusterID",
        "V8_State",
        "OpportunityScore",
        "Momentum_Label",
        "ConfidenceBand",
        "video_count",
        "n_total", "n_7d", "n_30d",
        "momentum_ratio",
        "last_seen",
        "sample_titles",
        "run_ts",
    ]
    for c in col_order:
        if c not in df_out.columns:
            df_out[c] = ""

    df_out = df_out[col_order]

    write_df_to_sheet(ws, df_out)
    print(f"✅ ClusterLookup written to Sheets ({TAB_CLUSTERLOOKUP}) rows={len(df_out)} cols={len(df_out.columns)}")


if __name__ == "__main__":
    main()
