import os
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Tuple

import pandas as pd
from googleapiclient.discovery import build

from src.config import SHEET_ID, TAB_EMB
from src.google_clients import get_gspread_client
from src.sheets_io import ws_to_df, append_rows_chunked


# ---------- Guardrails (SaaS-safe defaults) ----------
FEED_DAILY_LIMIT = int(os.getenv("FEED_DAILY_LIMIT", "50"))       # total new videos/day
PER_QUERY_LIMIT  = int(os.getenv("PER_QUERY_LIMIT", "15"))        # max per QueryBank row/day
YOUTUBE_API_KEY  = os.getenv("YOUTUBE_API_KEY", "").strip()

# YouTube API constraints
SEARCH_PAGE_MAX = 50  # maxResults per YouTube search.list request


def _utc_now():
    return datetime.now(timezone.utc)


def _to_bool_true(v) -> bool:
    return str(v or "").strip().upper() == "TRUE"


def _map_region_to_region_code(region: str) -> str:
    # QueryBank "region" may be US/UK. YouTube expects regionCode like US/GB.
    r = (region or "").strip().upper()
    if r in ("UK", "GB", "GREAT BRITAIN"):
        return "GB"
    if len(r) == 2:
        return r
    return ""  # empty means no region filter


def _normalize_order(order: str) -> str:
    # YouTube supports: date, rating, relevance, title, videoCount, viewCount
    o = (order or "").strip()
    allowed = {"date", "rating", "relevance", "title", "videoCount", "viewCount"}
    return o if o in allowed else "relevance"


def _normalize_safe_search(s: str) -> str:
    # YouTube safeSearch: none, moderate, strict
    v = (s or "").strip().lower()
    if v in ("none", "moderate", "strict"):
        return v
    return "none"


def _parse_int(v, default: int) -> int:
    try:
        return int(float(v))
    except Exception:
        return default


def _youtube_client(api_key: str):
    # cache_discovery=False avoids intermittent caching issues in CI
    return build("youtube", "v3", developerKey=api_key, cache_discovery=False)


def _search_videos(
    yt,
    q: str,
    region_code: str,
    relevance_language: str,
    published_after_days: int,
    order: str,
    safe_search: str,
    max_needed: int,
) -> List[str]:
    """
    Returns up to max_needed videoIds using search.list, deduped.
    """
    video_ids: List[str] = []
    seen = set()

    published_after = (_utc_now() - timedelta(days=published_after_days)).isoformat().replace("+00:00", "Z")

    # Single page is enough for our per-query limits; keep it simple + quota-safe.
    request_max = min(max_needed, SEARCH_PAGE_MAX)

    req = yt.search().list(
        part="id",
        type="video",
        q=q,
        maxResults=request_max,
        order=order,
        safeSearch=safe_search,
        publishedAfter=published_after,
    )

    # Optional filters
    if region_code:
        req.uri += f"&regionCode={region_code}"
    if relevance_language:
        # relevanceLanguage expects ISO 639-1 (e.g., en)
        req.uri += f"&relevanceLanguage={relevance_language}"

    resp = req.execute()

    for item in resp.get("items", []):
        vid = (((item.get("id") or {}).get("videoId")) or "").strip()
        if not vid:
            continue
        if vid in seen:
            continue
        seen.add(vid)
        video_ids.append(vid)
        if len(video_ids) >= max_needed:
            break

    return video_ids


def _fetch_titles(yt, video_ids: List[str]) -> Dict[str, str]:
    """
    Fetch titles via videos.list in batches of 50.
    Returns dict: videoId -> title
    """
    out: Dict[str, str] = {}
    if not video_ids:
        return out

    for i in range(0, len(video_ids), 50):
        batch = video_ids[i:i+50]
        resp = yt.videos().list(
            part="snippet",
            id=",".join(batch),
            maxResults=len(batch),
        ).execute()

        for item in resp.get("items", []):
            vid = (item.get("id") or "").strip()
            title = ((item.get("snippet") or {}).get("title") or "").strip()
            if vid and title:
                out[vid] = title

    return out


