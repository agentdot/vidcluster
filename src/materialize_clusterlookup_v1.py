import os
import re
import math
import sys
import pandas as pd
from datetime import datetime, timezone
from typing import Dict, List, Tuple

# Make sure src imports work when running as module
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.config import SHEET_ID, DRIVE_FOLDER_ID
from src.google_clients import get_gspread_client, get_drive_service
from src.drive_store import find_file_in_folder, download_file, upload_or_update

# -----------------------------
# CONFIG
# -----------------------------
TAB_CLUSTERLOOKUP = os.environ.get("TAB_CLUSTERLOOKUP", "ClusterLookup")

DRIVE_CLUSTER_STATS = os.environ.get("DRIVE_CLUSTER_STATS", "cluster_stats.parquet")
DRIVE_ASSIGNMENTS = os.environ.get("DRIVE_ASSIGNMENTS", "cluster_assignments.parquet")
DRIVE_VIDEO_META = os.environ.get("DRIVE_VIDEO_META", "video_meta.parquet")

DRIVE_CLUSTER_LOOKUP = os.environ.get("DRIVE_CLUSTER_LOOKUP", "cluster_lookup.parquet")

STATS_PATH = "/tmp/cluster_stats.parquet"
ASSIGN_PATH = "/tmp/cluster_assignments.parquet"
META_PATH = "/tmp/video_meta.parquet"
OUT_PATH = "/tmp/cluster_lookup.parquet"

CLUSTERLOOKUP_MAX_ROWS = int(os.environ.get("CLUSTERLOOKUP_MAX_ROWS", "5000"))
REP_TITLES_N = int(os.environ.get("REP_TITLES_N", "5"))
TITLE_POOL_N = int(os.environ.get("TITLE_POOL_N", "50"))

TAB_CLUSTERLOOKUP = "ClusterLookup"
DRIVE_CLUSTER_LOOKUP = "cluster_lookup.parquet"


# Simple stopwords for deterministic title extraction
STOPWORDS = {
    "the","a","an","and","or","to","of","in","on","for","with","at","by","from","is","are","was","were",
    "how","what","why","when","where","who","this","that","these","those","you","your","i","my","we","our",
    "it","its","as","be","can","will","just","vs","new","best","top","2024","2025","2026"
}

TOKEN_RE = re.compile(r"[A-Za-z0-9]+")


def utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def parse_ts(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series, errors="coerce", utc=True)


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
        return sh.add_worksheet(title=title, rows=2000, cols=25)


def resize_worksheet(ws, rows: int, cols: int):
    rows = max(rows, 2)
    cols = max(cols, 1)
    ws.resize(rows=rows, cols=cols)


def write_df_to_sheet(ws, df: pd.DataFrame):
    """
    Overwrite sheet safely (resizes grid first, then clears, then writes).
    """
    if df is None or df.empty:
        ws.clear()
        ws.update("A1", [["semantic_clusterID"]], value_input_option="RAW")
        return

    out_df = df.copy().fillna("")
    values = [out_df.columns.tolist()] + out_df.astype(str).values.tolist()

    # Resize BEFORE writing to prevent "exceeds grid limits"
    resize_worksheet(ws, rows=len(values) + 5, cols=len(out_df.columns) + 2)

    ws.clear()
    ws.update("A1", values, value_input_option="RAW")


def _tokenize(text: str) -> List[str]:
    tokens = [t.lower() for t in TOKEN_RE.findall(text or "")]
    tokens = [t for t in tokens if t and t not in STOPWORDS and len(t) >= 3]
    return tokens


def _top_phrases(titles: List[str]) -> Tuple[str, str]:
    """
    Deterministic phrase extraction:
    - count unigrams and bigrams across titles
    - return (best_bigram, best_unigram)
    """
    unigram = {}
    bigram = {}

    for title in titles:
        toks = _tokenize(title)
        for t in toks:
            unigram[t] = unigram.get(t, 0) + 1
        for i in range(len(toks) - 1):
            b = f"{toks[i]} {toks[i+1]}"
            bigram[b] = bigram.get(b, 0) + 1

    best_bigram = ""
    best_unigram = ""

    if bigram:
        best_bigram = sorted(bigram.items(), key=lambda x: (-x[1], x[0]))[0][0]
    if unigram:
        best_unigram = sorted(unigram.items(), key=lambda x: (-x[1], x[0]))[0][0]

    return best_bigram.strip(), best_unigram.strip()


