# Draft Ingestion

Ingestion turns structured research findings into draft tool entries. It is not curation, ranking, scraping, or quality approval.

Mental model:

```txt
research = exploration
ingestion = draft population
validation = structural safety
Codex/human review = curation and polish
```

## Candidate Format

Candidate batches use JSON Lines (`.jsonl`): one JSON object per line.

Required fields:

- `name`
- `description`
- `sources`
- at least one of `website_url`, `repo_url`, or `docs_url`
- non-empty valid `categories`
- non-empty valid `tags`
- non-empty valid `interfaces`

Optional fields:

- `slug`
- `deployment`
- `source_model`
- `license`
- `notes`
- `confidence`
- `uncertain`

Categories and tags may use exact slugs or exact display names, case-insensitive. Unknown values are dropped if at least one valid value remains; otherwise the candidate is rejected.

Safe enum normalization is supported for obvious casing and spacing differences, such as `open source` to `open-source`, `self hosted` to `self-hosted`, and `github app` to `github-app`.

## Run Import

Preview first:

```bash
npm run import:candidates -- data/import/candidates.example.jsonl --dry-run
```

Import:

```bash
npm run import:candidates -- path/to/candidates.jsonl
npm run validate
npm run sort
npm run generate
npm test
```

Rejected candidates block writes. Duplicate candidates are skipped and reported.

## Duplicate Handling

The importer detects duplicates by:

- slug
- exact normalized name
- exact normalized repo URL
- exact normalized website URL

Duplicates are skipped by default. Existing curated entries are never overwritten.

## Draft Review

Imported entries use:

```yaml
curation_status: draft
review_notes: Imported draft; verify metadata before marking reviewed.
```

Before changing a draft to `reviewed`:

- confirm official URLs
- verify category and tag fit
- rewrite descriptions if needed
- replace `unknown` fields only with sourced facts
- keep evidence in `sources`

## Recover From A Bad Import

Before import, check `git status --short`. After import, review:

```bash
git diff -- data/tools.yml README.md
```

If the import is wrong and no other work depends on it, remove the imported entries from `data/tools.yml`, then run:

```bash
npm run sort
npm run generate
npm test
```

Do not use the importer as a scraper, ranking system, or substitute for review.
