import time
import pandas as pd

def ws_to_df(ws):
    values = ws.get_all_values()
    if not values:
        return pd.DataFrame()
    header = values[0]
    rows = values[1:]
    return pd.DataFrame(rows, columns=header)

def append_rows_chunked(ws, rows, chunk=120, sleep_s=3.0):
    if not rows:
        return
    start_row = len(ws.get_all_values()) + 1
    for i in range(0, len(rows), chunk):
        block = rows[i:i+chunk]
        r1 = start_row + i
        ws.update(range_name=f"A{r1}", values=block)
        time.sleep(sleep_s)
