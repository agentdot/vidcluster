import json, os
import gspread
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

def get_sa_creds():
    sa = json.loads(os.environ["GOOGLE_SA_JSON"])
    return Credentials.from_service_account_info(sa, scopes=SCOPES)

def get_gspread_client():
    return gspread.authorize(get_sa_creds())

def get_drive_service():
    return build("drive", "v3", credentials=get_sa_creds(), cache_discovery=False)
