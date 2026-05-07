# Ingestion Plan

Bulk ingestion turns research batches into normalized draft entries without making the README or ad hoc notes the source of truth.

The first supported draft format is JSON Lines, documented in `docs/ingestion.md`. This format is intentionally small and may evolve after real category-by-category use.

## Intended Flow

1. Research agents produce candidate batches for one category or workflow area.
2. The importer reads those candidates from a local file.
3. The importer normalizes fields into draft entries in the repository schema.
4. Validation enforces required structure and data quality.
5. Humans or Codex review judgment calls before merge.

## Importer Responsibilities

- Map candidate fields into `data/tools.yml`.
- Normalize slugs, URLs, arrays, enum values, and dates.
- Detect likely duplicates and conflicts.
- Preserve source URLs for review.
- Produce small, reviewable diffs.
- Mark imported entries as drafts.

## Importer Non-Responsibilities

- It should not decide subjective rankings or scores.
- It should not silently invent missing metadata.
- It should not auto-approve category fit when evidence is weak.
- It should not scrape or enrich data beyond approved sources without review.
- It should not bypass validation.

## Decisions Before Building Importer

- Duplicate matching rules.
- Conflict handling when existing data disagrees with candidate data.
- Human review checkpoints.
- Whether external URL checks, license detection, or repository metadata enrichment are allowed.

Principle: research output produces candidates, the importer normalizes, validation enforces, and humans or Codex review judgment calls.
