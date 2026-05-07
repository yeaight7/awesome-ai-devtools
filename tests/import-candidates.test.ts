import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import YAML from "yaml";
import {
  importCandidateLines,
  importCandidatesFromFile
} from "../scripts/import-candidates.ts";
import type { CatalogData } from "../scripts/lib.ts";

const baseCatalog: CatalogData = {
  categories: [
    {
      slug: "coding-agents",
      name: "Coding agents",
      description: "Agentic tools that can inspect, modify, and reason about source code."
    }
  ],
  tags: [
    {
      slug: "cli",
      name: "CLI",
      description: "Provides a command-line interface."
    },
    {
      slug: "agent",
      name: "Agent",
      description: "Uses agentic workflows beyond single-turn completion."
    }
  ],
  tools: [
    {
      slug: "existing-tool",
      name: "Existing Tool",
      description: "Existing reviewed tool used to verify duplicate detection.",
      website_url: "https://example.com/existing",
      repo_url: "https://github.com/example/existing-tool",
      categories: ["coding-agents"],
      tags: ["agent"],
      interfaces: ["cli"],
      deployment: "local",
      source_model: "open-source",
      license: "MIT",
      curation_status: "reviewed",
      added: "2026-05-07",
      last_checked: "2026-05-07",
      sources: ["https://example.com/existing"]
    }
  ]
};

test("importCandidateLines imports a valid JSONL candidate as a draft without curating taxonomy", () => {
  const jsonl = JSON.stringify({
    name: "New Agent",
    description: "Terminal coding agent candidate discovered during category research.",
    website_url: " https://example.com/new-agent ",
    repo_url: "https://github.com/example/new-agent",
    categories: ["Coding agents", "raw-category"],
    tags: ["CLI", "agent", "repo-editing", "open-source"],
    interfaces: ["CLI", "ide-extension", "web-app"],
    deployment: "cloud",
    source_model: "open source",
    sources: ["https://example.com/new-agent/docs"],
    notes: "Research agent says this needs human review.",
    confidence: "medium",
    uncertain: true
  });

  const result = importCandidateLines(baseCatalog, jsonl, { today: "2026-05-08" });
  const imported = result.catalog.tools.find((tool) => tool.slug === "new-agent");

  assert.equal(result.imported.length, 1);
  assert.equal(result.rejected.length, 0);
  assert.equal(result.droppedValues.length, 0);
  assert.equal(imported?.curation_status, "draft");
  assert.equal(imported?.deployment, "cloud");
  assert.equal(imported?.source_model, "open source");
  assert.equal(imported?.license, "unknown");
  assert.equal(imported?.added, "2026-05-08");
  assert.equal(imported?.last_checked, "2026-05-08");
  assert.deepEqual(imported?.categories, ["Coding agents", "raw-category"]);
  assert.deepEqual(imported?.tags, ["agent", "CLI", "open-source", "repo-editing"]);
  assert.deepEqual(imported?.interfaces, ["CLI", "ide-extension", "web-app"]);
  assert.match(imported?.review_notes ?? "", /Imported draft/);
  assert.match(imported?.review_notes ?? "", /confidence: medium/);
  assert.match(imported?.review_notes ?? "", /uncertain: true/);
});

test("importCandidateLines skips duplicates by existing slug, name, repo URL, or website URL", () => {
  const candidates = [
    { name: "By Slug", slug: "existing-tool", website_url: "https://example.com/by-slug" },
    { name: "Existing Tool", website_url: "https://example.com/by-name" },
    { name: "By Repo", repo_url: "https://github.com/example/existing-tool", website_url: "https://example.com/by-repo" },
    { name: "By Website", website_url: "https://example.com/existing" }
  ].map((candidate) =>
    JSON.stringify({
      description: "Duplicate candidate used to verify conservative duplicate handling.",
      categories: ["coding-agents"],
      tags: ["agent"],
      interfaces: ["cli"],
      sources: ["https://example.com/evidence"],
      ...candidate
    })
  );

  const result = importCandidateLines(baseCatalog, candidates.join("\n"), { today: "2026-05-08" });

  assert.equal(result.imported.length, 0);
  assert.equal(result.skippedDuplicates.length, 4);
  assert.equal(result.catalog.tools.length, 1);
});

test("importCandidateLines reports malformed JSONL with line number", () => {
  const result = importCandidateLines(baseCatalog, "{bad json", { today: "2026-05-08" });

  assert.equal(result.imported.length, 0);
  assert.equal(result.rejected.length, 1);
  assert.match(result.rejected[0].reason, /line 1/);
  assert.match(result.rejected[0].reason, /Invalid JSON/);
});

