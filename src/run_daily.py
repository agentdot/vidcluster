import time
import sys, os, json
import pandas as pd
from datetime import datetime, timezone

from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError

# Make sure src imports work when running as module
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.config import (
    SHEET_ID, DRIVE_FOLDER_ID, OPENAI_API_KEY,
    TAB_EMB, TAB_ASSIGN, TAB_SCORECARD,
    EMBED_MODEL, KMEANS_K,
    DRIVE_EMB_STORE, DRIVE_CENTROIDS
)
from src.google_clients import get_gspread_client, get_drive_service
from src.drive_store import find_file_in_folder, download_file
from src.sheets_io import ws_to_df, append_rows_chunked
from src.embeddings import embed_texts
from src.clustering import fit_centroids, assign_to_centroids


EMB_STORE_PATH = "/tmp/embeddings_store.parquet"
CENTROIDS_PATH = "/tmp/kmeans_centroids.parquet"
SCORE_SNAP_PATH = "/tmp/scorecard_snapshot.parquet"


def now_run_id():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%SZ")


def upload_or_update(drive_service, folder_id, file_name, local_path):
    """
    Shared-Drive-safe upload/update into a folder.
    """
    query = f"name='{file_name}' and '{folder_id}' in parents and trashed=false"
    response = drive_service.files().list(
        q=query,
        supportsAllDrives=True,
        includeItemsFromAllDrives=True,
        fields="files(id, name)"
    ).execute()

    media = MediaFileUpload(local_path, resumable=True)

    if response.get("files"):
        file_id = response["files"][0]["id"]
        updated = drive_service.files().update(
            fileId=file_id,
            media_body=media,
            supportsAllDrives=True
        ).execute()
        return updated.get("id")
    else:
        metadata = {"name": file_name, "parents": [folder_id]}
        created = drive_service.files().create(
            body=metadata,
            media_body=media,
            supportsAllDrives=True,
            fields="id"
        ).execute()
        return created.get("id")


def set_cells_by_header(ws, header_row, row_idx_1based, updates: dict):
    """
    updates: { "col_name": value }
    row_idx_1based includes header row as 1. (data row 2+)
    """
    # Map header -> col index
    col_map = {h.strip(): (i + 1) for i, h in enumerate(header_row)}
    cells = []
    for k, v in updates.items():
        if k in col_map:
            cells.append((row_idx_1based, col_map[k], v))
    if not cells:
        return

    # Batch update
    cell_list = ws.range(
        min(r for r, c, v in cells),
        min(c for r, c, v in cells),
        max(r for r, c, v in cells),
        max(c for r, c, v in cells),
    )
    # Put values into the right spots
    for cell in cell_list:
        for r, c, v in cells:
            if cell.row == r and cell.col == c:
                cell.value = v
                break
    ws.update_cells(cell_list, value_input_option="RAW")


