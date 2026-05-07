# Submission Guide

The easiest useful contribution is one tool addition or one factual update.

## Required Tool Fields

- `slug`: stable kebab-case identifier.
- `name`: official tool name.
- `description`: factual, neutral, 40-160 characters.
- `website_url`: official website, docs, or repository URL.
- `categories`: one or more slugs from `data/categories.yml`.
- `tags`: one or more slugs from `data/tags.yml`.
- `interfaces`: one or more allowed interface values.
- `deployment`: `hosted`, `local`, `self-hosted`, `hybrid`, or `not specified`.
- `source_model`: `open-source`, `source-available`, `proprietary`, or `not specified`.
- `license`: SPDX-style value when known, otherwise `not specified`.
- `added`: date the entry was added.
- `last_checked`: date the metadata was last checked.
- `sources`: official URLs that support the entry.

## Optional Tool Fields

- `repo_url`: official source repository.
- `docs_url`: official documentation.

## Before Opening A PR

```bash
npm run sort
npm run generate
npm test
```

If validation fails, fix the data rather than bypassing checks.
