import io
from googleapiclient.http import MediaIoBaseDownload, MediaFileUpload

def find_file_in_folder(drive, folder_id: str, filename: str):
    q = f"'{folder_id}' in parents and name='{filename}' and trashed=false"
    resp = drive.files().list(q=q, fields="files(id,name)").execute()
    files = resp.get("files", [])
    return files[0]["id"] if files else None

def download_file(drive, file_id: str, out_path: str):
    request = drive.files().get_media(fileId=file_id)
    fh = io.FileIO(out_path, "wb")
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        _, done = downloader.next_chunk()

def upload_or_update(drive, folder_id: str, filename: str, local_path: str, mimetype="application/octet-stream"):
    file_id = find_file_in_folder(drive, folder_id, filename)
    media = MediaFileUpload(local_path, mimetype=mimetype, resumable=True)

    if file_id:
        drive.files().update(fileId=file_id, media_body=media).execute()
        return file_id

    body = {"name": filename, "parents": [folder_id]}
    created = drive.files().create(body=body, media_body=media, fields="id").execute()
    return created["id"]