def feed_embeddings_daily() -> int:
    """
    YouTube API feeder:
    - Reads QueryBank
    - Filters active == TRUE
    - Pulls videoIds + titles via YouTube Data API v3
    - Appends NEW rows into Embeddings_V2_UNIQUE with status blank (PENDING)
    - Keeps Embeddings_V2_UNIQUE format A→G unchanged
    """
    if not YOUTUBE_API_KEY:
        print("🟡 Feeder: YOUTUBE_API_KEY not set. Skipping YouTube discovery.")
        return 0

    gc = get_gspread_client()
    sh = gc.open_by_key(SHEET_ID)

    ws_qb = sh.worksheet("QueryBank")
    ws_emb = sh.worksheet(TAB_EMB)

    df_qb = ws_to_df(ws_qb)
    df_emb = ws_to_df(ws_emb)

    if df_qb.empty:
        print("🟡 Feeder: QueryBank is empty.")
        return 0

    # Ensure your expected columns exist (non-fatal)
    expected_cols = [
        "query_id", "query_text", "region", "language",
        "published_after_days", "max_results", "order", "safe_search",
        "active", "priority"
    ]
    for c in expected_cols:
        if c not in df_qb.columns:
            df_qb[c] = ""

    # Active only
    df_qb["active"] = df_qb["active"].apply(_to_bool_true)
    active = df_qb[df_qb["active"] == True].copy()

    if active.empty:
        print("🟡 Feeder: No ACTIVE queries found in QueryBank.")
        return 0

    # Sort by priority (highest first) if present
    if "priority" in active.columns:
        active["priority_num"] = active["priority"].apply(lambda x: _parse_int(x, 0))
        active = active.sort_values(["priority_num"], ascending=False)

    # Dedupe set from Embeddings tab
    existing_keys = set()
    if not df_emb.empty and "video_key" in df_emb.columns:
        existing_keys = set(df_emb["video_key"].fillna("").astype(str).str.strip())

    yt = _youtube_client(YOUTUBE_API_KEY)

    rows_to_append: List[List[str]] = []
    total_added = 0

    for _, row in active.iterrows():
        if total_added >= FEED_DAILY_LIMIT:
            break

        query_id = str(row.get("query_id") or "").strip()
        query_text = str(row.get("query_text") or "").strip()
        if not query_text:
            continue

        region_code = _map_region_to_region_code(row.get("region"))
        language = str(row.get("language") or "").strip().lower()
        # Only pass relevanceLanguage if it looks like "en"
        relevance_language = language if len(language) == 2 else ""

        published_after_days = _parse_int(row.get("published_after_days"), 365)
        max_results_cfg = _parse_int(row.get("max_results"), PER_QUERY_LIMIT)
        per_query = min(PER_QUERY_LIMIT, max_results_cfg, FEED_DAILY_LIMIT - total_added)
        if per_query <= 0:
            continue

        order = _normalize_order(row.get("order"))
        safe_search = _normalize_safe_search(row.get("safe_search"))

        # Discover videoIds
        video_ids = _search_videos(
            yt=yt,
            q=query_text,
            region_code=region_code,
            relevance_language=relevance_language,
            published_after_days=published_after_days,
            order=order,
            safe_search=safe_search,
            max_needed=per_query,
        )

        # Remove already staged/embedded keys
        video_ids = [vid for vid in video_ids if vid not in existing_keys]
        if not video_ids:
            continue

        # Fetch titles
        titles = _fetch_titles(yt, video_ids)

        # Append rows in EXACT Embeddings_V2_UNIQUE format A→G:
        # video_key | video title | embedding_model | embedding_run_id | kmeans_k | created_at | status
        for vid in video_ids:
            title = titles.get(vid, "").strip()
            if not title:
                continue

            if vid in existing_keys:
                continue

            rows_to_append.append([vid, title, "", "", "", "", ""])
            existing_keys.add(vid)
            total_added += 1

            if total_added >= FEED_DAILY_LIMIT:
                break

    if not rows_to_append:
        print("🟢 Feeder: 0 new videos staged (all deduped / no results).")
        return 0

    append_rows_chunked(ws_emb, rows_to_append, chunk=120, sleep_s=2.0)
    print(f"✅ Feeder appended {len(rows_to_append)} new PENDING rows to Embeddings_V2_UNIQUE (YouTube API).")
    return len(rows_to_append)
