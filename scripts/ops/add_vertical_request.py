#!/usr/bin/env python
"""Append a vertical request to the lightweight intake CSV."""

from __future__ import annotations

import argparse
import csv
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4


REPO_ROOT = Path(__file__).resolve().parents[2]
CSV_PATH = REPO_ROOT / "automation-data" / "vertical_requests" / "vertical_requests.csv"
FIELDNAMES = [
    "request_id",
    "requested_vertical",
    "seed_queries",
    "requested_by",
    "priority",
    "status",
    "created_at",
    "notes",
]


def clean(value: str | None) -> str:
    return " ".join((value or "").strip().split())


def ensure_csv() -> None:
    CSV_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not CSV_PATH.exists() or CSV_PATH.stat().st_size == 0:
        with CSV_PATH.open("w", newline="", encoding="utf-8") as handle:
            csv.DictWriter(handle, fieldnames=FIELDNAMES).writeheader()


def existing_verticals() -> set[str]:
    ensure_csv()
    with CSV_PATH.open("r", newline="", encoding="utf-8") as handle:
        return {
            clean(row.get("requested_vertical")).lower()
            for row in csv.DictReader(handle)
            if clean(row.get("requested_vertical"))
        }


def main() -> int:
    parser = argparse.ArgumentParser(description="Append a requested vertical to the intake CSV.")
    parser.add_argument("--vertical", required=True, help="Requested vertical name.")
    parser.add_argument("--seed-queries", default="", help="Comma-separated seed queries.")
    parser.add_argument("--requested-by", default="internal", help="Requester name or source.")
    parser.add_argument("--priority", default="normal", help="Priority label.")
    parser.add_argument("--status", default="NEW", help="Initial status.")
    parser.add_argument("--notes", default="", help="Optional notes.")
    args = parser.parse_args()

    vertical = clean(args.vertical)
    if not vertical:
        parser.error("--vertical is required")

    if vertical.lower() in existing_verticals():
        parser.error(f"vertical already exists: {vertical}")

    row = {
        "request_id": f"VR-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid4().hex[:6]}",
        "requested_vertical": vertical,
        "seed_queries": clean(args.seed_queries),
        "requested_by": clean(args.requested_by) or "internal",
        "priority": clean(args.priority) or "normal",
        "status": clean(args.status).upper() or "NEW",
        "created_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "notes": clean(args.notes),
    }

    ensure_csv()
    with CSV_PATH.open("a", newline="", encoding="utf-8") as handle:
        csv.DictWriter(handle, fieldnames=FIELDNAMES).writerow(row)

    print(f"Added {row['request_id']}: {row['requested_vertical']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
