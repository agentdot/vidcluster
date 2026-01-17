import numpy as np
import pandas as pd
from sklearn.cluster import KMeans

def fit_centroids(df_store: pd.DataFrame, k=80, seed=42):
    X = np.vstack(df_store["vector"].values).astype("float32")
    km = KMeans(n_clusters=k, n_init="auto", random_state=seed)
    km.fit(X)
    return pd.DataFrame({"cluster_index": range(k), "centroid": list(km.cluster_centers_)})

def assign_to_centroids(vectors: list, centroids_df: pd.DataFrame):
    X = np.vstack(vectors).astype("float32")
    C = np.vstack(centroids_df["centroid"].values).astype("float32")
    dists = ((X[:, None, :] - C[None, :, :]) ** 2).sum(axis=2)
    return dists.argmin(axis=1)
