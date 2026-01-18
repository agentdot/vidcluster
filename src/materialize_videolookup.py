import os
import sys
import pandas as pd
from datetime import datetime, timezone
from typing import Dict, List

# Make sure src imports work when running as module
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.config import SHEET_ID, DRIVE_FOLDER_ID
from src.google_clients import get_gspread_client, get_drive_service
from src.drive_store import find_file_in_folder, download_file, upload_or_update

# -----------------------------
# CONFIG
# -----------------------------
TAB_VIDEOLOOKUP = os.environ.get("TAB_VIDEOLOOKUP", "VideoLookup")

DRIVE_ASSIGNMENTS = os.environ.get("DRIVE_ASSIGNMENTS", "cluster_assignments.parquet")
DRIVE_VIDEO_META = os.environ.get("DRIVE_VIDEO_META", "video_meta.parquet")

ASSIGN_PATH = "/tmp/cluster_assignments.parquet"
META_PATH = "/tmp/video_meta.parquet"

VIDEOLOOKUP_MAX_ROWS = int(os.environ.get("VIDEOLOOKUP_MAX_ROWS", "2000"))  # keep Sheets small
TITLE_FETCH_LIMIT = int(os.environ.get("TITLE_FETCH_LIMIT", "300"))         # per run API guard

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "").strip()

DRIVE_CLUSTER_STATS = os.environ.get("DRIVE_CLUSTER_STATS", "cluster_stats.parquet")
CLUSTER_STATS_PATH = "/tmp/cluster_stats.parquet"


df_stats = load_parquet_from_drive(drive, DRIVE_FOLDER_ID, DRIVE_CLUSTER_STATS, CLUSTER_STATS_PATH)

if not df_stats.empty:
    df_vl = df_vl.merge(
        df_stats[["semantic_clusterID", "V8_State", "OpportunityScore", "Momentum_Label", "ConfidenceBand"]],
        on="semantic_clusterID",
        how="left"
    )
else:
    df_vl["V8_State"] = ""
    df_vl["OpportunityScore"] = ""
    df_vl["Momentum_Label"] = ""
    df_vl["ConfidenceBand"] = ""

def utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_parquet_from_drive(drive, folder_id: str, filename: str, local_path: str) -> pd.DataFrame:
    fid = find_file_in_folder(drive, folder_id, filename)
    if not fid:
        return pd.DataFrame()
    download_file(drive, fid, local_path)
    return pd.read_parquet(local_path)


def save_parquet_to_drive(drive, folder_id: str, filename: str, local_path: str, df: pd.DataFrame):
    df.to_parquet(local_path, index=False)
    upload_or_update(drive, folder_id, filename, local_path)


def get_or_create_worksheet(sh, title: str):
    try:
        return sh.worksheet(title)
    except Exception:
        # Create a new worksheet if missing (safe default size)
        return sh.add_worksheet(title=title, rows=2000, cols=20)


def resize_worksheet(ws, rows: int, cols: int):
    # gspread resize is safe and prevents "range exceeds grid limits" on overwrite
    rows = max(rows, 2)
    cols = max(cols, 1)
    ws.resize(rows=rows, cols=cols)


def write_df_to_sheet(ws, df: pd.DataFrame):
    """
    Overwrite the sheet with df content.
    Keeps sheet small and avoids append-based growth.
    """
    if df is None or df.empty:
        # Write just headers to keep the tab valid
        ws.clear()
        ws.update("A1", [["video_key"]], value_input_option="RAW")
        return

    # Convert to strings to avoid gspread typing weirdness
    out_df = df.copy()
    out_df = out_df.fillna("")
    values = [out_df.columns.tolist()] + out_df.astype(str).values.tolist()

    # Resize sheet grid exactly
    resize_worksheet(ws, rows=len(values) + 5, cols=len(out_df.columns) + 2)

    # Clear + write in one go (fits within limits because we cap rows)
    ws.clear()
    ws.update("A1", values, value_input_option="RAW")


def youtube_titles(video_ids: List[str]) -> Dict[str, str]:
    """
    Fetch titles for a list of video IDs using YouTube Data API.
    Uses TITLE_FETCH_LIMIT guard and batches of 50.
    """
    if not YOUTUBE_API_KEY:
        return {}

    from googleapiclient.discovery import build
    yt = build("youtube", "v3", developerKey=YOUTUBE_API_KEY, cache_discovery=False)

    out: Dict[str, str] = {}
    video_ids = [v for v in video_ids if v]
    video_ids = video_ids[:TITLE_FETCH_LIMIT]

    for i in range(0, len(video_ids), 50):
        batch = video_ids[i:i + 50]
        resp = yt.videos().list(
            part="snippet",
            id=",".join(batch)
        ).execute()

        for item in resp.get("items", []):
            vid = (item.get("id") or "").strip()
            title = ((item.get("snippet") or {}).get("title") or "").strip()
            if vid and title:
                out[vid] = title

    return out


