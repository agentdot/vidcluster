import time
import sys, os
import pandas as pd
from datetime import datetime, timezone

# Make sure src imports work when running as module
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.config import (
    SHEET_ID, DRIVE_FOLDER_ID, DRIVE_SNAPSHOTS_FOLDER_ID, OPENAI_API_KEY,
    TAB_ASSIGN, TAB_SCORECARD,
    EMBED_MODEL, KMEANS_K,
    DRIVE_EMB_STORE, DRIVE_CENTROIDS,
    DRIVE_ASSIGNMENTS
)

from src.google_clients import get_gspread_client, get_drive_service
from src.drive_store import find_file_in_folder, download_file, upload_or_update
from src.sheets_io import ws_to_df  # no more append_rows_chunked for assignments
from src.embeddings import embed_texts
from src.clustering import fit_centroids, assign_to_centroids

from src.feed_embeddings import stage_discovery_queue_daily, load_queue_from_drive, save_queue_to_drive


EMB_STORE_PATH = "/tmp/embeddings_store.parquet"
CENTROIDS_PATH = "/tmp/kmeans_centroids.parquet"
ASSIGN_PATH = "/tmp/cluster_assignments.parquet"
SCORE_SNAP_PATH = "/tmp/scorecard_snapshot.parquet"

EMBED_DAILY_LIMIT = int(os.getenv("EMBED_DAILY_LIMIT", "50"))


def now_run_id():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%SZ")