def _make_cluster_title(rep_titles: List[str]) -> str:
    """
    Build a short, human-ish title from representative titles.
    No LLM, no hallucinations.
    """
    rep_titles = [t.strip() for t in rep_titles if str(t or "").strip()]
    if not rep_titles:
        return ""

    b, u = _top_phrases(rep_titles)
    if b and u and u not in b:
        title = f"{b} / {u}"
    elif b:
        title = b
    elif u:
        title = u
    else:
        # fallback: first title trimmed
        title = rep_titles[0]

    title = title.strip()
    # small cleanup
    title = re.sub(r"\s+", " ", title)
    return title[:80]


def _action_and_why(v8_state: str, momentum: str, conf: str, n7: int, n30: int, score: float) -> Tuple[str, str]:
    v8_state = (v8_state or "").strip().upper()
    momentum = (momentum or "").strip().upper()
    conf = (conf or "").strip().upper()

    # Action
    if v8_state == "ESTABLISHED" and conf == "HIGH":
        action = "Scale production"
    elif v8_state == "ESTABLISHED":
        action = "Maintain cadence"
    elif v8_state == "EMERGING" and momentum in ("HOT", "WARM"):
        action = "Test 1–2 videos"
    elif v8_state == "WATCHLIST" and momentum in ("WARM", "COOL"):
        action = "Monitor & collect more data"
    else:
        action = "Ignore for now"

    # Why (short)
    why = f"{momentum} momentum; {conf} confidence; 7d={n7} 30d={n30}; score={round(float(score or 0.0), 1)}"
    return action, why


