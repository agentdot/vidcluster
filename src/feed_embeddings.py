import os
from datetime import datetime, timedelta, timezone
from typing import List, Dict

import pandas as pd
from googleapiclient.discovery import build

from src.config import SHEET_ID, TAB_QUERYBANK, DRIVE_DISCOVERY_QUEUE
from src.google_clients import get_gspread_client
from src.sheets_io import ws_to_df
from src.drive_store import find_file_in_folder, download_file
from googleapiclient.errors import HttpError


# Guardrails
FEED_DAILY_LIMIT = int(os.getenv("FEED_DAILY_LIMIT", "50"))
PER_QUERY_LIMIT = int(os.getenv("PER_QUERY_LIMIT", "15"))
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "").strip()

QUEUE_PATH = "/tmp/discovery_queue.parquet"

class QuotaExceeded(Exception):
    pass

def _utc_now():
    return datetime.now(timezone.utc)


def _utc_iso():
    return _utc_now().isoformat()


def _to_bool_true(v) -> bool:
    return str(v or "").strip().upper() == "TRUE"


def _parse_int(v, default: int) -> int:
    try:
        return int(float(v))
    except Exception:
        return default


def _map_region_to_region_code(region: str) -> str:
    r = (region or "").strip().upper()
    if r in ("UK", "GB", "GREAT BRITAIN"):
        return "GB"
    if r == "US":
        return "US"
    if len(r) == 2:
        return r
    return ""


def _normalize_order(order: str) -> str:
    allowed = {"date", "rating", "relevance", "title", "videoCount", "viewCount"}
    o = (order or "").strip()
    return o if o in allowed else "relevance"


def _normalize_safe_search(s: str) -> str:
    v = (s or "").strip().lower()
    if v in ("none", "moderate", "strict"):
        return v
    return "none"


def _youtube_client(api_key: str):
    return build("youtube", "v3", developerKey=api_key, cache_discovery=False)


def _search_video_ids(
    yt,
    q: str,
    region_code: str,
    relevance_language: str,
    published_after_days: int,
    order: str,
    safe_search: str,
    max_needed: int
) -> List[str]:
    published_after = (_utc_now() - timedelta(days=published_after_days)).isoformat().replace("+00:00", "Z")
    max_results = min(max_needed, 50)

    req = yt.search().list(
        part="id",
        type="video",
        q=q,
        maxResults=max_results,
        order=order,
        safeSearch=safe_search,
        publishedAfter=published_after,
    )

    # Optional filters (must be set BEFORE execute)
    if region_code:
        req.uri += f"&regionCode={region_code}"
    if relevance_language:
        req.uri += f"&relevanceLanguage={relevance_language}"

    try:
        resp = req.execute()
    except HttpError as e:
        # Quota exceeded -> stop feeder for this run (let embeddings still run)
        if e.resp is not None and getattr(e.resp, "status", None) == 403:
            msg = str(e).lower()
            if "quota" in msg:
                raise QuotaExceeded("YouTube API quota exceeded")
        raise

    out = []
    seen = set()
    for item in resp.get("items", []):
        vid = (((item.get("id") or {}).get("videoId")) or "").strip()
        if not vid or vid in seen:
            continue
        seen.add(vid)
        out.append(vid)
        if len(out) >= max_needed:
            break
    return out


def _fetch_titles(yt, video_ids: List[str]) -> Dict[str, str]:
    out: Dict[str, str] = {}
    if not video_ids:
        return out

    for i in range(0, len(video_ids), 50):
        batch = video_ids[i:i+50]
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


def load_queue_from_drive(drive, folder_id: str) -> pd.DataFrame:
    qid = find_file_in_folder(drive, folder_id, DRIVE_DISCOVERY_QUEUE)
    if not qid:
        return pd.DataFrame(columns=["video_key", "video_title", "query_id", "discovered_at"])

    download_file(drive, qid, QUEUE_PATH)
    df = pd.read_parquet(QUEUE_PATH)

    # normalize schema
    for c in ["video_key", "video_title", "query_id", "discovered_at"]:
        if c not in df.columns:
            df[c] = ""
    df["video_key"] = df["video_key"].astype(str).str.strip()
    return df