def main():
    RUN_ID = now_run_id()
    print("RUN_ID:", RUN_ID)

    gc = get_gspread_client()
    sh = gc.open_by_key(SHEET_ID)

    ws_emb = sh.worksheet(TAB_EMB)
    ws_assign = sh.worksheet(TAB_ASSIGN)
    ws_score = sh.worksheet(TAB_SCORECARD)

    drive = get_drive_service()

    # --- Load embedding store (parquet) ---
    emb_file_id = find_file_in_folder(drive, DRIVE_FOLDER_ID, DRIVE_EMB_STORE)
    if emb_file_id:
        download_file(drive, emb_file_id, EMB_STORE_PATH)
        df_store = pd.read_parquet(EMB_STORE_PATH)
        print("✅ Loaded embeddings_store:", len(df_store))
    else:
        df_store = pd.DataFrame(columns=["video_key", "vector", "embedding_model", "created_at"])
        print("🟡 No embeddings_store found. Starting new.")

    # --- Load centroids (parquet) ---
    cent_file_id = find_file_in_folder(drive, DRIVE_FOLDER_ID, DRIVE_CENTROIDS)
    if cent_file_id:
        download_file(drive, cent_file_id, CENTROIDS_PATH)
        centroids = pd.read_parquet(CENTROIDS_PATH)
        print("✅ Loaded centroids:", len(centroids))
    else:
        centroids = None
        print("🟡 No centroids found yet.")

    # --- Read Embeddings_V2_UNIQUE from sheet ---
    df_embtab = ws_to_df(ws_emb)
    if df_embtab.empty:
        print("❌ Embeddings_V2_UNIQUE is empty.")
        return

    # Ensure required columns exist in df (sheet already has them, but safe)
    for col in ["video_key", "video title", "status", "embedding_model", "embedding_run_id", "kmeans_k", "created_at"]:
        if col not in df_embtab.columns:
            df_embtab[col] = ""

    df_embtab["video_key"] = df_embtab["video_key"].astype(str).str.strip()
    df_embtab["status"] = df_embtab["status"].fillna("").astype(str).str.strip()

    # ✅ NEW PENDING RULE:
    # pending = (status is blank OR status == PENDING) AND video_key not blank
    pending = df_embtab[
        (df_embtab["video_key"] != "") &
        ((df_embtab["status"] == "") | (df_embtab["status"].str.upper() == "PENDING"))
    ].copy()

    # Also skip ones already in store (so we don't re-embed)
    existing_keys = set(df_store["video_key"].astype(str)) if len(df_store) else set()
    pending = pending[~pending["video_key"].isin(existing_keys)].copy()

    print("Pending rows to embed (by blank/PENDING status AND not already embedded):", len(pending))

    new_rows = []

    if not pending.empty:
        keys = pending["video_key"].tolist()
        texts = pending["video title"].fillna("").astype(str).tolist()

        BATCH = 64
        for i in range(0, len(keys), BATCH):
            k_block = keys[i:i+BATCH]
            t_block = texts[i:i+BATCH]

            vecs = embed_texts(OPENAI_API_KEY, EMBED_MODEL, t_block)
            ts = datetime.now(timezone.utc).isoformat()

            for k, v in zip(k_block, vecs):
                new_rows.append({
                    "video_key": k,
                    "vector": v,
                    "embedding_model": EMBED_MODEL,
                    "created_at": ts
                })

            print(f"✅ Embedded batch {i//BATCH+1} ({len(k_block)})")
            time.sleep(0.3)

        # Update local store
        df_store = pd.concat([df_store, pd.DataFrame(new_rows)], ignore_index=True)
        df_store.to_parquet(EMB_STORE_PATH, index=False)

        # Upload store to Drive
        upload_or_update(drive, DRIVE_FOLDER_ID, DRIVE_EMB_STORE, EMB_STORE_PATH)
        print("✅ embeddings_store uploaded:", len(df_store))

        # ✅ Write back to Embeddings_V2_UNIQUE: mark DONE + metadata
        # We need the header row to map columns; grab it directly from sheet
        header = ws_emb.row_values(1)

        # Create a map from video_key -> row number in sheet
        # row 2 corresponds to df_embtab index 0
        key_to_row = {}
        for i, vk in enumerate(df_embtab["video_key"].tolist(), start=2):
            if vk and vk not in key_to_row:
                key_to_row[vk] = i

        now_iso = datetime.now(timezone.utc).isoformat()
        for vk in [r["video_key"] for r in new_rows]:
            rnum = key_to_row.get(vk)
            if not rnum:
                continue
            set_cells_by_header(ws_emb, header, rnum, {
                "embedding_model": EMBED_MODEL,
                "embedding_run_id": RUN_ID,
                "kmeans_k": str(KMEANS_K),
                "created_at": now_iso,
                "status": "DONE"
            })

        print("✅ Updated Embeddings_V2_UNIQUE rows to DONE:", len(new_rows))

        # Fit centroids if missing
        # Fit centroids if missing (only when we have enough embeddings)
        if centroids is None:
            if len(df_store) < KMEANS_K:
                print(f"🟡 Not enough embeddings to fit centroids yet. Need >= {KMEANS_K}, have {len(df_store)}.")
                print("🟡 Skipping centroid fit + cluster assignment for now.")
                # Still allow the run to finish successfully
                centroids = None
            else:
                centroids = fit_centroids(df_store, k=KMEANS_K)
                centroids.to_parquet(CENTROIDS_PATH, index=False)
                upload_or_update(drive, DRIVE_FOLDER_ID, DRIVE_CENTROIDS, CENTROIDS_PATH)
                print("✅ Centroids fit & uploaded.")

            centroids.to_parquet(CENTROIDS_PATH, index=False)
            upload_or_update(drive, DRIVE_FOLDER_ID, DRIVE_CENTROIDS, CENTROIDS_PATH)
            print("✅ Centroids fit & uploaded.")

        # Assign clusters for newly embedded rows
        vectors = [r["vector"] for r in new_rows]
        keys = [r["video_key"] for r in new_rows]   # ✅ FIXED
        idx = assign_to_centroids(vectors, centroids)

        sc_ids = [f"SC{int(i):03d}" for i in idx]
        created_at = datetime.now(timezone.utc).isoformat()

        # IMPORTANT: Adjust this to match your ClusterAssignment_V2 columns.
        # Recommended schema (6 cols):
        # video_key | semantic_clusterID | semantic_cluster_label | embedding_run_id | kmeans_k | created_at
        rows = [[k, sc, "", RUN_ID, str(KMEANS_K), created_at] for k, sc in zip(keys, sc_ids)]

        print("DEBUG: About to append to ClusterAssignment_V2 rows =", len(rows))
        append_rows_chunked(ws_assign, rows, chunk=120, sleep_s=3.0)
        print("✅ Appended ClusterAssignment_V2:", len(rows))

    else:
        print("🟢 Nothing to embed today (no blank/PENDING rows not already embedded).")

    # Scorecard snapshot always
    df_score = ws_to_df(ws_score)
    df_score["run_id"] = RUN_ID
    df_score["run_date"] = datetime.now(timezone.utc).date().isoformat()
    df_score.to_parquet(SCORE_SNAP_PATH, index=False)

    snap_name = f"scorecard_RUN_{datetime.now(timezone.utc).date().isoformat()}.parquet"
    try:
        upload_or_update(drive, DRIVE_FOLDER_ID, snap_name, SCORE_SNAP_PATH)
        print("✅ Scorecard snapshot uploaded:", snap_name, "| rows:", len(df_score))
    except Exception as e:
        print("⚠️ Scorecard drive upload skipped:", e)


if __name__ == "__main__":
    main()
