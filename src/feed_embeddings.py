from datetime import datetime, timezone
import pandas as pd

from src.config import SHEET_ID, TAB_EMB
from src.google_clients import get_gspread_client
from src.sheets_io import ws_to_df, append_rows_chunked

# Hard safety limits (SaaS guardrails)
FEED_DAILY_LIMIT = 50   # total rows/day across all queries
PER_QUERY_LIMIT = 10    # max rows per query per run


def utc_iso():
    return datetime.now(timezone.utc).isoformat()


def normalize(s):
    return str(s or "").strip()


def feed_embeddings_daily():
    """
    V8-safe feeder:
    - Reads QueryBank
    - Uses ACTIVE queries only
    - Appends NEW rows into Embeddings_V2_UNIQUE
    - Leaves status BLANK (PENDING by definition)
    """

    gc = get_gspread_client()
    sh = gc.open_by_key(SHEET_ID)

    ws_qb = sh.worksheet("QueryBank")
    ws_emb = sh.worksheet(TAB_EMB)

    df_qb = ws_to_df(ws_qb)
    df_emb = ws_to_df(ws_emb)

    if df_qb.empty:
        print("🟡 QueryBank is empty.")
        return 0

    # Normalize column names defensively
    for col in df_qb.columns:
        df_qb[col] = df_qb[col]

    # Ensure expected columns exist
    required = ["query_id", "query_text", "active"]
    for c in required:
        if c not in df_qb.columns:
            df_qb[c] = ""

    # Active queries only
    df_qb["active"] = df_qb["active"].astype(str).str.upper().str.strip()
    active_queries = df_qb[df_qb["active"] == "TRUE"].copy()

    if active_queries.empty:
        print("🟡 No ACTIVE queries found in QueryBank.")
        return 0

    # Existing video_keys (dedupe)
    existing_keys = set()
    if not df_emb.empty and "video_key" in df_emb.columns:
        existing_keys = set(
            df_emb["video_key"].fillna("").astype(str).str.strip()
        )

    rows_to_append = []
    now = utc_iso()

    # ---- PLACEHOLDER DISCOVERY (safe scaffold) ----
    # This WILL be replaced with real YouTube API calls next.
    for _, q in active_queries.iterrows():
        if len(rows_to_append) >= FEED_DAILY_LIMIT:
            break

        query_id = normalize(q.get("query_id"))
        query_text = normalize(q.get("query_text"))

        if not query_text:
            continue

        for i in range(PER_QUERY_LIMIT):
            if len(rows_to_append) >= FEED_DAILY_LIMIT:
                break

            # Deterministic placeholder key (dedupes cleanly)
            video_key = f"QB::{query_id}::{i}"

            if video_key in existing_keys:
                continue

            rows_to_append.append([
                video_key,        # video_key
                query_text,       # video title (placeholder)
                "",               # embedding_model
                "",               # embedding_run_id
                "",               # kmeans_k
                "",               # created_at
                ""                # status (BLANK = PENDING)
            ])

            existing_keys.add(video_key)

    if not rows_to_append:
        print("🟢 Feeder produced 0 new rows (all deduped).")
        return 0

    append_rows_chunked(ws_emb, rows_to_append, chunk=100, sleep_s=2.0)
    print(f"✅ Feeder appended {len(rows_to_append)} new PENDING rows to Embeddings_V2_UNIQUE.")

    return len(rows_to_append)
