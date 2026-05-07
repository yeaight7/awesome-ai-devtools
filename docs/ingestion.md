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
- non-empty `categories`
- non-empty `tags`
- non-empty `interfaces`

Optional fields:

- `slug`
- `deployment`
- `source_model`
- `license`
- `notes`
- `confidence`
- `uncertain`

The importer preserves candidate categories, tags, interfaces, deployment, source model, license, notes, confidence, and uncertainty. It does not map, normalize, drop, or curate those values.

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

Rejected candidates block writes. Duplicate candidates are skipped and reported. The importer uses the first valid `sources` URL as `website_url` only when no URL field is present.

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

Drafts may contain raw research-agent categories, tags, interfaces, and enum-like values. Before changing a draft to `reviewed`:

- confirm official URLs
- verify category and tag fit
- normalize interfaces, deployment, and source model to repo enums
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
