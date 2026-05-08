# Vertical Request Intake

This is a lightweight intake system for requested verticals. It is not instant keyword search and should not be treated like a traditional keyword tool.

Requested verticals represent candidate intelligence universes. They may later become curated seed expansions, monitored topic spaces, or tracked cluster coverage areas after review.

## CSV

Requests live in:

```text
automation-data/vertical_requests/vertical_requests.csv
```

Statuses:

- `NEW`
- `REVIEWING`
- `APPROVED`
- `REJECTED`
- `INGESTED`

## Add A Request

```bash
python scripts/ops/add_vertical_request.py \
  --vertical "AI coding tools" \
  --seed-queries "cursor ai, claude code, bolt.new" \
  --requested-by "internal"
```

The helper appends a row, creates the CSV if missing, trims whitespace, assigns a UTC timestamp, and blocks exact duplicate vertical names.
