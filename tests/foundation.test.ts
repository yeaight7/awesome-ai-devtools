import test from "node:test";
import assert from "node:assert/strict";
import { buildReadme } from "../scripts/generate-readme.ts";
import { validateCatalog } from "../scripts/validate.ts";
import type { CatalogData } from "../scripts/lib.ts";

const sampleCatalog: CatalogData = {
  categories: [
    {
      slug: "coding-agents",
      name: "Coding agents",
      description: "Tools that can inspect and change code with agentic workflows."
    }
  ],
  tags: [
    {
      slug: "terminal",
      name: "Terminal",
      description: "Runs from a command-line interface."
    }
  ],
  tools: [
    {
      slug: "sample-agent",
      name: "Sample Agent",
      description: "Small factual entry used to verify generated README output.",
      website_url: "https://example.com",
      repo_url: "https://github.com/example/sample-agent",
      docs_url: "https://example.com/docs",
      categories: ["coding-agents"],
      tags: ["terminal"],
      interfaces: ["cli"],
      deployment: "local",
      source_model: "open-source",
      license: "MIT",
      curation_status: "reviewed",
      added: "2026-05-07",
      last_checked: "2026-05-07",
      sources: ["https://example.com/docs"]
    }
  ]
};

test("buildReadme renders generated notice, storefront, and category section", () => {
  const readme = buildReadme(sampleCatalog);

  assert.match(readme, /<!-- GENERATED FILE: edit data\/tools\.yml/);
  assert.match(readme, /## Storefront/);
  assert.doesNotMatch(readme, /Status/);
  assert.doesNotMatch(readme, /unknown/i);
  assert.doesNotMatch(readme, /curation_status|draft/i);
  assert.match(readme, /\| Tool \| Good for \| Experience \| Links \|/);
  assert.match(readme, /\| \[Sample Agent\]\(https:\/\/example\.com\) \| Small factual entry used to verify generated README output\. \| CLI · Local \| \[Website\]/);
  assert.match(readme, /### Coding agents/);
  assert.match(readme, /Small factual entry used to verify generated README output\./);
});

test("validateCatalog reports duplicate slugs and unknown category references", () => {
  const invalidCatalog: CatalogData = {
    ...sampleCatalog,
    tools: [
      sampleCatalog.tools[0],
      {
        ...sampleCatalog.tools[0],
        categories: ["missing-category"]
      }
    ]
  };

  const result = validateCatalog(invalidCatalog, {
    readmeContent: buildReadme(sampleCatalog),
    checkGeneratedReadme: false,
    checkSorted: false
  });

  assert.equal(result.ok, false);
  assert(result.errors.some((error) => error.includes("duplicate tool slug")));
  assert(result.errors.some((error) => error.includes("unknown category")));
});
