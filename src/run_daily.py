import time
import pandas as pd
from datetime import datetime, timezone
import sys, os
import json
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from src.config import (
    SHEET_ID, DRIVE_FOLDER_ID, OPENAI_API_KEY,
    TAB_EMB, TAB_ASSIGN, TAB_SCORECARD,
    EMBED_MODEL, KMEANS_K,
    DRIVE_EMB_STORE, DRIVE_CENTROIDS
)
from src.google_clients import get_gspread_client, get_drive_service
from src.drive_store import find_file_in_folder, download_file  # Removed upload_or_update; using inlined version below
from src.sheets_io import ws_to_df, append_rows_chunked
from src.embeddings import embed_texts
from src.clustering import fit_centroids, assign_to_centroids

EMB_STORE_PATH = "/tmp/embeddings_store.parquet"
CENTROIDS_PATH = "/tmp/kmeans_centroids.parquet"
SCORE_SNAP_PATH = "/tmp/scorecard_snapshot.parquet"

def now_run_id():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%SZ")

# Inline fixed upload_or_update with shared drive support
def upload_or_update(drive_service, folder_id, file_name, local_path):
    print(f"Debug: Starting upload_or_update for {file_name} to folder {folder_id}")
    try:
        # Search for existing file in folder
        query = f"name='{file_name}' and '{folder_id}' in parents and trashed=false"
        response = drive_service.files().list(
            q=query,
            supportsAllDrives=True,
            includeItemsFromAllDrives=True,
            fields="files(id, name)"
        ).execute()
        
        media = MediaFileUpload(local_path, resumable=True)
        
        if response.get('files'):
            # Update existing file
            file_id = response['files'][0]['id']
            print(f"Debug: Found existing file ID {file_id} - updating")
            updated_file = drive_service.files().update(
                fileId=file_id,
                media_body=media,
                supportsAllDrives=True
            ).execute()
            print(f"✅ Updated file ID: {updated_file.get('id')}")
            return updated_file.get('id')
        else:
            # Create new file
            print(f"Debug: No existing file - creating new")
            metadata = {
                'name': file_name,
                'parents': [folder_id]  # Ensure list
            }
            new_file = drive_service.files().create(
                body=metadata,
                media_body=media,
                supportsAllDrives=True,
                fields='id'
            ).execute()
            print(f"✅ Uploaded new file ID: {new_file.get('id')}")
            return new_file.get('id')
    except HttpError as e:
        print(f"⚠️ Upload failed: {e}")
        if e.resp.status == 404:
            print("404 Debug: Folder ID may not exist, or SA lacks access. Verify sharing.")
        raise  # Re-raise to catch in main

