# Maintenance Policy

## Source Of Truth

Structured YAML in `data/` is the source of truth. `README.md` is generated.

## Sorting

Tools are sorted by display name using English locale comparison, then by slug as a tiebreaker. Tool category, tag, interface, and source arrays are normalized alphabetically. `primary_category` is preserved as-is during sorting; it is not sorted into the category array.

## Primary Category

Reviewed tools that belong to more than one category must set `primary_category` to one of the slugs in their `categories` list. This controls which shelf is shown in the comparison matrix and the review queue. Single-category tools do not need it.

Run:

```bash
npm run sort
```

## Validation

Validation blocks malformed data, unrecognized category/tag references, duplicate slugs, invalid URLs, invalid dates, invalid enum values, overlong or missing descriptions, unsorted data, and stale README output.

Run:

```bash
npm test
```

## Review Policy

Reviewers should check that sources are official, descriptions are factual, uncertain fields are marked conservatively, and entries improve the directory rather than inflating counts.
