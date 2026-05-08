# Agent Guidance

This repository is metadata-first. Do not hand-edit generated tool listings in `README.md`.

## Source Of Truth

- Edit `data/tools.yml`, `data/categories.yml`, and `data/tags.yml`.
- Run `npm run sort` after changing tool metadata.
- Run `npm run generate` after changing data or README generation.
- Run `npm test` before claiming completion.

## Data Rules

- Use official sources wherever possible.
- Do not invent metadata. Use `not specified` for uncertain license, deployment, or source-model facts.
- Keep descriptions factual, neutral, and 40-180 characters.
- Do not add subjective rankings, scores, hype language, or launch strategy.
- Do not add large batches manually. Future bulk import needs a reviewed importer contract first.
- Use `scripts/import-candidates.ts` for draft candidate batches. Imported entries remain drafts until reviewed.
- When promoting a multi-category tool to `reviewed`, set `primary_category` to the single category slug that best represents its primary workflow. Validation will block promotion without it.

## Scope Boundaries

- Do not add dependencies, CI changes, scraping, auth, deployment, or website work unless explicitly requested.
- Keep diffs small and reversible.
- Public contribution policy belongs in `CONTRIBUTING.md` and `docs/`, not only here.