def main():
    print("MATERIALIZE: VideoLookup")
    print("TAB_VIDEOLOOKUP:", TAB_VIDEOLOOKUP)

    drive = get_drive_service()
    gc = get_gspread_client()
    sh = gc.open_by_key(SHEET_ID)
    ws_vl = get_or_create_worksheet(sh, TAB_VIDEOLOOKUP)

    # 1) Load assignments (required)
    df_assign = load_parquet_from_drive(drive, DRIVE_FOLDER_ID, DRIVE_ASSIGNMENTS, ASSIGN_PATH)
    if df_assign.empty:
        print("🟡 No cluster assignments found. Writing empty VideoLookup.")
        write_df_to_sheet(ws_vl, pd.DataFrame(columns=["video_key"]))
        return

    # Normalize expected columns
    expected = [
        "video_key",
        "semantic_clusterID",
        "semantic_cluster_label",
        "embedding_run_id",
        "kmeans_k",
        "created_at",
    ]
    for c in expected:
        if c not in df_assign.columns:
            df_assign[c] = ""

    df_assign["video_key"] = df_assign["video_key"].astype(str).str.strip()
    df_assign["created_at"] = df_assign["created_at"].astype(str)

    # Keep latest assignment per video_key (safety)
    df_assign = df_assign.sort_values("created_at")
    df_assign = df_assign.drop_duplicates(subset=["video_key"], keep="last")

    # 2) Load / update video_meta cache (optional but recommended)
    df_meta = load_parquet_from_drive(drive, DRIVE_FOLDER_ID, DRIVE_VIDEO_META, META_PATH)
    if df_meta.empty:
        df_meta = pd.DataFrame(columns=["video_key", "video_title", "fetched_at"])

    for c in ["video_key", "video_title", "fetched_at"]:
        if c not in df_meta.columns:
            df_meta[c] = ""

    df_meta["video_key"] = df_meta["video_key"].astype(str).str.strip()
    have_titles = set(df_meta[df_meta["video_title"].astype(str).str.strip() != ""]["video_key"].tolist())

    # Find missing titles for recent keys (cap work)
    recent_keys = df_assign.sort_values("created_at", ascending=False)["video_key"].tolist()
    missing = [k for k in recent_keys if k and k not in have_titles]
    missing = missing[:TITLE_FETCH_LIMIT]

    fetched = 0
    if missing:
        titles = youtube_titles(missing)
        if titles:
            add_rows = []
            ts = utc_iso()
            for k, t in titles.items():
                add_rows.append({"video_key": k, "video_title": t, "fetched_at": ts})
            df_meta = pd.concat([df_meta, pd.DataFrame(add_rows)], ignore_index=True)

            # Keep latest meta row per key
            df_meta["fetched_at"] = df_meta["fetched_at"].astype(str)
            df_meta = df_meta.sort_values("fetched_at")
            df_meta = df_meta.drop_duplicates(subset=["video_key"], keep="last")

            save_parquet_to_drive(drive, DRIVE_FOLDER_ID, DRIVE_VIDEO_META, META_PATH, df_meta)
            fetched = len(add_rows)

    print(f"✅ video_meta cached titles fetched this run: {fetched}")

    # Join for titles
    df_join = df_assign.merge(
        df_meta[["video_key", "video_title"]],
        on="video_key",
        how="left"
    )

    # 3) Build VideoLookup (UI table)
    # These are placeholders until Scorecard/Recency/Confidence are materialized into a proper output model.
    df_vl = pd.DataFrame({
        "video_key": df_join["video_key"],
        "video_title": df_join.get("video_title", ""),
        "semantic_clusterID": df_join["semantic_clusterID"],
        "semantic_cluster_label": df_join["semantic_cluster_label"],  # currently AUTO:SCxxx
        "embedding_run_id": df_join["embedding_run_id"],
        "kmeans_k": df_join["kmeans_k"],
        "created_at": df_join["created_at"],
    })

    df_vl = df_vl.merge(
        df_stats[[
            "semantic_clusterID",
            "V8_State",
            "OpportunityScore",
            "Momentum_Label",
            "ConfidenceBand"
        ]],
        on="semantic_clusterID",
        how="left"
    )


    # Sort recent first and cap rows to keep Sheets small
    df_vl = df_vl.sort_values("created_at", ascending=False).head(VIDEOLOOKUP_MAX_ROWS).copy()

    # 4) Write to sheet (overwrite)
    write_df_to_sheet(ws_vl, df_vl)
    print(f"✅ VideoLookup written to Sheets ({TAB_VIDEOLOOKUP}) rows={len(df_vl)} cols={len(df_vl.columns)}")


if __name__ == "__main__":
    main()
