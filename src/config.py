import os

SHEET_ID = os.environ["SHEET_ID"]
DRIVE_FOLDER_ID = os.environ["DRIVE_FOLDER_ID"]
DRIVE_SNAPSHOTS_FOLDER_ID = os.environ.get("DRIVE_SNAPSHOTS_FOLDER_ID")
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]

TAB_DATA = "Data"
TAB_EMB = "Embeddings_V2_UNIQUE"
TAB_ASSIGN = "ClusterAssignments_V2"
TAB_SCORECARD = "Scorecard"
TAB_QUERYBANK = os.environ.get("TAB_QUERYBANK", "QueryBank")

EMBED_MODEL = "text-embedding-3-small"
KMEANS_K = 80

DRIVE_EMB_STORE = "embeddings_store.parquet"
DRIVE_ASSIGNMENTS = "cluster_assignments.parquet"
DRIVE_DISCOVERY_QUEUE = "discovery_queue.parquet"
DRIVE_CENTROIDS = "kmeans_centroids.parquet"
