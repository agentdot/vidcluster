# Vertical Seed Universes

Seed universes are controlled starting points for future VidCluster coverage expansion. They convert approved vertical requests into structured seed lists that can later feed discovery, ingestion, and tracking.

This is not keyword search. A seed universe is not an instant query interface and should not be treated as a generic keyword tool.

## Flow

```text
vertical request -> approved vertical -> seed universe -> future discovery/ingestion
```

## Build

```bash
python scripts/ops/build_vertical_seed_universe.py
```

The builder reads `automation-data/vertical_requests/vertical_requests.csv`, selects rows with `status` set to `APPROVED`, and writes one JSON file per request into:

```text
automation-data/vertical_seed_universes/
```

Existing universe files are skipped so a request is not rebuilt accidentally.
