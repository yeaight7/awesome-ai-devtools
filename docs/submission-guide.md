# Submission Guide

The easiest useful contribution is one tool addition or one factual update.

## Required Tool Fields

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
- `added`: date the entry was added.
- `last_checked`: date the metadata was last checked.
- `sources`: official URLs that support the entry.

## Optional Tool Fields

- `repo_url`: official source repository.
- `docs_url`: official documentation.
- `primary_category`: the main shelf for README display. Required for reviewed tools that belong to more than one category. Must be one of the slugs already in `categories`. Use the category that best represents the tool's primary workflow (e.g., a coding agent that also does code review should use `coding-agents`, not `ai-code-review-tools`).

## Before Opening A PR

```bash
npm run sort
npm run generate
npm test
```

If validation fails, fix the data rather than bypassing checks.
