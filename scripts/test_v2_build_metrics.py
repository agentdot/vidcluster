import argparse, json, math
from datetime import datetime, timezone
import pandas as pd

# -------- helpers --------
def parse_iso(s: str) -> datetime:
    return datetime.fromisoformat(s.replace("Z", "+00:00"))

def views_per_day(view_count: int, published_at: datetime, window_end: datetime) -> float:
    days = max(1.0, (window_end - published_at).total_seconds() / 86400.0)
    return float(view_count) / days

def compute_metrics(df_vids: pd.DataFrame, window_end: datetime, top_n: int):
    # df_vids: columns required: video_id, channel_id, published_at, view_count
    videos_jf = int(len(df_vids))
    channels_jf = int(df_vids["channel_id"].nunique())

    if videos_jf == 0:
        return videos_jf, channels_jf, 0.0

    vpd = df_vids.apply(
        lambda r: views_per_day(int(r["view_count"]), r["published_at"], window_end),
        axis=1
    )
    df_vids = df_vids.copy()
    df_vids["vpd"] = vpd
    df_top = df_vids.sort_values("vpd", ascending=False).head(top_n)

    median_vpd = float(df_top["vpd"].median()) if len(df_top) else 0.0
    return videos_jf, channels_jf, median_vpd

# -------- main --------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    cfg = json.load(open(args.config, "r", encoding="utf-8"))

    topics = pd.read_csv(cfg["topic_source_csv"])
    topics = topics[[cfg["vertical_field"], cfg["topic_field"]]].dropna()
    topics = topics.drop_duplicates()

    date_start = parse_iso(cfg["date_start"])
    date_end = parse_iso(cfg["date_end"])
    window_end = date_end
    top_n = int(cfg["metrics_top_n_vpd"])

    out_rows = []

    # TODO: Replace this import with YOUR existing V8 YouTube retrieval function
    # from src.youtube_fetch import fetch_videos_for_topic
    #
    # fetch_videos_for_topic(topic_query: str, date_start: datetime, date_end: datetime,
    #                        max_results: int, language: str, order: str) -> pd.DataFrame
    #
    # It must return columns: video_id, channel_id, published_at (datetime), view_count (int)

    for _, row in topics.iterrows():
        vertical = str(row[cfg["vertical_field"]])
        topic = str(row[cfg["topic_field"]])

        # --- placeholder: you MUST wire this to your V8 pipeline ---
        df_vids = pd.DataFrame(columns=["video_id", "channel_id", "published_at", "view_count"])

        # Ensure types even if empty
        if "published_at" in df_vids.columns and len(df_vids):
            df_vids["published_at"] = pd.to_datetime(df_vids["published_at"], utc=True)

        videos_jf, channels_jf, median_vpd = compute_metrics(df_vids, window_end, top_n)

        out_rows.append({
            "vertical": vertical,
            "candidate_topic_norm": topic,
            "videos_jf": videos_jf,
            "channels_jf": channels_jf,
            "median_vpd_jf": round(median_vpd, 6),
            "stratum": ""  # assigned in next step
        })

    out_df = pd.DataFrame(out_rows)
    out_df.to_csv(args.out, index=False)

if __name__ == "__main__":
    main()