def main():
    RUN_ID = now_run_id()
    print("RUN_ID:", RUN_ID)
    print("RUN_DAILY_PATH:", __file__)
    print("GIT_SHA:", os.getenv("GITHUB_SHA"))

    gc = get_gspread_client()
    sh = gc.open_by_key(SHEET_ID)

    # Keep worksheet handles only for Scorecard (and TAB_ASSIGN remains UI-only now)
    ws_score = sh.worksheet(TAB_SCORECARD)

    drive = get_drive_service()

    # Debug: list automation-data folder contents (keep until fully stable)
    print("DEBUG: DRIVE_FOLDER_ID =", DRIVE_FOLDER_ID)
    try:
        resp = drive.files().list(
            q=f"'{DRIVE_FOLDER_ID}' in parents and trashed=false",
            supportsAllDrives=True,
            includeItemsFromAllDrives=True,
            fields="files(id,name,size,modifiedTime)"
        ).execute()
        files = resp.get("files", [])
        print(f"DEBUG: files in automation-data ({len(files)}):")
        for f in files[:50]:
            print(" -", f.get("name"), "|", f.get("id"))
    except Exception as e:
        print("DEBUG: folder list failed:", e)

    # --- Load embeddings_store (Drive Parquet) ---
    emb_file_id = find_file_in_folder(drive, DRIVE_FOLDER_ID, DRIVE_EMB_STORE)
    if emb_file_id:
        download_file(drive, emb_file_id, EMB_STORE_PATH)
        df_store = pd.read_parquet(EMB_STORE_PATH)
        print("✅ Loaded embeddings_store:", len(df_store))
    else:
        df_store = pd.DataFrame(columns=["video_key", "vector", "embedding_model", "created_at"])
        print("🟡 No embeddings_store found. Starting new.")

    if not df_store.empty and "video_key" in df_store.columns:
        df_store["video_key"] = df_store["video_key"].astype(str).str.strip()
    store_keys = set(df_store["video_key"].astype(str)) if not df_store.empty else set()

    # --- Load centroids (Drive Parquet) ---
    cent_file_id = find_file_in_folder(drive, DRIVE_FOLDER_ID, DRIVE_CENTROIDS)
    if cent_file_id:
        download_file(drive, cent_file_id, CENTROIDS_PATH)
        centroids = pd.read_parquet(CENTROIDS_PATH)
        print("✅ Loaded centroids:", len(centroids))
    else:
        centroids = None
        print("🟡 No centroids found yet.")

    # --- Stage discovery queue from QueryBank (Sheets) -> discovery_queue.parquet (Drive) ---
    staged = 0
    try:
        staged = stage_discovery_queue_daily(
            drive=drive,
            folder_id=DRIVE_FOLDER_ID,
            upload_or_update_fn=upload_or_update,
            existing_store_keys=store_keys
        )
        print("FEEDER: new items staged into discovery_queue =", staged)
    except Exception as e:
        print("⚠️ FEEDER skipped due to error:", e)

    # Read-after-write debug (proves correctness)
    try:
        df_queue_dbg = load_queue_from_drive(drive, DRIVE_FOLDER_ID)
        print("DEBUG: queue rows right after staging =", len(df_queue_dbg))
    except Exception as e:
        print("DEBUG: queue reload failed:", e)

    # --- Load queue (Drive Parquet) and embed from it ---
    df_queue = load_queue_from_drive(drive, DRIVE_FOLDER_ID)
    if df_queue.empty:
        print("🟢 Queue empty. Nothing to embed today.")
        embedded_today = 0
        newly_embedded_rows = []
    else:
        df_queue["video_key"] = df_queue["video_key"].astype(str).str.strip()
        df_queue = df_queue[~df_queue["video_key"].isin(store_keys)].copy()

        take_n = min(EMBED_DAILY_LIMIT, len(df_queue))
        work = df_queue.head(take_n).copy()

        keys = work["video_key"].tolist()
        texts = work["video_title"].fillna("").astype(str).tolist()

        if take_n == 0:
            print("🟢 Queue has only already-embedded keys. Nothing to embed.")
            embedded_today = 0
            newly_embedded_rows = []
        else:
            BATCH = 64
            newly_embedded_rows = []
            for i in range(0, len(keys), BATCH):
                k_block = keys[i:i+BATCH]
                t_block = texts[i:i+BATCH]

                vecs = embed_texts(OPENAI_API_KEY, EMBED_MODEL, t_block)
                ts = datetime.now(timezone.utc).isoformat()

                for k, v in zip(k_block, vecs):
                    newly_embedded_rows.append({
                        "video_key": k,
                        "vector": v,
                        "embedding_model": EMBED_MODEL,
                        "created_at": ts
                    })

                print(f"✅ Embedded batch {i//BATCH+1} ({len(k_block)})")
                time.sleep(0.3)

            df_store = pd.concat([df_store, pd.DataFrame(newly_embedded_rows)], ignore_index=True)
            df_store.to_parquet(EMB_STORE_PATH, index=False)
            upload_or_update(drive, DRIVE_FOLDER_ID, DRIVE_EMB_STORE, EMB_STORE_PATH)
            print("✅ embeddings_store uploaded:", len(df_store))

            embedded_today = len(newly_embedded_rows)

            processed_keys = set([r["video_key"] for r in newly_embedded_rows])
            df_queue = df_queue[~df_queue["video_key"].isin(processed_keys)].copy()
            save_queue_to_drive(drive, DRIVE_FOLDER_ID, upload_or_update, df_queue)
            print(f"✅ Queue updated (removed {len(processed_keys)} processed). Remaining:", len(df_queue))

            store_keys.update(processed_keys)

    # --- Fit centroids if missing and enough embeddings ---
    if centroids is None and len(df_store) >= KMEANS_K:
        print(f"🟢 Enough embeddings available ({len(df_store)}) to fit centroids (k={KMEANS_K}).")
        centroids = fit_centroids(df_store, k=KMEANS_K)
        centroids.to_parquet(CENTROIDS_PATH, index=False)
        upload_or_update(drive, DRIVE_FOLDER_ID, DRIVE_CENTROIDS, CENTROIDS_PATH)
        print("✅ Centroids fit & uploaded:", len(centroids))

    # --- Cluster assignment for newly embedded rows (write to Parquet) ---
    assignments_appended = 0
    if embedded_today > 0:
        if centroids is None:
            print(f"🟡 Not enough embeddings to fit centroids yet. Need >= {KMEANS_K}, have {len(df_store)}.")
            print("🟡 Skipping cluster assignment for now.")
        else:
            vectors = [r["vector"] for r in newly_embedded_rows]
            keys_new = [r["video_key"] for r in newly_embedded_rows]

            idx = assign_to_centroids(vectors, centroids)
            sc_ids = [f"SC{int(i):03d}" for i in idx]
            created_at = datetime.now(timezone.utc).isoformat()

            # Fill semantic_cluster_label with deterministic placeholder for now
            rows = [[k, sc, f"AUTO:{sc}", RUN_ID, str(KMEANS_K), created_at] for k, sc in zip(keys_new, sc_ids)]
            assignments_appended = len(rows)

            print("DEBUG: About to persist cluster assignments rows =", len(rows))

            assign_file_id = find_file_in_folder(drive, DRIVE_FOLDER_ID, DRIVE_ASSIGNMENTS)
            if assign_file_id:
                download_file(drive, assign_file_id, ASSIGN_PATH)
                df_assign = pd.read_parquet(ASSIGN_PATH)
                print("✅ Loaded cluster_assignments:", len(df_assign))
            else:
                df_assign = pd.DataFrame(columns=[
                    "video_key",
                    "semantic_clusterID",
                    "semantic_cluster_label",
                    "embedding_run_id",
                    "kmeans_k",
                    "created_at"
                ])
                print("🟡 No cluster_assignments found. Starting new.")

            df_new = pd.DataFrame(rows, columns=[
                "video_key",
                "semantic_clusterID",
                "semantic_cluster_label",
                "embedding_run_id",
                "kmeans_k",
                "created_at"
            ])

            # Idempotency: keep latest assignment per video_key
            df_assign = pd.concat([df_assign, df_new], ignore_index=True)
            df_assign["video_key"] = df_assign["video_key"].astype(str).str.strip()
            df_assign["created_at"] = df_assign["created_at"].astype(str)

            df_assign = df_assign.sort_values("created_at")
            df_assign = df_assign.drop_duplicates(subset=["video_key"], keep="last")

            df_assign.to_parquet(ASSIGN_PATH, index=False)
            upload_or_update(drive, DRIVE_FOLDER_ID, DRIVE_ASSIGNMENTS, ASSIGN_PATH)
            print("✅ cluster_assignments uploaded:", len(df_assign))
    else:
        print("🟢 No embeddings created today, skipping assignment step.")

    # --- Scorecard snapshot always (to snapshots folder) ---
    df_score = ws_to_df(ws_score)
    df_score["run_id"] = RUN_ID
    df_score["run_date"] = datetime.now(timezone.utc).date().isoformat()
    df_score.to_parquet(SCORE_SNAP_PATH, index=False)

    snap_name = f"scorecard_RUN_{datetime.now(timezone.utc).date().isoformat()}.parquet"
    try:
        upload_or_update(drive, DRIVE_SNAPSHOTS_FOLDER_ID, snap_name, SCORE_SNAP_PATH)
        print("✅ Scorecard snapshot uploaded:", snap_name, "| rows:", len(df_score))
    except Exception as e:
        print("⚠️ Scorecard drive upload skipped:", e)

    print("SUMMARY:",
          f"staged_today={staged}",
          f"embedded_today={embedded_today}",
          f"assignments_appended={assignments_appended}",
          f"queue_remaining={len(df_queue) if 'df_queue' in locals() else 'NA'}",
          f"store_total={len(df_store)}",
          f"centroids={'YES' if centroids is not None else 'NO'}")
    
    from src.compute_cluster_stats import main as compute_cluster_stats
    from src.materialize_videolookup import main as materialize_videolookup
    from src.materialize_videolookup import main as materialize_clusterlookup
    
    compute_cluster_stats()
    materialize_videolookup()
    materialize_clusterlookup()
    
if __name__ == "__main__":
    main()




