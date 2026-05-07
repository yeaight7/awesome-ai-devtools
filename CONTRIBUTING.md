# Contributing

`awesome-ai-devtools` is a structured directory. The README is generated from YAML data.

## Add Or Update One Tool

1. Edit `data/tools.yml`.
2. Use official product docs, official repositories, or official package pages as sources.
3. Keep `description` factual and 40-160 characters.
4. Use existing `categories` and `tags` when they fit.
5. Use `not specified` rather than guessing uncertain metadata.
6. Run:

```bash
npm install
npm run sort
npm run generate
npm test
```

## Import Draft Candidates

For category research batches, use the draft importer instead of hand-copying fields:

```bash
npm run import:candidates -- path/to/candidates.jsonl --dry-run
npm run import:candidates -- path/to/candidates.jsonl
npm test
```

Imported entries are drafts. Review sources, categories, tags, and uncertain fields before changing `curation_status` from `draft` to `reviewed`.

See `docs/ingestion.md` for the candidate format and review workflow.

## Data Quality Rules

- Do not inflate the list with low-quality or barely related tools.
- Do not add subjective rankings, awards, or scores.
- Do not describe future or rumored features as current facts.
- Do not scrape or bulk import data by hand.
- Prefer omitted optional URLs over unofficial mirrors.

## Generated Files

`README.md` is generated. If tool listings are stale, run `npm run generate` instead of editing them manually.

## Licenses

Code and docs are MIT licensed. Structured metadata in `data/` is CC-BY-4.0 licensed.
