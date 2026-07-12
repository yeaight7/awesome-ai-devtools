# Contributing

`awesome-ai-devtools` is a structured directory. The README is generated from YAML data in the `data/` directory.

## Adding or Updating a Tool

The easiest useful contribution is one tool addition or one factual update.

1. Edit `data/tools.yml`.
2. Use official product docs, official repositories, or official package pages as sources.
3. Keep `description` factual and 40-180 characters.
4. Use existing `categories` and `tags` when they fit.
5. Use `not specified` rather than guessing uncertain metadata.
6. If a reviewed tool belongs to more than one category, set `primary_category` to the slug that best represents its primary workflow.

### Required Tool Fields

- `slug`: stable kebab-case identifier.
- `name`: official tool name.
- `description`: factual, neutral, 40-180 characters.
- `website_url`: official website, docs, or repository URL.
- `categories`: one or more slugs from `data/categories.yml`.
- `tags`: one or more slugs from `data/tags.yml`.
- `interfaces`: one or more allowed interface values.
- `deployment`: `hosted`, `local`, `self-hosted`, `hybrid`, or `not specified`.
- `source_model`: `open-source`, `source-available`, `proprietary`, or `not specified`.
- `license`: SPDX-style value when known, otherwise `not specified`.
- `added`: date the entry was added (YYYY-MM-DD).
- `last_checked`: date the metadata was last checked (YYYY-MM-DD).
- `sources`: official URLs that support the entry.

### Optional Tool Fields

- `repo_url`: official source repository.
- `docs_url`: official documentation.
- `primary_category`: the main shelf for README display. Required for reviewed tools that belong to more than one category. Must be one of the slugs already in `categories`. Use the category that best represents the tool's primary workflow (e.g., a coding agent that also does code review should use `coding-agents`, not `ai-code-review-tools`).

## Categories and Tags

Categories describe the main role of a tool. Tags describe secondary traits.

### Category Rules
- Use the most specific existing category that fits.
- Multiple categories are allowed when a tool genuinely spans workflows.
- Do not create a category for a single vendor, product, or marketing term.
- Keep category names neutral and durable.
- Add a category only when existing categories would mislead users.
- When category fit is uncertain, use the conservative category and explain the tradeoff in the PR.

### Tag Rules
- Tags should help filtering later.
- Prefer stable capability tags over trend terms.
- Do not duplicate every field as a tag.
- Add tags sparingly.

## Data Quality Rules

- Do not inflate the list with low-quality or barely related tools.
- Do not add subjective rankings, awards, or scores.
- Do not describe future or rumored features as current facts.
- Do not scrape or bulk import data by hand.
- Prefer omitted optional URLs over unofficial mirrors.
- Write descriptions in factual, neutral language. Validation rejects promotional phrasing (superlatives, hype phrases, exclamation marks, emoji) and warns about soft subjective wording such as "intuitive" or "enterprise-grade".

## Maintenance Policy

Structured YAML in `data/` is the source of truth. `README.md` and `docs/COMPARISON.md` are generated. If tool listings are stale, run `npm run generate` instead of editing them manually.

Sorting rules, validation coverage, and the scheduled link/staleness maintenance model are documented in [docs/maintenance-policy.md](docs/maintenance-policy.md).

## Import Draft Candidates

For category research batches, use the draft importer instead of hand-copying fields:

```bash
npm run import:candidates -- path/to/candidates.jsonl --dry-run
npm run import:candidates -- path/to/candidates.jsonl
npm test
```

Imported entries are drafts. Review sources, categories, tags, and uncertain fields before changing `curation_status` from `draft` to `reviewed`. See `docs/ingestion.md` for the candidate format and review workflow.

## Before Opening A PR

Add or update your tool in `data/tools.yml`, then run:

```bash
npm install
npm run sort
npm run generate
npm test
```

If validation fails, fix the data rather than bypassing checks. Validation blocks malformed data, unrecognized category/tag references, duplicate slugs, invalid URLs, invalid dates, invalid enum values, overlong or missing descriptions, unsorted data, and stale README output.

## Licenses

Code and docs are MIT licensed. Structured metadata in `data/` is CC-BY-4.0 licensed.