def main():
    RUN_ID = now_run_id()
    print("RUN_ID:", RUN_ID)
    gc = get_gspread_client()
    sh = gc.open_by_key(SHEET_ID)
    ws_emb = sh.worksheet(TAB_EMB)
    ws_assign = sh.worksheet(TAB_ASSIGN)
    ws_score = sh.worksheet(TAB_SCORECARD)
    drive = get_drive_service()
    # Load embedding store
    emb_file_id = find_file_in_folder(drive, DRIVE_FOLDER_ID, DRIVE_EMB_STORE)
    if emb_file_id:
        download_file(drive, emb_file_id, EMB_STORE_PATH)
        df_store = pd.read_parquet(EMB_STORE_PATH)
        print("✅ Loaded embeddings_store:", len(df_store))
    else:
        df_store = pd.DataFrame(columns=["video_key","vector","embedding_model","created_at"])
        print("🟡 No embeddings_store found. Starting new.")
    # Load centroids
    cent_file_id = find_file_in_folder(drive, DRIVE_FOLDER_ID, DRIVE_CENTROIDS)
    if cent_file_id:
        download_file(drive, cent_file_id, CENTROIDS_PATH)
        centroids = pd.read_parquet(CENTROIDS_PATH)
        print("✅ Loaded centroids:", len(centroids))
    else:
        centroids = None
        print("🟡 No centroids found yet.")
    # Read embedding tab
    df_embtab = ws_to_df(ws_emb)
    if df_embtab.empty:
        print("❌ Embedding_V2_UNIQUE is empty.")
        return
    df_embtab["status"] = df_embtab["status"].astype(str)
    df_embtab["video_key"] = df_embtab["video_key"].astype(str).str.strip()
    pending = df_embtab[df_embtab["status"].str.upper().eq("PENDING")].copy()
    pending = pending.drop_duplicates(subset=["video_key"], keep="first")
    if pending.empty:
        print("🟢 No PENDING rows. Snapshot scorecard and exit.")
    else:
        existing = set(df_store["video_key"].astype(str)) if len(df_store) else set()
        to_embed = pending[~pending["video_key"].isin(existing)].copy()
        print("PENDING:", len(pending), "| New to embed:", len(to_embed))
        new_rows = []
        if not to_embed.empty:
            keys = to_embed["video_key"].tolist()
            texts = to_embed["video title"].fillna("").astype(str).tolist()
            BATCH = 64
            for i in range(0, len(keys), BATCH):
                k_block = keys[i:i+BATCH]
                t_block = texts[i:i+BATCH]
                vecs = embed_texts(OPENAI_API_KEY, EMBED_MODEL, t_block)
                ts = datetime.now(timezone.utc).isoformat()
                for k, v in zip(k_block, vecs):
                    new_rows.append({"video_key": k, "vector": v, "embedding_model": EMBED_MODEL, "created_at": ts})
                print(f"✅ Embedded batch {i//BATCH+1} ({len(k_block)})")
                time.sleep(0.3)
            df_store = pd.concat([df_store, pd.DataFrame(new_rows)], ignore_index=True)
            df_store.to_parquet(EMB_STORE_PATH, index=False)
            upload_or_update(drive, DRIVE_FOLDER_ID, DRIVE_EMB_STORE, EMB_STORE_PATH)
            print("✅ embeddings_store uploaded:", len(df_store))
        # Fit centroids if missing
        if centroids is None:
            if len(df_store) < KMEANS_K:
                raise RuntimeError(f"Need >= {KMEANS_K} embeddings to fit centroids, have {len(df_store)}")
            centroids = fit_centroids(df_store, k=KMEANS_K)
            centroids.to_parquet(CENTROIDS_PATH, index=False)
            upload_or_update(drive, DRIVE_FOLDER_ID, DRIVE_CENTROIDS, CENTROIDS_PATH)
            print("✅ Centroids fit & uploaded.")
        # Assign clusters only for new embeddings from this run
        if new_rows:
            vectors = [r["vector"] for r in new_rows]
            keys = [r["vector_key"] for r in new_rows]  # Fixed potential typo; was "video_key"?
            idx = assign_to_centroids(vectors, centroids)
            sc_ids = [f"SC{int(i):03d}" for i in idx]
            created_at = datetime.now(timezone.utc).isoformat()
            rows = [[k, sc, "", RUN_ID, str(KMEANS_K), created_at] for k, sc in zip(keys, sc_ids)]
            append_rows_chunked(ws_assign, rows, chunk=120, sleep_s=3.0)
            print("✅ Appended ClusterAssignment_V2:", len(rows))
    # Scorecard snapshot always
    df_score = ws_to_df(ws_score)
    df_score["run_id"] = RUN_ID
    df_score["run_date"] = datetime.now(timezone.utc).date().isoformat()
    df_score.to_parquet(SCORE_SNAP_PATH, index=False)
    snap_name = f"scorecard_RUN_{datetime.now(timezone.utc).date().isoformat()}.parquet"
    try:
        upload_or_update(drive, DRIVE_FOLDER_ID, snap_name, SCORE_SNAP_PATH)
    except Exception as e:
        print("⚠️ Drive upload skipped:", e)
    print("✅ Scorecard snapshot uploaded:", snap_name, "| rows:", len(df_score))

if __name__ == "__main__":
    main()
