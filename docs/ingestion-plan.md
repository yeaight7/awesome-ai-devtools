# Future Ingestion Plan

Bulk ingestion will exist to turn research batches into normalized candidate entries without making the README or ad hoc notes the source of truth.

This first iteration intentionally does not define the final research-output contract.

## Intended Flow

1. Research agents produce candidate batches for one category or workflow area.
2. A future importer reads those candidates.
3. The importer normalizes fields into the repository schema.
4. Validation enforces required structure and data quality.
5. Humans or Codex review judgment calls before merge.

## Importer Responsibilities

- Map candidate fields into `data/tools.yml`.
- Normalize slugs, URLs, arrays, enum values, and dates.
- Detect likely duplicates and conflicts.
- Preserve source URLs for review.
- Produce small, reviewable diffs.

## Importer Non-Responsibilities

- It should not decide subjective rankings or scores.
- It should not silently invent missing metadata.
- It should not auto-approve category fit when evidence is weak.
- It should not scrape or enrich data beyond approved sources without review.
- It should not bypass validation.

## Decisions Before Building Importer

- Candidate batch format and required source evidence.
- Duplicate matching rules.
- Conflict handling when existing data disagrees with candidate data.
- Human review checkpoints.
- Whether external URL checks, license detection, or repository metadata enrichment are allowed.

Principle: research output produces candidates, the importer normalizes, validation enforces, and humans or Codex review judgment calls.
