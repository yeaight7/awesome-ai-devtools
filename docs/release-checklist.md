# Release Checklist

Use this checklist before tagging a new release.

## Pre-release checks

- [ ] `npm test` passes (types + unit tests + validation).
- [ ] Generated output is fresh: `npm run generate && git diff --exit-code README.md docs/COMPARISON.md`.
- [ ] CI green on the target commit.
- [ ] The latest scheduled `Catalog maintenance` run is green, or its confirmed-broken links have been fixed. Re-run on demand with `npm run check:links`.
- [ ] Review the stale-entry report (`npm run check:stale`) and decide whether any old entries need re-verification before the release.
- [ ] Reviewed shelf counts look reasonable — check the `Explore by intent` section of the README.
- [ ] Thin and empty shelves are acceptable — the README `Roadmap` section lists them automatically.

Validation already blocks citation artifacts, promotional description language, missing `primary_category` on reviewed multi-category tools, undefined category/tag references, and missing `review_notes` on drafts, so those need no manual scan.

## Tagging

This repository releases as a **GitHub release only** — do not publish to npm.

```bash
git tag v0.1.1
git push origin v0.1.1
```

Then create a GitHub release from the tag with a short changelog summary.
