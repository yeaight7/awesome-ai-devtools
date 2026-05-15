# Release Checklist

Use this checklist before tagging a new release.

## Pre-release checks

- [ ] `npm test` passes (types + unit tests + validation).
- [ ] README is up to date: `npm run generate && git diff --exit-code README.md`.
- [ ] No citation artifacts in public fields (`[web:`, `filecite`, `<file_attachment`, `【`, `】`) — validation blocks these automatically.
- [ ] No empty Links cells in README — scan for `|  |` or trailing ` |` in table rows.
- [ ] Reviewed shelf counts look reasonable — check `Explore by intent` section.
- [ ] Draft queue in README is compact (capped at 20 rows).
- [ ] CI green on the target commit.

## Catalog state to verify

- [ ] All reviewed multi-category tools have `primary_category` set.
- [ ] No reviewed tool references an undefined category or tag slug.
- [ ] No `curation_status: unknown` or missing `review_notes` on draft entries.

## Tagging

This repository releases as a **GitHub release only** — do not publish to npm.

```bash
git tag v0.1.1
git push origin v0.1.1
```

Then create a GitHub release from the tag with a short changelog summary.

## Known shelf gaps at v0.1.0

The following shelves have fewer than 10 reviewed entries and are documented as ongoing work:

| Shelf | Reviewed | Status |
| --- | --- | --- |
| `test-generation-agents` | 4 | Active — tooling is emerging |
| `mcp-clients` | 6 | Active — many clients are multi-category |
| `data-ml-coding-assistants` | 1 | Thin — needs dedicated research pass |
| `prompt-workflow-libraries` | 0 | Empty — no entries yet |
| `ai-devtools-security` | 0 | Empty — no entries yet |
| `devops-sre-agents` | 0 | Empty — no entries yet |

These are not release blockers; they are reflected accurately in the README roadmap.