def save_queue_to_drive(drive, folder_id: str, upload_or_update_fn, df_queue: pd.DataFrame):
    df_queue.to_parquet(QUEUE_PATH, index=False)
    upload_or_update_fn(drive, folder_id, DRIVE_DISCOVERY_QUEUE, QUEUE_PATH)


def stage_discovery_queue_daily(
    drive,
    folder_id: str,
    upload_or_update_fn,
    existing_store_keys: set
) -> int:
    """
    Reads QueryBank (Sheets), discovers videos (YouTube API), appends to discovery_queue.parquet (Drive).

    Dedupes against:
    - embeddings_store.video_key
    - discovery_queue.video_key
    """
    if not YOUTUBE_API_KEY:
        print("🟡 Feeder: YOUTUBE_API_KEY not set. Skipping discovery staging.")
        return 0

    gc = get_gspread_client()
    sh = gc.open_by_key(SHEET_ID)
    ws_qb = sh.worksheet(TAB_QUERYBANK)

    df_qb = ws_to_df(ws_qb)
    if df_qb.empty:
        print("🟡 Feeder: QueryBank empty.")
        return 0

    # Ensure expected columns exist
    needed_cols = ["query_id", "query_text", "region", "language", "published_after_days",
                   "max_results", "order", "safe_search", "active", "priority"]
    for c in needed_cols:
        if c not in df_qb.columns:
            df_qb[c] = ""

    df_qb["active"] = df_qb["active"].apply(_to_bool_true)
    active = df_qb[df_qb["active"] == True].copy()
    if active.empty:
        print("🟡 Feeder: No ACTIVE queries.")
        return 0

    # Priority sort
    if "priority" in active.columns:
        active["priority_num"] = active["priority"].apply(lambda x: _parse_int(x, 0))
        active = active.sort_values(["priority_num"], ascending=False)

    df_queue = load_queue_from_drive(drive, folder_id)
    queue_keys = set(df_queue["video_key"].fillna("").astype(str).str.strip())

    yt = _youtube_client(YOUTUBE_API_KEY)

    staged_rows = []
    staged_count = 0

    for _, r in active.iterrows():
        if staged_count >= FEED_DAILY_LIMIT:
            break

        query_id = str(r.get("query_id") or "").strip()
        query_text = str(r.get("query_text") or "").strip()
        if not query_text:
            continue

        region_code = _map_region_to_region_code(r.get("region"))
        language = str(r.get("language") or "").strip().lower()
        relevance_language = language if len(language) == 2 else ""

        published_after_days = _parse_int(r.get("published_after_days"), 365)
        max_results_cfg = _parse_int(r.get("max_results"), PER_QUERY_LIMIT)
        per_query = min(PER_QUERY_LIMIT, max_results_cfg, FEED_DAILY_LIMIT - staged_count)
        if per_query <= 0:
            continue

        order = _normalize_order(r.get("order"))
        safe_search = _normalize_safe_search(r.get("safe_search"))

        # Discover
        try:
            video_ids = _search_video_ids(
                yt=yt,
                q=query_text,
                region_code=region_code,
                relevance_language=relevance_language,
                published_after_days=published_after_days,
                order=order,
                safe_search=safe_search,
                max_needed=per_query
            )
        except QuotaExceeded as qe:
            print(f"🟡 Feeder stopped: {qe}")
            break

        # Dedupe
        video_ids = [vid for vid in video_ids if vid not in existing_store_keys and vid not in queue_keys]
        if not video_ids:
            continue

        titles = _fetch_titles(yt, video_ids)

        for vid in video_ids:
            title = titles.get(vid, "").strip()
            if not title:
                continue

            staged_rows.append({
                "video_key": vid,
                "video_title": title,
                "query_id": query_id,
                "discovered_at": _utc_iso()
            })
            queue_keys.add(vid)
            staged_count += 1

            if staged_count >= FEED_DAILY_LIMIT:
                break

    if staged_count == 0:
        print("🟢 Feeder: 0 new videos staged (deduped or no results).")
        return 0

    df_queue = pd.concat([df_queue, pd.DataFrame(staged_rows)], ignore_index=True)
    save_queue_to_drive(drive, folder_id, upload_or_update_fn, df_queue)
    print(f"✅ Feeder staged {staged_count} new items into {DRIVE_DISCOVERY_QUEUE} (Drive).")
    return staged_count
