# Maintenance Policy

## Source Of Truth

Structured YAML in `data/` is the source of truth. `README.md` is generated.

## Sorting

Tools are sorted by display name using English locale comparison, then by slug as a tiebreaker. Tool category, tag, interface, and source arrays are normalized alphabetically.

Run:

```bash
npm run sort
```

## Validation

Validation blocks malformed data, unknown category/tag references, duplicate slugs, invalid URLs, invalid dates, invalid enum values, overlong or missing descriptions, unsorted data, and stale README output.

Run:

```bash
npm test
```

## Review Policy

Reviewers should check that sources are official, descriptions are factual, uncertain fields are marked conservatively, and entries improve the directory rather than inflating counts.