test("importCandidateLines imports unknown category, tag, and interface values as draft text", () => {
  const result = importCandidateLines(
    baseCatalog,
    JSON.stringify({
      name: "Ambiguous Tool",
      description: "Candidate with unmapped taxonomy values must stay out of canonical data.",
      website_url: "https://example.com/ambiguous",
      categories: ["not-a-category"],
      tags: ["not-a-tag"],
      interfaces: ["not-an-interface"],
      sources: ["https://example.com/ambiguous"]
    }),
    { today: "2026-05-08" }
  );
  const imported = result.catalog.tools.find((tool) => tool.slug === "ambiguous-tool");

  assert.equal(result.imported.length, 1);
  assert.equal(result.rejected.length, 0);
  assert.deepEqual(imported?.categories, ["not-a-category"]);
  assert.deepEqual(imported?.tags, ["not-a-tag"]);
  assert.deepEqual(imported?.interfaces, ["not-an-interface"]);
});

test("importCandidateLines uses first valid source as website_url fallback", () => {
  const result = importCandidateLines(
    baseCatalog,
    JSON.stringify({
      name: "Source Only Tool",
      description: "Candidate with source evidence but no dedicated URL fields should still import.",
      categories: ["raw-category"],
      tags: ["raw-tag"],
      interfaces: ["raw-interface"],
      sources: ["https://example.com/source-only"]
    }),
    { today: "2026-05-08" }
  );
  const imported = result.catalog.tools.find((tool) => tool.slug === "source-only-tool");

  assert.equal(result.imported.length, 1);
  assert.equal(result.rejected.length, 0);
  assert.equal(imported?.website_url, "https://example.com/source-only");
});

test("importCandidateLines does not treat shared source fallback URLs as website duplicates", () => {
  const candidates = [
    {
      name: "Source Only One",
      description: "First candidate with shared source evidence and no dedicated website URL.",
      categories: ["raw-category"],
      tags: ["raw-tag"],
      interfaces: ["raw-interface"],
      sources: ["https://example.com/shared-list"]
    },
    {
      name: "Source Only Two",
      description: "Second candidate with shared source evidence and no dedicated website URL.",
      categories: ["raw-category"],
      tags: ["raw-tag"],
      interfaces: ["raw-interface"],
      sources: ["https://example.com/shared-list"]
    }
  ].map((candidate) => JSON.stringify(candidate));

  const result = importCandidateLines(baseCatalog, candidates.join("\n"), { today: "2026-05-08" });

  assert.equal(result.imported.length, 2);
  assert.equal(result.skippedDuplicates.length, 0);
});

test("importCandidatesFromFile dry-run does not write tools or README files", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "awesome-ai-devtools-import-"));
  try {
    const dataDir = join(tempDir, "data");
    const importDir = join(dataDir, "import");
    writeFixtureCatalog(tempDir);
    writeFileSync(join(importDir, "candidates.jsonl"), JSON.stringify({
      name: "Dry Run Agent",
      description: "Candidate used to verify dry-run import behavior without file writes.",
      website_url: "https://example.com/dry-run-agent",
      categories: ["coding-agents"],
      tags: ["agent"],
      interfaces: ["cli"],
      sources: ["https://example.com/dry-run-agent"]
    }));

    const beforeTools = readFileSync(join(dataDir, "tools.yml"), "utf8");
    const beforeReadme = readFileSync(join(tempDir, "README.md"), "utf8");
    const result = importCandidatesFromFile(join(importDir, "candidates.jsonl"), {
      rootDir: tempDir,
      dryRun: true,
      today: "2026-05-08"
    });

    assert.equal(result.imported.length, 1);
    assert.equal(readFileSync(join(dataDir, "tools.yml"), "utf8"), beforeTools);
    assert.equal(readFileSync(join(tempDir, "README.md"), "utf8"), beforeReadme);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

function writeFixtureCatalog(rootDir: string): void {
  const dataDir = join(rootDir, "data");
  const importDir = join(dataDir, "import");
  mkdirSync(importDir, { recursive: true });
  writeFileSync(join(dataDir, "categories.yml"), YAML.stringify(baseCatalog.categories));
  writeFileSync(join(dataDir, "tags.yml"), YAML.stringify(baseCatalog.tags));
  writeFileSync(join(dataDir, "tools.yml"), YAML.stringify(baseCatalog.tools));
  writeFileSync(join(rootDir, "README.md"), "unchanged\n");
}
