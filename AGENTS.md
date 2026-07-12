# Agent Guidance

This repository is metadata-first. Do not hand-edit generated tool listings in `README.md` or `docs/COMPARISON.md` — both are generated.

## Source Of Truth

- Edit `data/tools.yml`, `data/categories.yml`, and `data/tags.yml`.
- Run `npm run sort` after changing tool metadata.
- Run `npm run generate` after changing data or README generation.
- Run `npm test` before claiming completion.
- Network-dependent maintenance (`npm run check:links`, `npm run check:stale`) runs in the scheduled workflow, never in PR validation. See `docs/maintenance-policy.md`.

## Data Rules

- Use official sources wherever possible.
- Do not invent metadata. Use `not specified` for uncertain license, deployment, or source-model facts.
- Keep descriptions factual, neutral, and 40-180 characters.
- Do not add subjective rankings, scores, hype language, or launch strategy. Validation rejects promotional description language and warns on soft subjective wording.
- Do not add large batches manually. Use `scripts/import-candidates.ts` for candidate batches, then review entries before promotion.
- Imported entries remain drafts until sources, categories, and uncertain fields are verified.
- When promoting a multi-category tool to `reviewed`, set `primary_category` to the single category slug that best represents its primary workflow. Validation will block promotion without it.

## Scope Boundaries

- Do not add dependencies, CI changes, scraping, auth, deployment, or website work unless explicitly requested.
- Keep diffs small and reversible.
- Public contribution policy belongs in `CONTRIBUTING.md` and `docs/`, not only here.
