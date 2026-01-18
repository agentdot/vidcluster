import io
from googleapiclient.http import MediaIoBaseDownload, MediaFileUpload

def find_file_in_folder(drive, folder_id: str, filename: str):
    # Shared-Drive-safe list
    q = f"name='{filename}' and '{folder_id}' in parents and trashed=false"
    resp = drive.files().list(
        q=q,
        supportsAllDrives=True,
        includeItemsFromAllDrives=True,
        fields="files(id,name)"
    ).execute()
    files = resp.get("files", [])
    return files[0]["id"] if files else None


def download_file(drive, file_id: str, out_path: str):
    request = drive.files().get_media(
        fileId=file_id,
        supportsAllDrives=True
    )
    fh = io.FileIO(out_path, "wb")
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        _, done = downloader.next_chunk()


def upload_or_update(drive, folder_id: str, filename: str, local_path: str, mimetype="application/octet-stream"):
    file_id = find_file_in_folder(drive, folder_id, filename)
    media = MediaFileUpload(local_path, mimetype=mimetype, resumable=True)

    if file_id:
        drive.files().update(
            fileId=file_id,
            media_body=media,
            supportsAllDrives=True
        ).execute()
        return file_id

    body = {"name": filename, "parents": [folder_id]}
    created = drive.files().create(
        body=body,
        media_body=media,
        fields="id",
        supportsAllDrives=True
    ).execute()
    return created["id"]