def main():
    print("MATERIALIZE: ClusterLookup")
    print("TAB_CLUSTERLOOKUP:", TAB_CLUSTERLOOKUP)

    drive = get_drive_service()
    gc = get_gspread_client()
    sh = gc.open_by_key(SHEET_ID)
    ws = get_or_create_worksheet(sh, TAB_CLUSTERLOOKUP)

    # Load required parquet artifacts
    df_stats = load_parquet_from_drive(drive, DRIVE_FOLDER_ID, DRIVE_CLUSTER_STATS, STATS_PATH)
    df_assign = load_parquet_from_drive(drive, DRIVE_FOLDER_ID, DRIVE_ASSIGNMENTS, ASSIGN_PATH)
    df_meta = load_parquet_from_drive(drive, DRIVE_FOLDER_ID, DRIVE_VIDEO_META, META_PATH)

    if df_stats.empty:
        print("🟡 No cluster_stats.parquet found. Writing empty ClusterLookup.")
        write_df_to_sheet(ws, pd.DataFrame(columns=["semantic_clusterID"]))
        return

    # Normalize stats schema
    for c in [
        "semantic_clusterID", "n_total", "n_7d", "n_30d", "last_seen",
        "momentum_ratio", "Momentum_Label", "ConfidenceBand",
        "OpportunityScore", "V8_State", "run_ts"
    ]:
        if c not in df_stats.columns:
            df_stats[c] = ""

    df_stats["semantic_clusterID"] = df_stats["semantic_clusterID"].astype(str).str.strip()

    # Prepare assignment -> titles mapping
    # (Assignments may be empty early; handle gracefully)
    rep_titles_map: Dict[str, List[str]] = {}

    if not df_assign.empty:
        for c in ["semantic_clusterID", "video_key", "created_at"]:
            if c not in df_assign.columns:
                df_assign[c] = ""
        df_assign["semantic_clusterID"] = df_assign["semantic_clusterID"].astype(str).str.strip()
        df_assign["video_key"] = df_assign["video_key"].astype(str).str.strip()
        df_assign["created_at_ts"] = parse_ts(df_assign["created_at"])
        df_assign = df_assign.dropna(subset=["created_at_ts"]).copy()

        # Join titles from meta if available
        if df_meta.empty:
            df_assign["video_title"] = ""
        else:
            for c in ["video_key", "video_title"]:
                if c not in df_meta.columns:
                    df_meta[c] = ""
            df_meta["video_key"] = df_meta["video_key"].astype(str).str.strip()
            df_meta["video_title"] = df_meta["video_title"].astype(str)
            df_assign = df_assign.merge(
                df_meta[["video_key", "video_title"]],
                on="video_key",
                how="left"
            )

        # For each cluster: take recent TITLE_POOL_N titles, then select REP_TITLES_N distinct
        df_assign = df_assign.sort_values("created_at_ts", ascending=False)

        for scid, sub in df_assign.groupby("semantic_clusterID"):
            titles = sub["video_title"].fillna("").astype(str).tolist()
            titles = [t.strip() for t in titles if t.strip()]
            titles = titles[:TITLE_POOL_N]

            # distinct-preserving
            seen = set()
            rep = []
            for t in titles:
                if t in seen:
                    continue
                seen.add(t)
                rep.append(t)
                if len(rep) >= REP_TITLES_N:
                    break
            rep_titles_map[scid] = rep

    # Build ClusterLookup rows
    rows = []
    run_id = os.getenv("GITHUB_SHA", "")[:8]  # short trace (optional)
    run_date = datetime.now(timezone.utc).date().isoformat()

    for _, r in df_stats.iterrows():
        scid = str(r.get("semantic_clusterID") or "").strip()
        if not scid:
            continue

        rep_titles = rep_titles_map.get(scid, [])
        rep_join = " | ".join(rep_titles) if rep_titles else ""

        cluster_title = _make_cluster_title(rep_titles) if rep_titles else ""
        topic_human = ""  # placeholder for future manual override layer
        title_source = "AUTO_TITLES"

        n_total = int(r.get("n_total") or 0)
        n7 = int(r.get("n_7d") or 0)
        n30 = int(r.get("n_30d") or 0)

        momentum_ratio = r.get("momentum_ratio")
        momentum_label = str(r.get("Momentum_Label") or "").strip()
        conf_band = str(r.get("ConfidenceBand") or "").strip()
        opp = float(r.get("OpportunityScore") or 0.0)
        v8 = str(r.get("V8_State") or "").strip()
        last_seen = str(r.get("last_seen") or "").strip()
        run_ts = str(r.get("run_ts") or "").strip()

        action, why = _action_and_why(v8, momentum_label, conf_band, n7, n30, opp)

        rows.append({
            "semantic_clusterID": scid,
            "Cluster_Title": cluster_title,
            "Topic_Human": topic_human,
            "Title_Source": title_source,
            "Representative_Titles": rep_join,

            "n_total": n_total,
            "n_7d": n7,
            "n_30d": n30,
            "last_seen": last_seen,

            "momentum_ratio": momentum_ratio,
            "Momentum_Label": momentum_label,
            "ConfidenceBand": conf_band,
            "OpportunityScore": opp,
            "V8_State": v8,

            # rank later
            "Rank_Opportunity": None,
            "Action": action,
            "Why_Short": why,

            "run_id": run_id,
            "run_date": run_date,
            "run_ts": run_ts,
        })

    df_out = pd.DataFrame(rows)

    if df_out.empty:
        print("🟡 No clusters to write. Writing empty ClusterLookup.")
        write_df_to_sheet(ws, pd.DataFrame(columns=["semantic_clusterID"]))
        return

    # Rank opportunity: 1 = highest
    df_out = df_out.sort_values("OpportunityScore", ascending=False).copy()
    df_out["Rank_Opportunity"] = df_out["OpportunityScore"].rank(method="dense", ascending=False).astype(int)

    # Cap (keep Sheets small)
    df_out = df_out.head(CLUSTERLOOKUP_MAX_ROWS).copy()

    # Enforce canonical column order
    col_order = [
        "semantic_clusterID",
        "Cluster_Title",
        "Topic_Human",
        "Title_Source",
        "Representative_Titles",
        "n_total",
        "n_7d",
        "n_30d",
        "last_seen",
        "momentum_ratio",
        "Momentum_Label",
        "ConfidenceBand",
        "OpportunityScore",
        "V8_State",
        "Rank_Opportunity",
        "Action",
        "Why_Short",
        "run_id",
        "run_date",
        "run_ts",
    ]
    for c in col_order:
        if c not in df_out.columns:
            df_out[c] = ""
    df_out = df_out[col_order].copy()

    # Save parquet + write to sheet
    save_parquet_to_drive(drive, DRIVE_FOLDER_ID, DRIVE_CLUSTER_LOOKUP, OUT_PATH, df_out)
    print(f"✅ cluster_lookup uploaded: {len(df_out)} | file: {DRIVE_CLUSTER_LOOKUP}")

    write_df_to_sheet(ws, df_out)
    print(f"✅ ClusterLookup written to Sheets ({TAB_CLUSTERLOOKUP}) rows={len(df_out)} cols={len(df_out.columns)}")


if __name__ == "__main__":
    main()
