#!/usr/bin/env python
"""Build seed universe JSON files from approved vertical requests."""

from __future__ import annotations

import csv
import json
from datetime import datetime, timezone
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
REQUESTS_CSV = REPO_ROOT / "automation-data" / "vertical_requests" / "vertical_requests.csv"
OUTPUT_DIR = REPO_ROOT / "automation-data" / "vertical_seed_universes"


def clean(value: str | None) -> str:
    return " ".join((value or "").strip().split())


def normalize_seed_queries(value: str | None) -> list[str]:
    seen: set[str] = set()
    seeds: list[str] = []

    for raw_seed in (value or "").split(","):
        seed = clean(raw_seed).lower()
        if seed and seed not in seen:
            seen.add(seed)
            seeds.append(seed)

    return seeds


def build_universes() -> int:
    if not REQUESTS_CSV.exists():
        raise SystemExit(f"missing request CSV: {REQUESTS_CSV}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    generated = 0

    with REQUESTS_CSV.open("r", newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            status = clean(row.get("status")).upper()
            request_id = clean(row.get("request_id"))

            if status != "APPROVED" or not request_id:
                continue

            output_path = OUTPUT_DIR / f"vertical_{request_id}.json"
            if output_path.exists():
                print(f"skip existing: {output_path.name}")
                continue

            payload = {
                "request_id": request_id,
                "requested_vertical": clean(row.get("requested_vertical")),
                "seed_queries": normalize_seed_queries(row.get("seed_queries")),
                "requested_by": clean(row.get("requested_by")),
                "priority": clean(row.get("priority")),
                "created_at": clean(row.get("created_at")),
                "generated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
                "universe_status": "READY_FOR_DISCOVERY",
            }

            with output_path.open("w", encoding="utf-8") as output:
                json.dump(payload, output, indent=2)
                output.write("\n")

            generated += 1
            print(f"generated: {output_path.name}")

    if generated == 0:
        print("no new approved verticals to build")

    return generated


if __name__ == "__main__":
    build_universes()
