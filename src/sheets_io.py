import time
import pandas as pd

def ws_to_df(ws):
    values = ws.get_all_values()
    if not values:
        return pd.DataFrame()
    header = values[0]
    rows = values[1:]
    return pd.DataFrame(rows, columns=header)

def ensure_rows(ws, rows_needed: int, buffer: int = 200):
    """
    Ensure the worksheet grid has enough rows to append rows_needed.
    Google Sheets has a fixed grid; appends fail if you exceed row_count.
    """
    if rows_needed <= 0:
        return
    # row_count is total grid rows currently allocated
    # We add a small buffer so we don't hit the edge every run
    ws.add_rows(max(rows_needed, buffer))


def append_rows_chunked(ws, rows, chunk=120, sleep_s=3.0):
    """
    Appends rows by writing blocks into the next available rows.
    Works even on Shared Drive service account gspread access.
    Auto-expands the worksheet grid if needed.
    """
    if not rows:
        return

    # Find next empty row (based on existing values in column A)
    existing = len(ws.get_all_values())
    start_row = existing + 1

    # Ensure grid capacity
    total_new = len(rows)
    required_last_row = start_row + total_new - 1
    if required_last_row > ws.row_count:
        ensure_rows(ws, required_last_row - ws.row_count + 1)

    # Write in chunks
    r = start_row
    for i in range(0, total_new, chunk):
        block = rows[i:i+chunk]
        end_r = r + len(block) - 1
        end_c = len(block[0]) if block else 1

        # A1 range like A2919:F2968 (for 6 cols)
        range_name = f"A{r}:{chr(ord('A') + end_c - 1)}{end_r}"
        ws.update(range_name=range_name, values=block, value_input_option="RAW")
        r = end_r + 1

        if sleep_s:
            time.sleep(sleep_s)

